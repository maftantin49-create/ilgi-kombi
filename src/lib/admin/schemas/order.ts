import { z } from "zod"
import type { OrderStatus, PaymentStatus } from "@/types/database.types"

export type { ActionState } from "@/lib/admin/schemas/product"
export { INITIAL_STATE } from "@/lib/admin/schemas/product"

export const ORDER_STATUSES = [
  "draft",
  "pending_payment",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "partially_refunded",
] as const

export const PAYMENT_STATUSES = [
  "initialized",
  "pending",
  "success",
  "failed",
  "cancelled",
  "refunded",
] as const

// Compile-time guard: ORDER_STATUSES must stay in sync with database.types.ts
const _statusCheck: readonly OrderStatus[] = ORDER_STATUSES
void _statusCheck

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: "Taslak",
  pending_payment: "Ödeme Bekleniyor",
  paid: "Ödendi",
  preparing: "Hazırlanıyor",
  shipped: "Kargoya Verildi",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
  refunded: "İade Edildi",
  partially_refunded: "Kısmi İade",
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  initialized: "Başlatıldı",
  pending: "Beklemede",
  success: "Başarılı",
  failed: "Başarısız",
  cancelled: "İptal",
  refunded: "İade",
}

// Allowed next statuses for each current status.
// Terminal states (cancelled, refunded) have empty arrays.
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ["pending_payment"],
  pending_payment: ["paid", "cancelled"],
  paid: ["preparing", "refunded", "partially_refunded"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded", "partially_refunded"],
  cancelled: [],
  refunded: [],
  partially_refunded: ["refunded"],
}

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, { error: "Geçerli bir sipariş durumu seçin" }),
})
