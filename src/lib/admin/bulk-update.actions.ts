"use server"

import { requireAdmin } from "./requireAdmin"
import { parseFormDataFileForUpdate } from "./bulk-update/parse"
import { validateUpdateRows } from "./bulk-update/validate"
import type { BulkUpdateValidationResult } from "./bulk-update/schema"

export type { BulkUpdateValidationResult }
export type { UpdateValidationSummary, UpdateRowResult } from "./bulk-update/schema"

export async function validateBulkUpdateAction(
  formData: FormData,
): Promise<BulkUpdateValidationResult> {
  // Auth: dry-run is also gated behind requireAdmin
  await requireAdmin()

  // Parse file server-side — never trust client row data
  const parsed = await parseFormDataFileForUpdate(formData)
  if (!parsed.success) return { success: false, error: parsed.error }

  // Validate: SKU lookup, reservation check, brand/category resolve, diff
  const { summary, previewRows, issueRows } = await validateUpdateRows(parsed.rows, parsed.ignoredCount)

  return {
    success: true,
    summary,
    previewRows,   // first 200 rows — full list stays server-side
    issueRows,     // all error+warning rows — for client-side XLSX download
    hasErrors: summary.rowsError > 0,
    hasWarnings: summary.rowsWarning > 0,
  }
}
