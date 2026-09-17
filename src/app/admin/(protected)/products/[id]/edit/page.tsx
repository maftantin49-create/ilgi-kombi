import { notFound } from "next/navigation"
import {
  getProductById,
  getBrandsForSelect,
  getCategoriesForSelect,
  getProductImages,
  getProductOemCodes,
  getProductSpecifications,
  getProductDevices,
} from "@/lib/admin/products"
import { updateProductAction } from "@/lib/admin/products.actions"
import ProductForm from "@/components/admin/products/ProductForm"

export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params

  const [product, brands, categories, gallery, oemCodes, specs, devices] =
    await Promise.all([
      getProductById(id),
      getBrandsForSelect(),
      getCategoriesForSelect(),
      getProductImages(id),
      getProductOemCodes(id),
      getProductSpecifications(id),
      getProductDevices(id),
    ])

  if (!product) notFound()

  const boundAction = updateProductAction.bind(null, product.id)

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: "#F4F4F2" }}>
          Ürün Düzenle
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "#A5A5A5" }}>
          <span style={{ color: "#D4A017" }}>{product.sku}</span> — {product.name}
        </p>
      </div>

      <ProductForm
        action={boundAction}
        mode="edit"
        brands={brands}
        categories={categories}
        initialData={product}
        pendingProductId={product.id}
        initialGallery={gallery}
        initialOemItems={oemCodes}
        initialSpecItems={specs}
        initialDeviceItems={devices}
      />
    </div>
  )
}
