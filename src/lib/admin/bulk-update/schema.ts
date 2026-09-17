// Shared types for bulk Excel product update (Wave 6).
// These types cross the server/client boundary via server action response.

export interface FieldDiff {
  field: string
  currentValue: unknown   // human-readable (name strings for brand/category)
  newValue: unknown       // null = TEMİZLE (remove relationship)
}

export interface RowError {
  field: string
  message: string
}

export type UpdateRowStatus = "valid" | "warning" | "error" | "no_change"

export interface UpdateRowResult {
  rowNumber: number           // 1-based Excel row (header = 1, first data = 2)
  sku: string                 // normalized (trimmed)
  productId: string | null    // null = SKU not found in DB
  productName: string | null
  status: UpdateRowStatus
  errors: RowError[]
  warnings: RowError[]
  diffs: FieldDiff[]          // fields that would change (empty for error / no_change)
}

export interface UpdateValidationSummary {
  rowsTotal: number       // parsed rows (excluding fully blank / ignored)
  rowsIgnored: number     // rows where SKU and all fields were blank
  rowsValid: number       // valid, no warnings
  rowsWarning: number     // valid but has warnings (e.g. price=0 + active)
  rowsError: number
  rowsNoChange: number    // SKU found, but every field equals current DB value
  fieldsChanged: number   // total diff count across valid + warning rows
  // Per-field breakdown (for confirmation modal in Wave 6B)
  priceUpdates: number
  stockUpdates: number
  flagUpdates: number        // is_active + is_featured + is_new + same_day_shipping
  brandUpdates: number
  categoryUpdates: number
}

export type BulkUpdateValidationResult =
  | {
      success: true
      summary: UpdateValidationSummary
      previewRows: UpdateRowResult[]  // first 200 rows (all statuses, sorted by rowNumber)
      issueRows: UpdateRowResult[]    // ALL error+warning rows (no limit) — for XLSX download
      hasErrors: boolean
      hasWarnings: boolean
    }
  | { success: false; error: string }

// ── Resolved row for commit (Wave 6B) ─────────────────────────────────────────
// Only rows with status valid|warning and diffs.length > 0 appear here.
// Keys absent = field unchanged. brand_id/category_id null = CLEAR (SET NULL).

export interface ResolvedCommitRow {
  productId: string
  status: UpdateRowStatus
  price?: number
  stock?: number
  is_active?: boolean
  is_featured?: boolean
  is_new?: boolean
  same_day_shipping?: boolean
  brand_id?: string | null    // string = UUID; null = CLEAR
  category_id?: string | null
}
