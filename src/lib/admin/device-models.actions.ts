"use server"

import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"

export type DeviceModelSearchResult = {
  id: string
  brandId: string
  brandName: string
  model: string
  category: string | null
  yearRange: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyDb = () => createServiceClient() as any

export async function searchDeviceModelsAction(
  query: string
): Promise<DeviceModelSearchResult[]> {
  await requireAdmin()

  const q = query.trim()
  if (q.length < 2) return []

  // Normalize for model_norm ILIKE (trigram index on model_norm)
  const normQ = q.replace(/[\s\-./]/g, "").toUpperCase()

  const { data, error } = await anyDb()
    .from("device_models")
    .select("id, model, model_norm, category, year_from, year_to, brand_id, brands(name)")
    .eq("is_active", true)
    .or(`model_norm.ilike.%${normQ}%,model.ilike.%${q}%`)
    .order("model_norm")
    .limit(20)

  if (error || !data) return []

  return (data as {
    id: string
    model: string
    category: string | null
    year_from: number | null
    year_to: number | null
    brand_id: string
    brands: { name: string } | null
  }[]).map((row) => ({
    id: row.id,
    brandId: row.brand_id,
    brandName: row.brands?.name ?? "—",
    model: row.model,
    category: row.category,
    yearRange: row.year_from
      ? `${row.year_from}${row.year_to ? `–${row.year_to}` : "+"}`
      : null,
  }))
}

export async function createDeviceModelAction(
  brandId: string,
  model: string,
  category: string | null,
  yearFrom: number | null,
  yearTo: number | null
): Promise<{ ok: true; device: DeviceModelSearchResult } | { ok: false; error: string }> {
  await requireAdmin()

  const modelTrimmed = model.trim()
  if (!modelTrimmed) return { ok: false, error: "Model adı boş olamaz." }

  const { data, error } = await anyDb()
    .from("device_models")
    .insert({
      brand_id: brandId,
      model: modelTrimmed,
      model_norm: modelTrimmed.toUpperCase().replace(/\s+/g, " "),
      category: category?.trim() || null,
      year_from: yearFrom,
      year_to: yearTo,
    })
    .select("id, model, category, year_from, year_to, brand_id, brands(name)")
    .single()

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Bu model bu markada zaten mevcut." }
    return { ok: false, error: "Cihaz eklenemedi." }
  }

  const row = data as {
    id: string
    model: string
    category: string | null
    year_from: number | null
    year_to: number | null
    brand_id: string
    brands: { name: string } | null
  }

  return {
    ok: true,
    device: {
      id: row.id,
      brandId: row.brand_id,
      brandName: row.brands?.name ?? "—",
      model: row.model,
      category: row.category,
      yearRange: row.year_from
        ? `${row.year_from}${row.year_to ? `–${row.year_to}` : "+"}`
        : null,
    },
  }
}
