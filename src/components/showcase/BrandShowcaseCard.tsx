"use client"

import { useRef, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Search, MessageCircle } from "lucide-react"
import type { ShowcaseBrand } from "@/data/brands"
import { wa } from "@/lib/whatsapp"

interface Props {
  brand: ShowcaseBrand
  isActive: boolean
  isInactive: boolean
  onActivate: (id: string) => void
  priority?: boolean
}

export default function BrandShowcaseCard({
  brand,
  isActive,
  isInactive,
  onActivate,
  priority = false,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      const card = cardRef.current
      const image = imageRef.current
      if (!card || !image) return
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        if (!image) return
        const rotY = (x - 0.5) * 14
        const rotX = (0.5 - y) * 7
        image.style.transform = `perspective(500px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(1.06) translateY(-4px)`
      })
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    if (imageRef.current) {
      imageRef.current.style.transform = ""
    }
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onActivate(brand.id)
      }
    },
    [brand.id, onActivate]
  )

  return (
    <div
      ref={cardRef}
      role="option"
      aria-selected={isActive}
      tabIndex={0}
      onMouseEnter={() => onActivate(brand.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={() => onActivate(brand.id)}
      onKeyDown={handleKeyDown}
      className={[
        "relative flex-shrink-0 w-[280px] md:w-[300px] rounded-2xl overflow-hidden cursor-pointer",
        "outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "transition-all duration-300",
        isActive
          ? "scale-[1.04] shadow-2xl"
          : isInactive
          ? "opacity-50 scale-[0.97]"
          : "opacity-80 hover:opacity-100",
      ].join(" ")}
      style={{
        background: isActive
          ? `linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)`
          : `rgba(255,255,255,0.04)`,
        border: isActive
          ? `1px solid ${brand.accentColor}70`
          : `1px solid rgba(255,255,255,0.08)`,
        boxShadow: isActive
          ? `0 0 0 1px ${brand.accentColor}30, 0 20px 60px ${brand.accentColor}25, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 4px 20px rgba(0,0,0,0.3)`,
        transition:
          "transform 280ms cubic-bezier(0.34,1.56,0.64,1), opacity 250ms ease, border 300ms ease, box-shadow 300ms ease",
      }}
    >
      {/* Inner glow on active */}
      {isActive && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${brand.accentColor}18 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative z-10 p-5 flex flex-col h-full min-h-[320px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div ref={logoRef} className="flex items-center gap-3" style={{
            transform: isActive ? "translateY(-2px)" : "translateY(0)",
            transition: "transform 280ms ease",
          }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black tracking-tight"
              style={{
                background: `${brand.accentColor}22`,
                border: `1px solid ${brand.accentColor}50`,
                color: brand.accentColor,
              }}
            >
              {brand.initials}
            </div>
            <div>
              <div className="font-bold text-white text-base leading-tight">{brand.name}</div>
              <div className="text-xs text-white/50 mt-0.5">{brand.productCount} ürün</div>
            </div>
          </div>
          {isActive && (
            <div
              className="w-2 h-2 rounded-full mt-1.5 animate-pulse"
              style={{ backgroundColor: brand.accentColor }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Product image */}
        <div
          ref={imageRef}
          className="flex-1 flex items-center justify-center py-2"
          style={{ transition: "transform 180ms ease-out", willChange: "transform" }}
        >
          <div
            className="relative w-28 h-28"
            style={{
              filter: isActive
                ? `drop-shadow(0 8px 24px ${brand.accentColor}50)`
                : "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              transition: "filter 300ms ease",
            }}
          >
            <Image
              src={brand.featuredImage}
              alt={`${brand.name} öne çıkan ürün`}
              fill
              className="object-contain"
              priority={priority}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-white/50 mb-3 leading-relaxed line-clamp-2">
          {brand.description}
        </p>

        {/* Featured parts — visible on active */}
        <div
          className="overflow-hidden"
          style={{
            maxHeight: isActive ? "80px" : "0px",
            opacity: isActive ? 1 : 0,
            transition: "max-height 350ms ease, opacity 300ms ease",
          }}
        >
          <div className="pb-3 space-y-1">
            {brand.featuredParts.map((part) => (
              <div key={part} className="flex items-center gap-2 text-xs text-white/60">
                <div
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: brand.accentColor }}
                  aria-hidden="true"
                />
                {part}
              </div>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div
          className="flex gap-2"
          style={{
            opacity: isActive ? 1 : 0,
            transform: isActive ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 300ms ease, transform 300ms ease",
            pointerEvents: isActive ? "auto" : "none",
          }}
        >
          <Link
            href={brand.categoryLink}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-px group"
            style={{
              background: brand.accentColor,
              boxShadow: `0 4px 14px ${brand.accentColor}40`,
            }}
            tabIndex={isActive ? 0 : -1}
          >
            Ürünleri Gör
            <ArrowRight
              size={12}
              aria-hidden="true"
              className="group-hover:translate-x-0.5 transition-transform duration-200"
            />
          </Link>
          <Link
            href={brand.parcaBulLink}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:-translate-y-px"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${brand.accentColor}40`,
              color: brand.accentColor,
            }}
            aria-label={`${brand.name} için parça bul`}
            tabIndex={isActive ? 0 : -1}
          >
            <Search size={13} aria-hidden="true" />
          </Link>
          <a
            href={wa.home}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-green-500/20 border border-green-500/40 text-green-400 transition-all duration-200 hover:-translate-y-px hover:bg-green-500/30"
            aria-label={`${brand.name} için WhatsApp destek`}
            tabIndex={isActive ? 0 : -1}
          >
            <MessageCircle size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  )
}
