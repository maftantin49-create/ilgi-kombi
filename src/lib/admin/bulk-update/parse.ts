import * as XLSX from "xlsx"
import { normalizeUpdateHeader, normalizeUpdateRow, type RawUpdateRow } from "./normalize"

export const UPDATE_MAX_ROWS = 10_000
export const UPDATE_MAX_FILE_BYTES = 9.5 * 1024 * 1024   // UI limit < server bodySizeLimit (10 MB)

const ALLOWED_EXT = new Set(["xlsx", "csv"])

export type UpdateParseResult =
  | { success: true; rows: RawUpdateRow[]; ignoredCount: number }
  | { success: false; error: string }

export async function parseFormDataFileForUpdate(
  formData: FormData,
): Promise<UpdateParseResult> {
  const file = formData.get("file")
  if (!file || !(file instanceof File)) {
    return { success: false, error: "Dosya bulunamadı" }
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!ALLOWED_EXT.has(ext)) {
    return { success: false, error: "Sadece .xlsx ve .csv dosyaları desteklenir" }
  }

  if (file.size === 0) return { success: false, error: "Dosya boş" }

  if (file.size > UPDATE_MAX_FILE_BYTES) {
    return {
      success: false,
      error: `Dosya ${(UPDATE_MAX_FILE_BYTES / 1024 / 1024).toFixed(1)} MB sınırını aşıyor`,
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let rawData: Record<string, unknown>[]
  try {
    const workbook = XLSX.read(buffer, {
      type: "buffer",
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
    })

    if ((workbook as unknown as Record<string, unknown>)["vbaraw"]) {
      return { success: false, error: "Makro içeren dosyalar (.xlsm) kabul edilmez" }
    }

    if (!workbook.SheetNames.length) {
      return { success: false, error: "Çalışma kitabı sayfa içermiyor" }
    }

    // Only process the first sheet
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",  // empty cells → empty string (preserves "absent" detection)
    })
  } catch {
    return { success: false, error: "Dosya okunamadı — geçersiz veya bozuk format" }
  }

  if (rawData.length === 0) {
    return { success: false, error: "Dosyada veri satırı bulunamadı (ilk sayfa boş)" }
  }

  if (rawData.length > UPDATE_MAX_ROWS) {
    return {
      success: false,
      error: `Maksimum ${UPDATE_MAX_ROWS.toLocaleString()} satır desteklenir (dosyada: ${rawData.length.toLocaleString()})`,
    }
  }

  // Validate header row: SKU column must be present
  const firstRowKeys = Object.keys(rawData[0]).map(normalizeUpdateHeader)
  if (!firstRowKeys.includes("sku")) {
    return {
      success: false,
      error: "SKU sütunu bulunamadı — şablon başlık satırını koruyun",
    }
  }

  let ignoredCount = 0
  const rows: RawUpdateRow[] = []

  for (let i = 0; i < rawData.length; i++) {
    // Row numbers are 1-based; header = row 1, first data row = row 2
    const row = normalizeUpdateRow(rawData[i], i + 2)
    if (row === null) {
      ignoredCount++
    } else {
      rows.push(row)
    }
  }

  if (rows.length === 0) {
    return { success: false, error: "Geçerli satır bulunamadı — tüm satırlar boş" }
  }

  return { success: true, rows, ignoredCount }
}
