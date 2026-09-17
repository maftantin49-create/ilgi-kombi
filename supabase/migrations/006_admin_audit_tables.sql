-- ─────────────────────────────────────────────────────────────────────────────
-- 006_admin_audit_tables.sql
-- Admin profilleri ve audit log
-- Bağımlılık: 001_extensions_enums.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Admin profilleri ──────────────────────────────────────────────────────────
-- auth.users ile 1:1 ilişki.
-- Admin kullanıcısı Supabase Dashboard'dan manuel oluşturulur.
-- Rol atama ve is_active yönetimi service_role üzerinden yapılır.
CREATE TABLE admin_profiles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         admin_role NOT NULL DEFAULT 'staff',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- ── Audit log ─────────────────────────────────────────────────────────────────
-- Kritik admin işlemlerinin değiştirilemez kaydı.
-- INSERT only — UPDATE/DELETE yok.
-- metadata: entity referansları ve durum değişiklikleri.
-- KESİNLİKLE metadata'ya: email, telefon, adres, kart verisi YAZILMAZ.
-- Yalnızca entity_id referansı ve durum geçişleri kaydedilir.
CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     UUID,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
