"use server"

// Pattern A: re-parse + re-validate on commit.
// Client payload is NOT trusted; the same file is validated again server-side.
// This eliminates TOCTOU / client manipulation between dry-run and commit.

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "./requireAdmin"
import { parseFormDataFileForUpdate } from "./bulk-update/parse"
import { validateUpdateRows } from "./bulk-update/validate"
import { createServiceClient } from "@/lib/supabase/server"
import type { ResolvedCommitRow } from "./bulk-update/schema"

const COMMIT_LIMIT = 500

// ─────────────────────────────────────────────────────────────────────────────
// Return type
// ─────────────────────────────────────────────────────────────────────────────

export type BulkUpdateCommitResult =
  | {
      success: true
      operationId: string
      submitted: number
      affected: number
      fieldsChanged: number
      priceUpdates: number
      stockUpdates: number
      flagUpdates: number
      brandUpdates: number
      categoryUpdates: number
    }
  | { success: false; error: string }

// ─────────────────────────────────────────────────────────────────────────────
// Known RPC error code → user-facing Turkish message
// ─────────────────────────────────────────────────────────────────────────────

const RPC_ERROR_MAP: Record<string, string> = {
  UNAUTHORIZED_ADMIN:          "Yetki doğrulanamadı. Lütfen tekrar giriş yapın.",
  EMPTY_ROWS:                  "Güncellenecek satır bulunamadı.",
  LIMIT_EXCEEDED:              `Tek işlemde en fazla ${COMMIT_LIMIT} ürün güncellenebilir.`,
  DUPLICATE_PRODUCT:           "Aynı ürün commit payload'ında birden fazla kez görünüyor.",
  INVALID_PRODUCT:             "Bir veya daha fazla ürün veritabanında bulunamadı.",
  NEGATIVE_PRICE:              "Fiyat negatif olamaz.",
  NEGATIVE_STOCK:              "Stok miktarı negatif olamaz.",
  RESERVED_STOCK_VIOLATION:    "Yeni stok miktarı aktif rezervasyonun altında.",
  INVALID_BRAND:               "Bir veya daha fazla marka bulunamadı.",
  INVALID_CATEGORY:            "Bir veya daha fazla kategori bulunamadı.",
  INVALID_FIELD:               "İzin verilmeyen alan gönderildi.",
  VALIDATION_FAILED:           "Veritabanı doğrulaması başarısız. Lütfen tekrar dry-run çalıştırın.",
  ACTOR_REQUIRED:              "Aktör bilgisi eksik.",
  OPERATION_ID_REQUIRED:       "İşlem kimliği eksik.",
}

function mapRpcCode(code: string): string {
  return RPC_ERROR_MAP[code] ?? "Toplu güncelleme tamamlanamadı."
}

// ─────────────────────────────────────────────────────────────────────────────
// Commit action
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkUpdateCommitAction(
  formData: FormData,
): Promise<BulkUpdateCommitResult> {

  // ── Auth ──────────────────────────────────────────────────────────────────
  const admin = await requireAdmin()

  // ── Re-parse (Pattern A: same file, server-side, never trust client rows) ──
  const parsed = await parseFormDataFileForUpdate(formData)
  if (!parsed.success) {
    return { success: false, error: parsed.error }
  }

  // ── Re-validate ────────────────────────────────────────────────────────────
  const { summary, resolvedRows } = await validateUpdateRows(parsed.rows, parsed.ignoredCount)

  // Block commit on any validation error
  if (summary.rowsError > 0) {
    return {
      success: false,
      error: `Doğrulama hatası: ${summary.rowsError} satırda hata var — commit engelendi.`,
    }
  }

  // resolvedRows = valid|warning rows with actual diffs only
  if (resolvedRows.length === 0) {
    return { success: false, error: "Güncellenecek satır bulunamadı." }
  }

  // ── Commit limit ───────────────────────────────────────────────────────────
  if (resolvedRows.length > COMMIT_LIMIT) {
    return {
      success: false,
      error: `Tek işlemde en fazla ${COMMIT_LIMIT} ürün güncellenebilir. Bu dosyada ${resolvedRows.length} değişiklik var.`,
    }
  }

  // ── Build JSONB payload ────────────────────────────────────────────────────
  // Only include keys that are explicitly set on each resolved row.
  // Absent key = do not update that field (RPC uses JSONB ? operator).
  // null value for brand_id / category_id = CLEAR (SET NULL).

  const rows = resolvedRows.map((r: ResolvedCommitRow) => {
    const obj: Record<string, unknown> = { product_id: r.productId }
    if ("price"             in r) obj.price             = r.price
    if ("stock"             in r) obj.stock             = r.stock
    if ("is_active"         in r) obj.is_active         = r.is_active
    if ("is_featured"       in r) obj.is_featured       = r.is_featured
    if ("is_new"            in r) obj.is_new            = r.is_new
    if ("same_day_shipping" in r) obj.same_day_shipping = r.same_day_shipping
    if ("brand_id"          in r) obj.brand_id          = r.brand_id    // null = CLEAR
    if ("category_id"       in r) obj.category_id       = r.category_id // null = CLEAR
    return obj
  })

  // ── Generate operation_id server-side ─────────────────────────────────────
  const operationId = randomUUID()

  // ── Call RPC ──────────────────────────────────────────────────────────────
  const db = createServiceClient()

  // RPC signature: bulk_excel_product_update(p_rows JSONB, p_actor_id UUID, p_operation_id UUID)
  // Uses (db as any).rpc — no Database Function type yet (added in Wave 6C supabase gen)
  const { data, error } = await (db as unknown as {
    rpc: (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>
  }).rpc("bulk_excel_product_update", {
    p_rows:         rows,
    p_actor_id:     admin.id,
    p_operation_id: operationId,
  })

  if (error) {
    console.error("[BulkUpdateCommit] RPC error:", error)
    return { success: false, error: "Toplu güncelleme tamamlanamadı." }
  }

  const result = data as Record<string, unknown>

  if (!result.ok) {
    return { success: false, error: mapRpcCode(result.code as string) }
  }

  // ── Revalidate ────────────────────────────────────────────────────────────
  // Pages are force-dynamic (ƒ routes), so revalidation is technically a no-op
  // but included for correctness if caching is added later.
  revalidatePath("/admin/products")
  revalidatePath("/admin/inventory")
  revalidatePath("/admin", "layout")

  // ── Return success ────────────────────────────────────────────────────────
  return {
    success:        true,
    operationId:    result.operation_id as string,
    submitted:      result.submitted    as number,
    affected:       result.affected     as number,
    fieldsChanged:  result.fields_changed  as number,
    priceUpdates:   result.price_updates   as number,
    stockUpdates:   result.stock_updates   as number,
    flagUpdates:    result.flag_updates    as number,
    brandUpdates:   result.brand_updates   as number,
    categoryUpdates:result.category_updates as number,
  }
}
