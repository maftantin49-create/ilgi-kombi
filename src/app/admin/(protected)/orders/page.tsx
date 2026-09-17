import { Suspense } from "react"
import { getOrders, ORDERS_PAGE_SIZE } from "@/lib/admin/orders"
import OrderFilters from "@/components/admin/orders/OrderFilters"
import OrderTable from "@/components/admin/orders/OrderTable"
import Pagination from "@/components/admin/products/Pagination"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

  const { orders, count } = await getOrders({
    search: sp.q,
    status: sp.status,
    paymentStatus: sp.payment,
    dateFrom: sp.from,
    dateTo: sp.to,
    page,
  })

  const hasFilters = !!(sp.q || sp.status || sp.payment || sp.from || sp.to)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: "#F4F4F2", fontSize: "20px", fontWeight: 600 }}>
            Sipariş Yönetimi
          </h1>
          <p style={{ color: "#A5A5A5", fontSize: "13px", marginTop: "2px" }}>
            {count} sipariş
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Suspense fallback={null}>
          <OrderFilters />
        </Suspense>
      </div>

      {hasFilters && orders.length === 0 && (
        <div
          style={{
            background: "rgba(212,160,23,0.05)",
            border: "1px solid rgba(212,160,23,0.15)",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "16px",
            fontSize: "13px",
            color: "#D4A017",
          }}
        >
          Filtrelere uyan sipariş bulunamadı.
        </div>
      )}

      <OrderTable orders={orders} />

      {count > ORDERS_PAGE_SIZE && (
        <div className="mt-4">
          <Pagination
            count={count}
            pageSize={ORDERS_PAGE_SIZE}
            currentPage={page}
            label="sipariş"
          />
        </div>
      )}
    </div>
  )
}
