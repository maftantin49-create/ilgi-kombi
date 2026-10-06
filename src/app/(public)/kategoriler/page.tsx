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
    <div className="max-w-6xl mx-auto px-4 py-10 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3 text-gray-900">
          Yedek Parça Kategorileri
        </h1>
        <p className="max-w-2xl text-gray-500">
          Parça ihtiyacınıza göre doğru kategoriye gidin.
          Her kategoride orijinal ve uyumlu ürünler sizi bekliyor.
        </p>
      </div>

      {/* Category grid */}
      {categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg mb-2 text-gray-400">Henüz kategori eklenmedi.</p>
          <p className="text-sm text-gray-300">
            Admin panelinden kategoriler oluşturulduğunda burada görünecek.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kategoriler/${cat.slug}`}
              className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5 border border-[#E2E6EA] hover:border-[#93C5FD] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
              style={{ background: "#FFFFFF" }}
            >
              <div className="flex items-start justify-between mb-3">
                {cat.image_url ? (
                  <div
                    className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                    style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
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
                    style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
                  >
                    <span className="text-base font-bold text-blue-300">
                      {cat.name.charAt(0)}
                    </span>
                  </div>
                )}
                {cat.productCount > 0 && (
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full text-gray-500"
                    style={{
                      background: "#F1F3F5",
                      border: "1px solid #E2E6EA",
                    }}
                  >
                    {cat.productCount} ürün
                  </span>
                )}
              </div>
              <h2 className="font-bold mb-1.5 transition-colors text-gray-800 group-hover:text-blue-700">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="text-sm line-clamp-2 mb-3 text-gray-500">
                  {cat.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                Ürünleri Gör <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* CTA */}
      <div
        className="mt-10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ background: "#1E3A8A" }}
      >
        <div>
          <div className="font-bold text-lg mb-1 text-white">
            Kategori bulamadınız mı?
          </div>
          <div className="text-sm text-blue-200">
            Aradığınız parçayı WhatsApp&apos;tan tarif edin, 5 dakikada bulalım.
          </div>
        </div>
        <a
          href={wa.home ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold px-6 py-3 rounded-xl transition-colors shrink-0 text-sm text-white hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.20)" }}
        >
          WhatsApp&apos;tan Sor
        </a>
      </div>
    </div>
  )
}
