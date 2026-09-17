"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { bulkPriceAction } from "@/lib/admin/bulk.actions"
import { formatPrice } from "@/lib/admin/format"
import type { BulkActionResult, BulkPriceOperation } from "@/lib/admin/schemas/bulk"
import BulkModalShell from "./BulkModalShell"

// ─────────────────────────────────────────────────────────────────────────────

interface SelectedProduct {
  id: string
  sku: string
  name: string
  price: number
}

interface Props {
  open: boolean
  selectedProducts: SelectedProduct[]
  onClose: () => void
  onSuccess: (affected: number, operationId: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────

const OPERATIONS: {
  value: BulkPriceOperation
  label: string
  desc: string
  placeholder: string
  hint: string
}[] = [
  {
    value: "set",
    label: "Fiyat Belirle",
    desc: "Tüm ürünlere sabit fiyat",
    placeholder: "199.90",
    hint: "Yeni fiyat (≥ 0)",
  },
  {
    value: "increase_fixed",
    label: "Sabit Artış",
    desc: "Mevcut fiyata ekle",
    placeholder: "50.00",
    hint: "Artış miktarı (> 0)",
  },
  {
    value: "decrease_fixed",
    label: "Sabit İndirim",
    desc: "Mevcut fiyattan düş",
    placeholder: "50.00",
    hint: "İndirim miktarı (> 0)",
  },
  {
    value: "increase_percent",
    label: "% Artış",
    desc: "Yüzde bazlı artış",
    placeholder: "10",
    hint: "0 < değer ≤ 1000",
  },
  {
    value: "decrease_percent",
    label: "% İndirim",
    desc: "Yüzde bazlı indirim",
    placeholder: "20",
    hint: "0 < değer < 100",
  },
]

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.09)",
  background: "#111214",
  color: "#F4F4F2",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
}

function computeNewPrice(current: number, op: BulkPriceOperation, val: number): number {
  switch (op) {
    case "set":             return val
    case "increase_fixed":  return current + val
    case "decrease_fixed":  return current - val
    case "increase_percent":
      return Math.round(current * (1 + val / 100) * 100) / 100
    case "decrease_percent":
      return Math.round(current * (1 - val / 100) * 100) / 100
  }
}

function priceColor(n: number): string {
  if (n < 0)  return "#EF4444"
  if (n === 0) return "#FBBF24"
  return "#34D399"
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BulkPriceModal({
  open,
  selectedProducts,
  onClose,
  onSuccess,
}: Props) {
  const [operation, setOperation] = useState<BulkPriceOperation>("set")
  const [valueStr, setValueStr] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<BulkActionResult | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)

  // ── Preview ──────────────────────────────────────────────────────────────

  const numValue = valueStr === "" ? null : parseFloat(valueStr)
  const validNum = numValue !== null && !isNaN(numValue)

  const activeOp = OPERATIONS.find((o) => o.value === operation)!

  const previewSlice = selectedProducts.slice(0, 5)
  const extraCount = selectedProducts.length - 5
  const previews = previewSlice.map((p) => ({
    ...p,
    newPrice: validNum && numValue !== null
      ? computeNewPrice(p.price, operation, numValue)
      : null,
  }))

  const hasNegative = previews.some((p) => p.newPrice !== null && p.newPrice < 0)
  const hasZeroNonSet =
    operation !== "set" &&
    previews.some((p) => p.newPrice !== null && p.newPrice === 0)

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): string | null {
    if (valueStr.trim() === "") return "Değer giriniz"
    const n = parseFloat(valueStr)
    if (isNaN(n)) return "Geçerli bir sayı giriniz"

    switch (operation) {
      case "set":
        if (n < 0) return "Fiyat negatif olamaz"
        break
      case "increase_fixed":
      case "decrease_fixed":
        if (n <= 0) return "Değer 0'dan büyük olmalı"
        break
      case "increase_percent":
        if (n <= 0 || n > 1000) return "Artış yüzdesi 0 ile 1000 arasında olmalı (0 hariç)"
        break
      case "decrease_percent":
        if (n <= 0 || n >= 100) return "İndirim yüzdesi 0 ile 100 arasında olmalı (her ikisi hariç)"
        break
    }
    return null
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (isPending) return
    const err = validate()
    if (err) { setClientError(err); return }

    setClientError(null)
    setIsPending(true)
    setResult(null)

    const res = await bulkPriceAction({
      productIds: selectedProducts.map((p) => p.id),
      operation,
      value: parseFloat(valueStr),
    })

    setIsPending(false)
    setResult(res)

    if (res.ok) {
      setTimeout(() => onSuccess(res.affected, res.operationId), 1800)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const count = selectedProducts.length

  return (
    <BulkModalShell
      open={open}
      onClose={onClose}
      title={`Toplu Fiyat İşlemi — ${count} ürün`}
      maxWidth={720}
    >
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Success state ────────────────────────────────────────────── */}
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
              <strong>{result.affected}</strong> ürünün fiyatı başarıyla güncellendi.
              <span style={{ fontSize: 11, color: "#A5A5A5", marginLeft: 8 }}>
                #{result.operationId.slice(-8)}
              </span>
            </span>
          </div>
        )}

        {/* ── Error state ──────────────────────────────────────────────── */}
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
            <p style={{ fontWeight: 600, marginBottom: result.failedProducts ? 8 : 0 }}>
              {result.error}
            </p>
            {result.failedProducts && result.failedProducts.length > 0 && (
              <div style={{ overflowX: "auto", marginTop: 8 }}>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "#A5A5A5", textAlign: "left" }}>
                      {["SKU", "Mevcut Fiyat", "Hesaplanan", "Hata"].map((h) => (
                        <th key={h} style={{ padding: "4px 8px", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.failedProducts.map((fp) => (
                      <tr key={fp.product_id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: "4px 8px", fontFamily: "monospace", color: "#A5A5A5" }}>{fp.sku}</td>
                        <td style={{ padding: "4px 8px", color: "#F4F4F2" }}>
                          {fp.current != null ? formatPrice(fp.current) : "—"}
                        </td>
                        <td style={{ padding: "4px 8px", color: "#EF4444" }}>
                          {fp.calculated != null ? formatPrice(fp.calculated) : "—"}
                        </td>
                        <td style={{ padding: "4px 8px", color: "#F87171" }}>{fp.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Client error ─────────────────────────────────────────────── */}
        {clientError && (
          <p style={{ fontSize: 13, color: "#F87171", margin: 0 }}>
            {clientError}
          </p>
        )}

        {/* Only show form when not yet succeeded */}
        {!(result?.ok) && (
          <>
            {/* ── Operation selector ──────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#F4F4F2", margin: 0 }}>
                İşlem Tipi <span style={{ color: "#D4A017" }}>*</span>
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: 8,
                }}
              >
                {OPERATIONS.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => { setOperation(op.value); setClientError(null) }}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: operation === op.value
                        ? "1px solid #D4A017"
                        : "1px solid rgba(255,255,255,0.09)",
                      background: operation === op.value
                        ? "rgba(212,160,23,0.08)"
                        : "#111214",
                      cursor: "pointer",
                      transition: "border-color 120ms, background 120ms",
                    }}
                  >
                    <p style={{
                      fontSize: 12, fontWeight: 600,
                      color: operation === op.value ? "#D4A017" : "#F4F4F2",
                      margin: "0 0 2px",
                    }}>
                      {op.label}
                    </p>
                    <p style={{ fontSize: 11, color: "#A5A5A5", margin: 0 }}>
                      {op.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Value input ─────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#F4F4F2" }}>
                {operation.includes("percent") ? "Yüzde (%)" : "Tutar (₺)"}{" "}
                <span style={{ color: "#D4A017" }}>*</span>
              </label>
              <input
                type="number"
                value={valueStr}
                onChange={(e) => { setValueStr(e.target.value); setClientError(null) }}
                min={operation === "set" ? 0 : 0.01}
                step={operation.includes("percent") ? 0.1 : 0.01}
                placeholder={activeOp.placeholder}
                style={inputStyle}
                aria-label="Fiyat değeri"
              />
              <p style={{ fontSize: 11, color: "#A5A5A5", margin: 0 }}>
                {activeOp.hint}
              </p>
            </div>

            {/* ── Warnings ────────────────────────────────────────────── */}
            {hasNegative && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.07)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertTriangle size={15} style={{ color: "#F87171", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "#F87171", margin: 0 }}>
                  Bu işlem bazı ürünlerin fiyatını negatife düşürür. RPC reddedecektir; işlem uygulanmayacak.
                </p>
              </div>
            )}
            {hasZeroNonSet && !hasNegative && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(251,191,36,0.07)",
                  border: "1px solid rgba(251,191,36,0.2)",
                }}
              >
                <AlertTriangle size={15} style={{ color: "#FBBF24", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "#FBBF24", margin: 0 }}>
                  Bazı ürünlerin fiyatı sıfıra düşüyor. Sıfır fiyat yalnızca &quot;Fiyat Belirle&quot; işlemiyle belirlenebilir (ZERO_PRICE_NOT_ALLOWED). RPC reddedecektir.
                </p>
              </div>
            )}

            {/* ── Preview table ────────────────────────────────────────── */}
            {validNum && numValue !== null && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#A5A5A5", margin: 0 }}>
                  Önizleme (ilk {Math.min(count, 5)} ürün)
                </p>
                <div
                  style={{
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.07)",
                    overflow: "hidden",
                  }}
                >
                  <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                    <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                      <tr>
                        {["SKU", "Ürün", "Mevcut Fiyat", "Yeni Fiyat"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "6px 12px",
                              textAlign: "left",
                              fontWeight: 500,
                              color: "#A5A5A5",
                              borderBottom: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previews.map((p, i) => (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom:
                              i < previews.length - 1
                                ? "1px solid rgba(255,255,255,0.04)"
                                : "none",
                          }}
                        >
                          <td style={{ padding: "6px 12px", fontFamily: "monospace", color: "#A5A5A5" }}>
                            {p.sku}
                          </td>
                          <td style={{ padding: "6px 12px", color: "#F4F4F2", maxWidth: 160 }}>
                            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.name}
                            </span>
                          </td>
                          <td style={{ padding: "6px 12px", color: "#A5A5A5", fontVariantNumeric: "tabular-nums" }}>
                            {formatPrice(p.price)}
                          </td>
                          <td
                            style={{
                              padding: "6px 12px",
                              fontVariantNumeric: "tabular-nums",
                              fontWeight: 600,
                              color: p.newPrice !== null ? priceColor(p.newPrice) : "#A5A5A5",
                            }}
                          >
                            {p.newPrice !== null ? formatPrice(p.newPrice) : "—"}
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

            {/* ── Footer ──────────────────────────────────────────────── */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#D4A017",
                  color: "#090A0C",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
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
