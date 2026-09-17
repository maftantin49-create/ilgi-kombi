-- -----------------------------------------------------------------------------
-- 003_customer_tables.sql
-- Musteri ve adres tablolari
-- Bagimlilik: 002_core_tables.sql (set_updated_at fonksiyonu)
-- -----------------------------------------------------------------------------

-- Musteriler
CREATE TABLE customers (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id       UUID        UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  email              TEXT        UNIQUE,
  phone              TEXT,
  first_name         TEXT        NOT NULL,
  last_name          TEXT        NOT NULL,
  company_name       TEXT,
  tax_number         TEXT,
  is_guest           BOOLEAN     NOT NULL DEFAULT true,
  marketing_consent  BOOLEAN     NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Musteri adresleri
CREATE TABLE addresses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  first_name   TEXT        NOT NULL,
  last_name    TEXT        NOT NULL,
  phone        TEXT,
  city         TEXT        NOT NULL,
  district     TEXT        NOT NULL,
  neighborhood TEXT,
  address_line TEXT        NOT NULL,
  postal_code  TEXT,
  is_default   BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
