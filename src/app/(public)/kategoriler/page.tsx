import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { wa } from "@/lib/whatsapp"
import { kombiCategories } from "@/data/categories"

interface KategoriItem {
  slug: string
  filterSlug?: string
  name: string
  description: string
  icon: string
  productCount: number
  parentCategory: string
}

const kategoriler: KategoriItem[] = [
  { slug: "orijinaller",             name: "Orijinaller",              description: "Orijinal marka yedek parçaları, garantili ve sertifikalı.",                           icon: "⭐", productCount: 0,  parentCategory: "kombi" },
  { slug: "kombi-anakartlari",       name: "Kombi Anakartları",        description: "Baymak, Vaillant, Ferroli ve tüm markalar için orijinal elektronik ana kartlar.", icon: "🔌", productCount: 48, parentCategory: "kombi" },
  { slug: "fan-motorlari",           name: "Fan Motorları",            description: "Kombi iç/dış ünite fan motorları, orijinal ve uyumlu seçenekler.",                 icon: "💨", productCount: 29, parentCategory: "kombi" },
  { slug: "sirkulasyon-pompalari",   name: "Sirkülasyon Pompaları",    description: "Wilo, Grundfos ve orijinal marka sirkülasyon pompaları, tüm kombi modelleri için.", icon: "⚙️", productCount: 22, parentCategory: "kombi" },
  { slug: "gaz-valfleri",            name: "Gaz Valfleri",             description: "Honeywell, SIT ve orijinal gaz valfleri. Güvenli ateşleme için doğru parça.",       icon: "🔥", productCount: 18, parentCategory: "kombi" },
  { slug: "ntc-sensorler",  filterSlug: "ntc-sensor",         name: "NTC Sensörler",            description: "Sıcaklık sensörleri, debi sensörleri ve basınç sensörleri.",                          icon: "🌡️", productCount: 6,  parentCategory: "kombi" },
  { slug: "uc-yollu-vana-motorlari", filterSlug: "3-yollu-motor", name: "Hidrobloklar",          description: "Üç yollu vanalar, aktüatörler ve hidroblok bileşenleri, tüm markalar.",              icon: "🔄", productCount: 4,  parentCategory: "kombi" },
  { slug: "termostatlar",            name: "Termostatlar",             description: "Dijital ve analog oda termostatları, akıllı termostat seçenekleri.",                  icon: "🎛️", productCount: 19, parentCategory: "kombi" },
  { slug: "plaka-esanjorler",        name: "Plaka Eşanjörler",         description: "Bakır ve paslanmaz çelik plaka eşanjörler, tüm kombi güçleri için.",                  icon: "🔁", productCount: 14, parentCategory: "kombi" },
  { slug: "uc-yollu-motorlar",       filterSlug: "3-yollu-motor",  name: "Üç Yollu Motorlar",   description: "Üç yollu vana aktüatör motorları, tüm kombi markaları için.",                       icon: "⚙️", productCount: 4,  parentCategory: "kombi" },
  { slug: "akis-turbinleri",         filterSlug: "su-akis-turbini", name: "Akış Türbinleri",     description: "Kombi debi ölçüm türbinleri ve akış sensörleri.",                                    icon: "🌀", productCount: 10, parentCategory: "kombi" },
  { slug: "akis-salterleri",         filterSlug: "su-akis-salteri", name: "Akış Şalterleri",     description: "Kombi su akış şalterleri ve debi anahtarları.",                                      icon: "🔀", productCount: 5,  parentCategory: "kombi" },
  { slug: "emniyet-ventilleri",      filterSlug: "emniyet-ventili", name: "Emniyet Ventilleri",  description: "Kombi basınç tahliye ve emniyet ventilleri.",                                         icon: "🛡️", productCount: 8,  parentCategory: "kombi" },
  { slug: "dolum-musluklari",        filterSlug: "doldurma-muslugu", name: "Dolum Muslukları",   description: "Kombi sistem dolum muslukları ve şarj vanaları.",                                     icon: "🚿", productCount: 15, parentCategory: "kombi" },
  { slug: "manometreler",            name: "Manometreler",             description: "Kombi sistem basınç göstergeleri ve manometreler.",                                   icon: "🔵", productCount: 0,  parentCategory: "kombi" },
  { slug: "prosestatlar",            filterSlug: "hava-prosestat",  name: "Prosestatlar",        description: "Kombi basınç şalterleri ve presostatlar, tüm güç aralıkları için.",                    icon: "📊", productCount: 1,  parentCategory: "kombi" },
  { slug: "tamir-takimlari",         filterSlug: "tamir-takimi",    name: "Tamir Takımları",     description: "O-ring, conta ve bakım setleri — önleyici bakım için.",                                 icon: "🔧", productCount: 9,  parentCategory: "kombi" },
]

// Local slugs that differ from categories.ts slugs (same semantic category)
const SLUG_TO_CENTRAL: Record<string, string> = {
  "ntc-sensorler":           "sensorler",
  "plaka-esanjorler":        "esanjorler",
  "uc-yollu-vana-motorlari": "uc-yollu-vanalar",
}

const centralImgMap = new Map(
  kombiCategories.map(c => [c.slug, c.thumbImage ?? c.image])
)

function getCatImage(slug: string): string | undefined {
  return centralImgMap.get(SLUG_TO_CENTRAL[slug] ?? slug)
}

export const metadata = {
  title: "Kategoriler — İstanbul Kombi Yedek Parça",
  description: "Kombi yedek parça kategorileri. Cihazınıza uygun parçayı kolayca bulun.",
}

export default function KategorilerPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#F4F4F2" }}>
          Kombi Yedek Parça Kategorileri
        </h1>
        <p className="max-w-2xl" style={{ color: "#666660" }}>
          Parça ihtiyacınıza göre doğru kategoriye gidin.
          Her kategoride orijinal ve uyumlu ürünler sizi bekliyor.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        <Link
          href="/kategoriler"
          className="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:opacity-90"
          style={{ background: "#D4A017", color: "#090A0C" }}
        >
          Tümü
        </Link>
        <Link
          href="/kategoriler?tip=kombi"
          className="px-4 py-2 rounded-full text-sm font-medium transition-colors border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,196,0,0.35)] hover:text-[#D4A017]"
          style={{ background: "#151618", color: "#A0A09A" }}
        >
          🔥 Kombi
        </Link>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kategoriler.map((kat) => {
          const catImage = getCatImage(kat.slug)
          return (
          <Link
            key={kat.slug}
            href={`/urunler?kategori=${kat.filterSlug ?? kat.slug}`}
            className="group rounded-2xl p-5 transition-all hover:-translate-y-0.5 border border-[rgba(255,196,0,0.10)] hover:border-[rgba(255,196,0,0.35)] hover:shadow-[0_4px_20px_rgba(212,160,23,0.10)]"
            style={{ background: "#151618" }}
          >
            <div className="flex items-start justify-between mb-3">
              {catImage ? (
                <div
                  className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0"
                  style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.14)" }}
                >
                  <Image
                    src={catImage}
                    alt={kat.name}
                    fill
                    sizes="40px"
                    className="object-cover object-center transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              ) : (
                <span className="text-3xl">{kat.icon}</span>
              )}
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  background: "rgba(212,160,23,0.08)",
                  border: "1px solid rgba(255,196,0,0.14)",
                  color: "#888882",
                }}
              >
                {kat.productCount} ürün
              </span>
            </div>
            <h2 className="font-bold mb-1.5 transition-colors group-hover:text-[#D4A017]" style={{ color: "#E8E8E2" }}>
              {kat.name}
            </h2>
            <p className="text-sm line-clamp-2 mb-3" style={{ color: "#666660" }}>
              {kat.description}
            </p>
            <div className="flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#D4A017" }}>
              Ürünleri Gör <ChevronRight size={14} />
            </div>
          </Link>
          )
        })}
      </div>

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
          href={wa.home}
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
