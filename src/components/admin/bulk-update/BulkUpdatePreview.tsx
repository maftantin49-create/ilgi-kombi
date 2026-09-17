"use client"

import { useState } from "react"
import { X, Download } from "lucide-react"
import type { UpdateValidationSummary, UpdateRowResult } from "@/lib/admin/bulk-update.actions"

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  valid:     { label: "Geçerli",   bg: "rgba(52,211,153,0.12)",  color: "#34D399" },
  warning:   { label: "Uyarı",     bg: "rgba(212,160,23,0.12)",  color: "#D4A017" },
  error:     { label: "Hata",      bg: "rgba(239,68,68,0.12)",   color: "#F87171" },
  no_change: { label: "Değişmedi", bg: "rgba(165,165,165,0.1)",  color: "#A5A5A5" },
} as const

function StatusBadge({ status }: { status: UpdateRowResult["status"] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        display: "inline-block", fontSize: 11, fontWeight: 600,
        padding: "2px 8px", borderRadius: 4,
        background: cfg.bg, color: cfg.color, whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Field diff / message tags
// ─────────────────────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  price: "Fiyat", stock: "Stok", is_active: "Aktif",
  is_featured: "Öne Çıkan", is_new: "Yeni",
  same_day_shipping: "Aynı Gün Kargo", brand_id: "Marka",
  brand: "Marka", category_id: "Kategori", category: "Kategori", sku: "SKU",
}

function formatDiffValue(val: unknown): string {
  if (val === null) return "—"
  if (typeof val === "boolean") return val ? "EVET" : "HAYIR"
  if (typeof val === "number") return val.toLocaleString("tr-TR")
  return String(val)
}

function DiffTags({ diffs }: { diffs: UpdateRowResult["diffs"] }) {
  if (diffs.length === 0) return null
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
      {diffs.map((d, i) => (
        <span key={i} style={{
          fontSize: 11, padding: "2px 7px", borderRadius: 4,
          background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.2)",
          color: "#D4A017", whiteSpace: "nowrap",
        }}>
          <span style={{ color: "#A5A5A5" }}>{FIELD_LABELS[d.field] ?? d.field}: </span>
          <span style={{ textDecoration: "line-through", color: "#6B7280" }}>
            {formatDiffValue(d.currentValue)}
          </span>
          {" → "}
          {formatDiffValue(d.newValue)}
        </span>
      ))}
    </div>
  )
}

function MsgTags({ items, variant }: { items: { field: string; message: string }[]; variant: "error" | "warning" }) {
  if (items.length === 0) return null
  const isErr = variant === "error"
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
      {items.map((e, i) => (
        <span key={i} style={{
          fontSize: 11, padding: "2px 7px", borderRadius: 4,
          background: isErr ? "rgba(239,68,68,0.08)" : "rgba(212,160,23,0.08)",
          border: `1px solid ${isErr ? "rgba(239,68,68,0.2)" : "rgba(212,160,23,0.2)"}`,
          color: isErr ? "#F87171" : "#D4A017",
        }}>
          {e.message}
        </span>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats bar item
// ─────────────────────────────────────────────────────────────────────────────

function StatItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? "#F4F4F2", lineHeight: 1 }}>
        {value.toLocaleString("tr-TR")}
      </div>
      <div style={{ fontSize: 11, color: "#A5A5A5", marginTop: 3 }}>{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Error/warning XLSX report download
// ─────────────────────────────────────────────────────────────────────────────

function deriveErrorCode(field: string, message: string): string {
  if (message.includes("Tekrarlayan SKU"))    return "DUPLICATE_SKU"
  if (message.includes("SKU zorunludur"))     return "MISSING_SKU"
  if (message.includes("Ürün bulunamadı"))    return "UNKNOWN_SKU"
  if (message.includes("Marka bulunamadı"))   return "UNKNOWN_BRAND"
  if (message.includes("Kategori bulunamadı")) return "UNKNOWN_CATEGORY"
  if (message.includes("negatif olamaz") && field === "price") return "NEGATIVE_PRICE"
  if (message.includes("negatif olamaz") && field === "stock") return "NEGATIVE_STOCK"
  if (message.includes("rezerve") || message.includes("rezervasyon")) return "RESERVED_STOCK"
  if (message.includes("Geçersiz fiyat"))     return "PARSE_ERROR_PRICE"
  if (message.includes("Geçersiz stok"))      return "PARSE_ERROR_STOCK"
  if (message.includes("tanınmayan değer"))   return "PARSE_ERROR_BOOLEAN"
  return field.toUpperCase() + "_ERROR"
}

function deriveWarnCode(field: string): string {
  return field.toUpperCase() + "_WARNING"
}

function fmtVal(v: unknown): string {
  if (v === null || v === undefined) return "—"
  if (typeof v === "boolean") return v ? "Evet" : "Hayır"
  if (typeof v === "number") return v.toLocaleString("tr-TR")
  return String(v)
}

async function downloadIssueReport(issueRows: UpdateRowResult[], hasErrors: boolean, hasWarnings: boolean) {
  const XLSX = await import("xlsx")
  const wb = XLSX.utils.book_new()

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`

  const REPORT_HEADERS = [
    "Excel Satırı", "SKU", "Ürün", "Alan",
    "Hata Kodu", "Hata Açıklaması", "Mevcut Değer", "Yeni Değer",
  ]
  const COL_WIDTHS = [
    { wch: 12 }, { wch: 16 }, { wch: 28 }, { wch: 16 },
    { wch: 26 }, { wch: 52 }, { wch: 16 }, { wch: 16 },
  ]

  // ── Hatalar sheet ──────────────────────────────────────────────────────────
  if (hasErrors) {
    const errorRows = issueRows.filter((r) => r.status === "error")
    const data: string[][] = [REPORT_HEADERS]
    for (const row of errorRows) {
      for (const err of row.errors) {
        const diff = row.diffs.find((d) => d.field === err.field)
        data.push([
          String(row.rowNumber),
          row.sku || "—",
          row.productName || "—",
          FIELD_LABELS[err.field] ?? err.field,
          deriveErrorCode(err.field, err.message),
          err.message,
          diff ? fmtVal(diff.currentValue) : "—",
          diff ? fmtVal(diff.newValue) : "—",
        ])
      }
      // Rows that have no explicit errors but are error-status (e.g. parse error only)
      if (row.errors.length === 0) {
        data.push([
          String(row.rowNumber),
          row.sku || "—",
          row.productName || "—",
          "—",
          "UNKNOWN_ERROR",
          "Bilinmeyen hata",
          "—",
          "—",
        ])
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(data)
    ws["!cols"] = COL_WIDTHS
    XLSX.utils.book_append_sheet(wb, ws, "Hatalar")
  }

  // ── Uyarılar sheet ────────────────────────────────────────────────────────
  if (hasWarnings) {
    const warnRows = issueRows.filter((r) => r.status === "warning")
    const data: string[][] = [[
      "Excel Satırı", "SKU", "Ürün", "Alan",
      "Uyarı Kodu", "Uyarı Açıklaması", "Mevcut Değer", "Yeni Değer",
    ]]
    for (const row of warnRows) {
      for (const w of row.warnings) {
        const diff = row.diffs.find((d) => d.field === w.field)
        data.push([
          String(row.rowNumber),
          row.sku || "—",
          row.productName || "—",
          FIELD_LABELS[w.field] ?? w.field,
          deriveWarnCode(w.field),
          w.message,
          diff ? fmtVal(diff.currentValue) : "—",
          diff ? fmtVal(diff.newValue) : "—",
        ])
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(data)
    ws["!cols"] = COL_WIDTHS
    XLSX.utils.book_append_sheet(wb, ws, "Uyarılar")
  }

  XLSX.writeFile(wb, `bulk-update-hata-raporu-${dateStr}.xlsx`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Report download button
// ─────────────────────────────────────────────────────────────────────────────

function ReportDownloadButton({
  issueRows,
  hasErrors,
  hasWarnings,
}: {
  issueRows: UpdateRowResult[]
  hasErrors: boolean
  hasWarnings: boolean
}) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      await downloadIssueReport(issueRows, hasErrors, hasWarnings)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 500,
        padding: "5px 12px", borderRadius: 7,
        border: "1px solid rgba(239,68,68,0.3)",
        background: "rgba(239,68,68,0.06)",
        color: "#F87171",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "opacity 120ms",
        flexShrink: 0,
      }}
    >
      <Download size={12} />
      {loading ? "Hazırlanıyor…" : "Hata Raporunu İndir"}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirmation modal
// ─────────────────────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  summary: UpdateValidationSummary
  changedCount: number
  isCommitting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ summary, changedCount, isCommitting, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div style={{
        background: "#1A1C1F", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 14, padding: 28, width: "100%", maxWidth: 440,
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#F4F4F2" }}>
            Güncellemeyi Onayla
          </h3>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: "#A5A5A5", cursor: "pointer", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 10, padding: "16px 20px", marginBottom: 20,
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <ModalStatRow label="Güncellenecek ürün"  value={changedCount} />
          {summary.fieldsChanged > 0     && <ModalStatRow label="Toplam alan değişimi" value={summary.fieldsChanged} />}
          {summary.priceUpdates > 0      && <ModalStatRow label="Fiyat güncellemesi"   value={summary.priceUpdates} />}
          {summary.stockUpdates > 0      && <ModalStatRow label="Stok güncellemesi"    value={summary.stockUpdates} />}
          {summary.flagUpdates > 0       && <ModalStatRow label="Bayrak değişimi"       value={summary.flagUpdates} />}
          {summary.brandUpdates > 0      && <ModalStatRow label="Marka değişimi"        value={summary.brandUpdates} />}
          {summary.categoryUpdates > 0   && <ModalStatRow label="Kategori değişimi"     value={summary.categoryUpdates} />}
          {summary.rowsWarning > 0 && (
            <div style={{ fontSize: 12, color: "#D4A017", marginTop: 4, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {summary.rowsWarning} satırda uyarı var (commit engellenmiyor).
            </div>
          )}
        </div>

        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#A5A5A5", lineHeight: 1.5 }}>
          Bu işlem mevcut ürün verilerini değiştirecektir. Aktif rezervasyonlar etkilenmez. Bu işlem geri alınamaz.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={isCommitting}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "#A5A5A5",
              cursor: isCommitting ? "not-allowed" : "pointer",
              opacity: isCommitting ? 0.5 : 1,
            }}
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isCommitting}
            style={{
              padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: "none",
              background: isCommitting ? "rgba(212,160,23,0.4)" : "#D4A017",
              color: "#0D0E10",
              cursor: isCommitting ? "not-allowed" : "pointer",
              minWidth: 150,
            }}
          >
            {isCommitting ? "Güncelleniyor…" : `${changedCount} Ürünü Güncelle`}
          </button>
        </div>
      </div>
    </div>
  )
}

function ModalStatRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "#A5A5A5" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#F4F4F2" }}>{value.toLocaleString("tr-TR")}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main preview component
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  summary: UpdateValidationSummary
  previewRows: UpdateRowResult[]
  issueRows: UpdateRowResult[]   // all error+warning rows — for XLSX download
  hasErrors: boolean
  hasWarnings: boolean
  isCommitting: boolean
  onCommit: () => void
}

export function BulkUpdatePreview({
  summary, previewRows, issueRows, hasErrors, hasWarnings, isCommitting, onCommit,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const totalMeaningful = summary.rowsValid + summary.rowsWarning + summary.rowsError + summary.rowsNoChange
  const changedCount = summary.rowsValid + summary.rowsWarning
  const canCommit = !hasErrors && changedCount > 0 && changedCount <= 500

  const handleConfirm = () => {
    setModalOpen(false)
    onCommit()
  }

  return (
    <>
      {modalOpen && (
        <ConfirmModal
          summary={summary}
          changedCount={changedCount}
          isCommitting={isCommitting}
          onConfirm={handleConfirm}
          onCancel={() => setModalOpen(false)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Summary banner ─────────────────────────────────────────────── */}
        <div style={{
          background: "#151618",
          border: `1px solid ${hasErrors ? "rgba(239,68,68,0.3)" : hasWarnings ? "rgba(212,160,23,0.3)" : "rgba(52,211,153,0.3)"}`,
          borderRadius: 12, padding: "20px 24px",
        }}>
          {/* Header row: title + badges + report download */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#F4F4F2", flexShrink: 0 }}>
              Doğrulama Sonuçları
            </h3>

            {hasErrors && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(239,68,68,0.12)", color: "#F87171", flexShrink: 0 }}>
                {summary.rowsError} hata — commit engellendi
              </span>
            )}
            {!hasErrors && hasWarnings && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(212,160,23,0.12)", color: "#D4A017", flexShrink: 0 }}>
                {summary.rowsWarning} uyarı
              </span>
            )}
            {!hasErrors && !hasWarnings && changedCount > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: "rgba(52,211,153,0.12)", color: "#34D399", flexShrink: 0 }}>
                Hazır
              </span>
            )}

            {/* Report download button — shown when there are errors or warnings */}
            {(hasErrors || hasWarnings) && (
              <div style={{ marginLeft: "auto" }}>
                <ReportDownloadButton
                  issueRows={issueRows}
                  hasErrors={hasErrors}
                  hasWarnings={hasWarnings}
                />
              </div>
            )}
          </div>

          {/* Stat grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
            gap: "16px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: 20, marginBottom: 20,
          }}>
            <StatItem label="Toplam Satır"  value={summary.rowsTotal} />
            <StatItem label="Yoksayıldı"    value={summary.rowsIgnored}  color="#A5A5A5" />
            <StatItem label="İşlenecek"     value={totalMeaningful} />
            <StatItem label="Geçerli"       value={summary.rowsValid}    color="#34D399" />
            <StatItem label="Uyarı"         value={summary.rowsWarning}  color="#D4A017" />
            <StatItem label="Hata"          value={summary.rowsError}    color="#F87171" />
            <StatItem label="Değişmedi"     value={summary.rowsNoChange} color="#A5A5A5" />
          </div>

          {/* Field change breakdown */}
          {summary.fieldsChanged > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 24px" }}>
              {[
                { label: "Alan Değişimi", value: summary.fieldsChanged },
                summary.priceUpdates    && { label: "Fiyat",    value: summary.priceUpdates    },
                summary.stockUpdates    && { label: "Stok",     value: summary.stockUpdates    },
                summary.flagUpdates     && { label: "Bayrak",   value: summary.flagUpdates     },
                summary.brandUpdates    && { label: "Marka",    value: summary.brandUpdates    },
                summary.categoryUpdates && { label: "Kategori", value: summary.categoryUpdates },
              ]
                .filter(Boolean)
                .map((item, i) => {
                  const { label, value } = item as { label: string; value: number }
                  return (
                    <div key={i} style={{ fontSize: 13, color: "#A5A5A5" }}>
                      <span style={{ color: "#F4F4F2", fontWeight: 600 }}>{value.toLocaleString("tr-TR")}</span>{" "}{label}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* ── Row preview table ──────────────────────────────────────────── */}
        {previewRows.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#F4F4F2" }}>
                Satır Önizleme
              </h4>
              {summary.rowsTotal > previewRows.length && (
                <span style={{ fontSize: 12, color: "#A5A5A5" }}>
                  İlk {previewRows.length} satır gösteriliyor (toplam {summary.rowsTotal})
                </span>
              )}
            </div>

            <div style={{
              background: "#151618", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                display: "grid", gridTemplateColumns: "56px 100px 1fr 1fr auto",
                padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 11, fontWeight: 600, color: "#A5A5A5",
                textTransform: "uppercase", letterSpacing: "0.05em", gap: 12,
              }}>
                <span>Satır</span>
                <span>SKU</span>
                <span>Ürün</span>
                <span>Değişiklikler / Hatalar</span>
                <span>Durum</span>
              </div>

              {/* Rows */}
              <div style={{ maxHeight: 480, overflowY: "auto" }}>
                {previewRows.map((row) => (
                  <div
                    key={`${row.rowNumber}-${row.sku}`}
                    style={{
                      display: "grid", gridTemplateColumns: "56px 100px 1fr 1fr auto",
                      padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                      gap: 12, alignItems: "start",
                      background:
                        row.status === "error"   ? "rgba(239,68,68,0.03)" :
                        row.status === "warning" ? "rgba(212,160,23,0.02)" : "transparent",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#6B7280", fontVariantNumeric: "tabular-nums" }}>
                      #{row.rowNumber}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "#F4F4F2", wordBreak: "break-all" }}>
                      {row.sku || <span style={{ color: "#6B7280" }}>—</span>}
                    </span>
                    <span style={{ fontSize: 13, color: "#A5A5A5", wordBreak: "break-word" }}>
                      {row.productName ?? <span style={{ color: "#6B7280" }}>bulunamadı</span>}
                    </span>
                    <div>
                      <DiffTags diffs={row.diffs} />
                      <MsgTags items={row.errors}   variant="error" />
                      <MsgTags items={row.warnings} variant="warning" />
                      {row.status === "no_change" && (
                        <span style={{ fontSize: 11, color: "#6B7280" }}>Değişiklik yok</span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <StatusBadge status={row.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Commit panel ───────────────────────────────────────────────── */}
        <div style={{
          background: "#151618", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          {hasErrors ? (
            <p style={{ margin: 0, fontSize: 14, color: "#F87171" }}>
              {summary.rowsError} hata giderilmeden commit yapılamaz. Lütfen dosyayı düzeltip yeniden yükleyin.
            </p>
          ) : changedCount === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: "#A5A5A5" }}>
              Değiştirilecek satır yok — tüm satırlar mevcut değerlerle aynı.
            </p>
          ) : changedCount > 500 ? (
            <p style={{ margin: 0, fontSize: 14, color: "#F87171" }}>
              Tek işlemde en fazla 500 ürün güncellenebilir. Bu dosyada {changedCount} değişiklik var.
              Dosyayı bölerek tekrar yükleyin.
            </p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#F4F4F2" }}>
                  {changedCount.toLocaleString("tr-TR")} ürün güncellenmeye hazır
                </p>
                {summary.rowsNoChange > 0 && (
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "#A5A5A5" }}>
                    {summary.rowsNoChange} satır değişmediği için atlanacak
                  </p>
                )}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                disabled={!canCommit || isCommitting}
                style={{
                  padding: "10px 22px", borderRadius: 9, fontSize: 14, fontWeight: 600,
                  border: "none",
                  background: (!canCommit || isCommitting) ? "rgba(212,160,23,0.3)" : "#D4A017",
                  color: "#0D0E10",
                  cursor: (!canCommit || isCommitting) ? "not-allowed" : "pointer",
                  transition: "background 150ms",
                  flexShrink: 0,
                }}
              >
                {isCommitting ? "Güncelleniyor…" : `${changedCount} Ürünü Güncelle`}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
