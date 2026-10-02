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
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {showViewAll && (
          <Link
            href="/kategoriler"
            className="text-sm font-medium flex items-center gap-1 text-blue-700 transition-colors hover:text-blue-900"
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
              className="group flex flex-col rounded-xl p-5 transition-all hover:-translate-y-0.5 border border-[#E2E6EA] hover:border-[#93C5FD] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              style={{ background: "#FFFFFF" }}
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] rounded-lg flex items-center justify-center mb-3 shrink-0 overflow-hidden"
                style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
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
                  <Icon size={20} aria-hidden="true" className="text-blue-600" />
                )}
              </div>
              <div className="font-semibold text-sm leading-snug transition-colors text-gray-700 group-hover:text-blue-700">
                {cat.name}
              </div>
              <div className="flex-1" />
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {cat.productCount > 0 ? `${cat.productCount}+ ürün` : "Ürünleri Gör"}
                </span>
                <ArrowRight size={13} aria-hidden="true" className="text-gray-400" />
              </div>
            </Link>
          )
        })}

        {/* CTA kartları sadece tam liste modunda gösterilir */}
        {!maxItems && <Link
          href="/parca-bul"
          className="group rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5 hover:opacity-90"
          style={{ background: "#1E3A8A" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <Search size={20} className="text-white" aria-hidden="true" />
          </div>
          <div className="font-semibold text-sm leading-snug text-white">
            Parça Bul
          </div>
          <div className="flex-1" />
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
            <span className="text-xs text-blue-200">Cihazıma göre ara</span>
            <ArrowRight size={13} className="text-blue-200" aria-hidden="true" />
          </div>
        </Link>}

        {!maxItems && <Link
          href="/markalar"
          className="group rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5 border border-[#E2E6EA] hover:border-[#93C5FD] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
          style={{ background: "#FFFFFF" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 shrink-0"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
          >
            <Tag size={20} className="text-blue-600" aria-hidden="true" />
          </div>
          <div className="font-semibold text-sm leading-snug transition-colors text-gray-700 group-hover:text-blue-700">
            Tüm Markalar
          </div>
          <div className="flex-1" />
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">Tüm markalar</span>
            <ArrowRight size={13} className="text-gray-400" aria-hidden="true" />
          </div>
        </Link>}
      </div>
    </section>
  )
}
