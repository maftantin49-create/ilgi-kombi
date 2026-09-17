export const dynamic = "force-dynamic"

import Link from "next/link"
import { getCategoryTree, getCategoriesFlat } from "@/lib/admin/categories"
import { CategoryTree } from "@/components/admin/categories/CategoryTree"

interface Props {
  searchParams: Promise<{ error?: string; count?: string }>
}

export default async function CategoriesPage({ searchParams }: Props) {
  const [tree, flat, sp] = await Promise.all([
    getCategoryTree(),
    getCategoriesFlat(),
    searchParams,
  ])

  const errorMsg = (() => {
    if (!sp.error) return null
    const count = sp.count ?? "bazı"
    if (sp.error === "has_children") {
      return `Bu kategorinin ${count} alt kategorisi var. Önce alt kategorileri silin veya taşıyın.`
    }
    if (sp.error === "has_products") {
      return `Bu kategoriye ${count} ürün atanmış. Önce ürünlerin kategorisini değiştirin.`
    }
    return "Kategori silinirken bir hata oluştu."
  })()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
            Kategoriler
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
            {flat.length} kategori · {tree.length} kök kategori
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-85"
          style={{ background: "#D4A017", color: "#090A0C" }}
        >
          + Yeni Kategori
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

      {/* Tree card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <CategoryTree tree={tree} />
      </div>
    </div>
  )
}
