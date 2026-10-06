import type { MetadataRoute } from "next"
import { getStorefrontProducts } from "@/lib/storefront/products"
import { getStorefrontCategories } from "@/lib/storefront/categories"
import { siteConfig } from "@/config/site"

const BASE = siteConfig.url

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productResult, categories] = await Promise.all([
    getStorefrontProducts({ sort: "newest", pageSize: 200 }),
    getStorefrontCategories(),
  ])

  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                             lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/urunler`,                lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/kategoriler`,            lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/markalar`,               lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/parca-bul`,              lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/musteri-hizmetleri`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/sss`,                    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/garanti-ve-iade`,        lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/teslimat-bilgileri`,     lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/kargo-ve-tasima`,        lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/hakkimizda`,             lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/iletisim`,               lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ]

  const productPages: MetadataRoute.Sitemap = productResult.items.map((p) => ({
    url: `${BASE}/urunler/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/kategoriler/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  // Brand pages (/markalar/[slug]) not yet implemented; query-string URLs
  // (?marka=X) are not canonical and have been removed from sitemap.

  return [...staticPages, ...productPages, ...categoryPages]
}
