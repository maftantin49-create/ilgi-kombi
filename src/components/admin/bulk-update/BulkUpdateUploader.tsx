"use client"

import { useRef, useState, useTransition } from "react"
import { Upload, FileSpreadsheet, X, Download } from "lucide-react"
import { validateBulkUpdateAction } from "@/lib/admin/bulk-update.actions"
import type { BulkUpdateValidationResult } from "@/lib/admin/bulk-update.actions"

// Client-side limits match server-side for clean UX (user never sees 413)
const MAX_FILE_BYTES = 9.5 * 1024 * 1024
const ALLOWED_EXT = [".xlsx", ".csv"]

export type UpdateValidateResult = Extract<BulkUpdateValidationResult, { success: true }>

interface Props {
  onResult: (result: UpdateValidateResult, file: File) => void
}

type Stage = "idle" | "uploading" | "done" | "error"

export function BulkUpdateUploader({ onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<Stage>("idle")
  const [fileName, setFileName] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const reset = () => {
    setStage("idle")
    setFileName(null)
    setLocalError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const processFile = (file: File) => {
    setLocalError(null)
    setFileName(file.name)

    const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "")
    if (!ALLOWED_EXT.includes(ext)) {
      setLocalError("Sadece .xlsx ve .csv dosyaları desteklenir")
      setStage("error")
      return
    }
    if (file.size === 0) {
      setLocalError("Dosya boş")
      setStage("error")
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setLocalError(
        `Dosya ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(1)} MB sınırını aşıyor`,
      )
      setStage("error")
      return
    }

    setStage("uploading")

    startTransition(async () => {
      const formData = new FormData()
      formData.append("file", file)
      const result = await validateBulkUpdateAction(formData)

      if (!result.success) {
        setLocalError(result.error)
        setStage("error")
        return
      }

      setStage("done")
      onResult(result, file)
    })
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const isLoading = stage === "uploading" || isPending

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !isLoading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${
            isLoading
              ? "rgba(255,255,255,0.12)"
              : stage === "error"
              ? "rgba(239,68,68,0.4)"
              : stage === "done"
              ? "rgba(52,211,153,0.4)"
              : "rgba(255,255,255,0.18)"
          }`,
          borderRadius: 12,
          padding: "40px 24px",
          textAlign: "center",
          cursor: isLoading ? "not-allowed" : "pointer",
          background:
            stage === "error"
              ? "rgba(239,68,68,0.04)"
              : stage === "done"
              ? "rgba(52,211,153,0.04)"
              : "rgba(255,255,255,0.02)",
          transition: "border-color 150ms, background 150ms",
          userSelect: "none",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          className="hidden"
          onChange={onFileChange}
          disabled={isLoading}
        />

        {stage === "idle" && (
          <>
            <Upload
              style={{ margin: "0 auto 12px", color: "#A5A5A5" }}
              size={36}
            />
            <p style={{ fontWeight: 500, color: "#F4F4F2", marginBottom: 4 }}>
              Dosyayı sürükleyin veya tıklayın
            </p>
            <p style={{ fontSize: 13, color: "#A5A5A5" }}>
              .xlsx veya .csv — maks. 9.5 MB, 10.000 satır — yalnızca ilk sayfa işlenir
            </p>
          </>
        )}

        {isLoading && (
          <>
            <FileSpreadsheet
              style={{ margin: "0 auto 12px", color: "#D4A017", animation: "pulse 2s infinite" }}
              size={36}
            />
            <p style={{ fontWeight: 500, color: "#D4A017" }}>Yükleniyor ve doğrulanıyor…</p>
            {fileName && (
              <p style={{ fontSize: 13, color: "#A5A5A5", marginTop: 4 }}>{fileName}</p>
            )}
          </>
        )}

        {stage === "done" && !isLoading && (
          <>
            <FileSpreadsheet
              style={{ margin: "0 auto 12px", color: "#34D399" }}
              size={36}
            />
            <p style={{ fontWeight: 500, color: "#34D399" }}>{fileName}</p>
            <p style={{ fontSize: 13, color: "#A5A5A5", marginTop: 4 }}>
              Doğrulama tamamlandı
            </p>
          </>
        )}

        {stage === "error" && (
          <>
            <X style={{ margin: "0 auto 12px", color: "#F87171" }} size={36} />
            <p style={{ fontWeight: 500, color: "#F87171" }}>{localError}</p>
            {fileName && (
              <p style={{ fontSize: 13, color: "#A5A5A5", marginTop: 4 }}>{fileName}</p>
            )}
          </>
        )}
      </div>

      {/* Actions row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p style={{ fontSize: 12, color: "#A5A5A5" }}>
          Boş hücre mevcut değeri değiştirmez. Marka/Kategori için{" "}
          <code
            style={{
              fontFamily: "monospace",
              background: "rgba(255,255,255,0.06)",
              padding: "1px 5px",
              borderRadius: 4,
              color: "#F4F4F2",
            }}
          >
            TEMİZLE
          </code>{" "}
          yazarak ilişkiyi kaldırabilirsiniz.
        </p>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <TemplateDownloadButton />
          {(stage === "error" || stage === "done") && !isLoading && (
            <button
              onClick={reset}
              style={{
                fontSize: 13,
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "transparent",
                color: "#A5A5A5",
                cursor: "pointer",
              }}
            >
              Yeni Dosya Seç
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Template download ─────────────────────────────────────────────────────────

function TemplateDownloadButton() {
  const [loading, setLoading] = useState(false)

  const download = async () => {
    setLoading(true)
    try {
      const XLSX = await import("xlsx")
      const wb = XLSX.utils.book_new()

      // ── Veri sheet ──────────────────────────────────────────────────────────
      const headers = [
        "SKU ★", "Fiyat", "Stok", "Aktif",
        "Öne Çıkan", "Yeni", "Aynı Gün Kargo", "Marka", "Kategori",
      ]
      const example = [
        "1453001", 299.99, 10, "EVET", "HAYIR", "HAYIR", "HAYIR", "Bosch", "",
      ]
      const wsData = XLSX.utils.aoa_to_sheet([headers, example])

      // Column widths
      wsData["!cols"] = [
        { wch: 16 }, { wch: 10 }, { wch: 8 }, { wch: 8 },
        { wch: 12 }, { wch: 8 }, { wch: 16 }, { wch: 20 }, { wch: 20 },
      ]

      // ── Kurallar sheet ──────────────────────────────────────────────────────
      const rules = [
        ["TOPLU GÜNCELLEME KURALLARI"],
        [],
        ["GENEL"],
        ["★  SKU zorunludur — sistemde kayıtlı SKU ile tam eşleşmeli"],
        ["   Boş hücre = değiştirme — mevcut değer korunur"],
        ["   Bu araç yalnızca mevcut ürünleri günceller, yeni ürün oluşturmaz"],
        ["   Excel içinde aynı SKU birden fazla kez → HATA"],
        ["   Yalnızca ilk sayfa işlenir | Maks. 10.000 satır | Maks. 9.5 MB"],
        [],
        ["MARKA / KATEGORİ"],
        ["   Boş hücre        → mevcut marka/kategori değişmez"],
        ["   TEMİZLE (yazıyla) → brand_id / category_id = NULL olarak set edilir"],
        ["   Bilinmeyen değer → HATA (sistemde olmayan marka/kategori otomatik oluşturulmaz)"],
        ["   Büyük/küçük harf farkı gözetilmez (örn: bosch = BOSCH = Bosch)"],
        [],
        ["FİYAT"],
        ["   Boş hücre → mevcut fiyat değişmez"],
        ["   0 veya üzeri değer kabul edilir"],
        ["   Aktif ürünlerde fiyat=0 UYARI üretir (commit engellenmez)"],
        ["   Negatif fiyat → HATA"],
        [],
        ["STOK"],
        ["   Boş hücre → mevcut stok değişmez"],
        ["   Mutlak set: girilen değer yeni stok miktarı olur"],
        ["   0 veya üzeri tam sayı kabul edilir"],
        ["   Negatif stok → HATA"],
        ["   Yeni stok < aktif rezervasyon miktarı → HATA"],
        [],
        ["BOOLEAN DEĞERLERİ (Aktif, Öne Çıkan, Yeni, Aynı Gün Kargo)"],
        ["   Kabul edilenler: EVET / HAYIR / true / false / 1 / 0 / Aktif / Pasif"],
        ["   Tanınmayan değer → HATA (boş hücre = değiştirme)"],
      ]
      const wsRules = XLSX.utils.aoa_to_sheet(rules)
      wsRules["!cols"] = [{ wch: 80 }]

      XLSX.utils.book_append_sheet(wb, wsData,  "Veri")
      XLSX.utils.book_append_sheet(wb, wsRules, "Kurallar")
      XLSX.writeFile(wb, "toplu-guncelleme-sablonu.xlsx")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        padding: "7px 14px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        color: "#F4F4F2",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "opacity 120ms",
      }}
    >
      <Download size={13} />
      {loading ? "İndiriliyor…" : "Şablonu İndir"}
    </button>
  )
}
