"use server"

import { requireAdmin } from "./requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import { parseFormDataFile } from "./import/parseFile"
import { validateRows } from "./import/validate"
import { normalizeName } from "./import/normalize"
import type { Brand, Category, Product } from "@/types/database.types"

const DB_BATCH = 500  // PostgREST URL sınırını aşmamak için .in() dilim boyutu

// ── Response tipleri ─────────────────────────────────────────────────────────

export interface ImportStats {
  total: number
  ok: number
  warnings: number
  errors: number
}

export interface PreviewRow {
  rowNumber: number
  sku: string
  name: string
  price: number | null
  brand: string | null
  category: string | null
  status: "ok" | "warning" | "error"
  finalSlug: string
}

export interface IssueRow {
  rowNumber: number
  sku: string
  name: string
  status: "warning" | "error"
  errors: { field: string; message: string }[]
  warnings: { field: string; message: string }[]
}

export type ImportValidationResult =
  | { success: true; stats: ImportStats; previewRows: PreviewRow[]; issueRows: IssueRow[] }
  | { success: false; error: string }

// ── DB yardımcısı — batch .in() ──────────────────────────────────────────────

async function batchConflicts(
  db: ReturnType<typeof createServiceClient>,
  column: "slug" | "sku",
  values: string[]
): Promise<Set<string>> {
  const found = new Set<string>()
  for (let i = 0; i < values.length; i += DB_BATCH) {
    const batch = values.slice(i, i + DB_BATCH)
    const { data } = await db.from("products").select("*").in(column, batch)
    for (const row of (data as Product[]) ?? []) {
      found.add(row[column])
    }
  }
  return found
}

// ── Shared DB lookup ─────────────────────────────────────────────────────────
// Her iki action (validate + commit) tarafından kullanılan ortak sorgu mantığı.

export async function fetchLookups(db: ReturnType<typeof createServiceClient>) {
  const [{ data: brandsRaw }, { data: categoriesRaw }] = await Promise.all([
    db.from("brands").select("*"),
    db.from("categories").select("*"),
  ])
  // normalizeName: TR_MAP + lowercase + trim — hem DB key hem kullanıcı girişi aynı fonksiyonla normalize edilir
  const brandMap = new Map<string, string>(
    ((brandsRaw as Brand[]) ?? []).map((b) => [normalizeName(b.name), b.id])
  )
  const categoryMap = new Map<string, string>(
    ((categoriesRaw as Category[]) ?? []).map((c) => [normalizeName(c.name), c.id])
  )
  return { brandMap, categoryMap }
}

export async function fetchConflictSets(
  db: ReturnType<typeof createServiceClient>,
  slugs: string[],
  skus: string[]
): Promise<{ existingSlugs: Set<string>; existingSkus: Set<string> }> {
  const [existingSlugs, existingSkus] = await Promise.all([
    batchConflicts(db, "slug", slugs),
    batchConflicts(db, "sku", skus),
  ])
  return { existingSlugs, existingSkus }
}

// ── Server Action: Dry Run ────────────────────────────────────────────────────

export async function validateImportAction(
  formData: FormData
): Promise<ImportValidationResult> {
  await requireAdmin()

  const parsed = await parseFormDataFile(formData)
  if (!parsed.success) return { success: false, error: parsed.error }
  const { rows: normalized } = parsed

  const db = createServiceClient()
  const { brandMap, categoryMap } = await fetchLookups(db)
  const { existingSlugs, existingSkus } = await fetchConflictSets(
    db,
    normalized.map((r) => r.slug).filter(Boolean),
    normalized.map((r) => r.sku).filter(Boolean)
  )

  const summary = validateRows(normalized, brandMap, categoryMap, existingSlugs, existingSkus)

  const stats: ImportStats = {
    total: summary.total,
    ok: summary.ok,
    warnings: summary.warnings,
    errors: summary.errors,
  }

  const previewRows: PreviewRow[] = summary.rowStatuses.slice(0, 50).map((r) => {
    const raw = normalized[r.index]
    return {
      rowNumber: r.index + 2,
      sku: raw.sku,
      name: raw.name,
      price: raw.price,
      brand: raw.brand,
      category: raw.category,
      status: r.status,
      finalSlug: r.finalSlug,
    }
  })

  const issueRows: IssueRow[] = summary.rowStatuses
    .filter((r) => r.status !== "ok")
    .map((r) => {
      const raw = normalized[r.index]
      return {
        rowNumber: r.index + 2,
        sku: raw.sku,
        name: raw.name,
        status: r.status as "warning" | "error",
        errors: r.errors,
        warnings: r.warnings,
      }
    })

  return { success: true, stats, previewRows, issueRows }
}
