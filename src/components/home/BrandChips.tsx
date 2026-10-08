"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp } from "lucide-react"

const MOBILE_INITIAL = 10

interface Props {
  brands: string[]
}

export default function BrandChips({ brands }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (brands.length === 0) return null

  const hasMore = brands.length > MOBILE_INITIAL
  const display = expanded ? brands : brands.slice(0, MOBILE_INITIAL)

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {display.map((brand) => (
          <Link
            key={brand}
            href={`/urunler?marka=${encodeURIComponent(brand)}`}
            className="px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-150 hover:-translate-y-0.5 text-gray-600 hover:text-blue-700 hover:border-blue-300 bg-white border border-[#E2E6EA]"
          >
            {brand}
          </Link>
        ))}

        {/* Desktop: show all hidden brands inline */}
        {!expanded && brands.slice(MOBILE_INITIAL).map((brand) => (
          <Link
            key={brand}
            href={`/urunler?marka=${encodeURIComponent(brand)}`}
            className="hidden md:inline-flex px-3 py-1.5 text-[12px] font-medium rounded-lg transition-all duration-150 hover:-translate-y-0.5 text-gray-600 hover:text-blue-700 hover:border-blue-300 bg-white border border-[#E2E6EA]"
          >
            {brand}
          </Link>
        ))}
      </div>

      {/* Mobile expand/collapse toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="md:hidden mt-2 flex items-center gap-1 text-[12px] font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={13} aria-hidden="true" /> Daha az göster
            </>
          ) : (
            <>
              <ChevronDown size={13} aria-hidden="true" /> {brands.length - MOBILE_INITIAL} marka daha
            </>
          )}
        </button>
      )}
    </>
  )
}
