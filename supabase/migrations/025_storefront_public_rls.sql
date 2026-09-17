-- ─────────────────────────────────────────────────────────────────────────────
-- 025_storefront_public_rls.sql
-- Public SELECT policies for storefront product detail tables.
--
-- Scope:
--   Five tables created in migrations 018–021 had RLS enabled but no explicit
--   policies, leaving anon and authenticated with implicit DENY on all operations.
--   This migration adds the minimum SELECT policies required for the public
--   storefront to read product detail data via the publishable (anon) client.
--
-- Security model:
--   - Only data linked to an is_active=true product is exposed.
--   - device_models additionally requires at least one active product relation;
--     the full device catalog is never exposed to anon.
--   - Write access (INSERT/UPDATE/DELETE) remains service_role only — no write
--     policies are created here.
--   - service_role bypasses RLS; admin gallery/OEM/spec/device flows are unaffected.
--
-- Idempotency:
--   DROP POLICY IF EXISTS before each CREATE POLICY — safe to re-run.
--   No table drops. No data changes.
--
-- Index coverage (all EXISTS predicates use existing indexes):
--   products.id                     → PRIMARY KEY
--   product_images.product_id       → product_images_product_sort_idx (018)
--   product_oem_codes.product_id    → product_oem_product_idx (019)
--   product_specifications.product_id → product_specs_product_idx (020)
--   product_device_models.product_id  → pdm_product_idx (021)
--   product_device_models.device_model_id → pdm_device_idx (021)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── product_images ────────────────────────────────────────────────────────────
-- Readable only when the parent product is active.
-- storage_path is included in SELECT (needed by PostgREST) but the storefront
-- query layer must select only: id, url, alt_text, sort_order.
DROP POLICY IF EXISTS "product_images_public_select" ON public.product_images;
CREATE POLICY "product_images_public_select"
  ON public.product_images FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_images.product_id
        AND p.is_active = true
    )
  );

-- ── product_oem_codes ─────────────────────────────────────────────────────────
-- Readable only when the parent product is active.
-- code_norm is internal (normalization artifact); storefront selects code,
-- manufacturer, sort_order only.
DROP POLICY IF EXISTS "product_oem_codes_public_select" ON public.product_oem_codes;
CREATE POLICY "product_oem_codes_public_select"
  ON public.product_oem_codes FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_oem_codes.product_id
        AND p.is_active = true
    )
  );

-- ── product_specifications ────────────────────────────────────────────────────
-- Readable only when the parent product is active.
-- spec_key_norm is internal; storefront selects spec_key, spec_value, unit,
-- sort_order only.
DROP POLICY IF EXISTS "product_specifications_public_select" ON public.product_specifications;
CREATE POLICY "product_specifications_public_select"
  ON public.product_specifications FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_specifications.product_id
        AND p.is_active = true
    )
  );

-- ── product_device_models ─────────────────────────────────────────────────────
-- Readable only when the parent product is active.
-- Junction table: storefront reads this to reach device_models via embed.
DROP POLICY IF EXISTS "product_device_models_public_select" ON public.product_device_models;
CREATE POLICY "product_device_models_public_select"
  ON public.product_device_models FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.products p
      WHERE p.id = product_device_models.product_id
        AND p.is_active = true
    )
  );

-- ── device_models ─────────────────────────────────────────────────────────────
-- Two-condition guard:
--   1. The model itself must be active (is_active = true).
--   2. It must be linked to at least one active product.
-- Condition 2 prevents the full device catalog from becoming a public API.
-- A device model that exists but has no active product association is not visible.
--
-- brands embedded from device_models (brand_id FK) are filtered by the existing
-- "brands_public_select" policy (is_active = true) — inactive brands cannot
-- surface through this path.
DROP POLICY IF EXISTS "device_models_public_select" ON public.device_models;
CREATE POLICY "device_models_public_select"
  ON public.device_models FOR SELECT
  TO anon, authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1
      FROM public.product_device_models pdm
      JOIN public.products p ON p.id = pdm.product_id
      WHERE pdm.device_model_id = device_models.id
        AND p.is_active = true
    )
  );
