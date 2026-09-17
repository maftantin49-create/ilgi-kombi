"use server"

import { requireAdmin } from "./requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"

const ALLOWED_EXTS = new Set(["jpg", "jpeg", "png", "webp"])
const ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_BYTES = 5 * 1024 * 1024

function detectFormat(header: Uint8Array): "jpeg" | "png" | "webp" | null {
  // JPEG: FF D8 FF
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return "jpeg"
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    header[0] === 0x89 && header[1] === 0x50 &&
    header[2] === 0x4e && header[3] === 0x47
  ) return "png"
  // WebP: RIFF????WEBP (bytes 0-3 = RIFF, bytes 8-11 = WEBP)
  if (
    header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
    header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
  ) return "webp"
  return null
}

const EXT_TO_FORMAT: Record<string, string> = {
  jpg: "jpeg", jpeg: "jpeg", png: "png", webp: "webp",
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string }

export async function uploadProductImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()

  const file = formData.get("file")
  const productId = formData.get("productId")
  const role = formData.get("imageRole")

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Dosya bulunamadı" }
  }
  if (typeof productId !== "string" || !UUID_RE.test(productId)) {
    return { ok: false, error: "Geçersiz ürün ID" }
  }
  if (typeof role !== "string" || !["main", "hover", "gallery"].includes(role)) {
    return { ok: false, error: "Geçersiz görsel rolü" }
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!ALLOWED_EXTS.has(rawExt)) {
    return { ok: false, error: "Yalnızca JPG, PNG veya WebP yükleyebilirsiniz" }
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return { ok: false, error: "Geçersiz dosya türü" }
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: `Dosya boyutu ${(file.size / 1024 / 1024).toFixed(1)} MB — maksimum 5 MB`,
    }
  }

  // Magic bytes: read first 12 bytes to detect actual format
  const buffer = await file.arrayBuffer()
  const header = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength))
  const format = detectFormat(header)
  if (!format) {
    return { ok: false, error: "Dosya içeriği desteklenmiyor (SVG ve GIF kabul edilmez)" }
  }
  if (EXT_TO_FORMAT[rawExt] !== format) {
    return { ok: false, error: "Dosya uzantısı içerikle eşleşmiyor" }
  }

  // Server-generated path — client cannot influence the storage location
  const ext = format === "jpeg" ? "jpg" : format
  const path = `products/${productId}/${crypto.randomUUID()}.${ext}`

  const db = createServiceClient()
  const { error: storageError } = await db.storage
    .from("product-images")
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (storageError) {
    console.error("[uploadProductImage]", storageError.message)
    return { ok: false, error: "Görsel yüklenemedi, lütfen tekrar deneyin" }
  }

  const { data } = db.storage.from("product-images").getPublicUrl(path)
  return { ok: true, url: data.publicUrl, path }
}

export async function deleteStorageImageAction(
  storagePath: string
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin()

  // Reject paths that don't start with "products/" to prevent accidental deletion
  if (!storagePath || !storagePath.startsWith("products/")) {
    return { ok: false, error: "Geçersiz depolama yolu" }
  }

  const db = createServiceClient()
  const { error } = await db.storage.from("product-images").remove([storagePath])
  if (error) {
    console.error("[deleteStorageImage]", error.message)
    return { ok: false, error: "Görsel silinemedi" }
  }

  return { ok: true }
}
