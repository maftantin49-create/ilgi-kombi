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

const newBadge: React.CSSProperties = {
  background: "#2563EB",
  borderRadius: "20px",
  padding: "2px 10px",
  fontSize: "11px",
  color: "#FFFFFF",
  fontWeight: 700,
}
const discountBadge: React.CSSProperties = {
  background: "#FEF2F2",
  border: "1px solid #FCA5A5",
  borderRadius: "20px",
  padding: "2px 10px",
  fontSize: "11px",
  color: "#B91C1C",
  fontWeight: 700,
}

export default function ProductGallery({ images, productName, isNew, discount }: Props) {
  const [active, setActive] = useState(0)
  const activeSrc = images[active] ?? images[0]

  return (
    <div>
      {/* ── Main image stage ─────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[16px] min-h-[440px] md:min-h-[580px]"
        style={{
          background: "#F8F9FA",
          border: "1px solid #E2E6EA",
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
          {isNew && <span style={newBadge}>Yeni</span>}
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
                border: `2px solid ${i === active ? "#3B82F6" : "#E2E6EA"}`,
                background: "#F8F9FA",
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
