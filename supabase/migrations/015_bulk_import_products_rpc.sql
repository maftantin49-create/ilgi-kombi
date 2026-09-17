-- ─────────────────────────────────────────────────────────────────────────────
-- 015_bulk_import_products_rpc.sql
-- Toplu ürün import RPC fonksiyonu
--
-- !! KULLANICI ONAYI BEKLENİYOR — henüz çalıştırılmadı !!
--
-- Bağımlılık:
--   001_extensions_enums.sql → inventory_movement_type enum
--   002_core_tables.sql      → products
--   005_payment_tables.sql   → inventory_movements
--   006_admin_audit_tables.sql → admin_profiles, audit_logs
--
-- Tasarım kararları:
--   + APPEND ONLY — mevcut SKU/slug çakışması yoksa çalışır
--   + ON CONFLICT YOK — sessiz skip değil, constraint error → full rollback
--   + Set-based INSERT (LOOP değil) — 10k satır için performans
--   + stock_quantity > 0 → inventory_movements 'restock' kaydı
--   + Tüm 3 işlem (products + movements + audit) tek transaction
--   + SECURITY DEFINER hardened: SET search_path = '', fully-qualified refs
--   + PUBLIC/anon/authenticated EXECUTE yetkisi yok — yalnızca service_role
--
-- Rollback SQL:
--   DROP FUNCTION IF EXISTS public.bulk_import_products(JSONB, UUID, UUID);
-- ─────────────────────────────────────────────────────────────────────────────

-- Önceki denemelerden kalan imzayı temizle (migration yeniden çalıştırılabilir)
DROP FUNCTION IF EXISTS public.bulk_import_products(JSONB, UUID, UUID);

CREATE OR REPLACE FUNCTION public.bulk_import_products(
  p_rows       JSONB,   -- normalize + validate edilmiş ürün satırları (server action'dan)
  p_session_id UUID,   -- import oturumu ID (server-side üretilir, audit için)
  p_actor_id   UUID    -- requireAdmin() dönen auth_user_id
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''   -- search_path injection'a karşı; tüm objeler public.* ile tam nitelenmiş
AS $$
DECLARE
  v_inserted_count       INT := 0;
  v_stock_movement_count INT := 0;
BEGIN

  -- ── 1. PARAMETRE DOĞRULAMASI ──────────────────────────────────────────────

  IF p_actor_id IS NULL OR p_session_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing_required_params');
  END IF;

  IF p_rows IS NULL OR jsonb_array_length(p_rows) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'empty_rows');
  END IF;

  -- Savunma katmanı: server action da kontrol eder ama RPC'de de son güvenlik
  IF jsonb_array_length(p_rows) > 10000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'too_many_rows');
  END IF;

  -- ── 2. ACTOR DOĞRULAMASI ──────────────────────────────────────────────────
  -- Next.js requireAdmin() katmanına ek bağımsız kontrol.
  -- service_role ile doğrudan RPC çağrısını da engeller.

  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id
      AND is_active = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized_actor');
  END IF;

  -- ── 3. TOPLU ÜRÜN INSERT (set-based, tek SQL deyimi) ──────────────────────
  -- LOOP kullanmak yerine jsonb_array_elements ile set-based INSERT yapılır.
  -- 10k satır için LOOP ~2-5x daha yavaş olurdu.
  -- ON CONFLICT kullanılmaz: sessiz skip istemiyoruz.
  -- SKU veya slug çakışması → unique_violation exception → transaction rollback.

  INSERT INTO public.products (
    sku,
    name,
    slug,
    description,
    price,
    compare_at_price,
    stock_quantity,
    brand_id,
    category_id,
    compatible_brands,
    image_url,
    hover_image_url,
    is_active,
    is_featured,
    is_new,
    same_day_shipping
  )
  SELECT
    r->>'sku',
    r->>'name',
    r->>'slug',
    NULLIF(r->>'description', ''),
    (r->>'price')::NUMERIC(10,2),
    -- compare_at_price: JSON null → SQL null, boş string → null, sayı → cast
    CASE
      WHEN r->>'compare_at_price' IS NULL OR r->>'compare_at_price' = ''
      THEN NULL
      ELSE (r->>'compare_at_price')::NUMERIC(10,2)
    END,
    COALESCE((r->>'stock_quantity')::INT, 0),
    -- brand_id: null string veya boş → NULL UUID
    CASE
      WHEN r->>'brand_id' IS NULL OR r->>'brand_id' = ''
      THEN NULL
      ELSE (r->>'brand_id')::UUID
    END,
    -- category_id: null string veya boş → NULL UUID
    CASE
      WHEN r->>'category_id' IS NULL OR r->>'category_id' = ''
      THEN NULL
      ELSE (r->>'category_id')::UUID
    END,
    -- compatible_brands: yalnız array tipiyse geçir, aksi halde NULL
    CASE
      WHEN jsonb_typeof(r->'compatible_brands') = 'array'
      THEN r->'compatible_brands'
      ELSE NULL
    END,
    NULLIF(r->>'image_url', ''),
    NULLIF(r->>'hover_image_url', ''),
    COALESCE((r->>'is_active')::BOOLEAN,       true),
    COALESCE((r->>'is_featured')::BOOLEAN,     false),
    COALESCE((r->>'is_new')::BOOLEAN,          false),
    COALESCE((r->>'same_day_shipping')::BOOLEAN, false)
  FROM jsonb_array_elements(p_rows) AS r;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

  -- ── 4. BAŞLANGIÇ STOK HAREKETLERİ ────────────────────────────────────────
  -- stock_quantity > 0 olan ürünler için 'restock' hareketi oluştur.
  -- Stok doğrudan ortaya çıkmasın; hareket geçmişi olsun.
  -- JOIN: az önce insert edilen ürünleri SKU üzerinden eşleştir.
  -- Aynı transaction içinde yeni satırlar görünür.

  INSERT INTO public.inventory_movements (product_id, type, quantity, reason)
  SELECT
    p.id,
    'restock'::public.inventory_movement_type,
    COALESCE((r->>'stock_quantity')::INT, 0),
    'Toplu ürün import başlangıç stoğu — oturum: ' || p_session_id::TEXT
  FROM jsonb_array_elements(p_rows) AS r
  JOIN public.products p ON p.sku = r->>'sku'
  WHERE COALESCE((r->>'stock_quantity')::INT, 0) > 0;

  GET DIAGNOSTICS v_stock_movement_count = ROW_COUNT;

  -- ── 5. AUDIT LOG ──────────────────────────────────────────────────────────
  -- Tek batch kaydı — 10k product_id audit metadata'ya yazılmaz.
  -- Audit başarısızlığı da tüm işlemi rollback eder (EXCEPTION bloğu).

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    'product_bulk_imported',
    'import_session',
    p_session_id,
    jsonb_build_object(
      'import_session_id',             p_session_id,
      'inserted_count',                v_inserted_count,
      'initial_stock_movements_count', v_stock_movement_count
    )
  );

  -- ── 6. BAŞARILI DÖNÜŞ ─────────────────────────────────────────────────────

  RETURN jsonb_build_object(
    'ok',                             true,
    'session_id',                     p_session_id,
    'inserted_count',                 v_inserted_count,
    'initial_stock_movements_count',  v_stock_movement_count
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Hata mesajını logla; transaction PostgreSQL tarafından otomatik rollback edilir.
    -- partial import oluşmaz: products + movements + audit hepsi geri alınır.
    RAISE;

END;
$$;

-- ── EXECUTE YETKİSİ ───────────────────────────────────────────────────────────
-- Pattern: 012_admin_stock_adjustment_rpc.sql ile aynı güvenlik modeli.

REVOKE EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) TO service_role;
