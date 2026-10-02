"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import HoverScrollRail from "@/components/home/HoverScrollRail"
import type { StorefrontCategoryWithCount } from "@/lib/storefront/categories"

const CARD_WIDTH_CLASS = "w-[180px] xl:w-[190px]"

function CategoryCard({
  cat,
  ariaHidden,
}: {
  cat: StorefrontCategoryWithCount
  ariaHidden?: boolean
}) {
  return (
    <Link
      href={`/urunler?kategori=${cat.slug}`}
      aria-hidden={ariaHidden || undefined}
      tabIndex={ariaHidden ? -1 : undefined}
      className={`${CARD_WIDTH_CLASS} shrink-0 group flex flex-col rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5`}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E6EA",
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "1/1", background: "#F8F9FA" }}
      >
        {cat.image_url ? (
          <Image
            src={cat.image_url}
            alt={`${cat.name} kategori görseli`}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="190px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-200">
              {cat.name.charAt(0)}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[inherit]"
          style={{ boxShadow: "inset 0 0 0 2px #93C5FD" }}
          aria-hidden="true"
        />
      </div>

      <div className="px-3 py-2 text-[12px] font-semibold leading-snug transition-colors text-gray-700 group-hover:text-blue-700 truncate">
        {cat.name}
      </div>
    </Link>
  )
}

interface Props {
  categories: StorefrontCategoryWithCount[]
}

export default function CategoryRail({ categories }: Props) {
  if (categories.length === 0) return null

  return (
    <section
      aria-label="Kategori hızlı erişim"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E2E6EA",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400">
            Kategoriler
          </span>
          <Link
            href="/kategoriler"
            className="text-[11px] font-medium flex items-center gap-0.5 text-blue-700 transition-colors hover:text-blue-900"
          >
            Tümü <ChevronRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile: native overflow scroll */}
        <div
          className="md:hidden flex gap-3 overflow-x-auto pb-1"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          } as React.CSSProperties}
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
        </div>

        {/* Desktop: hover-triggered auto-scroll */}
        <HoverScrollRail
          className="hidden md:flex gap-4"
          aria-label="Kategori vitrini, üzerine gelin"
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} />
          ))}
          {/* Klon — seamless loop; ekran okuyuculardan gizli */}
          {categories.map((cat) => (
            <CategoryCard key={`${cat.id}-c`} cat={cat} ariaHidden />
          ))}
        </HoverScrollRail>
      </div>
    </section>
  )
}
