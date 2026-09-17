export const dynamic = "force-dynamic"

import {
  getStockList,
  getMovementHistory,
  getBrandsForSelect,
  getCategoriesForSelect,
  type InventoryFilters,
} from "@/lib/admin/inventory"
import { InventoryFilters as InventoryFiltersComponent } from "@/components/admin/inventory/InventoryFilters"
import InventoryBulkShell from "@/components/admin/inventory/InventoryBulkShell"
import { MovementHistory } from "@/components/admin/inventory/MovementHistory"
import Pagination from "@/components/admin/products/Pagination"

interface Props {
  searchParams: Promise<{
    search?: string
    brand?: string
    category?: string
    status?: string
    page?: string
    mp?: string
  }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const sp = await searchParams

  const filters: InventoryFilters = {
    search: sp.search,
    brandId: sp.brand,
    categoryId: sp.category,
    status: sp.status,
    page: sp.page ? parseInt(sp.page, 10) : 1,
  }

  const movementPage = sp.mp ? parseInt(sp.mp, 10) : 1
  const pageKey = [sp.search, sp.brand, sp.category, sp.status, sp.page].join("|")

  const [stockResult, brands, categories, movementResult] = await Promise.all([
    getStockList(filters),
    getBrandsForSelect(),
    getCategoriesForSelect(),
    getMovementHistory(movementPage),
  ])

  return (
    <div className="space-y-8">
      {/* ── Stok Listesi ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
              Stok Yönetimi
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
              {stockResult.total} ürün
              {filters.status ? ` · ${filters.status}` : ""}
            </p>
          </div>
          <InventoryFiltersComponent brands={brands} categories={categories} />
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#151618",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <InventoryBulkShell key={pageKey} items={stockResult.items} />
          {stockResult.total > stockResult.pageSize && (
            <div
              className="px-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              <Pagination
                count={stockResult.total}
                pageSize={stockResult.pageSize}
                currentPage={stockResult.page}
                paramName="page"
                label="ürün"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Stok Hareketi Geçmişi ────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#F4F4F2" }}>
            Son Stok Hareketleri
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
            {movementResult.count} toplam hareket kaydı
          </p>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#151618",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <MovementHistory movements={movementResult.movements} />
          {movementResult.count > 20 && (
            <div
              className="px-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
            >
              <Pagination
                count={movementResult.count}
                pageSize={20}
                currentPage={movementPage}
                paramName="mp"
                label="hareket"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
