export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getCategoryById, getCategoriesFlat } from "@/lib/admin/categories"
import { updateCategoryAction } from "@/lib/admin/categories.actions"
import { CategoryForm } from "@/components/admin/categories/CategoryForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params
  const [category, allCategories] = await Promise.all([
    getCategoryById(id),
    getCategoriesFlat(),
  ])

  if (!category) notFound()

  const boundAction = updateCategoryAction.bind(null, category.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
          Kategori Düzenle
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
          {category.name}
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
          action={boundAction}
          mode="edit"
          initialData={category}
          allCategories={allCategories}
          editingId={category.id}
        />
      </div>
    </div>
  )
}
