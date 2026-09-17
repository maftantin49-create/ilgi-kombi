-- ─────────────────────────────────────────────────────────────────────────────
-- 020_product_specifications.sql
-- Key-value technical specifications per product.
-- spec_key_norm is auto-maintained by trigger: LOWER(TRIM(spec_key)).
-- Uniqueness is on (product_id, spec_key_norm) so:
--   "Voltaj", " voltaj ", "VOLTAJ" → all normalize to "voltaj" → treated as same.
-- unit is optional (nullable). spec_value is the display string.
-- ─────────────────────────────────────────────────────────────────────────────

-- Rollback:
-- DROP TRIGGER IF EXISTS trg_spec_key_normalize ON public.product_specifications;
-- DROP FUNCTION IF EXISTS public.fn_normalize_spec_key();
-- DROP TABLE IF EXISTS public.product_specifications;

CREATE TABLE public.product_specifications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  spec_key      TEXT        NOT NULL CHECK (char_length(spec_key) BETWEEN 1 AND 100),
  spec_key_norm TEXT        NOT NULL CHECK (char_length(spec_key_norm) BETWEEN 1 AND 100),
  spec_value    TEXT        NOT NULL CHECK (char_length(spec_value) BETWEEN 1 AND 500),
  unit          TEXT        CHECK (char_length(unit) <= 30),
  sort_order    SMALLINT    NOT NULL DEFAULT 0,
  CONSTRAINT product_specs_key_unique UNIQUE (product_id, spec_key_norm)
);

CREATE INDEX product_specs_product_idx ON public.product_specifications(product_id);

-- ── Normalization trigger ─────────────────────────────────────────────────────
-- Algorithm: TRIM → LOWER (spaces preserved, only case+leading/trailing normalized)
-- "Voltaj" → "voltaj", " VOLTAJ " → "voltaj", "Çalışma Sıcaklığı" → "çalışma sıcaklığı"
CREATE OR REPLACE FUNCTION public.fn_normalize_spec_key()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.spec_key_norm := LOWER(TRIM(NEW.spec_key));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_spec_key_normalize
  BEFORE INSERT OR UPDATE ON public.product_specifications
  FOR EACH ROW EXECUTE FUNCTION public.fn_normalize_spec_key();

ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
-- No explicit policies: service_role bypasses RLS; anon/authenticated get implicit DENY.
