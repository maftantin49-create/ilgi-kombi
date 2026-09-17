import { createPublicServerClient } from "@/lib/supabase/server"
import type { StorefrontBrand } from "./types"

export interface StorefrontBrandWithCount extends StorefrontBrand {
  productCount: number
}

// Two-query pattern: one for brands, one for active product counts.
// Avoids N+1. Total queries = 2, regardless of brand count.
export async function getStorefrontBrands(): Promise<StorefrontBrandWithCount[]> {
  const db = createPublicServerClient()

  const [brandsResult, countsResult] = await Promise.all([
    db
      .from("brands")
      .select("id, name, slug, is_featured, logo_url, sort_order")
      .eq("is_active", true)
      .order("sort_order")
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

  type BrandRow = { id: string; name: string; slug: string; is_featured: boolean; logo_url: string | null; sort_order: number }
  return (brandsResult.data ?? []).map((b) => {
    const row = b as BrandRow
    return {
      id:          row.id,
      name:        row.name,
      slug:        row.slug,
      is_featured: row.is_featured,
      logo_url:    row.logo_url,
      sort_order:  row.sort_order,
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
    .select("id, name, slug, is_featured, logo_url, sort_order")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error || !data) return null

  const b = data as { id: string; name: string; slug: string; is_featured: boolean; logo_url: string | null; sort_order: number }

  const { count } = await db
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("brand_id", b.id)
    .eq("is_active", true)

  return {
    id:          b.id,
    name:        b.name,
    slug:        b.slug,
    is_featured: b.is_featured,
    logo_url:    b.logo_url,
    sort_order:  b.sort_order,
    productCount: count ?? 0,
  }
}
