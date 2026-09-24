-- ─────────────────────────────────────────────────────────────────────────────
-- 034_order_rpc_track_stock.sql
-- Update create_pending_order to respect products.track_stock semantics.
--
-- When track_stock = false:
--   - INSUFFICIENT_STOCK check is skipped (product is always orderable)
--   - inventory_reservations INSERT is skipped (no phantom reservations)
--
-- Depends on 031_product_stock_tracking.sql (track_stock column must exist).
-- ─────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.create_pending_order(JSONB, JSONB, JSONB, JSONB, UUID, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION public.create_pending_order(
  p_items              JSONB,
  p_customer           JSONB,
  p_shipping_addr      JSONB,
  p_billing_addr       JSONB    DEFAULT NULL,
  p_idempotency_key    UUID     DEFAULT NULL,
  p_expected_subtotal  NUMERIC  DEFAULT NULL,
  p_notes              TEXT     DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_shipping_cost     NUMERIC(10,2);
  v_free_threshold    NUMERIC(10,2);
  v_reservation_ttl   INT;

  v_customer_id       UUID;
  v_order_id          UUID;
  v_order_number      TEXT;
  v_subtotal          NUMERIC(10,2) := 0;
  v_shipping_fee      NUMERIC(10,2);
  v_grand_total       NUMERIC(10,2);
  v_expires_at        TIMESTAMPTZ;

  v_product           RECORD;
  v_item              RECORD;
  v_reserved          INT;
  v_available         INT;
  v_input_count       INT;
  v_locked_count      INT := 0;
  v_validated_items   JSONB := '[]'::JSONB;

  v_idempotent_row    RECORD;
  v_race_return       JSONB;
BEGIN

  -- ── 1. Konfigürasyon ──────────────────────────────────────────────────────
  SELECT (value #>> '{}')::NUMERIC INTO v_shipping_cost
    FROM public.public_settings WHERE key = 'shipping_cost';
  SELECT (value #>> '{}')::NUMERIC INTO v_free_threshold
    FROM public.public_settings WHERE key = 'free_shipping_threshold';
  SELECT (value #>> '{}')::INT     INTO v_reservation_ttl
    FROM public.public_settings WHERE key = 'reservation_ttl_minutes';

  IF v_shipping_cost IS NULL OR v_free_threshold IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'MISSING_SHIPPING_CONFIG');
  END IF;

  v_reservation_ttl := COALESCE(v_reservation_ttl, 30);

  -- ── 2. İdempotency ────────────────────────────────────────────────────────
  IF p_idempotency_key IS NOT NULL THEN
    SELECT o.id, o.order_number, o.status,
           o.subtotal, o.shipping_fee, o.grand_total
    INTO v_idempotent_row
    FROM public.orders o
    WHERE o.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN jsonb_build_object(
        'ok',           true,
        'idempotent',   true,
        'orderId',      v_idempotent_row.id,
        'orderNumber',  v_idempotent_row.order_number,
        'status',       v_idempotent_row.status,
        'subtotal',     v_idempotent_row.subtotal,
        'shippingFee',  v_idempotent_row.shipping_fee,
        'grandTotal',   v_idempotent_row.grand_total,
        'reservationExpiresAt', (
          SELECT r.expires_at
          FROM public.inventory_reservations r
          WHERE r.order_id = v_idempotent_row.id
            AND r.status   = 'active'::public.reservation_status
          ORDER BY r.expires_at DESC
          LIMIT 1
        )
      );
    END IF;
  END IF;

  -- ── 3. Temel girdi doğrulama ──────────────────────────────────────────────
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'EMPTY_CART');
  END IF;

  IF p_customer IS NULL
     OR lower(trim(COALESCE(p_customer->>'email', ''))) = ''
     OR trim(COALESCE(p_customer->>'firstName', '')) = ''
     OR trim(COALESCE(p_customer->>'lastName', ''))  = ''
  THEN
    RETURN jsonb_build_object('ok', false, 'error', 'CUSTOMER_VALIDATION');
  END IF;

  -- ── 4. Distinct ürün sayısı ───────────────────────────────────────────────
  SELECT COUNT(DISTINCT (val->>'productId')::UUID)
  INTO v_input_count
  FROM jsonb_array_elements(p_items) AS val;

  -- ── 5. Ürünleri kilitle, stok + durum doğrula ─────────────────────────────
  FOR v_product IN
    SELECT
      p.id,
      p.sku,
      p.name,
      p.price,
      p.stock_quantity,
      p.track_stock,
      p.is_active,
      (
        SELECT SUM((val->>'quantity')::INT)
        FROM jsonb_array_elements(p_items) AS val
        WHERE (val->>'productId')::UUID = p.id
      ) AS req_qty
    FROM public.products p
    WHERE p.id IN (
      SELECT DISTINCT (val->>'productId')::UUID
      FROM jsonb_array_elements(p_items) AS val
    )
    ORDER BY p.id
    FOR UPDATE
  LOOP
    v_locked_count := v_locked_count + 1;

    IF v_product.req_qty IS NULL OR v_product.req_qty <= 0 THEN
      RETURN jsonb_build_object(
        'ok', false, 'error', 'INVALID_QUANTITY',
        'productId', v_product.id
      );
    END IF;

    IF NOT v_product.is_active THEN
      RETURN jsonb_build_object(
        'ok', false, 'error', 'INACTIVE_PRODUCT',
        'productId', v_product.id
      );
    END IF;

    IF v_product.price <= 0 THEN
      RETURN jsonb_build_object(
        'ok', false, 'error', 'PRICE_UNAVAILABLE',
        'productId', v_product.id
      );
    END IF;

    -- Stock check: only for tracked products
    IF v_product.track_stock THEN
      SELECT COALESCE(SUM(r.quantity), 0)
      INTO v_reserved
      FROM public.inventory_reservations r
      WHERE r.product_id = v_product.id
        AND r.status     = 'active'::public.reservation_status
        AND r.expires_at > now();

      v_available := v_product.stock_quantity - v_reserved;

      IF v_available < v_product.req_qty THEN
        RETURN jsonb_build_object(
          'ok',        false,
          'error',     'INSUFFICIENT_STOCK',
          'productId', v_product.id,
          'available', v_available,
          'requested', v_product.req_qty
        );
      END IF;
    END IF;

    v_subtotal        := v_subtotal + (v_product.price * v_product.req_qty);
    v_validated_items := v_validated_items || jsonb_build_array(
      jsonb_build_object(
        'productId',  v_product.id,
        'sku',        v_product.sku,
        'name',       v_product.name,
        'price',      v_product.price,
        'qty',        v_product.req_qty,
        'lineTotal',  v_product.price * v_product.req_qty,
        'trackStock', v_product.track_stock
      )
    );
  END LOOP;

  -- ── 6. Tüm ürünler bulundu mu? ───────────────────────────────────────────
  IF v_locked_count < v_input_count THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PRODUCT_NOT_FOUND');
  END IF;

  -- ── 7. Fiyat değişikliği tespiti ─────────────────────────────────────────
  IF p_expected_subtotal IS NOT NULL
     AND abs(v_subtotal - p_expected_subtotal) > 0.01
  THEN
    RETURN jsonb_build_object(
      'ok',              false,
      'error',           'PRICE_CHANGED',
      'serverSubtotal',  v_subtotal,
      'expectedSubtotal', p_expected_subtotal
    );
  END IF;

  -- ── 8. Kargo ücreti ───────────────────────────────────────────────────────
  v_shipping_fee := CASE WHEN v_subtotal >= v_free_threshold THEN 0 ELSE v_shipping_cost END;
  v_grand_total  := v_subtotal + v_shipping_fee;
  v_expires_at   := now() + v_reservation_ttl * INTERVAL '1 minute';

  -- ── 9. Müşteri upsert ─────────────────────────────────────────────────────
  INSERT INTO public.customers (
    email, first_name, last_name, phone, is_guest, created_at, updated_at
  )
  VALUES (
    lower(trim(p_customer->>'email')),
    trim(p_customer->>'firstName'),
    trim(p_customer->>'lastName'),
    trim(COALESCE(p_customer->>'phone', '')),
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name  = EXCLUDED.last_name,
    phone      = EXCLUDED.phone,
    updated_at = now()
  RETURNING id INTO v_customer_id;

  -- ── 10. Sipariş oluştur ───────────────────────────────────────────────────
  v_order_id     := gen_random_uuid();
  v_order_number := public.generate_order_number();

  INSERT INTO public.orders (
    id, order_number, customer_id, status, payment_status,
    subtotal, shipping_fee, discount_total, grand_total,
    currency, shipping_address_snapshot, billing_address_snapshot,
    notes, idempotency_key
  ) VALUES (
    v_order_id, v_order_number, v_customer_id,
    'pending_payment'::public.order_status,
    'initialized'::public.payment_status,
    v_subtotal, v_shipping_fee, 0, v_grand_total,
    'TRY', p_shipping_addr, p_billing_addr,
    p_notes, p_idempotency_key
  );

  -- ── 11. Sipariş kalemleri + rezervasyonlar ────────────────────────────────
  -- Reservation is skipped for untracked products (track_stock = false).
  FOR v_item IN
    SELECT
      (elem->>'productId')::UUID     AS product_id,
      elem->>'sku'                   AS sku,
      elem->>'name'                  AS name,
      (elem->>'price')::NUMERIC      AS price,
      (elem->>'qty')::INT            AS qty,
      (elem->>'lineTotal')::NUMERIC  AS line_total,
      (elem->>'trackStock')::BOOLEAN AS track_stock
    FROM jsonb_array_elements(v_validated_items) AS elem
  LOOP
    INSERT INTO public.order_items (
      order_id, product_id, sku_snapshot, product_name_snapshot,
      unit_price, quantity, line_total
    ) VALUES (
      v_order_id, v_item.product_id, v_item.sku, v_item.name,
      v_item.price, v_item.qty, v_item.line_total
    );

    IF v_item.track_stock THEN
      INSERT INTO public.inventory_reservations (
        product_id, order_id, quantity, status, expires_at
      ) VALUES (
        v_item.product_id, v_order_id, v_item.qty,
        'active'::public.reservation_status,
        v_expires_at
      );
    END IF;
  END LOOP;

  -- ── 12. Başarı ────────────────────────────────────────────────────────────
  RETURN jsonb_build_object(
    'ok',                   true,
    'idempotent',           false,
    'orderId',              v_order_id,
    'orderNumber',          v_order_number,
    'status',               'pending_payment',
    'subtotal',             v_subtotal,
    'shippingFee',          v_shipping_fee,
    'grandTotal',           v_grand_total,
    'reservationExpiresAt', v_expires_at
  );

EXCEPTION
  WHEN unique_violation THEN
    IF p_idempotency_key IS NOT NULL THEN
      SELECT jsonb_build_object(
        'ok',          true,
        'idempotent',  true,
        'orderId',     o.id,
        'orderNumber', o.order_number,
        'status',      o.status,
        'subtotal',    o.subtotal,
        'shippingFee', o.shipping_fee,
        'grandTotal',  o.grand_total,
        'reservationExpiresAt', (
          SELECT r.expires_at FROM public.inventory_reservations r
          WHERE r.order_id = o.id AND r.status = 'active'::public.reservation_status
          ORDER BY r.expires_at DESC LIMIT 1
        )
      )
      INTO v_race_return
      FROM public.orders o
      WHERE o.idempotency_key = p_idempotency_key;

      IF v_race_return IS NOT NULL THEN
        RETURN v_race_return;
      END IF;
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'DUPLICATE_REQUEST');

  WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'error', 'INTERNAL_ERROR');
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_pending_order(JSONB, JSONB, JSONB, JSONB, UUID, NUMERIC, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_pending_order(JSONB, JSONB, JSONB, JSONB, UUID, NUMERIC, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_pending_order(JSONB, JSONB, JSONB, JSONB, UUID, NUMERIC, TEXT) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.create_pending_order(JSONB, JSONB, JSONB, JSONB, UUID, NUMERIC, TEXT) TO service_role;
