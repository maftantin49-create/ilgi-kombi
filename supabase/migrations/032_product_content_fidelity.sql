-- ─────────────────────────────────────────────────────────────────────────────
-- 032_product_content_fidelity.sql
-- Adds short_description column to products.
--
-- WooCommerce source data: 172/173 products have a non-empty short_description.
-- The original schema had only `description` (long form). This column preserves
-- the distinct short summary displayed below the product title in WC storefronts.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS short_description TEXT;
