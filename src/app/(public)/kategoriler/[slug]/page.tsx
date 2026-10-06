import { cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getStorefrontCategories, getCategoryDescendantIds } from "@/lib/storefront/categories"
import { getStorefrontProducts } from "@/lib/storefront/products"
import StorefrontProductCardComponent from "@/components/product/StorefrontProductCard"
import { wa } from "@/lib/whatsapp"
import { siteConfig } from "@/config/site"

const getCachedCategories = cache(getStorefrontCategories)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const allCategories = await getCachedCategories()
  const category = allCategories.find((c) => c.slug === slug)

  if (!category) return { title: "Kategori Bulunamadı" }

  const title = category.seo_title || category.name
  const description =
    category.seo_description ||
    category.description ||
    `${category.name} kategorisindeki ürünleri inceleyin.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/kategoriler/${slug}`,
    },
    openGraph: category.image_url
      ? { images: [{ url: category.image_url }], title, description }
      : undefined,
  }
}

export default async function KategoriPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const allCategories = await getCachedCategories()
  const category = allCategories.find((c) => c.slug === slug)
  if (!category) notFound()

  const descendantIds = getCategoryDescendantIds(slug, allCategories)
  const subcategories = allCategories.filter((c) => c.parent_id === category.id)

  const { items: products } = await getStorefrontProducts({
    categoryIds: descendantIds,
    sort: "featured",
    pageSize: 24,
  })

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa",   item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Kategoriler", item: `${siteConfig.url}/kategoriler` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${siteConfig.url}/kategoriler/${slug}` },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="flex items-center gap-2 text-sm mb-6 text-gray-500">
        <Link href="/" className="transition-colors hover:text-blue-700">Ana Sayfa</Link>
        <span className="text-gray-300">/</span>
        <Link href="/kategoriler" className="transition-colors hover:text-blue-700">Kategoriler</Link>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-700">{category.name}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-sm text-gray-500">{products.length} ürün</p>
        </div>
      </div>

      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/urunler?kategori=${slug}`}
            className="px-4 py-1.5 rounded-full text-sm font-bold text-white"
            style={{ background: "#1E3A8A" }}
          >
            Tümü
          </Link>
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/urunler?kategori=${sub.slug}`}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors text-gray-600 hover:text-blue-700 hover:border-blue-300"
              style={{ background: "#FFFFFF", border: "1px solid #E2E6EA" }}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <StorefrontProductCardComponent key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="mb-4 text-gray-400">Bu kategoride henüz ürün bulunmuyor.</p>
          <a
            href={wa.notFound ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline text-green-600"
          >
            WhatsApp&apos;tan talep oluşturun
          </a>
        </div>
      )}
    </div>
  )
}
