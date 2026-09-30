-- ─────────────────────────────────────────────────────────────────────────────
-- 035_bulk_import_track_stock.sql
-- bulk_import_products RPC'sine track_stock desteği ekleme.
--
-- Sorun: 015_bulk_import_products_rpc.sql, 031_product_stock_tracking.sql'den
--        önce yazıldı; INSERT kolonları arasında track_stock yoktu.
--        Sonuç: import edilen tüm ürünler DB default'u (true) aldı.
--
-- Düzeltme: INSERT + SELECT'e track_stock eklendi.
--   - Payload'da track_stock mevcutsa: gelen değer kullanılır.
--   - Payload'da track_stock yoksa: COALESCE → true (DB default, geriye dönük uyumlu).
--
-- WooCommerce mapping semantiği (normalize.ts referansı):
--   manage_stock=false → track_stock=false  (stok takibi yok, her zaman satışta)
--   manage_stock=true  → track_stock=true   (stok_quantity yetkili, 0 → stok tükendi)
--
-- Bağımlılık: 015 (fonksiyon), 031 (track_stock kolonu)
-- ─────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.bulk_import_products(JSONB, UUID, UUID);

CREATE OR REPLACE FUNCTION public.bulk_import_products(
  p_rows       JSONB,
  p_session_id UUID,
  p_actor_id   UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_inserted_count       INT := 0;
  v_stock_movement_count INT := 0;
BEGIN

  IF p_actor_id IS NULL OR p_session_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'missing_required_params');
  END IF;

  IF p_rows IS NULL OR jsonb_array_length(p_rows) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'empty_rows');
  END IF;

  IF jsonb_array_length(p_rows) > 10000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'too_many_rows');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id
      AND is_active = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthorized_actor');
  END IF;

  INSERT INTO public.products (
    sku,
    name,
    slug,
    description,
    price,
    compare_at_price,
    stock_quantity,
    track_stock,
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
    CASE
      WHEN r->>'compare_at_price' IS NULL OR r->>'compare_at_price' = ''
      THEN NULL
      ELSE (r->>'compare_at_price')::NUMERIC(10,2)
    END,
    COALESCE((r->>'stock_quantity')::INT, 0),
    COALESCE((r->>'track_stock')::BOOLEAN, true),
    CASE
      WHEN r->>'brand_id' IS NULL OR r->>'brand_id' = ''
      THEN NULL
      ELSE (r->>'brand_id')::UUID
    END,
    CASE
      WHEN r->>'category_id' IS NULL OR r->>'category_id' = ''
      THEN NULL
      ELSE (r->>'category_id')::UUID
    END,
    CASE
      WHEN jsonb_typeof(r->'compatible_brands') = 'array'
      THEN r->'compatible_brands'
      ELSE NULL
    END,
    NULLIF(r->>'image_url', ''),
    NULLIF(r->>'hover_image_url', ''),
    COALESCE((r->>'is_active')::BOOLEAN,        true),
    COALESCE((r->>'is_featured')::BOOLEAN,      false),
    COALESCE((r->>'is_new')::BOOLEAN,           false),
    COALESCE((r->>'same_day_shipping')::BOOLEAN, false)
  FROM jsonb_array_elements(p_rows) AS r;

  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

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

  RETURN jsonb_build_object(
    'ok',                             true,
    'session_id',                     p_session_id,
    'inserted_count',                 v_inserted_count,
    'initial_stock_movements_count',  v_stock_movement_count
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;

END;
$$;

REVOKE EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bulk_import_products(JSONB, UUID, UUID) TO service_role;
