const TR_MAP: Record<string, string> = {
  ş: "s", Ş: "s", ı: "i", İ: "i", ğ: "g", Ğ: "g",
  ü: "u", Ü: "u", ö: "o", Ö: "o", ç: "c", Ç: "c",
}

// Marka/kategori eşleşmesi için normalize: TR harfler → ASCII, lowercase, trim.
// Türkçe I problemi: İ→i ve ı→i (TR_MAP), I→i (.toLowerCase()).
// Hem DB key hem kullanıcı girişi için aynı fonksiyon kullanılmalı.
export function normalizeName(s: string): string {
  return s
    .split("")
    .map((c) => TR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .trim()
}

export function slugify(text: string): string {
  return text
    .split("")
    .map((c) => TR_MAP[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Canonical header aliases → internal field name
const HEADER_MAP: Record<string, string> = {
  // name
  ad: "name", "ürün adı": "name", "urun adi": "name", name: "name",
  // slug
  slug: "slug", "url slug": "slug",
  // sku — "ürün kodu" müşteri şablonunda
  sku: "sku", "stok kodu": "sku", "ürün kodu": "sku",
  // description — detaylı açıklama kısa açıklamayı ezer (Excel'de soldan sağa)
  açıklama: "description", aciklama: "description", description: "description",
  açıklaması: "description", "kısa açıklama": "description",
  "detaylı açıklama": "description",
  // price
  fiyat: "price", "satış fiyatı": "price", price: "price",
  // compare_at_price
  "karşılaştırma fiyatı": "compare_at_price", "liste fiyatı": "compare_at_price",
  "indirimli fiyat": "compare_at_price", compare_at_price: "compare_at_price",
  // stock_quantity
  stok: "stock_quantity", "stok miktarı": "stock_quantity", stock: "stock_quantity",
  stock_quantity: "stock_quantity",
  // brand
  marka: "brand", brand: "brand",
  // category
  kategori: "category", category: "category",
  // compatible_brands
  "uyumlu markalar": "compatible_brands", compatible_brands: "compatible_brands",
  // images — "resim 1" / "resim 2" müşteri şablonunda
  "görsel url": "image_url", image_url: "image_url", "resim url": "image_url",
  "resim 1": "image_url",
  "hover görsel": "hover_image_url", hover_image_url: "hover_image_url",
  "resim 2": "hover_image_url",
  // oem
  "oem / orijinal no": "oem_code", "oem kodu": "oem_code", "oem kod": "oem_code",
  "alternatif oem": "oem_code_alt",
  // booleans
  aktif: "is_active", is_active: "is_active", active: "is_active",
  "ürün durumu": "is_active",
  öne_çıkan: "is_featured", is_featured: "is_featured", featured: "is_featured",
  yeni: "is_new", is_new: "is_new", new: "is_new",
  "aynı gün kargo": "same_day_shipping", same_day_shipping: "same_day_shipping",
}

export function normalizeHeader(raw: string): string {
  // ★ ve ☆ karakterleri müşteri şablonlarında zorunlu alanları işaretlemek için kullanılıyor;
  // mapping öncesi kaldırılması gerekiyor.
  const key = raw.replace(/[★☆]/g, "").trim().toLowerCase().replace(/\s+/g, " ")
  return HEADER_MAP[key] ?? key
}

function parseBool(v: unknown): boolean {
  if (typeof v === "boolean") return v
  if (typeof v === "number") return v !== 0
  const s = String(v).trim().toLowerCase()
  return ["1", "true", "evet", "yes", "aktif", "on"].includes(s)
}

function parseNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null
  let s = String(v).trim()
  // Turkish thousands+decimal: "1.299,90" → 1299.90
  if (s.includes(",") && s.includes(".")) {
    s = s.replace(/\./g, "").replace(",", ".")
  } else {
    s = s.replace(",", ".")
  }
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function parseCompatibleBrands(v: unknown): string[] | null {
  if (!v) return null
  return String(v)
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export interface RawImportRow {
  /** original zero-based index in sheet */
  index: number
  name: string
  slug: string
  /** true: kullanıcı slug sütununu doldurdu → STRICT kontrol; false: name'den otomatik türetildi → suffix eklenir */
  slugProvided: boolean
  sku: string
  description: string | null
  price: number | null
  compare_at_price: number | null
  stock_quantity: number | null
  brand: string | null
  category: string | null
  compatible_brands: string[] | null
  image_url: string | null
  hover_image_url: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  same_day_shipping: boolean
}

export function normalizeRow(raw: Record<string, unknown>, index: number): RawImportRow {
  const get = (field: string) => raw[field]

  const nameRaw = String(get("name") ?? "").trim()
  const slugRaw = String(get("slug") ?? "").trim()

  return {
    index,
    name: nameRaw,
    slug: slugRaw || slugify(nameRaw),
    slugProvided: slugRaw.length > 0,
    sku: String(get("sku") ?? "").trim(),
    description: get("description") ? String(get("description")).trim() || null : null,
    price: parseNum(get("price")),
    compare_at_price: parseNum(get("compare_at_price")),
    stock_quantity: (() => {
      const n = parseNum(get("stock_quantity"))
      return n !== null ? Math.floor(n) : null
    })(),
    brand: get("brand") ? String(get("brand")).trim() || null : null,
    category: get("category") ? String(get("category")).trim() || null : null,
    compatible_brands: parseCompatibleBrands(get("compatible_brands")),
    image_url: get("image_url") ? String(get("image_url")).trim() || null : null,
    hover_image_url: get("hover_image_url") ? String(get("hover_image_url")).trim() || null : null,
    is_active: parseBool(get("is_active") ?? true),
    is_featured: parseBool(get("is_featured") ?? false),
    is_new: parseBool(get("is_new") ?? false),
    same_day_shipping: parseBool(get("same_day_shipping") ?? false),
  }
}
