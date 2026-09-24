-- ─────────────────────────────────────────────────────────────────────────────
-- 029_catalog_seo_fields.sql
-- Add nullable SEO metadata columns to products, categories, brands.
-- No default value; no seed data. Will be populated during WooCommerce import.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_title       TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS seo_title       TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS seo_title       TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT;
