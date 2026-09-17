// Normalization for bulk-update Excel rows.
//
// IMPORTANT — different semantics from import/normalize.ts:
//   Empty cell   → absent (undefined key)   — DO NOT UPDATE
//   TEMİZLE      → null                     — set to NULL (brand/category only)
//   Ambiguous bool → parse error            — NOT silently coerced to false
//
// This file must NOT import from import/normalize.ts to avoid semantic bleed.

// ─────────────────────────────────────────────────────────────────────────────
// TR character map (duplicated intentionally — isolated from import semantics)
// ─────────────────────────────────────────────────────────────────────────────

const TR_MAP: Record<string, string> = {
  ş: "s", Ş: "s", ı: "i", İ: "i", ğ: "g", Ğ: "g",
  ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c",
}

function trNorm(s: string): string {
  return s
    .split("")
    .map((c) => TR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Header normalization
// ─────────────────────────────────────────────────────────────────────────────

const UPDATE_HEADER_MAP: Record<string, string> = {
  // SKU
  sku: "sku", "stok kodu": "sku", "urun kodu": "sku", "urun no": "sku",
  // price
  fiyat: "price", "satis fiyati": "price", price: "price",
  // stock
  stok: "stock", "stok miktari": "stock", stock: "stock",
  // flags — no default values (absent = skip)
  aktif: "is_active", is_active: "is_active", active: "is_active",
  "urun durumu": "is_active",
  "one cikan": "is_featured", is_featured: "is_featured", featured: "is_featured",
  yeni: "is_new", is_new: "is_new", new: "is_new",
  "ayni gun kargo": "same_day_shipping", same_day_shipping: "same_day_shipping",
  // classification
  marka: "brand", brand: "brand",
  kategori: "category", category: "category",
}

export function normalizeUpdateHeader(raw: string): string {
  const key = raw
    .replace(/[★☆]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return UPDATE_HEADER_MAP[trNorm(key)] ?? key
}

// ─────────────────────────────────────────────────────────────────────────────
// SKU normalization (mirrors DB exact-match behavior: trim only)
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeSku(raw: unknown): string {
  return String(raw ?? "").trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// 3-state boolean parse
// ─────────────────────────────────────────────────────────────────────────────

type BoolParseResult =
  | { kind: "value"; value: boolean }
  | { kind: "absent" }
  | { kind: "error"; input: string }

const BOOL_TRUE  = new Set(["1", "true", "evet", "yes", "aktif", "on"])
const BOOL_FALSE = new Set(["0", "false", "hayir", "no", "pasif", "off"])

export function parseBoolUpdate(raw: unknown): BoolParseResult {
  if (raw === null || raw === undefined || raw === "") return { kind: "absent" }
  if (typeof raw === "boolean") return { kind: "value", value: raw }
  if (typeof raw === "number") {
    if (raw === 1) return { kind: "value", value: true }
    if (raw === 0) return { kind: "value", value: false }
    return { kind: "error", input: String(raw) }
  }
  const s = trNorm(String(raw))
  if (s === "") return { kind: "absent" }
  if (BOOL_TRUE.has(s))  return { kind: "value", value: true }
  if (BOOL_FALSE.has(s)) return { kind: "value", value: false }
  return { kind: "error", input: String(raw).trim() }
}

// ─────────────────────────────────────────────────────────────────────────────
// Numeric parse (absent-aware)
// ─────────────────────────────────────────────────────────────────────────────

type NumParseResult =
  | { kind: "value"; value: number }
  | { kind: "absent" }
  | { kind: "error"; input: string }

export function parsePriceUpdate(raw: unknown): NumParseResult {
  if (raw === null || raw === undefined || raw === "") return { kind: "absent" }
  const n = parseFloat(String(raw).replace(",", "."))
  if (isNaN(n)) return { kind: "error", input: String(raw).trim() }
  return { kind: "value", value: Math.round(n * 100) / 100 }
}

export function parseStockUpdate(raw: unknown): NumParseResult {
  if (raw === null || raw === undefined || raw === "") return { kind: "absent" }
  const n = parseFloat(String(raw).replace(",", "."))
  if (isNaN(n)) return { kind: "error", input: String(raw).trim() }
  return { kind: "value", value: Math.floor(n) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Classification parse (brand / category)
//   ""          → absent (do not update)
//   "TEMİZLE"   → clear (set NULL)
//   "Bosch"     → value (name to resolve)
// ─────────────────────────────────────────────────────────────────────────────

type ClassParseResult =
  | { kind: "value"; name: string }
  | { kind: "clear" }
  | { kind: "absent" }

const CLEAR_NORM = "temizle"

export function parseClassificationUpdate(raw: unknown): ClassParseResult {
  if (raw === null || raw === undefined || raw === "") return { kind: "absent" }
  const s = String(raw).trim()
  if (s === "") return { kind: "absent" }
  if (trNorm(s) === CLEAR_NORM) return { kind: "clear" }
  return { kind: "value", name: s }
}

// ─────────────────────────────────────────────────────────────────────────────
// Row model
// ─────────────────────────────────────────────────────────────────────────────

export interface RawUpdateRow {
  rowNumber: number        // 1-based Excel row number
  sku: string              // trimmed (may be empty if skuPresent=false)
  skuPresent: boolean      // true when SKU cell was non-empty

  // Update fields — key absent = do NOT update that field
  price?: number
  stock?: number
  is_active?: boolean
  is_featured?: boolean
  is_new?: boolean
  same_day_shipping?: boolean
  brand?: string | null    // string = name; null = TEMİZLE
  category?: string | null

  // Parse-time errors (ambiguous booleans, invalid numerics)
  parseErrors: { field: string; message: string }[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Main normalize — returns null for fully blank rows (ignored)
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeUpdateRow(
  raw: Record<string, unknown>,
  rowNumber: number,
): RawUpdateRow | null {
  // Map raw Excel headers → internal field names
  const mapped: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(raw)) {
    mapped[normalizeUpdateHeader(k)] = v
  }

  const sku = normalizeSku(mapped["sku"])
  const skuPresent = sku.length > 0

  // Fully blank row detection (SKU + all 8 update fields empty → ignore)
  const UPDATE_FIELD_KEYS = [
    "price", "stock", "is_active", "is_featured",
    "is_new", "same_day_shipping", "brand", "category",
  ]
  const allFieldsBlank = UPDATE_FIELD_KEYS.every((f) => {
    const v = mapped[f]
    return v === null || v === undefined || v === ""
  })
  if (!skuPresent && allFieldsBlank) return null

  const parseErrors: { field: string; message: string }[] = []

  // ── Price ────────────────────────────────────────────────────────────────
  const priceResult = parsePriceUpdate(mapped["price"])
  let price: number | undefined
  if (priceResult.kind === "value") {
    price = priceResult.value
  } else if (priceResult.kind === "error") {
    parseErrors.push({ field: "price", message: `Geçersiz fiyat: "${priceResult.input}"` })
  }

  // ── Stock ────────────────────────────────────────────────────────────────
  const stockResult = parseStockUpdate(mapped["stock"])
  let stock: number | undefined
  if (stockResult.kind === "value") {
    stock = stockResult.value
  } else if (stockResult.kind === "error") {
    parseErrors.push({ field: "stock", message: `Geçersiz stok: "${stockResult.input}"` })
  }

  // ── Flags ────────────────────────────────────────────────────────────────
  const FLAG_DEFS = [
    { key: "is_active" as const,         label: "Aktif" },
    { key: "is_featured" as const,       label: "Öne Çıkan" },
    { key: "is_new" as const,            label: "Yeni" },
    { key: "same_day_shipping" as const, label: "Aynı Gün Kargo" },
  ]
  const flags: Partial<Record<"is_active" | "is_featured" | "is_new" | "same_day_shipping", boolean>> = {}
  for (const { key, label } of FLAG_DEFS) {
    const r = parseBoolUpdate(mapped[key])
    if (r.kind === "value") {
      flags[key] = r.value
    } else if (r.kind === "error") {
      parseErrors.push({ field: key, message: `"${label}" için tanınmayan değer: "${r.input}"` })
    }
  }

  // ── Brand / Category ─────────────────────────────────────────────────────
  let brand: string | null | undefined
  const brandResult = parseClassificationUpdate(mapped["brand"])
  if (brandResult.kind === "value") brand = brandResult.name
  else if (brandResult.kind === "clear") brand = null
  // absent → brand stays undefined (key not added to result)

  let category: string | null | undefined
  const catResult = parseClassificationUpdate(mapped["category"])
  if (catResult.kind === "value") category = catResult.name
  else if (catResult.kind === "clear") category = null

  // ── Build result — only add keys that have values ─────────────────────────
  // Absent key means "do not update". We rely on "key in row" checks in validate.ts.
  const result: RawUpdateRow = { rowNumber, sku, skuPresent, parseErrors }
  if (price !== undefined)          result.price          = price
  if (stock !== undefined)          result.stock          = stock
  if (flags.is_active !== undefined)         result.is_active         = flags.is_active
  if (flags.is_featured !== undefined)       result.is_featured       = flags.is_featured
  if (flags.is_new !== undefined)            result.is_new            = flags.is_new
  if (flags.same_day_shipping !== undefined) result.same_day_shipping = flags.same_day_shipping
  if (brand !== undefined)          result.brand          = brand    // null = TEMİZLE
  if (category !== undefined)       result.category       = category

  return result
}
