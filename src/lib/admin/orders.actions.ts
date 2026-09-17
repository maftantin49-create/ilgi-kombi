"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import { createAuditLog } from "@/lib/admin/audit"
import {
  updateOrderStatusSchema,
  VALID_TRANSITIONS,
  ORDER_STATUS_LABELS,
} from "@/lib/admin/schemas/order"
import { getOrderById } from "@/lib/admin/orders"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { OrderStatus } from "@/types/database.types"
import { m } from "@/lib/admin/_utils"

export async function updateOrderStatusAction(
  orderId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  const parsed = updateOrderStatusSchema.safeParse({
    status: formData.get("status"),
  })

  if (!parsed.success) {
    return {
      success: false,
      message: "Geçersiz durum değeri.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const newStatus = parsed.data.status

  // Fetch current order — validates order exists and gets current status
  const order = await getOrderById(orderId)
  if (!order) {
    return { success: false, message: "Sipariş bulunamadı." }
  }

  const currentStatus = order.status as OrderStatus
  const allowed = VALID_TRANSITIONS[currentStatus] ?? []

  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      message: `"${ORDER_STATUS_LABELS[currentStatus]}" → "${ORDER_STATUS_LABELS[newStatus]}" geçişi izin verilmiyor.`,
    }
  }

  const db = createServiceClient()
  const { error } = await db
    .from("orders")
    .update(m({ status: newStatus }))
    .eq("id", orderId)

  if (error) {
    return {
      success: false,
      message: `Sipariş güncellenirken hata oluştu: ${error.message}`,
    }
  }

  await createAuditLog({
    actorId: admin.id,
    action: "order_status_changed",
    entityType: "order",
    entityId: orderId,
    metadata: {
      order_id: orderId,
      order_number: order.order_number,
      previous_status: currentStatus,
      new_status: newStatus,
    },
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  redirect(`/admin/orders/${orderId}`)
}
