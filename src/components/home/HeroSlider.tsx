import Link from "next/link"

interface Props {
  waLink?: string | null
}

const WaIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function HeroSlider({ waLink }: Props) {
  return (
    <section
      aria-label="Ana sayfa hero bölümü"
      className="relative overflow-hidden"
      style={{ background: "#F1F5F9", borderBottom: "1px solid #E2E6EA" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(37,99,235,0.04) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-28 lg:py-32">
        <div className="max-w-2xl">

          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-6 h-px bg-blue-300" aria-hidden="true" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-blue-600">
              Kombi Yedek Parça
            </span>
          </div>

          <h1 className="text-[42px] md:text-[52px] font-black text-gray-900 mb-4 leading-[1.05]">
            Doğru Parça,<br />
            <span className="text-blue-800">Hızlı Çözüm</span>
          </h1>

          <p className="text-[15px] md:text-[17px] leading-relaxed mb-9 max-w-lg text-gray-600">
            Türkiye&apos;nin kombi yedek parça uzmanı. Orijinal parça, hızlı gönderim.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/urunler"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[14px] text-white transition-all duration-150 hover:-translate-y-0.5 bg-[#1E3A8A] hover:bg-[#1E40AF]"
              style={{ boxShadow: "0 4px 14px rgba(30,58,138,0.20)" }}
            >
              Ürünleri İncele
            </Link>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[14px] transition-all duration-150 hover:-translate-y-0.5 text-green-700 hover:bg-green-50"
                style={{ border: "1px solid rgba(22,163,74,0.35)" }}
              >
                <WaIcon />
                WhatsApp&apos;tan Sor
              </a>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
