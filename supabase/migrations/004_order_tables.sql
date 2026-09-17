-- -----------------------------------------------------------------------------
-- 004_order_tables.sql
-- Siparis numarasi sequence, orders, order_items
-- Bagimlilik: 001_extensions_enums.sql, 003_customer_tables.sql
-- -----------------------------------------------------------------------------

-- Siparis numarasi sequence
-- Concurrency-safe: nextval() transaction-atomic'tir.
-- Gap olabilir (rollback sonrasi) -- normaldir, kabul edilebilir.
-- NO CYCLE: tukenirse hata verir, sessizce tekrar baslamaz.
CREATE SEQUENCE order_number_seq
  START 1000
  INCREMENT 1
  NO CYCLE;

-- Siparisler
-- shipping_address_snapshot / billing_address_snapshot:
--   Siparis anindaki adres verisi JSONB olarak saklanir.
--   Adres sonradan degisse bile siparis kaydi etkilenmez.
CREATE TABLE orders (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number              TEXT        UNIQUE NOT NULL,
  customer_id               UUID        REFERENCES customers(id) ON DELETE SET NULL,
  status                    order_status    NOT NULL DEFAULT 'draft',
  payment_status            payment_status  NOT NULL DEFAULT 'initialized',
  subtotal                  NUMERIC(10,2)   NOT NULL CHECK (subtotal >= 0),
  shipping_fee              NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  discount_total            NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  grand_total               NUMERIC(10,2)   NOT NULL CHECK (grand_total >= 0),
  currency                  CHAR(3)         NOT NULL DEFAULT 'TRY',
  shipping_address_snapshot JSONB           NOT NULL,
  billing_address_snapshot  JSONB,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at                   TIMESTAMPTZ
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Siparis kalemleri
-- Snapshot alanlar: siparis anindaki urun adi ve fiyati saklanir.
-- Urun silinse veya fiyat degisse bile siparis kaydi korunur.
CREATE TABLE order_items (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            UUID         REFERENCES products(id) ON DELETE SET NULL,
  sku_snapshot          TEXT         NOT NULL,
  product_name_snapshot TEXT         NOT NULL,
  unit_price            NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity              INT           NOT NULL CHECK (quantity > 0),
  line_total            NUMERIC(10,2) NOT NULL CHECK (line_total >= 0)
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
