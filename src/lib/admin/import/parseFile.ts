/**
 * Shared xlsx/csv parse + normalize helper.
 * "use server" değil — hem validateImportAction hem importCommitAction import eder.
 */
import * as XLSX from "xlsx"
import { normalizeHeader, normalizeRow, type RawImportRow } from "./normalize"

export const IMPORT_MAX_ROWS = 10_000
export const IMPORT_MAX_FILE_BYTES = 9.5 * 1024 * 1024  // UI: 9.5 MB (server bodySizeLimit: 10 MB)
const ALLOWED_EXT = new Set(["xlsx", "csv"])

export type ParseResult =
  | { success: true; rows: RawImportRow[] }
  | { success: false; error: string }

export async function parseFormDataFile(formData: FormData): Promise<ParseResult> {
  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return { success: false, error: "Dosya bulunamadı" }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!ALLOWED_EXT.has(ext)) {
    return { success: false, error: "Sadece .xlsx ve .csv dosyaları desteklenir" }
  }

  if (file.size === 0) {
    return { success: false, error: "Dosya boş" }
  }

  if (file.size > IMPORT_MAX_FILE_BYTES) {
    return {
      success: false,
      error: `Dosya ${(IMPORT_MAX_FILE_BYTES / 1024 / 1024).toFixed(1)} MB sınırını aşıyor`,
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let rawData: Record<string, unknown>[]
  try {
    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellFormula: false,  // formülü çalıştırma, sadece önbelleğe alınmış değeri oku
      cellHTML: false,
      cellStyles: false,
    })

    // SheetJS xlsm varsa vbaraw alanını doldurur
    if ((workbook as unknown as Record<string, unknown>)["vbaraw"]) {
      return { success: false, error: "Makro içeren dosyalar (.xlsm) kabul edilmez" }
    }

    if (!workbook.SheetNames.length) {
      return { success: false, error: "Çalışma kitabı sayfa içermiyor" }
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
  } catch {
    return { success: false, error: "Dosya okunamadı — geçersiz veya bozuk format" }
  }

  if (rawData.length === 0) {
    return { success: false, error: "Dosyada veri satırı bulunamadı (ilk sayfa boş)" }
  }

  if (rawData.length > IMPORT_MAX_ROWS) {
    return {
      success: false,
      error: `Maksimum ${IMPORT_MAX_ROWS.toLocaleString()} satır desteklenir (dosyada: ${rawData.length.toLocaleString()})`,
    }
  }

  const rows = rawData.map((row, i) => {
    const mapped: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(row)) {
      mapped[normalizeHeader(k)] = v
    }
    return normalizeRow(mapped, i)
  })

  return { success: true, rows }
}
