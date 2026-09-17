export const dynamic = "force-dynamic"

import Link from "next/link"
import { getBrands } from "@/lib/admin/brands"
import { BrandTable } from "@/components/admin/brands/BrandTable"

interface Props {
  searchParams: Promise<{ error?: string; count?: string }>
}

export default async function BrandsPage({ searchParams }: Props) {
  const [brands, sp] = await Promise.all([getBrands(), searchParams])

  const errorMsg = (() => {
    if (!sp.error) return null
    const count = sp.count ?? "bazı"
    if (sp.error === "has_products") {
      return `Bu marka ${count} ürüne atanmış. Önce ürünlerin markasını değiştirin.`
    }
    return "Marka silinirken bir hata oluştu."
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
            Markalar
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
            {brands.length} marka
          </p>
        </div>
        <Link
          href="/admin/brands/new"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-85"
          style={{ background: "#D4A017", color: "#090A0C" }}
        >
          + Yeni Marka
        </Link>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
        >
          {errorMsg}
        </div>
      )}

      {/* Table card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <BrandTable brands={brands} />
      </div>
    </div>
  )
}
