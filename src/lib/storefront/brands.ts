import { createPublicServerClient } from "@/lib/supabase/server"
import type { StorefrontBrand } from "./types"

export interface StorefrontBrandWithCount extends StorefrontBrand {
  productCount: number
}

// Two-query pattern: one for brands, one for active product counts.
// Avoids N+1. Total queries = 2, regardless of brand count.
// Future: replace with a DB view if brand count grows beyond ~500.
export async function getStorefrontBrands(): Promise<StorefrontBrandWithCount[]> {
  const db = createPublicServerClient()

  const [brandsResult, countsResult] = await Promise.all([
    db
      .from("brands")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("name"),
    db
      .from("products")
      .select("brand_id")
      .eq("is_active", true)
      .not("brand_id", "is", null),
  ])

  if (brandsResult.error) {
    console.error("[storefront/brands] getStorefrontBrands error:", brandsResult.error.message)
    return []
  }

  const countMap = new Map<string, number>()
  for (const row of (countsResult.data ?? []) as { brand_id: string | null }[]) {
    if (row.brand_id) {
      countMap.set(row.brand_id, (countMap.get(row.brand_id) ?? 0) + 1)
    }
  }

  return (brandsResult.data ?? []).map((b) => {
    const row = b as { id: string; name: string; slug: string }
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      productCount: countMap.get(row.id) ?? 0,
    }
  })
}

export async function getStorefrontBrandBySlug(
  slug: string
): Promise<StorefrontBrandWithCount | null> {
  const db = createPublicServerClient()

  const { data, error } = await db
    .from("brands")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  const b = data as { id: string; name: string; slug: string }

  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", b.id)
    .eq("is_active", true)

  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    productCount: count ?? 0,
  }
}
