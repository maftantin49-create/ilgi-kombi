import { getStorefrontBrands } from "@/lib/storefront/brands"
import BrandGrid from "./BrandGrid"

export const metadata = {
  title: "Markalar",
  description: "Baymak, Vaillant, Ferroli, Ariston ve daha fazlası. Cihaz markanıza uygun orijinal yedek parçaları inceleyin.",
}

export default async function MarkalarPage() {
  const brands = await getStorefrontBrands()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-[5px] h-[5px] rounded-full shrink-0"
            style={{ background: "#D4A017", boxShadow: "0 0 6px rgba(212,165,52,0.70)" }}
            aria-hidden="true"
          />
          <span
            className="text-[10px] font-bold tracking-[0.26em] uppercase"
            style={{ color: "#D4A017" }}
          >
            Uyumlu Cihaz Markaları
          </span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Markalar</h1>
        <p style={{ color: "#A0A0A0" }} className="text-[15px]">
          Cihazınızın markasını seçerek uyumlu orijinal parçaları görüntüleyin.
        </p>
      </div>

      <BrandGrid brands={brands} />
    </div>
  )
}
