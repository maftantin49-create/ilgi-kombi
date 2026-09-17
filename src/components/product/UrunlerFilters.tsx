"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useCallback } from "react"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"
import { Suspense } from "react"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"
import type { StorefrontBrandWithCount } from "@/lib/storefront/brands"

interface Props {
  categories: StorefrontCategoryWithCount[]
  brands: StorefrontBrandWithCount[]
  activeKategori?: string
  activeMarka?: string
  activeStok?: string
  activeSiralama?: string
  activeQ?: string
  totalCount: number
}

const sortOptions = [
  { value: "", label: "Varsayılan" },
  { value: "fiyat-artan", label: "Fiyat: Düşükten Yükseğe" },
  { value: "fiyat-azalan", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "yeni", label: "Önce Yeni Ürünler" },
]

// Shared dark-theme token
const T = {
  bg:          "#111214",
  surface:     "#151618",
  border:      "rgba(255,255,255,0.08)",
  borderGold:  "rgba(255,196,0,0.14)",
  text:        "#C0C0BA",
  textMuted:   "#666660",
  textHeading: "#E8E8E2",
  gold:        "#D4A017",
  goldHover:   "#F2C94C",
  activeText:  "#090A0C",
}

function FiltersContent({
  categories,
  brands,
  activeKategori,
  activeMarka,
  activeStok,
  activeSiralama,
  activeQ,
  totalCount,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [brandExpanded, setBrandExpanded] = useState(false)

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      if (key !== "siralama") params.delete("siralama")
      params.delete("sayfa")
      router.push(`/urunler?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = () => router.push("/urunler")

  const hasFilters = !!(activeKategori || activeMarka || activeStok || activeQ)

  const visibleBrands = brandExpanded ? brands : brands.slice(0, 8)

  const filterContent = (
    <div className="space-y-5">
      {/* Sort */}
      <div>
        <h3
          className="font-semibold text-sm mb-2"
          style={{ color: T.textHeading }}
        >
          Sıralama
        </h3>
        <select
          value={activeSiralama ?? ""}
          onChange={(e) => updateFilter("siralama", e.target.value)}
          aria-label="Sıralama seçin"
          className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors"
          style={{
            background: T.bg,
            border: `1px solid ${T.border}`,
            color: T.text,
            WebkitAppearance: "none" as const,
          }}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value} style={{ background: T.bg, color: T.text }}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <h3
          className="font-semibold text-sm mb-2"
          style={{ color: T.textHeading }}
        >
          Kategori
        </h3>
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => updateFilter("kategori", "")}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
              style={
                !activeKategori
                  ? { background: T.gold, color: T.activeText, fontWeight: 700 }
                  : { color: T.text }
              }
              onMouseEnter={(e) => {
                if (activeKategori) (e.currentTarget as HTMLButtonElement).style.background = "#1E1F21"
              }}
              onMouseLeave={(e) => {
                if (activeKategori) (e.currentTarget as HTMLButtonElement).style.background = "transparent"
              }}
            >
              Tümü ({totalCount})
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateFilter("kategori", cat.slug)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
                style={
                  activeKategori === cat.slug
                    ? { background: T.gold, color: T.activeText, fontWeight: 700 }
                    : { color: T.text }
                }
                onMouseEnter={(e) => {
                  if (activeKategori !== cat.slug)
                    (e.currentTarget as HTMLButtonElement).style.background = "#1E1F21"
                }}
                onMouseLeave={(e) => {
                  if (activeKategori !== cat.slug)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent"
                }}
              >
                {cat.name}
                {cat.productCount > 0 && (
                  <span
                    className="ml-1 text-[10px]"
                    style={{ opacity: activeKategori === cat.slug ? 0.75 : 0.45 }}
                  >
                    ({cat.productCount})
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brand */}
      <div>
        <h3
          className="font-semibold text-sm mb-2"
          style={{ color: T.textHeading }}
        >
          Uyumlu Marka
        </h3>
        <ul className="space-y-0.5">
          {visibleBrands.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() =>
                  updateFilter("marka", activeMarka === brand.slug ? "" : brand.slug)
                }
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between"
                style={
                  activeMarka === brand.slug
                    ? { background: T.gold, color: T.activeText, fontWeight: 700 }
                    : { color: T.text }
                }
                onMouseEnter={(e) => {
                  if (activeMarka !== brand.slug)
                    (e.currentTarget as HTMLButtonElement).style.background = "#1E1F21"
                }}
                onMouseLeave={(e) => {
                  if (activeMarka !== brand.slug)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent"
                }}
              >
                {brand.name}
                {activeMarka === brand.slug && <X size={12} aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
        {brands.length > 8 && (
          <button
            onClick={() => setBrandExpanded(!brandExpanded)}
            className="flex items-center gap-1 text-xs mt-2 hover:underline transition-colors"
            style={{ color: T.gold }}
          >
            {brandExpanded ? (
              <><ChevronUp size={12} /> Daha az</>
            ) : (
              <><ChevronDown size={12} /> +{brands.length - 8} daha</>
            )}
          </button>
        )}
      </div>

      {/* Stock */}
      <div>
        <h3
          className="font-semibold text-sm mb-2"
          style={{ color: T.textHeading }}
        >
          Stok Durumu
        </h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={activeStok === "var"}
            onChange={(e) => updateFilter("stok", e.target.checked ? "var" : "")}
            className="w-4 h-4"
            style={{ accentColor: T.gold }}
          />
          <span className="text-sm" style={{ color: T.text }}>Sadece stokta olanlar</span>
        </label>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full rounded-xl py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1"
          style={{
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#EF4444",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent"
          }}
        >
          <X size={14} aria-hidden="true" /> Filtreleri Temizle
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          style={{
            border: `1px solid ${T.border}`,
            color: T.text,
            background: T.surface,
          }}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Filtrele &amp; Sırala
          {hasFilters && (
            <span
              className="text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
              style={{ background: T.gold, color: T.activeText }}
            >
              !
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
            aria-label="Filtreler"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <div
              className="relative ml-auto w-80 h-full overflow-y-auto shadow-2xl flex flex-col"
              style={{ background: "#111214", borderLeft: `1px solid ${T.border}` }}
            >
              <div
                className="flex items-center justify-between p-4 sticky top-0"
                style={{
                  borderBottom: `1px solid ${T.border}`,
                  background: "#111214",
                }}
              >
                <h2 className="font-bold text-sm" style={{ color: T.textHeading }}>
                  Filtrele &amp; Sırala
                </h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Kapat"
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: T.textMuted }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = T.text
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = T.textMuted
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex-1">{filterContent}</div>
              <div
                className="p-4 sticky bottom-0"
                style={{ borderTop: `1px solid ${T.border}`, background: "#111214" }}
              >
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ background: T.gold, color: T.activeText }}
                >
                  Uygula
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div
          className="rounded-xl p-4 sticky top-24"
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
          }}
        >
          <h2
            className="font-semibold mb-4 text-sm uppercase tracking-wide"
            style={{ color: T.textHeading }}
          >
            Filtreler
          </h2>
          {filterContent}
        </div>
      </aside>
    </>
  )
}

export default function UrunlerFilters(props: Props) {
  return (
    <Suspense fallback={<div className="w-56 hidden md:block" />}>
      <FiltersContent {...props} />
    </Suspense>
  )
}
