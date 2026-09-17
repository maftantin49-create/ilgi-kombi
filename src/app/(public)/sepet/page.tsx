"use client"

import ProductImage from "@/components/product/ProductImage"
import Link from "next/link"
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react"
import { useCart } from "@/lib/cart"
import { wa } from "@/lib/whatsapp"
import { getProductImageUrl } from "@/lib/storefront/types"
import { site } from "@/config/site"

export default function SepetPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
  const total = totalPrice()
  const count = totalItems()
  const shipping = total >= site.freeShippingThreshold ? 0 : site.shippingCost
  const grand = total + shipping

  const waHref = wa.cartOrder(
    items.map((i) => ({
      name: i.name,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    total
  )

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">🛒</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#F4F4F2" }}>
          Sepetiniz boş
        </h2>
        <p className="mb-8" style={{ color: "#666660" }}>
          Ürün eklemek için alışverişe devam edin.
        </p>
        <Link
          href="/urunler"
          className="inline-flex items-center justify-center px-8 py-2.5 rounded-lg font-bold text-sm transition-colors"
          style={{ background: "#D4A017", color: "#090A0C" }}
        >
          Alışverişe Başla
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/urunler"
        className="inline-flex items-center gap-1 text-sm mb-6 transition-colors"
        style={{ color: "#888882" }}
        onMouseEnter={(e) => ((e.target as HTMLElement).closest("a")!.style.color = "#D4A017")}
        onMouseLeave={(e) => ((e.target as HTMLElement).closest("a")!.style.color = "#888882")}
      >
        <ArrowLeft size={14} aria-hidden="true" /> Alışverişe devam et
      </Link>

      <h1 className="text-2xl font-bold mb-6" style={{ color: "#F4F4F2" }}>
        Sepetim ({count} ürün)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl p-4"
              style={{
                background: "#151618",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="w-20 h-20 rounded-lg overflow-hidden relative shrink-0"
                style={{ background: "#111214" }}
              >
                <ProductImage
                  src={getProductImageUrl(item.imageUrl)}
                  alt={item.name}
                  fill
                  className="object-contain p-2"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/urunler/${item.slug}`}
                  className="font-medium line-clamp-2 text-sm transition-colors"
                  style={{ color: "#E0E0DC" }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#D4A017")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#E0E0DC")}
                >
                  {item.name}
                </Link>
                <div className="text-xs mt-0.5" style={{ color: "#555550" }}>
                  {item.sku}
                  {item.brandName && (
                    <span className="ml-2" style={{ color: "#444440" }}>{item.brandName}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div
                    className="flex items-center gap-0 rounded-lg overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Adeti azalt"
                      className="px-2.5 py-1.5 transition-colors"
                      style={{ color: "#A0A09A" }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1E1F21")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className="px-2 text-sm font-medium" style={{ color: "#E0E0DC" }} aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      aria-label="Adeti artır"
                      className="px-2.5 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: "#A0A09A" }}
                      onMouseEnter={(e) => {
                        if (item.quantity < item.stockQuantity)
                          (e.currentTarget as HTMLButtonElement).style.background = "#1E1F21"
                      }}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="font-bold" style={{ color: "#D4A017" }}>
                    {(item.unitPrice * item.quantity).toLocaleString("tr-TR")} ₺
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                aria-label={`${item.name} ürününü sepetten çıkar`}
                className="transition-colors self-start"
                style={{ color: "#444440" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#EF4444")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#444440")}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div
            className="rounded-xl p-5 sticky top-24"
            style={{
              background: "#151618",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h3 className="font-bold mb-4" style={{ color: "#F4F4F2" }}>
              Sipariş Özeti
            </h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between" style={{ color: "#A0A09A" }}>
                <span>Ara toplam</span>
                <span>{total.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between" style={{ color: "#A0A09A" }}>
                <span>Kargo</span>
                <span className={shipping === 0 ? "font-medium" : ""} style={shipping === 0 ? { color: "#22c55e" } : {}}>
                  {shipping === 0 ? "Ücretsiz" : `${shipping.toFixed(2)} ₺`}
                </span>
              </div>
              {shipping > 0 && (
                <div
                  className="text-xs rounded p-2"
                  style={{ color: "#666660", background: "#111214", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {(site.freeShippingThreshold - total).toLocaleString("tr-TR")} ₺ daha
                  alışveriş yapın, kargo bedava!
                </div>
              )}
            </div>
            <div
              className="pt-4 mb-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex justify-between font-bold text-lg">
                <span style={{ color: "#E8E8E2" }}>Toplam</span>
                <span style={{ color: "#D4A017" }}>
                  {grand.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>
            <Link
              href="/odeme"
              className="block w-full text-center py-3 rounded-xl font-bold text-base transition-colors"
              style={{ background: "#D4A017", color: "#090A0C" }}
            >
              Ödemeye Geç
            </Link>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-colors text-sm hover:bg-green-600"
              style={{ background: "#22c55e", color: "#fff" }}
            >
              WhatsApp ile Sipariş Ver
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
