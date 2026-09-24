-- ─────────────────────────────────────────────────────────────────────────────
-- 030_product_rpc_seo_fields.sql
-- Update create_product_full + update_product_full to persist seo_title and
-- seo_description from the p_product JSONB payload.
-- Depends on 029_catalog_seo_fields.sql (columns must exist first).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_product_full(
  p_product_id  UUID,
  p_actor_id    UUID,
  p_product     JSONB,
  p_images      JSONB,
  p_oem_codes   JSONB,
  p_specs       JSONB,
  p_device_ids  JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_submitted_count INTEGER;
  v_valid_count     INTEGER;
BEGIN
  -- ── Limit guards (fail before any write) ─────────────────────────────────
  IF jsonb_array_length(COALESCE(p_oem_codes, '[]'::jsonb)) > 20 THEN
    RAISE EXCEPTION 'OEM_LIMIT_EXCEEDED';
  END IF;
  IF jsonb_array_length(COALESCE(p_specs, '[]'::jsonb)) > 50 THEN
    RAISE EXCEPTION 'SPEC_LIMIT_EXCEEDED';
  END IF;
  IF jsonb_array_length(COALESCE(p_device_ids, '[]'::jsonb)) > 100 THEN
    RAISE EXCEPTION 'DEVICE_LIMIT_EXCEEDED';
  END IF;

  -- ── Device is_active validation ───────────────────────────────────────────
  SELECT COUNT(*) INTO v_submitted_count
  FROM jsonb_array_elements(COALESCE(p_device_ids, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'device_model_id', '') IS NOT NULL;

  IF v_submitted_count > 0 THEN
    SELECT COUNT(*) INTO v_valid_count
    FROM public.device_models dm
    WHERE dm.id IN (
        SELECT (elem->>'device_model_id')::uuid
        FROM jsonb_array_elements(COALESCE(p_device_ids, '[]'::jsonb)) AS elem
        WHERE NULLIF(elem->>'device_model_id', '') IS NOT NULL
      )
      AND dm.is_active = true;

    IF v_valid_count <> v_submitted_count THEN
      RAISE EXCEPTION 'INVALID_OR_INACTIVE_DEVICE';
    END IF;
  END IF;

  -- ── 1. products INSERT ────────────────────────────────────────────────────
  INSERT INTO public.products (
    id, slug, sku, name, description,
    price, compare_at_price, stock_quantity,
    brand_id, category_id,
    image_url, hover_image_url,
    is_active, is_featured, is_new, same_day_shipping,
    seo_title, seo_description
  ) VALUES (
    p_product_id,
    p_product->>'slug',
    p_product->>'sku',
    p_product->>'name',
    NULLIF(p_product->>'description', ''),
    (p_product->>'price')::numeric,
    NULLIF(p_product->>'compare_at_price', '')::numeric,
    (p_product->>'stock_quantity')::integer,
    NULLIF(p_product->>'brand_id', '')::uuid,
    NULLIF(p_product->>'category_id', '')::uuid,
    NULLIF(p_product->>'image_url', ''),
    NULLIF(p_product->>'hover_image_url', ''),
    (p_product->>'is_active')::boolean,
    (p_product->>'is_featured')::boolean,
    (p_product->>'is_new')::boolean,
    (p_product->>'same_day_shipping')::boolean,
    NULLIF(p_product->>'seo_title', ''),
    NULLIF(p_product->>'seo_description', '')
  );

  -- ── 2. product_images INSERT ──────────────────────────────────────────────
  INSERT INTO public.product_images (product_id, url, storage_path, alt_text, sort_order)
  SELECT
    p_product_id,
    elem->>'url',
    elem->>'storage_path',
    NULLIF(elem->>'alt_text', ''),
    COALESCE((elem->>'sort_order')::smallint, 0)
  FROM jsonb_array_elements(COALESCE(p_images, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'url', '') IS NOT NULL
    AND NULLIF(elem->>'storage_path', '') IS NOT NULL;

  -- ── 3. product_oem_codes INSERT ───────────────────────────────────────────
  INSERT INTO public.product_oem_codes (product_id, code, code_norm, manufacturer, note, sort_order)
  SELECT
    p_product_id,
    elem->>'code',
    elem->>'code_norm',
    NULLIF(elem->>'manufacturer', ''),
    NULLIF(elem->>'note', ''),
    COALESCE((elem->>'sort_order')::smallint, 0)
  FROM jsonb_array_elements(COALESCE(p_oem_codes, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'code', '') IS NOT NULL;

  -- ── 4. product_specifications INSERT ─────────────────────────────────────
  INSERT INTO public.product_specifications (product_id, spec_key, spec_key_norm, spec_value, unit, sort_order)
  SELECT
    p_product_id,
    elem->>'spec_key',
    elem->>'spec_key_norm',
    elem->>'spec_value',
    NULLIF(elem->>'unit', ''),
    COALESCE((elem->>'sort_order')::smallint, 0)
  FROM jsonb_array_elements(COALESCE(p_specs, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'spec_key', '') IS NOT NULL
    AND NULLIF(elem->>'spec_value', '') IS NOT NULL;

  -- ── 5. product_device_models INSERT ──────────────────────────────────────
  INSERT INTO public.product_device_models (product_id, device_model_id, note)
  SELECT
    p_product_id,
    (elem->>'device_model_id')::uuid,
    NULLIF(elem->>'note', '')
  FROM jsonb_array_elements(COALESCE(p_device_ids, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'device_model_id', '') IS NOT NULL;

  -- ── 6. audit_logs INSERT ──────────────────────────────────────────────────
  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    'product_created',
    'product',
    p_product_id,
    jsonb_build_object('name', p_product->>'name', 'sku', p_product->>'sku')
  );

  RETURN p_product_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.create_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) TO service_role;

-- ── update_product_full ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_product_full(
  p_product_id  UUID,
  p_actor_id    UUID,
  p_product     JSONB,
  p_images      JSONB,
  p_oem_codes   JSONB,
  p_specs       JSONB,
  p_device_ids  JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_submitted_count INTEGER;
  v_valid_count     INTEGER;
BEGIN
  -- ── Limit guards ──────────────────────────────────────────────────────────
  IF jsonb_array_length(COALESCE(p_oem_codes, '[]'::jsonb)) > 20 THEN
    RAISE EXCEPTION 'OEM_LIMIT_EXCEEDED';
  END IF;
  IF jsonb_array_length(COALESCE(p_specs, '[]'::jsonb)) > 50 THEN
    RAISE EXCEPTION 'SPEC_LIMIT_EXCEEDED';
  END IF;
  IF jsonb_array_length(COALESCE(p_device_ids, '[]'::jsonb)) > 100 THEN
    RAISE EXCEPTION 'DEVICE_LIMIT_EXCEEDED';
  END IF;

  -- ── Device is_active validation ───────────────────────────────────────────
  SELECT COUNT(*) INTO v_submitted_count
  FROM jsonb_array_elements(COALESCE(p_device_ids, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'device_model_id', '') IS NOT NULL;

  IF v_submitted_count > 0 THEN
    SELECT COUNT(*) INTO v_valid_count
    FROM public.device_models dm
    WHERE dm.id IN (
        SELECT (elem->>'device_model_id')::uuid
        FROM jsonb_array_elements(COALESCE(p_device_ids, '[]'::jsonb)) AS elem
        WHERE NULLIF(elem->>'device_model_id', '') IS NOT NULL
      )
      AND dm.is_active = true;

    IF v_valid_count <> v_submitted_count THEN
      RAISE EXCEPTION 'INVALID_OR_INACTIVE_DEVICE';
    END IF;
  END IF;

  -- ── 1. products UPDATE ────────────────────────────────────────────────────
  UPDATE public.products SET
    slug              = p_product->>'slug',
    sku               = p_product->>'sku',
    name              = p_product->>'name',
    description       = NULLIF(p_product->>'description', ''),
    price             = (p_product->>'price')::numeric,
    compare_at_price  = NULLIF(p_product->>'compare_at_price', '')::numeric,
    brand_id          = NULLIF(p_product->>'brand_id', '')::uuid,
    category_id       = NULLIF(p_product->>'category_id', '')::uuid,
    image_url         = NULLIF(p_product->>'image_url', ''),
    hover_image_url   = NULLIF(p_product->>'hover_image_url', ''),
    is_active         = (p_product->>'is_active')::boolean,
    is_featured       = (p_product->>'is_featured')::boolean,
    is_new            = (p_product->>'is_new')::boolean,
    same_day_shipping = (p_product->>'same_day_shipping')::boolean,
    seo_title         = NULLIF(p_product->>'seo_title', ''),
    seo_description   = NULLIF(p_product->>'seo_description', ''),
    updated_at        = now()
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
  END IF;

  -- ── 2. Sync product_images (DELETE all → INSERT desired) ─────────────────
  DELETE FROM public.product_images WHERE product_id = p_product_id;
  INSERT INTO public.product_images (product_id, url, storage_path, alt_text, sort_order)
  SELECT
    p_product_id,
    elem->>'url',
    elem->>'storage_path',
    NULLIF(elem->>'alt_text', ''),
    COALESCE((elem->>'sort_order')::smallint, 0)
  FROM jsonb_array_elements(COALESCE(p_images, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'url', '') IS NOT NULL
    AND NULLIF(elem->>'storage_path', '') IS NOT NULL;

  -- ── 3. Sync product_oem_codes ─────────────────────────────────────────────
  DELETE FROM public.product_oem_codes WHERE product_id = p_product_id;
  INSERT INTO public.product_oem_codes (product_id, code, code_norm, manufacturer, note, sort_order)
  SELECT
    p_product_id,
    elem->>'code',
    elem->>'code_norm',
    NULLIF(elem->>'manufacturer', ''),
    NULLIF(elem->>'note', ''),
    COALESCE((elem->>'sort_order')::smallint, 0)
  FROM jsonb_array_elements(COALESCE(p_oem_codes, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'code', '') IS NOT NULL;

  -- ── 4. Sync product_specifications ───────────────────────────────────────
  DELETE FROM public.product_specifications WHERE product_id = p_product_id;
  INSERT INTO public.product_specifications (product_id, spec_key, spec_key_norm, spec_value, unit, sort_order)
  SELECT
    p_product_id,
    elem->>'spec_key',
    elem->>'spec_key_norm',
    elem->>'spec_value',
    NULLIF(elem->>'unit', ''),
    COALESCE((elem->>'sort_order')::smallint, 0)
  FROM jsonb_array_elements(COALESCE(p_specs, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'spec_key', '') IS NOT NULL
    AND NULLIF(elem->>'spec_value', '') IS NOT NULL;

  -- ── 5. Sync product_device_models ─────────────────────────────────────────
  DELETE FROM public.product_device_models WHERE product_id = p_product_id;
  INSERT INTO public.product_device_models (product_id, device_model_id, note)
  SELECT
    p_product_id,
    (elem->>'device_model_id')::uuid,
    NULLIF(elem->>'note', '')
  FROM jsonb_array_elements(COALESCE(p_device_ids, '[]'::jsonb)) AS elem
  WHERE NULLIF(elem->>'device_model_id', '') IS NOT NULL;

  -- ── 6. audit_logs INSERT ──────────────────────────────────────────────────
  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    'product_updated',
    'product',
    p_product_id,
    jsonb_build_object('name', p_product->>'name')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.update_product_full(UUID, UUID, JSONB, JSONB, JSONB, JSONB, JSONB) TO service_role;
