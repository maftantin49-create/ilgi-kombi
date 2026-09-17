"use client"

import { useRef, useState, useTransition } from "react"
import { Search, X, Plus, ChevronDown } from "lucide-react"
import {
  searchDeviceModelsAction,
  createDeviceModelAction,
  type DeviceModelSearchResult,
} from "@/lib/admin/device-models.actions"
import type { SelectOption } from "@/lib/admin/products"

export type SelectedDevice = {
  id: string
  brandName: string
  model: string
  category: string | null
  note: string
}

interface Props {
  brands: SelectOption[]
  initialItems?: SelectedDevice[]
  onChange: (items: SelectedDevice[]) => void
}

const MAX_DEVICES = 100

const INPUT_STYLE: React.CSSProperties = {
  background: "#111214",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#F4F4F2",
}
const INPUT_CLS = "w-full rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-yellow-600"

export function DeviceSearch({ brands, initialItems = [], onChange }: Props) {
  const [selected, setSelected] = useState<SelectedDevice[]>(initialItems)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<DeviceModelSearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Create form state
  const [createBrandId, setCreateBrandId] = useState(brands[0]?.id ?? "")
  const [createModel, setCreateModel] = useState("")
  const [createCategory, setCreateCategory] = useState("")
  const [createYearFrom, setCreateYearFrom] = useState("")
  const [createYearTo, setCreateYearTo] = useState("")
  const [createError, setCreateError] = useState("")
  const [isCreating, startCreating] = useTransition()

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleQueryChange(q: string) {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await searchDeviceModelsAction(q)
        setResults(res)
        setShowDropdown(true)
      })
    }, 300)
  }

  function handleSelect(device: DeviceModelSearchResult) {
    if (selected.some((s) => s.id === device.id)) {
      setShowDropdown(false)
      setQuery("")
      return
    }
    const newItem: SelectedDevice = {
      id: device.id,
      brandName: device.brandName,
      model: device.model,
      category: device.category,
      note: "",
    }
    const updated = [...selected, newItem]
    setSelected(updated)
    onChange(updated)
    setQuery("")
    setResults([])
    setShowDropdown(false)
  }

  function handleRemove(id: string) {
    const updated = selected.filter((s) => s.id !== id)
    setSelected(updated)
    onChange(updated)
  }

  function handleNoteChange(id: string, note: string) {
    const updated = selected.map((s) => (s.id === id ? { ...s, note } : s))
    setSelected(updated)
    onChange(updated)
  }

  function handleCreate() {
    if (!createModel.trim()) {
      setCreateError("Model adı zorunludur.")
      return
    }
    if (!createBrandId) {
      setCreateError("Marka seçilmeli.")
      return
    }
    setCreateError("")
    startCreating(async () => {
      const yearFrom = createYearFrom ? parseInt(createYearFrom, 10) : null
      const yearTo = createYearTo ? parseInt(createYearTo, 10) : null
      const res = await createDeviceModelAction(
        createBrandId,
        createModel,
        createCategory || null,
        yearFrom,
        yearTo
      )
      if (!res.ok) {
        setCreateError(res.error)
        return
      }
      handleSelect(res.device)
      setShowCreateForm(false)
      setCreateModel("")
      setCreateCategory("")
      setCreateYearFrom("")
      setCreateYearTo("")
      setCreateError("")
    })
  }

  const alreadySelectedIds = new Set(selected.map((s) => s.id))

  return (
    <div className="space-y-3">
      {/* Search input */}
      {selected.length < MAX_DEVICES && (
        <div className="relative">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#6B7280" }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 180)}
              placeholder="Cihaz ara (en az 2 karakter)..."
              className="w-full rounded pl-9 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-yellow-600"
              style={INPUT_STYLE}
            />
            {isPending && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "#6B7280" }}
              >
                •••
              </span>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="absolute z-50 w-full mt-1 rounded overflow-hidden"
              style={{
                background: "#1a1c1f",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                maxHeight: 240,
                overflowY: "auto",
              }}
            >
              {results.length === 0 ? (
                <div className="px-3 py-2 text-xs" style={{ color: "#6B7280" }}>
                  Sonuç bulunamadı.
                </div>
              ) : (
                results.map((r) => {
                  const isAlreadySelected = alreadySelectedIds.has(r.id)
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelect(r)}
                      disabled={isAlreadySelected}
                      className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/5 disabled:opacity-40"
                      style={{ display: "block" }}
                    >
                      <span style={{ color: "#F4F4F2" }}>
                        {r.brandName} — {r.model}
                      </span>
                      {(r.category || r.yearRange) && (
                        <span
                          className="ml-2 text-xs"
                          style={{ color: "#6B7280" }}
                        >
                          {[r.category, r.yearRange].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {isAlreadySelected && (
                        <span
                          className="ml-2 text-xs"
                          style={{ color: "#D4A017" }}
                        >
                          ✓ Eklendi
                        </span>
                      )}
                    </button>
                  )
                })
              )}

              {/* Separator + create option */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { setShowDropdown(false); setShowCreateForm(true) }}
                  className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5 flex items-center gap-1.5"
                  style={{ color: "#D4A017" }}
                >
                  <Plus size={12} />
                  Yeni cihaz ekle...
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* "Add new" inline form */}
      {showCreateForm && (
        <div
          className="rounded p-4 space-y-3"
          style={{
            background: "rgba(212,160,23,0.04)",
            border: "1px solid rgba(212,160,23,0.15)",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: "#D4A017" }}>
              Yeni Cihaz / Model Ekle
            </p>
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); setCreateError("") }}
              style={{ color: "#6B7280" }}
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Brand select */}
            <div>
              <label className="block text-xs mb-1" style={{ color: "#A5A5A5" }}>
                Marka <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div className="relative">
                <select
                  value={createBrandId}
                  onChange={(e) => setCreateBrandId(e.target.value)}
                  className={INPUT_CLS}
                  style={{ ...INPUT_STYLE, appearance: "none", paddingRight: 28 }}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#6B7280" }}
                />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs mb-1" style={{ color: "#A5A5A5" }}>
                Model <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={createModel}
                onChange={(e) => setCreateModel(e.target.value)}
                placeholder="ecoTEC Plus VU 20/5-5"
                maxLength={200}
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs mb-1" style={{ color: "#A5A5A5" }}>
                Kategori
              </label>
              <input
                type="text"
                value={createCategory}
                onChange={(e) => setCreateCategory(e.target.value)}
                placeholder="Kombi, Klima..."
                maxLength={50}
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />
            </div>

            {/* Year range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A5A5A5" }}>
                  Yıldan
                </label>
                <input
                  type="number"
                  value={createYearFrom}
                  onChange={(e) => setCreateYearFrom(e.target.value)}
                  placeholder="2010"
                  min={1990}
                  max={2100}
                  className={INPUT_CLS}
                  style={INPUT_STYLE}
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "#A5A5A5" }}>
                  Yıla
                </label>
                <input
                  type="number"
                  value={createYearTo}
                  onChange={(e) => setCreateYearTo(e.target.value)}
                  placeholder="2020"
                  min={1990}
                  max={2100}
                  className={INPUT_CLS}
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          </div>

          {createError && (
            <p className="text-xs" style={{ color: "#EF4444" }}>
              {createError}
            </p>
          )}

          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="px-4 py-1.5 rounded text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#D4A017", color: "#090A0C" }}
          >
            {isCreating ? "Ekleniyor..." : "Cihazı Ekle ve Seç"}
          </button>
        </div>
      )}

      {/* Selected devices list */}
      {selected.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>
            Seçili Cihazlar ({selected.length}/{MAX_DEVICES})
          </p>
          {selected.map((device) => (
            <div
              key={device.id}
              className="flex items-start gap-2 rounded p-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "#F4F4F2" }}>
                  {device.brandName} — {device.model}
                </p>
                {device.category && (
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    {device.category}
                  </p>
                )}
                <input
                  type="text"
                  value={device.note}
                  onChange={(e) => handleNoteChange(device.id, e.target.value)}
                  placeholder="Opsiyonel not (ör: Sadece 2015 sonrası)"
                  maxLength={500}
                  className="mt-1 w-full rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-yellow-600"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#A5A5A5",
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(device.id)}
                className="flex-shrink-0 mt-0.5 transition-colors hover:text-red-400"
                style={{ color: "#4B5563" }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selected.length >= MAX_DEVICES && (
        <p className="text-xs" style={{ color: "#6B7280" }}>
          Maksimum {MAX_DEVICES} uyumlu cihaz eklendi.
        </p>
      )}
    </div>
  )
}
