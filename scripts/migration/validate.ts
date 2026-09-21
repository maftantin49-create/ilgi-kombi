import type {
  WcImportRow,
  RowValidationResult,
  ValidationIssue,
  SkuAuditResult,
  RedirectEntry,
} from "./interface"
import { slugify, normalizeName } from "./normalize"

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ── Row validation ────────────────────────────────────────────────────────────

export function validateRow(
  row: WcImportRow,
  seenSlugs: Set<string>,
  seenSkus:  Set<string>
): RowValidationResult {
  const issues: ValidationIssue[] = []

  // name
  if (!row.name) {
    issues.push({ field: "name", message: "Ürün adı boş", kind: "error" })
  } else if (row.name.length > 255) {
    issues.push({ field: "name", message: `Ad çok uzun (${row.name.length} char)`, kind: "error" })
  }

  // slug
  if (!row.slug || !SLUG_RE.test(row.slug)) {
    issues.push({ field: "slug", message: `Geçersiz slug: "${row.slug}"`, kind: "error" })
  } else if (seenSlugs.has(row.slug)) {
    issues.push({ field: "slug", message: `Slug çakışması: "${row.slug}"`, kind: "error" })
  }
  seenSlugs.add(row.slug)

  // sku
  if (!row.sku) {
    issues.push({ field: "sku", message: "SKU boş — fallback gerekiyor", kind: "error" })
  } else if (row.sku.length > 100) {
    issues.push({ field: "sku", message: `SKU çok uzun (${row.sku.length} char)`, kind: "error" })
  } else if (seenSkus.has(row.sku)) {
    issues.push({ field: "sku", message: `SKU çakışması: "${row.sku}"`, kind: "error" })
  }
  seenSkus.add(row.sku)

  // price
  if (row.price <= 0) {
    issues.push({ field: "price", message: `Geçersiz fiyat: ${row.price}`, kind: "error" })
  }
  if (row.compareAtPrice !== null && row.compareAtPrice < row.price) {
    issues.push({ field: "compare_at_price", message: "compareAtPrice < price", kind: "warning" })
  }

  // category
  if (!row.categoryName) {
    issues.push({ field: "category", message: "Kategori atanmamış", kind: "warning" })
  }

  // brand
  if (!row.brandName) {
    issues.push({ field: "brand", message: "Marka atanmamış", kind: "warning" })
  }

  // images
  if (row.imageUrls.length === 0) {
    issues.push({ field: "images", message: "Görsel yok", kind: "warning" })
  }

  // product type
  if (row.sourceType !== "simple") {
    issues.push({ field: "type", message: `Unsupported type: ${row.sourceType}`, kind: "warning" })
  }

  const errors   = issues.filter(i => i.kind === "error")
  const warnings = issues.filter(i => i.kind === "warning")

  const status: RowValidationResult["status"] =
    errors.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "ok"

  return {
    sourceId:  row.sourceId,
    name:      row.name,
    sku:       row.sku,
    finalSlug: row.slug,
    issues,
    status,
  }
}

export function validateAll(rows: WcImportRow[]): RowValidationResult[] {
  const seenSlugs = new Set<string>()
  const seenSkus  = new Set<string>()
  return rows.map(r => validateRow(r, seenSlugs, seenSkus))
}

// ── SKU audit ─────────────────────────────────────────────────────────────────

export function auditSkus(rows: WcImportRow[]): SkuAuditResult {
  let missing = 0, whitespace = 0, numericOnly = 0, leadingZero = 0, unusualChars = 0
  const unusualSamples: string[] = []
  const skuCounts = new Map<string, number[]>()

  for (const row of rows) {
    const sku = row.sku

    if (!sku) { missing++; continue }
    if (sku !== sku.trim()) whitespace++
    if (/^\d+$/.test(sku)) numericOnly++
    if (/^0\d+$/.test(sku)) leadingZero++

    if (/[^a-zA-Z0-9\-_./]/.test(sku)) {
      unusualChars++
      if (unusualSamples.length < 10) unusualSamples.push(sku)
    }

    const group = skuCounts.get(sku) ?? []
    group.push(row.sourceId)
    skuCounts.set(sku, group)
  }

  const duplicateGroups = [...skuCounts.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([sku, sourceIds]) => ({ sku, sourceIds }))

  return {
    total:          rows.length,
    missing,
    duplicates:     duplicateGroups.reduce((acc, g) => acc + g.sourceIds.length - 1, 0),
    duplicateGroups,
    whitespace,
    numericOnly,
    leadingZero,
    unusualChars,
    unusualSamples,
  }
}

// ── Slug conflict detection ───────────────────────────────────────────────────

export function auditSlugConflicts(rows: WcImportRow[]): { slug: string; sourceIds: number[] }[] {
  const map = new Map<string, number[]>()
  for (const row of rows) {
    const group = map.get(row.slug) ?? []
    group.push(row.sourceId)
    map.set(row.slug, group)
  }
  return [...map.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([slug, sourceIds]) => ({ slug, sourceIds }))
}

// ── Brand normalization issues ────────────────────────────────────────────────

export function detectBrandNormIssues(rows: WcImportRow[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    if (!row.brandName) continue
    counts.set(row.brandName, (counts.get(row.brandName) ?? 0) + 1)
  }
  return counts
}

// ── SEO redirect dataset ──────────────────────────────────────────────────────

export function buildRedirectMap(rows: WcImportRow[]): RedirectEntry[] {
  return rows.map(row => {
    const normalizedSlug = slugify(row.name)
    const slugChanged    = row.sourceSlug !== normalizedSlug

    return {
      sourceUrl:   `/urun/${row.sourceSlug}/`,
      targetUrl:   `/urunler/${normalizedSlug}`,
      type:        "product" as const,
      slugChanged,
    }
  })
}

export function buildCategoryRedirectMap(
  categories: Array<{ name: string; slug: string }>
): RedirectEntry[] {
  return categories.map(cat => {
    const normalizedSlug = slugify(cat.name)
    const slugChanged    = cat.slug !== normalizedSlug

    return {
      sourceUrl:   `/urun-kategorisi/${cat.slug}/`,
      targetUrl:   `/kategoriler/${normalizedSlug}`,
      type:        "category" as const,
      slugChanged,
    }
  })
}

export function buildBrandRedirectMap(
  brands: Array<{ name: string; slug: string }>
): RedirectEntry[] {
  return brands.map(b => {
    const normalizedSlug = slugify(b.name)
    const slugChanged    = b.slug !== normalizedSlug

    return {
      sourceUrl:   `/urun-etiketi/${b.slug}/`,  // may vary by WC config
      targetUrl:   `/urunler?marka=${encodeURIComponent(b.name)}`,
      type:        "brand" as const,
      slugChanged,
    }
  })
}

// ── Category normalization ────────────────────────────────────────────────────

export function detectCategoryIssues(
  cats: Array<{ id: number; name: string; slug: string; parent: number; count: number }>
): string[] {
  const issues: string[] = []
  const names = cats.map(c => normalizeName(c.name))
  const slugs = cats.map(c => c.slug)

  // Duplicate names (case/accent variants)
  const nameCounts = new Map<string, number[]>()
  cats.forEach((c, i) => {
    const n = names[i]
    nameCounts.set(n, [...(nameCounts.get(n) ?? []), c.id])
  })
  for (const [n, ids] of nameCounts) {
    if (ids.length > 1) issues.push(`Duplicate normalized name: "${n}" (ids: ${ids.join(", ")})`)
  }

  // Slugs that differ significantly from slugified name
  cats.forEach(c => {
    const expected = slugify(c.name)
    if (c.slug !== expected) {
      issues.push(`Slug mismatch: name="${c.name}" slug="${c.slug}" expected="${expected}"`)
    }
  })

  // Slug duplicates
  const seenSlugs = new Set<string>()
  for (const slug of slugs) {
    if (seenSlugs.has(slug)) issues.push(`Duplicate slug: "${slug}"`)
    seenSlugs.add(slug)
  }

  return issues
}
