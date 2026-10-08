"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import ProductImage from "@/components/product/ProductImage"
import { Truck, MessageCircle, ShoppingCart, CheckCircle } from "lucide-react"
import { buildWa } from "@/lib/whatsapp"
import { validWhatsApp } from "@/lib/storefront/guards"
import { useWaNumber } from "@/lib/wa-context"
import { siteConfig } from "@/config/site"
import {
  type StorefrontProductCard,
  canAddToCart,
  getProductAvailability,
  getProductImageUrl,
} from "@/lib/storefront/types"
import { useCart, toCartItem } from "@/lib/cart"

interface Props {
  product: StorefrontProductCard
}

export default function StorefrontProductCardComponent({ product }: Props) {
  const addItem = useCart((s) => s.addItem)
  const [imgHovered, setImgHovered] = useState(false)
  const [added, setAdded] = useState(false)

  const availability = getProductAvailability(product)
  const addable = canAddToCart(product)

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null

  const waNumber = useWaNumber()
  const productUrl = `${siteConfig.url}/urunler/${product.slug}`
  const waLink = buildWa(validWhatsApp(waNumber ?? "")).product(product.name, product.sku, productUrl)
  const imageUrl = getProductImageUrl(product.image_url)
  const hoverImageUrl = product.hover_image_url ?? null

  const handleAdd = () => {
    if (!addable) return
    addItem(toCartItem(product))
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.div
      whileHover={{ y: -5, transition: { type: "spring", stiffness: 340, damping: 28 } }}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 14 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E6EA",
        borderRadius: "12px",
        willChange: "transform",
      }}
    >
      {/* Hover border highlight */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          borderRadius: "12px",
          boxShadow: "inset 0 0 0 1px #93C5FD, 0 4px 16px rgba(0,0,0,0.10)",
        }}
        aria-hidden="true"
      />

      {/* Image area */}
      <Link
        href={`/urunler/${product.slug}`}
        className="block relative aspect-square overflow-hidden"
        style={{ background: "#F8F9FA" }}
        onMouseEnter={() => hoverImageUrl && setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        <ProductImage
          src={imageUrl}
          alt={product.name}
          fill
          className={`object-contain p-1 md:p-2 transition-all duration-350 ${
            hoverImageUrl
              ? imgHovered
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100"
              : imgHovered
              ? "scale-[1.07]"
              : "scale-100"
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {hoverImageUrl && (
          <ProductImage
            src={hoverImageUrl}
            alt={`${product.name} ikinci görünüm`}
            fill
            className={`object-contain p-1 md:p-2 transition-all duration-350 ${
              imgHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full tracking-[0.05em]"
              style={{ background: "#2563EB", color: "#FFFFFF" }}
            >
              Yeni
            </span>
          )}
          {discount !== null && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#B91C1C",
              }}
            >
              %{discount} indirim
            </span>
          )}
        </div>

        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <div className="absolute bottom-2 right-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid #FCD34D",
                color: "#92400E",
              }}
            >
              Son {product.stock_quantity} adet
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 md:p-4">
        {product.brand && (
          <p className="text-[10px] font-medium tracking-wide uppercase mb-1 text-gray-400">
            {product.brand.name}
          </p>
        )}

        <Link href={`/urunler/${product.slug}`}>
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-1.5 transition-colors duration-150 text-gray-800 hover:text-blue-700">
            {product.name}
          </h3>
        </Link>

        {product.same_day_shipping && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-medium mb-1.5"
            style={{ color: "#16A34A" }}
          >
            <Truck size={10} aria-hidden="true" /> Aynı gün kargo
          </span>
        )}

        {/* Price row */}
        <div className="flex items-end justify-between mt-auto mb-2.5">
          <div>
            {availability === "price_on_request" ? (
              <div className="text-sm font-semibold text-gray-500">
                Fiyat Sorunuz
              </div>
            ) : (
              <>
                <div className="font-bold text-[16px] md:text-[18px] leading-none" style={{ color: "#1E3A8A" }}>
                  {product.price.toLocaleString("tr-TR")} ₺
                </div>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <div className="text-[11px] line-through mt-0.5 text-gray-400">
                    {product.compare_at_price.toLocaleString("tr-TR")} ₺
                  </div>
                )}
              </>
            )}
          </div>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${product.name} hakkında WhatsApp'tan sor`}
              className="transition-colors duration-150 text-gray-400 hover:text-green-600"
            >
              <MessageCircle size={17} aria-hidden="true" />
            </a>
          )}
        </div>

        {/* CTA */}
        {availability === "out_of_stock" ? (
          <div
            className="w-full h-[30px] md:h-[34px] text-[11px] font-bold tracking-[0.07em] uppercase rounded-[10px] flex items-center justify-center gap-1.5"
            style={{
              background: "#F8F9FA",
              border: "1px solid #E2E6EA",
              color: "#9CA3AF",
              cursor: "default",
            }}
            aria-label="Bu ürün stokta yok"
          >
            Stokta Yok
          </div>
        ) : availability === "price_on_request" ? (
          waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-[30px] md:h-[34px] text-[11px] font-bold tracking-[0.07em] uppercase rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-150 hover:bg-green-500 hover:text-white hover:border-green-500 text-green-700"
              style={{ background: "transparent", border: "1px solid rgba(34,197,94,0.40)" }}
            >
              WhatsApp&apos;tan Fiyat Al
            </a>
          ) : (
            <div
              className="w-full h-[30px] md:h-[34px] text-[11px] font-bold tracking-[0.07em] uppercase rounded-[10px] flex items-center justify-center gap-1.5"
              style={{ background: "#F8F9FA", border: "1px solid #E2E6EA", color: "#9CA3AF" }}
            >
              Fiyat Sorunuz
            </div>
          )
        ) : (
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.96 }}
            className={`w-full h-[30px] md:h-[34px] text-[11px] font-bold tracking-[0.07em] uppercase rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-150 ${
              added
                ? "text-green-700"
                : "hover:bg-blue-800 hover:text-white hover:border-blue-800 text-blue-800"
            }`}
            style={
              added
                ? { background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.32)" }
                : { background: "transparent", border: "1px solid #93C5FD" }
            }
            aria-label={added ? "Sepete eklendi" : "Sepete ekle"}
          >
            {added ? (
              <>
                <CheckCircle size={12} aria-hidden="true" /> Eklendi
              </>
            ) : (
              <>
                <ShoppingCart size={12} aria-hidden="true" /> Sepete Ekle
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
