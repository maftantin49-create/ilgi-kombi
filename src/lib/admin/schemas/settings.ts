import { z } from "zod"

// NO "use server" — exports schemas/types/constants only

const checkboxBool = z.preprocess(
  (v) => v === "on" || v === true || v === "true",
  z.boolean()
)

const trimmedStr = (max = 300) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string().max(max)
  )

const optionalEmail = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : ""),
  z.string().max(200).refine(
    (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Geçerli e-posta girin"
  )
)

const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : ""),
  z.string().max(300).refine(
    (v) => v === "" || v.startsWith("http://") || v.startsWith("https://"),
    "Geçerli URL girin veya boş bırakın (https://...)"
  )
)

const keywordsField = z.preprocess((v) => {
  if (typeof v !== "string") return []
  return [...new Set(
    v.split(/[\n,]+/)
     .map((s) => s.trim())
     .filter(Boolean)
  )]
}, z.array(z.string().max(50)).max(20).default([]))

export const generalSettingsSchema = z.object({
  site_name:           z.string().min(2, "Site adı en az 2 karakter").max(100),
  site_tagline:        trimmedStr(200),
  maintenance_message: trimmedStr(500),
})

export const companySettingsSchema = z.object({
  name:     z.string().min(1, "Firma adı zorunlu").max(100),
  phone:    trimmedStr(30),
  whatsapp: trimmedStr(30),
  email:    optionalEmail,
  address:  trimmedStr(500),
  working_hours: z.object({
    weekdays: z.string().max(30),
    saturday: z.string().max(30),
    sunday:   z.string().max(30),
  }),
  shipping_cutoff: z.string().max(10).regex(/^\d{2}:\d{2}$/, "HH:MM formatı gerekli"),
})

export const seoSettingsSchema = z.object({
  title_template: z.string().min(1, "Başlık şablonu zorunlu").max(100),
  default_title:  z.string().min(1, "Varsayılan başlık zorunlu").max(100),
  description:    trimmedStr(300),
  keywords:       keywordsField,
})

export const socialSettingsSchema = z.object({
  instagram: optionalUrl,
  facebook:  optionalUrl,
  youtube:   optionalUrl,
  twitter:   optionalUrl,
  linkedin:  optionalUrl,
})

export const mailSettingsSchema = z.object({
  from_name:  z.string().min(2, "Gönderen adı zorunlu").max(100),
  from_email: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : ""),
    z.string()
      .min(1, "E-posta zorunlu")
      .refine(
        (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "Geçerli gönderen e-posta girin"
      )
  ),
  reply_to: optionalEmail,
})

export const stockConfigSchema = z.object({
  low_stock_threshold: z.coerce
    .number({ error: "Sayı girin" })
    .int("Tam sayı olmalı")
    .min(1, "En az 1")
    .max(100, "En fazla 100"),
})

export const orderConfigSchema = z.object({
  min_order_amount:    z.coerce.number({ error: "Sayı girin" }).min(0).max(10000),
  order_notes_enabled: checkboxBool,
})

export const securitySettingsSchema = z.object({
  maintenance_mode:   checkboxBool,
  max_login_attempts: z.coerce
    .number({ error: "Sayı girin" })
    .int("Tam sayı olmalı")
    .min(3, "En az 3")
    .max(20, "En fazla 20"),
})

export const integrationsSettingsSchema = z.object({
  online_payment_enabled:    checkboxBool,
  bank_transfer_enabled:     checkboxBool,
  cash_on_delivery_enabled:  checkboxBool,
  whatsapp_enabled:          checkboxBool,
  whatsapp_order_enabled:    checkboxBool,
  google_ads_enabled:        checkboxBool,
  meta_enabled:              checkboxBool,
  shipping_provider_enabled: checkboxBool,
})

export const TAB_SCHEMAS = {
  general:      generalSettingsSchema,
  company:      companySettingsSchema,
  seo:          seoSettingsSchema,
  social:       socialSettingsSchema,
  mail:         mailSettingsSchema,
  stock_config: stockConfigSchema,
  order_config: orderConfigSchema,
  security:     securitySettingsSchema,
  integrations: integrationsSettingsSchema,
} as const

export type TabKey = keyof typeof TAB_SCHEMAS
export const VALID_TAB_KEYS = Object.keys(TAB_SCHEMAS) as TabKey[]
