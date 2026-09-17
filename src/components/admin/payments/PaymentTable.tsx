import Link from "next/link"
import type { PaymentListItem } from "@/lib/admin/payments"
import { PAYMENT_STATUS_LABELS } from "@/lib/admin/schemas/order"
import { formatDateTime, formatPrice } from "@/lib/admin/format"
import { StatusBadge } from "@/components/admin/StatusBadge"

const PAYMENT_STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  initialized:        { color: "#A5A5A5", bg: "rgba(165,165,165,0.08)" },
  pending:            { color: "#D4A017", bg: "rgba(212,160,23,0.1)" },
  success:            { color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  failed:             { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  cancelled:          { color: "#f87171", bg: "rgba(248,113,113,0.08)" },
  refunded:           { color: "#94a3b8", bg: "rgba(148,163,184,0.08)" },
}

interface Props {
  payments: PaymentListItem[]
}

export default function PaymentTable({ payments }: Props) {
  if (payments.length === 0) {
    return (
      <div
        className="text-center py-16"
        style={{
          color: "#A5A5A5",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
        }}
      >
        <p className="text-sm">Ödeme kaydı bulunamadı</p>
      </div>
    )
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#A5A5A5",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    whiteSpace: "nowrap",
  }

  const tdStyle: React.CSSProperties = {
    padding: "9px 12px",
    fontSize: "12px",
    color: "#F4F4F2",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "middle",
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#0d0e10" }}>
            <tr>
              <th style={thStyle}>Tarih</th>
              <th style={thStyle}>Sipariş No</th>
              <th style={thStyle}>Müşteri</th>
              <th style={thStyle}>Provider</th>
              <th style={thStyle}>Provider Payment ID</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Deneme</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Tutar</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Taksit</th>
              <th style={thStyle}>Durum</th>
              <th style={thStyle}>Hata Kodu</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const order = p.orders
              const customer = order?.customers
              const customerName = customer
                ? `${customer.first_name} ${customer.last_name}`
                : "—"

              return (
                <tr
                  key={p.id}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "rgba(255,255,255,0.02)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background = "")
                  }
                >
                  <td style={{ ...tdStyle, color: "#A5A5A5", fontSize: "11px", whiteSpace: "nowrap" }}>
                    {formatDateTime(p.created_at)}
                  </td>
                  <td style={tdStyle}>
                    {order ? (
                      <Link
                        href={`/admin/orders/${p.order_id}`}
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#D4A017",
                          textDecoration: "none",
                        }}
                      >
                        #{order.order_number}
                      </Link>
                    ) : (
                      <span style={{ color: "#A5A5A5" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "12px" }}>{customerName}</div>
                    {customer?.email && (
                      <div style={{ fontSize: "11px", color: "#A5A5A5" }}>{customer.email}</div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontSize: "11px", color: "#A5A5A5" }}>
                    {p.provider}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "11px", color: "#A5A5A5" }}>
                    {p.provider_payment_id ? (
                      <span title={p.provider_payment_id}>
                        {p.provider_payment_id.length > 16
                          ? p.provider_payment_id.slice(0, 16) + "…"
                          : p.provider_payment_id}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#A5A5A5" }}>
                    #{p.attempt_number}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500, whiteSpace: "nowrap" }}>
                    {formatPrice(Number(p.amount), p.currency)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: "#A5A5A5" }}>
                    {p.installment ?? "Tek"}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge
                      value={p.status}
                      labels={PAYMENT_STATUS_LABELS}
                      styles={PAYMENT_STATUS_STYLE}
                      size="sm"
                    />
                  </td>
                  <td style={{ ...tdStyle, color: "#A5A5A5", fontSize: "11px" }}>
                    Detaya bak
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <Link
                      href={`/admin/payments/${p.id}`}
                      style={{
                        fontSize: "12px",
                        color: "#D4A017",
                        textDecoration: "none",
                        padding: "4px 10px",
                        border: "1px solid rgba(212,160,23,0.3)",
                        borderRadius: "4px",
                        display: "inline-block",
                        whiteSpace: "nowrap",
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
