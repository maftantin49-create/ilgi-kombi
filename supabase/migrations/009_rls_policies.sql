-- -----------------------------------------------------------------------------
-- 009_rls_policies.sql
-- Tum RLS politikalari -- granular, her islem ayri
-- service_role Supabase'in default davranisiyla hicbir kisita tabi degildir.
-- Her CREATE POLICY oncesinde DROP IF EXISTS -- idempotent calistirma icin
-- -----------------------------------------------------------------------------

-- brands
DROP POLICY IF EXISTS "brands_public_select" ON brands;
CREATE POLICY "brands_public_select"
  ON brands FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
-- INSERT/UPDATE/DELETE: service_role only (politika yok = reddedilir)

-- categories
DROP POLICY IF EXISTS "categories_public_select" ON categories;
CREATE POLICY "categories_public_select"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- products
DROP POLICY IF EXISTS "products_public_select" ON products;
CREATE POLICY "products_public_select"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- customers
-- Authenticated: kendi kaydini okur
DROP POLICY IF EXISTS "customers_select_own" ON customers;
CREATE POLICY "customers_select_own"
  ON customers FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Authenticated: yalnizca kendi auth_user_id ile kayit olusturabilir
DROP POLICY IF EXISTS "customers_insert_own" ON customers;
CREATE POLICY "customers_insert_own"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

-- Authenticated: kendi kaydini gunceller -- auth_user_id degistirilemez
DROP POLICY IF EXISTS "customers_update_own" ON customers;
CREATE POLICY "customers_update_own"
  ON customers FOR UPDATE
  TO authenticated
  USING    (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- DELETE: service_role only (KVKK silme talebi -- service katmanindan)
-- Anon: erisim yok (politika tanimlanmadi)

-- addresses
DROP POLICY IF EXISTS "addresses_select_own" ON addresses;
CREATE POLICY "addresses_select_own"
  ON addresses FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "addresses_insert_own" ON addresses;
CREATE POLICY "addresses_insert_own"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- customer_id degistirilemez -- USING ve WITH CHECK ayni kosulu zorlar
DROP POLICY IF EXISTS "addresses_update_own" ON addresses;
CREATE POLICY "addresses_update_own"
  ON addresses FOR UPDATE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "addresses_delete_own" ON addresses;
CREATE POLICY "addresses_delete_own"
  ON addresses FOR DELETE
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- orders
-- Authenticated: kendi siparislerini gorur
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own"
  ON orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE auth_user_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE: service_role only
-- Anon: erisim yok

-- order_items
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE: service_role only

-- payments
-- Authenticated: kendi odemelerini gorur (durum takibi icin)
DROP POLICY IF EXISTS "payments_select_own" ON payments;
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- INSERT/UPDATE/DELETE: service_role only
-- Anon: erisim yok

-- inventory_reservations: politika yok = service_role disinda tum erisim reddedilir
-- inventory_movements:    politika yok = service_role disinda tum erisim reddedilir
-- audit_logs:             politika yok = service_role disinda tum erisim reddedilir
-- system_settings:        politika yok = service_role disinda tum erisim reddedilir

-- admin_profiles
DROP POLICY IF EXISTS "admin_profiles_select_own" ON admin_profiles;
CREATE POLICY "admin_profiles_select_own"
  ON admin_profiles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- INSERT/UPDATE/DELETE: service_role only

-- public_settings
DROP POLICY IF EXISTS "public_settings_select_all" ON public_settings;
CREATE POLICY "public_settings_select_all"
  ON public_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT/UPDATE/DELETE: service_role only
