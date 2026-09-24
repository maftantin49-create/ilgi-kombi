import { createServiceClient } from "@/lib/supabase/server"
import { getBrandsForSelect, getCategoriesForSelect } from "@/lib/admin/products"

export { getBrandsForSelect, getCategoriesForSelect }

export const INVENTORY_PAGE_SIZE = 30
export const MOVEMENT_PAGE_SIZE = 20

export type StockStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "critical_reservation"

export type StockItem = {
  id: string
  sku: string
  name: string
  image_url: string | null
  stock_quantity: number
  track_stock: boolean
  reserved_stock: number
  available_stock: number
  status: StockStatus
  last_movement_at: string | null
  last_movement_type: string | null
  brands: { name: string } | null
  categories: { name: string } | null
}

export type InventoryFilters = {
  search?: string
  brandId?: string
  categoryId?: string
  status?: string
  page?: number
}

export type MovementHistoryItem = {
  id: string
  product_id: string
  order_id: string | null
  type: string
  quantity: number
  reason: string | null
  created_at: string
  products: { sku: string; name: string } | null
  orders: { order_number: string } | null
}

export type ProductStockDetail = {
  id: string
  sku: string
  name: string
  stock_quantity: number
  reserved_stock: number
  available_stock: number
}

function getStockStatus(available: number, reserved: number): StockStatus {
  if (available <= 0) return "out_of_stock"
  if (available <= 5) return "low_stock"
  if (reserved > available) return "critical_reservation"
  return "in_stock"
}

export async function getStockList(filters: InventoryFilters) {
  const db = createServiceClient()

  // DB-level filters: search, brand, category
  let query = db
    .from("products")
    .select("id, sku, name, image_url, stock_quantity, track_stock, brands(name), categories(name)")
    .order("name")

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
  }
  if (filters.brandId) query = query.eq("brand_id", filters.brandId)
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId)

  const { data: rawProducts } = await query

  if (!rawProducts || rawProducts.length === 0) {
    return { items: [], total: 0, page: 1, pageSize: INVENTORY_PAGE_SIZE }
  }

  type RawProduct = {
    id: string
    sku: string
    name: string
    image_url: string | null
    stock_quantity: number
    track_stock: boolean
    brands: { name: string } | null
    categories: { name: string } | null
  }

  const products = rawProducts as RawProduct[]
  const productIds = products.map((p) => p.id)

  // Active reservations for this product set
  const { data: reservations } = await db
    .from("inventory_reservations")
    .select("product_id, quantity")
    .in("product_id", productIds)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())

  // Last movement per product — bounded fetch
  const { data: movements } = await db
    .from("inventory_movements")
    .select("product_id, created_at, type")
    .in("product_id", productIds)
    .order("created_at", { ascending: false })
    .limit(productIds.length * 5)

  // Build lookup maps
  const reservedMap = new Map<string, number>()
  for (const r of (reservations ?? []) as { product_id: string; quantity: number }[]) {
    reservedMap.set(r.product_id, (reservedMap.get(r.product_id) ?? 0) + r.quantity)
  }

  const lastMoveMap = new Map<string, { created_at: string; type: string }>()
  for (const m of (movements ?? []) as { product_id: string; created_at: string; type: string }[]) {
    if (!lastMoveMap.has(m.product_id)) {
      lastMoveMap.set(m.product_id, { created_at: m.created_at, type: m.type })
    }
  }

  // Enrich products with computed stock fields
  const enriched: StockItem[] = products.map((p) => {
    const reserved = reservedMap.get(p.id) ?? 0
    const available = p.stock_quantity - reserved
    const lastMov = lastMoveMap.get(p.id)
    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      image_url: p.image_url,
      stock_quantity: p.stock_quantity,
      track_stock: p.track_stock,
      reserved_stock: reserved,
      available_stock: available,
      status: p.track_stock ? getStockStatus(available, reserved) : "in_stock",
      last_movement_at: lastMov?.created_at ?? null,
      last_movement_type: lastMov?.type ?? null,
      brands: p.brands,
      categories: p.categories,
    }
  })

  // Status filter requires reservation data, so it's applied in TypeScript after enrichment
  const filtered =
    filters.status ? enriched.filter((p) => p.status === filters.status) : enriched

  const total = filtered.length
  const page = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * INVENTORY_PAGE_SIZE

  return {
    items: filtered.slice(offset, offset + INVENTORY_PAGE_SIZE),
    total,
    page,
    pageSize: INVENTORY_PAGE_SIZE,
  }
}

export async function getMovementHistory(page: number) {
  const db = createServiceClient()
  const offset = (Math.max(1, page) - 1) * MOVEMENT_PAGE_SIZE

  const { data, count } = await db
    .from("inventory_movements")
    .select(
      "id, product_id, order_id, type, quantity, reason, created_at, products(sku, name), orders(order_number)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + MOVEMENT_PAGE_SIZE - 1)

  return {
    movements: (data ?? []) as MovementHistoryItem[],
    count: count ?? 0,
  }
}

export async function getProductStockDetail(
  id: string
): Promise<ProductStockDetail | null> {
  const db = createServiceClient()

  // Destructure immediately (vs. storing full result object) — matches the
  // pattern in getProductById which works with TypeScript 5.9 + Supabase 2.x.
  const { data: productData } = await db
    .from("products")
    .select("id, sku, name, stock_quantity")
    .eq("id", id)
    .single()

  if (!productData) return null

  const { data: reservationData } = await db
    .from("inventory_reservations")
    .select("quantity")
    .eq("product_id", id)
    .eq("status", "active")
    .gt("expires_at", new Date().toISOString())

  const p = productData as { id: string; sku: string; name: string; stock_quantity: number }
  const reserved = ((reservationData ?? []) as { quantity: number }[]).reduce(
    (sum, r) => sum + r.quantity,
    0
  )

  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    stock_quantity: p.stock_quantity,
    reserved_stock: reserved,
    available_stock: p.stock_quantity - reserved,
  }
}
