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
        background: "#151618",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "1/1", background: "rgba(212,160,23,0.04)" }}
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
            <span className="text-2xl font-bold" style={{ color: "rgba(212,160,23,0.25)" }}>
              {cat.name.charAt(0)}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[inherit]"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,196,0,0.35)" }}
          aria-hidden="true"
        />
      </div>

      <div
        className="px-3 py-2 text-[12px] font-semibold leading-snug transition-colors group-hover:text-[#D4A017] truncate"
        style={{ color: "#C0C0BA" }}
      >
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
        background: "#0D0E11",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-5">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] font-bold tracking-[0.18em] uppercase"
            style={{ color: "#555550" }}
          >
            Kategoriler
          </span>
          <Link
            href="/kategoriler"
            className="text-[11px] font-medium flex items-center gap-0.5 transition-colors hover:text-[#F2C94C]"
            style={{ color: "#D4A017" }}
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
