import Link from "next/link"
import { Plus } from "lucide-react"
import { getProducts, getBrandsForSelect, getCategoriesForSelect } from "@/lib/admin/products"
import ProductFilters from "@/components/admin/products/ProductFilters"
import ProductsBulkShell from "@/components/admin/products/ProductsBulkShell"
import Pagination from "@/components/admin/products/Pagination"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{
    page?: string
    search?: string
    brand?: string
    category?: string
    active?: string
    stock?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

  // Key forces ProductsBulkShell remount (clears selectedIds) on any filter/page change
  const pageKey = [sp.page, sp.search, sp.brand, sp.category, sp.active, sp.stock].join("|")

  const [{ products, count, pageSize, error }, brands, categories] =
    await Promise.all([
      getProducts({
        search: sp.search,
        brandId: sp.brand,
        categoryId: sp.category,
        active: sp.active,
        stock: sp.stock,
        page,
      }),
      getBrandsForSelect(),
      getCategoriesForSelect(),
    ])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: "#F4F4F2" }}>
            Ürünler
          </h1>
          {count > 0 && (
            <p className="text-xs mt-0.5" style={{ color: "#A5A5A5" }}>
              {count} ürün listeleniyor
            </p>
          )}
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#D4A017", color: "#090A0C" }}
        >
          <Plus size={15} />
          Yeni Ürün
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters brands={brands} categories={categories} />

      {/* Table */}
      <section
        className="rounded-lg border overflow-hidden"
        style={{ background: "#151618", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {error ? (
          <p
            className="px-5 py-16 text-sm text-center"
            style={{ color: "#EF4444" }}
          >
            Ürünler yüklenirken hata oluştu: {error}
          </p>
        ) : (
          <ProductsBulkShell key={pageKey} products={products} brands={brands} categories={categories} />
        )}
      </section>

      {/* Pagination */}
      {!error && count > pageSize && (
        <Pagination count={count} pageSize={pageSize} currentPage={page} />
      )}
    </div>
  )
}
