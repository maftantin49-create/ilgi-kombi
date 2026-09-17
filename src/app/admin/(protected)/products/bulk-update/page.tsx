"use client"

import { useState, useTransition } from "react"
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BulkUpdateUploader, type UpdateValidateResult } from "@/components/admin/bulk-update/BulkUpdateUploader"
import { BulkUpdatePreview } from "@/components/admin/bulk-update/BulkUpdatePreview"
import { bulkUpdateCommitAction, type BulkUpdateCommitResult } from "@/lib/admin/bulk-update-commit.actions"

export default function BulkUpdatePage() {
  const router = useRouter()
  const [result, setResult]             = useState<UpdateValidateResult | null>(null)
  const [file, setFile]                 = useState<File | null>(null)
  const [commitResult, setCommitResult] = useState<BulkUpdateCommitResult | null>(null)
  const [isCommitting, startCommit]     = useTransition()

  const handleResult = (r: UpdateValidateResult, f: File) => {
    setResult(r)
    setFile(f)
    setCommitResult(null)  // reset on new file upload
  }

  const handleCommit = () => {
    if (!file || isCommitting) return
    startCommit(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const res = await bulkUpdateCommitAction(formData)
      setCommitResult(res)
    })
  }

  const handleReset = () => {
    setResult(null)
    setFile(null)
    setCommitResult(null)
  }

  const commitSucceeded = commitResult !== null && commitResult.success
  const commitErrorMsg = commitResult !== null && !commitResult.success ? commitResult.error : null

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Link href="/admin/products" style={{ display: "flex", alignItems: "center", color: "#A5A5A5", marginTop: 4 }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#F4F4F2" }}>
            Toplu Ürün Güncelleme
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#A5A5A5" }}>
            Mevcut ürünleri Excel / CSV ile toplu güncelleyin — yalnızca dolu hücreler değiştirilir
          </p>
        </div>
      </div>

      {/* Upload section — hidden only after successful commit */}
      {!commitSucceeded && (
        <section style={{
          background: "#151618", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: "24px",
        }}>
          <BulkUpdateUploader onResult={handleResult} />
        </section>
      )}

      {/* Commit error banner — dry-run state + file preserved; user can retry or re-upload */}
      {commitErrorMsg !== null && (
        <div style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 12, padding: "16px 20px",
        }}>
          <AlertCircle size={18} style={{ color: "#F87171", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#F87171" }}>
              Güncelleme başarısız
            </p>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "#FCA5A5", lineHeight: 1.5 }}>
              {commitErrorMsg}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#A5A5A5" }}>
              Hiçbir ürün değiştirilmedi. Dry-run sonucu ve dosyanız korundu — düzeltip tekrar commit yapabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* Preview + commit panel — hidden only after successful commit */}
      {result !== null && !commitSucceeded && (
        <BulkUpdatePreview
          summary={result.summary}
          previewRows={result.previewRows}
          issueRows={result.issueRows}
          hasErrors={result.hasErrors}
          hasWarnings={result.hasWarnings}
          isCommitting={isCommitting}
          onCommit={handleCommit}
        />
      )}

      {/* Success panel — shown only after successful commit */}
      {commitSucceeded && commitResult.success && (
        <CommitResultPanel
          result={commitResult}
          onGoToProducts={() => router.push("/admin/products")}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Commit result panel
// ─────────────────────────────────────────────────────────────────────────────

interface CommitResultPanelProps {
  result: BulkUpdateCommitResult
  onGoToProducts: () => void
  onReset: () => void
}

function CommitResultPanel({ result, onGoToProducts, onReset }: CommitResultPanelProps) {
  if (result.success) {
    const rows: [string, number | string][] = [
      ["Gönderilen satır", result.submitted],
      ["Güncellenen ürün",  result.affected],
      result.fieldsChanged   > 0 ? ["Alan değişimi",      result.fieldsChanged]   : null,
      result.priceUpdates    > 0 ? ["Fiyat güncellemesi", result.priceUpdates]    : null,
      result.stockUpdates    > 0 ? ["Stok güncellemesi",  result.stockUpdates]    : null,
      result.flagUpdates     > 0 ? ["Bayrak değişimi",     result.flagUpdates]     : null,
      result.brandUpdates    > 0 ? ["Marka değişimi",      result.brandUpdates]    : null,
      result.categoryUpdates > 0 ? ["Kategori değişimi",   result.categoryUpdates] : null,
    ].filter(Boolean) as [string, number | string][]

    return (
      <div style={{
        background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.25)",
        borderRadius: 12, padding: "24px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <CheckCircle2 size={22} style={{ color: "#34D399", flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "#34D399" }}>
            {result.affected.toLocaleString("tr-TR")} ürün güncellendi
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 20 }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#A5A5A5" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "#F4F4F2" }}>
                {typeof value === "number" ? value.toLocaleString("tr-TR") : value}
              </span>
            </div>
          ))}
        </div>

        <p style={{ margin: "0 0 20px", fontSize: 11, color: "#6B7280", fontFamily: "monospace" }}>
          İşlem ID: {result.operationId}
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={onGoToProducts}
            style={{
              padding: "9px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
              border: "none", background: "#34D399", color: "#0D0E10", cursor: "pointer",
            }}
          >
            Ürün Listesine Git
          </button>
          <button
            onClick={onReset}
            style={{
              padding: "9px 18px", borderRadius: 8, fontSize: 14,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent", color: "#A5A5A5", cursor: "pointer",
            }}
          >
            Yeni Dosya Yükle
          </button>
        </div>
      </div>
    )
  }

  // Error panel — preserve dry-run result (no state reset; user can re-try commit)
  return (
    <div style={{
      background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: 12, padding: "24px 28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <XCircle size={20} style={{ color: "#F87171", flexShrink: 0 }} />
        <span style={{ fontSize: 16, fontWeight: 600, color: "#F87171" }}>Güncelleme başarısız</span>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#FCA5A5", lineHeight: 1.5 }}>
        {result.error}
      </p>
      <p style={{ margin: "0 0 20px", fontSize: 12, color: "#A5A5A5" }}>
        Hiçbir ürün değiştirilmedi. Dry-run sonucu yukarıda korunmuştur.
      </p>
      <button
        onClick={onReset}
        style={{
          padding: "9px 18px", borderRadius: 8, fontSize: 14,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "transparent", color: "#A5A5A5", cursor: "pointer",
        }}
      >
        Yeni Dosya Yükle
      </button>
    </div>
  )
}
