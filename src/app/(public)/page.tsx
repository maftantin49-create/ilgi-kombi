import {
  getSameDayStorefrontProducts,
  getDiscountedStorefrontProducts,
  getFeaturedStorefrontProducts,
  getStorefrontProducts,
} from "@/lib/storefront/products"
import { getStorefrontBrands } from "@/lib/storefront/brands"
import { getStorefrontCategories } from "@/lib/storefront/categories"
import CategoryRail from "@/components/home/CategoryRail"
import PopularCategories from "@/components/home/PopularCategories"
import CategoryGrid from "@/components/home/CategoryGrid"
import ProductSection from "@/components/home/ProductSection"
import HeroProductCarousel from "@/components/home/HeroProductCarousel"
import BottomInfoCards from "@/components/home/BottomInfoCards"
import BrandChips from "@/components/home/BrandChips"
import PointerTracker from "@/components/experience/PointerTracker"
import AnimatedSection from "@/components/experience/AnimatedSection"
import { getStoreSettings } from "@/lib/storefront/settings"

export const revalidate = 300

export default async function HomePage() {
  const [categories, sameDayProducts, discountedProducts, featuredProducts, brands, settings] = await Promise.all([
    getStorefrontCategories(),
    getSameDayStorefrontProducts(8),
    getDiscountedStorefrontProducts(8),
    getFeaturedStorefrontProducts(8),
    getStorefrontBrands(),
    getStoreSettings(),
  ])

  const featuredCats = categories.filter(c => c.is_featured).slice(0, 3)

  const catProductResults = featuredCats.length > 0
    ? await Promise.all(featuredCats.map(cat =>
        getStorefrontProducts({ categorySlug: cat.slug, sort: "featured", pageSize: 8 })
      ))
    : []

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

      {/* ─── 1. Popüler Kategoriler — daire tile'lar ─── */}
      <PopularCategories categories={categories} />

      {/* ─── 2. Öne Çıkan Ürünler — hero carousel ─── */}
      {featuredProducts.length > 0 && (
        <HeroProductCarousel
          eyebrow="Öne Çıkan"
          title="En Çok Satanlar"
          products={featuredProducts}
          viewAllHref="/urunler"
        />
      )}

      {/* ─── 3. Tüm Parça Grupları grid ─── */}
      <CategoryGrid categories={categories} />

      {/* ─── 4. Fırsat Ürünleri ─── */}
      {discountedProducts.length > 0 && (
        <AnimatedSection variant="fade-up" as="div" className="bg-white">
          <ProductSection
            eyebrow="Fırsatlar"
            title="Fırsat Ürünleri"
            description="Özel fiyatlarla kombi yedek parçaları"
            products={discountedProducts}
            viewAllHref="/urunler"
          />
        </AnimatedSection>
      )}

      {/* ─── 5. Trust Bar ─── */}
      <div className="bg-white border-b border-gray-100">
        <BottomInfoCards />
      </div>

      {/* ─── 6. Hızlı Kategori Şeridi ─── */}
      <CategoryRail categories={categories} />

      {/* ─── 7. Uyumlu Markalar ─── */}
      {brandNames.length > 0 && (
        <section
          className="bg-[#F8F9FA]"
          aria-label="Uyumlu cihaz markaları"
          style={{ borderBottom: "1px solid #E2E6EA" }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-[4px] h-[4px] rounded-full bg-blue-600" aria-hidden="true" />
              <span className="text-[10px] font-bold tracking-[0.26em] uppercase text-blue-600">
                Desteklenen Markalar
              </span>
            </div>
            <h2
              className="font-black mb-5 text-gray-900"
              style={{ fontSize: "clamp(17px, 1.6vw, 20px)" }}
            >
              Uyumlu Markalar
            </h2>
            <BrandChips brands={brandNames} />
          </div>
        </section>
      )}

      {/* ─── 8. Kategori Bazlı Ürün Rail'leri ─── */}
      {catRailData.map((cat, idx) => {
        if (cat.products.length === 0) return null
        return (
          <AnimatedSection
            key={cat.id}
            variant="fade-up"
            as="div"
            className={idx % 2 === 0 ? "bg-white" : "bg-[#F8F9FA]"}
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

      {/* ─── 9. Aynı Gün Kargo ─── */}
      {sameDayProducts.length > 0 && (
        <AnimatedSection variant="fade-up" as="div" className="bg-[#EFF6FF]">
          <ProductSection
            eyebrow="Hızlı Teslimat"
            title="Aynı Gün Kargo"
            description={settings.shippingCutoff ? `Saat ${settings.shippingCutoff}'ya kadar sipariş verin, bugün kargoda olsun` : "Hafta içi iş saatlerinde sipariş verin, bugün kargoda olsun"}
            products={sameDayProducts}
            viewAllHref="/urunler"
            viewAllLabel="Tümünü Gör"
          />
        </AnimatedSection>
      )}
    </>
  )
}
