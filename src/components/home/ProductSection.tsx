"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import StorefrontProductCardComponent from "@/components/product/StorefrontProductCard"
import HoverScrollRail from "@/components/home/HoverScrollRail"
import type { StorefrontProductCard } from "@/lib/storefront/types"

// Desktop kart genişliği — HoverScrollRail ile hizalı.
// Tailwind arbitrary value olarak tutulur; değiştirmek için yalnız bu sabit.
const CARD_WIDTH_CLASS = "w-[210px] xl:w-[220px]"

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
    <section className="max-w-7xl mx-auto px-4 py-10 lg:py-12" aria-label={title}>

      {/* ── Başlık + Tümünü Gör ─────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-6 lg:mb-8">
        <div>
          {eyebrow && (
            <div className="flex items-center gap-2 mb-2.5">
              <span
                className="w-[4px] h-[4px] rounded-full shrink-0"
                style={{ background: "#D4A017", boxShadow: "0 0 5px rgba(212,160,23,0.70)" }}
                aria-hidden="true"
              />
              <span
                className="text-[10px] font-bold tracking-[0.26em] uppercase"
                style={{ color: "#D4A017" }}
              >
                {eyebrow}
              </span>
            </div>
          )}
          <h2
            className="font-black leading-[1.1]"
            style={{ color: "#F4F4F2", fontSize: "clamp(20px, 2.2vw, 28px)" }}
          >
            {title}
          </h2>
          {description && (
            <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "#666660" }}>
              {description}
            </p>
          )}
        </div>

        <Link
          href={viewAllHref}
          className="group/link flex items-center gap-1 text-[12px] font-bold tracking-[0.07em] uppercase shrink-0 transition-colors duration-150 hover:text-[#F2C94C]"
          style={{ color: "#D4A017" }}
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
          <div key={p.id} className="w-[160px] shrink-0">
            <StorefrontProductCardComponent product={p} />
          </div>
        ))}
      </div>

      {/* ── Desktop: manuel yatay scroll (auto-scroll yok) ─────────────── */}
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
