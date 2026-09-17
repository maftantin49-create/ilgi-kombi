import { getBrandsForSelect, getCategoriesForSelect } from "@/lib/admin/products"
import { createProductAction } from "@/lib/admin/products.actions"
import ProductForm from "@/components/admin/products/ProductForm"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  // Pre-generate product ID server-side so uploaded images can be stored
  // under a stable path (products/{pendingProductId}/...) before the DB row exists.
  const pendingProductId = crypto.randomUUID()

  const [brands, categories] = await Promise.all([
    getBrandsForSelect(),
    getCategoriesForSelect(),
  ])

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: "#F4F4F2" }}>
          Yeni Ürün
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "#A5A5A5" }}>
          Tüm alanları doldurup ürünü kaydedin.
        </p>
      </div>

      <ProductForm
        action={createProductAction}
        mode="create"
        brands={brands}
        categories={categories}
        pendingProductId={pendingProductId}
      />
    </div>
  )
}
