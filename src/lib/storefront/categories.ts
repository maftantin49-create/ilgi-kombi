import { createPublicServerClient } from "@/lib/supabase/server"
import type { StorefrontCategory } from "./types"

export interface StorefrontCategoryWithCount extends StorefrontCategory {
  productCount: number
}

export interface StorefrontCategoryNode extends StorefrontCategoryWithCount {
  children: StorefrontCategoryNode[]
}

// ── Internal ───────────────────────────────────────────────────────────────────

function buildTree(flat: StorefrontCategoryWithCount[]): StorefrontCategoryNode[] {
  const byId = new Map<string, StorefrontCategoryNode>(
    flat.map((c) => [c.id, { ...c, children: [] }])
  )
  const roots: StorefrontCategoryNode[] = []

  for (const node of byId.values()) {
    if (node.parent_id) {
      byId.get(node.parent_id)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (nodes: StorefrontCategoryNode[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order)
    nodes.forEach((n) => sortNodes(n.children))
  }
  sortNodes(roots)

  return roots
}

// Two-query pattern — same approach as brands (avoids N+1).
async function fetchCategoriesWithCounts(): Promise<StorefrontCategoryWithCount[]> {
  const db = createPublicServerClient()

  const [catsResult, countsResult] = await Promise.all([
    db
      .from("categories")
      .select("id, name, slug, parent_id, sort_order, is_featured, image_url, description")
      .eq("is_active", true)
      .order("sort_order"),
    db
      .from("products")
      .select("category_id")
      .eq("is_active", true)
      .not("category_id", "is", null),
  ])

  if (catsResult.error) {
    console.error(
      "[storefront/categories] fetchCategoriesWithCounts error:",
      catsResult.error.message
    )
    return []
  }

  const countMap = new Map<string, number>()
  for (const row of (countsResult.data ?? []) as { category_id: string | null }[]) {
    if (row.category_id) {
      countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1)
    }
  }

  type CatRow = {
    id: string
    name: string
    slug: string
    parent_id: string | null
    sort_order: number
    is_featured: boolean
    image_url: string | null
    description: string | null
  }
  return (catsResult.data ?? []).map((c) => {
    const row = c as CatRow
    return {
      id:          row.id,
      name:        row.name,
      slug:        row.slug,
      parent_id:   row.parent_id,
      sort_order:  row.sort_order,
      is_featured: row.is_featured,
      image_url:   row.image_url,
      description: row.description,
      productCount: countMap.get(row.id) ?? 0,
    }
  })
}

// ── Descendant helper ──────────────────────────────────────────────────────────
// Returns the target category's own ID + all descendant IDs (BFS, cycle-safe).
export function getCategoryDescendantIds(
  slug: string,
  allCategories: Array<{ id: string; slug: string; parent_id: string | null }>
): string[] {
  const target = allCategories.find((c) => c.slug === slug)
  if (!target) return []

  const result: string[] = [target.id]
  const visited = new Set<string>([target.id])
  const queue: string[] = [target.id]

  while (queue.length > 0) {
    const parentId = queue.shift()!
    for (const c of allCategories) {
      if (c.parent_id === parentId && !visited.has(c.id)) {
        visited.add(c.id)
        result.push(c.id)
        queue.push(c.id)
      }
    }
  }

  return result
}

// ── Query functions ────────────────────────────────────────────────────────────

export async function getStorefrontCategories(): Promise<StorefrontCategoryWithCount[]> {
  return fetchCategoriesWithCounts()
}

export async function getStorefrontCategoryTree(): Promise<StorefrontCategoryNode[]> {
  const flat = await fetchCategoriesWithCounts()
  return buildTree(flat)
}

export async function getStorefrontCategoryBySlug(
  slug: string
): Promise<StorefrontCategoryWithCount | null> {
  const db = createPublicServerClient()

  const { data, error } = await db
    .from("categories")
    .select("id, name, slug, parent_id, sort_order, is_featured, image_url, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  const c = data as {
    id: string
    name: string
    slug: string
    parent_id: string | null
    sort_order: number
    is_featured: boolean
    image_url: string | null
    description: string | null
  }

  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", c.id)
    .eq("is_active", true)

  return {
    id:          c.id,
    name:        c.name,
    slug:        c.slug,
    parent_id:   c.parent_id,
    sort_order:  c.sort_order,
    is_featured: c.is_featured,
    image_url:   c.image_url,
    description: c.description,
    productCount: count ?? 0,
  }
}
