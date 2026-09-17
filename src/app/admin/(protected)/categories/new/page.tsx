export const dynamic = "force-dynamic"

import { getCategoriesFlat } from "@/lib/admin/categories"
import { createCategoryAction } from "@/lib/admin/categories.actions"
import { CategoryForm } from "@/components/admin/categories/CategoryForm"

export default async function NewCategoryPage() {
  const allCategories = await getCategoriesFlat()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
          Yeni Kategori
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
          İsteğe bağlı olarak bir üst kategori seçebilirsiniz.
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <CategoryForm
          action={createCategoryAction}
          mode="create"
          allCategories={allCategories}
        />
      </div>
    </div>
  )
}
