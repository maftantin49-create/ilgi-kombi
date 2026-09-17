import Link from "next/link"
import type { OrderListItem } from "@/lib/admin/orders"
import type { OrderStatus, PaymentStatus } from "@/types/database.types"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/schemas/order"
import { formatDate, formatPrice } from "@/lib/admin/format"
import { StatusBadge } from "@/components/admin/StatusBadge"

const ORDER_STATUS_STYLE: Record<OrderStatus, { color: string; bg: string }> = {
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

const PAYMENT_STATUS_STYLE: Record<PaymentStatus, { color: string; bg: string }> = {
  initialized: { color: "#A5A5A5", bg: "rgba(165,165,165,0.08)" },
  pending:     { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
  success:     { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  failed:      { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  cancelled:   { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  refunded:    { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
}

interface Props {
  orders: OrderListItem[]
}

export default function OrderTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div
        className="text-center py-16"
        style={{ color: "#A5A5A5", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px" }}
      >
        <p className="text-sm">Sipariş bulunamadı</p>
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#A5A5A5",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    whiteSpace: "nowrap",
  }

  const tdStyle: React.CSSProperties = {
    padding: "10px 14px",
    fontSize: "13px",
    color: "#F4F4F2",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "middle",
  }

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#0d0e10" }}>
            <tr>
              <th style={thStyle}>Sipariş No</th>
              <th style={thStyle}>Tarih</th>
              <th style={thStyle}>Müşteri</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Ürün</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Toplam</th>
              <th style={thStyle}>Sipariş Durumu</th>
              <th style={thStyle}>Ödeme Durumu</th>
              <th style={thStyle}>Kargo</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const customer = order.customers
              const customerName = customer
                ? `${customer.first_name} ${customer.last_name}`
                : "Misafir"
              const customerSub = customer?.email ?? customer?.phone ?? "—"
              const itemCount = order.order_items.length

              return (
                <tr
                  key={order.id}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = "")}
                >
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#D4A017", fontWeight: 600 }}>
                      #{order.order_number}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "#A5A5A5", fontSize: "12px" }}>
                    {formatDate(order.created_at)}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "13px" }}>{customerName}</div>
                    <div style={{ fontSize: "11px", color: "#A5A5A5", marginTop: "1px" }}>{customerSub}</div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#A5A5A5" }}>
                    {itemCount} adet
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500 }}>
                    {formatPrice(order.grand_total, order.currency)}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge
                      value={order.status}
                      labels={ORDER_STATUS_LABELS}
                      styles={ORDER_STATUS_STYLE}
                      size="sm"
                    />
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge
                      value={order.payment_status}
                      labels={PAYMENT_STATUS_LABELS}
                      styles={PAYMENT_STATUS_STYLE}
                      size="sm"
                    />
                  </td>
                  <td style={{ ...tdStyle, fontSize: "11px", color: "#A5A5A5" }}>
                    —
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      style={{
                        fontSize: "12px",
                        color: "#D4A017",
                        textDecoration: "none",
                        padding: "4px 10px",
                        border: "1px solid rgba(212,160,23,0.3)",
                        borderRadius: "4px",
                        display: "inline-block",
                      }}
                    >
                      Detay
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
