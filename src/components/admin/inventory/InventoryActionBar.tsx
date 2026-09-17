"use client"

import { X, Plus, Minus, Lock } from "lucide-react"

export interface InventoryActionBarProps {
  count: number
  onClear: () => void
  onAdd: () => void
  onRemove: () => void
  onSet: () => void
}

function ActionButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap"
      style={{
        background: "rgba(255,255,255,0.06)",
        color: "#F4F4F2",
        border: "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        transition: "opacity 120ms",
      }}
    >
      {icon}
      {label}
    </button>
  )
}

export default function InventoryActionBar({
  count,
  onClear,
  onAdd,
  onRemove,
  onSet,
}: InventoryActionBarProps) {
  if (count === 0) return null

  return (
    <div
      className="fixed bottom-0 right-0 z-40 flex items-center gap-3 px-5 py-3"
      style={{
        left: "224px",
        background: "#151618",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
      }}
      role="toolbar"
      aria-label="Toplu stok işlem araç çubuğu"
    >
      <span className="text-sm font-medium shrink-0" style={{ color: "#F4F4F2" }}>
        <span style={{ color: "#D4A017" }}>{count}</span> ürün seçildi
      </span>

      <div
        className="h-5 w-px shrink-0"
        style={{ background: "rgba(255,255,255,0.15)" }}
        aria-hidden="true"
      />

      <div className="flex flex-wrap gap-2 flex-1 min-w-0">
        <ActionButton onClick={onAdd}    icon={<Plus size={13} />} label="Stok Ekle"     />
        <ActionButton onClick={onRemove} icon={<Minus size={13} />} label="Stok Çıkar"  />
        <ActionButton onClick={onSet}    icon={<Lock size={13} />}  label="Stoğu Sabitle" />
      </div>

      <button
        type="button"
        onClick={onClear}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-80 shrink-0"
        style={{
          background: "rgba(239,68,68,0.08)",
          color: "#EF4444",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
        aria-label="Seçimi temizle"
      >
        <X size={13} aria-hidden="true" />
        <span className="hidden sm:inline">Seçimi temizle</span>
      </button>
    </div>
  )
}
