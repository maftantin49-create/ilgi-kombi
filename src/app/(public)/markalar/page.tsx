import { getStorefrontBrands } from "@/lib/storefront/brands"
import BrandGrid from "./BrandGrid"

export const metadata = {
  title: "Markalar",
  description: "Baymak, Vaillant, Ferroli, Ariston ve daha fazlası. Cihaz markanıza uygun orijinal yedek parçaları inceleyin.",
}

export default async function MarkalarPage() {
  const brands = await getStorefrontBrands()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 bg-white min-h-screen">

      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-[5px] h-[5px] rounded-full shrink-0 bg-blue-600"
            aria-hidden="true"
          />
          <span className="text-[10px] font-bold tracking-[0.26em] uppercase text-blue-600">
            Uyumlu Cihaz Markaları
          </span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Markalar</h1>
        <p className="text-[15px] text-gray-500">
          Cihazınızın markasını seçerek uyumlu orijinal parçaları görüntüleyin.
        </p>
      </div>

      <BrandGrid brands={brands} />
    </div>
  )
}
