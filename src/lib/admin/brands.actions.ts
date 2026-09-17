"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import { createAuditLog } from "@/lib/admin/audit"
import { brandSchema, type ActionState } from "@/lib/admin/schemas/brand"
import { getBrandProductCount } from "@/lib/admin/brands"
import type { Database } from "@/types/database.types"
import { m } from "@/lib/admin/_utils"

type BrandInsert = Database["public"]["Tables"]["brands"]["Insert"]
type BrandUpdate = Database["public"]["Tables"]["brands"]["Update"]

function parseFormFields(formData: FormData) {
  return {
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    is_active:   formData.get("is_active"),
    is_featured: formData.get("is_featured"),
    logo_url:    formData.get("logo_url"),
    sort_order:  formData.get("sort_order"),
  }
}

export async function createBrandAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  const parsed = brandSchema.safeParse(parseFormFields(formData))

  if (!parsed.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const insertData: BrandInsert = {
    name:        parsed.data.name,
    slug:        parsed.data.slug,
    is_active:   parsed.data.is_active,
    is_featured: parsed.data.is_featured,
    logo_url:    parsed.data.logo_url ?? null,
    sort_order:  parsed.data.sort_order,
  }

  const db = createServiceClient()
  const { data: brand, error } = await db
    .from("brands")
    .insert(m(insertData))
    .select("id")
    .single()

  const newBrand = brand as { id: string } | null

  if (error) {
    if (error.code === "23505") {
      const fieldErrors: ActionState["fieldErrors"] = {}
      if (error.message.includes("brands_slug_key")) {
        fieldErrors.slug = ["Bu slug zaten kullanılıyor."]
      } else if (error.message.includes("brands_name_key")) {
        fieldErrors.name = ["Bu marka adı zaten kullanılıyor."]
      }
      return {
        success: false,
        message: "Bu değerler zaten kullanımda.",
        fieldErrors,
      }
    }
    return { success: false, message: "Marka oluşturulurken bir hata oluştu." }
  }

  await createAuditLog({
    actorId: admin.id,
    action: "brand_created",
    entityType: "brand",
    entityId: newBrand?.id,
    metadata: { name: parsed.data.name, slug: parsed.data.slug },
  })

  revalidatePath("/admin/brands")
  redirect("/admin/brands")
}

export async function updateBrandAction(
  brandId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  const parsed = brandSchema.safeParse(parseFormFields(formData))

  if (!parsed.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const updateData: BrandUpdate = {
    name:        parsed.data.name,
    slug:        parsed.data.slug,
    is_active:   parsed.data.is_active,
    is_featured: parsed.data.is_featured,
    logo_url:    parsed.data.logo_url ?? null,
    sort_order:  parsed.data.sort_order,
  }

  const db = createServiceClient()
  const { error } = await db
    .from("brands")
    .update(m(updateData))
    .eq("id", brandId)

  if (error) {
    if (error.code === "23505") {
      const fieldErrors: ActionState["fieldErrors"] = {}
      if (error.message.includes("brands_slug_key")) {
        fieldErrors.slug = ["Bu slug başka bir markada kullanılıyor."]
      } else if (error.message.includes("brands_name_key")) {
        fieldErrors.name = ["Bu marka adı başka bir markada kullanılıyor."]
      }
      return {
        success: false,
        message: "Bu değerler zaten kullanımda.",
        fieldErrors,
      }
    }
    return { success: false, message: "Marka güncellenirken bir hata oluştu." }
  }

  await createAuditLog({
    actorId: admin.id,
    action: "brand_updated",
    entityType: "brand",
    entityId: brandId,
    metadata: { name: parsed.data.name },
  })

  revalidatePath("/admin/brands")
  redirect("/admin/brands")
}

export async function toggleBrandStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin()

  const brandId = formData.get("brandId") as string | null
  const currentStatus = formData.get("currentStatus") === "true"

  if (!brandId) return

  const newStatus = !currentStatus
  const db = createServiceClient()
  const { error } = await db
    .from("brands")
    .update(m<BrandUpdate>({ is_active: newStatus }))
    .eq("id", brandId)

  if (error) return

  await createAuditLog({
    actorId: admin.id,
    action: "brand_status_changed",
    entityType: "brand",
    entityId: brandId,
    metadata: { from: currentStatus, to: newStatus },
  })

  revalidatePath("/admin/brands")
}

export async function deleteBrandAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()

  const brandId = formData.get("brandId") as string | null
  if (!brandId) return

  const productCount = await getBrandProductCount(brandId)
  if (productCount > 0) {
    redirect(`/admin/brands?error=has_products&count=${productCount}`)
  }

  const db = createServiceClient()
  const { error } = await db.from("brands").delete().eq("id", brandId)

  if (error) return

  await createAuditLog({
    actorId: admin.id,
    action: "brand_deleted",
    entityType: "brand",
    entityId: brandId,
    metadata: null,
  })

  revalidatePath("/admin/brands")
  redirect("/admin/brands")
}
