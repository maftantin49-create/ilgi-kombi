export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { getBrandById } from "@/lib/admin/brands"
import { updateBrandAction } from "@/lib/admin/brands.actions"
import { BrandForm } from "@/components/admin/brands/BrandForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params
  const brand = await getBrandById(id)

  if (!brand) notFound()

  const boundAction = updateBrandAction.bind(null, brand.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
          Marka Düzenle
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
          {brand.name}
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <BrandForm action={boundAction} mode="edit" initialData={brand} />
      </div>
    </div>
  )
}
