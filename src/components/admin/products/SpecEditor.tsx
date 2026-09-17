"use client"

import { useState } from "react"
import { X, GripVertical, Plus } from "lucide-react"

export type SpecItem = {
  key: string
  specKey: string
  specValue: string
  unit: string
  sortOrder: number
}

interface Props {
  initialItems?: SpecItem[]
  onChange: (items: SpecItem[]) => void
}

const MAX_SPECS = 50

const INPUT_STYLE: React.CSSProperties = {
  background: "#111214",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#F4F4F2",
}
const INPUT_CLS = "w-full rounded px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-yellow-600"

export function SpecEditor({ initialItems = [], onChange }: Props) {
  const [items, setItems] = useState<SpecItem[]>(initialItems)
  const [dragKey, setDragKey] = useState<string | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)

  function update(key: string, field: keyof SpecItem, value: string) {
    const updated = items.map((i) =>
      i.key === key ? { ...i, [field]: value } : i
    )
    setItems(updated)
    onChange(updated)
  }

  function add() {
    if (items.length >= MAX_SPECS) return
    const next: SpecItem = {
      key: crypto.randomUUID(),
      specKey: "",
      specValue: "",
      unit: "",
      sortOrder: items.length,
    }
    const updated = [...items, next]
    setItems(updated)
    onChange(updated)
  }

  function remove(key: string) {
    const updated = items.filter((i) => i.key !== key).map((i, idx) => ({
      ...i,
      sortOrder: idx,
    }))
    setItems(updated)
    onChange(updated)
  }

  function onDragStart(key: string) {
    setDragKey(key)
  }

  function onDragOver(e: React.DragEvent, key: string) {
    e.preventDefault()
    setDragOverKey(key)
  }

  function onDrop(targetKey: string) {
    if (!dragKey || dragKey === targetKey) {
      setDragKey(null)
      setDragOverKey(null)
      return
    }
    const from = items.findIndex((i) => i.key === dragKey)
    const to = items.findIndex((i) => i.key === targetKey)
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    const updated = next.map((i, idx) => ({ ...i, sortOrder: idx }))
    setItems(updated)
    onChange(updated)
    setDragKey(null)
    setDragOverKey(null)
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-2">
          {/* Header */}
          <div
            className="grid text-xs font-medium"
            style={{
              color: "#6B7280",
              gridTemplateColumns: "24px 1fr 1fr 80px 32px",
              gap: "8px",
              paddingLeft: 4,
              paddingRight: 4,
            }}
          >
            <span />
            <span>Özellik Adı <span style={{ color: "#EF4444" }}>*</span></span>
            <span>Değer <span style={{ color: "#EF4444" }}>*</span></span>
            <span>Birim</span>
            <span />
          </div>

          {items.map((item) => (
            <div
              key={item.key}
              draggable
              onDragStart={() => onDragStart(item.key)}
              onDragOver={(e) => onDragOver(e, item.key)}
              onDrop={() => onDrop(item.key)}
              onDragEnd={() => { setDragKey(null); setDragOverKey(null) }}
              className="grid items-center"
              style={{
                gridTemplateColumns: "24px 1fr 1fr 80px 32px",
                gap: "8px",
                background: dragOverKey === item.key ? "rgba(212,160,23,0.06)" : "transparent",
                borderRadius: 6,
                padding: "4px 4px",
                transition: "background 0.1s",
              }}
            >
              {/* Drag handle */}
              <span
                className="flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ color: "#374151" }}
              >
                <GripVertical size={14} />
              </span>

              {/* Spec key */}
              <input
                type="text"
                value={item.specKey}
                onChange={(e) => update(item.key, "specKey", e.target.value)}
                placeholder="Bağlantı Çapı"
                maxLength={100}
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />

              {/* Spec value */}
              <input
                type="text"
                value={item.specValue}
                onChange={(e) => update(item.key, "specValue", e.target.value)}
                placeholder='3/4"'
                maxLength={500}
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />

              {/* Unit */}
              <input
                type="text"
                value={item.unit}
                onChange={(e) => update(item.key, "unit", e.target.value)}
                placeholder="mm"
                maxLength={30}
                className={INPUT_CLS}
                style={INPUT_STYLE}
              />

              {/* Remove */}
              <button
                type="button"
                onClick={() => remove(item.key)}
                className="flex items-center justify-center rounded transition-colors hover:bg-red-900/30"
                style={{ width: 28, height: 28, color: "#6B7280" }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length < MAX_SPECS ? (
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80"
          style={{ color: "#D4A017" }}
        >
          <Plus size={13} />
          Özellik Ekle
        </button>
      ) : (
        <p className="text-xs" style={{ color: "#6B7280" }}>
          Maksimum {MAX_SPECS} özellik eklendi.
        </p>
      )}
    </div>
  )
}
