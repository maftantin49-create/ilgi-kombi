import { cache } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type { CSSProperties } from "react"
import Link from "next/link"
import {
  ArrowLeft, Shield, Truck, RotateCcw, CheckCircle, Package,
} from "lucide-react"
import {
  getStorefrontProductBySlug,
  getRelatedStorefrontProducts,
} from "@/lib/storefront/products"
import {
  getProductAvailability,
  canAddToCart,
  PRODUCT_IMAGE_PLACEHOLDER,
  type StorefrontCompatibleDevice,
  type StorefrontProductDetail,
} from "@/lib/storefront/types"
import StorefrontProductCard from "@/components/product/StorefrontProductCard"
import ProductGallery from "@/components/product/ProductGallery"
import ProductActions from "@/components/product/ProductActions"
import { siteConfig } from "@/config/site"
import { getStoreSettings, validWhatsApp } from "@/lib/storefront/settings"
import { buildWa } from "@/lib/whatsapp"

// ── Per-request cache — prevents double DB fetch (generateMetadata + page) ────
const getCachedProduct = cache(getStorefrontProductBySlug)

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    return { title: "Ürün Bulunamadı" }
  }

  const title = product.seo_title || product.name

  const desc = product.seo_description
    || (product.description
      ? product.description.slice(0, 155).replace(/\s+/g, " ").trim()
      : [product.name, product.brand?.name, product.category?.name]
          .filter(Boolean)
          .join(" — "))

  const ogImage = product.image_url ?? product.images[0]?.url ?? null

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${siteConfig.url}/urunler/${slug}`,
    },
    openGraph: ogImage
      ? {
          images: [{ url: ogImage }],
          title,
          description: desc,
        }
      : undefined,
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildGalleryImages(product: StorefrontProductDetail): string[] {
  const urls: string[] = []
  const seen = new Set<string>()

  // product_images already sorted by sort_order in the query layer
  for (const img of product.images) {
    if (!seen.has(img.url)) {
      seen.add(img.url)
      urls.push(img.url)
    }
  }

  // Prepend image_url if it's not already in the gallery (dedup by URL)
  if (product.image_url && !seen.has(product.image_url)) {
    urls.unshift(product.image_url)
  }

  return urls.length > 0 ? urls : [PRODUCT_IMAGE_PLACEHOLDER]
}

function yearRange(from: number | null, to: number | null): string {
  if (!from && !to) return ""
  if (from && to) return `${from} – ${to}`
  if (from) return `${from}+`
  return `– ${to}`
}

// ── Shared style objects ──────────────────────────────────────────────────────

const badge: CSSProperties = {
  background: "#F1F3F5",
  border: "1px solid #E2E6EA",
  borderRadius: "20px",
  padding: "2px 10px",
  fontSize: "11px",
  color: "#374151",
}

const surface: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E6EA",
  borderRadius: "16px",
}

const sectionHeader: CSSProperties = {
  borderBottom: "1px solid #E2E6EA",
}

// ── JSON-LD builders ─────────────────────────────────────────────────────────

function buildJsonLd(
  product: StorefrontProductDetail,
  primaryImage: string,
  productUrl: string,
  shippingCost: number,
  freeShippingThreshold: number,
  siteName: string,
  siteUrl: string
): object | null {
  if (product.price <= 0) return null

  const desc =
    product.seo_description ||
    (product.description ? product.description.slice(0, 500).trim() : undefined)

  // Standard shipping tier (always present)
  const standardShipping = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: shippingCost, currency: "TRY" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "TR" },
  }

  // Free shipping tier (only when a threshold is configured)
  const freeShipping = freeShippingThreshold > 0
    ? {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "TRY" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "TR" },
        eligibleTransactionVolume: {
          "@type": "PriceSpecification",
          minPrice: freeShippingThreshold,
          priceCurrency: "TRY",
        },
      }
    : null

  const shippingDetails = freeShipping
    ? [standardShipping, freeShipping]
    : standardShipping

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    url: productUrl,
    ...(desc ? { description: desc } : {}),
    ...(primaryImage !== PRODUCT_IMAGE_PLACEHOLDER ? { image: [primaryImage] } : {}),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand.name } }
      : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "TRY",
      price: product.price,
      availability:
        canAddToCart(product)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
      },
      shippingDetails,
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/OriginalShippingFees",
      },
    },
  }
}

function buildBreadcrumbJsonLd(
  product: StorefrontProductDetail,
  productUrl: string,
  siteUrl: string
): object {
  const items: object[] = [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: siteUrl },
    { "@type": "ListItem", position: 2, name: "Ürünler",   item: `${siteUrl}/urunler` },
  ]
  if (product.category) {
    items.push({ "@type": "ListItem", position: 3, name: product.category.name, item: `${siteUrl}/kategoriler/${product.category.slug}` })
    items.push({ "@type": "ListItem", position: 4, name: product.name, item: productUrl })
  } else {
    items.push({ "@type": "ListItem", position: 3, name: product.name, item: productUrl })
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, storeSettings] = await Promise.all([
    getCachedProduct(slug),
    getStoreSettings(),
  ])
  if (!product) notFound()

  const related = await getRelatedStorefrontProducts(
    product.id,
    product.category?.id ?? null,
    4
  )

  const availability = getProductAvailability(product)
  const galleryImages = buildGalleryImages(product)
  const productUrl = `${siteConfig.url}/urunler/${product.slug}`
  const waCompat = buildWa(validWhatsApp(storeSettings.whatsapp)).productCompat(product.name, productUrl)

  const discount =
    product.compare_at_price && product.compare_at_price > product.price
      ? Math.round((1 - product.price / product.compare_at_price) * 100)
      : null

  // Group compatible devices by brand for display
  const devicesByBrand = product.compatible_devices.reduce<
    Record<string, StorefrontCompatibleDevice[]>
  >((acc, d) => {
    const key = d.brand.name
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {})

  // Unique brand names shown in right panel chips
  const compatBrandNames = Object.keys(devicesByBrand)

  const jsonLd = buildJsonLd(product, galleryImages[0], productUrl, storeSettings.shippingCost, storeSettings.freeShippingThreshold, storeSettings.siteName, siteConfig.url)
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(product, productUrl, siteConfig.url)

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 bg-white min-h-screen">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav
        className="text-[12px] mb-6 flex items-center gap-1.5 flex-wrap text-gray-500"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-blue-700 transition-colors">
          Ana Sayfa
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/urunler" className="hover:text-blue-700 transition-colors">
          Ürünler
        </Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              href={`/kategoriler/${product.category.slug}`}
              className="hover:text-blue-700 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-gray-800 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* ── Main grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[52%_48%] gap-8 md:gap-10 mb-10">

        {/* Left — Gallery (client component) */}
        <ProductGallery
          images={galleryImages}
          productName={product.name}
          isNew={product.is_new}
          discount={discount}
        />

        {/* Right — Info panel */}
        <div>
          {/* SKU + Brand badges */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span style={badge}>SKU: {product.sku}</span>
            {product.brand && <span style={badge}>{product.brand.name}</span>}
          </div>

          <h1 className="text-[24px] font-bold text-gray-900 mb-4 leading-snug">
            {product.name}
          </h1>

          {/* Stock + Shipping status */}
          <div className="space-y-2 mb-5">
            {availability === "available" && (
              <div
                className="flex items-center gap-1.5 text-[13px] font-medium"
                style={{ color: "#22c55e" }}
              >
                <CheckCircle size={14} aria-hidden="true" />
                Stokta var — {product.stock_quantity} adet
              </div>
            )}
            {availability === "out_of_stock" && (
              <div
                className="text-[13px] font-medium"
                style={{ color: "#ef4444" }}
              >
                Stok tükendi
              </div>
            )}
            {product.same_day_shipping && (
              <div
                className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500"
              >
                <Truck size={14} style={{ color: "#2563EB" }} aria-hidden="true" />
                {storeSettings.shippingCutoff
                  ? `Saat ${storeSettings.shippingCutoff}'ya kadar sipariş verin, bugün kargoya çıkar`
                  : "Aynı gün kargoya çıkar"
                }
              </div>
            )}
            {storeSettings.freeShippingThreshold > 0 && (
              <div
                className="flex items-center gap-1.5 text-[13px] text-gray-400"
              >
                <Package size={14} aria-hidden="true" />
                {storeSettings.freeShippingThreshold} ₺ üzeri ücretsiz kargo
              </div>
            )}
          </div>

          {/* Compatible brands — compact chip list */}
          {compatBrandNames.length > 0 && (
            <div
              className="rounded-[14px] p-4 mb-5"
              style={{
                background: "rgba(37,99,235,0.06)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <h3
                className="text-[12px] font-semibold mb-2.5 text-gray-600"
              >
                Bu parça hangi cihazlara uyar?
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatBrandNames.map((name) => (
                  <span
                    key={name}
                    className="text-[12px] font-medium px-3 py-1 rounded-[8px]"
                    style={{
                      background: "#F1F3F5",
                      border: "1px solid #E2E6EA",
                      color: "#374151",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price + Qty + Buttons (client component) */}
          <ProductActions
            product={product}
            availability={availability}
            productUrl={productUrl}
            compare_at_price={product.compare_at_price}
          />

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-2 mt-5">
            {[
              { icon: <Shield size={13} />, text: "Orijinal parça garantisi" },
              { icon: <Truck size={13} />, text: storeSettings.freeShippingThreshold > 0 ? `Ücretsiz kargo (${storeSettings.freeShippingThreshold.toLocaleString("tr-TR")}₺ üzeri)` : "Hızlı teslimat" },
              { icon: <RotateCcw size={13} />, text: "14 gün iade hakkı" },
              { icon: <CheckCircle size={13} />, text: "Güvenli ödeme" },
            ].map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[11px] rounded-[10px] p-2.5 text-gray-500"
                style={{
                  background: "#F8F9FA",
                  border: "1px solid #E2E6EA",
                }}
              >
                <span style={{ color: "#2563EB" }} aria-hidden="true">
                  {b.icon}
                </span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────── */}
      {product.description && (
        <div className="mb-8 overflow-hidden" style={surface}>
          <div className="px-6 py-4" style={sectionHeader}>
            <h2 className="font-bold text-[17px] text-gray-900">Ürün Açıklaması</h2>
          </div>
          <div className="p-6">
            <p
              className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-600"
            >
              {product.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Specifications ────────────────────────────────────── */}
      {product.specifications.length > 0 && (
        <div className="mb-8 overflow-hidden" style={surface}>
          <div className="px-6 py-4" style={sectionHeader}>
            <h2 className="font-bold text-[17px] text-gray-900">Teknik Özellikler</h2>
          </div>
          <div className="p-6">
            <table
              className="w-full text-[13px]"
              aria-label="Teknik özellikler tablosu"
            >
              <tbody>
                {product.specifications.map((spec) => (
                  <tr
                    key={spec.id}
                    style={{ borderBottom: "1px solid #E2E6EA" }}
                  >
                    <td
                      className="py-2.5 pr-4 w-2/5 font-medium text-gray-400"
                    >
                      {spec.spec_key}
                    </td>
                    <td className="py-2.5 text-gray-800">
                      {spec.spec_value}
                      {spec.unit && (
                        <span className="ml-1 text-gray-400">
                          {spec.unit}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Persistent installation warning */}
            <div
              className="mt-5 p-4 rounded-[12px] text-[13px] text-gray-600"
              style={{
                background: "rgba(37,99,235,0.04)",
                border: "1px solid rgba(37,99,235,0.15)",
              }}
            >
              <strong style={{ color: "#1E3A8A" }}>Montaj Uyarısı:</strong>{" "}
              Yedek parça değişimi yetkili servis veya deneyimli teknisyen
              tarafından yapılmalıdır. Hatalı montaj garanti kapsamını iptal eder.
            </div>
          </div>
        </div>
      )}

      {/* ── OEM Codes ─────────────────────────────────────────── */}
      {product.oem_codes.length > 0 && (
        <div className="mb-8 overflow-hidden" style={surface}>
          <div className="px-6 py-4" style={sectionHeader}>
            <h2 className="font-bold text-[17px] text-gray-900">
              OEM / Orijinal Parça Kodları
            </h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {product.oem_codes.map((oem) => (
                <div
                  key={oem.id}
                  className="rounded-[10px] px-3 py-2"
                  style={{
                    background: "#F8F9FA",
                    border: "1px solid #E2E6EA",
                  }}
                >
                  <code
                    className="text-[13px] font-mono font-semibold block text-gray-900"
                  >
                    {oem.code}
                  </code>
                  {oem.manufacturer && (
                    <span
                      className="text-[11px] block mt-0.5 text-gray-400"
                    >
                      {oem.manufacturer}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Compatible Devices ────────────────────────────────── */}
      {product.compatible_devices.length > 0 && (
        <div className="mb-8 overflow-hidden" style={surface}>
          <div className="px-6 py-4" style={sectionHeader}>
            <h2 className="font-bold text-[17px] text-gray-900">Uyumlu Cihazlar</h2>
          </div>
          <div className="p-6 space-y-6">
            {Object.entries(devicesByBrand).map(([brandName, devices]) => (
              <div key={brandName}>
                <h3
                  className="text-[13px] font-bold mb-3 uppercase tracking-wide"
                  style={{ color: "#1E3A8A" }}
                >
                  {brandName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {devices.map((d) => {
                    const yr = yearRange(d.year_from, d.year_to)
                    const subtitle = [d.family, d.series].filter(Boolean).join(" / ")
                    return (
                      <div
                        key={d.id}
                        className="rounded-[10px] px-3 py-2.5"
                        style={{
                          background: "#F8F9FA",
                          border: "1px solid #E2E6EA",
                        }}
                      >
                        <div
                          className="text-[13px] font-medium text-gray-900"
                        >
                          {d.model}
                        </div>
                        {subtitle && (
                          <div
                            className="text-[11px] mt-0.5 text-gray-400"
                          >
                            {subtitle}
                          </div>
                        )}
                        {yr && (
                          <div
                            className="text-[11px] mt-0.5 text-gray-400"
                          >
                            {yr}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Related products ──────────────────────────────────── */}
      {related.length > 0 && (
        <section aria-label="Benzer ürünler" className="mb-10">
          <h2 className="text-[19px] font-bold text-gray-900 mb-4">Benzer Ürünler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
              <StorefrontProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* WhatsApp compatibility CTA */}
      {waCompat && (
        <div
          className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[18px] mb-6"
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <div>
            <p className="font-semibold text-gray-900">
              &quot;Bu parça cihazıma uyar mı?&quot;
            </p>
            <p className="text-[13px] mt-0.5 text-gray-500">
              Cihaz modelinizi yazın, uzmanımız onaylasın.
            </p>
          </div>
          <a
            href={waCompat}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-[10px] font-medium text-[13px] transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.30)",
              color: "#22c55e",
            }}
          >
            <svg
              className="w-[18px] h-[18px] shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp&apos;tan Sor
          </a>
        </div>
      )}

      {/* ── Back link ─────────────────────────────────────────── */}
      <Link
        href="/urunler"
        className="inline-flex items-center gap-1.5 text-[13px] transition-colors text-gray-500 hover:text-blue-700"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Tüm ürünlere dön
      </Link>
    </div>
  )
}
