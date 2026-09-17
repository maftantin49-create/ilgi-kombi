import Link from "next/link"
import Image from "next/image"
import {
  Droplets, Thermometer, Cpu, Gauge, Flame, Wind,
  GitBranch, Package, Settings, ShieldCheck,
  Pipette, ToggleLeft, ArrowRight, Search, Tag, Award,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getStorefrontCategories } from "@/lib/storefront/categories"

const ICONS: Record<string, LucideIcon> = {
  pompalar:              Droplets,
  esanjorler:            Thermometer,
  "elektronik-kartlar":  Cpu,
  sensorler:             Gauge,
  "gaz-valfleri":        Flame,
  fanlar:                Wind,
  "uc-yollu-vanalar":    GitBranch,
  "genlesme-tanklari":   Package,
  orijinaller:           Award,
  "uc-yollu-motorlar":   Settings,
  "akis-turbinleri":     Wind,
  "akis-salterleri":     ToggleLeft,
  "emniyet-ventilleri":  ShieldCheck,
  "dolum-musluklari":    Pipette,
  manometreler:          Gauge,
}

interface CategorySectionProps {
  maxItems?: number
  title?: string
  showViewAll?: boolean
}

export default async function CategorySection({
  maxItems,
  title = "Popüler Kategoriler",
  showViewAll = true,
}: CategorySectionProps) {
  const allCats = await getStorefrontCategories()

  const displayCats = maxItems
    ? allCats.filter((c) => c.is_featured).slice(0, maxItems)
    : allCats

  if (displayCats.length === 0) {
    return null
  }

  const gridCols = maxItems
    ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
    : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"

  return (
    <section className="max-w-7xl mx-auto px-4 py-10" aria-label={title}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: "#F4F4F2" }}>{title}</h2>
        {showViewAll && (
          <Link
            href="/kategoriler"
            className="text-sm font-medium flex items-center gap-1 transition-colors hover:text-[#F2C94C]"
            style={{ color: "#D4A017" }}
          >
            Tümü <ArrowRight size={15} aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className={gridCols}>
        {displayCats.map((cat) => {
          const Icon = ICONS[cat.slug] ?? Flame
          return (
            <Link
              key={cat.id}
              href={`/urunler?kategori=${cat.slug}`}
              className="group flex flex-col rounded-xl p-5 transition-all hover:-translate-y-0.5 border border-[rgba(255,196,0,0.10)] hover:border-[rgba(255,196,0,0.35)] hover:shadow-[0_4px_20px_rgba(212,160,23,0.10)]"
              style={{ background: "#151618" }}
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] rounded-lg flex items-center justify-center mb-3 shrink-0 overflow-hidden"
                style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.14)" }}
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={`${cat.name} ürün görseli`}
                    width={72}
                    height={72}
                    className="w-full h-full object-cover object-center transition-transform duration-[250ms] ease-in-out group-hover:scale-105"
                  />
                ) : (
                  <Icon size={20} aria-hidden="true" style={{ color: "#D4A017" }} />
                )}
              </div>
              <div
                className="font-semibold text-sm leading-snug transition-colors group-hover:text-[#D4A017]"
                style={{ color: "#C0C0BA" }}
              >
                {cat.name}
              </div>
              <div className="flex-1" />
              <div
                className="flex items-center justify-between mt-3 pt-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-xs" style={{ color: "#555550" }}>
                  {cat.productCount > 0 ? `${cat.productCount}+ ürün` : "Ürünleri Gör"}
                </span>
                <ArrowRight size={13} aria-hidden="true" style={{ color: "#555550" }} />
              </div>
            </Link>
          )
        })}

        {/* CTA kartları sadece tam liste modunda gösterilir */}
        {!maxItems && <Link
          href="/parca-bul"
          className="group rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5 hover:opacity-90"
          style={{ background: "#D4A017" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 shrink-0"
            style={{ background: "rgba(9,10,12,0.20)" }}
          >
            <Search size={20} style={{ color: "#090A0C" }} aria-hidden="true" />
          </div>
          <div className="font-semibold text-sm leading-snug" style={{ color: "#090A0C" }}>
            Parça Bul
          </div>
          <div className="flex-1" />
          <div
            className="flex items-center justify-between mt-3 pt-2"
            style={{ borderTop: "1px solid rgba(9,10,12,0.18)" }}
          >
            <span className="text-xs" style={{ color: "rgba(9,10,12,0.65)" }}>Cihazıma göre ara</span>
            <ArrowRight size={13} style={{ color: "rgba(9,10,12,0.65)" }} aria-hidden="true" />
          </div>
        </Link>}

        {!maxItems && <Link
          href="/markalar"
          className="group rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5 border border-[rgba(255,196,0,0.14)] hover:border-[rgba(255,196,0,0.40)] hover:shadow-[0_4px_20px_rgba(212,160,23,0.10)]"
          style={{ background: "#151618" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 shrink-0"
            style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.18)" }}
          >
            <Tag size={20} style={{ color: "#D4A017" }} aria-hidden="true" />
          </div>
          <div className="font-semibold text-sm leading-snug transition-colors group-hover:text-[#D4A017]" style={{ color: "#C0C0BA" }}>
            Tüm Markalar
          </div>
          <div className="flex-1" />
          <div
            className="flex items-center justify-between mt-3 pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span className="text-xs" style={{ color: "#555550" }}>Tüm markalar</span>
            <ArrowRight size={13} style={{ color: "#555550" }} aria-hidden="true" />
          </div>
        </Link>}
      </div>
    </section>
  )
}
