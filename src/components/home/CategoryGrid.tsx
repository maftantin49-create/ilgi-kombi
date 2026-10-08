import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { CAT_ICONS } from "@/components/layout/CategoryMegaMenu"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"

const LOCAL_THUMBS: Record<string, string> = {
  "akis-salterleri":    "/categories/thumbs/akis-salterleri-thumb.png",
  "akis-turbinleri":    "/categories/thumbs/akis-turbinleri-thumb.png",
  "dolum-musluklari":   "/categories/thumbs/dolum-musluklari-thumb.png",
  "elektronik-kartlar": "/categories/thumbs/elektronik-kartlar-thumb.png",
  "emniyet-ventilleri": "/categories/thumbs/emniyet-ventilleri-thumb.png",
  "esanjorler":         "/categories/thumbs/esanjorler-thumb.png",
  "fanlar":             "/categories/thumbs/fanlar-thumb.png",
  "gaz-valfleri":       "/categories/thumbs/gaz-valfleri-thumb.png",
  "genlesme-tanklari":  "/categories/thumbs/genlesme-tanklari-thumb.png",
  "manometreler":       "/categories/thumbs/manometreler-thumb.png",
  "orijinaller":        "/categories/thumbs/orijinaller-thumb.png",
  "pompalar":           "/categories/thumbs/pompalar-thumb.png",
  "prosestatlar":       "/categories/thumbs/prosestatlar-thumb.png",
  "sensorler":          "/categories/thumbs/sensorler-thumb.png",
  "tamir-takimlari":    "/categories/thumbs/tamir-takimlari-thumb.png",
  "uc-yollu-motorlar":  "/categories/thumbs/uc-yollu-motorlar-thumb.png",
  "uc-yollu-vanalar":   "/categories/thumbs/uc-yollu-vanalar-thumb.png",
}

interface Props {
  categories: StorefrontCategoryWithCount[]
}

export default function CategoryGrid({ categories }: Props) {
  if (categories.length === 0) return null

  return (
    <section
      className="bg-[#F8F9FA]"
      aria-label="Tüm parça grupları"
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-black text-gray-900">
            Tüm Parça Grupları
          </h2>
          <Link
            href="/kategoriler"
            className="flex items-center gap-1 text-[12px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Tüm Kategoriler <ChevronRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const imgSrc = cat.image_url ?? LOCAL_THUMBS[cat.slug] ?? null
            const FallbackIcon = CAT_ICONS[cat.slug]

            return (
              <Link
                key={cat.id}
                href={`/urunler?kategori=${cat.slug}`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl group transition-all duration-150 hover:shadow-sm"
                style={{ border: "1px solid #E2E6EA" }}
              >
                {/* Küçük kare görsel */}
                <div
                  className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center"
                  style={{ background: "#F4F4F4", border: "1px solid #EBEBEB" }}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  ) : FallbackIcon ? (
                    <FallbackIcon size={16} className="text-gray-500" aria-hidden="true" />
                  ) : (
                    <span className="text-gray-500 text-sm font-bold">
                      {cat.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Metin */}
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-semibold text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-1 leading-tight">
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {cat.productCount} ürün
                  </div>
                </div>

                <ChevronRight
                  size={12}
                  className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
