"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import ProductImage from "@/components/product/ProductImage"

interface Props {
  images: string[]      // deduplicated, primary first
  productName: string
  isNew: boolean
  discount: number | null
}

const goldBadge: React.CSSProperties = {
  background: "#D4A017",
  borderRadius: "20px",
  padding: "2px 10px",
  fontSize: "11px",
  color: "#090A0C",
  fontWeight: 700,
}
const discountBadge: React.CSSProperties = {
  background: "rgba(212,160,23,0.14)",
  border: "1px solid rgba(212,160,23,0.35)",
  borderRadius: "20px",
  padding: "2px 10px",
  fontSize: "11px",
  color: "#D4A017",
  fontWeight: 700,
}

export default function ProductGallery({ images, productName, isNew, discount }: Props) {
  const [active, setActive] = useState(0)
  const activeSrc = images[active] ?? images[0]

  return (
    <div>
      {/* ── Main image stage ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[22px] min-h-[440px] md:min-h-[580px]"
        style={{
          background: "#090A0C",
          border: "1px solid rgba(255,196,0,0.12)",
        }}
        aria-label={`${productName} ürün görseli`}
      >
        {/* Product image — animate on switch */}
        <motion.div
          key={activeSrc}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ position: "absolute", inset: 0, zIndex: 10 }}
        >
          <ProductImage
            src={activeSrc}
            alt={productName}
            fill
            className="object-contain object-center p-5 md:p-6"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 52vw, 640px"
            priority
          />
        </motion.div>

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5">
          {isNew && <span style={goldBadge}>Yeni</span>}
          {discount !== null && <span style={discountBadge}>%{discount} indirim</span>}
        </div>
      </div>

      {/* ── Thumbnail strip — only if more than one image ──────── */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1" role="list" aria-label="Ürün görselleri">
          {images.map((url, i) => (
            <button
              key={url + i}
              onClick={() => setActive(i)}
              role="listitem"
              aria-label={`Görsel ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className="shrink-0 w-[68px] h-[68px] rounded-[12px] overflow-hidden transition-all duration-150"
              style={{
                border: `2px solid ${i === active ? "#D4A017" : "rgba(255,255,255,0.07)"}`,
                background: "#111214",
                outline: "none",
              }}
            >
              <div className="relative w-full h-full">
                <ProductImage
                  src={url}
                  alt={`${productName} görsel ${i + 1}`}
                  fill
                  className="object-contain object-center p-1.5"
                  sizes="68px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
