import { createServiceClient } from "@/lib/supabase/server"
import type { InventoryMovementType } from "@/types/database.types"

export interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalBrands: number
  totalCategories: number
}

export type RecentProduct = {
  id: string
  name: string
  sku: string
  price: number
  stock_quantity: number
  is_active: boolean
  created_at: string
  brands: { name: string } | null
  categories: { name: string } | null
}

export type LowStockProduct = {
  id: string
  name: string
  sku: string
  stock_quantity: number
  brands: { name: string } | null
}

export type RecentMovement = {
  id: string
  type: InventoryMovementType
  quantity: number
  reason: string | null
  created_at: string
  products: { name: string; sku: string } | null
}

const LOW_STOCK_THRESHOLD = 5

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = createServiceClient()

  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: lowStockProducts },
    { count: outOfStockProducts },
    { count: totalBrands },
    { count: totalCategories },
  ] = await Promise.all([
    db.from("products").select("*", { count: "exact", head: true }),
    db.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
    db
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .lt("stock_quantity", LOW_STOCK_THRESHOLD),
    db
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("stock_quantity", 0),
    db.from("brands").select("*", { count: "exact", head: true }).eq("is_active", true),
    db.from("categories").select("*", { count: "exact", head: true }).eq("is_active", true),
  ])

  return {
    totalProducts: totalProducts ?? 0,
    activeProducts: activeProducts ?? 0,
    lowStockProducts: lowStockProducts ?? 0,
    outOfStockProducts: outOfStockProducts ?? 0,
    totalBrands: totalBrands ?? 0,
    totalCategories: totalCategories ?? 0,
  }
}

export async function getRecentProducts(): Promise<RecentProduct[]> {
  const db = createServiceClient()
  const { data } = await db
    .from("products")
    .select("id, name, sku, price, stock_quantity, is_active, created_at, brands(name), categories(name)")
    .order("created_at", { ascending: false })
    .limit(5)
  return (data as RecentProduct[]) ?? []
}

export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  const db = createServiceClient()
  const { data } = await db
    .from("products")
    .select("id, name, sku, stock_quantity, brands(name)")
    .eq("is_active", true)
    .lt("stock_quantity", LOW_STOCK_THRESHOLD)
    .order("stock_quantity", { ascending: true })
    .limit(10)
  return (data as LowStockProduct[]) ?? []
}

export async function getRecentMovements(): Promise<RecentMovement[]> {
  const db = createServiceClient()
  const { data } = await db
    .from("inventory_movements")
    .select("id, type, quantity, reason, created_at, products(name, sku)")
    .order("created_at", { ascending: false })
    .limit(10)
  return (data as RecentMovement[]) ?? []
}
