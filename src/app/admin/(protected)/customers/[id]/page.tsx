import { notFound } from "next/navigation"
import Link from "next/link"
import { getCustomerById } from "@/lib/admin/customers"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/schemas/order"
import type { CustomerAddress, CustomerOrderSummary, CustomerMetrics } from "@/lib/admin/customers"
import { formatDate, formatDateTime, formatPrice } from "@/lib/admin/format"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#151618",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: "12px",
          fontWeight: 600,
          color: "#A5A5A5",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  )
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "10px", fontSize: "13px" }}>
      <span style={{ color: "#A5A5A5", minWidth: "140px", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#F4F4F2" }}>{children}</span>
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        background: "#151618",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "6px" }}>{label}</p>
      <p style={{ fontSize: "20px", fontWeight: 600, color: "#F4F4F2" }}>{value}</p>
      {sub && <p style={{ fontSize: "11px", color: "#A5A5A5", marginTop: "2px" }}>{sub}</p>}
    </div>
  )
}

function AddressCard({ address }: { address: CustomerAddress }) {
  return (
    <div
      style={{
        background: "#111214",
        border: address.is_default
          ? "1px solid rgba(212,160,23,0.3)"
          : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "6px",
        padding: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#F4F4F2" }}>
          {address.title}
        </span>
        {address.is_default && (
          <span
            style={{
              fontSize: "10px",
              color: "#D4A017",
              background: "rgba(212,160,23,0.1)",
              border: "1px solid rgba(212,160,23,0.3)",
              borderRadius: "3px",
              padding: "1px 6px",
            }}
          >
            Varsayılan
          </span>
        )}
      </div>
      <p style={{ fontSize: "12px", color: "#A5A5A5", lineHeight: "1.5" }}>
        {address.first_name} {address.last_name}
        {address.phone && ` • ${address.phone}`}
      </p>
      <p style={{ fontSize: "12px", color: "#A5A5A5", lineHeight: "1.5" }}>
        {[address.address_line, address.neighborhood, address.district, address.city, address.postal_code]
          .filter(Boolean)
          .join(", ")}
      </p>
    </div>
  )
}

const ORDER_STATUS_STYLE: Record<string, { color: string }> = {
  draft:              { color: "#A5A5A5" },
  pending_payment:    { color: "#D4A017" },
  paid:               { color: "#4ade80" },
  preparing:          { color: "#60a5fa" },
  shipped:            { color: "#60a5fa" },
  delivered:          { color: "#4ade80" },
  cancelled:          { color: "#f87171" },
  refunded:           { color: "#f87171" },
  partially_refunded: { color: "#D4A017" },
}

function OrderRow({ order }: { order: CustomerOrderSummary }) {
  const statusColor = ORDER_STATUS_STYLE[order.status]?.color ?? "#A5A5A5"
  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status
  const paymentLabel = PAYMENT_STATUS_LABELS[order.payment_status as keyof typeof PAYMENT_STATUS_LABELS] ?? order.payment_status

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center", minWidth: 0 }}>
        <Link
          href={`/admin/orders/${order.id}`}
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            fontWeight: 700,
            color: "#D4A017",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          #{order.order_number}
        </Link>
        <span style={{ fontSize: "11px", color: "#A5A5A5", whiteSpace: "nowrap" }}>
          {formatDate(order.created_at)}
        </span>
      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: statusColor, whiteSpace: "nowrap" }}>
          {statusLabel}
        </span>
        <span style={{ fontSize: "11px", color: "#A5A5A5", whiteSpace: "nowrap" }}>
          {paymentLabel}
        </span>
        <span style={{ fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}>
          {formatPrice(Number(order.grand_total))}
        </span>
      </div>
    </div>
  )
}

function MetricsSection({ metrics }: { metrics: CustomerMetrics }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
      <MetricCard
        label="Toplam Sipariş"
        value={metrics.order_count.toString()}
      />
      <MetricCard
        label="Toplam Harcama"
        value={metrics.total_spent > 0 ? formatPrice(metrics.total_spent) : "—"}
      />
      <MetricCard
        label="Ortalama Sepet"
        value={metrics.avg_order_value > 0 ? formatPrice(metrics.avg_order_value) : "—"}
      />
      <MetricCard
        label="İlk Sipariş"
        value={formatDate(metrics.first_order_at)}
      />
      <MetricCard
        label="Son Sipariş"
        value={formatDate(metrics.last_order_at)}
      />
    </div>
  )
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const detail = await getCustomerById(id)

  if (!detail) notFound()

  const { customer, addresses, orders, metrics } = detail

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/customers"
          style={{ color: "#A5A5A5", fontSize: "13px", textDecoration: "none" }}
        >
          ← Müşteriler
        </Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
        <span style={{ fontSize: "15px", fontWeight: 600, color: "#F4F4F2" }}>
          {customer.first_name} {customer.last_name}
        </span>
        {customer.is_guest ? (
          <span
            style={{
              fontSize: "11px",
              color: "#A5A5A5",
              background: "rgba(165,165,165,0.08)",
              border: "1px solid rgba(165,165,165,0.2)",
              borderRadius: "4px",
              padding: "2px 8px",
            }}
          >
            Misafir
          </span>
        ) : (
          <span
            style={{
              fontSize: "11px",
              color: "#D4A017",
              background: "rgba(212,160,23,0.1)",
              border: "1px solid rgba(212,160,23,0.3)",
              borderRadius: "4px",
              padding: "2px 8px",
            }}
          >
            Kayıtlı
          </span>
        )}
      </div>

      {/* Metrics */}
      <MetricsSection metrics={metrics} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Identity */}
        <SectionCard title="Kimlik Bilgileri">
          <DataRow label="Ad">{customer.first_name}</DataRow>
          <DataRow label="Soyad">{customer.last_name}</DataRow>
          <DataRow label="E-posta">{customer.email ?? "—"}</DataRow>
          <DataRow label="Telefon">{customer.phone ?? "—"}</DataRow>
          <DataRow label="Şirket">{customer.company_name ?? "—"}</DataRow>
          <DataRow label="Vergi No">{customer.tax_number ?? "—"}</DataRow>
          <DataRow label="Kayıt Türü">
            {customer.is_guest ? "Misafir" : "Kayıtlı Üye"}
          </DataRow>
          <DataRow label="Pazarlama İzni">
            <span style={{ color: customer.marketing_consent ? "#4ade80" : "#A5A5A5" }}>
              {customer.marketing_consent ? "Evet" : "Hayır"}
            </span>
          </DataRow>
          <DataRow label="Kayıt Tarihi">{formatDateTime(customer.created_at)}</DataRow>
          <DataRow label="Güncelleme">{formatDateTime(customer.updated_at)}</DataRow>
        </SectionCard>

        {/* Addresses */}
        <SectionCard title={`Adresler (${addresses.length})`}>
          {addresses.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#A5A5A5", fontStyle: "italic" }}>
              Kayıtlı adres yok
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {addresses.map((addr) => (
                <AddressCard key={addr.id} address={addr} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Orders */}
      <SectionCard title={`Siparişler (${orders.length})`}>
        {orders.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#A5A5A5", fontStyle: "italic" }}>
            Henüz sipariş yok
          </p>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
