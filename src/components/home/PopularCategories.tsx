import Link from "next/link"
import Image from "next/image"
import {
  ChevronRight, Droplets, Thermometer, Cpu, Gauge, Flame,
  ShieldCheck, Package, ToggleLeft, Wind, Pipette, Activity,
  Wrench, Settings, GitBranch, Zap, Tag, type LucideIcon,
} from "lucide-react"
import { CAT_ICONS } from "@/components/layout/CategoryMegaMenu"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"

const DB_CAT_ICONS: Record<string, LucideIcon> = {
  "kombi-sirkulasyon-pompalari":               Droplets,
  "kombi-plaka-esanjorleri":                   Thermometer,
  "yogusmali-kombi-esanjorleri":               Thermometer,
  "kombi-anakart-ve-ekran-kartlari":           Cpu,
  "kombi-ntc-sensorleri":                      Gauge,
  "kombi-gaz-valfleri":                        Flame,
  "kombi-emniyet-ventilleri":                  ShieldCheck,
  "kombi-genlesme-tanklari":                   Package,
  "kombi-hava-akis-anahtarlari":               ToggleLeft,
  "kombi-su-akis-turbinleri":                  Wind,
  "kombi-turbin-okuyuculari":                  Wind,
  "kombi-su-doldurma-musluklari":              Pipette,
  "kombi-hava-akis-prosestatlari":             Activity,
  "kombi-su-basinc-siviclari":                 Gauge,
  "kombi-su-basinc-sivicleri":                 Gauge,
  "yogusmali-ve-hermatik-kombi-fan-motorlari": Wind,
  "kombi-3-yollu-tamir-takimlari":             Wrench,
  "kombi-3-yollu-vana-motorlari":              Settings,
  "kombi-uc-yollu-bloklar":                    GitBranch,
  "3-yollu-gruplar":                           GitBranch,
  "kombi-atesleme-trafolari":                  Zap,
  "kombi-elektrodlari":                        Zap,
  "kombi-dugmeleri":                           Wrench,
  "kombi-yedek-parca":                         Wrench,
}

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
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-5 pb-4 md:pt-8 md:pb-6">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
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

        {/* Tile Satırı — mobilde snap scroll, desktop wrap */}
        <div
          className="flex gap-3 md:gap-6 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" } as React.CSSProperties}
        >
          {display.map((cat) => {
            const imgSrc = cat.image_url ?? LOCAL_THUMBS[cat.slug] ?? null
            const FallbackIcon = DB_CAT_ICONS[cat.slug] ?? CAT_ICONS[cat.slug] ?? Tag

            return (
              <Link
                key={cat.id}
                href={`/urunler?kategori=${cat.slug}`}
                className="flex flex-col items-center gap-2 md:gap-3 shrink-0 group"
                style={{ width: "72px", scrollSnapAlign: "start" } as React.CSSProperties}
              >
                {/* Yuvarlak görsel alan */}
                <div
                  className="w-[58px] h-[58px] md:w-[72px] md:h-[72px] rounded-full overflow-hidden relative transition-all duration-200 group-hover:shadow-md"
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
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FallbackIcon size={24} className="text-gray-500" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Kategori adı */}
                <span className="text-[11px] md:text-[11.5px] font-medium text-gray-700 text-center leading-tight group-hover:text-gray-900 transition-colors line-clamp-2 w-full">
                  {cat.name}
                </span>
              </Link>
            )
          })}

          {/* Tümünü Gör tile */}
          <Link
            href="/kategoriler"
            className="flex flex-col items-center gap-2 md:gap-3 shrink-0 group"
            style={{ width: "72px", scrollSnapAlign: "start" } as React.CSSProperties}
          >
            <div
              className="w-[58px] h-[58px] md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center transition-all duration-200 group-hover:shadow-md"
              style={{
                background: "#F4F4F4",
                border: "2px dashed #D1D5DB",
              }}
            >
              <ChevronRight size={22} className="text-gray-400 group-hover:text-gray-700 transition-colors" aria-hidden="true" />
            </div>
            <span className="text-[11px] md:text-[11.5px] font-medium text-gray-500 text-center leading-tight group-hover:text-gray-700 transition-colors">
              Tümünü Gör
            </span>
          </Link>
        </div>

      </div>
    </section>
  )
}
