"use server"

import { requireAdmin } from "./requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import { parseFormDataFile } from "./import/parseFile"
import { validateRows } from "./import/validate"
import { fetchLookups, fetchConflictSets } from "./import.actions"

// ── Response tipi ─────────────────────────────────────────────────────────────

export type ImportCommitResult =
  | {
      success: true
      sessionId: string
      insertedCount: number
      stockMovementsCount: number
    }
  | { success: false; error: string }

// ── Server Action: Commit ─────────────────────────────────────────────────────
// Dosyayı yeniden parse eder, yeniden validate eder, ardından RPC çağırır.
// Client'tan gelen validRows payload'una GÜVENİLMEZ.

export async function importCommitAction(
  formData: FormData
): Promise<ImportCommitResult> {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const actor = await requireAdmin()

  // ── 2. Dosya yeniden parse (Wave 1 preview'dan bağımsız) ──────────────────
  const parsed = await parseFormDataFile(formData)
  if (!parsed.success) return { success: false, error: parsed.error }
  const { rows: normalized } = parsed

  // ── 3. Yeniden validate ───────────────────────────────────────────────────
  const db = createServiceClient()
  const { brandMap, categoryMap } = await fetchLookups(db)
  const { existingSlugs, existingSkus } = await fetchConflictSets(
    db,
    normalized.map((r) => r.slug).filter(Boolean),
    normalized.map((r) => r.sku).filter(Boolean)
  )

  const summary = validateRows(normalized, brandMap, categoryMap, existingSlugs, existingSkus)

  // ── 4. Geçerli satırları filtrele (ok + warning — error hariç) ────────────
  const validStatuses = summary.rowStatuses.filter((r) => r.status !== "error")

  if (validStatuses.length === 0) {
    return { success: false, error: "Geçerli satır bulunamadı — dosyayı düzeltin ve tekrar yükleyin" }
  }

  // ── 5. RPC payload oluştur ────────────────────────────────────────────────
  // resolvedBrandId/categoryId validation sonucundan alınır (normalize edilmiş raw'dan değil)
  const rpcRows = validStatuses.map((r) => {
    const raw = normalized[r.index]
    return {
      sku: raw.sku,
      name: raw.name,
      slug: r.finalSlug,
      description: raw.description ?? null,
      price: raw.price,
      compare_at_price: raw.compare_at_price ?? null,
      stock_quantity: raw.stock_quantity ?? 0,
      // track_stock: null → RPC COALESCE → true (DB default)
      ...(raw.track_stock !== null ? { track_stock: raw.track_stock } : {}),
      brand_id: r.resolvedBrandId ?? null,
      category_id: r.resolvedCategoryId ?? null,
      compatible_brands: raw.compatible_brands ?? null,
      image_url: raw.image_url ?? null,
      hover_image_url: raw.hover_image_url ?? null,
      is_active: raw.is_active,
      is_featured: raw.is_featured,
      is_new: raw.is_new,
      same_day_shipping: raw.same_day_shipping,
    }
  })

  // ── 6. Session ID — server-side üretilir ──────────────────────────────────
  const sessionId = crypto.randomUUID()

  // ── 7. RPC çağrısı ────────────────────────────────────────────────────────
  // Database tipinde Functions tanımı olmadığından cast gerekli (proje geneli pattern)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (db as any).rpc("bulk_import_products", {
    p_rows: rpcRows,
    p_session_id: sessionId,
    p_actor_id: actor.id,
  })

  if (error) {
    // Ham DB hatasını client'a gönderme
    console.error("[importCommitAction] RPC error:", error.message)
    return { success: false, error: "İçe aktarma başarısız — hiçbir ürün eklenmedi. Lütfen tekrar deneyin." }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpcResult = data as any
  if (!rpcResult?.ok) {
    console.error("[importCommitAction] RPC returned not-ok:", rpcResult)
    return { success: false, error: "İçe aktarma başarısız — hiçbir ürün eklenmedi." }
  }

  return {
    success: true,
    sessionId,
    insertedCount: rpcResult.inserted_count ?? 0,
    stockMovementsCount: rpcResult.initial_stock_movements_count ?? 0,
  }
}
