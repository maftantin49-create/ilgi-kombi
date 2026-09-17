"use client"

import Link from "next/link"
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react"
import { useFavorites } from "@/lib/favorites"
import ProductCard from "@/components/product/ProductCard"

export default function FavorilerPage() {
  const items          = useFavorites(s => s.items)
  const totalFavorites = useFavorites(s => s.totalFavorites)()

  if (totalFavorites === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.14)" }}
        >
          <Heart size={28} style={{ color: "#D4A017" }} aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#F4F4F2" }}>
          Henüz favori ürününüz yok
        </h2>
        <p className="mb-8" style={{ color: "#666660" }}>
          Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilere ekleyin.
        </p>
        <Link
          href="/urunler"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-colors"
          style={{ background: "#D4A017", color: "#090A0C" }}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Ürünlere Göz At
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/urunler"
        className="inline-flex items-center gap-1 text-sm mb-6 transition-colors"
        style={{ color: "#888882" }}
        onMouseEnter={e => ((e.target as HTMLElement).closest("a")!.style.color = "#D4A017")}
        onMouseLeave={e => ((e.target as HTMLElement).closest("a")!.style.color = "#888882")}
      >
        <ArrowLeft size={14} aria-hidden="true" /> Alışverişe devam et
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Heart size={22} style={{ color: "#D4A017" }} aria-hidden="true" />
        <h1 className="text-2xl font-bold" style={{ color: "#F4F4F2" }}>
          Favorilerim
        </h1>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            background: "rgba(212,160,23,0.08)",
            border: "1px solid rgba(255,196,0,0.14)",
            color: "#888882",
          }}
        >
          {totalFavorites} ürün
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
