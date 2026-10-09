import Link from "next/link"
import { ChevronRight } from "lucide-react"
import ProductImage from "@/components/product/ProductImage"
import { getProductImageUrl } from "@/lib/storefront/types"
import type { StorefrontProductCard } from "@/lib/storefront/types"

interface Props {
  title: string
  products: StorefrontProductCard[]
  viewAllHref: string
  viewAllLabel?: string
  eyebrow?: string
  bg?: string
}

export default function CompactProductRail({
  title,
  products,
  viewAllHref,
  viewAllLabel = "Tümü",
  eyebrow,
  bg = "bg-white",
}: Props) {
  if (products.length === 0) return null

  return (
    <section
      className={bg}
      aria-label={title}
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 md:py-3">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {eyebrow && (
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-blue-600">
                {eyebrow}
              </span>
            )}
            <h2 className="text-[14px] md:text-[15px] font-black text-gray-900 leading-none">
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="flex items-center gap-0.5 text-[11px] font-semibold text-blue-700 hover:text-blue-900 transition-colors shrink-0"
          >
            {viewAllLabel} <ChevronRight size={11} aria-hidden="true" />
          </Link>
        </div>

        {/* Kart şeridi */}
        <div
          className="flex gap-2 overflow-x-auto pb-1.5"
          style={{
            scrollbarWidth: "none",
            scrollSnapType: "x mandatory",
          } as React.CSSProperties}
        >
          {products.map((p) => {
            const discount =
              p.compare_at_price && p.compare_at_price > p.price
                ? Math.round((1 - p.price / p.compare_at_price) * 100)
                : null
            const imageUrl = getProductImageUrl(p.image_url)

            return (
              <Link
                key={p.id}
                href={`/urunler/${p.slug}`}
                className="group shrink-0 flex flex-col overflow-hidden rounded-lg transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  width: "38vw",
                  maxWidth: "185px",
                  minWidth: "135px",
                  scrollSnapAlign: "start",
                  background: "#FFFFFF",
                  border: "1px solid #E2E6EA",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                } as React.CSSProperties}
              >
                {/* Ürün görseli */}
                <div
                  className="relative overflow-hidden"
                  style={{ aspectRatio: "1 / 1", background: "#F8F9FA" }}
                >
                  <ProductImage
                    src={imageUrl}
                    alt={p.name}
                    fill
                    className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 38vw, 185px"
                  />
                  {discount !== null && (
                    <span
                      className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#B91C1C",
                      }}
                    >
                      %{discount}
                    </span>
                  )}
                  {p.is_new && !discount && (
                    <span
                      className="absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: "#2563EB", color: "#FFFFFF" }}
                    >
                      Yeni
                    </span>
                  )}
                </div>

                {/* Bilgi */}
                <div className="flex flex-col flex-1 p-2">
                  {p.brand && (
                    <p className="text-[9px] font-semibold tracking-wide uppercase mb-0.5 text-gray-500 line-clamp-1">
                      {p.brand.name}
                    </p>
                  )}
                  <h3 className="text-[11px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
                    {p.name}
                  </h3>
                  <div className="mt-auto">
                    {p.price > 0 ? (
                      <div className="flex items-end gap-1.5 flex-wrap">
                        <span
                          className="font-black text-[13px] leading-none"
                          style={{ color: "#1E3A8A" }}
                        >
                          {p.price.toLocaleString("tr-TR")} ₺
                        </span>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <span className="text-[10px] line-through text-gray-500 leading-none">
                            {p.compare_at_price.toLocaleString("tr-TR")} ₺
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-gray-400">Fiyat sorunuz</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
