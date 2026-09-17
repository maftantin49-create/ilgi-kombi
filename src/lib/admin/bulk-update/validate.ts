import { createServiceClient } from "@/lib/supabase/server"
import { normalizeName } from "@/lib/admin/import/normalize"
import type { RawUpdateRow } from "./normalize"
import type {
  UpdateRowResult,
  UpdateRowStatus,
  UpdateValidationSummary,
  FieldDiff,
  RowError,
  ResolvedCommitRow,
} from "./schema"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CHUNK_SIZE = 500
const PREVIEW_LIMIT = 200

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Product snapshot — shape expected from DB select
// ─────────────────────────────────────────────────────────────────────────────

interface ProductSnapshot {
  id: string
  sku: string
  name: string
  price: number
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  same_day_shipping: boolean
  brand_id: string | null
  category_id: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Return type
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidateResult {
  summary: UpdateValidationSummary
  previewRows: UpdateRowResult[]     // first PREVIEW_LIMIT rows (all statuses)
  issueRows: UpdateRowResult[]       // ALL error+warning rows (no limit) — for XLSX download
  resolvedRows: ResolvedCommitRow[]  // only valid|warning rows with actual diffs (for commit)
}

// ─────────────────────────────────────────────────────────────────────────────
// Main validate
// ─────────────────────────────────────────────────────────────────────────────

export async function validateUpdateRows(
  rows: RawUpdateRow[],
  ignoredCount: number,
): Promise<ValidateResult> {
  const db = createServiceClient()

  // ── 1. Duplicate SKU detection (canonical: trim only, per normalizeSku) ──

  const skuCounts = new Map<string, number>()
  for (const row of rows) {
    skuCounts.set(row.sku, (skuCounts.get(row.sku) ?? 0) + 1)
  }
  const duplicateSkus = new Set<string>(
    [...skuCounts.entries()].filter(([, c]) => c > 1).map(([sku]) => sku),
  )

  // ── 2. Fetch products by SKU (chunked, 500 per batch) ────────────────────

  const allSkus = [...new Set(rows.map((r) => r.sku).filter(Boolean))]
  const productMap = new Map<string, ProductSnapshot>()

  for (const batch of chunk(allSkus, CHUNK_SIZE)) {
    const { data } = await db
      .from("products")
      .select(
        "id, sku, name, price, stock_quantity, is_active, is_featured, is_new, same_day_shipping, brand_id, category_id",
      )
      .in("sku", batch)
    for (const p of (data ?? []) as ProductSnapshot[]) {
      productMap.set(p.sku, p)
    }
  }

  // ── 3. Fetch brands + categories (small tables, all at once) ─────────────

  const brandMap     = new Map<string, string>()  // normalizeName(name) → id
  const brandById    = new Map<string, string>()  // id → name
  const categoryMap  = new Map<string, string>()
  const categoryById = new Map<string, string>()

  const [{ data: brandRows }, { data: categoryRows }] = await Promise.all([
    db.from("brands").select("id, name"),
    db.from("categories").select("id, name"),
  ])
  for (const b of (brandRows ?? []) as { id: string; name: string }[]) {
    brandMap.set(normalizeName(b.name), b.id)
    brandById.set(b.id, b.name)
  }
  for (const c of (categoryRows ?? []) as { id: string; name: string }[]) {
    categoryMap.set(normalizeName(c.name), c.id)
    categoryById.set(c.id, c.name)
  }

  // ── 4. Fetch active reservations for found products (chunked) ────────────

  const foundProductIds = [...productMap.values()].map((p) => p.id)
  const reservedMap = new Map<string, number>()
  for (const id of foundProductIds) reservedMap.set(id, 0)

  const now = new Date().toISOString()
  for (const batch of chunk(foundProductIds, CHUNK_SIZE)) {
    const { data } = await db
      .from("inventory_reservations")
      .select("product_id, quantity")
      .in("product_id", batch)
      .eq("status", "active")
      .gt("expires_at", now)
    for (const r of (data ?? []) as { product_id: string; quantity: number }[]) {
      reservedMap.set(r.product_id, (reservedMap.get(r.product_id) ?? 0) + r.quantity)
    }
  }

  // ── 5. Validate each row ─────────────────────────────────────────────────

  const rowResults: UpdateRowResult[] = []
  const resolvedRows: ResolvedCommitRow[] = []

  for (const row of rows) {
    const errors: RowError[] = [...row.parseErrors]
    const warnings: RowError[] = []
    const diffs: FieldDiff[] = []
    let productId: string | null = null
    let productName: string | null = null
    let resolvedBrandId: string | null | undefined = undefined
    let resolvedCategoryId: string | null | undefined = undefined

    // ── a. SKU present ──────────────────────────────────────────────────────
    if (!row.skuPresent) {
      errors.push({ field: "sku", message: "SKU zorunludur" })
      rowResults.push(makeResult(row, null, null, "error", errors, warnings, diffs))
      continue
    }

    // ── b. Duplicate SKU ────────────────────────────────────────────────────
    if (duplicateSkus.has(row.sku)) {
      errors.push({ field: "sku", message: `Tekrarlayan SKU: "${row.sku}" dosyada birden fazla görünüyor` })
      rowResults.push(makeResult(row, null, null, "error", errors, warnings, diffs))
      continue
    }

    // ── c. SKU → product lookup ─────────────────────────────────────────────
    const product = productMap.get(row.sku)
    if (!product) {
      errors.push({ field: "sku", message: `Ürün bulunamadı: "${row.sku}"` })
      rowResults.push(makeResult(row, null, null, "error", errors, warnings, diffs))
      continue
    }

    productId   = product.id
    productName = product.name
    const reserved = reservedMap.get(product.id) ?? 0

    // ── d. Any update field present? (includes parse errors) ────────────────
    const hasAnyUpdate =
      "price" in row ||
      "stock" in row ||
      "is_active" in row ||
      "is_featured" in row ||
      "is_new" in row ||
      "same_day_shipping" in row ||
      "brand" in row ||
      "category" in row ||
      row.parseErrors.length > 0

    // No update fields and no parse errors → no_change (not an error)
    if (!hasAnyUpdate) {
      rowResults.push(makeResult(row, productId, productName, "no_change", [], [], []))
      continue
    }

    // ── e. Price validation ──────────────────────────────────────────────────
    if ("price" in row) {
      const newPrice = row.price as number   // key present → parse succeeded, never undefined
      if (newPrice < 0) {
        errors.push({ field: "price", message: `Fiyat negatif olamaz: ${newPrice}` })
      } else if (newPrice !== product.price) {
        diffs.push({ field: "price", currentValue: product.price, newValue: newPrice })
        // price=0 + resulting active=true → warning
        if (newPrice === 0) {
          const resultingActive = "is_active" in row ? row.is_active : product.is_active
          if (resultingActive === true) {
            warnings.push({
              field: "price",
              message: "Ürün aktif durumda ancak fiyatı 0 TL olacak",
            })
          }
        }
      }
    }

    // ── f. Stock validation ──────────────────────────────────────────────────
    if ("stock" in row) {
      const newStock = row.stock as number   // key present → parse succeeded, never undefined
      if (newStock < 0) {
        errors.push({ field: "stock", message: `Stok negatif olamaz: ${newStock}` })
      } else if (newStock < reserved) {
        errors.push({
          field: "stock",
          message: `Yeni stok (${newStock}) rezerve miktarının (${reserved}) altında`,
        })
      } else if (newStock !== product.stock_quantity) {
        diffs.push({ field: "stock", currentValue: product.stock_quantity, newValue: newStock })
      }
    }

    // ── g. Flag change detection ─────────────────────────────────────────────
    const FLAG_KEYS = ["is_active", "is_featured", "is_new", "same_day_shipping"] as const
    for (const key of FLAG_KEYS) {
      if (key in row) {
        const newVal = row[key] as boolean
        const curVal = product[key]
        if (newVal !== curVal) {
          diffs.push({ field: key, currentValue: curVal, newValue: newVal })
        }
      }
    }

    // ── h. Brand resolution ──────────────────────────────────────────────────
    if ("brand" in row) {
      if (row.brand === null) {
        // TEMİZLE → CLEAR
        resolvedBrandId = null
        if (product.brand_id !== null) {
          diffs.push({
            field: "brand_id",
            currentValue: brandById.get(product.brand_id) ?? product.brand_id,
            newValue: null,
          })
        }
      } else {
        // Resolve name → id
        const brandId = brandMap.get(normalizeName(row.brand as string))
        if (!brandId) {
          errors.push({ field: "brand", message: `Marka bulunamadı: "${row.brand}"` })
        } else {
          resolvedBrandId = brandId
          if (brandId !== product.brand_id) {
            diffs.push({
              field: "brand_id",
              currentValue: product.brand_id ? (brandById.get(product.brand_id) ?? product.brand_id) : null,
              newValue: row.brand,  // display name for preview
            })
          }
        }
      }
    }

    // ── i. Category resolution ───────────────────────────────────────────────
    if ("category" in row) {
      if (row.category === null) {
        // TEMİZLE → CLEAR
        resolvedCategoryId = null
        if (product.category_id !== null) {
          diffs.push({
            field: "category_id",
            currentValue: categoryById.get(product.category_id) ?? product.category_id,
            newValue: null,
          })
        }
      } else {
        const categoryId = categoryMap.get(normalizeName(row.category as string))
        if (!categoryId) {
          errors.push({ field: "category", message: `Kategori bulunamadı: "${row.category}"` })
        } else {
          resolvedCategoryId = categoryId
          if (categoryId !== product.category_id) {
            diffs.push({
              field: "category_id",
              currentValue: product.category_id
                ? (categoryById.get(product.category_id) ?? product.category_id)
                : null,
              newValue: row.category,  // display name for preview
            })
          }
        }
      }
    }

    // ── j. Determine final status ────────────────────────────────────────────
    let status: UpdateRowStatus
    if (errors.length > 0) {
      status = "error"
    } else if (diffs.length === 0) {
      status = "no_change"
    } else if (warnings.length > 0) {
      status = "warning"
    } else {
      status = "valid"
    }

    rowResults.push(makeResult(row, productId, productName, status, errors, warnings, diffs))

    // Build resolved row for commit: only valid|warning rows with actual changes
    if (errors.length === 0 && diffs.length > 0 && productId !== null) {
      const resolved: ResolvedCommitRow = { productId, status }
      for (const diff of diffs) {
        switch (diff.field) {
          case "price":            resolved.price            = diff.newValue as number;  break
          case "stock":            resolved.stock            = diff.newValue as number;  break
          case "is_active":        resolved.is_active        = diff.newValue as boolean; break
          case "is_featured":      resolved.is_featured      = diff.newValue as boolean; break
          case "is_new":           resolved.is_new           = diff.newValue as boolean; break
          case "same_day_shipping":resolved.same_day_shipping= diff.newValue as boolean; break
          // brand_id/category_id diffs carry display names — use resolved UUID instead
          case "brand_id":    resolved.brand_id    = resolvedBrandId;    break
          case "category_id": resolved.category_id = resolvedCategoryId; break
        }
      }
      resolvedRows.push(resolved)
    }
  }

  // ── 6. Compute summary ───────────────────────────────────────────────────

  let rowsValid = 0, rowsWarning = 0, rowsError = 0, rowsNoChange = 0
  let fieldsChanged = 0, priceUpdates = 0, stockUpdates = 0
  let flagUpdates = 0, brandUpdates = 0, categoryUpdates = 0

  for (const r of rowResults) {
    switch (r.status) {
      case "valid":    rowsValid++;    break
      case "warning":  rowsWarning++;  break
      case "error":    rowsError++;    break
      case "no_change": rowsNoChange++; break
    }
    for (const d of r.diffs) {
      fieldsChanged++
      switch (d.field) {
        case "price":       priceUpdates++;    break
        case "stock":       stockUpdates++;    break
        case "brand_id":    brandUpdates++;    break
        case "category_id": categoryUpdates++; break
        default:            flagUpdates++;     break
      }
    }
  }

  const summary: UpdateValidationSummary = {
    rowsTotal: rows.length,
    rowsIgnored: ignoredCount,
    rowsValid,
    rowsWarning,
    rowsError,
    rowsNoChange,
    fieldsChanged,
    priceUpdates,
    stockUpdates,
    flagUpdates,
    brandUpdates,
    categoryUpdates,
  }

  return {
    summary,
    previewRows: rowResults.slice(0, PREVIEW_LIMIT),
    issueRows: rowResults.filter((r) => r.status === "error" || r.status === "warning"),
    resolvedRows,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Builder helper
// ─────────────────────────────────────────────────────────────────────────────

function makeResult(
  row: RawUpdateRow,
  productId: string | null,
  productName: string | null,
  status: UpdateRowStatus,
  errors: RowError[],
  warnings: RowError[],
  diffs: FieldDiff[],
): UpdateRowResult {
  return { rowNumber: row.rowNumber, sku: row.sku, productId, productName, status, errors, warnings, diffs }
}
