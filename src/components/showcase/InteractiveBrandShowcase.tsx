"use client"

import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { showcaseBrands } from "@/data/brands"
import type { StorefrontProductCard } from "@/lib/storefront/types"
import BrandCarousel from "./BrandCarousel"
import ProductShowcaseCard from "./ProductShowcaseCard"
import TechnicalLineLayer from "@/components/experience/TechnicalLineLayer"

interface Props {
  productsByBrand: Record<string, StorefrontProductCard[]>
}

export default function InteractiveBrandShowcase({ productsByBrand }: Props) {
  const [activeBrandId, setActiveBrandId] = useState(showcaseBrands[0].id)

  const activeBrand = useMemo(
    () => showcaseBrands.find((b) => b.id === activeBrandId) ?? showcaseBrands[0],
    [activeBrandId]
  )

  const handleBrandChange = useCallback((id: string) => {
    setActiveBrandId(id)
  }, [])

  const showcaseProducts: StorefrontProductCard[] = productsByBrand[activeBrand.id] ?? []

  const glowLeft = useMemo(() => {
    const idx = showcaseBrands.findIndex((b) => b.id === activeBrandId)
    return `${(idx / (showcaseBrands.length - 1)) * 75 + 10}%`
  }, [activeBrandId])

  const sectionStyle = { background: "#0D1117" } as React.CSSProperties

  return (
    <section aria-label="Marka ve ürün showcase" className="relative overflow-hidden" style={sectionStyle}>

      {/* ── Background layers ── */}
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full blur-[130px] pointer-events-none"
        style={{
          backgroundColor: activeBrand.accentColor + "22",
          transition: "background-color 700ms ease",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-1/4 w-[350px] h-[280px] rounded-full blur-[80px] pointer-events-none"
        style={{
          left: glowLeft,
          backgroundColor: activeBrand.accentColor + "18",
          transition: "background-color 700ms ease, left 600ms cubic-bezier(0.4,0,0.2,1)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0D1117] to-transparent pointer-events-none" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none" />
      <div aria-hidden="true" className="absolute right-0 bottom-0 w-72 h-48 pointer-events-none opacity-40">
        <TechnicalLineLayer pattern={activeBrand.technicalPattern} accentColor={activeBrand.accentColor} opacity={1} className="w-full h-full" />
      </div>
      <div aria-hidden="true" className="absolute left-0 top-20 w-48 h-36 pointer-events-none opacity-20 -rotate-12">
        <TechnicalLineLayer pattern={activeBrand.technicalPattern} accentColor={activeBrand.accentColor} opacity={1} className="w-full h-full" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-14 md:py-20">

        {/* ── Brand Carousel Section ── */}
        <div className="mb-14 md:mb-20">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
              style={{
                background: activeBrand.accentColor + "20",
                border: `1px solid ${activeBrand.accentColor}40`,
                color: activeBrand.accentColor,
                transition: "background 500ms ease, border 500ms ease, color 500ms ease",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeBrand.accentColor }} aria-hidden="true" />
              {showcaseProducts.length > 0 ? `${showcaseProducts.length}+ uyumlu ürün stokta` : activeBrand.productCount + "+ uyumlu ürün"}
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight">
              Markanı Seç,{" "}
              <span style={{ color: activeBrand.accentColor, transition: "color 500ms ease" }}>
                Uyumlu Parçaları Keşfet
              </span>
            </h2>
            <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto">
              Kombi markanı seç. Uyumlu yedek parçaları, teknik bilgileri ve stok seçeneklerini hızlıca incele.
            </p>
          </div>

          {/* Active brand info bar */}
          <div
            className="flex items-center justify-between rounded-xl px-5 py-3 mb-6 max-w-2xl mx-auto"
            style={{
              background: activeBrand.accentColor + "15",
              border: `1px solid ${activeBrand.accentColor}30`,
              transition: "background 500ms ease, border 500ms ease",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                style={{
                  background: activeBrand.accentColor + "30",
                  color: activeBrand.accentColor,
                  border: `1px solid ${activeBrand.accentColor}50`,
                  transition: "background 500ms ease, color 500ms ease, border 500ms ease",
                }}
              >
                {activeBrand.initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{activeBrand.name}</span>
                  <span
                    className="text-xs font-medium px-1.5 py-0.5 rounded-full hidden sm:inline"
                    style={{
                      background: activeBrand.accentColor + "20",
                      color: activeBrand.accentColor,
                      border: `1px solid ${activeBrand.accentColor}30`,
                      transition: "background 500ms ease, color 500ms ease",
                    }}
                  >
                    {activeBrand.heroLabel}
                  </span>
                </div>
                <span className="text-white/40 text-xs hidden sm:block truncate">{activeBrand.description}</span>
              </div>
            </div>
            <Link
              href={activeBrand.categoryLink}
              className="flex items-center gap-1 text-xs font-semibold shrink-0 ml-3 transition-all duration-200 hover:gap-2"
              style={{ color: activeBrand.accentColor }}
            >
              Tümü <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <BrandCarousel brands={showcaseBrands} activeBrandId={activeBrandId} onBrandChange={handleBrandChange} />
        </div>

        {/* ── Product Showcase Section ── */}
        <div>
          <div
            aria-hidden="true"
            className="h-px mb-12 max-w-xs mx-auto"
            style={{
              background: `linear-gradient(to right, transparent, ${activeBrand.accentColor}60, transparent)`,
              transition: "background 600ms ease",
            }}
          />

          <div className="text-center mb-8">
            <h2 className="text-xl md:text-3xl font-black text-white mb-2">Parçayı Her Açıdan İncele</h2>
            <p className="text-white/40 text-sm">
              <span style={{ color: activeBrand.accentColor, transition: "color 500ms ease" }}>
                {activeBrand.name}
              </span>
              {" "}ile uyumlu parçalar
            </p>
          </div>

          {showcaseProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {showcaseProducts.map((product) => (
                <ProductShowcaseCard
                  key={`${product.id}-${activeBrandId}`}
                  product={product}
                  accentColor={activeBrand.accentColor}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/30 text-sm">
              Bu marka için ürünler yakında eklenecek
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href={activeBrand.categoryLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 group"
              style={{
                background: activeBrand.accentColor,
                boxShadow: `0 8px 32px ${activeBrand.accentColor}45`,
                transition: "background 500ms ease, box-shadow 500ms ease, transform 200ms ease",
              }}
            >
              {activeBrand.name} Tüm Ürünleri
              <ChevronRight size={16} aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
