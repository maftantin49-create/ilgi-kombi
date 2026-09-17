-- ─────────────────────────────────────────────────────────────────────────────
-- 011_seed_static.sql
-- Critical public_settings keys required by checkout RPC (create_pending_order).
-- These are technical defaults — NOT store config.
-- Store config (company, seo, social, mail) is seeded in 013_settings_seed.sql.
-- Catalog data (brands, categories, products) is loaded separately via admin CRUD
-- or scripts/seed-catalog.ts — NEVER via migrations.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public_settings (key, value) VALUES
  ('free_shipping_threshold', '500'),
  ('shipping_cost',           '49.90'),
  ('currency',                '"TRY"'),
  ('reservation_ttl_minutes', '30'),
  ('max_cart_quantity',       '10')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
