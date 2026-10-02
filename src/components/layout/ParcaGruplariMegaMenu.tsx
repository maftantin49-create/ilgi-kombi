"use client"

import Link from "next/link"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"
import type { StorefrontBrandWithCount } from "@/lib/storefront/brands"

interface Props {
  categories: StorefrontCategoryWithCount[]
  brands:     StorefrontBrandWithCount[]
  onClose:    () => void
  waLink?:    string | null
}

const QUICK_LINKS = [
  { href: "/urunler",                 label: "Tüm Ürünler"      },
  { href: "/urunler?sort=discounted", label: "Fırsat Ürünleri"  },
  { href: "/urunler?sort=featured",   label: "En Çok Satanlar"  },
  { href: "/urunler?sameDay=true",    label: "Aynı Gün Kargo"   },
]

export { QUICK_LINKS }

const WaIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function ParcaGruplariMegaMenu({ categories, brands, onClose, waLink }: Props) {
  const parentCategories = categories.filter(c => !c.parent_id).slice(0, 12)
  const activeBrands     = brands.filter(b => b.productCount > 0).slice(0, 8)

  return (
    <div
      className="bg-white border border-gray-200 rounded-b-xl shadow-xl overflow-hidden w-full"
      style={{ marginTop: "-1px" }}
    >
      <div className="grid grid-cols-4">

        {/* ── A: Parça Türleri ─────────────────────────────────────────── */}
        <div className="p-5 border-r border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">
            Parça Türleri
          </p>
          <div className="space-y-0.5">
            {parentCategories.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-gray-400">Henüz kategori yok</p>
            )}
            {parentCategories.map(cat => (
              <Link
                key={cat.id}
                href={`/urunler?kategori=${cat.slug}`}
                onClick={onClose}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {cat.name}
                {cat.productCount > 0 && (
                  <span className="ml-auto text-xs text-gray-400 shrink-0">{cat.productCount}</span>
                )}
              </Link>
            ))}
          </div>
          <Link
            href="/kategoriler"
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mt-2"
          >
            Tüm kategoriler →
          </Link>
        </div>

        {/* ── B: Markaya Göre ──────────────────────────────────────────── */}
        <div className="p-5 border-r border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">
            Markaya Göre
          </p>
          <div className="space-y-0.5">
            {activeBrands.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-gray-400">Henüz marka yok</p>
            )}
            {activeBrands.map(brand => (
              <Link
                key={brand.id}
                href={`/urunler?marka=${encodeURIComponent(brand.name)}`}
                onClick={onClose}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span>{brand.name}</span>
                <span className="text-xs text-gray-400 shrink-0">{brand.productCount}</span>
              </Link>
            ))}
          </div>
          <Link
            href="/markalar"
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors mt-2"
          >
            Tüm markalar →
          </Link>
        </div>

        {/* ── C: Hızlı Erişim ─────────────────────────────────────────── */}
        <div className="p-5 border-r border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">
            Hızlı Erişim
          </p>
          <div className="space-y-0.5">
            {QUICK_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── D: Yardım ───────────────────────────────────────────────── */}
        <div className="p-5 bg-[#F8FAFF]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">
            Yardım
          </p>
          <div className="px-2">
            <p className="text-sm font-semibold text-gray-800 mb-1.5 leading-snug">
              Parçayı bulamadınız mı?
            </p>
            <p className="text-[13px] text-gray-500 leading-snug mb-4">
              Uzman ekibimiz aradığınız parçayı bulmakta yardımcı olur.
            </p>
            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <WaIcon />
                WhatsApp&apos;tan Sor
              </a>
            ) : (
              <Link
                href="/iletisim"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                İletişime Geç →
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
