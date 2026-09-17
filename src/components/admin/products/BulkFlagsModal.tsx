"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { bulkFlagsAction } from "@/lib/admin/bulk.actions"
import type { BulkActionResult } from "@/lib/admin/schemas/bulk"
import BulkModalShell from "./BulkModalShell"

// ─────────────────────────────────────────────────────────────────────────────

type FlagState = "unchanged" | "on" | "off"

interface FlagsFormState {
  is_active: FlagState
  is_featured: FlagState
  is_new: FlagState
  same_day_shipping: FlagState
}

interface SelectedProduct {
  id: string
  sku: string
  name: string
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  same_day_shipping: boolean
}

interface Props {
  open: boolean
  selectedProducts: SelectedProduct[]
  onClose: () => void
  onSuccess: (affected: number, operationId: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────

const FLAG_DEFS: {
  key: keyof FlagsFormState
  label: string
  trueLabel: string
  falseLabel: string
}[] = [
  { key: "is_active",         label: "Aktif",           trueLabel: "Aktif",  falseLabel: "Pasif"  },
  { key: "is_featured",       label: "Öne Çıkan",       trueLabel: "Evet",   falseLabel: "Hayır"  },
  { key: "is_new",            label: "Yeni",            trueLabel: "Evet",   falseLabel: "Hayır"  },
  { key: "same_day_shipping", label: "Aynı Gün Kargo",  trueLabel: "Evet",   falseLabel: "Hayır"  },
]

const INITIAL_FLAGS: FlagsFormState = {
  is_active: "unchanged",
  is_featured: "unchanged",
  is_new: "unchanged",
  same_day_shipping: "unchanged",
}

// ─────────────────────────────────────────────────────────────────────────────

function FlagControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: FlagState
  onChange: (v: FlagState) => void
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{ minWidth: 140, fontSize: 13, color: "#F4F4F2", flexShrink: 0 }}
      >
        {label}
      </span>
      <div
        role="group"
        aria-label={`${label} seçeneği`}
        style={{ display: "flex", gap: 4 }}
      >
        {(["unchanged", "on", "off"] as FlagState[]).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={value === opt}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              border:
                value === opt
                  ? "1px solid #D4A017"
                  : "1px solid rgba(255,255,255,0.09)",
              background:
                value === opt ? "rgba(212,160,23,0.1)" : "#111214",
              color: value === opt ? "#D4A017" : "#A5A5A5",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 120ms",
            }}
          >
            {opt === "unchanged" ? "Değiştirme" : opt === "on" ? "Aç" : "Kapat"}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BulkFlagsModal({
  open,
  selectedProducts,
  onClose,
  onSuccess,
}: Props) {
  const [flags, setFlags] = useState<FlagsFormState>(INITIAL_FLAGS)
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<BulkActionResult | null>(null)

  const setFlag = (key: keyof FlagsFormState, value: FlagState) => {
    setFlags((prev) => ({ ...prev, [key]: value }))
  }

  const changedDefs = FLAG_DEFS.filter((f) => flags[f.key] !== "unchanged")
  const hasChanges = changedDefs.length > 0
  const count = selectedProducts.length
  const previewSlice = selectedProducts.slice(0, 5)
  const extraCount = selectedProducts.length - 5

  // ── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!hasChanges || isPending) return

    const flagsPayload: {
      is_active?: boolean
      is_featured?: boolean
      is_new?: boolean
      same_day_shipping?: boolean
    } = {}
    if (flags.is_active !== "unchanged")
      flagsPayload.is_active = flags.is_active === "on"
    if (flags.is_featured !== "unchanged")
      flagsPayload.is_featured = flags.is_featured === "on"
    if (flags.is_new !== "unchanged")
      flagsPayload.is_new = flags.is_new === "on"
    if (flags.same_day_shipping !== "unchanged")
      flagsPayload.same_day_shipping = flags.same_day_shipping === "on"

    setIsPending(true)
    setResult(null)

    const res = await bulkFlagsAction({
      productIds: selectedProducts.map((p) => p.id),
      flags: flagsPayload,
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
      title={`Durum ve Özellikler — ${count} ürün`}
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
              <strong>{result.affected}</strong> ürün başarıyla güncellendi.
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
            {/* ── Flag controls ──────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#F4F4F2", margin: 0 }}>
                Hangi alanları değiştirmek istiyorsunuz?
              </p>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {FLAG_DEFS.map((f) => (
                  <FlagControl
                    key={f.key}
                    label={f.label}
                    value={flags[f.key]}
                    onChange={(v) => setFlag(f.key, v)}
                  />
                ))}
              </div>
            </div>

            {/* ── Confirmation summary ───────────────────────────────── */}
            {hasChanges && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: "rgba(212,160,23,0.06)",
                  border: "1px solid rgba(212,160,23,0.15)",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#D4A017",
                    margin: "0 0 6px",
                  }}
                >
                  {count} ürün güncellenecek:
                </p>
                {changedDefs.map((f) => (
                  <p key={f.key} style={{ fontSize: 12, color: "#A5A5A5", margin: "2px 0" }}>
                    •{" "}
                    <span style={{ color: "#F4F4F2" }}>{f.label}</span>
                    {" → "}
                    <span
                      style={{
                        color: flags[f.key] === "on" ? "#34D399" : "#F87171",
                        fontWeight: 600,
                      }}
                    >
                      {flags[f.key] === "on" ? f.trueLabel : f.falseLabel}
                    </span>
                  </p>
                ))}
              </div>
            )}

            {/* ── Preview table ──────────────────────────────────────── */}
            {hasChanges && previewSlice.length > 0 && (
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
                    style={{
                      width: "100%",
                      fontSize: 11,
                      borderCollapse: "collapse",
                      minWidth: 480,
                    }}
                  >
                    <thead style={{ background: "rgba(255,255,255,0.03)" }}>
                      <tr>
                        <th style={thStyle}>SKU</th>
                        <th style={thStyle}>Ürün</th>
                        {FLAG_DEFS.map((f) => (
                          <th
                            key={f.key}
                            style={{
                              ...thStyle,
                              textAlign: "center",
                              color:
                                flags[f.key] !== "unchanged"
                                  ? "#D4A017"
                                  : "#A5A5A5",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {f.label}
                          </th>
                        ))}
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
                          <td style={{ ...tdBase, maxWidth: 140 }}>
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
                          {FLAG_DEFS.map((f) => {
                            const current = p[f.key] as boolean
                            const changed = flags[f.key] !== "unchanged"
                            const newVal = changed
                              ? flags[f.key] === "on"
                              : current
                            return (
                              <td
                                key={f.key}
                                style={{ padding: "5px 10px", textAlign: "center" }}
                              >
                                {changed ? (
                                  <span
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 4,
                                      fontSize: 11,
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: current ? "#34D399" : "#A5A5A5",
                                      }}
                                    >
                                      {current ? f.trueLabel : f.falseLabel}
                                    </span>
                                    <span style={{ color: "#555" }}>→</span>
                                    <span
                                      style={{
                                        color: newVal ? "#34D399" : "#F87171",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {newVal ? f.trueLabel : f.falseLabel}
                                    </span>
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      color: current ? "#34D399" : "#A5A5A5",
                                    }}
                                  >
                                    {current ? f.trueLabel : f.falseLabel}
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {extraCount > 0 && (
                    <p
                      style={{
                        padding: "5px 10px",
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
                disabled={!hasChanges || isPending}
                style={{
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: !hasChanges ? "rgba(212,160,23,0.3)" : "#D4A017",
                  color: "#090A0C",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: !hasChanges || isPending ? "not-allowed" : "pointer",
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
// Shared cell styles (module-local)
// ─────────────────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: "6px 10px",
  textAlign: "left",
  fontWeight: 500,
  color: "#A5A5A5",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
}

const tdBase: React.CSSProperties = {
  padding: "5px 10px",
  color: "#F4F4F2",
}

const tdMono: React.CSSProperties = {
  padding: "5px 10px",
  fontFamily: "monospace",
  color: "#A5A5A5",
}
