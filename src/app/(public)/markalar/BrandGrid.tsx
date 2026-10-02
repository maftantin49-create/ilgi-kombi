"use client"

import Link from "next/link"
import type { StorefrontBrandWithCount } from "@/lib/storefront/brands"

interface Props {
  brands: StorefrontBrandWithCount[]
}

export default function BrandGrid({ brands }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {brands.map((brand) => {
        const initials = brand.name.slice(0, 2).toUpperCase()

        return (
          <Link
            key={brand.id}
            href={`/urunler?marka=${encodeURIComponent(brand.name)}`}
            className="group flex flex-col gap-4 p-5 transition-all duration-200 bg-white"
            style={{
              border: "1px solid #E2E6EA",
              borderRadius: "12px",
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "#93C5FD"
              ;(e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "#E2E6EA"
              ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
            }}
          >
            {/* Logo box */}
            <div
              className="w-11 h-11 flex items-center justify-center rounded-xl font-black text-sm text-blue-600"
              style={{
                background: "rgba(37,99,235,0.06)",
                border: "1px solid rgba(37,99,235,0.12)",
              }}
            >
              {initials}
            </div>

            {/* Brand name + count */}
            <div>
              <div className="font-semibold text-gray-900 text-[15px] group-hover:text-blue-700 transition-colors duration-150">
                {brand.name}
              </div>
              <div className="text-[12px] mt-0.5 text-gray-400">
                {brand.productCount > 0 ? `${brand.productCount} uyumlu ürün` : "Ürünleri incele"}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
