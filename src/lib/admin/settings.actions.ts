"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import { createAuditLog } from "@/lib/admin/audit"
import { TAB_SCHEMAS, VALID_TAB_KEYS } from "@/lib/admin/schemas/settings"
import type { TabKey } from "@/lib/admin/schemas/settings"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { Json } from "@/types/database.types"
import { m } from "@/lib/admin/_utils"

const SYSTEM_TABS = new Set<TabKey>(["security"])

function tableFor(tab: TabKey): "public_settings" | "system_settings" {
  return SYSTEM_TABS.has(tab) ? "system_settings" : "public_settings"
}

function extractTabData(tab: TabKey, fd: FormData): Record<string, unknown> {
  switch (tab) {
    case "general":
      return {
        site_name:           fd.get("site_name"),
        site_tagline:        fd.get("site_tagline"),
        maintenance_message: fd.get("maintenance_message"),
      }
    case "company":
      return {
        name:     fd.get("name"),
        phone:    fd.get("phone"),
        whatsapp: fd.get("whatsapp"),
        email:    fd.get("email"),
        address:  fd.get("address"),
        working_hours: {
          weekdays: fd.get("working_hours_weekdays"),
          saturday: fd.get("working_hours_saturday"),
          sunday:   fd.get("working_hours_sunday"),
        },
        shipping_cutoff: fd.get("shipping_cutoff"),
      }
    case "seo":
      return {
        title_template: fd.get("title_template"),
        default_title:  fd.get("default_title"),
        description:    fd.get("description"),
        keywords:       fd.get("keywords"), // raw textarea string — Zod preprocess handles split/trim/unique
      }
    case "social":
      return {
        instagram: fd.get("instagram"),
        facebook:  fd.get("facebook"),
        youtube:   fd.get("youtube"),
        twitter:   fd.get("twitter"),
        linkedin:  fd.get("linkedin"),
      }
    case "mail":
      return {
        from_name:  fd.get("from_name"),
        from_email: fd.get("from_email"),
        reply_to:   fd.get("reply_to"),
      }
    case "stock_config":
      return { low_stock_threshold: fd.get("low_stock_threshold") }
    case "order_config":
      return {
        min_order_amount:    fd.get("min_order_amount"),
        order_notes_enabled: fd.get("order_notes_enabled"),
      }
    case "security":
      return {
        maintenance_mode:   fd.get("maintenance_mode"),
        max_login_attempts: fd.get("max_login_attempts"),
      }
    case "integrations":
      return {
        online_payment_enabled:            fd.get("online_payment_enabled"),
        google_ads_enabled:        fd.get("google_ads_enabled"),
        meta_enabled:              fd.get("meta_enabled"),
        whatsapp_enabled:          fd.get("whatsapp_enabled"),
        shipping_provider_enabled: fd.get("shipping_provider_enabled"),
      }
  }
}

export async function updateSettingsAction(
  tab: TabKey,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  if (!VALID_TAB_KEYS.includes(tab)) {
    return { success: false, message: "Geçersiz ayar sekmesi." }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const schema = TAB_SCHEMAS[tab] as any
  const rawData = extractTabData(tab, formData)
  const parsed = schema.safeParse(rawData) as
    | { success: true; data: Record<string, unknown> }
    | { success: false; error: { flatten: () => { fieldErrors: Partial<Record<string, string[]>> } } }

  if (!parsed.success) {
    return {
      success: false,
      message: "Geçersiz değerler. Lütfen formu kontrol edin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const newData = parsed.data
  const table = tableFor(tab)
  const db = createServiceClient()

  // Fetch current value to compute changed fields for audit log
  const currentResult = await db
    .from(table)
    .select("value")
    .eq("key", tab)
    .maybeSingle()

  // Union table type causes TypeScript to infer data as never — explicit cast is safe here
  const currentRow = currentResult.data as { value: Record<string, unknown> } | null
  const currentData = currentRow?.value ?? {}

  const changedFields = Object.keys(newData).filter(
    (k) => JSON.stringify(currentData[k]) !== JSON.stringify(newData[k])
  )

  const { error } = await db
    .from(table)
    .upsert(
      m({ key: tab, value: newData as Json, updated_at: new Date().toISOString() }),
      { onConflict: "key" }
    )

  if (error) {
    return { success: false, message: `Kayıt hatası: ${error.message}` }
  }

  if (changedFields.length > 0) {
    await createAuditLog({
      actorId:    admin.id,
      action:     "settings_updated",
      entityType: "settings",
      entityId:   tab,
      metadata:   { tab, fields_changed: changedFields },
    })
  }

  revalidatePath("/admin/settings")
  return { success: true, message: "Ayarlar başarıyla kaydedildi." }
}
