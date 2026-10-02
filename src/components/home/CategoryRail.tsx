"use client"

import Link from "next/link"
import { Wrench, ChevronRight } from "lucide-react"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"

interface Props {
  categories: StorefrontCategoryWithCount[]
}

export default function CategoryRail({ categories }: Props) {
  if (categories.length === 0) return null

  return (
    <section
      aria-label="Kategori hızlı erişim"
      className="bg-white"
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/urunler?kategori=${cat.slug}`}
              className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border border-[#E2E6EA] hover:border-[#93C5FD] hover:shadow-sm transition-all duration-150 whitespace-nowrap shrink-0 group"
            >
              <div className="w-7 h-7 rounded-md bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Wrench size={13} className="text-[#2563EB]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-gray-800 leading-tight group-hover:text-blue-700 transition-colors">
                  {cat.name}
                </div>
                <div className="text-[11px] text-gray-400 leading-tight">
                  {cat.productCount} ürün
                </div>
              </div>
            </Link>
          ))}

          <Link
            href="/kategoriler"
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors whitespace-nowrap shrink-0 ml-1"
          >
            Tümü <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
