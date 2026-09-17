import { createServiceClient } from "@/lib/supabase/server"
import type { Category } from "@/types/database.types"

export type { Category }

export type CategoryNode = Category & { children: CategoryNode[] }

export async function getCategoriesFlat(): Promise<Category[]> {
  const db = createServiceClient()
  const { data } = await db
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name")
  return (data as Category[]) ?? []
}

export function buildCategoryTree(flat: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>(
    flat.map((c) => [c.id, { ...c, children: [] }])
  )
  const roots: CategoryNode[] = []

  for (const cat of flat) {
    const node = map.get(cat.id)!
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const flat = await getCategoriesFlat()
  return buildCategoryTree(flat)
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const db = createServiceClient()
  const { data } = await db.from("categories").select("*").eq("id", id).single()
  return (data as Category | null)
}

export async function getCategoryProductCount(id: string): Promise<number> {
  const db = createServiceClient()
  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
  return count ?? 0
}

export async function getCategoryChildCount(id: string): Promise<number> {
  const db = createServiceClient()
  const { count } = await db
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id)
  return count ?? 0
}
