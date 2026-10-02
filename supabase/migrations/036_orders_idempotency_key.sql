-- ─────────────────────────────────────────────────────────────────────────────
-- 036_orders_idempotency_key.sql
-- orders.idempotency_key sütununu ve unique index'i production'a ekler.
--
-- Neden gerekli:
--   026_create_pending_order_rpc.sql bu sütunu hem ALTER TABLE hem de yeni
--   function olarak tanımladı. Ancak production'a yalnızca function (034 ile
--   overwrite edilmiş hali) uygulandı; ALTER TABLE hiç çalışmadı.
--   034'teki function INSERT'i idempotency_key kolonuna yazar → column not
--   found → INTERNAL_ERROR.
--
-- Güvenlik garantileri:
--   - ADD COLUMN IF NOT EXISTS → kolon zaten varsa no-op
--   - CREATE UNIQUE INDEX IF NOT EXISTS → index zaten varsa no-op
--   - WHERE idempotency_key IS NOT NULL → partial index: eski NULL kayıtlar
--     etkilenmez, yeni NULL kayıtlar da duplicate olmaz
--   - Mevcut order verisi üzerinde hiçbir UPDATE / DELETE yoktur
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Sütunu ekle ─────────────────────────────────────────────────────────────
-- Nullable: önceden oluşturulmuş siparişler NULL kalır, bu normal.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key UUID;

-- ── 2. Duplicate kontrolü ──────────────────────────────────────────────────────
-- Kolonu henüz eklemediyseniz tüm değerler NULL → duplicate imkânsız.
-- Sütun önceden varsa (beklenmedik durum) şu sorgu non-NULL duplicate'leri raporlar:
--
--   SELECT idempotency_key, COUNT(*)
--   FROM public.orders
--   WHERE idempotency_key IS NOT NULL
--   GROUP BY idempotency_key
--   HAVING COUNT(*) > 1;
--
-- Eğer sonuç dönerse UNIQUE INDEX oluşturma hatası verir — bu kasıtlıdır.

-- ── 3. Unique index ────────────────────────────────────────────────────────────
-- Partial index: NULL değerleri exclude eder.
-- PostgreSQL UNIQUE semantiği: NULL != NULL, ama birden fazla NULL olmasına
-- izin verir; bu nedenle WHERE ile non-NULL satırlar hedeflenir.
-- CREATE UNIQUE INDEX IF NOT EXISTS → idempotent.
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key
  ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
