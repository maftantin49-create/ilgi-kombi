-- ─────────────────────────────────────────────────────────────────────────────
-- 012_admin_stock_adjustment_rpc.sql
-- Admin stok düzeltme RPC fonksiyonu — hardened version
--
-- !! KULLANICI ONAYI BEKLENİYOR — henüz çalıştırılmadı !!
--
-- Bağımlılık:
--   001_extensions_enums.sql  → inventory_movement_type, reservation_status enum
--   002_core_tables.sql       → products
--   005_payment_tables.sql    → inventory_reservations, inventory_movements
--   006_admin_audit_tables.sql → admin_profiles, audit_logs
--
-- Audit sonrası yapılan değişiklikler:
--   + p_actor_id UUID eklendi (5. parametre)
--   + quantity guard: add/remove > 0, adjust >= 0
--   + reason guard: 10-500 karakter (trim sonrası)
--   + actor validation: admin_profiles.auth_user_id + is_active check
--   + audit_logs INSERT aynı transaction içine alındı (3 işlem atomik)
--   + SET search_path = '' (hardened SECURITY DEFINER)
--   + Tüm referanslar fully-qualified (public.*)
--   + Eski 4-param imza DROP IF EXISTS ile temizlendi
-- ─────────────────────────────────────────────────────────────────────────────

-- Eski 4-parametreli imzayı temizle.
-- Migration henüz hiç çalıştırılmadıysa bu satır no-op'tur (IF EXISTS güvenli).
-- Eski signature bırakılırsa PostgreSQL function overloading yaratır ve
-- REVOKE/GRANT satırları hangi imzanın hedef alındığını bilemez.
DROP FUNCTION IF EXISTS public.admin_stock_adjustment(UUID, TEXT, INT, TEXT);

CREATE OR REPLACE FUNCTION public.admin_stock_adjustment(
  p_product_id UUID,
  p_operation  TEXT,   -- 'add' | 'remove' | 'adjust'
  p_quantity   INT,    -- add/remove: pozitif miktar;  adjust: yeni absolüt stok değeri
  p_reason     TEXT,
  p_actor_id   UUID    -- requireAdmin() dönen auth user id
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''   -- search_path injection'a karşı; tüm objeler public.* ile tam nitelenmiş
AS $$
DECLARE
  v_current_stock  INT;
  v_reserved_stock INT;
  v_available      INT;
  v_new_stock      INT;
  v_movement_qty   INT;    -- signed delta: pozitif = stok arttı, negatif = azaldı
  v_movement_type  public.inventory_movement_type;
  v_movement_id    UUID;
BEGIN

  -- ── 1. GİRİŞ DOĞRULAMASI (herhangi bir DB işlemi başlamadan) ─────────────

  -- quantity NULL kontrolü — INT parametresi NULL gelebilir
  IF p_quantity IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'quantity_required');
  END IF;

  -- add / remove için pozitif zorunlu; negatif miktar operasyonu tersine çevirir
  IF p_operation IN ('add', 'remove') AND p_quantity <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'quantity_must_be_positive');
  END IF;

  -- adjust için negatif yasak; 0 geçerlidir (stoğu sıfırla)
  IF p_operation = 'adjust' AND p_quantity < 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'negative_adjustment_not_allowed');
  END IF;

  -- reason NULL veya çok kısa
  IF p_reason IS NULL OR length(trim(p_reason)) < 10 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'reason_too_short');
  END IF;

  -- reason çok uzun
  IF length(trim(p_reason)) > 500 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'reason_too_long');
  END IF;

  -- ── 2. ACTOR DOĞRULAMASI ──────────────────────────────────────────────────
  -- Savunma derinliği: Next.js requireAdmin() katmanı zaten doğruluyor.
  -- Ancak service_role ile doğrudan RPC çağrısını da engeller.

  IF p_actor_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'actor_required');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id
      AND is_active = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized_actor');
  END IF;

  -- ── 3. ÜRÜN SATIRI KİLİTLE (FOR UPDATE) ──────────────────────────────────
  -- Transaction boyunca concurrent yazma serialize edilir.
  -- create_order_atomic ile aynı pattern.

  SELECT stock_quantity INTO v_current_stock
  FROM public.products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'product_not_found');
  END IF;

  -- ── 4. AKTİF REZERVASYON TOPLAMI ──────────────────────────────────────────
  -- Yalnızca status = 'active' AND expires_at > NOW() — create_order_atomic ile aynı formül.

  SELECT COALESCE(SUM(quantity), 0) INTO v_reserved_stock
  FROM public.inventory_reservations
  WHERE product_id = p_product_id
    AND status     = 'active'::public.reservation_status
    AND expires_at > NOW();

  v_available := v_current_stock - v_reserved_stock;

  -- ── 5. OPERASYON ──────────────────────────────────────────────────────────

  CASE p_operation

    WHEN 'add' THEN
      -- Toplam fiziksel stoğa ekle; available kontrolü gerekmez
      v_new_stock     := v_current_stock + p_quantity;
      v_movement_qty  := p_quantity;           -- pozitif delta
      v_movement_type := 'restock'::public.inventory_movement_type;

    WHEN 'remove' THEN
      -- Yalnızca kullanılabilir stoktan çıkar; rezerveli stoğa dokunma
      IF p_quantity > v_available THEN
        RETURN jsonb_build_object(
          'ok',        false,
          'error',     'insufficient_available_stock',
          'available', v_available,
          'requested', p_quantity
        );
      END IF;
      v_new_stock     := v_current_stock - p_quantity;
      v_movement_qty  := -p_quantity;          -- negatif delta
      v_movement_type := 'manual_adjustment'::public.inventory_movement_type;

    WHEN 'adjust' THEN
      -- Stoğu p_quantity'ye ayarla (absolüt değer); p_quantity >= 0 garantisi üstte
      v_new_stock     := p_quantity;
      v_movement_qty  := p_quantity - v_current_stock;  -- signed delta (pozitif veya negatif)
      v_movement_type := 'manual_adjustment'::public.inventory_movement_type;

    ELSE
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_operation');

  END CASE;

  -- ── 6. NEGATİF STOK GUARD (ek emniyet katmanı) ────────────────────────────

  IF v_new_stock < 0 THEN
    RETURN jsonb_build_object(
      'ok',        false,
      'error',     'would_go_negative',
      'new_stock', v_new_stock
    );
  END IF;

  -- ── 7. ATOMİK YAZMA BLOĞU ────────────────────────────────────────────────
  -- (a) products.stock_quantity güncelle
  -- (b) inventory_movements INSERT
  -- (c) audit_logs INSERT
  -- Herhangi birinde hata → PostgreSQL tüm transaction'ı rollback eder.

  UPDATE public.products
  SET    stock_quantity = v_new_stock
  WHERE  id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, type, quantity, reason)
  VALUES (p_product_id, v_movement_type, v_movement_qty, trim(p_reason))
  RETURNING id INTO v_movement_id;

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    CASE p_operation
      WHEN 'add'    THEN 'inventory_stock_added'
      WHEN 'remove' THEN 'inventory_stock_removed'
      ELSE               'inventory_stock_adjusted'   -- 'adjust' — ELSE safe çünkü geçersiz op üstte döndü
    END,
    'product',
    p_product_id,
    jsonb_build_object(
      'product_id',     p_product_id,
      'previous_stock', v_current_stock,
      'quantity',       v_movement_qty,
      'new_stock',      v_new_stock,
      'reason',         trim(p_reason),
      'operation',      p_operation
    )
  );

  -- ── 8. BAŞARILI DÖNÜŞ ─────────────────────────────────────────────────────

  RETURN jsonb_build_object(
    'ok',             true,
    'previous_stock', v_current_stock,
    'new_stock',      v_new_stock,
    'movement_qty',   v_movement_qty,
    'movement_id',    v_movement_id
  );

END;
$$;

-- ── EXECUTE YETKİSİ ───────────────────────────────────────────────────────────
-- Yalnızca service_role (server-side Next.js action) çağırabilir.
-- anon ve authenticated (client tarafı) erişemez.

REVOKE EXECUTE ON FUNCTION public.admin_stock_adjustment(UUID, TEXT, INT, TEXT, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_stock_adjustment(UUID, TEXT, INT, TEXT, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_stock_adjustment(UUID, TEXT, INT, TEXT, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.admin_stock_adjustment(UUID, TEXT, INT, TEXT, UUID) TO service_role;
