"use client"

import ProductImage from "@/components/product/ProductImage"
import Link from "next/link"
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react"
import { useCart } from "@/lib/cart"
import { buildWa } from "@/lib/whatsapp"
import { getProductImageUrl } from "@/lib/storefront/types"

interface Props {
  freeShippingThreshold: number
  shippingCost: number
  waNumber: string | null
}

export default function SepetClient({ freeShippingThreshold, shippingCost, waNumber }: Props) {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
  const total = totalPrice()
  const count = totalItems()
  const shipping = total >= freeShippingThreshold ? 0 : shippingCost
  const grand = total + shipping

  const wa = buildWa(waNumber)
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
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Sepetiniz boş
        </h2>
        <p className="mb-8 text-gray-500">
          Ürün eklemek için alışverişe devam edin.
        </p>
        <Link
          href="/urunler"
          className="inline-flex items-center justify-center px-8 py-2.5 rounded-lg font-bold text-sm transition-colors hover:bg-blue-900"
          style={{ background: "#1E3A8A", color: "#FFFFFF" }}
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
        className="inline-flex items-center gap-1 text-sm mb-6 transition-colors text-gray-500 hover:text-blue-700"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Alışverişe devam et
      </Link>

      <h1 className="text-2xl font-bold mb-6 text-gray-900">
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
                background: "#FFFFFF",
                border: "1px solid #E2E6EA",
              }}
            >
              <div
                className="w-20 h-20 rounded-lg overflow-hidden relative shrink-0"
                style={{ background: "#F8F9FA" }}
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
                  className="font-medium line-clamp-2 text-sm transition-colors text-gray-800 hover:text-blue-700"
                >
                  {item.name}
                </Link>
                <div className="text-xs mt-0.5 text-gray-500">
                  {item.sku}
                  {item.brandName && (
                    <span className="ml-2 text-gray-400">{item.brandName}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div
                    className="flex items-center gap-0 rounded-lg overflow-hidden"
                    style={{ border: "1px solid #E2E6EA" }}
                  >
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Adeti azalt"
                      className="px-2.5 py-1.5 transition-colors text-gray-400 hover:bg-gray-100"
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className="px-2 text-sm font-medium text-gray-900" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.trackStock && item.quantity >= item.stockQuantity}
                      aria-label="Adeti artır"
                      className="px-2.5 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:bg-gray-100"
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <div className="font-bold" style={{ color: "#1E3A8A" }}>
                    {(item.unitPrice * item.quantity).toLocaleString("tr-TR")} ₺
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                aria-label={`${item.name} ürününü sepetten çıkar`}
                className="transition-colors self-start text-gray-300 hover:text-red-500"
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
              background: "#F8F9FA",
              border: "1px solid #E2E6EA",
            }}
          >
            <h3 className="font-bold mb-4 text-gray-900">
              Sipariş Özeti
            </h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-500">
                <span>Ara toplam</span>
                <span>{total.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Kargo</span>
                <span className={shipping === 0 ? "font-medium" : ""} style={shipping === 0 ? { color: "#22c55e" } : {}}>
                  {shipping === 0 ? "Ücretsiz" : `${shipping.toFixed(2)} ₺`}
                </span>
              </div>
              {shipping > 0 && freeShippingThreshold > 0 && (
                <div
                  className="text-xs rounded p-2 text-gray-500"
                  style={{ background: "#FFFFFF", border: "1px solid #E2E6EA" }}
                >
                  {(freeShippingThreshold - total).toLocaleString("tr-TR")} ₺ daha
                  alışveriş yapın, kargo bedava!
                </div>
              )}
            </div>
            <div
              className="pt-4 mb-4"
              style={{ borderTop: "1px solid #E2E6EA" }}
            >
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-900">Toplam</span>
                <span style={{ color: "#1E3A8A" }}>
                  {grand.toLocaleString("tr-TR")} ₺
                </span>
              </div>
            </div>
            <Link
              href="/odeme"
              className="block w-full text-center py-3 rounded-xl font-bold text-base transition-colors hover:bg-blue-900"
              style={{ background: "#1E3A8A", color: "#FFFFFF" }}
            >
              Ödemeye Geç
            </Link>
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-colors text-sm hover:bg-green-600"
                style={{ background: "#22c55e", color: "#fff" }}
              >
                WhatsApp ile Sipariş Ver
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
