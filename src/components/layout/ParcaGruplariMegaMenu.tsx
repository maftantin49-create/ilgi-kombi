"use client"

import Link from "next/link"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"
import type { StorefrontBrandWithCount } from "@/lib/storefront/brands"

interface Props {
  categories: StorefrontCategoryWithCount[]
  brands:     StorefrontBrandWithCount[]
  onClose:    () => void
}

const QUICK_LINKS = [
  { href: "/urunler",                 label: "Tüm Ürünler"      },
  { href: "/urunler?sort=discounted", label: "Fırsat Ürünleri"  },
  { href: "/urunler?sort=featured",   label: "En Çok Satanlar"  },
  { href: "/urunler?sameDay=true",    label: "Aynı Gün Kargo"   },
]

export { QUICK_LINKS }

export default function ParcaGruplariMegaMenu({ categories, brands, onClose }: Props) {
  const parentCategories = categories.filter(c => !c.parent_id).slice(0, 12)
  const activeBrands     = brands.filter(b => b.productCount > 0).slice(0, 8)

  return (
    <div
      className="bg-white border border-gray-200 rounded-b-xl shadow-xl overflow-hidden w-full"
      style={{ marginTop: "-1px" }}
    >
      <div className="grid grid-cols-3">

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
        <div className="p-5">
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

      </div>
    </div>
  )
}
