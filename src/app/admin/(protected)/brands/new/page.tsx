export const dynamic = "force-dynamic"

import { createBrandAction } from "@/lib/admin/brands.actions"
import { BrandForm } from "@/components/admin/brands/BrandForm"

export default async function NewBrandPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "#F4F4F2" }}>
          Yeni Marka
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "#A5A5A5" }}>
          Ürünlere atanacak yeni bir marka tanımlayın.
        </p>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <BrandForm action={createBrandAction} mode="create" />
      </div>
    </div>
  )
}
