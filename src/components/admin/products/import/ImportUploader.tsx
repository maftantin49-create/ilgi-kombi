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
// ★ = zorunlu sütun; normalizeHeader() ★/☆ karakterlerini trim ederek eşleştirir
function TemplateDownloadButton() {
  const download = async () => {
    const XLSX = await import("xlsx")

    // ── Sheet 1: URUNLER ─────────────────────────────────────────────────────
    const headers = [
      "★ ad", "slug", "★ sku", "açıklama", "★ fiyat", "karşılaştırma fiyatı",
      "stok", "marka", "kategori", "uyumlu markalar",
      "görsel url", "hover görsel",
      "aktif", "öne_çıkan", "yeni", "aynı gün kargo",
    ]
    const example = [
      "Vaillant ecoTEC Fan Motoru", "vaillant-ecotec-fan-motoru", "VLT-FAN-001",
      "Vaillant ecoTEC serisi kombi fan motoru.", 299.99, 399.99,
      10, "Vaillant", "Fan ve Pompa", "Baymak,Ariston",
      "", "",
      "EVET", "HAYIR", "HAYIR", "HAYIR",
    ]
    const ws1 = XLSX.utils.aoa_to_sheet([headers, example])

    // ── Sheet 2: ACIKLAMA ────────────────────────────────────────────────────
    const acHeaders = ["Sütun", "Zorunlu", "Açıklama", "Kabul Edilen Değerler"]
    const acRows = [
      ["★ ad",                   "EVET",  "Ürün adı",                                                            "Metin, maks. 255 karakter"],
      ["slug",                   "HAYIR", "URL dostu kısa ad. Boş bırakılırsa addan otomatik türetilir.",         "Küçük harf, rakam, tire — ör: vaillant-fan-motoru"],
      ["★ sku",                  "EVET",  "Stok/ürün kodu. Sistemde benzersiz olmalı.",                           "Metin, maks. 100 karakter — ör: VLT-FAN-001"],
      ["açıklama",               "HAYIR", "Ürün detay açıklaması.",                                               "Serbest metin"],
      ["★ fiyat",                "EVET",  "Satış fiyatı (TL).",                                                   "Sayı — ör: 299.99 veya 299,99"],
      ["karşılaştırma fiyatı",   "HAYIR", "Liste/eski fiyat (üzeri çizili). Satış fiyatından YÜKSEK olmalı.",     "Sayı — ör: 399.99"],
      ["stok",                   "HAYIR", "Başlangıç stok adedi. Boş bırakılırsa 0 kabul edilir.",                "Tam sayı — ör: 10"],
      ["marka",                  "HAYIR", "Sistemde tanımlı marka adı. Yanlış ise satır hata verir.",             "Ör: Vaillant / Baymak / Ariston (büyük/küçük harf fark gözetilmez)"],
      ["kategori",               "HAYIR", "Sistemde tanımlı kategori adı. Yanlış ise satır hata verir.",          "Ör: Fan ve Pompa / Elektronik Kart (büyük/küçük harf fark gözetilmez)"],
      ["uyumlu markalar",        "HAYIR", "Bu ürünün uyumlu olduğu marka listesi.",                               "Virgül, ; veya | ile ayrılmış — ör: Baymak,Ariston"],
      ["görsel url",             "HAYIR", "Ana ürün görseli tam URL adresi.",                                     "https:// ile başlayan URL"],
      ["hover görsel",           "HAYIR", "Üzerine gelinince gösterilen ikinci görsel URL.",                      "https:// ile başlayan URL"],
      ["aktif",                  "HAYIR", "Ürün yayında mı? Varsayılan: EVET",                                    "EVET / HAYIR / 1 / 0"],
      ["öne_çıkan",              "HAYIR", "Öne çıkan ürünlerde göster. Varsayılan: HAYIR",                        "EVET / HAYIR / 1 / 0"],
      ["yeni",                   "HAYIR", "Yeni ürün etiketi göster. Varsayılan: HAYIR",                          "EVET / HAYIR / 1 / 0"],
      ["aynı gün kargo",         "HAYIR", "Aynı gün kargo etiketi. Varsayılan: HAYIR",                            "EVET / HAYIR / 1 / 0"],
    ]
    const ws2 = XLSX.utils.aoa_to_sheet([acHeaders, ...acRows])

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws1, "URUNLER")
    XLSX.utils.book_append_sheet(wb, ws2, "ACIKLAMA")
    XLSX.writeFile(wb, "ilgi-kombi-urun-import-sablonu.xlsx")
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
