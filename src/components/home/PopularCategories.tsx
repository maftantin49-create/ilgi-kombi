import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { CAT_ICONS } from "@/components/layout/CategoryMegaMenu"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"

const LOCAL_THUMBS: Record<string, string> = {
  // DB slugs → local thumb images
  "kombi-sirkulasyon-pompalari":          "/categories/thumbs/pompalar-thumb.png",
  "kombi-plaka-esanjorleri":              "/categories/thumbs/esanjorler-thumb.png",
  "yogusmali-kombi-esanjorleri":          "/categories/thumbs/esanjorler-thumb.png",
  "kombi-anakart-ve-ekran-kartlari":      "/categories/thumbs/elektronik-kartlar-thumb.png",
  "kombi-ntc-sensorleri":                 "/categories/thumbs/sensorler-thumb.png",
  "kombi-gaz-valfleri":                   "/categories/thumbs/gaz-valfleri-thumb.png",
  "kombi-emniyet-ventilleri":             "/categories/thumbs/emniyet-ventilleri-thumb.png",
  "kombi-genlesme-tanklari":              "/categories/thumbs/genlesme-tanklari-thumb.png",
  "kombi-hava-akis-anahtarlari":          "/categories/thumbs/akis-salterleri-thumb.png",
  "kombi-su-akis-turbinleri":             "/categories/thumbs/akis-turbinleri-thumb.png",
  "kombi-turbin-okuyuculari":             "/categories/thumbs/akis-turbinleri-thumb.png",
  "kombi-su-doldurma-musluklari":         "/categories/thumbs/dolum-musluklari-thumb.png",
  "kombi-hava-akis-prosestatlari":        "/categories/thumbs/prosestatlar-thumb.png",
  "kombi-su-basinc-siviclari":            "/categories/thumbs/manometreler-thumb.png",
  "kombi-su-basinc-sivicleri":            "/categories/thumbs/manometreler-thumb.png",
  "yogusmali-ve-hermatik-kombi-fan-motorlari": "/categories/thumbs/fanlar-thumb.png",
  "kombi-3-yollu-tamir-takimlari":        "/categories/thumbs/tamir-takimlari-thumb.png",
  "kombi-3-yollu-vana-motorlari":         "/categories/thumbs/uc-yollu-motorlar-thumb.png",
  "kombi-uc-yollu-bloklar":               "/categories/thumbs/uc-yollu-vanalar-thumb.png",
  "3-yollu-gruplar":                      "/categories/thumbs/uc-yollu-vanalar-thumb.png",
}

interface Props {
  categories: StorefrontCategoryWithCount[]
}

export default function PopularCategories({ categories }: Props) {
  if (categories.length === 0) return null

  const display = categories.slice(0, 12)

  return (
    <section
      className="bg-white"
      aria-label="Popüler kategoriler"
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-6">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-[4px] h-[4px] rounded-full bg-gray-900" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-500">
                Parça Grupları
              </span>
            </div>
            <h2 className="text-[20px] font-black text-gray-900 leading-tight">
              Popüler Kategoriler
            </h2>
          </div>
          <Link
            href="/kategoriler"
            className="flex items-center gap-1 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Tümü <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* Tile Satırı — mobilde native scroll, desktop wrap */}
        <div
          className="flex gap-5 md:gap-6 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {display.map((cat) => {
            const imgSrc = cat.image_url ?? LOCAL_THUMBS[cat.slug] ?? null
            const FallbackIcon = CAT_ICONS[cat.slug]

            return (
              <Link
                key={cat.id}
                href={`/urunler?kategori=${cat.slug}`}
                className="flex flex-col items-center gap-3 shrink-0 group"
                style={{ width: "88px" }}
              >
                {/* Yuvarlak görsel alan */}
                <div
                  className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-full overflow-hidden relative transition-all duration-200 group-hover:shadow-md"
                  style={{
                    background: "#F4F4F4",
                    border: "2px solid #E8E8E8",
                    outline: "2px solid transparent",
                  }}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  ) : FallbackIcon ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FallbackIcon size={28} className="text-gray-500" aria-hidden="true" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-500 text-xl font-black">
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Kategori adı */}
                <span className="text-[11.5px] font-medium text-gray-700 text-center leading-tight group-hover:text-gray-900 transition-colors line-clamp-2 w-full">
                  {cat.name}
                </span>
              </Link>
            )
          })}

          {/* Tümünü Gör tile */}
          <Link
            href="/kategoriler"
            className="flex flex-col items-center gap-3 shrink-0 group"
            style={{ width: "88px" }}
          >
            <div
              className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-full flex items-center justify-center transition-all duration-200 group-hover:shadow-md"
              style={{
                background: "#F4F4F4",
                border: "2px dashed #D1D5DB",
              }}
            >
              <ChevronRight size={22} className="text-gray-400 group-hover:text-gray-700 transition-colors" aria-hidden="true" />
            </div>
            <span className="text-[11.5px] font-medium text-gray-500 text-center leading-tight group-hover:text-gray-700 transition-colors">
              Tümünü Gör
            </span>
          </Link>
        </div>

      </div>
    </section>
  )
}
