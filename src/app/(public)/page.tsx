import {
  getSameDayStorefrontProducts,
  getDiscountedStorefrontProducts,
  getFeaturedStorefrontProducts,
  getStorefrontProducts,
} from "@/lib/storefront/products"
import { getStorefrontBrands } from "@/lib/storefront/brands"
import { getStorefrontCategories } from "@/lib/storefront/categories"
import Link from "next/link"
import HeroSlider from "@/components/home/HeroSlider"
import CategoryRail from "@/components/home/CategoryRail"
import CategorySection from "@/components/home/CategorySection"
import ProductSection from "@/components/home/ProductSection"
import WhatsAppCTA from "@/components/home/WhatsAppCTA"
import BottomInfoCards from "@/components/home/BottomInfoCards"
import PointerTracker from "@/components/experience/PointerTracker"
import AnimatedSection from "@/components/experience/AnimatedSection"
import { getStoreSettings, validWhatsApp, validPhone } from "@/lib/storefront/settings"
import { buildWa } from "@/lib/whatsapp"

export const revalidate = 300 // ISR: 5 dakikada bir yenile

export default async function HomePage() {
  // Stage 1: categories + non-catalog data in parallel
  const [categories, sameDayProducts, discountedProducts, featuredProducts, brands, settings] = await Promise.all([
    getStorefrontCategories(),
    getSameDayStorefrontProducts(8),
    getDiscountedStorefrontProducts(8),
    getFeaturedStorefrontProducts(8),
    getStorefrontBrands(),
    getStoreSettings(),
  ])

  // Featured categories drive the product rails — admin controls which show via is_featured + sort_order
  const featuredCats = categories.filter(c => c.is_featured).slice(0, 3)

  // Stage 2: product queries for each featured category
  const catProductResults = featuredCats.length > 0
    ? await Promise.all(featuredCats.map(cat =>
        getStorefrontProducts({ categorySlug: cat.slug, sort: "featured", pageSize: 8 })
      ))
    : []

  const validWa = validWhatsApp(settings.whatsapp)
  const wa = buildWa(validWa)
  const validPh = validPhone(settings.phone)

  const catRailData = featuredCats.map((cat, i) => ({
    id:          cat.slug,
    slug:        cat.slug,
    eyebrow:     cat.name,
    title:       cat.name,
    description: cat.description ?? "",
    href:        `/urunler?kategori=${cat.slug}`,
    products:    catProductResults[i].items,
  }))

  const brandNames = brands.map((b) => b.name)

  return (
    <>
      <PointerTracker />

      {/* ─── 1. Kategori Rail — header/search'ün hemen altı ─── */}
      <CategoryRail categories={categories} />

      {/* ─── 2. Hero ─── */}
      <HeroSlider waLink={wa.home} />

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

      {/* ─── 9. Fırsat Ürünleri (indirimli) ─── */}
      {discountedProducts.length > 0 && (
        <AnimatedSection
          variant="fade-up"
          as="div"
          style={{ background: "#0A0B0D" } as React.CSSProperties}
        >
          <ProductSection
            eyebrow="Fırsatlar"
            title="Fırsat Ürünleri"
            description="Özel fiyatlarla kombi yedek parçaları"
            products={discountedProducts}
            viewAllHref="/urunler"
          />
        </AnimatedSection>
      )}

      {/* ─── 9b. En Çok Satanlar (admin is_featured flag) ─── */}
      {featuredProducts.length > 0 && (
        <AnimatedSection
          variant="fade-up"
          as="div"
          style={{ background: "#090A0C" } as React.CSSProperties}
        >
          <ProductSection
            eyebrow="Popüler"
            title="En Çok Satanlar"
            description="Müşterilerimizin en çok tercih ettiği yedek parçalar"
            products={featuredProducts}
            viewAllHref="/urunler"
          />
        </AnimatedSection>
      )}

      {/* ─── 10. Aynı Gün Kargo ─── */}
      <AnimatedSection variant="fade-up" as="div">
        <ProductSection
          eyebrow="Hızlı Teslimat"
          title="Aynı Gün Kargo"
          description={settings.shippingCutoff ? `Saat ${settings.shippingCutoff}'ya kadar sipariş verin, bugün kargoda olsun` : "Hafta içi iş saatlerinde sipariş verin, bugün kargoda olsun"}
          products={sameDayProducts}
          viewAllHref="/urunler"
          viewAllLabel="Tümünü Gör"
        />
      </AnimatedSection>

      {/* ─── 13. Alt 3 Kart ─── */}
      <BottomInfoCards />

      {/* ─── 14. WhatsApp CTA ─── */}
      <WhatsAppCTA
        waLink={wa.home}
        phone={validPh}
        phoneDisplay={validPh ? settings.phone : null}
      />
    </>
  )
}
