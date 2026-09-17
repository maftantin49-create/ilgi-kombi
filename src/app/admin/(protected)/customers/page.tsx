import { Suspense } from "react"
import { getCustomers, CUSTOMERS_PAGE_SIZE } from "@/lib/admin/customers"
import CustomerFilters from "@/components/admin/customers/CustomerFilters"
import CustomerTable from "@/components/admin/customers/CustomerTable"
import Pagination from "@/components/admin/products/Pagination"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function CustomersPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

  const { customers, count } = await getCustomers({
    search: sp.q,
    isGuest: sp.guest,
    hasOrders: sp.orders,
    dateFrom: sp.from,
    dateTo: sp.to,
    page,
  })

  const hasFilters = !!(sp.q || sp.guest || sp.orders || sp.from || sp.to)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: "#F4F4F2", fontSize: "20px", fontWeight: 600 }}>
            Müşteri Yönetimi
          </h1>
          <p style={{ color: "#A5A5A5", fontSize: "13px", marginTop: "2px" }}>
            {count} müşteri
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Suspense fallback={null}>
          <CustomerFilters />
        </Suspense>
      </div>

      {hasFilters && customers.length === 0 && (
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
          Filtrelere uyan müşteri bulunamadı.
        </div>
      )}

      <CustomerTable customers={customers} />

      {count > CUSTOMERS_PAGE_SIZE && (
        <div className="mt-4">
          <Pagination
            count={count}
            pageSize={CUSTOMERS_PAGE_SIZE}
            currentPage={page}
            label="müşteri"
          />
        </div>
      )}
    </div>
  )
}
