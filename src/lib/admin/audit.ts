import { createServiceClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database.types"
import { m } from "@/lib/admin/_utils"

export async function createAuditLog({
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  actorId: string
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Json
}): Promise<void> {
  try {
    const db = createServiceClient()
    await db.from("audit_logs").insert(m({
      actor_user_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
    }))
  } catch (err) {
    console.error("[AuditLog]", err)
  }
}
