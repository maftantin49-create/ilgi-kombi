"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import ProductImage from "@/components/product/ProductImage"
import { ShoppingCart, Truck, MessageCircle, Heart, CheckCircle } from "lucide-react"
import { wa } from "@/lib/whatsapp"
import { siteConfig } from "@/config/site"
import { Product } from "@/types"
import { useCart, type CartItem } from "@/lib/cart"
import { useFavorites } from "@/lib/favorites"

interface Props {
  product: Product
}

// Converts the legacy mock Product shape into a CartItem snapshot.
// ProductCard is mock-data-facing (used by ProductSection); the cart store
// no longer accepts mock Product objects, so we adapt here at the boundary.
function mockProductToCartItem(p: Product): CartItem {
  return {
    productId: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    imageUrl: p.image,
    brandName: p.brand ?? null,
    unitPrice: p.price,
    stockQuantity: p.stock,
    trackStock: true,
    quantity: 1,
  }
}

export default function ProductCard({ product }: Props) {
  const addItem                        = useCart(s => s.addItem)
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited                      = isFavorite(product.id)
  const [imgHovered, setImgHovered]    = useState(false)
  const [added, setAdded]              = useState(false)

  const discount   = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null
  const productUrl = `${siteConfig.url}/urunler/${product.slug}`

  const handleAdd = () => {
    addItem(mockProductToCartItem(product))
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
        background: "#151618",
        border: "1px solid rgba(255,196,0,0.10)",
        borderRadius: "20px",
        willChange: "transform",
      }}
    >
      {/* Hover border glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          borderRadius: "20px",
          boxShadow: "inset 0 0 0 1px rgba(255,196,0,0.40), 0 8px 30px rgba(212,160,23,0.10)",
        }}
        aria-hidden="true"
      />

      {/* Favorite */}
      <motion.button
        onClick={() => toggleFavorite(product)}
        aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
        whileTap={{ scale: 0.88 }}
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150"
        style={{
          background: "rgba(21,22,24,0.90)",
          border: `1px solid ${favorited ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.10)"}`,
        }}
      >
        <Heart
          size={13}
          className={favorited ? "text-red-500 fill-red-500" : "text-[#5A5A5A]"}
          aria-hidden="true"
        />
      </motion.button>

      {/* Image area */}
      <Link
        href={`/urunler/${product.slug}`}
        className="block relative aspect-square overflow-hidden"
        style={{ background: "#111214" }}
        onMouseEnter={() => product.hoverImage && setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          className={`object-contain p-4 transition-all duration-350 ${
            product.hoverImage
              ? imgHovered ? "opacity-0 scale-105" : "opacity-100 scale-100"
              : imgHovered ? "scale-[1.07]" : "scale-100"
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {product.hoverImage && (
          <ProductImage
            src={product.hoverImage}
            alt={`${product.name} ikinci görünüm`}
            fill
            className={`object-contain p-4 transition-all duration-350 ${
              imgHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span
              className="text-[10px] font-black px-2 py-0.5 rounded-full tracking-[0.05em]"
              style={{ background: "#D4A017", color: "#090A0C" }}
            >
              Yeni
            </span>
          )}
          {discount && (
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(212,160,23,0.12)",
                border: "1px solid rgba(212,160,23,0.35)",
                color: "#D4A017",
              }}
            >
              %{discount} indirim
            </span>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(21,22,24,0.92)",
                border: "1px solid rgba(245,158,11,0.38)",
                color: "#F59E0B",
              }}
            >
              Son {product.stock} adet
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3">
        <Link href={`/urunler/${product.slug}`}>
          <h3 className="font-medium text-sm leading-snug line-clamp-2 mb-1.5 transition-colors duration-150 text-[#E0E0DC] hover:text-[#D4A017]">
            {product.name}
          </h3>
        </Link>

        {product.sameDayShipping && (
          <span
            className="flex items-center gap-0.5 text-[11px] font-medium mb-1.5"
            style={{ color: "#22c55e" }}
          >
            <Truck size={10} aria-hidden="true" /> Aynı gün kargo
          </span>
        )}

        {/* Price row */}
        <div className="flex items-end justify-between mt-auto mb-2.5">
          <div>
            <div className="font-bold text-base leading-none" style={{ color: "#D4A017" }}>
              {product.price.toLocaleString("tr-TR")} ₺
            </div>
            {product.originalPrice && (
              <div className="text-[11px] line-through mt-0.5" style={{ color: "#3E3E3E" }}>
                {product.originalPrice.toLocaleString("tr-TR")} ₺
              </div>
            )}
          </div>
          <a
            href={wa.product(product.name, product.sku, productUrl) ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${product.name} hakkında WhatsApp'tan sor`}
            className="transition-colors duration-150 text-[#3A3A3A] hover:text-[#22c55e]"
          >
            <MessageCircle size={17} aria-hidden="true" />
          </a>
        </div>

        {/* CTA button */}
        <motion.button
          onClick={handleAdd}
          whileTap={{ scale: 0.96 }}
          className={`w-full h-[34px] text-[11px] font-bold tracking-[0.07em] uppercase rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-150 ${
            added
              ? "text-[#22c55e]"
              : "hover:bg-[#D4A017] hover:text-[#090A0C] hover:border-[#D4A017] text-[#D4A017]"
          }`}
          style={
            added
              ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.32)" }
              : { background: "transparent", border: "1px solid rgba(255,196,0,0.35)" }
          }
        >
          {added ? (
            <><CheckCircle size={12} aria-hidden="true" /> Eklendi</>
          ) : (
            <><ShoppingCart size={12} aria-hidden="true" /> Sepete Ekle</>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
