"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { bulkClassificationAction } from "@/lib/admin/bulk.actions"
import type { BulkActionResult } from "@/lib/admin/schemas/bulk"
import type { SelectOption } from "@/lib/admin/products"
import BulkModalShell from "./BulkModalShell"

// ─────────────────────────────────────────────────────────────────────────────

const REMOVE = "__remove__"

interface SelectedProduct {
  id: string
  sku: string
  name: string
  categories: { name: string } | null
}

interface Props {
  open: boolean
  selectedProducts: SelectedProduct[]
  categories: SelectOption[]
  onClose: () => void
  onSuccess: (affected: number, operationId: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "#111214",
  color: "#F4F4F2",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  cursor: "pointer",
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BulkCategoryModal({
  open,
  selectedProducts,
  categories,
  onClose,
  onSuccess,
}: Props) {
  const [value, setValue] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<BulkActionResult | null>(null)

  const count = selectedProducts.length
  const isRemove = value === REMOVE
  const isValid = value !== ""
  const selectedCategory = categories.find((c) => c.id === value)

  const previewSlice = selectedProducts.slice(0, 5)
  const extraCount = selectedProducts.length - 5

  // ── Confirmation text ───────────────────────────────────────────────────

  let confirmText = ""
  let confirmColor = "#D4A017"
  if (isRemove) {
    confirmText = `${count} üründen kategori bilgisi kaldırılacak.`
    confirmColor = "#F87171"
  } else if (selectedCategory) {
    confirmText = `${count} ürün "${selectedCategory.name}" kategorisine taşınacak.`
    confirmColor = "#D4A017"
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!isValid || isPending) return
    setIsPending(true)
    setResult(null)

    const res = await bulkClassificationAction({
      productIds: selectedProducts.map((p) => p.id),
      field: "category_id",
      value: isRemove ? null : value,
    })

    setIsPending(false)
    setResult(res)

    if (res.ok) {
      setTimeout(() => onSuccess(res.affected, res.operationId), 1800)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <BulkModalShell
      open={open}
      onClose={onClose}
      title={`Toplu Kategori Değişimi — ${count} ürün`}
    >
      <div
        style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* ── Success ───────────────────────────────────────────────── */}
        {result?.ok && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              borderRadius: 8,
              background: "rgba(52,211,153,0.08)",
              border: "1px solid rgba(52,211,153,0.2)",
              color: "#34D399",
              fontSize: 14,
            }}
          >
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>{result.affected}</strong> üründe kategori güncellendi.
              <span style={{ fontSize: 11, color: "#A5A5A5", marginLeft: 8 }}>
                #{result.operationId.slice(-8)}
              </span>
            </span>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────── */}
        {result && !result.ok && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#F87171",
              fontSize: 13,
            }}
          >
            {result.error}
          </div>
        )}

        {!(result?.ok) && (
          <>
            {/* ── Select ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#F4F4F2" }}>
                Yeni Kategori <span style={{ color: "#D4A017" }}>*</span>
              </label>
              <select
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={selectStyle}
                aria-label="Kategori seç"
              >
                <option value="">— Seçin —</option>
                <option value={REMOVE}>— Kategoriyi kaldır —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: 11, color: "#A5A5A5", margin: 0 }}>
                Yalnızca aktif kategoriler listelenir. Seçim kaldırıldığında category_id NULL olur.
              </p>
            </div>

            {/* ── Confirmation ───────────────────────────────────────── */}
            {confirmText && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: isRemove
                    ? "rgba(239,68,68,0.06)"
                    : "rgba(212,160,23,0.06)",
                  border: `1px solid ${isRemove ? "rgba(239,68,68,0.15)" : "rgba(212,160,23,0.15)"}`,
                }}
              >
                <p style={{ fontSize: 12, color: confirmColor, margin: 0 }}>
                  {confirmText}
                </p>
              </div>
            )}

            {/* ── Preview ────────────────────────────────────────────── */}
            {isValid && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#A5A5A5", margin: 0 }}>
                  Önizleme (ilk {Math.min(count, 5)} ürün)
                </p>
                <div
                  style={{
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.07)",
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}
                  >
                    <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                      <tr>
                        {["SKU", "Ürün", "Mevcut Kategori", "Yeni Kategori"].map(
                          (h) => (
                            <th key={h} style={thStyle}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewSlice.map((p, i) => (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom:
                              i < previewSlice.length - 1
                                ? "1px solid rgba(255,255,255,0.04)"
                                : "none",
                          }}
                        >
                          <td style={tdMono}>{p.sku}</td>
                          <td style={{ ...tdBase, maxWidth: 160 }}>
                            <span
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.name}
                            </span>
                          </td>
                          <td style={{ ...tdBase, color: "#A5A5A5" }}>
                            {p.categories?.name ?? "—"}
                          </td>
                          <td
                            style={{
                              ...tdBase,
                              fontWeight: 600,
                              color: isRemove ? "#A5A5A5" : "#D4A017",
                            }}
                          >
                            {isRemove ? "—" : selectedCategory?.name ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {extraCount > 0 && (
                    <p
                      style={{
                        padding: "6px 12px",
                        fontSize: 11,
                        color: "#A5A5A5",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        margin: 0,
                      }}
                    >
                      + {extraCount} ürün daha
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isPending}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: !isValid ? "rgba(212,160,23,0.3)" : "#D4A017",
                  color: "#090A0C",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: !isValid || isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.65 : 1,
                  transition: "opacity 120ms",
                }}
              >
                {isPending ? "İşleniyor…" : `${count} Ürünü Güncelle`}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "#A5A5A5",
                  fontSize: 13,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.5 : 1,
                }}
              >
                İptal
              </button>
            </div>
          </>
        )}
      </div>
    </BulkModalShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: "6px 12px",
  textAlign: "left",
  fontWeight: 500,
  color: "#A5A5A5",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
}

const tdBase: React.CSSProperties = {
  padding: "6px 12px",
  color: "#F4F4F2",
}

const tdMono: React.CSSProperties = {
  padding: "6px 12px",
  fontFamily: "monospace",
  color: "#A5A5A5",
}
