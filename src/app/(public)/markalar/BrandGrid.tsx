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
            className="group flex flex-col gap-4 p-5 transition-all duration-200"
            style={{
              background: "#151618",
              border: "1px solid rgba(255,196,0,0.14)",
              borderRadius: "20px",
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,196,0,0.50)"
              ;(e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(212,160,23,0.12)"
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "rgba(255,196,0,0.14)"
              ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
              ;(e.currentTarget as HTMLElement).style.boxShadow = "none"
            }}
          >
            {/* Logo box */}
            <div
              className="w-11 h-11 flex items-center justify-center rounded-xl font-black text-sm"
              style={{
                background: "#181818",
                border: "1px solid rgba(255,196,0,0.18)",
                color: "#D4A017",
              }}
            >
              {initials}
            </div>

            {/* Brand name + count */}
            <div>
              <div className="font-semibold text-white text-[15px] group-hover:text-[#D4A017] transition-colors duration-150">
                {brand.name}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: "#A6A6A6" }}>
                {brand.productCount > 0 ? `${brand.productCount} uyumlu ürün` : "Ürünleri incele"}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
