export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getProductStockDetail } from "@/lib/admin/inventory"
import { adjustStockAction } from "@/lib/admin/inventory.actions"
import { StockAdjustmentForm } from "@/components/admin/inventory/StockAdjustmentForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdjustStockPage({ params }: Props) {
  const { id } = await params
  const product = await getProductStockDetail(id)

  if (!product) notFound()

  const boundAction = adjustStockAction.bind(null, product.id)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
          Stok Düzenleme
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
          {product.name}{" "}
          <span
            className="font-mono text-xs ml-1 px-1.5 py-0.5 rounded"
            style={{ background: "rgba(255,255,255,0.06)", color: "#A5A5A5" }}
          >
            {product.sku}
          </span>
        </p>
      </div>

      {/* Migration uyarısı */}
      <div
        className="px-4 py-3 rounded-lg text-xs"
        style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.2)", color: "#D4A017" }}
      >
        Bu form 012_admin_stock_adjustment_rpc.sql migration&apos;ı çalıştırıldıktan sonra aktif olur.
        Migration onaylandıktan sonra bu uyarı kaldırılmalıdır.
      </div>

      {/* Form card */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <StockAdjustmentForm action={boundAction} product={product} />
      </div>
    </div>
  )
}
