// ── Build/Deploy Config (authoritative) ─────────────────────────────────────
// Only build-time values. Never add store-facing data here.

export const siteConfig = {
  url:         process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  environment: process.env.NODE_ENV,
} as const

// ── Transitional shim — Phase 4 migration target ─────────────────────────────
// These fields move to public_settings DB in Phase 4.
// Until then, string values are TODO placeholders; numeric values match DB seed.
// Do NOT add İlgi Kombi real data here — fill via Admin → Settings.

export const site = {
  siteName:   "TODO_STORE_NAME",
  shortName:  "TODO_STORE_NAME",
  tagline:    "",
  description: "",
  url:        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  phone:                "TODO_CLIENT_PHONE",
  phoneDisplay:         "TODO_CLIENT_PHONE",
  whatsapp:             "TODO_CLIENT_WHATSAPP",
  technicalServicePhone: "TODO_CLIENT_PHONE",
  email:                "TODO_CLIENT_EMAIL",

  address: "",

  workingHours: {
    weekdays: "TODO_CLIENT_HOURS",
    saturday: "TODO_CLIENT_HOURS",
    sunday:   "TODO_CLIENT_HOURS",
  },

  shippingCutoff:        "TODO_CLIENT_CUTOFF",
  currency:              "₺",
  // Numeric defaults match 011a migration seed — change via Admin → Settings
  freeShippingThreshold: 500,
  shippingCost:          49.9,

  social: {
    instagram: "",
    facebook:  "",
    whatsapp:  "",
  },

  seo: {
    titleTemplate: "%s",
    defaultTitle:  "TODO_STORE_NAME",
    keywords:      "",
  },
} as const

export const whatsappLink = (message?: string) =>
  `https://wa.me/${site.whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}`
