"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { bulkStockAction } from "@/lib/admin/bulk.actions"
import type { BulkActionResult } from "@/lib/admin/schemas/bulk"
import BulkModalShell from "./BulkModalShell"

// ─────────────────────────────────────────────────────────────────────────────

type Operation = "add" | "remove" | "set"

interface SelectedProduct {
  id: string
  sku: string
  name: string
  stock_quantity: number
  reserved_stock?: number   // present when used from Inventory context
}

interface Props {
  open: boolean
  selectedProducts: SelectedProduct[]
  onClose: () => void
  onSuccess: (affected: number, operationId: string) => void
  initialOperation?: Operation  // pre-selects operation (Inventory action bar)
}

// ─────────────────────────────────────────────────────────────────────────────

const OPERATIONS: { value: Operation; label: string; desc: string }[] = [
  { value: "add",    label: "Stok Ekle",    desc: "Mevcut stoğa ekle" },
  { value: "remove", label: "Stok Azalt",   desc: "Mevcut stoktan düş" },
  { value: "set",    label: "Değeri Ata",   desc: "Stoğu sabit değere ayarla" },
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

function computeNewStock(current: number, op: Operation, val: number): number {
  if (op === "add")    return current + val
  if (op === "remove") return current - val
  return val
}

function stockColor(n: number): string {
  if (n < 0)  return "#EF4444"
  if (n === 0) return "#F87171"
  if (n < 5)  return "#FBBF24"
  return "#34D399"
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BulkStockModal({
  open,
  selectedProducts,
  onClose,
  onSuccess,
  initialOperation,
}: Props) {
  const [operation, setOperation] = useState<Operation>(initialOperation ?? "add")
  const [valueStr, setValueStr] = useState("")
  const [reason, setReason] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<BulkActionResult | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)

  // ── Preview ──────────────────────────────────────────────────────────────

  const numValue = valueStr === "" ? 0 : parseInt(valueStr, 10)
  const validNum = !isNaN(numValue) && Number.isInteger(numValue)

  const previewSlice = selectedProducts.slice(0, 5)
  const extraCount = selectedProducts.length - 5
  const previews = previewSlice.map((p) => ({
    ...p,
    newStock: validNum ? computeNewStock(p.stock_quantity, operation, numValue) : null,
  }))
  const hasDestructive =
    validNum && previews.some((p) => p.newStock !== null && p.newStock < 0)

  // Reserved stock violation: new stock would dip below reserved quantity
  const showReserved = selectedProducts.some((p) => (p.reserved_stock ?? 0) > 0)
  const hasReservedViolation =
    validNum &&
    (operation === "remove" || operation === "set") &&
    previews.some((p) => {
      const reserved = p.reserved_stock ?? 0
      return reserved > 0 && p.newStock !== null && p.newStock < reserved
    })

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): string | null {
    if (valueStr.trim() === "") return "Miktar giriniz"
    const n = parseInt(valueStr, 10)
    if (isNaN(n) || !Number.isInteger(n)) return "Miktar tam sayı olmalı"
    if ((operation === "add" || operation === "remove") && n <= 0)
      return "add ve remove için değer 0'dan büyük olmalı"
    if (operation === "set" && n < 0)
      return "set için değer 0 veya daha büyük olmalı"
    const r = reason.trim()
    if (r.length < 10) return "Sebep en az 10 karakter olmalı"
    if (r.length > 500) return "Sebep 500 karakteri geçemez"
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

    const res = await bulkStockAction({
      productIds: selectedProducts.map((p) => p.id),
      operation,
      value: parseInt(valueStr, 10),
      reason: reason.trim(),
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
      title={`Toplu Stok İşlemi — ${count} ürün`}
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
              <strong>{result.affected}</strong> ürün başarıyla güncellendi.
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
                      {["SKU", "Ürün", "Mevcut", "Sonuç", "Hata"].map((h) => (
                        <th key={h} style={{ padding: "4px 8px", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.failedProducts.map((fp) => (
                      <tr key={fp.product_id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td style={{ padding: "4px 8px", fontFamily: "monospace", color: "#A5A5A5" }}>{fp.sku}</td>
                        <td style={{ padding: "4px 8px", color: "#F4F4F2" }}>{fp.product_id.slice(-6)}</td>
                        <td style={{ padding: "4px 8px", color: "#F4F4F2" }}>{fp.current ?? "—"}</td>
                        <td style={{ padding: "4px 8px", color: "#EF4444" }}>{fp.calculated ?? "—"}</td>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {OPERATIONS.map((op) => (
                  <button
                    key={op.value}
                    type="button"
                    onClick={() => setOperation(op.value)}
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
                    <p style={{ fontSize: 12, fontWeight: 600, color: operation === op.value ? "#D4A017" : "#F4F4F2", margin: "0 0 2px" }}>
                      {op.label}
                    </p>
                    <p style={{ fontSize: 11, color: "#A5A5A5", margin: 0 }}>
                      {op.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Quantity input ──────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#F4F4F2" }}>
                Miktar <span style={{ color: "#D4A017" }}>*</span>
              </label>
              <input
                type="number"
                value={valueStr}
                onChange={(e) => { setValueStr(e.target.value); setClientError(null) }}
                min={operation === "set" ? 0 : 1}
                step={1}
                placeholder={operation === "set" ? "0" : "1"}
                style={inputStyle}
                aria-label="Stok miktarı"
              />
              <p style={{ fontSize: 11, color: "#A5A5A5", margin: 0 }}>
                {operation === "add" && "Bu miktar mevcut stoğa eklenecek."}
                {operation === "remove" && "Bu miktar mevcut stoktan düşülecek."}
                {operation === "set" && "Stok bu değere sabitlenecek. 0 = stok sıfırlanır."}
              </p>
            </div>

            {/* ── Reason textarea ─────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#F4F4F2" }}>
                Sebep <span style={{ color: "#D4A017" }}>*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setClientError(null) }}
                rows={3}
                maxLength={500}
                placeholder="Stok değişikliğinin sebebini açıklayın (en az 10 karakter)…"
                style={{ ...inputStyle, resize: "vertical" }}
                aria-label="Değişiklik sebebi"
              />
              <p style={{ fontSize: 11, color: reason.length > 480 ? "#FBBF24" : "#A5A5A5", margin: 0 }}>
                {reason.trim().length}/500 karakter
              </p>
            </div>

            {/* ── Destructive warning ─────────────────────────────────── */}
            {hasDestructive && (
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
                  Bu işlem bazı ürünlerin stok miktarını negatife düşürür. RPC Phase 1 doğrulaması reddedecektir; işlem uygulanmayacak.
                </p>
              </div>
            )}

            {/* ── Reserved stock violation warning ─────────────────────── */}
            {hasReservedViolation && !hasDestructive && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(249,115,22,0.07)",
                  border: "1px solid rgba(249,115,22,0.25)",
                }}
              >
                <AlertTriangle size={15} style={{ color: "#fb923c", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: "#fb923c", margin: 0 }}>
                  Bazı ürünlerde yeni stok miktarı rezerve miktarının altına düşüyor. RPC RESERVED_STOCK_VIOLATION hatasıyla reddedecektir.
                </p>
              </div>
            )}

            {/* ── Preview table ────────────────────────────────────────── */}
            {valueStr !== "" && validNum && (
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
                  <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                    <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                      <tr>
                        {["SKU", "Ürün", "Mevcut", ...(showReserved ? ["Rezerve"] : []), "Yeni"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "6px 12px",
                              textAlign: "left",
                              fontWeight: 500,
                              color: h === "Rezerve" ? "#fb923c" : "#A5A5A5",
                              borderBottom: "1px solid rgba(255,255,255,0.07)",
                              whiteSpace: "nowrap",
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
                          <td style={{ padding: "6px 12px", color: "#F4F4F2", maxWidth: 180 }}>
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
                          <td style={{ padding: "6px 12px", color: "#F4F4F2", fontVariantNumeric: "tabular-nums" }}>
                            {p.stock_quantity}
                          </td>
                          {showReserved && (
                            <td
                              style={{
                                padding: "6px 12px",
                                fontVariantNumeric: "tabular-nums",
                                color:
                                  (p.reserved_stock ?? 0) > 0 ? "#fb923c" : "#A5A5A5",
                              }}
                            >
                              {p.reserved_stock ?? 0}
                            </td>
                          )}
                          <td
                            style={{
                              padding: "6px 12px",
                              fontVariantNumeric: "tabular-nums",
                              fontWeight: 600,
                              color: p.newStock !== null ? stockColor(p.newStock) : "#A5A5A5",
                            }}
                          >
                            {p.newStock ?? "—"}
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
            <div
              style={{
                display: "flex",
                gap: 10,
                paddingTop: 4,
              }}
            >
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
