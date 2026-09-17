"use client"

import { FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import type { ImportStats, PreviewRow, IssueRow } from "@/lib/admin/import.actions"

interface Props {
  stats: ImportStats
  previewRows: PreviewRow[]
  issueRows: IssueRow[]
}

const STATUS_ICON = {
  ok: <CheckCircle2 size={14} className="text-green-500 shrink-0" />,
  warning: <AlertTriangle size={14} className="text-yellow-500 shrink-0" />,
  error: <XCircle size={14} className="text-red-500 shrink-0" />,
}

const STATUS_ROW_CLASS = {
  ok: "",
  warning: "bg-yellow-50",
  error: "bg-red-50",
}

// Formula injection önlemi — Excel'e yazılacak değerlerde = + - @ ile başlayan string'ler tehlikeli
function sanitize(v: unknown): string {
  const s = String(v ?? "")
  return /^[=+\-@]/.test(s) ? `'${s}` : s
}

export function ImportPreview({ stats, previewRows, issueRows }: Props) {
  const downloadErrorReport = async () => {
    const XLSX = await import("xlsx")

    const headers = ["Satır No", "Durum", "SKU", "Ad", "Hatalar", "Uyarılar"]
    const data = issueRows.map((r) => [
      r.rowNumber,
      r.status === "error" ? "✗ HATA" : "! UYARI",
      sanitize(r.sku),
      sanitize(r.name),
      r.errors.map((e) => `${e.field}: ${e.message}`).join("; "),
      r.warnings.map((w) => `${w.field}: ${w.message}`).join("; "),
    ])

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Hata Raporu")
    XLSX.writeFile(wb, "import-hata-raporu.xlsx")
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Toplam Satır" value={stats.total} color="text-zinc-700" />
        <StatCard label="Geçerli" value={stats.ok} color="text-green-600" />
        <StatCard label="Uyarı" value={stats.warnings} color="text-yellow-600" />
        <StatCard label="Hata" value={stats.errors} color="text-red-600" />
      </div>

      {/* Status banner */}
      {stats.errors > 0 ? (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          <strong>{stats.errors} hatalı satır</strong> var. Bu satırlar içe aktarılamaz. Hata raporunu indirin, düzeltin ve yeniden yükleyin.
        </div>
      ) : stats.warnings > 0 ? (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
          <strong>{stats.warnings} uyarı</strong> var. Bu satırlar içe aktarılabilir.
        </div>
      ) : (
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Tüm <strong>{stats.total} satır</strong> geçerli. İçe aktarmaya hazır.
        </div>
      )}

      {/* Error report download */}
      {issueRows.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={downloadErrorReport}
            className="text-sm px-4 py-2 rounded-md border border-zinc-300 hover:bg-zinc-50 flex items-center gap-2"
          >
            <FileSpreadsheet size={14} />
            Hata Raporunu İndir ({issueRows.length} satır)
          </button>
        </div>
      )}

      {/* Preview table */}
      <div>
        <p className="text-sm text-zinc-500 mb-2">
          İlk {previewRows.length} satır gösteriliyor
          {stats.total > previewRows.length && ` (toplam ${stats.total.toLocaleString()})`}
        </p>
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-3 py-2 text-left font-medium w-16">Satır</th>
                <th className="px-3 py-2 text-left font-medium w-8"></th>
                <th className="px-3 py-2 text-left font-medium">SKU</th>
                <th className="px-3 py-2 text-left font-medium">Ad</th>
                <th className="px-3 py-2 text-left font-medium">Fiyat</th>
                <th className="px-3 py-2 text-left font-medium">Marka</th>
                <th className="px-3 py-2 text-left font-medium">Kategori</th>
                <th className="px-3 py-2 text-left font-medium">Sorunlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {previewRows.map((row) => (
                <PreviewTableRow key={row.rowNumber} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 text-center">
      <div className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  )
}

function PreviewTableRow({ row }: { row: PreviewRow }) {
  // issueRow yoksa preview'dan gösterilen satır için uyarı/hata yok
  const hasIssue = row.status !== "ok"
  return (
    <tr className={STATUS_ROW_CLASS[row.status]}>
      <td className="px-3 py-2 text-zinc-400">{row.rowNumber}</td>
      <td className="px-3 py-2">{STATUS_ICON[row.status]}</td>
      <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
      <td className="px-3 py-2 max-w-[180px] truncate">{row.name}</td>
      <td className="px-3 py-2">{row.price !== null ? row.price.toFixed(2) : "-"}</td>
      <td className="px-3 py-2">{row.brand ?? "-"}</td>
      <td className="px-3 py-2">{row.category ?? "-"}</td>
      <td className="px-3 py-2 text-xs text-zinc-400">
        {hasIssue ? <span className="italic">Hata raporu indir</span> : <span className="text-zinc-200">—</span>}
      </td>
    </tr>
  )
}
