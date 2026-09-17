import { showcaseBrands } from "@/data/brands"
import { getStorefrontProducts } from "@/lib/storefront/products"
import type { StorefrontProductCard } from "@/lib/storefront/types"
import InteractiveBrandShowcase from "./InteractiveBrandShowcase"

export default async function InteractiveBrandShowcaseWrapper() {
  const results = await Promise.all(
    showcaseBrands.map((brand) =>
      getStorefrontProducts({ brandSlug: brand.slug, sort: "featured", pageSize: 6 })
    )
  )

  const productsByBrand: Record<string, StorefrontProductCard[]> = {}
  showcaseBrands.forEach((brand, i) => {
    productsByBrand[brand.id] = results[i].items
  })

  return <InteractiveBrandShowcase productsByBrand={productsByBrand} />
}
