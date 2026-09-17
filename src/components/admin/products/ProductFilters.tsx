"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useRef, useState } from "react"
import type { SelectOption } from "@/lib/admin/products"

interface Props {
  brands: SelectOption[]
  categories: SelectOption[]
}

const SELECT_STYLE = {
  background: "#111214",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#F4F4F2",
} as const

export default function ProductFilters({ brands, categories }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  )

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleSearch(value: string) {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value })
    }, 350)
  }

  function handleClear() {
    setSearchValue("")
    router.push(pathname)
  }

  const hasFilters =
    searchParams.get("search") ||
    searchParams.get("brand") ||
    searchParams.get("category") ||
    searchParams.get("active") ||
    searchParams.get("stock")

  return (
    <div
      className="rounded-lg border p-4 space-y-3"
      style={{ background: "#151618", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-48 space-y-1">
          <label className="block text-xs font-medium" style={{ color: "#A5A5A5" }}>
            Ara (isim / SKU)
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Ürün adı veya SKU..."
            className="w-full rounded px-3 py-2 text-sm outline-none"
            style={SELECT_STYLE}
          />
        </div>

        {/* Brand */}
        <div className="min-w-40 space-y-1">
          <label className="block text-xs font-medium" style={{ color: "#A5A5A5" }}>
            Marka
          </label>
          <select
            value={searchParams.get("brand") ?? ""}
            onChange={(e) => updateParams({ brand: e.target.value })}
            className="w-full rounded px-3 py-2 text-sm outline-none"
            style={SELECT_STYLE}
          >
            <option value="">Tümü</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="min-w-40 space-y-1">
          <label className="block text-xs font-medium" style={{ color: "#A5A5A5" }}>
            Kategori
          </label>
          <select
            value={searchParams.get("category") ?? ""}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="w-full rounded px-3 py-2 text-sm outline-none"
            style={SELECT_STYLE}
          >
            <option value="">Tümü</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Active status */}
        <div className="min-w-32 space-y-1">
          <label className="block text-xs font-medium" style={{ color: "#A5A5A5" }}>
            Durum
          </label>
          <select
            value={searchParams.get("active") ?? ""}
            onChange={(e) => updateParams({ active: e.target.value })}
            className="w-full rounded px-3 py-2 text-sm outline-none"
            style={SELECT_STYLE}
          >
            <option value="">Tümü</option>
            <option value="true">Aktif</option>
            <option value="false">Pasif</option>
          </select>
        </div>

        {/* Stock status */}
        <div className="min-w-36 space-y-1">
          <label className="block text-xs font-medium" style={{ color: "#A5A5A5" }}>
            Stok
          </label>
          <select
            value={searchParams.get("stock") ?? ""}
            onChange={(e) => updateParams({ stock: e.target.value })}
            className="w-full rounded px-3 py-2 text-sm outline-none"
            style={SELECT_STYLE}
          >
            <option value="">Tümü</option>
            <option value="in_stock">Stokta (≥5)</option>
            <option value="low">Düşük (1–4)</option>
            <option value="out">Tükendi (0)</option>
          </select>
        </div>

        {/* Clear button */}
        {hasFilters && (
          <button
            onClick={handleClear}
            className="rounded px-3 py-2 text-sm transition-opacity hover:opacity-80"
            style={{ color: "#A5A5A5", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Temizle
          </button>
        )}
      </div>
    </div>
  )
}
