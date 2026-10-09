import Link from "next/link"
import { ChevronRight } from "lucide-react"
import ProductImage from "@/components/product/ProductImage"
import { getProductImageUrl } from "@/lib/storefront/types"
import type { StorefrontProductCard } from "@/lib/storefront/types"

interface Props {
  products: StorefrontProductCard[]
  eyebrow?: string
  title: string
  viewAllHref: string
  viewAllLabel?: string
}

export default function HeroProductCarousel({
  products,
  eyebrow,
  title,
  viewAllHref,
  viewAllLabel = "Tümünü Gör",
}: Props) {
  if (products.length === 0) return null

  return (
    <section
      className="bg-white"
      aria-label={title}
      style={{ borderBottom: "1px solid #E2E6EA" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-5">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div>
            {eyebrow && (
              <div className="flex items-center gap-2 mb-1">
                <span className="w-[4px] h-[4px] rounded-full bg-blue-600" aria-hidden="true" />
                <span className="text-[10px] font-bold tracking-[0.26em] uppercase text-blue-600">
                  {eyebrow}
                </span>
              </div>
            )}
            <h2
              className="font-black text-gray-900"
              style={{ fontSize: "clamp(18px, 2vw, 24px)" }}
            >
              {title}
            </h2>
          </div>
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-[12px] font-semibold text-blue-700 hover:text-blue-900 transition-colors shrink-0"
          >
            {viewAllLabel} <ChevronRight size={12} aria-hidden="true" />
          </Link>
        </div>

        {/* Carousel */}
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
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
                className="group shrink-0 flex flex-col overflow-hidden rounded-xl transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  width: "58vw",
                  maxWidth: "220px",
                  minWidth: "160px",
                  scrollSnapAlign: "start",
                  background: "#FFFFFF",
                  border: "1px solid #E2E6EA",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                {/* Görsel */}
                <div className="relative aspect-square overflow-hidden" style={{ background: "#F8F9FA" }}>
                  <ProductImage
                    src={imageUrl}
                    alt={p.name}
                    fill
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 58vw, 220px"
                  />
                  {discount !== null && (
                    <span
                      className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        color: "#B91C1C",
                      }}
                    >
                      %{discount} indirim
                    </span>
                  )}
                  {p.is_new && (
                    <span
                      className="absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full"
                      style={{ background: "#2563EB", color: "#FFFFFF" }}
                    >
                      Yeni
                    </span>
                  )}
                </div>

                {/* İçerik */}
                <div className="flex flex-col flex-1 p-3">
                  {p.brand && (
                    <p className="text-[9.5px] font-semibold tracking-wide uppercase mb-0.5 text-gray-400">
                      {p.brand.name}
                    </p>
                  )}
                  <h3 className="text-[12.5px] font-semibold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
                    {p.name}
                  </h3>
                  <div className="mt-auto flex items-end gap-2">
                    {p.price > 0 ? (
                      <>
                        <span
                          className="font-black text-[15px] leading-none"
                          style={{ color: "#1E3A8A" }}
                        >
                          {p.price.toLocaleString("tr-TR")} ₺
                        </span>
                        {p.compare_at_price && p.compare_at_price > p.price && (
                          <span className="text-[11px] line-through text-gray-400 leading-none">
                            {p.compare_at_price.toLocaleString("tr-TR")} ₺
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[12px] font-semibold text-gray-400">Fiyat sorunuz</span>
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
