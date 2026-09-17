"use client"

import { useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { ShowcaseBrand } from "@/data/brands"
import BrandShowcaseCard from "./BrandShowcaseCard"

interface Props {
  brands: ShowcaseBrand[]
  activeBrandId: string
  onBrandChange: (id: string) => void
}

export default function BrandCarousel({ brands, activeBrandId, onBrandChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((dir: "left" | "right") => {
    const container = scrollRef.current
    if (!container) return
    const amount = 320
    container.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" })
  }, [])

  const scrollToActive = useCallback((brandId: string) => {
    const container = scrollRef.current
    if (!container) return
    const index = brands.findIndex((b) => b.id === brandId)
    const card = container.children[index] as HTMLElement | undefined
    if (!card) return
    const containerCenter = container.offsetWidth / 2
    const cardCenter = card.offsetLeft + card.offsetWidth / 2
    container.scrollTo({
      left: cardCenter - containerCenter,
      behavior: "smooth",
    })
  }, [brands])

  const handleBrandActivate = useCallback(
    (id: string) => {
      onBrandChange(id)
      scrollToActive(id)
    },
    [onBrandChange, scrollToActive]
  )

  return (
    <div className="relative" role="listbox" aria-label="Marka seçin">
      {/* Prev button */}
      <button
        onClick={() => scroll("left")}
        aria-label="Önceki markalar"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 hover:text-white transition-all duration-200 flex items-center justify-center backdrop-blur-sm hidden md:flex"
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className={[
          "flex gap-4 overflow-x-auto pb-4",
          "scrollbar-hide",
          "scroll-smooth",
          // Mobile: snap
          "snap-x snap-mandatory md:snap-none",
          // Padding so active card doesn't clip the glow
          "px-2 py-2",
        ].join(" ")}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {brands.map((brand) => (
          <div key={brand.id} className="snap-center">
            <BrandShowcaseCard
              brand={brand}
              isActive={activeBrandId === brand.id}
              isInactive={!!activeBrandId && activeBrandId !== brand.id}
              onActivate={handleBrandActivate}
            />
          </div>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => scroll("right")}
        aria-label="Sonraki markalar"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white/70 hover:bg-white/20 hover:text-white transition-all duration-200 flex items-center justify-center backdrop-blur-sm hidden md:flex"
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>

      {/* Mobile swipe hint */}
      <div className="flex justify-center gap-1.5 mt-2 md:hidden" aria-hidden="true">
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => handleBrandActivate(brand.id)}
            aria-label={`${brand.name} seç`}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: activeBrandId === brand.id ? "20px" : "6px",
              backgroundColor:
                activeBrandId === brand.id
                  ? brands.find((b) => b.id === activeBrandId)?.accentColor || "#fff"
                  : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  )
}
