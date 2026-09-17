"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import {
  bulkStockSchema,
  bulkPriceSchema,
  bulkFlagsSchema,
  bulkClassificationSchema,
  type BulkActionResult,
  type BulkStockInput,
  type BulkPriceInput,
  type BulkFlagsInput,
  type BulkClassificationInput,
  type FailedProductInfo,
} from "@/lib/admin/schemas/bulk"

// ─────────────────────────────────────────────────────────────────────────────
// Internal RPC result types (not exposed to client)
// ─────────────────────────────────────────────────────────────────────────────

type RpcOk = {
  ok: true
  operation_id: string
  affected_count: number
}

type RpcValidationFailed = {
  ok: false
  error: "VALIDATION_FAILED"
  failed_products: Array<{
    product_id: string
    sku: string
    current_stock: number
    would_be: number
    error: string
    reserved_stock?: number
  }>
}

type RpcPriceValidationFailed = {
  ok: false
  error: "PRICE_VALIDATION_FAILED"
  failed_products: Array<{
    product_id: string
    sku: string
    current_price: number
    calculated_price: number
    error: string
  }>
}

type RpcSimpleError = {
  ok: false
  error: string
  count?: number     // LIMIT_EXCEEDED
  flag?: string      // INVALID_FLAG / INVALID_FLAG_VALUE
  detail?: string    // VALUE_OUT_OF_RANGE
}

type RpcResult = RpcOk | RpcValidationFailed | RpcPriceValidationFailed | RpcSimpleError

// ─────────────────────────────────────────────────────────────────────────────
// Error message map — Türkçe kullanıcı mesajları
// ─────────────────────────────────────────────────────────────────────────────

const RPC_ERROR_MESSAGES: Record<string, string> = {
  ACTOR_REQUIRED:                "Oturum bilgisi alınamadı. Lütfen tekrar giriş yapın.",
  UNAUTHORIZED_ACTOR:            "Bu işlem için yetkiniz bulunmuyor.",
  EMPTY_PRODUCT_LIST:            "En az 1 ürün seçilmeli.",
  LIMIT_EXCEEDED:                "Tek seferde en fazla 500 ürün işlenebilir.",
  INVALID_PRODUCT:               "Seçilen ürünlerden biri artık mevcut değil. Listeyi yenileyip tekrar deneyin.",
  INVALID_OPERATION:             "Geçersiz işlem tipi.",
  VALUE_REQUIRED:                "Değer zorunludur.",
  VALUE_MUST_BE_POSITIVE:        "Değer 0'dan büyük olmalı.",
  NEGATIVE_ADJUSTMENT_NOT_ALLOWED: "Negatif değer kullanılamaz.",
  VALUE_OUT_OF_RANGE:            "Değer belirtilen aralığın dışında.",
  REASON_TOO_SHORT:              "Sebep en az 10 karakter olmalı.",
  REASON_TOO_LONG:               "Sebep 500 karakteri geçemez.",
  VALIDATION_FAILED:             "Bazı ürünlerde stok kontrolü başarısız oldu. İşlem iptal edildi.",
  PRICE_VALIDATION_FAILED:       "Bazı ürünlerde fiyat hesabı olumsuz sonuç verdi. İşlem iptal edildi.",
  RESERVED_STOCK_VIOLATION:      "Seçilen ürünlerden bazılarında rezerve stok bulunduğu için işlem uygulanamadı.",
  NEGATIVE_STOCK:                "Bu işlem bazı ürünlerin stoğunu negatife düşürür.",
  NEGATIVE_PRICE:                "Bu işlem bazı ürünlerin fiyatını negatife düşürür.",
  ZERO_PRICE_NOT_ALLOWED:        "Fiyat sıfıra düşüyor. Sıfır fiyat yalnızca 'set' işlemiyle belirlenebilir.",
  EMPTY_FLAGS:                   "En az bir flag belirtilmeli.",
  INVALID_FLAG:                  "Geçersiz flag adı.",
  INVALID_FLAG_VALUE:            "Flag değeri yalnızca true veya false olabilir.",
  INVALID_FIELD:                 "Geçersiz alan. Yalnızca 'brand_id' veya 'category_id' kullanılabilir.",
  INVALID_BRAND_ID:              "Seçilen marka bulunamadı.",
  INVALID_CATEGORY_ID:           "Seçilen kategori bulunamadı.",
}

function rpcErrorMessage(code: string): string {
  return RPC_ERROR_MESSAGES[code] ?? "Toplu işlem tamamlanamadı. Lütfen tekrar deneyin."
}

// ─────────────────────────────────────────────────────────────────────────────
// mapRpcResult — raw RPC response → BulkActionResult
// ─────────────────────────────────────────────────────────────────────────────

function mapRpcResult(raw: RpcResult): BulkActionResult {
  if (raw.ok) {
    return {
      ok: true,
      affected: raw.affected_count,
      operationId: raw.operation_id,
    }
  }

  const code = raw.error

  // Stock validate-first failure: include per-product context
  if (code === "VALIDATION_FAILED") {
    const typed = raw as RpcValidationFailed
    const failedProducts: FailedProductInfo[] = typed.failed_products.map((p) => ({
      product_id: p.product_id,
      sku: p.sku,
      current: p.current_stock,
      calculated: p.would_be,
      ...(p.reserved_stock !== undefined ? { reserved: p.reserved_stock } : {}),
      reason: p.error,
    }))
    return {
      ok: false,
      error: rpcErrorMessage(code),
      code,
      failedProducts,
    }
  }

  // Price validate-first failure: include per-product preview
  if (code === "PRICE_VALIDATION_FAILED") {
    const typed = raw as RpcPriceValidationFailed
    const failedProducts: FailedProductInfo[] = typed.failed_products.map((p) => ({
      product_id: p.product_id,
      sku: p.sku,
      current: p.current_price,
      calculated: p.calculated_price,
      reason: p.error,
    }))
    return {
      ok: false,
      error: rpcErrorMessage(code),
      code,
      failedProducts,
    }
  }

  return { ok: false, error: rpcErrorMessage(code), code }
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-side dedupe — mirrors RPC DISTINCT UNNEST as a safety net
// ─────────────────────────────────────────────────────────────────────────────

function dedupeIds(ids: string[]): string[] {
  return [...new Set(ids)]
}

// ─────────────────────────────────────────────────────────────────────────────
// bulkStockAction
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkStockAction(input: BulkStockInput): Promise<BulkActionResult> {
  const admin = await requireAdmin()

  const parsed = bulkStockSchema.safeParse(input)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Geçersiz giriş"
    return { ok: false, error: msg, code: "VALIDATION_ERROR" }
  }

  const uniqueIds = dedupeIds(parsed.data.productIds)

  const db = createServiceClient()
  const { data, error } = await db.rpc("bulk_adjust_stock", {
    p_product_ids: uniqueIds,
    p_operation:   parsed.data.operation,
    p_value:       parsed.data.value,
    p_reason:      parsed.data.reason,
    p_actor_id:    admin.id,
  } as never)

  if (error) {
    console.error("[bulk_adjust_stock] error code:", (error as { code?: string }).code)
    return {
      ok: false,
      error: "Toplu stok güncellemesi tamamlanamadı. Lütfen tekrar deneyin.",
      code: "DB_ERROR",
    }
  }

  const result = mapRpcResult(data as RpcResult)
  if (!result.ok) return result

  revalidatePath("/admin/inventory")
  revalidatePath("/admin/products")
  revalidatePath("/admin")

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// bulkPriceAction
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkPriceAction(input: BulkPriceInput): Promise<BulkActionResult> {
  const admin = await requireAdmin()

  const parsed = bulkPriceSchema.safeParse(input)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Geçersiz giriş"
    return { ok: false, error: msg, code: "VALIDATION_ERROR" }
  }

  const uniqueIds = dedupeIds(parsed.data.productIds)

  const db = createServiceClient()
  const { data, error } = await db.rpc("bulk_update_prices", {
    p_product_ids: uniqueIds,
    p_operation:   parsed.data.operation,
    p_value:       parsed.data.value,
    p_actor_id:    admin.id,
  } as never)

  if (error) {
    console.error("[bulk_update_prices] error code:", (error as { code?: string }).code)
    return {
      ok: false,
      error: "Toplu fiyat güncellemesi tamamlanamadı. Lütfen tekrar deneyin.",
      code: "DB_ERROR",
    }
  }

  const result = mapRpcResult(data as RpcResult)
  if (!result.ok) return result

  revalidatePath("/admin/products")
  revalidatePath("/admin")

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// bulkFlagsAction
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkFlagsAction(input: BulkFlagsInput): Promise<BulkActionResult> {
  const admin = await requireAdmin()

  const parsed = bulkFlagsSchema.safeParse(input)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Geçersiz giriş"
    return { ok: false, error: msg, code: "VALIDATION_ERROR" }
  }

  const uniqueIds = dedupeIds(parsed.data.productIds)

  // Build JSONB payload: strip undefined keys so RPC gets only explicitly set flags
  const flagsPayload: Record<string, boolean> = {}
  for (const [k, v] of Object.entries(parsed.data.flags)) {
    if (v !== undefined) flagsPayload[k] = v
  }

  const db = createServiceClient()
  const { data, error } = await db.rpc("bulk_update_product_flags", {
    p_product_ids: uniqueIds,
    p_flags:       flagsPayload,
    p_actor_id:    admin.id,
  } as never)

  if (error) {
    console.error("[bulk_update_product_flags] error code:", (error as { code?: string }).code)
    return {
      ok: false,
      error: "Toplu flag güncellemesi tamamlanamadı. Lütfen tekrar deneyin.",
      code: "DB_ERROR",
    }
  }

  const result = mapRpcResult(data as RpcResult)
  if (!result.ok) return result

  revalidatePath("/admin/products")
  revalidatePath("/admin")

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// bulkClassificationAction
// ─────────────────────────────────────────────────────────────────────────────

export async function bulkClassificationAction(
  input: BulkClassificationInput
): Promise<BulkActionResult> {
  const admin = await requireAdmin()

  const parsed = bulkClassificationSchema.safeParse(input)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Geçersiz giriş"
    return { ok: false, error: msg, code: "VALIDATION_ERROR" }
  }

  const uniqueIds = dedupeIds(parsed.data.productIds)

  const db = createServiceClient()
  const { data, error } = await db.rpc("bulk_update_product_classification", {
    p_product_ids: uniqueIds,
    p_field:       parsed.data.field,
    p_value:       parsed.data.value,
    p_actor_id:    admin.id,
  } as never)

  if (error) {
    console.error("[bulk_update_product_classification] error code:", (error as { code?: string }).code)
    return {
      ok: false,
      error: "Toplu sınıflandırma güncellemesi tamamlanamadı. Lütfen tekrar deneyin.",
      code: "DB_ERROR",
    }
  }

  const result = mapRpcResult(data as RpcResult)
  if (!result.ok) return result

  revalidatePath("/admin/products")

  return result
}
