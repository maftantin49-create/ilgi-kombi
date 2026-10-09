"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChevronRight, ChevronDown,
  Droplets, Thermometer, Cpu, Gauge, Flame,
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

const MOBILE_INITIAL = 8

interface Props {
  categories: StorefrontCategoryWithCount[]
}

export default function CategoryGrid({ categories }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (categories.length === 0) return null

  const hasMore = categories.length > MOBILE_INITIAL

  return (
    <section
      className="bg-[#F8F9FA]"
      aria-label="Tüm parça grupları"
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-5 lg:py-6">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <h2 className="text-[15px] md:text-[17px] font-black text-gray-900">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {categories.map((cat, index) => {
            const imgSrc = cat.image_url ?? LOCAL_THUMBS[cat.slug] ?? null
            const FallbackIcon = DB_CAT_ICONS[cat.slug] ?? CAT_ICONS[cat.slug] ?? Tag
            const hiddenOnMobile = index >= MOBILE_INITIAL && !expanded

            return (
              <Link
                key={cat.id}
                href={`/urunler?kategori=${cat.slug}`}
                className={`flex items-center gap-2.5 p-2.5 bg-white rounded-xl group transition-all duration-150 hover:shadow-sm ${hiddenOnMobile ? "hidden md:flex" : "flex"}`}
                style={{ border: "1px solid #E2E6EA" }}
              >
                {/* Küçük kare görsel */}
                <div
                  className="w-8 h-8 rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center"
                  style={{ background: "#F4F4F4", border: "1px solid #EBEBEB" }}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <FallbackIcon size={14} className="text-gray-500" aria-hidden="true" />
                  )}
                </div>

                {/* Metin */}
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-1 leading-tight">
                    {cat.name}
                  </div>
                  <div className="text-[10.5px] text-gray-400 mt-0.5">
                    {cat.productCount} ürün
                  </div>
                </div>

                <ChevronRight
                  size={11}
                  className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
                  aria-hidden="true"
                />
              </Link>
            )
          })}
        </div>

        {/* Mobil expand butonu */}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="md:hidden mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-blue-700 transition-colors hover:bg-blue-50"
            style={{ border: "1px solid rgba(37,99,235,0.20)" }}
          >
            <ChevronDown size={14} aria-hidden="true" />
            {categories.length - MOBILE_INITIAL} kategori daha gör
          </button>
        )}

      </div>
    </section>
  )
}
