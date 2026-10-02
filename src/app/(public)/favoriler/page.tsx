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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center bg-white min-h-screen">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
        >
          <Heart size={28} className="text-blue-600" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Henüz favori ürününüz yok
        </h2>
        <p className="mb-8 text-gray-500">
          Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilere ekleyin.
        </p>
        <Link
          href="/urunler"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-colors text-white hover:bg-blue-900"
          style={{ background: "#1E3A8A" }}
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Ürünlere Göz At
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      <Link
        href="/urunler"
        className="inline-flex items-center gap-1 text-sm mb-6 transition-colors text-gray-500 hover:text-blue-700"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Alışverişe devam et
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Heart size={22} className="text-red-500" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-900">
          Favorilerim
        </h1>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full text-gray-500"
          style={{ background: "#F1F3F5", border: "1px solid #E2E6EA" }}
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
