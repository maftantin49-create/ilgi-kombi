"use client"

import { useState } from "react"
import { ShoppingCart, CheckCircle, Plus, Minus } from "lucide-react"
import { wa } from "@/lib/whatsapp"
import type { ProductAvailability } from "@/lib/storefront/types"
import { useCart, toCartItem, type CartableProduct } from "@/lib/cart"

interface Props {
  // Minimal product snapshot for cart and WA — must satisfy CartableProduct
  product: CartableProduct
  availability: ProductAvailability
  productUrl: string
  compare_at_price: number | null
}

const WaIcon = () => (
  <svg
    className="w-[18px] h-[18px] shrink-0"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const discountBadge: React.CSSProperties = {
  background: "rgba(212,160,23,0.14)",
  border: "1px solid rgba(212,160,23,0.35)",
  borderRadius: "20px",
  padding: "2px 10px",
  fontSize: "11px",
  color: "#D4A017",
  fontWeight: 700,
}

export default function ProductActions({
  product,
  availability,
  productUrl,
  compare_at_price,
}: Props) {
  const addItem = useCart((s) => s.addItem)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { price, stock_quantity, name, sku } = product
  const tracked = product.track_stock ?? true

  const discount =
    compare_at_price && compare_at_price > price
      ? Math.round((1 - price / compare_at_price) * 100)
      : null

  const waOrderUrl = wa.productOrder(name, sku, qty)
  const waPriceUrl = wa.product(name, sku, productUrl)
  // wa shim returns null when whatsapp number is not yet configured in settings

  const handleAdd = () => {
    if (availability !== "available") return
    addItem(toCartItem(product, qty))
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="space-y-4">
      {/* ── Price block ── */}
      {availability === "price_on_request" ? (
        <div className="text-[28px] font-black leading-none" style={{ color: "#A0A0A0" }}>
          Fiyat Sorunuz
        </div>
      ) : (
        <div className="flex items-end gap-3">
          <div className="text-[32px] font-black leading-none" style={{ color: "#D4A017" }}>
            {(price * qty).toLocaleString("tr-TR")} ₺
          </div>
          {compare_at_price && compare_at_price > price && (
            <>
              <div className="text-[18px] line-through pb-0.5" style={{ color: "#404040" }}>
                {(compare_at_price * qty).toLocaleString("tr-TR")} ₺
              </div>
              {discount !== null && <span style={discountBadge}>%{discount} indirim</span>}
            </>
          )}
        </div>
      )}

      {/* ── Qty stepper ── */}
      {availability !== "price_on_request" && (
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium" style={{ color: "#A0A0A0" }}>
            Adet:
          </span>
          <div
            className="flex items-center overflow-hidden"
            style={{
              background: "#111214",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "10px",
            }}
          >
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Adeti azalt"
              className="px-3 py-2 transition-colors disabled:opacity-30"
              style={{ color: "#A0A0A0" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D4A017")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0A0A0")}
            >
              <Minus size={15} aria-hidden="true" />
            </button>
            <span
              className="px-4 py-2 text-sm font-bold min-w-[3rem] text-center"
              style={{ color: "#F4F4F2" }}
              aria-live="polite"
            >
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => tracked ? Math.min(stock_quantity, q + 1) : q + 1)}
              disabled={(tracked && qty >= stock_quantity) || availability === "out_of_stock"}
              aria-label="Adeti artır"
              className="px-3 py-2 transition-colors disabled:opacity-30"
              style={{ color: "#A0A0A0" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D4A017")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0A0A0")}
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ── Action buttons ── */}
      <div className="flex gap-3">
        {availability === "out_of_stock" ? (
          <div
            className="flex-1 h-12 text-[14px] font-bold flex items-center justify-center gap-2 rounded-[12px]"
            style={{
              background: "rgba(30,30,30,0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "#3E3E3E",
            }}
            aria-label="Bu ürün stokta yok"
          >
            Stok Tükendi
          </div>
        ) : availability === "price_on_request" ? (
          waPriceUrl ? (
            <a
              href={waPriceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-12 text-[14px] font-bold flex items-center justify-center gap-2 rounded-[12px] transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "#22c55e",
              }}
            >
              <WaIcon />
              WhatsApp&apos;tan Fiyat Sorunuz
            </a>
          ) : (
            <div
              className="flex-1 h-12 text-[14px] font-bold flex items-center justify-center rounded-[12px]"
              style={{ background: "rgba(30,30,30,0.5)", border: "1px solid rgba(255,255,255,0.06)", color: "#5A5A5A" }}
            >
              Fiyat Sorunuz
            </div>
          )
        ) : (
          <button
            onClick={handleAdd}
            className="flex-1 h-12 text-[14px] font-bold flex items-center justify-center gap-2 rounded-[12px] transition-all duration-150"
            style={
              added
                ? {
                    background: "rgba(34,197,94,0.12)",
                    color: "#22c55e",
                    border: "1px solid rgba(34,197,94,0.35)",
                  }
                : {
                    background: "#D4A017",
                    color: "#090A0C",
                    boxShadow: "0 2px 16px rgba(212,160,23,0.28)",
                  }
            }
            aria-label={added ? "Sepete eklendi" : "Sepete ekle"}
          >
            {added ? (
              <>
                <CheckCircle size={17} aria-hidden="true" /> Eklendi!
              </>
            ) : (
              <>
                <ShoppingCart size={17} aria-hidden="true" /> Sepete Ekle
              </>
            )}
          </button>
        )}

        {availability !== "price_on_request" && waOrderUrl && (
          <a
            href={waOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp ile sipariş ver"
            className="flex items-center gap-2 px-4 py-3 rounded-[12px] font-medium transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.25)",
              color: "#22c55e",
            }}
          >
            <WaIcon />
            <span className="hidden sm:inline text-[13px]">WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  )
}
