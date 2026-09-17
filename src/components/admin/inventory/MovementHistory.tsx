import type { MovementHistoryItem } from "@/lib/admin/inventory"

const MOVEMENT_LABELS: Record<string, { label: string; color: string }> = {
  sale: { label: "Satış", color: "#f87171" },
  return: { label: "İade", color: "#34d399" },
  manual_adjustment: { label: "Manuel Düzeltme", color: "#a78bfa" },
  restock: { label: "Stok Ekleme", color: "#34d399" },
  reservation: { label: "Rezervasyon", color: "#fb923c" },
  reservation_release: { label: "Rezerv. İptali", color: "#A5A5A5" },
}

interface Props {
  movements: MovementHistoryItem[]
}

export function MovementHistory({ movements }: Props) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: "#A5A5A5" }}>
        Henüz stok hareketi kaydedilmemiş.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {["Tarih", "Ürün", "SKU", "Tip", "Miktar", "Sebep", "Sipariş"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left py-3 px-3 font-medium text-xs whitespace-nowrap"
                  style={{ color: "#A5A5A5" }}
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => {
            const typeCfg = MOVEMENT_LABELS[m.type] ?? {
              label: m.type,
              color: "#A5A5A5",
            }
            const isPositive = m.quantity > 0

            return (
              <tr
                key={m.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                className="hover:bg-white/[0.02] transition-colors"
              >
                {/* Tarih */}
                <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "#A5A5A5" }}>
                  <div>{new Date(m.created_at).toLocaleDateString("tr-TR")}</div>
                  <div style={{ color: "rgba(165,165,165,0.6)", fontSize: "0.65rem" }}>
                    {new Date(m.created_at).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>

                {/* Ürün */}
                <td
                  className="py-2.5 px-3 text-sm max-w-[180px] truncate"
                  style={{ color: "#F4F4F2" }}
                >
                  {m.products?.name ?? m.product_id.slice(0, 8) + "…"}
                </td>

                {/* SKU */}
                <td className="py-2.5 px-3 font-mono text-xs" style={{ color: "#A5A5A5" }}>
                  {m.products?.sku ?? "—"}
                </td>

                {/* Tip */}
                <td className="py-2.5 px-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                    style={{
                      background: `${typeCfg.color}1a`,
                      color: typeCfg.color,
                    }}
                  >
                    {typeCfg.label}
                  </span>
                </td>

                {/* Miktar (signed) */}
                <td className="py-2.5 px-3 text-center">
                  <span
                    className="font-semibold tabular-nums text-sm"
                    style={{ color: isPositive ? "#34d399" : "#f87171" }}
                  >
                    {isPositive ? `+${m.quantity}` : m.quantity}
                  </span>
                </td>

                {/* Sebep */}
                <td
                  className="py-2.5 px-3 text-xs max-w-[200px] truncate"
                  style={{ color: "#A5A5A5" }}
                  title={m.reason ?? ""}
                >
                  {m.reason ?? <span style={{ color: "rgba(165,165,165,0.4)" }}>—</span>}
                </td>

                {/* Sipariş */}
                <td className="py-2.5 px-3 font-mono text-xs" style={{ color: "#A5A5A5" }}>
                  {m.orders?.order_number ? (
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#D4A017" }}
                    >
                      {m.orders.order_number}
                    </span>
                  ) : (
                    <span style={{ color: "rgba(165,165,165,0.3)" }}>—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
