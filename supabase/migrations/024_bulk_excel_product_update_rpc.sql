-- ─────────────────────────────────────────────────────────────────────────────
-- 024_bulk_excel_product_update_rpc.sql
-- Atomic Excel toplu ürün güncelleme RPC
--
-- !! KULLANICI ONAYI BEKLENİYOR — henüz çalıştırılmadı !!
--
-- Fonksiyon:
--   public.bulk_excel_product_update(p_rows JSONB, p_actor_id UUID, p_operation_id UUID)
--
-- Bağımlılık:
--   001_extensions_enums.sql  → inventory_movement_type, reservation_status
--   002_core_tables.sql       → products, brands, categories
--   005_payment_tables.sql    → inventory_reservations, inventory_movements
--   006_admin_audit_tables.sql → admin_profiles, audit_logs
--
-- Güvenlik:
--   SECURITY DEFINER + SET search_path = '' (hardened)
--   REVOKE PUBLIC/anon/authenticated; GRANT service_role only
--
-- p_rows her eleman:
--   { "product_id": "uuid", ...optional fields... }
--   Key yoksa: UNCHANGED (mevcut değer korunur)
--   Key varsa + JSON null: SET NULL (brand_id / category_id için CLEAR)
--   Key varsa + değer:     SET değer
--
-- Fazlar:
--   Phase 1 (FOR UPDATE): tüm batch validate edilir, ilk hatada durulmaz
--   Phase 2 (write):      yalnız tüm batch geçerliyse çalışır
--
-- İzin verilen p_rows field'ları:
--   product_id, price, stock, is_active, is_featured, is_new,
--   same_day_shipping, brand_id, category_id
--
-- Return (success):
--   { ok: true, operation_id, submitted, affected,
--     fields_changed, price_updates, stock_updates,
--     flag_updates, brand_updates, category_updates }
--
-- Return (hata):
--   { ok: false, code: "ERROR_CODE", ... }
--
-- Hata kodları:
--   ACTOR_REQUIRED, OPERATION_ID_REQUIRED, EMPTY_ROWS, LIMIT_EXCEEDED,
--   UNAUTHORIZED_ADMIN, DUPLICATE_PRODUCT, INVALID_PRODUCT,
--   INVALID_BRAND, INVALID_CATEGORY, VALIDATION_FAILED
--
-- Rollback:
--   DROP FUNCTION IF EXISTS public.bulk_excel_product_update(JSONB, UUID, UUID);
-- ─────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.bulk_excel_product_update(JSONB, UUID, UUID);

CREATE OR REPLACE FUNCTION public.bulk_excel_product_update(
  p_rows          JSONB,
  p_actor_id      UUID,
  p_operation_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  -- ── Control ──────────────────────────────────────────────────────────────────
  v_row_count      INT;
  v_product_ids    UUID[];
  v_unique_count   INT;
  v_found_count    INT;

  -- ── Brand / Category validation ───────────────────────────────────────────────
  v_brand_ids      UUID[];
  v_brand_count    INT;
  v_category_ids   UUID[];
  v_category_count INT;

  -- ── Per-row state ─────────────────────────────────────────────────────────────
  v_rec            RECORD;
  v_row            JSONB;
  v_failed         JSONB := '[]'::JSONB;
  v_key            TEXT;
  v_allowed_keys   TEXT[] := ARRAY[
    'product_id','price','stock','is_active','is_featured',
    'is_new','same_day_shipping','brand_id','category_id'
  ];

  -- ── Stock ────────────────────────────────────────────────────────────────────
  v_new_stock      INT;
  v_delta          INT;

  -- ── Audit counters ────────────────────────────────────────────────────────────
  v_affected_count   INT := 0;
  v_fields_changed   INT := 0;
  v_price_updates    INT := 0;
  v_stock_updates    INT := 0;
  v_flag_updates     INT := 0;
  v_brand_updates    INT := 0;
  v_category_updates INT := 0;

  -- ── Per-row change detection ──────────────────────────────────────────────────
  v_row_changed      BOOLEAN;
  v_row_fields       INT;

  -- ── Brand / Category resolved UUIDs (per Phase-2 row) ────────────────────────
  -- Declared here to avoid nested DECLARE blocks inside IF branches.
  v_new_brand        UUID;
  v_new_category     UUID;
BEGIN

  -- ── 1. Null / type guard ─────────────────────────────────────────────────────

  IF p_actor_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ACTOR_REQUIRED');
  END IF;

  IF p_operation_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'OPERATION_ID_REQUIRED');
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'EMPTY_ROWS');
  END IF;

  v_row_count := jsonb_array_length(p_rows);

  IF v_row_count = 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'EMPTY_ROWS');
  END IF;

  IF v_row_count > 500 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'LIMIT_EXCEEDED', 'count', v_row_count);
  END IF;

  -- ── 2. Actor validation ───────────────────────────────────────────────────────

  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE auth_user_id = p_actor_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'code', 'UNAUTHORIZED_ADMIN');
  END IF;

  -- ── 3. Extract product_ids + duplicate check ─────────────────────────────────
  -- Unique IDs in ORDER BY id (deterministic lock order, deadlock prevention).

  SELECT ARRAY(
    SELECT DISTINCT (elem->>'product_id')::UUID
    FROM   jsonb_array_elements(p_rows) AS elem
    WHERE  elem->>'product_id' IS NOT NULL
    ORDER BY 1
  ) INTO v_product_ids;

  v_unique_count := COALESCE(array_length(v_product_ids, 1), 0);

  IF v_unique_count = 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'EMPTY_ROWS');
  END IF;

  -- After dedup, if unique < total, there were duplicates in p_rows
  IF v_unique_count < v_row_count THEN
    RETURN jsonb_build_object('ok', false, 'code', 'DUPLICATE_PRODUCT');
  END IF;

  -- ── 4. Product existence ──────────────────────────────────────────────────────

  SELECT COUNT(*) INTO v_found_count
  FROM public.products WHERE id = ANY(v_product_ids);

  IF v_found_count <> v_unique_count THEN
    RETURN jsonb_build_object('ok', false, 'code', 'INVALID_PRODUCT');
  END IF;

  -- ── 5. Brand bulk pre-validation ──────────────────────────────────────────────
  -- Collect all distinct non-null brand_id values from p_rows and verify existence.

  SELECT ARRAY(
    SELECT DISTINCT (elem->>'brand_id')::UUID
    FROM   jsonb_array_elements(p_rows) AS elem
    WHERE  (elem ? 'brand_id') AND elem->>'brand_id' IS NOT NULL
    ORDER BY 1
  ) INTO v_brand_ids;

  IF COALESCE(array_length(v_brand_ids, 1), 0) > 0 THEN
    SELECT COUNT(*) INTO v_brand_count
    FROM public.brands WHERE id = ANY(v_brand_ids);
    IF v_brand_count <> array_length(v_brand_ids, 1) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'INVALID_BRAND');
    END IF;
  END IF;

  -- ── 6. Category bulk pre-validation ──────────────────────────────────────────

  SELECT ARRAY(
    SELECT DISTINCT (elem->>'category_id')::UUID
    FROM   jsonb_array_elements(p_rows) AS elem
    WHERE  (elem ? 'category_id') AND elem->>'category_id' IS NOT NULL
    ORDER BY 1
  ) INTO v_category_ids;

  IF COALESCE(array_length(v_category_ids, 1), 0) > 0 THEN
    SELECT COUNT(*) INTO v_category_count
    FROM public.categories WHERE id = ANY(v_category_ids);
    IF v_category_count <> array_length(v_category_ids, 1) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'INVALID_CATEGORY');
    END IF;
  END IF;

  -- ── PHASE 1 — Validate all rows (FOR UPDATE, deterministic order) ─────────────
  --
  -- Locks acquired here are held for Phase 2 (same transaction).
  -- All rows validated before any write. One failure → abort entire batch.

  FOR v_rec IN
    SELECT
      p.id,
      p.sku,
      p.stock_quantity AS current_stock,
      COALESCE((
        SELECT SUM(ir.quantity)
        FROM   public.inventory_reservations ir
        WHERE  ir.product_id = p.id
          AND  ir.status     = 'active'::public.reservation_status
          AND  ir.expires_at > NOW()
      ), 0) AS reserved_stock
    FROM public.products p
    WHERE p.id = ANY(v_product_ids)
    ORDER BY p.id    -- deterministic lock order
    FOR UPDATE
  LOOP
    -- Find this product's row in p_rows
    SELECT elem INTO v_row
    FROM   jsonb_array_elements(p_rows) AS elem
    WHERE  (elem->>'product_id')::UUID = v_rec.id
    LIMIT  1;

    -- Unknown key guard: reject any key not in whitelist
    FOR v_key IN SELECT k FROM jsonb_object_keys(v_row) AS k LOOP
      IF NOT v_key = ANY(v_allowed_keys) THEN
        v_failed := v_failed || jsonb_build_object(
          'product_id', v_rec.id,
          'sku',        v_rec.sku,
          'code',       'INVALID_FIELD',
          'field',      v_key
        );
      END IF;
    END LOOP;

    -- Price validation: must be >= 0 (price = 0 is allowed, warning is UI-only)
    IF v_row ? 'price' AND (v_row->>'price')::NUMERIC < 0 THEN
      v_failed := v_failed || jsonb_build_object(
        'product_id', v_rec.id,
        'sku',        v_rec.sku,
        'code',       'NEGATIVE_PRICE'
      );
    END IF;

    -- Stock validation: >= 0 and >= active reservations
    IF v_row ? 'stock' THEN
      v_new_stock := (v_row->>'stock')::INT;
      IF v_new_stock < 0 THEN
        v_failed := v_failed || jsonb_build_object(
          'product_id', v_rec.id,
          'sku',        v_rec.sku,
          'code',       'NEGATIVE_STOCK'
        );
      ELSIF v_new_stock < v_rec.reserved_stock THEN
        v_failed := v_failed || jsonb_build_object(
          'product_id',    v_rec.id,
          'sku',           v_rec.sku,
          'code',          'RESERVED_STOCK_VIOLATION',
          'new_stock',     v_new_stock,
          'reserved_stock',v_rec.reserved_stock
        );
      END IF;
    END IF;

  END LOOP;

  -- One failure → abort entire batch; locks released at transaction end
  IF jsonb_array_length(v_failed) > 0 THEN
    RETURN jsonb_build_object(
      'ok',              false,
      'code',            'VALIDATION_FAILED',
      'failed_products', v_failed
    );
  END IF;

  -- ── PHASE 2 — Write (locks from Phase 1 still held) ──────────────────────────
  --
  -- Update each product, detect actual changes for audit counters.
  -- CASE WHEN v_row ? 'field' handles absent-key → unchanged semantics.
  -- NULL value for brand_id / category_id → SET NULL (CLEAR).

  FOR v_rec IN
    SELECT
      p.id, p.sku,
      p.price            AS current_price,
      p.stock_quantity   AS current_stock,
      p.is_active        AS current_is_active,
      p.is_featured      AS current_is_featured,
      p.is_new           AS current_is_new,
      p.same_day_shipping AS current_same_day,
      p.brand_id         AS current_brand_id,
      p.category_id      AS current_category_id
    FROM public.products p
    WHERE p.id = ANY(v_product_ids)
    ORDER BY p.id   -- same order as Phase 1 (locks already held, order is consistent)
  LOOP
    SELECT elem INTO v_row
    FROM   jsonb_array_elements(p_rows) AS elem
    WHERE  (elem->>'product_id')::UUID = v_rec.id
    LIMIT  1;

    -- Detect per-row changes for accurate audit counts
    v_row_changed := false;
    v_row_fields  := 0;

    IF v_row ? 'price' AND (v_row->>'price')::NUMERIC IS DISTINCT FROM v_rec.current_price THEN
      v_row_changed := true; v_row_fields := v_row_fields + 1;
      v_price_updates := v_price_updates + 1;
    END IF;

    IF v_row ? 'stock' AND (v_row->>'stock')::INT IS DISTINCT FROM v_rec.current_stock THEN
      v_row_changed := true; v_row_fields := v_row_fields + 1;
      v_stock_updates := v_stock_updates + 1;
    END IF;

    IF v_row ? 'is_active' AND (v_row->>'is_active')::BOOLEAN IS DISTINCT FROM v_rec.current_is_active THEN
      v_row_changed := true; v_row_fields := v_row_fields + 1;
      v_flag_updates := v_flag_updates + 1;
    END IF;

    IF v_row ? 'is_featured' AND (v_row->>'is_featured')::BOOLEAN IS DISTINCT FROM v_rec.current_is_featured THEN
      v_row_changed := true; v_row_fields := v_row_fields + 1;
      v_flag_updates := v_flag_updates + 1;
    END IF;

    IF v_row ? 'is_new' AND (v_row->>'is_new')::BOOLEAN IS DISTINCT FROM v_rec.current_is_new THEN
      v_row_changed := true; v_row_fields := v_row_fields + 1;
      v_flag_updates := v_flag_updates + 1;
    END IF;

    IF v_row ? 'same_day_shipping' AND (v_row->>'same_day_shipping')::BOOLEAN IS DISTINCT FROM v_rec.current_same_day THEN
      v_row_changed := true; v_row_fields := v_row_fields + 1;
      v_flag_updates := v_flag_updates + 1;
    END IF;

    -- brand_id: absent key → unchanged; present key with null → CLEAR; present + UUID → SET
    -- v_new_brand declared in outer DECLARE block (avoids nested DECLARE inside IF).
    IF v_row ? 'brand_id' THEN
      v_new_brand := NULLIF(v_row->>'brand_id', '')::UUID;
      IF v_new_brand IS DISTINCT FROM v_rec.current_brand_id THEN
        v_row_changed := true; v_row_fields := v_row_fields + 1;
        v_brand_updates := v_brand_updates + 1;
      END IF;
    END IF;

    IF v_row ? 'category_id' THEN
      v_new_category := NULLIF(v_row->>'category_id', '')::UUID;
      IF v_new_category IS DISTINCT FROM v_rec.current_category_id THEN
        v_row_changed := true; v_row_fields := v_row_fields + 1;
        v_category_updates := v_category_updates + 1;
      END IF;
    END IF;

    -- Only UPDATE if something would actually change
    IF NOT v_row_changed THEN
      CONTINUE;
    END IF;

    v_affected_count := v_affected_count + 1;
    v_fields_changed := v_fields_changed + v_row_fields;

    -- Atomic UPDATE using CASE WHEN absence pattern.
    -- brand_id / category_id: absent key → keep, present key → NULLIF(value)::UUID (handles JSON null → SQL NULL).
    UPDATE public.products
    SET
      price             = CASE WHEN v_row ? 'price'
                               THEN (v_row->>'price')::NUMERIC
                               ELSE price             END,
      stock_quantity    = CASE WHEN v_row ? 'stock'
                               THEN (v_row->>'stock')::INT
                               ELSE stock_quantity    END,
      is_active         = CASE WHEN v_row ? 'is_active'
                               THEN (v_row->>'is_active')::BOOLEAN
                               ELSE is_active         END,
      is_featured       = CASE WHEN v_row ? 'is_featured'
                               THEN (v_row->>'is_featured')::BOOLEAN
                               ELSE is_featured       END,
      is_new            = CASE WHEN v_row ? 'is_new'
                               THEN (v_row->>'is_new')::BOOLEAN
                               ELSE is_new            END,
      same_day_shipping = CASE WHEN v_row ? 'same_day_shipping'
                               THEN (v_row->>'same_day_shipping')::BOOLEAN
                               ELSE same_day_shipping END,
      brand_id          = CASE WHEN v_row ? 'brand_id'
                               THEN NULLIF(v_row->>'brand_id', '')::UUID
                               ELSE brand_id          END,
      category_id       = CASE WHEN v_row ? 'category_id'
                               THEN NULLIF(v_row->>'category_id', '')::UUID
                               ELSE category_id       END
      -- updated_at is managed by the products_updated_at trigger on each row write
    WHERE id = v_rec.id;

    -- Inventory movement: only when stock actually changes, delta ≠ 0
    IF v_row ? 'stock' AND (v_row->>'stock')::INT IS DISTINCT FROM v_rec.current_stock THEN
      v_delta := (v_row->>'stock')::INT - v_rec.current_stock;
      IF v_delta <> 0 THEN
        INSERT INTO public.inventory_movements (product_id, type, quantity, reason)
        VALUES (
          v_rec.id,
          'manual_adjustment'::public.inventory_movement_type,
          v_delta,
          'Excel toplu güncelleme [op:' || p_operation_id::TEXT || ']'
        );
      END IF;
    END IF;

  END LOOP;

  -- ── Audit ─────────────────────────────────────────────────────────────────────
  -- Single row; no product_id array (bloat prevention).

  INSERT INTO public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  VALUES (
    p_actor_id,
    'bulk_excel_product_update',
    'bulk_operation',
    p_operation_id,
    jsonb_build_object(
      'rows_submitted',    v_row_count,
      'affected_products', v_affected_count,
      'fields_changed',    v_fields_changed,
      'price_updates',     v_price_updates,
      'stock_updates',     v_stock_updates,
      'flag_updates',      v_flag_updates,
      'brand_updates',     v_brand_updates,
      'category_updates',  v_category_updates
    )
  );

  -- ── Success ───────────────────────────────────────────────────────────────────

  RETURN jsonb_build_object(
    'ok',               true,
    'operation_id',     p_operation_id,
    'submitted',        v_row_count,
    'affected',         v_affected_count,
    'fields_changed',   v_fields_changed,
    'price_updates',    v_price_updates,
    'stock_updates',    v_stock_updates,
    'flag_updates',     v_flag_updates,
    'brand_updates',    v_brand_updates,
    'category_updates', v_category_updates
  );

END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- Execute yetkisi: yalnızca service_role (Next.js server action)
-- ─────────────────────────────────────────────────────────────────────────────

REVOKE EXECUTE ON FUNCTION public.bulk_excel_product_update(JSONB, UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bulk_excel_product_update(JSONB, UUID, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.bulk_excel_product_update(JSONB, UUID, UUID) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.bulk_excel_product_update(JSONB, UUID, UUID) TO service_role;
