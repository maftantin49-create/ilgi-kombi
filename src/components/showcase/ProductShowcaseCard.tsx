"use client"

import { useRef, useCallback, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, MessageCircle, CheckCircle, Package } from "lucide-react"
import type { StorefrontProductCard } from "@/lib/storefront/types"
import { wa } from "@/lib/whatsapp"
import { site } from "@/config/site"

const PLACEHOLDER = "/images/product-placeholder.svg"

interface Props {
  product: StorefrontProductCard
  accentColor?: string
  priority?: boolean
}

export default function ProductShowcaseCard({ product, accentColor = "#1E40AF", priority = false }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      const card = cardRef.current
      const image = imageRef.current
      const glow = glowRef.current
      if (!card || !image) return

      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const rotY = (x - 0.5) * 16
        const rotX = (0.5 - y) * 8
        if (image) {
          image.style.transform = `perspective(600px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(1.08) translateY(-6px)`
        }
        if (glow) {
          glow.style.transform = `translate(${(x - 0.5) * 30}px, ${(y - 0.5) * 20}px)`
        }
      })
    },
    []
  )

  const handleMouseEnter = useCallback(() => { setIsHovered(true) }, [])
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    cancelAnimationFrame(rafRef.current)
    if (imageRef.current) imageRef.current.style.transform = ""
    if (glowRef.current) glowRef.current.style.transform = ""
  }, [])

  const imageUrl = product.image_url ?? PLACEHOLDER
  const brandName = product.brand?.name ?? ""
  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null
  const productUrl = `${site.url}/urunler/${product.slug}`

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: isHovered ? `1px solid ${accentColor}50` : "1px solid rgba(255,255,255,0.08)",
        boxShadow: isHovered
          ? `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${accentColor}20`
          : "0 4px 20px rgba(0,0,0,0.3)",
        transform: isHovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "transform 280ms cubic-bezier(0.34,1.56,0.64,1), border 300ms ease, box-shadow 300ms ease",
      }}
    >
      {/* Background glow orb */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundColor: accentColor + "22",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />

      <div className="relative z-10 p-5">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          {product.is_new && (
            <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-semibold rounded-full">
              Yeni
            </span>
          )}
          {discount && (
            <span
              className="px-2 py-0.5 text-xs font-semibold rounded-full"
              style={{ background: accentColor + "25", color: accentColor, border: `1px solid ${accentColor}40` }}
            >
              %{discount} indirim
            </span>
          )}
          {product.same_day_shipping && (
            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-semibold rounded-full ml-auto">
              Aynı Gün
            </span>
          )}
        </div>

        {/* Image */}
        <div
          ref={imageRef}
          className="flex items-center justify-center h-36 mb-4"
          style={{ transition: "transform 180ms ease-out", willChange: "transform" }}
        >
          <div
            className="relative w-28 h-28"
            style={{
              filter: isHovered
                ? `drop-shadow(0 12px 30px ${accentColor}60)`
                : "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
              transition: "filter 300ms ease",
            }}
          >
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              priority={priority}
            />
          </div>
        </div>

        {/* Product info */}
        <div>
          <div className="text-xs text-white/40 mb-1 uppercase tracking-wide">{brandName}</div>
          <h3 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Quick specs — slides in on hover */}
          <div
            className="overflow-hidden"
            style={{
              maxHeight: isHovered ? "60px" : "0px",
              opacity: isHovered ? 1 : 0,
              transition: "max-height 300ms ease, opacity 280ms ease",
            }}
          >
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <CheckCircle size={10} aria-hidden="true" className="text-green-400 flex-shrink-0" />
                {product.stock_quantity > 0 ? `Stokta: ${product.stock_quantity} adet` : "Stok yok"}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Package size={10} aria-hidden="true" className="text-blue-400 flex-shrink-0" />
                SKU: {product.sku}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-2 mb-4">
            <span className="text-lg font-black" style={{ color: accentColor }}>
              {product.price.toLocaleString("tr-TR")} {site.currency}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-xs text-white/30 line-through pb-0.5">
                {product.compare_at_price.toLocaleString("tr-TR")} {site.currency}
              </span>
            )}
          </div>

          {/* CTA — slides up on hover */}
          <div
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 280ms ease, transform 280ms ease",
              pointerEvents: isHovered ? "auto" : "none",
            }}
            className="flex gap-2"
          >
            <Link
              href={`/urunler/${product.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white group/btn transition-all duration-200 hover:-translate-y-px"
              style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}40` }}
            >
              Ürün Detayı
              <ArrowRight
                size={11}
                aria-hidden="true"
                className="group-hover/btn:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
            <a
              href={wa.product(product.name, product.sku, productUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 transition-all duration-200 hover:-translate-y-px hover:bg-green-500/30"
              aria-label={`${product.name} hakkında WhatsApp'tan sor`}
            >
              <MessageCircle size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
