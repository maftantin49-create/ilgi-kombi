// ── WooCommerce API source types ──────────────────────────────────────────────

export type WcProductStatus = "publish" | "draft" | "private" | "pending" | "trash"
export type WcProductType   = "simple" | "variable" | "grouped" | "external"
export type WcStockStatus   = "instock" | "outofstock" | "onbackorder"

export interface WcImage {
  id:   number
  src:  string
  name: string
  alt:  string
}

export interface WcAttribute {
  id:        number
  name:      string
  position:  number
  visible:   boolean
  variation: boolean
  options:   string[]
}

export interface WcMetaData {
  id:    number
  key:   string
  value: unknown
}

export interface WcTaxonomyTerm {
  id:   number
  name: string
  slug: string
}

export interface WcCategory extends WcTaxonomyTerm {
  parent: number
  count:  number
  description: string
  image: { src: string; alt: string } | null
}

export interface WcBrand extends WcTaxonomyTerm {
  count: number
}

export interface WcProductAttribute {
  id:         number
  name:       string
  slug:       string
  has_archives: boolean
}

export interface WcProduct {
  id:                number
  name:              string
  slug:              string
  permalink:         string
  status:            WcProductStatus
  type:              WcProductType
  sku:               string
  regular_price:     string
  sale_price:        string
  price:             string
  stock_quantity:    number | null
  stock_status:      WcStockStatus
  manage_stock:      boolean
  categories:        WcTaxonomyTerm[]
  tags:              WcTaxonomyTerm[]
  attributes:        WcAttribute[]
  images:            WcImage[]
  description:       string
  short_description: string
  meta_data:         WcMetaData[]
}

// ── Normalised import model (target-aligned) ──────────────────────────────────

export interface WcImportRow {
  // Source tracing
  sourceId:        number
  sourceSlug:      string
  sourceStatus:    WcProductStatus
  sourceType:      WcProductType
  sourcePermalink: string
  sourceCategories: string[]

  // products table
  name:            string
  slug:            string
  sku:             string
  price:           number
  compareAtPrice:  number | null
  stockQuantity:   number
  stockStatus:     WcStockStatus
  brandName:       string | null
  categoryName:    string | null
  description:     string | null
  shortDescription: string | null
  imageUrls:       string[]        // [0]=image_url, [1]=hover_image_url, rest=product_images
  isActive:        boolean
  isFeatured:      boolean
  isNew:           boolean
  sameDayShipping: boolean
  compatibleBrands: string[] | null

  // product_oem_codes table
  oemCodes:        string[]

  // product_specifications table
  specifications:  Array<{ key: string; value: string; unit: string | null }>

  // For analysis / debugging
  wcAttributes:    Array<{ name: string; options: string[] }>
  wcMetaKeys:      string[]
}

// ── Brand normalization ───────────────────────────────────────────────────────

export interface BrandNormEntry {
  raw:        string
  normalized: string
  note:       string
}

// Phase 5 known issues — seed for normalization map
// Actual map must be confirmed against live API data
export const SUGGESTED_BRAND_NORM: BrandNormEntry[] = [
  { raw: "E.C.A",     normalized: "ECA",      note: "Phase5: punctuation variant" },
  { raw: "Immergaz",  normalized: "Immergas", note: "Phase5: misspelling" },
]

// ── Redirect map entry ────────────────────────────────────────────────────────

export interface RedirectEntry {
  sourceUrl:  string  // /urun/{old-slug}/
  targetUrl:  string  // /urunler/{normalized-slug}
  type:       "product" | "category" | "brand"
  slugChanged: boolean
}

// ── Dry-run report ────────────────────────────────────────────────────────────

export interface SkuAuditResult {
  total:          number
  missing:        number       // empty sku
  duplicates:     number       // intra-dataset dupes
  duplicateGroups: Array<{ sku: string; sourceIds: number[] }>
  whitespace:     number
  numericOnly:    number
  leadingZero:    number
  unusualChars:   number
  unusualSamples: string[]
}

export interface ValidationIssue {
  field:   string
  message: string
  kind:    "error" | "warning"
}

export interface RowValidationResult {
  sourceId:   number
  name:       string
  sku:        string
  finalSlug:  string
  issues:     ValidationIssue[]
  status:     "ok" | "warning" | "blocked"
}
