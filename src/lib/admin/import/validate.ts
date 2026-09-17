import { type RawImportRow, normalizeName } from "./normalize"

export type RowStatus = "ok" | "warning" | "error"

export interface RowError {
  field: string
  message: string
}

export interface RowResult {
  index: number
  status: RowStatus
  errors: RowError[]
  warnings: RowError[]
  finalSlug: string
  resolvedBrandId: string | null
  resolvedCategoryId: string | null
}

export interface ValidationSummary {
  total: number
  ok: number
  warnings: number
  errors: number
  rowStatuses: RowResult[]
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Otomatik slug için deterministic suffix.
// base → base-2 → base-3 … (dosya içi + DB çakışmalarından kaçınarak)
function resolveSlugWithSuffix(
  base: string,
  seen: Set<string>,
  existing: Set<string>
): string {
  if (!base) return ""
  if (!seen.has(base) && !existing.has(base)) return base
  for (let n = 2; n <= 9999; n++) {
    const candidate = `${base}-${n}`
    if (!seen.has(candidate) && !existing.has(candidate)) return candidate
  }
  return ""
}

export function validateRows(
  rows: RawImportRow[],
  brandMap: Map<string, string>,
  categoryMap: Map<string, string>,
  existingSlugs: Set<string>,
  existingSkus: Set<string>
): ValidationSummary {
  const seenSlugs = new Set<string>()
  const seenSkus = new Set<string>()

  const rowStatuses: RowResult[] = rows.map((row) => {
    const errors: RowError[] = []
    const warnings: RowError[] = []

    // --- name ---
    if (!row.name) {
      errors.push({ field: "name", message: "Ürün adı zorunludur" })
    } else if (row.name.length > 255) {
      errors.push({ field: "name", message: "Ürün adı 255 karakterden uzun olamaz" })
    }

    // --- slug ---
    // STRICT (manuel): kullanıcı slug yazdıysa → değiştirmeden doğrula, çakışmada ERROR.
    // AUTO (otomatik): name'den türetildi → çakışmada deterministic suffix (-2, -3 …).
    const baseSlug = row.slug  // normalizeRow'da hesaplandı (slugRaw || slugify(name))
    let finalSlug: string

    if (row.slugProvided) {
      finalSlug = baseSlug
      if (!baseSlug) {
        errors.push({ field: "slug", message: "Slug boş olamaz" })
      } else if (!SLUG_RE.test(baseSlug)) {
        errors.push({ field: "slug", message: `Slug geçersiz format: "${baseSlug}"` })
      } else if (existingSlugs.has(baseSlug)) {
        errors.push({ field: "slug", message: `Slug zaten mevcut: "${baseSlug}"` })
      } else if (seenSlugs.has(baseSlug)) {
        errors.push({ field: "slug", message: `Slug dosya içinde tekrar ediyor: "${baseSlug}"` })
      }
      seenSlugs.add(baseSlug)
    } else {
      finalSlug = resolveSlugWithSuffix(baseSlug, seenSlugs, existingSlugs)
      if (!finalSlug) {
        errors.push({ field: "slug", message: "Slug türetilemedi — ürün adı girilmeli" })
      } else {
        seenSlugs.add(finalSlug)
      }
    }

    // --- sku ---
    if (!row.sku) {
      errors.push({ field: "sku", message: "SKU zorunludur" })
    } else if (row.sku.length > 100) {
      errors.push({ field: "sku", message: "SKU 100 karakterden uzun olamaz" })
    } else if (existingSkus.has(row.sku)) {
      errors.push({ field: "sku", message: `SKU zaten mevcut: "${row.sku}"` })
    } else if (seenSkus.has(row.sku)) {
      errors.push({ field: "sku", message: `SKU dosya içinde tekrar ediyor: "${row.sku}"` })
    }
    seenSkus.add(row.sku)

    // --- price ---
    if (row.price === null || row.price === undefined) {
      errors.push({ field: "price", message: "Fiyat zorunludur" })
    } else if (row.price < 0) {
      errors.push({ field: "price", message: "Fiyat 0'dan küçük olamaz" })
    }

    // --- compare_at_price ---
    if (row.compare_at_price !== null && row.price !== null && row.compare_at_price < row.price) {
      warnings.push({
        field: "compare_at_price",
        message: "Karşılaştırma fiyatı satış fiyatından düşük",
      })
    }

    // --- stock_quantity ---
    if (row.stock_quantity === null) {
      warnings.push({ field: "stock_quantity", message: "Stok belirtilmedi — 0 kabul edilecek" })
    } else if (row.stock_quantity < 0) {
      errors.push({ field: "stock_quantity", message: "Stok 0'dan küçük olamaz" })
    }

    // --- brand (STRICT) ---
    // Marka adı doluysa → sistemde eşleşme zorunlu; bulunamazsa ERROR.
    // Marka adı boşsa → brand_id = null → geçerli.
    // Eşleşme: normalizeName (TR_MAP + lowercase + trim) — İ/ı/I farkı normalize edilir.
    let resolvedBrandId: string | null = null
    if (row.brand) {
      const key = normalizeName(row.brand)
      resolvedBrandId = brandMap.get(key) ?? null
      if (!resolvedBrandId) {
        errors.push({ field: "brand", message: `Marka bulunamadı: "${row.brand}"` })
      }
    }

    // --- category (STRICT) ---
    // Kategori adı doluysa → sistemde eşleşme zorunlu; bulunamazsa ERROR.
    // Kategori adı boşsa → category_id = null → geçerli.
    let resolvedCategoryId: string | null = null
    if (row.category) {
      const key = normalizeName(row.category)
      resolvedCategoryId = categoryMap.get(key) ?? null
      if (!resolvedCategoryId) {
        errors.push({ field: "category", message: `Kategori bulunamadı: "${row.category}"` })
      }
    }

    const status: RowStatus = errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "ok"

    return {
      index: row.index,
      status,
      errors,
      warnings,
      finalSlug,
      resolvedBrandId,
      resolvedCategoryId,
    }
  })

  const ok = rowStatuses.filter((r) => r.status === "ok").length
  const warnings = rowStatuses.filter((r) => r.status === "warning").length
  const errors = rowStatuses.filter((r) => r.status === "error").length

  return { total: rows.length, ok, warnings, errors, rowStatuses }
}
