"use client"

import Link from "next/link"
import type { CustomerListItem } from "@/lib/admin/customers"
import { formatDate, formatPrice } from "@/lib/admin/format"

interface Props {
  customers: CustomerListItem[]
}

export default function CustomerTable({ customers }: Props) {
  if (customers.length === 0) {
    return (
      <div
        className="text-center py-16"
        style={{
          color: "#A5A5A5",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
        }}
      >
        <p className="text-sm">Müşteri bulunamadı</p>
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
              <th style={thStyle}>Müşteri</th>
              <th style={thStyle}>İletişim</th>
              <th style={thStyle}>Şirket</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Tip</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Sipariş</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Toplam Harcama</th>
              <th style={thStyle}>Son Sipariş</th>
              <th style={thStyle}>Kayıt Tarihi</th>
              <th style={{ ...thStyle, textAlign: "right" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background =
                    "rgba(255,255,255,0.02)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLTableRowElement).style.background = "")
                }
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 500 }}>
                    {c.first_name} {c.last_name}
                  </div>
                </td>
                <td style={tdStyle}>
                  {c.email && (
                    <div style={{ fontSize: "12px" }}>{c.email}</div>
                  )}
                  {c.phone && (
                    <div style={{ fontSize: "12px", color: "#A5A5A5" }}>{c.phone}</div>
                  )}
                  {!c.email && !c.phone && (
                    <span style={{ color: "#A5A5A5", fontSize: "12px" }}>—</span>
                  )}
                </td>
                <td style={{ ...tdStyle, color: "#A5A5A5", fontSize: "12px" }}>
                  {c.company_name ?? "—"}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      color: c.is_guest ? "#A5A5A5" : "#D4A017",
                      background: c.is_guest
                        ? "rgba(165,165,165,0.08)"
                        : "rgba(212,160,23,0.1)",
                      border: `1px solid ${c.is_guest ? "rgba(165,165,165,0.2)" : "rgba(212,160,23,0.3)"}`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.is_guest ? "Misafir" : "Kayıtlı"}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {c.order_count > 0 ? (
                    <span style={{ color: "#4ade80", fontWeight: 500 }}>{c.order_count}</span>
                  ) : (
                    <span style={{ color: "#A5A5A5" }}>0</span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500 }}>
                  {c.total_spent > 0 ? formatPrice(c.total_spent) : (
                    <span style={{ color: "#A5A5A5", fontWeight: 400 }}>—</span>
                  )}
                </td>
                <td style={{ ...tdStyle, fontSize: "12px", color: "#A5A5A5" }}>
                  {formatDate(c.last_order_at)}
                </td>
                <td style={{ ...tdStyle, fontSize: "12px", color: "#A5A5A5" }}>
                  {formatDate(c.created_at)}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <Link
                    href={`/admin/customers/${c.id}`}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
