-- ─────────────────────────────────────────────────────────────────────────────
-- 021_device_models.sql
-- Device/equipment model catalog (heating, HVAC, etc.)
-- brand_id references public.brands (source of truth for manufacturer names).
-- model_norm auto-maintained: UPPER + collapse whitespace.
-- UNIQUE(brand_id, model_norm) prevents duplicate models per brand.
-- pg_trgm + GIN index on model_norm enables fast ILIKE '%query%' search at scale.
-- product_device_models is the M:N junction between products and device_models.
-- ─────────────────────────────────────────────────────────────────────────────

-- Rollback:
-- DROP TABLE IF EXISTS public.product_device_models;
-- DROP TRIGGER IF EXISTS trg_device_model_normalize ON public.device_models;
-- DROP FUNCTION IF EXISTS public.fn_normalize_device_model();
-- DROP TABLE IF EXISTS public.device_models;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Device model catalog ──────────────────────────────────────────────────────
CREATE TABLE public.device_models (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    UUID        NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
  family      TEXT        CHECK (char_length(family) <= 100),
  series      TEXT        CHECK (char_length(series) <= 100),
  model       TEXT        NOT NULL CHECK (char_length(model) BETWEEN 1 AND 200),
  model_norm  TEXT        NOT NULL CHECK (char_length(model_norm) BETWEEN 1 AND 200),
  category    TEXT        CHECK (char_length(category) <= 50),
  year_from   SMALLINT    CHECK (year_from BETWEEN 1990 AND 2100),
  year_to     SMALLINT    CHECK (year_to BETWEEN 1990 AND 2100),
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT device_models_brand_model_unique UNIQUE (brand_id, model_norm),
  CONSTRAINT device_models_year_order CHECK (
    year_to IS NULL OR year_from IS NULL OR year_to >= year_from
  )
);

CREATE INDEX device_models_brand_idx ON public.device_models(brand_id);
-- GIN trigram index: enables fast ILIKE '%query%' search at 50k+ models
CREATE INDEX device_models_norm_trgm ON public.device_models USING gin(model_norm gin_trgm_ops);
-- Partial index for active-only queries
CREATE INDEX device_models_active_idx ON public.device_models(brand_id, model_norm) WHERE is_active;

-- ── Model normalization trigger ───────────────────────────────────────────────
-- Algorithm: TRIM → collapse multiple spaces to single → UPPER
-- "ecoTEC Plus  VU 20/5-5" → "ECOTEC PLUS VU 20/5-5" (spaces preserved, uppercased)
CREATE OR REPLACE FUNCTION public.fn_normalize_device_model()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.model_norm := UPPER(REGEXP_REPLACE(TRIM(NEW.model), '\s+', ' ', 'g'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_device_model_normalize
  BEFORE INSERT OR UPDATE ON public.device_models
  FOR EACH ROW EXECUTE FUNCTION public.fn_normalize_device_model();

ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;
-- No explicit policies: service_role bypasses RLS; anon/authenticated get implicit DENY.

-- ── Product ↔ Device model junction ──────────────────────────────────────────
CREATE TABLE public.product_device_models (
  product_id      UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  device_model_id UUID        NOT NULL REFERENCES public.device_models(id) ON DELETE CASCADE,
  note            TEXT        CHECK (char_length(note) <= 500),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, device_model_id)
);

CREATE INDEX pdm_device_idx  ON public.product_device_models(device_model_id);
CREATE INDEX pdm_product_idx ON public.product_device_models(product_id);

ALTER TABLE public.product_device_models ENABLE ROW LEVEL SECURITY;
-- No explicit policies: service_role bypasses RLS; anon/authenticated get implicit DENY.
