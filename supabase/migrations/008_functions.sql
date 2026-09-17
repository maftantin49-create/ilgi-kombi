-- ─────────────────────────────────────────────────────────────────────────────
-- 008_functions.sql
-- DB fonksiyonları: sipariş numarası, atomic checkout, ödeme denemesi
-- Bağımlılık: tüm önceki migration'lar
-- ─────────────────────────────────────────────────────────────────────────────

-- ── generate_order_number() ───────────────────────────────────────────────────
-- Concurrency-safe sipariş numarası üretimi.
-- nextval() transaction-atomic — iki eşzamanlı çağrı asla aynı numarayı almaz.
-- Gap olabilir (rollback sonrası) — normaldir.
-- Çıktı örneği: ORD-20260807-01000
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'ORD-' ||
    TO_CHAR(now() AT TIME ZONE 'Europe/Istanbul', 'YYYYMMDD') ||
    '-' ||
    LPAD(nextval('order_number_seq')::TEXT, 5, '0');
END;
$$;

REVOKE EXECUTE ON FUNCTION generate_order_number() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION generate_order_number() FROM anon;
REVOKE EXECUTE ON FUNCTION generate_order_number() FROM authenticated;
GRANT  EXECUTE ON FUNCTION generate_order_number() TO service_role;

-- ── create_order_atomic() ─────────────────────────────────────────────────────
-- Stok kontrolü + rezervasyon + sipariş oluşturma tek transaction.
-- Kargo ücreti client'tan kabul edilmez — public_settings'ten okunur.
-- Fiyatlar DB'deki products.price'dan alınır, client'tan gelen fiyat reddedilir.
--
-- p_items: [{"product_id": "uuid", "quantity": 2}, ...]
-- p_customer_id: auth kullanıcıysa UUID, misafir checkout'ta NULL
-- p_shipping_addr: JSONB — teslimat adresi snapshot
-- p_billing_addr: JSONB | null — fatura adresi snapshot
--
-- Dönüş: {"order_id": "uuid", "order_number": "ORD-...", "grand_total": 1299.80}
-- Hata: EXCEPTION fırlatır — uygulama katmanı yakalar
CREATE OR REPLACE FUNCTION create_order_atomic(
  p_items         JSONB,
  p_customer_id   UUID,
  p_shipping_addr JSONB,
  p_billing_addr  JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id        UUID;
  v_order_number    TEXT;
  v_subtotal        NUMERIC(10,2) := 0;
  v_shipping_fee    NUMERIC(10,2);
  v_free_threshold  NUMERIC(10,2);
  v_grand_total     NUMERIC(10,2);
  v_item            JSONB;
  v_product_id      UUID;
  v_quantity        INT;
  v_product         RECORD;
  v_available       INT;
BEGIN
  -- 1. Kargo ücretini public_settings'ten oku
  -- #>> '{}': JSONB root'u text olarak çeker — hem numeric hem string JSONB'de güvenli
  SELECT (value #>> '{}')::NUMERIC INTO v_shipping_fee
    FROM public_settings WHERE key = 'shipping_cost';
  SELECT (value #>> '{}')::NUMERIC INTO v_free_threshold
    FROM public_settings WHERE key = 'free_shipping_threshold';

  IF v_shipping_fee IS NULL OR v_free_threshold IS NULL THEN
    RAISE EXCEPTION 'MISSING_SHIPPING_CONFIG';
  END IF;

  -- 2. Her ürün için stok kontrolü (FOR UPDATE: concurrent checkout serialize)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY:%', v_product_id;
    END IF;

    SELECT
      p.id,
      p.sku,
      p.name,
      p.price,
      p.stock_quantity - COALESCE(
        (
          SELECT SUM(r.quantity)
          FROM inventory_reservations r
          WHERE r.product_id = p.id
            AND r.status = 'active'
            AND r.expires_at > now()
        ), 0
      ) AS available
    INTO v_product
    FROM products p
    WHERE p.id = v_product_id
      AND p.is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'PRODUCT_NOT_FOUND:%', v_product_id;
    END IF;

    IF v_product.available < v_quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', v_product.sku;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  END LOOP;

  -- 3. Kargo ücretini hesapla
  v_shipping_fee  := CASE WHEN v_subtotal >= v_free_threshold THEN 0 ELSE v_shipping_fee END;
  v_grand_total   := v_subtotal + v_shipping_fee;

  -- 4. Sipariş numarası üret ve siparişi oluştur
  v_order_number := generate_order_number();

  INSERT INTO orders (
    order_number, customer_id, status, payment_status,
    subtotal, shipping_fee, grand_total,
    shipping_address_snapshot, billing_address_snapshot
  )
  VALUES (
    v_order_number, p_customer_id, 'pending_payment', 'initialized',
    v_subtotal, v_shipping_fee, v_grand_total,
    p_shipping_addr, p_billing_addr
  )
  RETURNING id INTO v_order_id;

  -- 5. Sipariş kalemleri + rezervasyonlar
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity   := (v_item->>'quantity')::INT;

    SELECT p.id, p.sku, p.name, p.price
    INTO v_product
    FROM products p
    WHERE p.id = v_product_id;

    INSERT INTO order_items (
      order_id, product_id, sku_snapshot, product_name_snapshot,
      unit_price, quantity, line_total
    )
    VALUES (
      v_order_id, v_product.id, v_product.sku, v_product.name,
      v_product.price, v_quantity, v_product.price * v_quantity
    );

    INSERT INTO inventory_reservations (product_id, order_id, quantity)
    VALUES (v_product.id, v_order_id, v_quantity);
  END LOOP;

  RETURN jsonb_build_object(
    'order_id',     v_order_id,
    'order_number', v_order_number,
    'subtotal',     v_subtotal,
    'shipping_fee', v_shipping_fee,
    'grand_total',  v_grand_total
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION create_order_atomic(JSONB, UUID, JSONB, JSONB) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION create_order_atomic(JSONB, UUID, JSONB, JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION create_order_atomic(JSONB, UUID, JSONB, JSONB) FROM authenticated;
GRANT  EXECUTE ON FUNCTION create_order_atomic(JSONB, UUID, JSONB, JSONB) TO service_role;

-- ── create_payment_attempt() ──────────────────────────────────────────────────
-- Yeni ödeme denemesi oluşturma.
-- orders satırını FOR UPDATE ile kilitler, aynı transaction içinde
-- MAX(attempt_number)+1 hesaplar ve payments'a INSERT eder.
-- attempt_number üretimi uygulama katmanında yapılmaz.
--
-- Dönüş: {"payment_id": "uuid", "attempt_number": 1}
-- Hata: EXCEPTION fırlatır
CREATE OR REPLACE FUNCTION create_payment_attempt(
  p_order_id        UUID,
  p_conversation_id TEXT,
  p_amount          NUMERIC(10,2),
  p_provider        TEXT DEFAULT 'manual'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order          RECORD;
  v_attempt_number SMALLINT;
  v_payment_id     UUID;
BEGIN
  -- Siparişi kilitle — concurrent deneme oluşturmayı serialize et
  SELECT id, status, payment_status, grand_total
  INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND:%', p_order_id;
  END IF;

  -- Yalnızca pending_payment statüsündeki siparişler yeni deneme alabilir
  IF v_order.status NOT IN ('pending_payment') THEN
    RAISE EXCEPTION 'ORDER_NOT_PAYABLE:%:%', p_order_id, v_order.status;
  END IF;

  -- Tutarı server-side doğrula
  IF p_amount <> v_order.grand_total THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH:expected=% got=%', v_order.grand_total, p_amount;
  END IF;

  -- attempt_number: DB'deki MAX + 1 (transaction içinde, race condition yok)
  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO v_attempt_number
  FROM payments
  WHERE order_id = p_order_id;

  INSERT INTO payments (
    order_id, attempt_number, provider,
    conversation_id, status, amount, currency
  )
  VALUES (
    p_order_id, v_attempt_number, p_provider,
    p_conversation_id, 'initialized', p_amount, 'TRY'
  )
  RETURNING id INTO v_payment_id;

  RETURN jsonb_build_object(
    'payment_id',     v_payment_id,
    'attempt_number', v_attempt_number
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION create_payment_attempt(UUID, TEXT, NUMERIC, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION create_payment_attempt(UUID, TEXT, NUMERIC, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION create_payment_attempt(UUID, TEXT, NUMERIC, TEXT) FROM authenticated;
GRANT  EXECUTE ON FUNCTION create_payment_attempt(UUID, TEXT, NUMERIC, TEXT) TO service_role;
