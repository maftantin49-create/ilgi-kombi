"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useRef, useCallback } from "react"
import type { SelectOption } from "@/lib/admin/products"

const STATUS_OPTIONS = [
  { value: "", label: "Tüm Durumlar" },
  { value: "in_stock", label: "Stokta" },
  { value: "low_stock", label: "Düşük Stok" },
  { value: "out_of_stock", label: "Tükendi" },
  { value: "critical_reservation", label: "Rezerve Kritik" },
]

interface Props {
  brands: SelectOption[]
  categories: SelectOption[]
}

const selectClass =
  "px-3 py-1.5 rounded-lg text-sm outline-none transition-all"
const selectStyle = {
  background: "#151618",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#F4F4F2",
}

export function InventoryFilters({ brands, categories }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => update("search", v), 350)
    },
    [searchParams, pathname] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("brand") ||
    searchParams.get("category") ||
    searchParams.get("status")

  function clear() {
    router.push(pathname)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <input
        type="text"
        placeholder="Ürün adı veya SKU ara…"
        defaultValue={searchParams.get("search") ?? ""}
        onChange={handleSearch}
        className="px-3 py-1.5 rounded-lg text-sm outline-none transition-all w-52"
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.09)",
          color: "#F4F4F2",
        }}
      />

      {/* Brand */}
      <select
        className={selectClass}
        style={selectStyle}
        defaultValue={searchParams.get("brand") ?? ""}
        onChange={(e) => update("brand", e.target.value)}
      >
        <option value="">Tüm Markalar</option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      {/* Category */}
      <select
        className={selectClass}
        style={selectStyle}
        defaultValue={searchParams.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
      >
        <option value="">Tüm Kategoriler</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        className={selectClass}
        style={selectStyle}
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clear}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-75"
          style={{ background: "rgba(255,255,255,0.06)", color: "#A5A5A5" }}
        >
          Temizle
        </button>
      )}
    </div>
  )
}
