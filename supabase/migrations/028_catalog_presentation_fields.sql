-- ─────────────────────────────────────────────────────────────────────────────
-- 028_catalog_presentation_fields.sql
-- Adds presentation/featured fields to brands and categories.
-- Required for homepage featured display and admin catalog management.
-- No client-specific data — all new columns start empty/false.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── brands ───────────────────────────────────────────────────────────────────
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS is_featured  BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS logo_url     TEXT,
  ADD COLUMN IF NOT EXISTS sort_order   INTEGER       NOT NULL DEFAULT 0;

-- ── categories ───────────────────────────────────────────────────────────────
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_featured  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url    TEXT,
  ADD COLUMN IF NOT EXISTS description  TEXT;

-- ── Index for featured queries ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_brands_is_featured     ON public.brands     (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_is_featured ON public.categories (is_featured) WHERE is_featured = true;
