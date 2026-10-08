import { cache } from "react"
import { createPublicServerClient } from "@/lib/supabase/server"
import type {
  GeneralSettings,
  CompanySettings,
  SeoSettings,
  SocialSettings,
  IntegrationsSettings,
} from "@/lib/admin/settings"
import type { Json } from "@/types/database.types"

// Subset of settings visible to the public storefront.
export type StoreSettings = {
  siteName: string
  tagline: string
  phone: string
  whatsapp: string
  email: string
  address: string
  workingHours: { weekdays: string; saturday: string; sunday: string }
  shippingCutoff: string
  shippingCost: number
  freeShippingThreshold: number
  seo: {
    titleTemplate: string
    defaultTitle: string
    description: string
    keywords: string[]
  }
  social: {
    instagram: string
    facebook: string
    youtube: string
    tiktok: string
  }
  integrations: Pick<
    IntegrationsSettings,
    | "whatsapp_order_enabled"
    | "bank_transfer_enabled"
    | "cash_on_delivery_enabled"
    | "online_payment_enabled"
  >
}

const FALLBACK: StoreSettings = {
  siteName: "İlgi Kombi Yedek Parça",
  tagline: "",
  phone: "",
  whatsapp: "905525527997",
  email: "",
  address: "",
  workingHours: { weekdays: "", saturday: "", sunday: "" },
  shippingCutoff: "",
  shippingCost: 200,
  freeShippingThreshold: 5000,
  seo: { titleTemplate: "%s | İlgi Kombi Yedek Parça", defaultTitle: "İlgi Kombi Yedek Parça", description: "", keywords: [] },
  social: {
    instagram: "https://www.instagram.com/ilgikombiyedekparca?exln=aG9vdjNwY25mMXpn&utm_source=qr",
    facebook:  "https://www.facebook.com/share/1Q3kKGY5Jj/?mibextid=wwXIfr",
    youtube:   "",
    tiktok:    "https://www.tiktok.com/@doan.tak?_r=1&_t=ZS-9AO6joeqW2h",
  },
  integrations: {
    whatsapp_order_enabled: false,
    bank_transfer_enabled: false,
    cash_on_delivery_enabled: false,
    online_payment_enabled: false,
  },
}

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const db = createPublicServerClient()
    const { data, error } = await db
      .from("public_settings")
      .select("key, value")
    if (error || !data) return FALLBACK

    type Row = { key: string; value: Json }
    const map = new Map((data as Row[]).map((r) => [r.key, r.value]))

    const general   = (map.get("general")      as GeneralSettings      | null) ?? ({} as GeneralSettings)
    const company   = (map.get("company")      as CompanySettings      | null) ?? ({} as CompanySettings)
    const seo       = (map.get("seo")          as SeoSettings          | null) ?? ({} as SeoSettings)
    const social    = (map.get("social")       as SocialSettings       | null) ?? ({} as SocialSettings)
    const integ     = (map.get("integrations") as IntegrationsSettings | null) ?? ({} as IntegrationsSettings)

    const siteName = general.site_name || FALLBACK.siteName

    return {
      siteName,
      tagline:          general.site_tagline ?? "",
      phone:            company.phone        ?? "",
      whatsapp:         company.whatsapp     || FALLBACK.whatsapp,
      email:            company.email        ?? "",
      address:          company.address      ?? "",
      workingHours:     company.working_hours ?? FALLBACK.workingHours,
      shippingCutoff:   company.shipping_cutoff ?? "",
      shippingCost:     Number(map.get("shipping_cost")           ?? FALLBACK.shippingCost),
      freeShippingThreshold: Number(map.get("free_shipping_threshold") ?? FALLBACK.freeShippingThreshold),
      seo: {
        titleTemplate: seo.title_template || FALLBACK.seo.titleTemplate,
        defaultTitle:  seo.default_title  || siteName,
        description:   seo.description    ?? "",
        keywords:      seo.keywords       ?? [],
      },
      social: {
        instagram: social.instagram || FALLBACK.social.instagram,
        facebook:  social.facebook  || FALLBACK.social.facebook,
        youtube:   social.youtube   || FALLBACK.social.youtube,
        tiktok:    social.tiktok    || FALLBACK.social.tiktok,
      },
      integrations: {
        whatsapp_order_enabled:  integ.whatsapp_order_enabled  ?? false,
        bank_transfer_enabled:   integ.bank_transfer_enabled   ?? false,
        cash_on_delivery_enabled: integ.cash_on_delivery_enabled ?? false,
        online_payment_enabled:  integ.online_payment_enabled  ?? false,
      },
    }
  } catch {
    return FALLBACK
  }
})

// Guard helpers re-exported from client-safe module so server components can
// import everything from one place.
export { validPhone, validWhatsApp, validEmail, validSocial } from "./guards"
