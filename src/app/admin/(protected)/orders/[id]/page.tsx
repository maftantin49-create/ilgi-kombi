import { notFound } from "next/navigation"
import Link from "next/link"
import { getOrderById } from "@/lib/admin/orders"
import { updateOrderStatusAction } from "@/lib/admin/orders.actions"
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/admin/schemas/order"
import OrderStatusForm from "@/components/admin/orders/OrderStatusForm"
import type { OrderStatus } from "@/types/database.types"
import type { AddressSnapshot } from "@/lib/admin/orders"
import { formatDateTime, formatPrice } from "@/lib/admin/format"
import { StatusBadge } from "@/components/admin/StatusBadge"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

const ORDER_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  draft:              { color: "#A5A5A5", bg: "rgba(165,165,165,0.08)" },
  pending_payment:    { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
  paid:               { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  preparing:          { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  shipped:            { color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  delivered:          { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  cancelled:          { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  refunded:           { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  partially_refunded: { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
}

const PAYMENT_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  initialized: { color: "#A5A5A5", bg: "rgba(165,165,165,0.08)" },
  pending:     { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
  success:     { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  failed:      { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  cancelled:   { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  refunded:    { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
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

function formatAddress(addr: AddressSnapshot | null): string {
  if (!addr) return "—"
  const parts = [
    addr.address_line,
    addr.neighborhood,
    addr.district,
    addr.city,
    addr.postal_code,
  ].filter(Boolean)
  return parts.join(", ") || "—"
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) notFound()

  const customer = order.customers
  const boundAction = updateOrderStatusAction.bind(null, order.id)

  const shippingAddr = order.shipping_address_snapshot
  const billingAddr = order.billing_address_snapshot

  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          style={{ color: "#A5A5A5", fontSize: "13px", textDecoration: "none" }}
        >
          ← Siparişler
        </Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "15px",
            fontWeight: 700,
            color: "#D4A017",
          }}
        >
          #{order.order_number}
        </span>
      </div>

      {/* Status bar */}
      <div
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Sipariş Durumu</p>
          <StatusBadge
            value={order.status}
            labels={ORDER_STATUS_LABELS}
            styles={ORDER_STATUS_STYLE}
          />
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Ödeme Durumu</p>
          <StatusBadge
            value={order.payment_status}
            labels={PAYMENT_STATUS_LABELS}
            styles={PAYMENT_STATUS_STYLE}
          />
        </div>
        <div>
          <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Oluşturulma</p>
          <p style={{ fontSize: "13px", color: "#F4F4F2" }}>{formatDateTime(order.created_at)}</p>
        </div>
        {order.paid_at && (
          <div>
            <p style={{ fontSize: "11px", color: "#A5A5A5", marginBottom: "4px" }}>Ödeme Tarihi</p>
            <p style={{ fontSize: "13px", color: "#4ade80" }}>{formatDateTime(order.paid_at)}</p>
          </div>
        )}
      </div>

      {/* Status update */}
      <SectionCard title="Durum Güncelle">
        <p style={{ fontSize: "12px", color: "#A5A5A5", marginBottom: "10px" }}>
          Mevcut durum:{" "}
          <strong style={{ color: "#F4F4F2" }}>
            {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
          </strong>
        </p>
        <OrderStatusForm action={boundAction} currentStatus={order.status} />
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Customer */}
        <SectionCard title="Müşteri">
          {customer ? (
            <>
              <DataRow label="Ad Soyad">
                {customer.first_name} {customer.last_name}
              </DataRow>
              {customer.company_name && (
                <DataRow label="Şirket">{customer.company_name}</DataRow>
              )}
              {customer.email && <DataRow label="E-posta">{customer.email}</DataRow>}
              {customer.phone && <DataRow label="Telefon">{customer.phone}</DataRow>}
            </>
          ) : (
            <p style={{ fontSize: "13px", color: "#A5A5A5" }}>
              {order.customer_id ? "Müşteri bilgisi yüklenemedi." : "Misafir sipariş"}
            </p>
          )}
        </SectionCard>

        {/* Notes */}
        <SectionCard title="Sipariş Notu">
          {order.notes ? (
            <p style={{ fontSize: "13px", color: "#F4F4F2", lineHeight: "1.5" }}>
              {order.notes}
            </p>
          ) : (
            <p style={{ fontSize: "13px", color: "#A5A5A5", fontStyle: "italic" }}>Not yok</p>
          )}
        </SectionCard>
      </div>

      {/* Addresses */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <SectionCard title="Teslimat Adresi">
          {shippingAddr ? (
            <>
              {shippingAddr.title && (
                <DataRow label="Adres Başlığı">{shippingAddr.title}</DataRow>
              )}
              <DataRow label="Ad Soyad">
                {[shippingAddr.first_name, shippingAddr.last_name].filter(Boolean).join(" ") || "—"}
              </DataRow>
              {shippingAddr.phone && <DataRow label="Telefon">{shippingAddr.phone}</DataRow>}
              <DataRow label="Adres">{formatAddress(shippingAddr)}</DataRow>
            </>
          ) : (
            <p style={{ fontSize: "13px", color: "#A5A5A5" }}>—</p>
          )}
        </SectionCard>

        {billingAddr ? (
          <SectionCard title="Fatura Adresi">
            {billingAddr.title && (
              <DataRow label="Adres Başlığı">{billingAddr.title}</DataRow>
            )}
            <DataRow label="Ad Soyad">
              {[billingAddr.first_name, billingAddr.last_name].filter(Boolean).join(" ") || "—"}
            </DataRow>
            {billingAddr.phone && <DataRow label="Telefon">{billingAddr.phone}</DataRow>}
            <DataRow label="Adres">{formatAddress(billingAddr)}</DataRow>
          </SectionCard>
        ) : (
          <SectionCard title="Fatura Adresi">
            <p style={{ fontSize: "13px", color: "#A5A5A5", fontStyle: "italic" }}>
              Teslimat adresiyle aynı
            </p>
          </SectionCard>
        )}
      </div>

      {/* Order items */}
      <SectionCard title={`Ürünler (${order.order_items.length} kalem)`}>
        {order.order_items.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#A5A5A5" }}>Ürün bulunamadı.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["SKU", "Ürün Adı", "Birim Fiyat", "Adet", "Toplam"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === "Ürün Adı" ? "left" : "right",
                        padding: "6px 10px",
                        fontSize: "11px",
                        color: "#A5A5A5",
                        fontWeight: 500,
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        ...(h === "SKU" ? { textAlign: "left" } : {}),
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td
                      style={{
                        padding: "8px 10px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        color: "#A5A5A5",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {item.sku_snapshot}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        fontSize: "13px",
                        color: "#F4F4F2",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {item.product_name_snapshot}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        fontSize: "13px",
                        color: "#F4F4F2",
                        textAlign: "right",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatPrice(item.unit_price, order.currency)}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        fontSize: "13px",
                        color: "#F4F4F2",
                        textAlign: "right",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      {item.quantity}
                    </td>
                    <td
                      style={{
                        padding: "8px 10px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#F4F4F2",
                        textAlign: "right",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatPrice(item.line_total, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Financials */}
      <SectionCard title="Finansal Özet">
        <div style={{ maxWidth: "300px", marginLeft: "auto" }}>
          <DataRow label="Ara Toplam">
            {formatPrice(order.subtotal, order.currency)}
          </DataRow>
          <DataRow label="Kargo">
            {formatPrice(order.shipping_fee, order.currency)}
          </DataRow>
          {order.discount_total > 0 && (
            <DataRow label="İndirim">
              <span style={{ color: "#4ade80" }}>
                -{formatPrice(order.discount_total, order.currency)}
              </span>
            </DataRow>
          )}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: "10px",
              marginTop: "6px",
            }}
          >
            <DataRow label="Genel Toplam">
              <strong style={{ color: "#D4A017", fontSize: "15px" }}>
                {formatPrice(order.grand_total, order.currency)}
              </strong>
            </DataRow>
          </div>
        </div>
      </SectionCard>

      {/* Shipping integration placeholder */}
      <SectionCard title="Kargo Takip">
        <p
          style={{
            fontSize: "13px",
            color: "#A5A5A5",
            fontStyle: "italic",
          }}
        >
          Kargo entegrasyonu henüz bağlı değil.
        </p>
      </SectionCard>
    </div>
  )
}
