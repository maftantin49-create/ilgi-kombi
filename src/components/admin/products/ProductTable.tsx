"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import { Pencil } from "lucide-react"
import { toggleProductStatus } from "@/lib/admin/products.actions"
import type { ProductListItem } from "@/lib/admin/products"
import { ProductThumbnail } from "./ProductThumbnail"

// ─────────────────────────────────────────────────────────────────────────────

interface SelectionProps {
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  allSelected: boolean
  someSelected: boolean
}

interface Props {
  products: ProductListItem[]
  selection: SelectionProps
}

// ─────────────────────────────────────────────────────────────────────────────

const TH = "px-4 py-3 text-left text-xs font-medium whitespace-nowrap"
const TD = "px-4 py-3 text-sm"
const STICKY_BG = "#151618"

function fiyat(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(n)
}

function stockColor(qty: number) {
  if (qty === 0) return "#EF4444"
  if (qty < 5) return "#FBBF24"
  return "#F4F4F2"
}

// ─────────────────────────────────────────────────────────────────────────────
// IndeterminateCheckbox — native .indeterminate requires a DOM ref
// ─────────────────────────────────────────────────────────────────────────────

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  indeterminate: boolean
  onChange: () => void
  ariaLabel: string
}) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      className="cursor-pointer"
      style={{ accentColor: "#D4A017", width: 15, height: 15 }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductTable({ products, selection }: Props) {
  const { selectedIds, onToggle, onToggleAll, allSelected, someSelected } = selection

  if (products.length === 0) {
    return (
      <p
        className="px-5 py-16 text-sm text-center"
        style={{ color: "#A5A5A5" }}
      >
        Ürün bulunamadı.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <tr>
            {/* Checkbox (sticky) */}
            <th
              className="px-3 py-3 w-10"
              style={{
                position: "sticky",
                left: 0,
                background: STICKY_BG,
                zIndex: 1,
              }}
            >
              <IndeterminateCheckbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={onToggleAll}
                ariaLabel="Sayfadaki tüm ürünleri seç"
              />
            </th>
            {/* Thumbnail (empty header) */}
            <th className="px-3 py-3 w-16" />
            {[
              "SKU",
              "Ürün Adı",
              "Marka",
              "Kategori",
              "Fiyat",
              "Stok",
              "Durum",
              "İşlemler",
            ].map((h) => (
              <th key={h} className={TH} style={{ color: "#A5A5A5" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => {
            const isSelected = selectedIds.has(p.id)
            return (
              <tr
                key={p.id}
                style={{
                  background: isSelected
                    ? "rgba(212,160,23,0.04)"
                    : "transparent",
                  borderBottom:
                    i < products.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
              >
                {/* Checkbox (sticky) */}
                <td
                  className="px-3 py-2"
                  style={{
                    position: "sticky",
                    left: 0,
                    background: isSelected
                      ? "rgba(212,160,23,0.04)"
                      : STICKY_BG,
                    zIndex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(p.id)}
                    aria-label={`${p.name} ürününü seç`}
                    className="cursor-pointer"
                    style={{ accentColor: "#D4A017", width: 15, height: 15 }}
                  />
                </td>

                {/* Görsel */}
                <td className="px-3 py-2">
                  <ProductThumbnail
                    src={p.image_url}
                    alt={p.name}
                    size={48}
                  />
                </td>

                {/* SKU */}
                <td
                  className={`${TD} font-mono text-xs`}
                  style={{ color: "#A5A5A5" }}
                >
                  {p.sku}
                </td>

                {/* Ürün Adı */}
                <td className={TD} style={{ color: "#F4F4F2" }}>
                  <div className="max-w-56 truncate font-medium">{p.name}</div>
                  {p.is_featured && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded mt-0.5 inline-block"
                      style={{
                        background: "rgba(212,160,23,0.1)",
                        color: "#D4A017",
                      }}
                    >
                      Öne çıkan
                    </span>
                  )}
                </td>

                {/* Marka */}
                <td className={TD} style={{ color: "#A5A5A5" }}>
                  {p.brands?.name ?? "—"}
                </td>

                {/* Kategori */}
                <td className={TD} style={{ color: "#A5A5A5" }}>
                  {p.categories?.name ?? "—"}
                </td>

                {/* Fiyat */}
                <td className={TD} style={{ color: "#F4F4F2" }}>
                  <div>{fiyat(p.price)}</div>
                  {p.compare_at_price && p.compare_at_price > p.price && (
                    <div
                      className="text-xs line-through"
                      style={{ color: "#A5A5A5" }}
                    >
                      {fiyat(p.compare_at_price)}
                    </div>
                  )}
                </td>

                {/* Stok */}
                <td
                  className={`${TD} font-semibold`}
                  style={{ color: stockColor(p.stock_quantity) }}
                >
                  {p.stock_quantity}
                </td>

                {/* Durum */}
                <td className={TD}>
                  <form action={toggleProductStatus}>
                    <input type="hidden" name="productId" value={p.id} />
                    <input
                      type="hidden"
                      name="currentStatus"
                      value={String(p.is_active)}
                    />
                    <button
                      type="submit"
                      className="px-2 py-0.5 rounded text-xs transition-opacity hover:opacity-80 cursor-pointer"
                      style={{
                        background: p.is_active
                          ? "rgba(34,197,94,0.1)"
                          : "rgba(239,68,68,0.1)",
                        color: p.is_active ? "#22C55E" : "#EF4444",
                        border: p.is_active
                          ? "1px solid rgba(34,197,94,0.2)"
                          : "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      {p.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </form>
                </td>

                {/* İşlemler */}
                <td className={TD}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-opacity hover:opacity-80"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#F4F4F2",
                    }}
                  >
                    <Pencil size={11} />
                    Düzenle
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
