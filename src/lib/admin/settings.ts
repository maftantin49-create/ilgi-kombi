import { createServiceClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database.types"

export type GeneralSettings = {
  site_name: string
  site_tagline: string
  maintenance_message: string
}

export type CompanySettings = {
  name: string
  phone: string
  whatsapp: string
  email: string
  address: string
  working_hours: { weekdays: string; saturday: string; sunday: string }
  shipping_cutoff: string
}

export type SeoSettings = {
  title_template: string
  default_title: string
  description: string
  keywords: string[]
}

export type SocialSettings = {
  instagram: string
  facebook: string
  youtube: string
  twitter: string
  linkedin: string
}

export type MailSettings = {
  from_name: string
  from_email: string
  reply_to: string
}

export type StockConfigSettings = {
  low_stock_threshold: number
}

export type OrderConfigSettings = {
  min_order_amount: number
  order_notes_enabled: boolean
}

export type SecuritySettings = {
  maintenance_mode: boolean
  max_login_attempts: number
}

export type IntegrationsSettings = {
  online_payment_enabled: boolean
  google_ads_enabled: boolean
  meta_enabled: boolean
  whatsapp_enabled: boolean
  shipping_provider_enabled: boolean
}

export type SettingsData = {
  general:      GeneralSettings
  company:      CompanySettings
  seo:          SeoSettings
  social:       SocialSettings
  mail:         MailSettings
  stock_config: StockConfigSettings
  order_config: OrderConfigSettings
  security:     SecuritySettings
  integrations: IntegrationsSettings
  // Flat keys — 011_seed_static.sql'de tanımlı, create_order_atomic() okur, değiştirme
  shipping_cost:           number
  free_shipping_threshold: number
  currency:                string
  reservation_ttl_minutes: number
  max_cart_quantity:       number
}

const DEFAULT_GENERAL: GeneralSettings = {
  site_name: "İstanbul Kombi Klima",
  site_tagline: "Kombi ve Klima Yedek Parça Uzmanı",
  maintenance_message: "Sitemiz bakım modundadır. En kısa sürede geri döneceğiz.",
}

const DEFAULT_COMPANY: CompanySettings = {
  name: "", phone: "", whatsapp: "", email: "", address: "",
  working_hours: { weekdays: "", saturday: "", sunday: "" },
  shipping_cutoff: "14:00",
}

const DEFAULT_SEO: SeoSettings = {
  title_template: "%s | İstanbul Kombi Klima",
  default_title: "İstanbul Kombi Klima — Yedek Parça",
  description: "",
  keywords: [],
}

const DEFAULT_SOCIAL: SocialSettings = {
  instagram: "", facebook: "", youtube: "", twitter: "", linkedin: "",
}

const DEFAULT_MAIL: MailSettings = {
  from_name: "İstanbul Kombi Klima",
  from_email: "",
  reply_to: "",
}

const DEFAULT_STOCK_CONFIG: StockConfigSettings = { low_stock_threshold: 5 }
const DEFAULT_ORDER_CONFIG: OrderConfigSettings = { min_order_amount: 0, order_notes_enabled: true }
const DEFAULT_SECURITY: SecuritySettings = { maintenance_mode: false, max_login_attempts: 5 }
const DEFAULT_INTEGRATIONS: IntegrationsSettings = {
  online_payment_enabled: false,
  google_ads_enabled: false,
  meta_enabled: false,
  whatsapp_enabled: false,
  shipping_provider_enabled: false,
}

export async function getSettings(): Promise<SettingsData> {
  const db = createServiceClient()

  const publicResult = await db.from("public_settings").select("key, value")
  const systemResult = await db.from("system_settings").select("key, value")

  type Row = { key: string; value: Json }
  const pub = new Map(((publicResult.data ?? []) as Row[]).map((r) => [r.key, r.value]))
  const sys = new Map(((systemResult.data ?? []) as Row[]).map((r) => [r.key, r.value]))

  return {
    general:      (pub.get("general") as GeneralSettings)      ?? DEFAULT_GENERAL,
    company:      (pub.get("company") as CompanySettings)      ?? DEFAULT_COMPANY,
    seo:          (pub.get("seo") as SeoSettings)              ?? DEFAULT_SEO,
    social:       (pub.get("social") as SocialSettings)        ?? DEFAULT_SOCIAL,
    mail:         (pub.get("mail") as MailSettings)            ?? DEFAULT_MAIL,
    stock_config: (pub.get("stock_config") as StockConfigSettings) ?? DEFAULT_STOCK_CONFIG,
    order_config: (pub.get("order_config") as OrderConfigSettings) ?? DEFAULT_ORDER_CONFIG,
    integrations: (pub.get("integrations") as IntegrationsSettings) ?? DEFAULT_INTEGRATIONS,
    security:     (sys.get("security") as SecuritySettings)    ?? DEFAULT_SECURITY,
    // JSONB numeric values are deserialized as JS numbers by Supabase JS
    shipping_cost:           Number(pub.get("shipping_cost")           ?? 49.9),
    free_shipping_threshold: Number(pub.get("free_shipping_threshold") ?? 5000),
    currency:                String(pub.get("currency")                ?? "TRY"),
    reservation_ttl_minutes: Number(pub.get("reservation_ttl_minutes") ?? 30),
    max_cart_quantity:       Number(pub.get("max_cart_quantity")       ?? 10),
  }
}
