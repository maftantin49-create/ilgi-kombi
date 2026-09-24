"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import {
  createProductSchema,
  updateProductSchema,
  type ActionState,
} from "@/lib/admin/schemas/product"
import type { Database } from "@/types/database.types"
import { m } from "@/lib/admin/_utils"

type ProductUpdate = Database["public"]["Tables"]["products"]["Update"]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── Normalization helpers (mirror DB triggers) ────────────────────────────────
function normalizeOemCode(raw: string): string {
  return raw.trim().replace(/[\s\-./]/g, "").toUpperCase()
}

function normalizeSpecKey(raw: string): string {
  return raw.trim().toLowerCase()
}

// ── Form parsers ──────────────────────────────────────────────────────────────
function parseFormFields(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    description: formData.get("description"),
    price: formData.get("price"),
    compare_at_price: formData.get("compare_at_price"),
    stock_quantity: formData.get("stock_quantity"),
    brand_id: formData.get("brand_id"),
    category_id: formData.get("category_id"),
    image_url: formData.get("image_url"),
    hover_image_url: formData.get("hover_image_url"),
    is_active: formData.get("is_active"),
    is_featured: formData.get("is_featured"),
    is_new: formData.get("is_new"),
    same_day_shipping: formData.get("same_day_shipping"),
    seo_title: formData.get("seo_title"),
    seo_description: formData.get("seo_description"),
    track_stock: formData.get("track_stock"),
    short_description: formData.get("short_description"),
  }
}

interface GalleryRow {
  url: string
  storage_path: string
  alt_text: string | null
  sort_order: number
}

interface OemRow {
  code: string
  code_norm: string
  manufacturer: string | null
  note: string | null
  sort_order: number
}

interface SpecRow {
  spec_key: string
  spec_key_norm: string
  spec_value: string
  unit: string | null
  sort_order: number
}

interface DeviceRow {
  device_model_id: string
  note: string | null
}

function parseGalleryItems(formData: FormData): GalleryRow[] {
  const urls = formData.getAll("gallery_url").map(String)
  const paths = formData.getAll("gallery_path").map(String)
  const alts = formData.getAll("gallery_alt").map(String)
  const sorts = formData.getAll("gallery_sort").map(String)

  const rows: GalleryRow[] = []
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]?.trim()
    const path = paths[i]?.trim()
    if (!url || !path) continue
    rows.push({
      url,
      storage_path: path,
      alt_text: alts[i]?.trim() || null,
      sort_order: parseInt(sorts[i] ?? String(i), 10) || i,
    })
  }
  return rows
}

function parseOemItems(formData: FormData): OemRow[] | { error: string } {
  const codes = formData.getAll("oem_code").map(String)
  const manufacturers = formData.getAll("oem_manufacturer").map(String)
  const notes = formData.getAll("oem_note").map(String)
  const sorts = formData.getAll("oem_sort").map(String)

  const rows: OemRow[] = []
  const normSet = new Set<string>()

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i]?.trim()
    if (!code) continue
    const norm = normalizeOemCode(code)
    if (normSet.has(norm)) {
      return { error: `Tekrarlanan OEM kodu: "${code}" başka bir kodla çakışıyor.` }
    }
    normSet.add(norm)
    rows.push({
      code,
      code_norm: norm,
      manufacturer: manufacturers[i]?.trim() || null,
      note: notes[i]?.trim() || null,
      sort_order: parseInt(sorts[i] ?? String(i), 10) || i,
    })
  }

  if (rows.length > 20) {
    return { error: "OEM kodu en fazla 20 adet olabilir." }
  }
  return rows
}

function parseSpecItems(formData: FormData): SpecRow[] | { error: string } {
  const keys = formData.getAll("spec_key").map(String)
  const values = formData.getAll("spec_value").map(String)
  const units = formData.getAll("spec_unit").map(String)
  const sorts = formData.getAll("spec_sort").map(String)

  const rows: SpecRow[] = []
  const normSet = new Set<string>()

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]?.trim()
    const value = values[i]?.trim()
    if (!key || !value) continue
    const norm = normalizeSpecKey(key)
    if (normSet.has(norm)) {
      return { error: `Tekrarlanan teknik özellik: "${key}" başka bir özellikle çakışıyor.` }
    }
    normSet.add(norm)
    rows.push({
      spec_key: key,
      spec_key_norm: norm,
      spec_value: value,
      unit: units[i]?.trim() || null,
      sort_order: parseInt(sorts[i] ?? String(i), 10) || i,
    })
  }

  if (rows.length > 50) {
    return { error: "Teknik özellik en fazla 50 adet olabilir." }
  }
  return rows
}

function parseDeviceItems(formData: FormData): DeviceRow[] | { error: string } {
  const ids = formData.getAll("device_model_id").map(String)
  const notes = formData.getAll("device_note").map(String)

  const rows: DeviceRow[] = []
  const idSet = new Set<string>()

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]?.trim()
    if (!id || !UUID_RE.test(id)) continue
    if (idSet.has(id)) {
      return { error: "Tekrarlanan uyumlu cihaz seçimi." }
    }
    idSet.add(id)
    rows.push({
      device_model_id: id,
      note: notes[i]?.trim() || null,
    })
  }

  if (rows.length > 100) {
    return { error: "Uyumlu cihaz en fazla 100 adet olabilir." }
  }
  return rows
}

// ── RPC error → user message ──────────────────────────────────────────────────
function rpcErrorToMessage(error: { message?: string; code?: string }): ActionState {
  const msg = error.message ?? ""
  if (msg.includes("OEM_LIMIT_EXCEEDED")) {
    return { success: false, message: "OEM kodu en fazla 20 adet olabilir." }
  }
  if (msg.includes("SPEC_LIMIT_EXCEEDED")) {
    return { success: false, message: "Teknik özellik en fazla 50 adet olabilir." }
  }
  if (msg.includes("DEVICE_LIMIT_EXCEEDED")) {
    return { success: false, message: "Uyumlu cihaz en fazla 100 adet olabilir." }
  }
  if (msg.includes("INVALID_OR_INACTIVE_DEVICE")) {
    return {
      success: false,
      message: "Seçilen cihazlardan biri artık aktif değil. Cihaz listesini yenileyip tekrar deneyin.",
    }
  }
  if (msg.includes("PRODUCT_NOT_FOUND")) {
    return { success: false, message: "Ürün bulunamadı." }
  }
  if (error.code === "23505") {
    if (msg.includes("products_sku_key")) {
      return {
        success: false,
        message: "Bu değerler zaten kullanımda.",
        fieldErrors: { sku: ["Bu SKU zaten kullanılıyor."] },
      }
    }
    if (msg.includes("products_slug_key")) {
      return {
        success: false,
        message: "Bu değerler zaten kullanımda.",
        fieldErrors: { slug: ["Bu slug başka bir üründe kullanılıyor."] },
      }
    }
    if (msg.includes("product_oem_codes_product_norm_unique")) {
      return { success: false, message: "Aynı OEM kodu birden fazla kez girilmiş." }
    }
    if (msg.includes("product_specs_key_unique")) {
      return { success: false, message: "Aynı özellik adı birden fazla kez girilmiş." }
    }
  }
  return { success: false, message: "Ürün kaydedilemedi. Lütfen tekrar deneyin." }
}

// ── createProductAction ───────────────────────────────────────────────────────
export async function createProductAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  console.log("[CREATE_ACTION] START")
  const admin = await requireAdmin()
  console.log("[CREATE_ACTION] requireAdmin passed — actor:", admin.id)

  const pendingProductIdRaw = formData.get("pendingProductId")
  const pendingProductId =
    typeof pendingProductIdRaw === "string" && UUID_RE.test(pendingProductIdRaw)
      ? pendingProductIdRaw
      : null

  if (!pendingProductId) {
    return { success: false, message: "Geçersiz ürün kimliği." }
  }

  const parsed = createProductSchema.safeParse(parseFormFields(formData))
  if (!parsed.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const galleryRows = parseGalleryItems(formData)
  const oemResult = parseOemItems(formData)
  const specResult = parseSpecItems(formData)
  const deviceResult = parseDeviceItems(formData)

  if ("error" in oemResult) return { success: false, message: oemResult.error }
  if ("error" in specResult) return { success: false, message: specResult.error }
  if ("error" in deviceResult) return { success: false, message: deviceResult.error }

  console.log("[CREATE_ACTION] FORM_PARSE END — oem:", oemResult.length, "specs:", specResult.length, "devices:", deviceResult.length)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any
  console.log("[CREATE_ACTION] RPC_CREATE START — productId:", pendingProductId)
  const { error } = await db.rpc("create_product_full", {
    p_product_id: pendingProductId,
    p_actor_id: admin.id,
    p_product: {
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      price: String(parsed.data.price),
      compare_at_price: parsed.data.compare_at_price != null
        ? String(parsed.data.compare_at_price)
        : "",
      stock_quantity: String(parsed.data.stock_quantity),
      brand_id: parsed.data.brand_id ?? "",
      category_id: parsed.data.category_id ?? "",
      image_url: parsed.data.image_url ?? "",
      hover_image_url: parsed.data.hover_image_url ?? "",
      is_active: String(parsed.data.is_active),
      is_featured: String(parsed.data.is_featured),
      is_new: String(parsed.data.is_new),
      same_day_shipping: String(parsed.data.same_day_shipping),
      seo_title: parsed.data.seo_title ?? "",
      seo_description: parsed.data.seo_description ?? "",
      track_stock: String(parsed.data.track_stock),
      short_description: parsed.data.short_description ?? "",
    },
    p_images: galleryRows,
    p_oem_codes: oemResult,
    p_specs: specResult,
    p_device_ids: deviceResult,
  })

  console.log("[CREATE_ACTION] RPC_CREATE END — error:", error?.message ?? "none")
  if (error) return rpcErrorToMessage(error)

  console.log("[CREATE_ACTION] RETURN — redirecting")
  revalidatePath("/admin/products")
  redirect("/admin/products")
}

// ── updateProductAction ───────────────────────────────────────────────────────
export async function updateProductAction(
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  const parsed = updateProductSchema.safeParse(parseFormFields(formData))
  if (!parsed.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const galleryRows = parseGalleryItems(formData)
  const oemResult = parseOemItems(formData)
  const specResult = parseSpecItems(formData)
  const deviceResult = parseDeviceItems(formData)

  if ("error" in oemResult) return { success: false, message: oemResult.error }
  if ("error" in specResult) return { success: false, message: specResult.error }
  if ("error" in deviceResult) return { success: false, message: deviceResult.error }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createServiceClient() as any

  // Storage cleanup for removed gallery items (best-effort, before atomic RPC)
  try {
    const { data: existingImages } = await db
      .from("product_images")
      .select("storage_path")
      .eq("product_id", productId)
    const newPaths = new Set(galleryRows.map((r) => r.storage_path))
    const removedPaths = (
      (existingImages ?? []) as { storage_path: string }[]
    )
      .filter((r) => !newPaths.has(r.storage_path))
      .map((r) => r.storage_path)
    if (removedPaths.length > 0) {
      await db.storage.from("product-images").remove(removedPaths)
    }
  } catch {
    // best-effort
  }

  const { error } = await db.rpc("update_product_full", {
    p_product_id: productId,
    p_actor_id: admin.id,
    p_product: {
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      price: String(parsed.data.price),
      compare_at_price: parsed.data.compare_at_price != null
        ? String(parsed.data.compare_at_price)
        : "",
      brand_id: parsed.data.brand_id ?? "",
      category_id: parsed.data.category_id ?? "",
      image_url: parsed.data.image_url ?? "",
      hover_image_url: parsed.data.hover_image_url ?? "",
      is_active: String(parsed.data.is_active),
      is_featured: String(parsed.data.is_featured),
      is_new: String(parsed.data.is_new),
      same_day_shipping: String(parsed.data.same_day_shipping),
      seo_title: parsed.data.seo_title ?? "",
      seo_description: parsed.data.seo_description ?? "",
      track_stock: String(parsed.data.track_stock),
      short_description: parsed.data.short_description ?? "",
    },
    p_images: galleryRows,
    p_oem_codes: oemResult,
    p_specs: specResult,
    p_device_ids: deviceResult,
  })

  if (error) return rpcErrorToMessage(error)

  revalidatePath("/admin/products")
  redirect("/admin/products")
}

// ── toggleProductStatus ───────────────────────────────────────────────────────
export async function toggleProductStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin()

  const productId = formData.get("productId") as string | null
  const currentStatus = formData.get("currentStatus") === "true"
  if (!productId) return

  const newStatus = !currentStatus
  const db = createServiceClient()
  const { error } = await db
    .from("products")
    .update(m<ProductUpdate>({ is_active: newStatus }))
    .eq("id", productId)

  if (error) return

  const { createAuditLog } = await import("@/lib/admin/audit")
  await createAuditLog({
    actorId: admin.id,
    action: "product_status_changed",
    entityType: "product",
    entityId: productId,
    metadata: { from: currentStatus, to: newStatus },
  })

  revalidatePath("/admin/products")
}
