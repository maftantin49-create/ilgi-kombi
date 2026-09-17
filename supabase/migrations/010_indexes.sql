-- ─────────────────────────────────────────────────────────────────────────────
-- 010_indexes.sql
-- Performans ve sorgu indeksleri
-- ─────────────────────────────────────────────────────────────────────────────

-- ── products ──────────────────────────────────────────────────────────────────
CREATE INDEX products_category_id_idx  ON products(category_id) WHERE is_active = true;
CREATE INDEX products_brand_id_idx     ON products(brand_id)    WHERE is_active = true;
CREATE INDEX products_is_featured_idx  ON products(is_featured)  WHERE is_active = true AND is_featured = true;
CREATE INDEX products_is_new_idx       ON products(is_new)       WHERE is_active = true AND is_new = true;
CREATE INDEX products_sku_idx          ON products(sku);

-- ── categories ────────────────────────────────────────────────────────────────
CREATE INDEX categories_parent_id_idx ON categories(parent_id);

-- ── customers ─────────────────────────────────────────────────────────────────
CREATE INDEX customers_auth_user_id_idx ON customers(auth_user_id);
CREATE INDEX customers_email_idx        ON customers(email);

-- ── addresses ─────────────────────────────────────────────────────────────────
CREATE INDEX addresses_customer_id_idx ON addresses(customer_id);

-- ── orders ────────────────────────────────────────────────────────────────────
CREATE INDEX orders_customer_id_idx    ON orders(customer_id);
CREATE INDEX orders_status_idx         ON orders(status);
CREATE INDEX orders_created_at_idx     ON orders(created_at DESC);

-- ── order_items ───────────────────────────────────────────────────────────────
CREATE INDEX order_items_order_id_idx   ON order_items(order_id);
CREATE INDEX order_items_product_id_idx ON order_items(product_id);

-- ── payments ──────────────────────────────────────────────────────────────────
CREATE INDEX payments_order_id_idx         ON payments(order_id);
CREATE INDEX payments_conversation_id_idx  ON payments(conversation_id);
CREATE INDEX payments_status_idx           ON payments(status);
-- provider_payment_id unique index 005_payment_tables.sql içinde tanımlandı

-- ── inventory_reservations ────────────────────────────────────────────────────
-- Partial index 005_payment_tables.sql içinde tanımlandı (active status için)
CREATE INDEX reservations_order_id_idx     ON inventory_reservations(order_id);
CREATE INDEX reservations_expires_at_idx   ON inventory_reservations(expires_at)
  WHERE status = 'active';

-- ── inventory_movements ───────────────────────────────────────────────────────
CREATE INDEX movements_product_id_idx ON inventory_movements(product_id);
CREATE INDEX movements_order_id_idx   ON inventory_movements(order_id);

-- ── audit_logs ────────────────────────────────────────────────────────────────
CREATE INDEX audit_logs_entity_idx     ON audit_logs(entity_type, entity_id);
CREATE INDEX audit_logs_actor_idx      ON audit_logs(actor_user_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at DESC);

-- ── admin_profiles ────────────────────────────────────────────────────────────
CREATE INDEX admin_profiles_auth_user_id_idx ON admin_profiles(auth_user_id);
