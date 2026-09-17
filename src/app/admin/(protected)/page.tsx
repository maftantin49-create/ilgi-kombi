import { Package, CheckCircle, AlertTriangle, XCircle, Tag, FolderTree } from "lucide-react"
import StatCard from "@/components/admin/StatCard"
import {
  getDashboardStats,
  getRecentProducts,
  getLowStockProducts,
  getRecentMovements,
} from "@/lib/admin/queries"

export const dynamic = "force-dynamic"

const TH = "px-4 py-3 text-left text-xs font-medium"
const TD = "px-4 py-3 text-sm"

const movementTypeLabels: Record<string, string> = {
  sale:                 "Satış",
  return:               "İade",
  manual_adjustment:    "Manuel Düzeltme",
  restock:              "Stok Girişi",
  reservation:          "Rezervasyon",
  reservation_release:  "Rezervasyon İptal",
}

function fiyat(n: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n)
}

function tarih(s: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(s))
}

export default async function AdminDashboardPage() {
  const [stats, recentProducts, lowStockProducts, recentMovements] = await Promise.all([
    getDashboardStats(),
    getRecentProducts(),
    getLowStockProducts(),
    getRecentMovements(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold" style={{ color: "#F4F4F2" }}>Dashboard</h1>

      {/* Stat kartları */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        <StatCard label="Toplam Ürün"    value={stats.totalProducts}    icon={<Package      size={17} />} />
        <StatCard label="Aktif Ürün"     value={stats.activeProducts}   icon={<CheckCircle  size={17} />} />
        <StatCard label="Düşük Stok"     value={stats.lowStockProducts} icon={<AlertTriangle size={17} />} variant="warning" />
        <StatCard label="Stokta Yok"     value={stats.outOfStockProducts} icon={<XCircle   size={17} />} variant="danger" />
        <StatCard label="Marka Sayısı"   value={stats.totalBrands}      icon={<Tag          size={17} />} />
        <StatCard label="Kategori Sayısı" value={stats.totalCategories} icon={<FolderTree   size={17} />} />
      </div>

      {/* Son eklenen ürünler */}
      <section
        className="rounded-lg border overflow-hidden"
        style={{ background: "#151618", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <h2 className="text-sm font-medium" style={{ color: "#F4F4F2" }}>Son Eklenen Ürünler</h2>
        </div>

        {recentProducts.length === 0 ? (
          <p className="px-5 py-10 text-sm text-center" style={{ color: "#A5A5A5" }}>
            Henüz ürün eklenmemiş.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <tr>
                  {["SKU", "Ürün Adı", "Marka", "Kategori", "Fiyat", "Stok", "Durum", "Tarih"].map(h => (
                    <th key={h} className={TH} style={{ color: "#A5A5A5" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: i < recentProducts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    <td className={`${TD} font-mono text-xs`} style={{ color: "#A5A5A5" }}>{p.sku}</td>
                    <td className={TD} style={{ color: "#F4F4F2" }}>{p.name}</td>
                    <td className={TD} style={{ color: "#A5A5A5" }}>{p.brands?.name ?? "—"}</td>
                    <td className={TD} style={{ color: "#A5A5A5" }}>{p.categories?.name ?? "—"}</td>
                    <td className={TD} style={{ color: "#F4F4F2" }}>{fiyat(p.price)}</td>
                    <td
                      className={`${TD} font-semibold`}
                      style={{ color: p.stock_quantity === 0 ? "#EF4444" : p.stock_quantity < 5 ? "#FBBF24" : "#F4F4F2" }}
                    >
                      {p.stock_quantity}
                    </td>
                    <td className={TD}>
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: p.is_active ? "rgba(34,197,94,0.1)"  : "rgba(239,68,68,0.1)",
                          color:      p.is_active ? "#22C55E" : "#EF4444",
                        }}
                      >
                        {p.is_active ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className={`${TD} text-xs`} style={{ color: "#A5A5A5" }}>{tarih(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Alt iki tablo */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Düşük stok */}
        <section
          className="rounded-lg border overflow-hidden"
          style={{ background: "#151618", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="px-5 py-3 border-b flex items-center justify-between"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
          >
            <h2 className="text-sm font-medium" style={{ color: "#F4F4F2" }}>Düşük Stok Ürünleri</h2>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "rgba(251,191,36,0.1)", color: "#FBBF24" }}
            >
              Eşik: 5 adet
            </span>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="px-5 py-10 text-sm text-center" style={{ color: "#A5A5A5" }}>
              Düşük stoklu ürün yok.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <tr>
                    {["SKU", "Ürün", "Marka", "Stok"].map(h => (
                      <th key={h} className={TH} style={{ color: "#A5A5A5" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: i < lowStockProducts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    >
                      <td className={`${TD} font-mono text-xs`} style={{ color: "#A5A5A5" }}>{p.sku}</td>
                      <td className={TD} style={{ color: "#F4F4F2" }}>{p.name}</td>
                      <td className={TD} style={{ color: "#A5A5A5" }}>{p.brands?.name ?? "—"}</td>
                      <td
                        className={`${TD} font-semibold`}
                        style={{ color: p.stock_quantity === 0 ? "#EF4444" : "#FBBF24" }}
                      >
                        {p.stock_quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Son stok hareketleri */}
        <section
          className="rounded-lg border overflow-hidden"
          style={{ background: "#151618", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="px-5 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h2 className="text-sm font-medium" style={{ color: "#F4F4F2" }}>Son Stok Hareketleri</h2>
          </div>

          {recentMovements.length === 0 ? (
            <p className="px-5 py-10 text-sm text-center" style={{ color: "#A5A5A5" }}>
              Henüz stok hareketi yok.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <tr>
                    {["Ürün", "Tür", "Miktar", "Neden", "Tarih"].map(h => (
                      <th key={h} className={TH} style={{ color: "#A5A5A5" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((m, i) => (
                    <tr
                      key={m.id}
                      style={{ borderBottom: i < recentMovements.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    >
                      <td className={TD} style={{ color: "#F4F4F2" }}>
                        <div className="text-sm">{m.products?.name ?? "—"}</div>
                        {m.products?.sku && (
                          <div className="text-xs font-mono mt-0.5" style={{ color: "#A5A5A5" }}>
                            {m.products.sku}
                          </div>
                        )}
                      </td>
                      <td className={`${TD} text-xs`} style={{ color: "#A5A5A5" }}>
                        {movementTypeLabels[m.type] ?? m.type}
                      </td>
                      <td
                        className={`${TD} font-semibold`}
                        style={{ color: m.quantity > 0 ? "#22C55E" : "#EF4444" }}
                      >
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className={`${TD} text-xs`} style={{ color: "#A5A5A5" }}>{m.reason ?? "—"}</td>
                      <td className={`${TD} text-xs`} style={{ color: "#A5A5A5" }}>{tarih(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
