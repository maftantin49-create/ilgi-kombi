export interface SeoInput {
  name: string
  brandName?: string
  categoryName?: string
}

export interface SeoOutput {
  seoTitle: string
  seoDescription: string
  slug: string
}

const SITE_SUFFIX = " | İlgi Kombi Yedek Parça"

export function toSlug(text: string): string {
  const map: Record<string, string> = {
    ğ: "g", Ğ: "g", ü: "u", Ü: "u", ş: "s", Ş: "s",
    ı: "i", İ: "i", ö: "o", Ö: "o", ç: "c", Ç: "c",
  }
  return text
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function generateSeo({ name, brandName, categoryName }: SeoInput): SeoOutput {
  const raw = name.trim()

  // Title: "{name} | İlgi Kombi Yedek Parça" — truncate to 60 chars
  const full = raw + SITE_SUFFIX
  let seoTitle: string
  if (full.length <= 60) {
    seoTitle = full
  } else if (raw.length <= 60) {
    seoTitle = raw
  } else {
    seoTitle = raw.slice(0, 57).trimEnd() + "..."
  }

  // Description: compose from name + category + brand + closing phrase
  const parts: string[] = [raw]
  if (categoryName) parts.push(`${categoryName} sistemi için uygun`)
  if (brandName) parts.push(`${brandName} uyumlu`)
  parts.push("yedek parça")
  const closing = ". Orijinal kalite, uygun fiyat ve hızlı teslimat için İlgi Kombi'yi ziyaret edin."
  const base = parts.join(" ") + closing
  const seoDescription = base.length > 160 ? base.slice(0, 157).trimEnd() + "..." : base

  return { seoTitle, seoDescription, slug: toSlug(raw) }
}
