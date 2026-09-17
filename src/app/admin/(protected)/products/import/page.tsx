"use client"

import { useState, useTransition } from "react"
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ImportUploader, type ImportResult } from "@/components/admin/products/import/ImportUploader"
import { ImportPreview } from "@/components/admin/products/import/ImportPreview"
import { importCommitAction, type ImportCommitResult } from "@/lib/admin/import-commit.actions"

export default function ProductImportPage() {
  const router = useRouter()
  const [result, setResult] = useState<ImportResult | null>(null)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [commitResult, setCommitResult] = useState<ImportCommitResult | null>(null)
  const [isCommitting, startCommit] = useTransition()

  const handleResult = (r: ImportResult, file: File) => {
    setResult(r)
    setImportFile(file)
    setCommitResult(null)  // yeni dosya seçilirse önceki commit sonucu sıfırla
  }

  const handleCommit = () => {
    if (!importFile || isCommitting) return

    startCommit(async () => {
      const formData = new FormData()
      formData.append("file", importFile)
      const res = await importCommitAction(formData)
      setCommitResult(res)
    })
  }

  const validCount = result
    ? result.stats.ok + result.stats.warnings
    : 0

  const canCommit =
    result !== null &&
    validCount > 0 &&
    importFile !== null &&
    commitResult === null &&
    !isCommitting

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Toplu Ürün İçe Aktar</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Excel (.xlsx) veya CSV — yalnızca ilk sayfa işlenir
          </p>
        </div>
      </div>

      {/* Uploader */}
      <ImportUploader onResult={handleResult} />

      {/* Preview */}
      {result && !commitResult && (
        <ImportPreview
          stats={result.stats}
          previewRows={result.previewRows}
          issueRows={result.issueRows}
        />
      )}

      {/* Commit panel */}
      {result && !commitResult && (
        <CommitPanel
          validCount={validCount}
          errorCount={result.stats.errors}
          canCommit={canCommit}
          isCommitting={isCommitting}
          onCommit={handleCommit}
        />
      )}

      {/* Commit result */}
      {commitResult && (
        <CommitResultPanel
          result={commitResult}
          onGoToProducts={() => router.push("/admin/products")}
        />
      )}
    </div>
  )
}

// ── Commit panel ──────────────────────────────────────────────────────────────

interface CommitPanelProps {
  validCount: number
  errorCount: number
  canCommit: boolean
  isCommitting: boolean
  onCommit: () => void
}

function CommitPanel({ validCount, errorCount, canCommit, isCommitting, onCommit }: CommitPanelProps) {
  if (validCount === 0) return null

  return (
    <div className="rounded-lg border border-zinc-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="font-medium text-zinc-900">
          {validCount.toLocaleString()} geçerli ürün aktarılmaya hazır
        </p>
        {errorCount > 0 && (
          <p className="text-sm text-zinc-500 mt-0.5">
            {errorCount.toLocaleString()} hatalı satır atlanacak
          </p>
        )}
        <p className="text-xs text-zinc-400 mt-1">
          Dosya yeniden doğrulanır, ardından veritabanına yazılır. Bu işlem geri alınamaz.
        </p>
      </div>
      <button
        onClick={onCommit}
        disabled={!canCommit}
        className={[
          "shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors",
          canCommit
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-zinc-100 text-zinc-400 cursor-not-allowed",
        ].join(" ")}
      >
        {isCommitting ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Ürünler aktarılıyor…
          </>
        ) : (
          "Geçerli Ürünleri Aktar"
        )}
      </button>
    </div>
  )
}

// ── Commit result panel ───────────────────────────────────────────────────────

interface CommitResultPanelProps {
  result: ImportCommitResult
  onGoToProducts: () => void
}

function CommitResultPanel({ result, onGoToProducts }: CommitResultPanelProps) {
  if (result.success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 space-y-3">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 size={20} />
          <span className="font-semibold text-lg">İçe aktarma tamamlandı</span>
        </div>
        <div className="text-sm text-green-800 space-y-1">
          <p><strong>{result.insertedCount.toLocaleString()}</strong> ürün eklendi</p>
          {result.stockMovementsCount > 0 && (
            <p><strong>{result.stockMovementsCount.toLocaleString()}</strong> başlangıç stok hareketi kaydedildi</p>
          )}
          <p className="text-xs text-green-600 font-mono">Oturum: {result.sessionId}</p>
        </div>
        <button
          onClick={onGoToProducts}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-700 text-white text-sm hover:bg-green-800 transition-colors"
        >
          Ürün Listesine Git
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 space-y-2">
      <div className="flex items-center gap-2 text-red-700">
        <XCircle size={20} />
        <span className="font-semibold">İçe aktarma başarısız</span>
      </div>
      <p className="text-sm text-red-700">{result.error}</p>
      <p className="text-xs text-red-500">Hiçbir ürün eklenmedi. Dosyayı kontrol edip tekrar deneyin.</p>
    </div>
  )
}
