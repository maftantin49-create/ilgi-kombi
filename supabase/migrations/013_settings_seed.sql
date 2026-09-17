-- ─────────────────────────────────────────────────────────────────────────────
-- 013_settings_seed.sql
-- public_settings JSONB groups and system_settings.
-- All string values are empty or placeholder — fill via Admin → Settings.
-- DO NOT commit client-specific data here.
-- ─────────────────────────────────────────────────────────────────────────────

-- public_settings — JSONB groups
INSERT INTO public_settings (key, value) VALUES

  ('general', jsonb_build_object(
    'site_name',           '',
    'site_tagline',        '',
    'maintenance_message', 'Sitemiz bakım modundadır. En kısa sürede geri döneceğiz.'
  )),

  ('company', jsonb_build_object(
    'name',      '',
    'phone',     '',
    'whatsapp',  '',
    'email',     '',
    'address',   '',
    'working_hours', jsonb_build_object(
      'weekdays', '',
      'saturday', '',
      'sunday',   ''
    ),
    'shipping_cutoff', ''
  )),

  ('seo', jsonb_build_object(
    'title_template', '%s',
    'default_title',  '',
    'description',    '',
    'keywords',       jsonb_build_array()
  )),

  ('social', jsonb_build_object(
    'instagram', '',
    'facebook',  '',
    'youtube',   '',
    'twitter',   '',
    'linkedin',  ''
  )),

  ('mail', jsonb_build_object(
    'from_name',  '',
    'from_email', '',
    'reply_to',   ''
  )),

  ('stock_config', jsonb_build_object(
    'low_stock_threshold', 5
  )),

  ('order_config', jsonb_build_object(
    'min_order_amount',    0,
    'order_notes_enabled', true
  )),

  ('integrations', jsonb_build_object(
    'online_payment_enabled',            false,
    'google_ads_enabled',        false,
    'meta_enabled',              false,
    'whatsapp_enabled',          false,
    'shipping_provider_enabled', false
  ))

ON CONFLICT (key) DO NOTHING;

-- system_settings
INSERT INTO system_settings (key, value) VALUES

  ('security', jsonb_build_object(
    'maintenance_mode',   false,
    'max_login_attempts', 5
  ))

ON CONFLICT (key) DO NOTHING;
