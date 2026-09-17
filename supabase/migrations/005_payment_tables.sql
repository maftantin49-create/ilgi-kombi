-- ─────────────────────────────────────────────────────────────────────────────
-- 005_payment_tables.sql
-- Ödemeler (1:N), stok rezervasyonları, stok hareketleri
-- Bağımlılık: 001_extensions_enums.sql, 002_core_tables.sql, 004_order_tables.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Ödemeler (1 sipariş : N deneme) ──────────────────────────────────────────
--
-- DATA RETENTION POLICY — TODO
-- Veri kategorisi  : Finansal işlem kaydı
-- İşleme amacı     : Ödeme doğrulama, itiraz çözümü, muhasebe
-- Hukuki dayanak   : Ticari Kanun, VUK kayıt yükümlülüğü (taslak)
-- Önerilen süre    : 5–10 yıl (belirlenmedi)
-- ÖNEMLİ          : Saklama süresi ve otomatik silme politikası
--                   hukuk müşaviri ve mali müşavir onayı gerektirmektedir.
--                   Bu migration'a sabit süre kodlanmamıştır.
--
-- sanitized_response içermeyecekler:
--   - Tam kart numarası (PAN), CVV/CVC, 3DS token
--   - HMAC imzası / hash değerleri
--   - Callback URL parametreleri (session içerirse)
-- sanitized_response içerebilecekler:
--   - provider-agnostic: status, errorCode, errorMessage
--   - provider-specific: provider eklendikçe kendi alanlarını belgeler

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  attempt_number      SMALLINT NOT NULL,
  provider            TEXT NOT NULL DEFAULT 'manual',
  provider_payment_id TEXT,
  conversation_id     TEXT UNIQUE NOT NULL,
  token               TEXT,
  status              payment_status NOT NULL DEFAULT 'initialized',
  amount              NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency            CHAR(3) NOT NULL DEFAULT 'TRY',
  installment         SMALLINT,
  sanitized_response  JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,

  CONSTRAINT payments_order_attempt_unique UNIQUE (order_id, attempt_number)
);

-- provider_payment_id: NULL olabilir ama varsa unique
CREATE UNIQUE INDEX payments_provider_payment_id_unique
  ON payments(provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ── Stok rezervasyonları ──────────────────────────────────────────────────────
-- Checkout sırasında stok soft olarak rezerve edilir.
-- available_stock = stock_quantity - SUM(active reservations where expires_at > now())
CREATE TABLE inventory_reservations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  quantity   INT NOT NULL CHECK (quantity > 0),
  status     reservation_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aktif rezervasyon sorguları için kritik index
CREATE INDEX reservations_product_active_idx
  ON inventory_reservations(product_id, status, expires_at)
  WHERE status = 'active';

ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;

-- ── Stok hareketleri ──────────────────────────────────────────────────────────
-- Audit trail: tüm stok değişikliklerinin kalıcı kaydı.
-- INSERT only — UPDATE/DELETE yok.
CREATE TABLE inventory_movements (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  order_id   UUID REFERENCES orders(id) ON DELETE SET NULL,
  type       inventory_movement_type NOT NULL,
  quantity   INT NOT NULL,
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
