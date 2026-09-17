"use client"

import { deleteCategoryAction } from "@/lib/admin/categories.actions"

interface Props {
  categoryId: string
  name: string
}

export function DeleteCategoryButton({ categoryId, name }: Props) {
  return (
    <form action={deleteCategoryAction}>
      <input type="hidden" name="categoryId" value={categoryId} />
      <button
        type="submit"
        onClick={(e) => {
          if (
            !confirm(
              `"${name}" kategorisini silmek istediğinizden emin misiniz?\n\nAlt kategorisi veya ürünü olan kategori silinemez.\nBu işlem geri alınamaz.`
            )
          ) {
            e.preventDefault()
          }
        }}
        className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-75"
        style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
      >
        Sil
      </button>
    </form>
  )
}
