"use client"

import { useRef, useEffect } from "react"
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
  const scrollRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  const display = categories.slice(0, 12)
  // Duplicate items for seamless infinite loop
  const loopItems = [...display, ...display]

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let raf: number
    let lastT = 0
    const SPEED = 38 // px/sec

    const tick = (t: number) => {
      if (!pausedRef.current) {
        const dt = lastT ? (t - lastT) / 1000 : 0
        el.scrollLeft += SPEED * dt
        // When we've scrolled through the first copy, reset seamlessly
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2
        }
      }
      lastT = t
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const pause  = () => { pausedRef.current = true  }
    const resume = () => { pausedRef.current = false }

    el.addEventListener("mouseenter",  pause)
    el.addEventListener("mouseleave",  resume)
    el.addEventListener("touchstart",  pause,  { passive: true })
    el.addEventListener("touchend",    resume, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("mouseenter", pause)
      el.removeEventListener("mouseleave", resume)
      el.removeEventListener("touchstart", pause)
      el.removeEventListener("touchend",   resume)
    }
  }, [])

  if (categories.length === 0) return null

  return (
    <section
      className="bg-white"
      aria-label="Popüler kategoriler"
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-2 pb-3 md:pt-4 md:pb-4">

        {/* Başlık — "PARÇA GRUPLARI" eyebrow kaldırıldı */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-[15px] md:text-[17px] font-black text-gray-900 leading-tight">
            Popüler Kategoriler
          </h2>
          <Link
            href="/kategoriler"
            className="flex items-center gap-1 text-[12px] font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Tümü <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* Auto-scroll şeridi — items duplicate edildi, seamless loop */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-5 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {loopItems.map((cat, i) => {
            const imgSrc = cat.image_url ?? LOCAL_THUMBS[cat.slug] ?? null
            const FallbackIcon = DB_CAT_ICONS[cat.slug] ?? CAT_ICONS[cat.slug] ?? Tag
            const isDuplicate = i >= display.length

            return (
              <Link
                key={`${cat.id}-${i}`}
                href={`/urunler?kategori=${cat.slug}`}
                className="flex flex-col items-center gap-2 shrink-0 group"
                style={{ width: "68px" } as React.CSSProperties}
                aria-hidden={isDuplicate ? true : undefined}
                tabIndex={isDuplicate ? -1 : undefined}
              >
                {/* Yuvarlak görsel */}
                <div
                  className="w-[54px] h-[54px] md:w-[66px] md:h-[66px] rounded-full overflow-hidden relative transition-all duration-200 group-hover:shadow-md"
                  style={{
                    background: "#F4F4F4",
                    border: "2px solid #E8E8E8",
                  }}
                >
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={isDuplicate ? "" : cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <FallbackIcon size={22} className="text-gray-500" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Kategori adı */}
                <span className="text-[10.5px] md:text-[11px] font-medium text-gray-700 text-center leading-tight group-hover:text-gray-900 transition-colors line-clamp-2 w-full">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
