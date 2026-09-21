import type { WcProduct, WcImportRow } from "./interface"

// ── Turkish char map ──────────────────────────────────────────────────────────

const TR: Record<string, string> = {
  ş: "s", Ş: "s", ı: "i", İ: "i",
  ğ: "g", Ğ: "g", ü: "u", Ü: "u",
  ö: "o", Ö: "o", ç: "c", Ç: "c",
}

export function normalizeName(s: string): string {
  return s.split("").map(c => TR[c] ?? c).join("").toLowerCase().trim()
}

export function slugify(text: string): string {
  return text
    .split("").map(c => TR[c] ?? c).join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// ── HTML stripping ────────────────────────────────────────────────────────────

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// ── Brand detection ───────────────────────────────────────────────────────────
// Priority: product attribute "Marka" / "Brand" → meta_data → null

const BRAND_ATTR_NAMES = new Set(
  ["marka", "brand", "uretici", "üretici", "manufacturer"]
)

export function extractBrandFromProduct(p: WcProduct): string | null {
  // 1. Attributes named "Marka" / "Brand" / "Üretici"
  for (const attr of p.attributes) {
    if (BRAND_ATTR_NAMES.has(normalizeName(attr.name))) {
      const val = attr.options[0]?.trim()
      if (val) return val
    }
  }

  // 2. meta_data (various WC brand plugins store here)
  const brandMetaKeys = ["_brand", "brand", "pa_brand", "product_brand", "yoast_seo_primary_product_brand"]
  for (const m of p.meta_data) {
    if (brandMetaKeys.includes(m.key)) {
      const val = typeof m.value === "string" ? m.value.trim() : null
      if (val) return val
    }
  }

  return null
}

// ── OEM code extraction ───────────────────────────────────────────────────────

const OEM_ATTR_NAMES = new Set([
  "oem", "oem kodu", "orijinal no", "orijinal kod", "part number", "parca no",
  "parça no", "alternatif oem", "yedek parca no",
])
const OEM_META_KEYS = new Set([
  "oem_code", "_oem_code", "oem_number", "original_code", "part_number",
])

export function extractOemCodes(p: WcProduct): string[] {
  const codes = new Set<string>()

  for (const attr of p.attributes) {
    if (OEM_ATTR_NAMES.has(normalizeName(attr.name))) {
      for (const opt of attr.options) {
        const v = opt.trim()
        if (v) codes.add(v)
      }
    }
  }

  for (const m of p.meta_data) {
    if (OEM_META_KEYS.has(m.key)) {
      const v = typeof m.value === "string" ? m.value.trim() : null
      if (v) codes.add(v)
    }
  }

  return [...codes]
}

// ── Compatible model extraction ───────────────────────────────────────────────

const COMPAT_ATTR_NAMES = new Set([
  "uyumlu model", "uyumlu cihaz", "uyumlu modeller",
  "compatible model", "compatible models", "compatible devices",
  "uygundugu model", "uygun model",
])

export function extractCompatibleModels(p: WcProduct): string[] {
  const models = new Set<string>()

  for (const attr of p.attributes) {
    if (COMPAT_ATTR_NAMES.has(normalizeName(attr.name))) {
      for (const opt of attr.options) {
        const v = opt.trim()
        if (v) models.add(v)
      }
    }
  }

  return [...models]
}

// ── Specification extraction ──────────────────────────────────────────────────
// Capture product attributes not already consumed as brand/OEM/compat-models

const SKIP_ATTR_NAMES = new Set([
  ...Array.from(BRAND_ATTR_NAMES),
  ...Array.from(OEM_ATTR_NAMES),
  ...Array.from(COMPAT_ATTR_NAMES),
])

export function extractSpecifications(
  p: WcProduct
): Array<{ key: string; value: string; unit: string | null }> {
  const specs: Array<{ key: string; value: string; unit: string | null }> = []

  for (const attr of p.attributes) {
    if (SKIP_ATTR_NAMES.has(normalizeName(attr.name))) continue
    const value = attr.options.join(", ")
    if (!value) continue
    specs.push({ key: attr.name, value, unit: null })
  }

  return specs
}

// ── Price parsing ─────────────────────────────────────────────────────────────

function parsePrice(s: string): number | null {
  if (!s) return null
  // "1.299,90" (TR) → 1299.90
  let n = s.trim()
  if (n.includes(",") && n.includes(".")) {
    n = n.replace(/\./g, "").replace(",", ".")
  } else {
    n = n.replace(",", ".")
  }
  const f = parseFloat(n)
  return isNaN(f) ? null : f
}

// ── Main normalization ────────────────────────────────────────────────────────

export function normalizeWcProduct(p: WcProduct): WcImportRow {
  const regularPrice = parsePrice(p.regular_price)
  const salePrice    = parsePrice(p.sale_price)
  const currentPrice = parsePrice(p.price)

  // price = sale if active, else regular; compare_at_price = regular when sale is active
  const price          = currentPrice ?? salePrice ?? regularPrice ?? 0
  const compareAtPrice = salePrice && regularPrice && salePrice < regularPrice ? regularPrice : null

  const sourceCategories = p.categories.map(c => c.name)
  // First category as primary (canonical) category
  const categoryName = sourceCategories[0] ?? null

  const brand    = extractBrandFromProduct(p)
  const oemCodes = extractOemCodes(p)
  const specs    = extractSpecifications(p)
  const imageUrls = p.images.map(i => i.src)

  const descriptionRaw = stripHtml(p.description)
  const shortDescRaw   = stripHtml(p.short_description)

  return {
    sourceId:        p.id,
    sourceSlug:      p.slug,
    sourceStatus:    p.status,
    sourceType:      p.type,
    sourcePermalink: p.permalink,
    sourceCategories,

    name:            p.name.trim(),
    slug:            slugify(p.name),
    sku:             p.sku.trim(),
    price,
    compareAtPrice,
    stockQuantity:   p.stock_quantity ?? 0,
    stockStatus:     p.stock_status,
    brandName:       brand,
    categoryName,
    description:     descriptionRaw || null,
    shortDescription: shortDescRaw || null,
    imageUrls,
    isActive:        p.status === "publish",
    isFeatured:      false,
    isNew:           false,
    sameDayShipping: false,
    compatibleBrands: extractCompatibleModels(p).length > 0
      ? [...new Set(extractCompatibleModels(p).map(m => m.split(/\s+/)[0]))]
      : null,

    oemCodes,
    specifications: specs,

    wcAttributes: p.attributes.map(a => ({ name: a.name, options: a.options })),
    wcMetaKeys:   p.meta_data.map(m => m.key),
  }
}
