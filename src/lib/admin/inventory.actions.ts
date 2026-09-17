"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import {
  inventoryAdjustSchema,
  type ActionState,
} from "@/lib/admin/schemas/inventory"

// audit_logs INSERT is handled inside the RPC transaction (012_admin_stock_adjustment_rpc.sql).
// Do NOT call createAuditLog() separately — it would run outside the transaction.

type RpcResult = {
  ok: boolean
  error?: string
  previous_stock?: number
  new_stock?: number
  movement_qty?: number
  movement_id?: string
  available?: number
  requested?: number
}

export async function adjustStockAction(
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  const parsed = inventoryAdjustSchema.safeParse({
    operation: formData.get("operation"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { operation, quantity, reason } = parsed.data

  const db = createServiceClient()

  // Atomik transaction: products UPDATE + inventory_movements INSERT + audit_logs INSERT
  // Tek PostgreSQL RPC çağrısında gerçekleşir — yarım kalma riski yok.
  // Gereksinim: 012_admin_stock_adjustment_rpc.sql migration'ının çalıştırılmış olması.
  // Same Supabase JS 2.x + TypeScript 5.9 constraint: rpc() arg type → never.
  const { data, error } = await db.rpc("admin_stock_adjustment", {
    p_product_id: productId,
    p_operation: operation,
    p_quantity: quantity,
    p_reason: reason,
    p_actor_id: admin.id,
  } as never)

  if (error) {
    const pgCode = (error as { code?: string }).code ?? ""
    if (pgCode === "42883" || pgCode === "PGRST202") {
      return {
        success: false,
        message:
          "Stok fonksiyonu bulunamadı — 012_admin_stock_adjustment_rpc.sql migration'ı henüz çalıştırılmadı.",
      }
    }
    return {
      success: false,
      message: `Stok güncellenirken hata oluştu: ${error.message}`,
    }
  }

  const result = data as RpcResult

  if (!result.ok) {
    switch (result.error) {
      case "quantity_required":
      case "quantity_must_be_positive":
        return {
          success: false,
          message: "Geçersiz miktar.",
          fieldErrors: { quantity: ["Miktar 0'dan büyük olmalı."] },
        }
      case "negative_adjustment_not_allowed":
        return {
          success: false,
          message: "Düzeltme değeri negatif olamaz.",
          fieldErrors: { quantity: ["0 veya daha büyük bir değer girin."] },
        }
      case "reason_too_short":
        return {
          success: false,
          message: "Sebep çok kısa.",
          fieldErrors: { reason: ["Sebep en az 10 karakter olmalı."] },
        }
      case "reason_too_long":
        return {
          success: false,
          message: "Sebep çok uzun.",
          fieldErrors: { reason: ["Sebep 500 karakteri geçemez."] },
        }
      case "actor_required":
      case "unauthorized_actor":
        return {
          success: false,
          message: "Yetkisiz işlem. Lütfen tekrar giriş yapın.",
        }
      case "product_not_found":
        return { success: false, message: "Ürün bulunamadı." }
      case "insufficient_available_stock":
        return {
          success: false,
          message: `Yetersiz kullanılabilir stok. Kullanılabilir: ${result.available ?? 0}, İstenen: ${result.requested ?? quantity}`,
          fieldErrors: {
            quantity: [`En fazla ${result.available ?? 0} adet azaltabilirsiniz.`],
          },
        }
      case "would_go_negative":
        return {
          success: false,
          message: "Bu işlem stoğu negatife düşürür.",
          fieldErrors: { quantity: ["Stok 0'ın altına inemez."] },
        }
      case "invalid_operation":
        return {
          success: false,
          message: "Geçersiz işlem tipi.",
          fieldErrors: { operation: ["Lütfen geçerli bir işlem seçin."] },
        }
      default:
        return {
          success: false,
          message: `İşlem başarısız: ${result.error ?? "bilinmeyen hata"}`,
        }
    }
  }

  revalidatePath("/admin/inventory")
  redirect("/admin/inventory")
}
