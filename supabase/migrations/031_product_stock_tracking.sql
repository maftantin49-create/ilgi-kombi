-- ─────────────────────────────────────────────────────────────────────────────
-- 031_product_stock_tracking.sql
-- Adds track_stock flag to products.
--
-- Semantics:
--   track_stock = true  (default): stock_quantity is authoritative; product is
--                                   out of stock when stock_quantity <= 0.
--   track_stock = false:            merchant does not track stock; product is
--                                   always available regardless of stock_quantity.
--                                   Maps from WooCommerce manage_stock = false.
--
-- DEFAULT true: all existing products remain fully stock-tracked; no data change.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS track_stock BOOLEAN NOT NULL DEFAULT true;
