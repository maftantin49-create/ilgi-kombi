-- ─────────────────────────────────────────────────────────────────────────────
-- 007_settings_tables.sql
-- public_settings (anon readable) ve system_settings (service_role only)
-- API key, secret key ve database password hiçbir tabloda tutulmaz.
-- Bunlar yalnızca environment variable olarak kalır.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Public ayarlar (frontend'den okunabilir) ───────────────────────────────────
-- Yalnızca açıkça yayınlanabilir değerler: kargo eşiği, para birimi vb.
CREATE TABLE public_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER public_settings_updated_at
  BEFORE UPDATE ON public_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Sistem ayarları (service_role only) ───────────────────────────────────────
-- Feature flag'ler, internal konfigürasyon.
-- API key, secret veya hassas veri saklanmaz.
CREATE TABLE system_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
