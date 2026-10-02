"use client"

import Link from "next/link"
import {
  Droplets, Thermometer, Cpu, Wind,
  Gauge, Flame, GitBranch, Package,
  Activity, Wrench,
  Settings, ShieldCheck, Pipette, ToggleLeft,
  ChevronRight, Award,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"
import { wa } from "@/lib/whatsapp"

export const CAT_ICONS: Record<string, LucideIcon> = {
  pompalar:              Droplets,
  esanjorler:            Thermometer,
  "elektronik-kartlar":  Cpu,
  sensorler:             Gauge,
  "gaz-valfleri":        Flame,
  fanlar:                Wind,
  "uc-yollu-vanalar":    GitBranch,
  "genlesme-tanklari":   Package,
  orijinaller:           Award,
  prosestatlar:          Activity,
  "tamir-takimlari":     Wrench,
  "uc-yollu-motorlar":   Settings,
  "akis-turbinleri":     Wind,
  "akis-salterleri":     ToggleLeft,
  "emniyet-ventilleri":  ShieldCheck,
  "dolum-musluklari":    Pipette,
  manometreler:          Gauge,
}


const WaIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

interface Props {
  onClose: () => void
  categories: StorefrontCategoryWithCount[]
}

export default function CategoryMegaMenu({ onClose, categories }: Props) {
  return (
    <div
      id="mega-menu"
      role="menu"
      aria-label="Kombi kategorileri"
      className="absolute top-full left-0 z-50 w-[280px] overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E6EA",
        borderTop: "none",
        borderRadius: "0 0 12px 12px",
        boxShadow: "0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3"
        style={{ borderBottom: "1px solid #E2E6EA", background: "#F8F9FA" }}
      >
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
          Kombi Yedek Parça Kategorileri
        </span>
      </div>

      {/* Category list */}
      <ul className="max-h-[calc(100vh-220px)] overflow-y-auto overscroll-contain">
        {categories.length === 0 ? (
          <li className="px-5 py-4 text-[13px] text-gray-400">
            Henüz kategori eklenmedi.
          </li>
        ) : categories.map(cat => {
          const CatIcon = CAT_ICONS[cat.slug] ?? Flame
          return (
            <li key={cat.id} style={{ borderLeft: "2px solid transparent" }} className="group/item hover:[border-left-color:#93C5FD]">
              <Link
                href={`/urunler?kategori=${cat.slug}`}
                onClick={onClose}
                role="menuitem"
                className="flex items-center gap-3.5 w-full px-5 py-3 text-[14px] text-gray-600 hover:bg-[#F8F9FA] hover:text-blue-700 transition-all duration-100 group focus-visible:outline-none focus-visible:bg-[#F8F9FA] focus-visible:text-blue-700"
              >
                <CatIcon
                  size={15}
                  className="text-gray-400 group-hover:text-blue-600 shrink-0 transition-colors"
                  aria-hidden="true"
                />
                <span className="flex-1">{cat.name}</span>
                <ChevronRight
                  size={13}
                  className="text-gray-300 group-hover:text-blue-400 transition-colors"
                  aria-hidden="true"
                />
              </Link>
            </li>
          )
        })}
      </ul>

      {/* Footer: Tüm Kategoriler */}
      <div className="px-5 py-3" style={{ borderTop: "1px solid #E2E6EA" }}>
        <Link
          href="/kategoriler"
          onClick={onClose}
          className="flex items-center gap-1.5 text-[14px] font-semibold text-blue-700 hover:text-blue-900 hover:underline transition-colors"
        >
          Tüm Kategorileri Gör
          <ChevronRight size={13} aria-hidden="true" />
        </Link>
      </div>

      {/* Footer: WhatsApp */}
      <div
        className="px-5 py-3"
        style={{ borderTop: "1px solid #E2E6EA", background: "#F8F9FA" }}
      >
        <a
          href={wa.home ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="flex items-center gap-2 text-[14px] font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <WaIcon />
          WhatsApp&apos;tan Sorun
        </a>
      </div>
    </div>
  )
}
