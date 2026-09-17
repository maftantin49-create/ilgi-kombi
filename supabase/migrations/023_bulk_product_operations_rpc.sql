-- ─────────────────────────────────────────────────────────────────────────────
-- 023_bulk_product_operations_rpc.sql
-- Toplu ürün operasyonları: stok, fiyat, flag, sınıflandırma
--
-- !! KULLANICI ONAYI BEKLENİYOR — henüz çalıştırılmadı !!
--
-- Fonksiyonlar:
--   bulk_adjust_stock(UUID[], TEXT, INT, TEXT, UUID)
--   bulk_update_prices(UUID[], TEXT, NUMERIC, UUID)
--   bulk_update_product_flags(UUID[], JSONB, UUID)
--   bulk_update_product_classification(UUID[], TEXT, UUID, UUID)
--
-- Bağımlılık:
--   001_extensions_enums.sql  → inventory_movement_type, reservation_status
--   002_core_tables.sql       → products, brands, categories
--   005_payment_tables.sql    → inventory_reservations, inventory_movements
--   006_admin_audit_tables.sql → admin_profiles, audit_logs
--
-- Ortak kurallar (4 fonksiyon):
--   + Actor validation: admin_profiles.auth_user_id + is_active = true
--   + Dedupe: DISTINCT UNNEST — duplicate ID'ler teke indirilir
--   + Limit: dedupe sonrası 1..500 unique ID
--   + Product existence: unique count = DB count (tek bile yoksa INVALID_PRODUCT)
--   + SECURITY DEFINER + SET search_path = '' (hardened)
--   + REVOKE PUBLIC/anon/authenticated; GRANT service_role
--
-- bulk_adjust_stock özel:
--   + Phase 1 (FOR UPDATE): tüm ürünler kontrol edilir — ilk hatada durulmaz
--   + Phase 2 (write): yalnızca tüm batch geçerse; tek ürün fail → abort
--   + Negative stock guard + reserved stock violation guard
--
-- bulk_update_prices özel:
--   + Tüm ürünler için new_price önce hesaplanır (FOR UPDATE)
--   + new_price < 0 → NEGATIVE_PRICE; new_price = 0 (non-SET) → ZERO_PRICE_NOT_ALLOWED
--   + Herhangi biri başarısız → failed_products preview ile tüm op reddedilir
--   + GREATEST clamp YOK — kasıtlı: silent zero yerine explicit error
--
-- bulk_update_product_flags özel:
--   + p_flags whitelist: is_active, is_featured, is_new, same_day_shipping
--   + Bilinmeyen key → INVALID_FLAG; boolean olmayan değer → INVALID_FLAG_VALUE
--   + Boş {} veya NULL → EMPTY_FLAGS
--
-- bulk_update_product_classification özel:
--   + p_field: 'brand_id' | 'category_id' — başka değer INVALID_FIELD
--   + p_value UUID: NULL → ilişkiyi kaldır (schema nullable, her zaman geçerli)
--   + UUID verilmişse brands/categories'de varlık doğrulanır
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.bulk_adjust_stock(UUID[], TEXT, INT, TEXT, UUID);
--   DROP FUNCTION IF EXISTS public.bulk_update_prices(UUID[], TEXT, NUMERIC, UUID);
--   DROP FUNCTION IF EXISTS public.bulk_update_product_flags(UUID[], JSONB, UUID);
--   DROP FUNCTION IF EXISTS public.bulk_update_product_classification(UUID[], TEXT, UUID, UUID);
-- ─────────────────────────────────────────────────────────────────────────────

-- Mevcut imzaları temizle (idempotent deployment için)
DROP FUNCTION IF EXISTS public.bulk_adjust_stock(UUID[], TEXT, INT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.bulk_update_prices(UUID[], TEXT, NUMERIC, UUID);
DROP FUNCTION IF EXISTS public.bulk_update_product_flags(UUID[], JSONB, UUID);
DROP FUNCTION IF EXISTS public.bulk_update_product_classification(UUID[], TEXT, UUID, UUID);


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. bulk_adjust_stock
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Toplu stok düzeltme. İki fazlı: Phase 1 (validate-first), Phase 2 (write).
--
-- p_operation: 'add'    → stock + p_value  (p_value > 0 zorunlu)
--              'remove' → stock - p_value  (p_value > 0 zorunlu, reserved kontrolü)
--              'set'    → stock = p_value  (p_value >= 0; reserved kontrolü)
-- p_value: stok miktarı (add/remove: delta, set: absolüt)
-- p_reason: 10..500 karakter (trim sonrası)
-- p_actor_id: admin_profiles.auth_user_id
--
-- Başarı dönüşü: { ok: true, operation_id, affected_count }
-- Hata dönüşü:  { ok: false, error: 'ERROR_CODE', ... }
-- Validation fail: { ok: false, error: 'VALIDATION_FAILED', failed_products: [...] }
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bulk_adjust_stock(
  p_product_ids  UUID[],
  p_operation    TEXT,    -- 'add' | 'remove' | 'set'
  p_value        INT,     -- add/remove: delta (> 0); set: absolüt (>= 0)
  p_reason       TEXT,
  p_actor_id     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_unique_ids    UUID[];
  v_unique_count  INT;
  v_found_count   INT;
  v_operation_id  UUID := gen_random_uuid();
  v_failed        JSONB := '[]'::JSONB;
  v_rec           RECORD;
  v_new_stock     INT;
  v_movement_qty  INT;
  v_movement_type public.inventory_movement_type;
BEGIN

  -- ── 1. PARAMETRE DOĞRULAMA ────────────────────────────────────────────────

  IF p_actor_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ACTOR_REQUIRED');
  END IF;

  IF p_operation IS NULL OR p_operation NOT IN ('add', 'remove', 'set') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_OPERATION');
  END IF;

  IF p_value IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALUE_REQUIRED');
  END IF;

  -- add / remove: pozitif miktar zorunlu
  IF p_operation IN ('add', 'remove') AND p_value <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALUE_MUST_BE_POSITIVE');
  END IF;

  -- set: 0 geçerli (stoğu sıfırla), negatif yasak
  IF p_operation = 'set' AND p_value < 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NEGATIVE_ADJUSTMENT_NOT_ALLOWED');
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) < 10 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'REASON_TOO_SHORT');
  END IF;

  IF length(trim(p_reason)) > 500 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'REASON_TOO_LONG');
  END IF;

  -- ── 2. ACTOR DOĞRULAMA ────────────────────────────────────────────────────

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id
      AND is_active    = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ACTOR');
  END IF;

  -- ── 3. DEDUPE + LIMIT ─────────────────────────────────────────────────────
  -- Duplicate ID'ler teke indirilir; ORDER BY deadlock önleme için korunur.

  IF p_product_ids IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  v_unique_ids   := ARRAY(SELECT DISTINCT UNNEST(p_product_ids) ORDER BY 1);
  v_unique_count := array_length(v_unique_ids, 1);

  -- array_length boş array için NULL döner
  IF v_unique_count IS NULL OR v_unique_count = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  IF v_unique_count > 500 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'LIMIT_EXCEEDED',
                              'count', v_unique_count);
  END IF;

  -- ── 4. ÜRÜN VARLIK KONTROLÜ ───────────────────────────────────────────────
  -- Tek geçersiz / mevcut olmayan UUID tüm operasyonu durdurur.

  SELECT COUNT(*) INTO v_found_count
  FROM public.products
  WHERE id = ANY(v_unique_ids);

  IF v_found_count <> v_unique_count THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_PRODUCT');
  END IF;

  -- ── PHASE 1 — VALİDASYON (FOR UPDATE) ────────────────────────────────────
  -- FOR UPDATE: concurrent stok/fiyat/rezervasyon işlemlerini serialize eder.
  -- ORDER BY id: tutarlı kilit sırası → deadlock önleme.
  -- Tüm ürünler incelenir; ilk hatada durulmaz → tam failure list toplanır.
  -- Phase 1 sonrası return (write yok) → kilitler transaction sonunda serbest.

  FOR v_rec IN
    SELECT
      p.id,
      p.sku,
      p.stock_quantity                                                      AS current_stock,
      COALESCE((
        SELECT SUM(ir.quantity)
        FROM   public.inventory_reservations ir
        WHERE  ir.product_id = p.id
          AND  ir.status     = 'active'::public.reservation_status
          AND  ir.expires_at > NOW()
      ), 0)                                                                 AS reserved_stock
    FROM public.products p
    WHERE p.id = ANY(v_unique_ids)
    ORDER BY p.id    -- deadlock prevention: tutarlı sıra
    FOR UPDATE       -- Phase 2 için kilitler burada alınır
  LOOP

    CASE p_operation
      WHEN 'add'    THEN v_new_stock := v_rec.current_stock + p_value;
      WHEN 'remove' THEN v_new_stock := v_rec.current_stock - p_value;
      WHEN 'set'    THEN v_new_stock := p_value;
    END CASE;

    IF v_new_stock < 0 THEN
      v_failed := v_failed || jsonb_build_object(
        'product_id',    v_rec.id,
        'sku',           v_rec.sku,
        'current_stock', v_rec.current_stock,
        'would_be',      v_new_stock,
        'error',         'NEGATIVE_STOCK'
      );
    ELSIF v_new_stock < v_rec.reserved_stock THEN
      -- add işlemi için bu dal hiçbir zaman tetiklenmez (stok sadece artıyor)
      v_failed := v_failed || jsonb_build_object(
        'product_id',     v_rec.id,
        'sku',            v_rec.sku,
        'current_stock',  v_rec.current_stock,
        'reserved_stock', v_rec.reserved_stock,
        'would_be',       v_new_stock,
        'error',          'RESERVED_STOCK_VIOLATION'
      );
    END IF;

  END LOOP;

  -- Tek ürün bile başarısızsa tüm operasyon iptal; write gerçekleşmez.
  IF jsonb_array_length(v_failed) > 0 THEN
    RETURN jsonb_build_object(
      'ok',              false,
      'error',           'VALIDATION_FAILED',
      'failed_products', v_failed
    );
  END IF;

  -- ── PHASE 2 — YAZMA ───────────────────────────────────────────────────────
  -- Phase 1 kilitlerini yeniden almaya gerek yok: aynı transaction, FOR UPDATE aktif.
  -- current_stock Phase 1 ile aynıdır (Phase 1'de write yapılmadı).

  FOR v_rec IN
    SELECT p.id, p.stock_quantity AS current_stock
    FROM   public.products p
    WHERE  p.id = ANY(v_unique_ids)
    ORDER BY p.id
  LOOP

    CASE p_operation
      WHEN 'add' THEN
        v_new_stock     := v_rec.current_stock + p_value;
        v_movement_qty  := p_value;
        v_movement_type := 'restock'::public.inventory_movement_type;
      WHEN 'remove' THEN
        v_new_stock     := v_rec.current_stock - p_value;
        v_movement_qty  := -p_value;
        v_movement_type := 'manual_adjustment'::public.inventory_movement_type;
      WHEN 'set' THEN
        v_new_stock     := p_value;
        v_movement_qty  := p_value - v_rec.current_stock;   -- signed delta
        v_movement_type := 'manual_adjustment'::public.inventory_movement_type;
    END CASE;

    -- Savunma katmanı: Phase 1 sonrası beklenmeyen concurrent ihlale karşı
    IF v_new_stock < 0 THEN
      RAISE EXCEPTION 'CONCURRENT_NEGATIVE_STOCK product=%', v_rec.id;
    END IF;

    UPDATE public.products
    SET    stock_quantity = v_new_stock
    WHERE  id = v_rec.id;

    INSERT INTO public.inventory_movements (product_id, type, quantity, reason)
    VALUES (v_rec.id, v_movement_type, v_movement_qty, trim(p_reason));

  END LOOP;

  -- Tek audit kaydı: 500 product_id metadata'ya yazılmaz (audit bloat önleme)
  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    CASE p_operation
      WHEN 'add'    THEN 'bulk_stock_added'
      WHEN 'remove' THEN 'bulk_stock_removed'
      ELSE               'bulk_stock_set'
    END,
    'bulk_operation',
    v_operation_id,
    jsonb_build_object(
      'operation_id',   v_operation_id,
      'operation',      p_operation,
      'value',          p_value,
      'affected_count', v_unique_count,
      'reason',         trim(p_reason)
    )
  );

  RETURN jsonb_build_object(
    'ok',             true,
    'operation_id',   v_operation_id,
    'affected_count', v_unique_count
  );

END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. bulk_update_prices
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Toplu fiyat güncelleme. Validate-first: tüm new_price'lar hesaplanır,
-- herhangi biri geçersizse failed_products preview ile tüm op reddedilir.
--
-- p_operation: 'set'              → price = p_value
--              'increase_fixed'   → price = ROUND(price + p_value, 2)
--              'decrease_fixed'   → price = ROUND(price - p_value, 2)
--              'increase_percent' → price = ROUND(price * (1 + p_value/100), 2)
--                                   p_value: yüzde değer (10 = %10); 0 < p_value <= 1000
--              'decrease_percent' → price = ROUND(price * (1 - p_value/100), 2)
--                                   0 < p_value < 100
-- p_value: NUMERIC — 'set': >= 0; fixed: > 0; percent: sınırlar yukarıda
--
-- Fiyat kuralları:
--   SET ile price = 0: izin verilir (müşteri kararı)
--   Diğer operasyonlarda new_price <= 0: REDDEDILIR (GREATEST clamp YOK)
--   new_price < 0 (herhangi op): NEGATIVE_PRICE
--   new_price = 0 (non-SET):     ZERO_PRICE_NOT_ALLOWED
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bulk_update_prices(
  p_product_ids  UUID[],
  p_operation    TEXT,
  p_value        NUMERIC,
  p_actor_id     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_unique_ids    UUID[];
  v_unique_count  INT;
  v_found_count   INT;
  v_operation_id  UUID := gen_random_uuid();
  v_failed        JSONB := '[]'::JSONB;
  v_rec           RECORD;
  v_new_price     NUMERIC;
BEGIN

  -- ── 1. PARAMETRE DOĞRULAMA ────────────────────────────────────────────────

  IF p_actor_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ACTOR_REQUIRED');
  END IF;

  IF p_operation IS NULL OR p_operation NOT IN (
    'set', 'increase_fixed', 'decrease_fixed', 'increase_percent', 'decrease_percent'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_OPERATION');
  END IF;

  IF p_value IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALUE_REQUIRED');
  END IF;

  IF p_operation = 'set' AND p_value < 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALUE_OUT_OF_RANGE',
                              'detail', 'SET price cannot be negative');
  END IF;

  IF p_operation IN ('increase_fixed', 'decrease_fixed') AND p_value <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALUE_MUST_BE_POSITIVE');
  END IF;

  -- increase_percent: 0 < p_value <= 1000
  IF p_operation = 'increase_percent' AND (p_value <= 0 OR p_value > 1000) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALUE_OUT_OF_RANGE',
                              'detail', 'increase_percent: 0 < value <= 1000');
  END IF;

  -- decrease_percent: 0 < p_value < 100
  IF p_operation = 'decrease_percent' AND (p_value <= 0 OR p_value >= 100) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALUE_OUT_OF_RANGE',
                              'detail', 'decrease_percent: 0 < value < 100');
  END IF;

  -- ── 2. ACTOR DOĞRULAMA ────────────────────────────────────────────────────

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id
      AND is_active    = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ACTOR');
  END IF;

  -- ── 3. DEDUPE + LIMIT ─────────────────────────────────────────────────────

  IF p_product_ids IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  v_unique_ids   := ARRAY(SELECT DISTINCT UNNEST(p_product_ids) ORDER BY 1);
  v_unique_count := array_length(v_unique_ids, 1);

  IF v_unique_count IS NULL OR v_unique_count = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  IF v_unique_count > 500 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'LIMIT_EXCEEDED',
                              'count', v_unique_count);
  END IF;

  -- ── 4. ÜRÜN VARLIK KONTROLÜ ───────────────────────────────────────────────

  SELECT COUNT(*) INTO v_found_count
  FROM public.products
  WHERE id = ANY(v_unique_ids);

  IF v_found_count <> v_unique_count THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_PRODUCT');
  END IF;

  -- ── PHASE 1 — FİYAT ÖN HESAPLAMA + VALİDASYON (FOR UPDATE) ──────────────
  -- FOR UPDATE: concurrent fiyat değişikliklerini serialize eder.
  -- Tüm ürünler hesaplanır; ilk hatada durulmaz → tam preview toplanır.

  FOR v_rec IN
    SELECT p.id, p.sku, p.price AS current_price
    FROM   public.products p
    WHERE  p.id = ANY(v_unique_ids)
    ORDER BY p.id    -- deadlock prevention
    FOR UPDATE
  LOOP

    CASE p_operation
      WHEN 'set'              THEN v_new_price := p_value;
      WHEN 'increase_fixed'   THEN v_new_price := ROUND(v_rec.current_price + p_value, 2);
      WHEN 'decrease_fixed'   THEN v_new_price := ROUND(v_rec.current_price - p_value, 2);
      WHEN 'increase_percent' THEN v_new_price := ROUND(v_rec.current_price * (1 + p_value / 100.0), 2);
      WHEN 'decrease_percent' THEN v_new_price := ROUND(v_rec.current_price * (1 - p_value / 100.0), 2);
    END CASE;

    IF p_operation = 'set' THEN
      -- SET ile price = 0 kabul edilir; yalnızca negatif reddedilir
      IF v_new_price < 0 THEN
        v_failed := v_failed || jsonb_build_object(
          'product_id',       v_rec.id,
          'sku',              v_rec.sku,
          'current_price',    v_rec.current_price,
          'calculated_price', v_new_price,
          'error',            'NEGATIVE_PRICE'
        );
      END IF;
    ELSE
      -- SET dışı operasyonlarda price = 0 da reddedilir (GREATEST clamp yok)
      IF v_new_price < 0 THEN
        v_failed := v_failed || jsonb_build_object(
          'product_id',       v_rec.id,
          'sku',              v_rec.sku,
          'current_price',    v_rec.current_price,
          'calculated_price', v_new_price,
          'error',            'NEGATIVE_PRICE'
        );
      ELSIF v_new_price = 0 THEN
        v_failed := v_failed || jsonb_build_object(
          'product_id',       v_rec.id,
          'sku',              v_rec.sku,
          'current_price',    v_rec.current_price,
          'calculated_price', v_new_price,
          'error',            'ZERO_PRICE_NOT_ALLOWED'
        );
      END IF;
    END IF;

  END LOOP;

  -- Tek ürün bile başarısızsa tüm operasyon iptal; preview döner
  IF jsonb_array_length(v_failed) > 0 THEN
    RETURN jsonb_build_object(
      'ok',              false,
      'error',           'PRICE_VALIDATION_FAILED',
      'failed_products', v_failed
    );
  END IF;

  -- ── PHASE 2 — YAZMA ───────────────────────────────────────────────────────
  -- Set-based UPDATE: aynı formül her ürüne uygulanır.
  -- FOR UPDATE kilitleri Phase 1'den aktif → concurrent ihlal imkânsız.

  CASE p_operation
    WHEN 'set' THEN
      UPDATE public.products
      SET    price = p_value
      WHERE  id = ANY(v_unique_ids);

    WHEN 'increase_fixed' THEN
      UPDATE public.products
      SET    price = ROUND(price + p_value, 2)
      WHERE  id = ANY(v_unique_ids);

    WHEN 'decrease_fixed' THEN
      UPDATE public.products
      SET    price = ROUND(price - p_value, 2)
      WHERE  id = ANY(v_unique_ids);

    WHEN 'increase_percent' THEN
      UPDATE public.products
      SET    price = ROUND(price * (1 + p_value / 100.0), 2)
      WHERE  id = ANY(v_unique_ids);

    WHEN 'decrease_percent' THEN
      UPDATE public.products
      SET    price = ROUND(price * (1 - p_value / 100.0), 2)
      WHERE  id = ANY(v_unique_ids);
  END CASE;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    'bulk_price_updated',
    'bulk_operation',
    v_operation_id,
    jsonb_build_object(
      'operation_id',   v_operation_id,
      'operation',      p_operation,
      'value',          p_value,
      'affected_count', v_unique_count
    )
  );

  RETURN jsonb_build_object(
    'ok',             true,
    'operation_id',   v_operation_id,
    'affected_count', v_unique_count
  );

END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. bulk_update_product_flags
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Seçili ürünlerde boolean flag'leri toplu güncelle.
--
-- p_flags: JSONB object — yalnızca güncellenecek flag'ler gönderilir.
--   İzin verilen key'ler: is_active, is_featured, is_new, same_day_shipping
--   Değerler boolean olmak zorunda.
--   Gönderilmeyen key'ler mevcut değerlerini korur.
--   Boş {} veya NULL → EMPTY_FLAGS
--   Bilinmeyen key → INVALID_FLAG (ignore edilmez, reddedilir)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bulk_update_product_flags(
  p_product_ids  UUID[],
  p_flags        JSONB,
  p_actor_id     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_unique_ids    UUID[];
  v_unique_count  INT;
  v_found_count   INT;
  v_operation_id  UUID    := gen_random_uuid();
  v_allowed_flags TEXT[]  := ARRAY['is_active', 'is_featured', 'is_new', 'same_day_shipping'];
  v_key           TEXT;
BEGIN

  -- ── 1. PARAMETRE DOĞRULAMA ────────────────────────────────────────────────

  IF p_actor_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ACTOR_REQUIRED');
  END IF;

  IF p_flags IS NULL OR p_flags = '{}'::JSONB THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_FLAGS');
  END IF;

  -- Whitelist kontrolü + boolean tip zorunluluğu
  FOR v_key IN SELECT jsonb_object_keys(p_flags) LOOP
    IF NOT v_key = ANY(v_allowed_flags) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'INVALID_FLAG', 'flag', v_key);
    END IF;
    IF jsonb_typeof(p_flags->v_key) <> 'boolean' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'INVALID_FLAG_VALUE', 'flag', v_key);
    END IF;
  END LOOP;

  -- ── 2. ACTOR DOĞRULAMA ────────────────────────────────────────────────────

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id
      AND is_active    = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ACTOR');
  END IF;

  -- ── 3. DEDUPE + LIMIT ─────────────────────────────────────────────────────

  IF p_product_ids IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  v_unique_ids   := ARRAY(SELECT DISTINCT UNNEST(p_product_ids) ORDER BY 1);
  v_unique_count := array_length(v_unique_ids, 1);

  IF v_unique_count IS NULL OR v_unique_count = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  IF v_unique_count > 500 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'LIMIT_EXCEEDED',
                              'count', v_unique_count);
  END IF;

  -- ── 4. ÜRÜN VARLIK KONTROLÜ ───────────────────────────────────────────────

  SELECT COUNT(*) INTO v_found_count
  FROM public.products
  WHERE id = ANY(v_unique_ids);

  IF v_found_count <> v_unique_count THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_PRODUCT');
  END IF;

  -- ── YAZMA ─────────────────────────────────────────────────────────────────
  -- CASE WHEN ile yalnızca p_flags içindeki key'ler güncellenir.
  -- Eksik key'ler mevcut sütun değerini korur (no-op).

  UPDATE public.products
  SET
    is_active         = CASE WHEN p_flags ? 'is_active'
                             THEN (p_flags->>'is_active')::BOOLEAN
                             ELSE is_active         END,
    is_featured       = CASE WHEN p_flags ? 'is_featured'
                             THEN (p_flags->>'is_featured')::BOOLEAN
                             ELSE is_featured       END,
    is_new            = CASE WHEN p_flags ? 'is_new'
                             THEN (p_flags->>'is_new')::BOOLEAN
                             ELSE is_new            END,
    same_day_shipping = CASE WHEN p_flags ? 'same_day_shipping'
                             THEN (p_flags->>'same_day_shipping')::BOOLEAN
                             ELSE same_day_shipping END
  WHERE id = ANY(v_unique_ids);

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    'bulk_flags_updated',
    'bulk_operation',
    v_operation_id,
    jsonb_build_object(
      'operation_id',   v_operation_id,
      'flags',          p_flags,
      'affected_count', v_unique_count
    )
  );

  RETURN jsonb_build_object(
    'ok',             true,
    'operation_id',   v_operation_id,
    'affected_count', v_unique_count
  );

END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. bulk_update_product_classification
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Seçili ürünlerin marka veya kategori atamasını toplu güncelle.
--
-- p_field: 'brand_id' | 'category_id' — başka değer → INVALID_FIELD
-- p_value: UUID veya NULL
--   NULL  → ilişkiyi kaldır (ON DELETE SET NULL ile uyumlu)
--   UUID  → atamadan önce brands / categories tablosunda varlık doğrulanır
--            bulunamazsa → INVALID_BRAND_ID / INVALID_CATEGORY_ID
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bulk_update_product_classification(
  p_product_ids  UUID[],
  p_field        TEXT,    -- 'brand_id' | 'category_id'
  p_value        UUID,    -- NULL → ilişkiyi kaldır
  p_actor_id     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_unique_ids    UUID[];
  v_unique_count  INT;
  v_found_count   INT;
  v_operation_id  UUID := gen_random_uuid();
  v_audit_action  TEXT;
BEGIN

  -- ── 1. PARAMETRE DOĞRULAMA ────────────────────────────────────────────────

  IF p_actor_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ACTOR_REQUIRED');
  END IF;

  IF p_field IS NULL OR p_field NOT IN ('brand_id', 'category_id') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_FIELD');
  END IF;

  -- ── 2. FK DOĞRULAMA ───────────────────────────────────────────────────────
  -- p_value IS NULL → kaldır (her zaman geçerli; schema nullable)
  -- p_value verilmişse ilgili tabloda kayıt var mı?

  IF p_value IS NOT NULL THEN
    IF p_field = 'brand_id' THEN
      IF NOT EXISTS (SELECT 1 FROM public.brands WHERE id = p_value) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'INVALID_BRAND_ID');
      END IF;
    ELSE
      IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = p_value) THEN
        RETURN jsonb_build_object('ok', false, 'error', 'INVALID_CATEGORY_ID');
      END IF;
    END IF;
  END IF;

  -- ── 3. ACTOR DOĞRULAMA ────────────────────────────────────────────────────

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id
      AND is_active    = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'UNAUTHORIZED_ACTOR');
  END IF;

  -- ── 4. DEDUPE + LIMIT ─────────────────────────────────────────────────────

  IF p_product_ids IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  v_unique_ids   := ARRAY(SELECT DISTINCT UNNEST(p_product_ids) ORDER BY 1);
  v_unique_count := array_length(v_unique_ids, 1);

  IF v_unique_count IS NULL OR v_unique_count = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_PRODUCT_LIST');
  END IF;

  IF v_unique_count > 500 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'LIMIT_EXCEEDED',
                              'count', v_unique_count);
  END IF;

  -- ── 5. ÜRÜN VARLIK KONTROLÜ ───────────────────────────────────────────────

  SELECT COUNT(*) INTO v_found_count
  FROM public.products
  WHERE id = ANY(v_unique_ids);

  IF v_found_count <> v_unique_count THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INVALID_PRODUCT');
  END IF;

  -- ── YAZMA ─────────────────────────────────────────────────────────────────
  -- İki olası sütun → iki ayrı UPDATE bloğu.
  -- EXECUTE gerekmez: set search_path='' ortamında güvenli statik SQL yeterli.

  IF p_field = 'brand_id' THEN
    UPDATE public.products
    SET    brand_id    = p_value
    WHERE  id = ANY(v_unique_ids);
    v_audit_action := 'bulk_brand_updated';
  ELSE
    UPDATE public.products
    SET    category_id = p_value
    WHERE  id = ANY(v_unique_ids);
    v_audit_action := 'bulk_category_updated';
  END IF;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    v_audit_action,
    'bulk_operation',
    v_operation_id,
    jsonb_build_object(
      'operation_id',   v_operation_id,
      'field',          p_field,
      'new_value',      p_value,
      'affected_count', v_unique_count
    )
  );

  RETURN jsonb_build_object(
    'ok',             true,
    'operation_id',   v_operation_id,
    'affected_count', v_unique_count
  );

END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- EXECUTE YETKİLERİ (4 fonksiyon)
-- Yalnızca service_role (server-side Next.js action) çağırabilir.
-- anon ve authenticated (client tarafı) erişemez.
-- ─────────────────────────────────────────────────────────────────────────────

-- bulk_adjust_stock
REVOKE EXECUTE ON FUNCTION public.bulk_adjust_stock(UUID[], TEXT, INT, TEXT, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_adjust_stock(UUID[], TEXT, INT, TEXT, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_adjust_stock(UUID[], TEXT, INT, TEXT, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bulk_adjust_stock(UUID[], TEXT, INT, TEXT, UUID) TO service_role;

-- bulk_update_prices
REVOKE EXECUTE ON FUNCTION public.bulk_update_prices(UUID[], TEXT, NUMERIC, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_update_prices(UUID[], TEXT, NUMERIC, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_update_prices(UUID[], TEXT, NUMERIC, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bulk_update_prices(UUID[], TEXT, NUMERIC, UUID) TO service_role;

-- bulk_update_product_flags
REVOKE EXECUTE ON FUNCTION public.bulk_update_product_flags(UUID[], JSONB, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_update_product_flags(UUID[], JSONB, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_update_product_flags(UUID[], JSONB, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bulk_update_product_flags(UUID[], JSONB, UUID) TO service_role;

-- bulk_update_product_classification
REVOKE EXECUTE ON FUNCTION public.bulk_update_product_classification(UUID[], TEXT, UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_update_product_classification(UUID[], TEXT, UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_update_product_classification(UUID[], TEXT, UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bulk_update_product_classification(UUID[], TEXT, UUID, UUID) TO service_role;
