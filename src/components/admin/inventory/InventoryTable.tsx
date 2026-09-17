"use client"

import { useRef, useEffect } from "react"
import Link from "next/link"
import type { StockItem, StockStatus } from "@/lib/admin/inventory"
import { ProductThumbnail } from "@/components/admin/products/ProductThumbnail"

// ─────────────────────────────────────────────────────────────────────────────

const MOVEMENT_LABELS: Record<string, string> = {
  sale: "Satış",
  return: "İade",
  manual_adjustment: "Düzeltme",
  restock: "Stok Ekleme",
  reservation: "Rezervasyon",
  reservation_release: "Rezervasyon İptali",
}

const STATUS_CONFIG: Record<
  StockStatus,
  { label: string; bg: string; color: string }
> = {
  in_stock:             { label: "Stokta",        bg: "rgba(16,185,129,0.12)",  color: "#34d399" },
  low_stock:            { label: "Düşük Stok",    bg: "rgba(212,160,23,0.15)",  color: "#D4A017" },
  out_of_stock:         { label: "Tükendi",        bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
  critical_reservation: { label: "Rezerve Kritik", bg: "rgba(249,115,22,0.15)", color: "#fb923c" },
}

const STICKY_BG = "#151618"

// ─────────────────────────────────────────────────────────────────────────────

export interface SelectionProps {
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  allSelected: boolean
  someSelected: boolean
}

interface Props {
  items: StockItem[]
  selection: SelectionProps
}

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
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={ariaLabel}
      style={{ accentColor: "#D4A017", width: 15, height: 15, cursor: "pointer" }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function StockCell({ value, status }: { value: number; status: StockStatus }) {
  let color = "#F4F4F2"
  if (status === "out_of_stock") color = "#f87171"
  else if (status === "low_stock") color = "#D4A017"
  else if (status === "critical_reservation") color = "#fb923c"

  return (
    <span className="font-semibold tabular-nums" style={{ color }}>
      {value}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function InventoryTable({ items, selection }: Props) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: "#A5A5A5" }}>
        Ürün bulunamadı.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Checkbox header — sticky */}
            <th
              className="py-3 px-3 w-10"
              style={{ position: "sticky", left: 0, background: STICKY_BG, zIndex: 2 }}
            >
              <IndeterminateCheckbox
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                onChange={selection.onToggleAll}
                ariaLabel="Tümünü seç"
              />
            </th>
            {/* Thumbnail placeholder */}
            <th className="py-3 px-3 w-16" />
            {[
              "Ürün",
              "SKU",
              "Marka / Kategori",
              "Fiziksel",
              "Rezerve",
              "Kullanılabilir",
              "Durum",
              "Son Hareket",
              "",
            ].map((h) => (
              <th
                key={h}
                className="text-left py-3 px-3 font-medium text-xs whitespace-nowrap"
                style={{ color: "#A5A5A5" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status]
            const isSelected = selection.selectedIds.has(item.id)
            return (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: isSelected ? "rgba(212,160,23,0.04)" : "transparent",
                }}
                className="hover:bg-white/[0.02] transition-colors"
              >
                {/* Checkbox — sticky */}
                <td
                  className="py-3 px-3"
                  style={{ position: "sticky", left: 0, background: isSelected ? "rgba(212,160,23,0.04)" : STICKY_BG, zIndex: 1 }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => selection.onToggle(item.id)}
                    aria-label={`${item.name} seç`}
                    style={{ accentColor: "#D4A017", width: 15, height: 15, cursor: "pointer" }}
                  />
                </td>

                {/* Görsel */}
                <td className="py-3 px-3">
                  <ProductThumbnail
                    src={item.image_url}
                    alt={item.name}
                    size={48}
                  />
                </td>

                {/* Ürün adı */}
                <td className="py-3 px-3 max-w-[200px]">
                  <span
                    className="font-medium leading-tight line-clamp-2 text-sm"
                    style={{ color: "#F4F4F2" }}
                  >
                    {item.name}
                  </span>
                </td>

                {/* SKU */}
                <td className="py-3 px-3 font-mono text-xs whitespace-nowrap" style={{ color: "#A5A5A5" }}>
                  {item.sku}
                </td>

                {/* Marka / Kategori */}
                <td className="py-3 px-3 text-xs" style={{ color: "#A5A5A5" }}>
                  <div>{item.brands?.name ?? "—"}</div>
                  <div style={{ color: "rgba(165,165,165,0.6)" }}>
                    {item.categories?.name ?? "—"}
                  </div>
                </td>

                {/* Fiziksel stok */}
                <td className="py-3 px-3 text-center">
                  <span className="tabular-nums text-sm" style={{ color: "#F4F4F2" }}>
                    {item.stock_quantity}
                  </span>
                </td>

                {/* Rezerve stok */}
                <td className="py-3 px-3 text-center">
                  {item.reserved_stock > 0 ? (
                    <span
                      className="tabular-nums text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "rgba(249,115,22,0.12)", color: "#fb923c" }}
                    >
                      {item.reserved_stock}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "rgba(165,165,165,0.4)" }}>
                      —
                    </span>
                  )}
                </td>

                {/* Kullanılabilir stok */}
                <td className="py-3 px-3 text-center">
                  <StockCell value={item.available_stock} status={item.status} />
                </td>

                {/* Durum */}
                <td className="py-3 px-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                  >
                    {statusCfg.label}
                  </span>
                </td>

                {/* Son hareket */}
                <td className="py-3 px-3 text-xs" style={{ color: "#A5A5A5" }}>
                  {item.last_movement_at ? (
                    <div>
                      <div>
                        {new Date(item.last_movement_at).toLocaleDateString("tr-TR")}
                      </div>
                      <div style={{ color: "rgba(165,165,165,0.6)", fontSize: "0.65rem" }}>
                        {MOVEMENT_LABELS[item.last_movement_type ?? ""] ?? item.last_movement_type}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: "rgba(165,165,165,0.4)" }}>Yok</span>
                  )}
                </td>

                {/* İşlemler */}
                <td className="py-3 px-3">
                  <Link
                    href={`/admin/inventory/${item.id}/adjust`}
                    className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-75"
                    style={{ background: "rgba(212,160,23,0.12)", color: "#D4A017" }}
                  >
                    Stok Düzenle
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
