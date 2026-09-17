-- ─────────────────────────────────────────────────────────────────────────────
-- 019_product_oem_codes.sql
-- OEM / cross-reference codes for products.
-- code_norm is auto-maintained by trigger: UPPER(TRIM + strip separators).
-- UNIQUE(product_id, code_norm) prevents duplicate normalized codes per product.
-- code_norm index includes product_id for index-only scan on OEM search.
-- ─────────────────────────────────────────────────────────────────────────────

-- Rollback:
-- DROP TRIGGER IF EXISTS trg_oem_code_normalize ON public.product_oem_codes;
-- DROP FUNCTION IF EXISTS public.fn_normalize_oem_code();
-- DROP TABLE IF EXISTS public.product_oem_codes;

CREATE TABLE public.product_oem_codes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  code          TEXT        NOT NULL CHECK (char_length(code) BETWEEN 1 AND 100),
  code_norm     TEXT        NOT NULL CHECK (char_length(code_norm) BETWEEN 1 AND 100),
  manufacturer  TEXT        CHECK (char_length(manufacturer) <= 100),
  note          TEXT        CHECK (char_length(note) <= 500),
  sort_order    SMALLINT    NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT product_oem_codes_product_norm_unique UNIQUE (product_id, code_norm)
);

CREATE INDEX product_oem_product_idx ON public.product_oem_codes(product_id);
-- INCLUDE (product_id) enables index-only scan for product search via OEM
CREATE INDEX product_oem_norm_idx ON public.product_oem_codes(code_norm) INCLUDE (product_id);

-- ── Normalization trigger ─────────────────────────────────────────────────────
-- Algorithm: TRIM → strip spaces, hyphens, dots, slashes → UPPER
-- "0 281 002 507" → "0281002507", "VU 202/5-5" → "VU20255"
CREATE OR REPLACE FUNCTION public.fn_normalize_oem_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.code_norm := UPPER(REGEXP_REPLACE(TRIM(NEW.code), '[\s\-\./]', '', 'g'));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_oem_code_normalize
  BEFORE INSERT OR UPDATE ON public.product_oem_codes
  FOR EACH ROW EXECUTE FUNCTION public.fn_normalize_oem_code();

ALTER TABLE public.product_oem_codes ENABLE ROW LEVEL SECURITY;
-- No explicit policies: service_role bypasses RLS; anon/authenticated get implicit DENY.
