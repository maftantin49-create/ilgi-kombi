import { ShieldCheck, Zap, Headphones } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface InfoCard {
  icon: LucideIcon
  title: string
  desc: string
}

const cards: InfoCard[] = [
  {
    icon: ShieldCheck,
    title: "Orijinal Ürün Güvencesi",
    desc: "Stokumuzda yalnızca orijinal, OEM ve sertifikalı uyumlu parçalar bulunmaktadır.",
  },
  {
    icon: Zap,
    title: "Aynı Gün Kargo",
    desc: "Stoklu ürünlerde iş günleri 15:00'a kadar verilen siparişler aynı gün kargoya verilir.",
  },
  {
    icon: Headphones,
    title: "Uzman Teknik Destek",
    desc: "WhatsApp üzerinden uzman ekibimize anlık ulaşın, doğru parçayı birlikte bulalım.",
  },
]

export default function BottomInfoCards() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:py-10 lg:py-12"
      aria-label="Hizmetlerimiz"
    >
      {/* Mobile: yatay scroll; Desktop: 3-kolon grid */}
      <div
        className="flex md:grid md:grid-cols-3 gap-3 md:gap-5 overflow-x-auto md:overflow-visible pb-1 md:pb-0"
        style={{ scrollbarWidth: "none" } as React.CSSProperties}
      >
        {cards.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-3 md:gap-5 p-4 md:p-6 rounded-xl shrink-0 w-72 md:w-auto"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E6EA",
            }}
          >
            <div
              className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl shrink-0"
              style={{
                background: "rgba(37,99,235,0.06)",
                border: "1px solid rgba(37,99,235,0.12)",
              }}
            >
              <Icon size={18} className="text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-[13px] md:text-[14px] mb-1 md:mb-1.5 text-gray-900">
                {title}
              </div>
              <div className="text-[12px] md:text-[13px] leading-[1.6] text-gray-500">
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
