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
      className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-12"
      aria-label="Hizmetlerimiz"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex gap-5 p-6 rounded-2xl"
            style={{
              background: "#151618",
              border: "1px solid rgba(255,196,0,0.10)",
            }}
          >
            <div
              className="w-11 h-11 flex items-center justify-center rounded-xl shrink-0"
              style={{
                background: "rgba(212,160,23,0.08)",
                border: "1px solid rgba(255,196,0,0.16)",
              }}
            >
              <Icon size={20} style={{ color: "#D4A017" }} aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-[14px] mb-1.5" style={{ color: "#E8E8E2" }}>
                {title}
              </div>
              <div className="text-[13px] leading-[1.65]" style={{ color: "#525250" }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
