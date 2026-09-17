import { createServiceClient } from "@/lib/supabase/server"
import type { Brand } from "@/types/database.types"

export type { Brand }

export async function getBrands(): Promise<Brand[]> {
  const db = createServiceClient()
  const { data } = await db.from("brands").select("*").order("name")
  return (data as Brand[]) ?? []
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const db = createServiceClient()
  const { data } = await db.from("brands").select("*").eq("id", id).single()
  return (data as Brand | null)
}

export async function getBrandProductCount(id: string): Promise<number> {
  const db = createServiceClient()
  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", id)
  return count ?? 0
}
