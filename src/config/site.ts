// Build/Deploy Config — only values known at build time.
// All store-facing data (name, phone, email, shipping, SEO) lives in
// public_settings DB and is read via src/lib/storefront/settings.ts.

export const siteConfig = {
  url:         process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  environment: process.env.NODE_ENV,
} as const
