import { Suspense } from "react"
import { getPayments, PAYMENTS_PAGE_SIZE } from "@/lib/admin/payments"
import PaymentFilters from "@/components/admin/payments/PaymentFilters"
import PaymentTable from "@/components/admin/payments/PaymentTable"
import Pagination from "@/components/admin/products/Pagination"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<Record<string, string>>
}

export default async function PaymentsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

  const { payments, count } = await getPayments({
    orderNumber: sp.order,
    providerPaymentId: sp.pid,
    status: sp.status,
    provider: sp.provider,
    dateFrom: sp.from,
    dateTo: sp.to,
    page,
  })

  const hasFilters = !!(sp.order || sp.pid || sp.status || sp.provider || sp.from || sp.to)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: "#F4F4F2", fontSize: "20px", fontWeight: 600 }}>
            Ödeme Yönetimi
          </h1>
          <p style={{ color: "#A5A5A5", fontSize: "13px", marginTop: "2px" }}>
            {count} ödeme kaydı — sadece görüntüleme
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Suspense fallback={null}>
          <PaymentFilters />
        </Suspense>
      </div>

      {hasFilters && payments.length === 0 && (
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
          Filtrelere uyan ödeme kaydı bulunamadı.
        </div>
      )}

      <PaymentTable payments={payments} />

      {count > PAYMENTS_PAGE_SIZE && (
        <div className="mt-4">
          <Pagination
            count={count}
            pageSize={PAYMENTS_PAGE_SIZE}
            currentPage={page}
            label="ödeme"
          />
        </div>
      )}
    </div>
  )
}
