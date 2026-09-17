import {
  getSameDayStorefrontProducts,
  getDiscountedStorefrontProducts,
  getStorefrontProducts,
} from "@/lib/storefront/products"
import { getStorefrontBrands } from "@/lib/storefront/brands"
import Link from "next/link"
import HeroSlider from "@/components/home/HeroSlider"
import CategoryRail from "@/components/home/CategoryRail"
import CategorySection from "@/components/home/CategorySection"
import ProductSection from "@/components/home/ProductSection"
import WhatsAppCTA from "@/components/home/WhatsAppCTA"
import BottomInfoCards from "@/components/home/BottomInfoCards"
import PointerTracker from "@/components/experience/PointerTracker"
import AnimatedSection from "@/components/experience/AnimatedSection"
import { site } from "@/config/site"

export const revalidate = 300 // ISR: 5 dakikada bir yenile

// 3 kategori bazlı ürün rail — DB'deki en hacimli kategoriler (slug DB'den)
// doldurma-muslugu:14  su-akis-turbini:9  tamir-takimi:9
const CAT_RAILS = [
  {
    id: "doldurma-muslugu",
    slug: "doldurma-muslugu",
    eyebrow: "Doldurma Musluğu",
    title: "Doldurma Muslukları",
    description: "Kombi sistem dolum muslukları ve şarj vanaları — tüm markalar",
    href: "/urunler?kategori=doldurma-muslugu",
  },
  {
    id: "su-akis-turbini",
    slug: "su-akis-turbini",
    eyebrow: "Akış Türbini",
    title: "Su Akış Türbinleri",
    description: "Kombi debi ölçüm türbinleri — hassas ölçüm, uzun ömür",
    href: "/urunler?kategori=su-akis-turbini",
  },
  {
    id: "tamir-takimi",
    slug: "tamir-takimi",
    eyebrow: "Tamir Takımı",
    title: "Tamir Takımları",
    description: "O-ring, conta ve bakım setleri — önleyici bakım için",
    href: "/urunler?kategori=tamir-takimi",
  },
]

export default async function HomePage() {
  const [
    sameDayProducts,
    discountedProducts,
    pompaResult,
    esanResult,
    elektronikResult,
    brands,
  ] = await Promise.all([
    getSameDayStorefrontProducts(8),
    getDiscountedStorefrontProducts(8),
    getStorefrontProducts({ categorySlug: "doldurma-muslugu", sort: "featured", pageSize: 8 }),
    getStorefrontProducts({ categorySlug: "su-akis-turbini",  sort: "featured", pageSize: 8 }),
    getStorefrontProducts({ categorySlug: "tamir-takimi",     sort: "featured", pageSize: 8 }),
    getStorefrontBrands(),
  ])

  const catRailData = [
    { ...CAT_RAILS[0], products: pompaResult.items },
    { ...CAT_RAILS[1], products: esanResult.items },
    { ...CAT_RAILS[2], products: elektronikResult.items },
  ]

  const brandNames = brands.map((b) => b.name)

  return (
    <>
      <PointerTracker />

      {/* ─── 1. Kategori Rail — header/search'ün hemen altı ─── */}
      <CategoryRail />

      {/* ─── 2. Hero ─── */}
      <HeroSlider />

      {/* ─── 3. Popüler Kategoriler ─── */}
      <AnimatedSection variant="fade-up" as="div">
        <CategorySection />
      </AnimatedSection>

      {/* ─── 5–7. Kategori Bazlı Ürün Rail'leri (3 adet) ─── */}
      {catRailData.map((cat, idx) => {
        if (cat.products.length === 0) return null
        return (
          <AnimatedSection
            key={cat.id}
            variant="fade-up"
            as="div"
            style={(idx % 2 === 0 ? { background: "#090A0C" } : { background: "#0A0B0D" }) as React.CSSProperties}
          >
            <ProductSection
              eyebrow={cat.eyebrow}
              title={cat.title}
              description={cat.description}
              products={cat.products}
              viewAllHref={cat.href}
            />
          </AnimatedSection>
        )
      })}

      {/* ─── 8. Uyumlu Markalar ─── */}
      {brandNames.length > 0 && (
        <section
          aria-label="Uyumlu cihaz markaları"
          style={{
            background: "#090A0C",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
            <div className="flex items-center justify-center gap-2 mb-2.5">
              <span
                className="w-[4px] h-[4px] rounded-full"
                style={{ background: "#D4A017", boxShadow: "0 0 5px rgba(212,160,23,0.70)" }}
                aria-hidden="true"
              />
              <span
                className="text-[10px] font-bold tracking-[0.26em] uppercase"
                style={{ color: "#D4A017" }}
              >
                Desteklenen Markalar
              </span>
            </div>
            <h2
              className="text-center font-black mb-7"
              style={{ color: "#F4F4F2", fontSize: "clamp(18px, 1.8vw, 22px)" }}
            >
              Uyumlu Markalar
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {brandNames.map((brand) => (
                <Link
                  key={brand}
                  href={`/urunler?marka=${encodeURIComponent(brand)}`}
                  className="px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-150 hover:-translate-y-0.5 text-[#A5A5A5] hover:text-[#D4A017]"
                  style={{ background: "#151618", border: "1px solid rgba(255,196,0,0.12)" }}
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 9. İndirimli Ürünler ─── */}
      <AnimatedSection
        variant="fade-up"
        as="div"
        style={{ background: "#0A0B0D" } as React.CSSProperties}
      >
        <ProductSection
          eyebrow="Fırsatlar"
          title="İndirimli Ürünler"
          description="Fırsatı kaçırma — indirimli kombi parçaları"
          products={discountedProducts}
          viewAllHref="/urunler"
        />
      </AnimatedSection>

      {/* ─── 10. Aynı Gün Kargo ─── */}
      <AnimatedSection variant="fade-up" as="div">
        <ProductSection
          eyebrow="Hızlı Teslimat"
          title="Aynı Gün Kargo"
          description={`Saat ${site.shippingCutoff}'ya kadar sipariş verin, bugün kargoda olsun`}
          products={sameDayProducts}
          viewAllHref="/urunler"
          viewAllLabel="Tümünü Gör"
        />
      </AnimatedSection>

      {/* ─── 13. Alt 3 Kart ─── */}
      <BottomInfoCards />

      {/* ─── 14. WhatsApp CTA ─── */}
      <WhatsAppCTA />
    </>
  )
}
