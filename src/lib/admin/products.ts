import { createServiceClient } from "@/lib/supabase/server"

export const PRODUCTS_PAGE_SIZE = 20

export type ProductFilters = {
  search?: string
  brandId?: string
  categoryId?: string
  active?: string   // "true" | "false" | undefined = all
  stock?: string    // "in_stock" | "low" | "out" | undefined = all
  page?: number
}

export type ProductListItem = {
  id: string
  sku: string
  name: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  same_day_shipping: boolean
  image_url: string | null
  created_at: string
  brands: { name: string } | null
  categories: { name: string } | null
}

export type ProductDetail = {
  id: string
  slug: string
  sku: string
  name: string
  description: string | null
  price: number
  compare_at_price: number | null
  stock_quantity: number
  brand_id: string | null
  category_id: string | null
  compatible_brands: string[] | null
  image_url: string | null
  hover_image_url: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  same_day_shipping: boolean
  seo_title: string | null
  seo_description: string | null
  track_stock: boolean
  short_description: string | null
  created_at: string
  updated_at: string
}

export type SelectOption = { id: string; name: string }

export async function getProducts(filters: ProductFilters) {
  const db = createServiceClient()
  const page = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * PRODUCTS_PAGE_SIZE

  // Build query with filters applied
  let query = db
    .from("products")
    .select(
      "id, sku, name, price, compare_at_price, stock_quantity, is_active, is_featured, is_new, same_day_shipping, image_url, created_at, brands(name), categories(name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PRODUCTS_PAGE_SIZE - 1)

  if (filters.search) {
    const searchTerm = filters.search
    // OEM exact-match search: normalize query and look up in product_oem_codes.
    // Gracefully skips if table does not exist yet (migration pending).
    const normSearch = searchTerm.trim().replace(/[\s\-./]/g, "").toUpperCase()
    let oemProductIds: string[] = []
    if (normSearch.length >= 2) {
      const { data: oemMatches } = await anyDb()
        .from("product_oem_codes")
        .select("product_id")
        .eq("code_norm", normSearch)
        .limit(50)
      oemProductIds = ((oemMatches ?? []) as { product_id: string }[]).map(
        (r) => r.product_id
      )
    }
    if (oemProductIds.length > 0) {
      query = query.or(
        `name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,id.in.(${oemProductIds.join(",")})`
      )
    } else {
      query = query.or(
        `name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`
      )
    }
  }

  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId)
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId)
  }

  if (filters.active === "true") {
    query = query.eq("is_active", true)
  } else if (filters.active === "false") {
    query = query.eq("is_active", false)
  }

  if (filters.stock === "in_stock") {
    query = query.gte("stock_quantity", 5)
  } else if (filters.stock === "low") {
    query = query.gt("stock_quantity", 0).lt("stock_quantity", 5).eq("track_stock", true)
  } else if (filters.stock === "out") {
    query = query.eq("stock_quantity", 0).eq("track_stock", true)
  }

  const { data, count, error } = await query

  return {
    products: (data as ProductListItem[]) ?? [],
    count: count ?? 0,
    pageSize: PRODUCTS_PAGE_SIZE,
    error: error?.message,
  }
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  const db = createServiceClient()
  const { data } = await db
    .from("products")
    .select("id, slug, sku, name, description, short_description, seo_title, seo_description, price, compare_at_price, stock_quantity, track_stock, brand_id, category_id, compatible_brands, image_url, hover_image_url, is_active, is_featured, is_new, same_day_shipping, created_at, updated_at")
    .eq("id", id)
    .single()

  if (!data) return null

  const row = data as ProductDetail
  return {
    ...row,
    compatible_brands: Array.isArray(row.compatible_brands)
      ? row.compatible_brands
      : null,
  }
}

export type ProductImage = {
  id: string
  product_id: string
  url: string
  storage_path: string
  alt_text: string | null
  sort_order: number
  created_at: string
}

export type ProductOemCode = {
  id: string
  product_id: string
  code: string
  code_norm: string
  manufacturer: string | null
  note: string | null
  sort_order: number
  created_at: string
}

export type ProductSpecification = {
  id: string
  product_id: string
  spec_key: string
  spec_key_norm: string
  spec_value: string
  unit: string | null
  sort_order: number
}

export type ProductDevice = {
  device_model_id: string
  note: string | null
  device_models: {
    id: string
    model: string
    category: string | null
    brands: { name: string } | null
  } | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyDb = () => createServiceClient() as any

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await anyDb()
    .from("product_images")
    .select("id, product_id, url, storage_path, alt_text, sort_order, created_at")
    .eq("product_id", productId)
    .order("sort_order")
  if (error) return []
  return (data ?? []) as ProductImage[]
}

export async function getProductOemCodes(productId: string): Promise<ProductOemCode[]> {
  const { data, error } = await anyDb()
    .from("product_oem_codes")
    .select("id, product_id, code, code_norm, manufacturer, note, sort_order, created_at")
    .eq("product_id", productId)
    .order("sort_order")
  if (error) return []
  return (data ?? []) as ProductOemCode[]
}

export async function getProductSpecifications(productId: string): Promise<ProductSpecification[]> {
  const { data, error } = await anyDb()
    .from("product_specifications")
    .select("id, product_id, spec_key, spec_key_norm, spec_value, unit, sort_order")
    .eq("product_id", productId)
    .order("sort_order")
  if (error) return []
  return (data ?? []) as ProductSpecification[]
}

export async function getProductDevices(productId: string): Promise<ProductDevice[]> {
  const { data, error } = await anyDb()
    .from("product_device_models")
    .select("device_model_id, note, device_models(id, model, category, brands(name))")
    .eq("product_id", productId)
  if (error) return []
  return (data ?? []) as ProductDevice[]
}

export async function getBrandsForSelect(): Promise<SelectOption[]> {
  const db = createServiceClient()
  const { data } = await db
    .from("brands")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  return (data ?? []) as SelectOption[]
}

export async function getCategoriesForSelect(): Promise<SelectOption[]> {
  const db = createServiceClient()
  const { data } = await db
    .from("categories")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  return (data ?? []) as SelectOption[]
}
