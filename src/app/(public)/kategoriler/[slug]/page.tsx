import { cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getStorefrontCategories, getCategoryDescendantIds } from "@/lib/storefront/categories"
import { getStorefrontProducts } from "@/lib/storefront/products"
import StorefrontProductCardComponent from "@/components/product/StorefrontProductCard"
import { wa } from "@/lib/whatsapp"

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "#666660" }}>
        <Link href="/" className="transition-colors hover:[color:#D4A017]" style={{ color: "#888882" }}>Ana Sayfa</Link>
        <span style={{ color: "#3A3A3A" }}>/</span>
        <Link href="/kategoriler" className="transition-colors hover:[color:#D4A017]" style={{ color: "#888882" }}>Kategoriler</Link>
        <span style={{ color: "#3A3A3A" }}>/</span>
        <span className="font-medium" style={{ color: "#C0C0BA" }}>{category.name}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#F4F4F2" }}>{category.name}</h1>
          <p className="text-sm" style={{ color: "#666660" }}>{products.length} ürün</p>
        </div>
      </div>

      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/urunler?kategori=${slug}`}
            className="px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: "#D4A017", color: "#090A0C" }}
          >
            Tümü
          </Link>
          {subcategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/urunler?kategori=${sub.slug}`}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,196,0,0.35)] hover:text-[#D4A017]"
              style={{ background: "#151618", color: "#A0A09A" }}
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
          <p className="mb-4" style={{ color: "#666660" }}>Bu kategoride henüz ürün bulunmuyor.</p>
          <a
            href={wa.notFound ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
            style={{ color: "#22c55e" }}
          >
            WhatsApp&apos;tan talep oluşturun
          </a>
        </div>
      )}
    </div>
  )
}
