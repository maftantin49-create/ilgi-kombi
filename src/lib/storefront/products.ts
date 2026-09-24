import { createPublicServerClient } from "@/lib/supabase/server"
import type {
  StorefrontBrand,
  StorefrontProductCard,
  StorefrontProductDetail,
  StorefrontCompatibleDevice,
} from "./types"

// ── Constants ──────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 24
const MAX_PAGE_SIZE = 48

// ── Public types ───────────────────────────────────────────────────────────────

export type ProductSort =
  | "default"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "featured"
// "discount" (compare_at_price/price ratio) is not supported in Wave 1B:
// PostgREST cannot order by a computed expression without a DB view or generated column.
// Tracked as future debt — v0.3.0+ or a DB view addition.

export interface ProductListFilters {
  q?: string
  // Pre-resolved category IDs (self + descendants). Takes priority over categorySlug.
  // Set by the listing page after getCategoryDescendantIds(); enables R1 parent→child products.
  categoryIds?: string[]
  // Single-slug fallback (Wave 1B compat). Ignored when categoryIds is provided.
  categorySlug?: string
  brandSlug?: string
  inStock?: boolean
  sort?: ProductSort
  page?: number
  pageSize?: number
}

export interface ProductListResult {
  items: StorefrontProductCard[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ── Internal select strings ────────────────────────────────────────────────────

// Card: no description, no detail relations — keeps listing queries lean.
const CARD_SELECT = `
  id, slug, sku, name,
  price, compare_at_price, stock_quantity,
  image_url, hover_image_url,
  is_featured, is_new, same_day_shipping,
  brands!brand_id ( id, name, slug ),
  categories!category_id ( id, name, slug )
` as const

// Detail: full product + all embedded child tables.
const DETAIL_SELECT = `
  id, slug, sku, name, description, seo_title, seo_description,
  price, compare_at_price, stock_quantity,
  image_url, hover_image_url,
  is_featured, is_new, same_day_shipping, created_at,
  brands!brand_id ( id, name, slug ),
  categories!category_id ( id, name, slug, parent_id ),
  product_images ( id, url, alt_text, sort_order ),
  product_oem_codes ( id, code, manufacturer, sort_order ),
  product_specifications ( id, spec_key, spec_value, unit, sort_order ),
  product_device_models (
    device_models (
      id, family, series, model, category, year_from, year_to, is_active,
      brands!brand_id ( id, name, slug )
    )
  )
` as const

// ── Internal helpers ───────────────────────────────────────────────────────────

// PostgREST .or() filter string: , ( ) are syntax chars (OR separator / grouping).
// Strip them from user input to prevent malformed filter strings.
// This is a structural-safety measure; PostgREST uses parameterized SQL internally,
// so SQL injection via .ilike() values is not possible regardless.
function sanitizeSearchTerm(raw: string): string {
  return raw.trim().slice(0, 100).replace(/[,()\n\r]/g, " ").trim()
}

function mapCard(row: Record<string, unknown>): StorefrontProductCard {
  return {
    id: row.id as string,
    slug: row.slug as string,
    sku: row.sku as string,
    name: row.name as string,
    price: row.price as number,
    compare_at_price: row.compare_at_price as number | null,
    stock_quantity: row.stock_quantity as number,
    image_url: row.image_url as string | null,
    hover_image_url: row.hover_image_url as string | null,
    is_featured: row.is_featured as boolean,
    is_new: row.is_new as boolean,
    same_day_shipping: row.same_day_shipping as boolean,
    brand: (row.brands as StorefrontBrand | null) ?? null,
    category: (row.categories as { id: string; name: string; slug: string } | null) ?? null,
  }
}

const EMPTY_PAGE = (page: number, pageSize: number): ProductListResult => ({
  items: [],
  total: 0,
  page,
  pageSize,
  totalPages: 0,
})

// ── Query functions ────────────────────────────────────────────────────────────

export async function getStorefrontProducts(
  filters: ProductListFilters = {}
): Promise<ProductListResult> {
  const db = createPublicServerClient()

  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE))
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const searchTerm = filters.q ? sanitizeSearchTerm(filters.q) : null
  const hasSearch = !!searchTerm && searchTerm.length >= 2
  const needsCatSlugResolve = !filters.categoryIds?.length && !!filters.categorySlug
  const needsBrandSlugResolve = !!filters.brandSlug

  // ── Pre-resolve queries — run in parallel ────────────────────────────────────
  // brandSearchResult: IDs of brands whose name matches the search term (R2).
  // brandSlugResult:   ID of the brand whose slug matches the filter.
  // catSlugResult:     ID of the category whose slug matches the filter.
  type IdRow = { id: string }
  type MaybeRows = { data: IdRow[] | null; error: unknown }
  type MaybeRow = { data: IdRow | null; error: unknown }

  const fallbackRows: MaybeRows = { data: null, error: null }
  const fallbackRow: MaybeRow = { data: null, error: null }

  const [brandSearchResult, brandSlugResult, catSlugResult]: [MaybeRows, MaybeRow, MaybeRow] =
    await Promise.all([
      hasSearch
        ? (db.from("brands").select("id").eq("is_active", true).ilike("name", `%${searchTerm}%`) as unknown as Promise<MaybeRows>)
        : Promise.resolve(fallbackRows),
      needsBrandSlugResolve
        ? (db.from("brands").select("id").eq("slug", filters.brandSlug!).eq("is_active", true).single() as unknown as Promise<MaybeRow>)
        : Promise.resolve(fallbackRow),
      needsCatSlugResolve
        ? (db.from("categories").select("id").eq("slug", filters.categorySlug!).eq("is_active", true).single() as unknown as Promise<MaybeRow>)
        : Promise.resolve(fallbackRow),
    ])

  const searchBrandIds = (brandSearchResult.data ?? []).map((b) => b.id)
  const resolvedBrandId = brandSlugResult.data?.id ?? null
  const resolvedCatId = catSlugResult.data?.id ?? null

  if (needsBrandSlugResolve && !resolvedBrandId) return EMPTY_PAGE(page, pageSize)
  if (needsCatSlugResolve && !resolvedCatId) return EMPTY_PAGE(page, pageSize)

  // categoryIds: pre-resolved with descendants (R1) > slug-resolved single > none
  const categoryIds: string[] = filters.categoryIds?.length
    ? filters.categoryIds
    : resolvedCatId
    ? [resolvedCatId]
    : []

  // ── Main query ────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = db
    .from("products")
    .select(CARD_SELECT, { count: "exact" })
    .eq("is_active", true)

  // Category: .eq() for single, .in() for multiple (parent + descendants via R1)
  if (categoryIds.length === 1) {
    query = query.eq("category_id", categoryIds[0])
  } else if (categoryIds.length > 1) {
    query = query.in("category_id", categoryIds)
  }

  if (resolvedBrandId) query = query.eq("brand_id", resolvedBrandId)
  if (filters.inStock) query = query.gt("stock_quantity", 0)

  // Text search: name ILIKE + SKU ILIKE + brand_id IN matching brands (R2).
  // searchBrandIds are UUIDs from the DB — safe to interpolate into the filter string.
  if (hasSearch) {
    let orParts = `name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`
    if (searchBrandIds.length > 0) {
      orParts += `,brand_id.in.(${searchBrandIds.join(",")})`
    }
    query = query.or(orParts)
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true })
      break
    case "price_desc":
      query = query.order("price", { ascending: false })
      break
    case "featured":
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
  }

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    console.error("[storefront/products] getStorefrontProducts error:", error.message)
    return EMPTY_PAGE(page, pageSize)
  }

  const total = count ?? 0
  return {
    items: ((data ?? []) as Record<string, unknown>[]).map(mapCard),
    total,
    page,
    pageSize,
    totalPages: total > 0 ? Math.ceil(total / pageSize) : 0,
  }
}

export async function getStorefrontProductBySlug(
  slug: string
): Promise<StorefrontProductDetail | null> {
  const db = createPublicServerClient()

  const { data, error } = await db
    .from("products")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) {
    // PGRST116: "The result contains 0 rows" — expected for unknown or inactive slugs.
    if (error.code !== "PGRST116") {
      console.error(
        "[storefront/products] getStorefrontProductBySlug error:",
        error.message,
        { slug }
      )
    }
    return null
  }

  if (!data) return null

  const row = data as Record<string, unknown>

  const images = ((row.product_images ?? []) as Array<{
    id: string
    url: string
    alt_text: string | null
    sort_order: number
  }>)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)

  const oem_codes = ((row.product_oem_codes ?? []) as Array<{
    id: string
    code: string
    manufacturer: string | null
    sort_order: number
  }>)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)

  const specifications = ((row.product_specifications ?? []) as Array<{
    id: string
    spec_key: string
    spec_value: string
    unit: string | null
    sort_order: number
  }>)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)

  type RawDeviceModel = {
    id: string
    family: string | null
    series: string | null
    model: string
    category: string | null
    year_from: number | null
    year_to: number | null
    is_active: boolean
    brands: StorefrontBrand | null
  }

  const compatible_devices = (
    (row.product_device_models ?? []) as Array<{ device_models: RawDeviceModel | null }>
  )
    .map((pdm) => pdm.device_models)
    .filter((dm): dm is RawDeviceModel => dm !== null && dm.is_active)
    .map(
      (dm): StorefrontCompatibleDevice => ({
        id: dm.id,
        family: dm.family,
        series: dm.series,
        model: dm.model,
        category: dm.category,
        year_from: dm.year_from,
        year_to: dm.year_to,
        brand: dm.brands ?? { id: "", name: "", slug: "", is_featured: false, logo_url: null, sort_order: 0 },
      })
    )
    .sort((a, b) => a.model.localeCompare(b.model, "tr"))

  return {
    id: row.id as string,
    slug: row.slug as string,
    sku: row.sku as string,
    name: row.name as string,
    description: row.description as string | null,
    seo_title: row.seo_title as string | null,
    seo_description: row.seo_description as string | null,
    price: row.price as number,
    compare_at_price: row.compare_at_price as number | null,
    stock_quantity: row.stock_quantity as number,
    image_url: row.image_url as string | null,
    hover_image_url: row.hover_image_url as string | null,
    is_featured: row.is_featured as boolean,
    is_new: row.is_new as boolean,
    same_day_shipping: row.same_day_shipping as boolean,
    brand: (row.brands as StorefrontBrand | null) ?? null,
    category:
      (row.categories as {
        id: string
        name: string
        slug: string
        parent_id: string | null
      } | null) ?? null,
    images,
    oem_codes,
    specifications,
    compatible_devices,
  }
}

export async function getFeaturedStorefrontProducts(
  limit = 8
): Promise<StorefrontProductCard[]> {
  const db = createPublicServerClient()
  const safeLimit = Math.min(24, Math.max(1, limit))

  const { data, error } = await db
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit)

  if (error) {
    console.error(
      "[storefront/products] getFeaturedStorefrontProducts error:",
      error.message
    )
    return []
  }

  return ((data ?? []) as Record<string, unknown>[]).map(mapCard)
}

export async function getNewStorefrontProducts(limit = 8): Promise<StorefrontProductCard[]> {
  const db = createPublicServerClient()
  const safeLimit = Math.min(24, Math.max(1, limit))

  const { data, error } = await db
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .eq("is_new", true)
    .order("created_at", { ascending: false })
    .limit(safeLimit)

  if (error) {
    console.error("[storefront/products] getNewStorefrontProducts error:", error.message)
    return []
  }
  return ((data ?? []) as Record<string, unknown>[]).map(mapCard)
}

export async function getSameDayStorefrontProducts(limit = 8): Promise<StorefrontProductCard[]> {
  const db = createPublicServerClient()
  const safeLimit = Math.min(24, Math.max(1, limit))

  const { data, error } = await db
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .eq("same_day_shipping", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit)

  if (error) {
    console.error("[storefront/products] getSameDayStorefrontProducts error:", error.message)
    return []
  }
  return ((data ?? []) as Record<string, unknown>[]).map(mapCard)
}

export async function getDiscountedStorefrontProducts(limit = 8): Promise<StorefrontProductCard[]> {
  const db = createPublicServerClient()
  const safeLimit = Math.min(24, Math.max(1, limit))

  // Fetch more rows to allow client-side compare_at_price > price filtering.
  // PostgREST cannot compare two columns directly without a DB view.
  const { data, error } = await db
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .not("compare_at_price", "is", null)
    .gt("price", 0)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit * 3)

  if (error) {
    console.error("[storefront/products] getDiscountedStorefrontProducts error:", error.message)
    return []
  }

  return ((data ?? []) as Record<string, unknown>[])
    .map(mapCard)
    .filter((p) => p.compare_at_price !== null && p.compare_at_price > p.price)
    .slice(0, safeLimit)
}

export async function getRelatedStorefrontProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<StorefrontProductCard[]> {
  const db = createPublicServerClient()
  const safeLimit = Math.min(12, Math.max(1, limit))

  if (!categoryId) return []

  const { data, error } = await db
    .from("products")
    .select(CARD_SELECT)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit)

  if (error) {
    console.error(
      "[storefront/products] getRelatedStorefrontProducts error:",
      error.message
    )
    return []
  }

  return ((data ?? []) as Record<string, unknown>[]).map(mapCard)
}
