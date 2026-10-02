import { getStorefrontProducts, type ProductListFilters, type ProductSort } from "@/lib/storefront/products"
import { getStorefrontCategories, getCategoryDescendantIds } from "@/lib/storefront/categories"
import { getStorefrontBrands } from "@/lib/storefront/brands"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"
import StorefrontProductCard from "@/components/product/StorefrontProductCard"
import UrunlerFilters from "@/components/product/UrunlerFilters"
import UrunlerPagination from "@/components/product/UrunlerPagination"
import Link from "next/link"
import { wa } from "@/lib/whatsapp"

interface Props {
  searchParams: Promise<{
    q?: string
    kategori?: string
    marka?: string
    stok?: string
    siralama?: string
    sayfa?: string
  }>
}

function mapSort(s: string | undefined): ProductSort {
  switch (s) {
    case "fiyat-artan": return "price_asc"
    case "fiyat-azalan": return "price_desc"
    case "yeni": return "newest"
    default: return "default"
  }
}

function computeInclusiveCount(
  catId: string,
  allCategories: Array<{ id: string; parent_id: string | null }>,
  directCountMap: Map<string, number>
): number {
  const ids = [catId]
  const visited = new Set([catId])
  const queue = [catId]
  while (queue.length > 0) {
    const pid = queue.shift()!
    for (const c of allCategories) {
      if (c.parent_id === pid && !visited.has(c.id)) {
        visited.add(c.id)
        ids.push(c.id)
        queue.push(c.id)
      }
    }
  }
  return ids.reduce((sum, id) => sum + (directCountMap.get(id) ?? 0), 0)
}

export default async function UrunlerPage({ searchParams }: Props) {
  const params = await searchParams
  const { q, kategori, marka, stok, siralama, sayfa } = params

  const page = Math.max(1, parseInt(sayfa ?? "1") || 1)

  const [allCategories, allBrands] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontBrands(),
  ])

  const categoryIds = kategori
    ? getCategoryDescendantIds(kategori, allCategories)
    : []

  const directCountMap = new Map(allCategories.map((c) => [c.id, c.productCount]))
  const categoriesForFilter: StorefrontCategoryWithCount[] = allCategories.map((cat) => ({
    ...cat,
    productCount: computeInclusiveCount(cat.id, allCategories, directCountMap),
  }))

  const totalActiveProducts = allCategories.reduce((sum, c) => sum + c.productCount, 0)

  const filters: ProductListFilters = {
    q: q?.trim() || undefined,
    categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
    brandSlug: marka || undefined,
    inStock: stok === "var",
    sort: mapSort(siralama),
    page,
    pageSize: 24,
  }

  const result = await getStorefrontProducts(filters)

  const activeCategory = kategori ? allCategories.find((c) => c.slug === kategori) : null
  const activeBrand = marka ? allBrands.find((b) => b.slug === marka) : null

  const hasFilters = !!(q || kategori || marka || stok)
  const title = q
    ? `"${q}" için sonuçlar`
    : activeBrand
    ? `${activeBrand.name} uyumlu ürünler`
    : activeCategory
    ? activeCategory.name
    : "Tüm Ürünler"

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav
        className="text-sm mb-6 flex items-center gap-1.5"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="text-gray-500 transition-colors hover:text-blue-700"
        >
          Ana Sayfa
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700">{title}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <UrunlerFilters
          categories={categoriesForFilter}
          brands={allBrands}
          activeKategori={kategori}
          activeMarka={marka}
          activeStok={stok}
          activeSiralama={siralama}
          activeQ={q}
          totalCount={totalActiveProducts}
        />

        {/* Products area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              {result.total > 0 && (
                <p className="text-sm text-gray-500">{result.total} ürün bulundu</p>
              )}
            </div>
          </div>

          {/* ── Empty state: no products in DB ─────────────────────────────────── */}
          {result.total === 0 && !hasFilters ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ background: "#F8F9FA", border: "1px solid #E2E6EA" }}
            >
              <p className="text-4xl mb-4" aria-hidden="true">📦</p>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Ürün bulunamadı
              </h3>
              <p className="text-sm mb-6 text-gray-500">
                Aradığınız parça için WhatsApp&apos;tan bize ulaşın.
              </p>
              <a
                href={wa.notFound ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors hover:bg-green-600"
                style={{ background: "#22c55e", color: "#fff" }}
              >
                WhatsApp&apos;tan Sorun
              </a>
            </div>

          ) : result.total === 0 && q ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ background: "#F8F9FA", border: "1px solid #E2E6EA" }}
            >
              <p className="text-4xl mb-4" aria-hidden="true">🔍</p>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                &ldquo;{q}&rdquo; için ürün bulunamadı
              </h3>
              <p className="text-sm mb-6 text-gray-500">
                Farklı bir kelime deneyin veya WhatsApp&apos;tan sorun.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/urunler"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-blue-900"
                  style={{ background: "#1E3A8A", color: "#FFFFFF" }}
                >
                  Tüm Ürünlere Dön
                </Link>
                <a
                  href={wa.notFound ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors hover:bg-green-600"
                  style={{ background: "#22c55e", color: "#fff" }}
                >
                  WhatsApp&apos;tan Sor
                </a>
              </div>
            </div>

          ) : result.total === 0 ? (
            <div
              className="text-center py-20 rounded-2xl"
              style={{ background: "#F8F9FA", border: "1px solid #E2E6EA" }}
            >
              <p className="text-4xl mb-4" aria-hidden="true">🔍</p>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Bu filtreyle ürün bulunamadı
              </h3>
              <p className="text-sm mb-6 text-gray-500">
                Filtreleri değiştirin veya WhatsApp&apos;tan sorun.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link
                  href="/urunler"
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-blue-900"
                  style={{ background: "#1E3A8A", color: "#FFFFFF" }}
                >
                  Filtreleri Temizle
                </Link>
                <a
                  href={wa.notFound ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors hover:bg-green-600"
                  style={{ background: "#22c55e", color: "#fff" }}
                >
                  WhatsApp&apos;tan Sor
                </a>
              </div>
            </div>

          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {result.items.map((p) => (
                  <StorefrontProductCard key={p.id} product={p} />
                ))}
              </div>

              <UrunlerPagination
                currentPage={result.page}
                totalPages={result.totalPages}
                total={result.total}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
