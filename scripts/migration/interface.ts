// ── Yoast SEO structured data ─────────────────────────────────────────────────

export interface YoastSeoData {
  title?:               string
  description?:         string
  robots?:              Record<string, string>
  canonical?:           string
  og_locale?:           string
  og_type?:             string
  og_title?:            string
  og_description?:      string
  og_url?:              string
  og_site_name?:        string
  og_image?:            Array<{ url: string; width?: number; height?: number; type?: string }>
  twitter_card?:        string
  twitter_title?:       string
  twitter_description?: string
  twitter_misc?:        Record<string, string>
  schema?:              unknown
}

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
  parent:      number
  count:       number
  description: string
  display?:    string
  menu_order?: number
  image:       { id?: number; src: string; name?: string; alt: string } | null
  yoast_head?:      string
  yoast_head_json?: YoastSeoData
}

export interface WcBrand extends WcTaxonomyTerm {
  count:        number
  description?: string
  image?:       { id: number; src: string; name: string; alt: string } | null
  yoast_head?:      string
  yoast_head_json?: YoastSeoData
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
  brands:            WcTaxonomyTerm[]   // Perfect Brands plugin — top-level field
  tags:              WcTaxonomyTerm[]
  attributes:        WcAttribute[]
  images:            WcImage[]
  description:       string
  short_description: string
  meta_data:         WcMetaData[]
  // Full-response fields (present in individual + paginated responses)
  date_created?:        string
  date_modified?:       string
  featured?:            boolean
  catalog_visibility?:  string
  tax_status?:          string
  tax_class?:           string
  date_on_sale_from?:   string | null
  date_on_sale_to?:     string | null
  backorders?:          string
  backorders_allowed?:  boolean
  backordered?:         boolean
  sold_individually?:   boolean
  weight?:              string
  upsell_ids?:          number[]
  cross_sell_ids?:      number[]
  parent_id?:           number
  purchase_note?:       string
  menu_order?:          number
  yoast_head?:          string           // raw HTML — skip in archive; use yoast_head_json
  yoast_head_json?:     YoastSeoData
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

// ── WordPress public page ─────────────────────────────────────────────────────

export interface WpPage {
  id:             number
  date:           string
  slug:           string
  status:         string
  link:           string
  title:          { rendered: string }
  content:        { rendered: string; protected: boolean }
  excerpt:        { rendered: string; protected: boolean }
  parent:         number
  menu_order:     number
  featured_media: number
  yoast_head?:      string
  yoast_head_json?: YoastSeoData
}

// ── Archive output types ──────────────────────────────────────────────────────

export interface SeoSnapshot {
  title:          string | null
  description:    string | null
  canonical:      string | null
  robots:         Record<string, string> | null
  ogTitle:        string | null
  ogDescription:  string | null
  ogImage:        string | null
  ogType:         string | null
  twitterCard:    string | null
  twitterTitle:   string | null
  twitterDesc:    string | null
}

export interface ArchivedProduct {
  // Source identity
  sourceId:             number
  sourceName:           string
  sourceSlug:           string
  sourceUrl:            string
  sourceStatus:         WcProductStatus
  sourceType:           WcProductType
  sourceDateCreated:    string
  sourceDateModified:   string
  sourceFeatured:       boolean
  sourceCatalogVisible: string
  sourceMenuOrder:      number
  // Taxonomy
  sourceCategories: Array<{ id: number; name: string; slug: string }>
  sourceBrands:     Array<{ id: number; name: string; slug: string }>
  sourceTags:       Array<{ id: number; name: string; slug: string }>
  // Commerce
  skuOriginal:      string
  sku:              string      // WC-{id} fallback applied
  price:            number
  compareAtPrice:   number | null
  regularPrice:     string
  salePrice:        string
  stockStatus:      WcStockStatus
  stockQuantity:    number
  manageStock:      boolean
  backorders:       string
  soldIndividually: boolean
  taxStatus:        string
  taxClass:         string
  dateOnSaleFrom:   string | null
  dateOnSaleTo:     string | null
  // Content
  name:             string
  description:      string | null
  shortDescription: string | null
  purchaseNote:     string | null
  // Images — full metadata
  images: Array<{ id: number; src: string; name: string; alt: string; position: number }>
  // SEO
  seo: SeoSnapshot
  // Additional data
  oemCodes:         string[]
  specifications:   Array<{ key: string; value: string; unit: string | null }>
  compatibleBrands: string[] | null
  // Normalized target values
  normalizedSlug:      string
  brandNameOriginal:   string | null
  brandNameNormalized: string | null
  categoryName:        string | null
  isActive:            boolean
  // Redirect
  redirect: { sourceUrl: string; targetUrl: string; slugChanged: boolean }
  // Import status
  importStatus:      "ready" | "warning" | "blocked"
  importBlockReason: string | null
  importWarnings:    string[]
  // Relations
  upsellIds:   number[]
  crossSellIds: number[]
  // Non-credential meta
  meta: Array<{ key: string; value: unknown }>
}

export interface ArchivedCategory {
  sourceId:      number
  name:          string
  slug:          string
  parent:        number
  description:   string | null
  display:       string | null
  image:         { src: string; alt: string } | null
  menuOrder:     number
  productCount:  number
  sourceUrl:     string
  normalizedSlug: string
  seo:           SeoSnapshot
  redirect:      { sourceUrl: string; targetUrl: string; slugChanged: boolean }
}

export interface ArchivedBrand {
  sourceId:        number
  nameOriginal:    string
  nameNormalized:  string
  slug:            string
  description:     string | null
  image:           { src: string; alt: string } | null
  productCount:    number
  sourceUrl:       string
  normalizedSlug:  string
  seo:             SeoSnapshot
  redirect:        { sourceUrl: string; targetUrl: string; nameChanged: boolean }
}

export interface ArchivedPage {
  sourceId:     number
  title:        string
  slug:         string
  status:       string
  link:         string
  content:      string
  excerpt:      string | null
  menuOrder:    number
  seo:          SeoSnapshot
  targetPath:   string | null   // intended path in new site (null = no direct equivalent)
  migrationNote: string | null
}

// ── SEO schema gap ────────────────────────────────────────────────────────────

export interface SeoSchemaGap {
  field:          string
  sourceAvailable: boolean
  targetSupported: boolean
  recommendedColumn: string | null
  sampleValue:    string | null
}
