"use client"

import { useRef, useState, useTransition } from "react"
import { Upload, FileSpreadsheet, X } from "lucide-react"
import { validateImportAction } from "@/lib/admin/import.actions"
import type { ImportValidationResult } from "@/lib/admin/import.actions"

// Eşit UI ve server limitleri — kullanıcı asla 413 görmez
// xlsx 10k rows ≈ 8 MB (OOXML gerçek ölçüm) — 9.5 MB UI < 10 MB server bodySizeLimit
const MAX_FILE_BYTES = 9.5 * 1024 * 1024  // 9.5 MB (server action: 10 MB)
const ALLOWED_EXT = [".xlsx", ".csv"]

export type ImportResult = Extract<ImportValidationResult, { success: true }>

interface Props {
  onResult: (result: ImportResult, file: File) => void
}

type Stage = "idle" | "uploading" | "done" | "error"

export function ImportUploader({ onResult }: Props) {
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

    // ── Client-side ön kontrol (UX hızı için) ───────────────────────────
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
        `Dosya ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(1)} MB sınırını aşıyor (${(file.size / 1024 / 1024).toFixed(1)} MB)`
      )
      setStage("error")
      return
    }

    setStage("uploading")

    startTransition(async () => {
      const formData = new FormData()
      formData.append("file", file)

      const result = await validateImportAction(formData)

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
        className={[
          "relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors select-none",
          isLoading
            ? "opacity-50 cursor-not-allowed border-zinc-300"
            : stage === "error"
            ? "border-red-300 bg-red-50"
            : stage === "done"
            ? "border-green-300 bg-green-50"
            : "border-zinc-300 hover:border-blue-400 hover:bg-blue-50",
        ].join(" ")}
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
            <Upload className="mx-auto mb-3 text-zinc-400" size={36} />
            <p className="font-medium text-zinc-700">Dosyayı sürükleyin veya tıklayın</p>
            <p className="text-sm text-zinc-400 mt-1">
              .xlsx veya .csv — maks. 9.5 MB, 10.000 satır — yalnızca ilk sayfa işlenir
            </p>
          </>
        )}

        {isLoading && (
          <>
            <FileSpreadsheet className="mx-auto mb-3 text-blue-400 animate-pulse" size={36} />
            <p className="font-medium text-blue-600">Yükleniyor ve doğrulanıyor…</p>
            {fileName && <p className="text-sm text-zinc-400 mt-1">{fileName}</p>}
          </>
        )}

        {stage === "done" && !isLoading && (
          <>
            <FileSpreadsheet className="mx-auto mb-3 text-green-500" size={36} />
            <p className="font-medium text-green-700">{fileName}</p>
            <p className="text-sm text-zinc-500 mt-1">Doğrulama tamamlandı</p>
          </>
        )}

        {stage === "error" && (
          <>
            <X className="mx-auto mb-3 text-red-500" size={36} />
            <p className="font-medium text-red-700">{localError}</p>
            {fileName && <p className="text-sm text-zinc-500 mt-1">{fileName}</p>}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 justify-end">
          <TemplateDownloadButton />
          {(stage === "error" || stage === "done") && !isLoading && (
            <button
              onClick={reset}
              className="text-sm px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50"
            >
              Yeni Dosya Seç
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-400 text-right">
          <strong>marka</strong> ve <strong>kategori</strong> sütunları sistemde tanımlı isimlerle eşleşmelidir (büyük/küçük harf farkı gözetilmez).
        </p>
      </div>
    </div>
  )
}

// Template download — client-side xlsx, dynamic import
function TemplateDownloadButton() {
  const download = async () => {
    const XLSX = await import("xlsx")
    const headers = [
      "ad", "slug", "sku", "açıklama", "fiyat", "karşılaştırma fiyatı",
      "stok", "marka", "kategori", "uyumlu markalar",
      "görsel url", "hover görsel",
      "aktif", "öne_çıkan", "yeni", "aynı gün kargo",
    ]
    const example = [
      "Örnek Ürün", "ornek-urun", "SKU-001", "Ürün açıklaması", 299.99, 399.99,
      10, "Ford", "Motor Yağı", "BMW,Mercedes",
      "https://cdn.example.com/main.webp", "https://cdn.example.com/hover.webp",
      "EVET", "HAYIR", "HAYIR", "HAYIR",
    ]
    const ws = XLSX.utils.aoa_to_sheet([headers, example])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Şablon")
    XLSX.writeFile(wb, "urun-import-sablonu.xlsx")
  }

  return (
    <button
      onClick={download}
      className="text-sm px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50 flex items-center gap-2"
    >
      <FileSpreadsheet size={14} />
      Şablon İndir
    </button>
  )
}
