"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { createServiceClient } from "@/lib/supabase/server"
import { createAuditLog } from "@/lib/admin/audit"
import { categorySchema, type ActionState } from "@/lib/admin/schemas/category"
import {
  getCategoryProductCount,
  getCategoryChildCount,
} from "@/lib/admin/categories"
import type { Database } from "@/types/database.types"
import { m } from "@/lib/admin/_utils"

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"]
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"]

function parseFormFields(formData: FormData) {
  return {
    name:        formData.get("name"),
    slug:        formData.get("slug"),
    parent_id:   formData.get("parent_id"),
    sort_order:  formData.get("sort_order"),
    is_active:   formData.get("is_active"),
    is_featured: formData.get("is_featured"),
    image_url:   formData.get("image_url"),
    description: formData.get("description"),
  }
}

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  const parsed = categorySchema.safeParse(parseFormFields(formData))

  if (!parsed.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const insertData: CategoryInsert = {
    name:        parsed.data.name,
    slug:        parsed.data.slug,
    parent_id:   parsed.data.parent_id ?? null,
    sort_order:  parsed.data.sort_order,
    is_active:   parsed.data.is_active,
    is_featured: parsed.data.is_featured,
    image_url:   parsed.data.image_url ?? null,
    description: parsed.data.description ?? null,
  }

  const db = createServiceClient()
  const { data: category, error } = await db
    .from("categories")
    .insert(m(insertData))
    .select("id")
    .single()

  const newCategory = category as { id: string } | null

  if (error) {
    if (error.code === "23505") {
      const fieldErrors: ActionState["fieldErrors"] = {}
      if (error.message.includes("categories_slug_key")) {
        fieldErrors.slug = ["Bu slug zaten kullanılıyor."]
      } else if (error.message.includes("categories_name_key")) {
        fieldErrors.name = ["Bu kategori adı zaten kullanılıyor."]
      }
      return {
        success: false,
        message: "Bu değerler zaten kullanımda.",
        fieldErrors,
      }
    }
    return { success: false, message: "Kategori oluşturulurken bir hata oluştu." }
  }

  await createAuditLog({
    actorId: admin.id,
    action: "category_created",
    entityType: "category",
    entityId: newCategory?.id,
    metadata: { name: parsed.data.name, slug: parsed.data.slug },
  })

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin()

  const parsed = categorySchema.safeParse(parseFormFields(formData))

  if (!parsed.success) {
    return {
      success: false,
      message: "Form verileri geçersiz. Lütfen hataları düzeltin.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  // Prevent self-referential parent
  if (parsed.data.parent_id === categoryId) {
    return {
      success: false,
      message: "Bir kategori kendisinin üst kategorisi olamaz.",
      fieldErrors: { parent_id: ["Geçersiz üst kategori seçimi."] },
    }
  }

  const updateData: CategoryUpdate = {
    name:        parsed.data.name,
    slug:        parsed.data.slug,
    parent_id:   parsed.data.parent_id ?? null,
    sort_order:  parsed.data.sort_order,
    is_active:   parsed.data.is_active,
    is_featured: parsed.data.is_featured,
    image_url:   parsed.data.image_url ?? null,
    description: parsed.data.description ?? null,
  }

  const db = createServiceClient()
  const { error } = await db
    .from("categories")
    .update(m(updateData))
    .eq("id", categoryId)

  if (error) {
    if (error.code === "23505") {
      const fieldErrors: ActionState["fieldErrors"] = {}
      if (error.message.includes("categories_slug_key")) {
        fieldErrors.slug = ["Bu slug başka bir kategoride kullanılıyor."]
      } else if (error.message.includes("categories_name_key")) {
        fieldErrors.name = ["Bu kategori adı başka bir kategoride kullanılıyor."]
      }
      return {
        success: false,
        message: "Bu değerler zaten kullanımda.",
        fieldErrors,
      }
    }
    return { success: false, message: "Kategori güncellenirken bir hata oluştu." }
  }

  await createAuditLog({
    actorId: admin.id,
    action: "category_updated",
    entityType: "category",
    entityId: categoryId,
    metadata: { name: parsed.data.name },
  })

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function toggleCategoryStatus(formData: FormData): Promise<void> {
  const admin = await requireAdmin()

  const categoryId = formData.get("categoryId") as string | null
  const currentStatus = formData.get("currentStatus") === "true"

  if (!categoryId) return

  const newStatus = !currentStatus
  const db = createServiceClient()
  const { error } = await db
    .from("categories")
    .update(m<CategoryUpdate>({ is_active: newStatus }))
    .eq("id", categoryId)

  if (error) return

  await createAuditLog({
    actorId: admin.id,
    action: "category_status_changed",
    entityType: "category",
    entityId: categoryId,
    metadata: { from: currentStatus, to: newStatus },
  })

  revalidatePath("/admin/categories")
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin()

  const categoryId = formData.get("categoryId") as string | null
  if (!categoryId) return

  const [childCount, productCount] = await Promise.all([
    getCategoryChildCount(categoryId),
    getCategoryProductCount(categoryId),
  ])

  if (childCount > 0) {
    redirect(`/admin/categories?error=has_children&count=${childCount}`)
  }

  if (productCount > 0) {
    redirect(`/admin/categories?error=has_products&count=${productCount}`)
  }

  const db = createServiceClient()
  const { error } = await db.from("categories").delete().eq("id", categoryId)

  if (error) return

  await createAuditLog({
    actorId: admin.id,
    action: "category_deleted",
    entityType: "category",
    entityId: categoryId,
    metadata: null,
  })

  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}
