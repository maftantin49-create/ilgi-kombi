"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import StorefrontProductCardComponent from "@/components/product/StorefrontProductCard"
import HoverScrollRail from "@/components/home/HoverScrollRail"
import type { StorefrontProductCard } from "@/lib/storefront/types"

const CARD_WIDTH_CLASS = "w-[178px] xl:w-[188px]"

interface Props {
  title: string
  eyebrow?: string
  description?: string
  products: StorefrontProductCard[]
  viewAllHref: string
  viewAllLabel?: string
  /** @deprecated Carousel'de tüm ürünler gösterilir; bu prop artık kullanılmıyor. */
  maxDesktop?: number
}

export default function ProductSection({
  title,
  eyebrow,
  description,
  products,
  viewAllHref,
  viewAllLabel = "Tümünü Gör",
}: Props) {
  if (products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-8 lg:py-10" aria-label={title}>

      {/* ── Başlık + Tümünü Gör ─────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-4 lg:mb-6">
        <div>
          {eyebrow && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-[4px] h-[4px] rounded-full shrink-0 bg-blue-600"
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold tracking-[0.26em] uppercase text-blue-600">
                {eyebrow}
              </span>
            </div>
          )}
          <h2
            className="font-black leading-[1.1] text-gray-900"
            style={{ fontSize: "clamp(17px, 1.8vw, 23px)" }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-[13px] mt-1.5 leading-relaxed text-gray-500">
              {description}
            </p>
          )}
        </div>

        <Link
          href={viewAllHref}
          className="group/link flex items-center gap-1 text-[12px] font-bold tracking-[0.07em] uppercase shrink-0 text-blue-700 transition-colors duration-150 hover:text-blue-900"
        >
          {viewAllLabel}
          <ChevronRight
            size={13}
            className="transition-transform duration-150 group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      {/* ── Mobile: native yatay scroll ─────────────────────────────────── */}
      <div
        className="md:hidden flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {products.map((p) => (
          <div key={p.id} className="w-[145px] shrink-0">
            <StorefrontProductCardComponent product={p} />
          </div>
        ))}
      </div>

      {/* ── Desktop: manuel yatay scroll ────────────────────────────────── */}
      <HoverScrollRail
        className="hidden md:flex gap-4"
        aria-label={`${title} ürün listesi`}
        autoScroll={false}
      >
        {products.map((p) => (
          <div key={p.id} className={`${CARD_WIDTH_CLASS} shrink-0`}>
            <StorefrontProductCardComponent product={p} />
          </div>
        ))}
      </HoverScrollRail>

    </section>
  )
}
