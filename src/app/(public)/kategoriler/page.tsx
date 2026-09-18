import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { wa } from "@/lib/whatsapp"
import { getStorefrontCategories } from "@/lib/storefront/categories"

export const metadata = {
  title: "Kategoriler",
  description: "Kombi yedek parça kategorileri. Cihazınıza uygun parçayı kolayca bulun.",
}

export default async function KategorilerPage() {
  const categories = await getStorefrontCategories()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#F4F4F2" }}>
          Yedek Parça Kategorileri
        </h1>
        <p className="max-w-2xl" style={{ color: "#666660" }}>
          Parça ihtiyacınıza göre doğru kategoriye gidin.
          Her kategoride orijinal ve uyumlu ürünler sizi bekliyor.
        </p>
      </div>

      {/* Category grid */}
      {categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg mb-2" style={{ color: "#555550" }}>Henüz kategori eklenmedi.</p>
          <p className="text-sm" style={{ color: "#3A3A38" }}>
            Admin panelinden kategoriler oluşturulduğunda burada görünecek.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/urunler?kategori=${cat.slug}`}
              className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5 border border-[rgba(255,196,0,0.10)] hover:border-[rgba(255,196,0,0.35)] hover:shadow-[0_4px_20px_rgba(212,160,23,0.10)]"
              style={{ background: "#151618" }}
            >
              <div className="flex items-start justify-between mb-3">
                {cat.image_url ? (
                  <div
                    className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                    style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.14)" }}
                  >
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      sizes="40px"
                      className="object-cover object-center transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.14)" }}
                  >
                    <span className="text-base font-bold" style={{ color: "rgba(212,160,23,0.5)" }}>
                      {cat.name.charAt(0)}
                    </span>
                  </div>
                )}
                {cat.productCount > 0 && (
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(212,160,23,0.08)",
                      border: "1px solid rgba(255,196,0,0.14)",
                      color: "#888882",
                    }}
                  >
                    {cat.productCount} ürün
                  </span>
                )}
              </div>
              <h2 className="font-bold mb-1.5 transition-colors group-hover:text-[#D4A017]" style={{ color: "#E8E8E2" }}>
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-sm line-clamp-2 mb-3" style={{ color: "#666660" }}>
                  {cat.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#D4A017" }}>
                Ürünleri Gör <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <div
        className="mt-10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: "#D4A017" }}
      >
        <div>
          <div className="font-bold text-lg mb-1" style={{ color: "#090A0C" }}>
            Kategori bulamadınız mı?
          </div>
          <div className="text-sm" style={{ color: "rgba(9,10,12,0.70)" }}>
            Aradığınız parçayı WhatsApp&apos;tan tarif edin, 5 dakikada bulalım.
          </div>
        </div>
        <a
          href={wa.home ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold px-6 py-3 rounded-xl transition-colors shrink-0 text-sm hover:opacity-90"
          style={{ background: "#090A0C", color: "#D4A017" }}
        >
          WhatsApp&apos;tan Sor
        </a>
      </div>
    </div>
  )
}
