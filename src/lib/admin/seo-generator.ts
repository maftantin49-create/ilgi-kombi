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

  // Title: include suffix when total ≤65 chars, fall back to name-only when ≤60, else truncate.
  // 65-char soft ceiling keeps the suffix for most real product names (~35–40 chars).
  const full = raw + SITE_SUFFIX
  let seoTitle: string
  if (full.length <= 65) {
    seoTitle = full
  } else if (raw.length <= 60) {
    seoTitle = raw
  } else {
    seoTitle = raw.slice(0, 57).trimEnd() + "..."
  }

  // Description: factual only — no unverifiable quality/price claims.
  let desc: string
  if (brandName && categoryName) {
    desc = `${raw} – ${brandName} uyumlu, ${categoryName} için yedek parça. Güncel fiyat ve hızlı teslimat için İlgi Kombi'yi ziyaret edin.`
  } else if (brandName) {
    desc = `${raw} – ${brandName} uyumlu yedek parçayı inceleyin. Kombi tamir ve bakımı için İlgi Kombi Yedek Parça'yı ziyaret edin.`
  } else if (categoryName) {
    desc = `${raw} – ${categoryName} kategorisinde uygun yedek parça. Kombi tamir ve bakımı için İlgi Kombi Yedek Parça'yı ziyaret edin.`
  } else {
    desc = `${raw} hakkında detaylı bilgi ve güncel fiyat için İlgi Kombi Yedek Parça'yı ziyaret edin.`
  }
  const seoDescription = desc.length > 160 ? desc.slice(0, 157).trimEnd() + "..." : desc

  return { seoTitle, seoDescription, slug: toSlug(raw) }
}
