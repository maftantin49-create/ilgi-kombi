import { ShieldCheck, Zap, Headphones, CreditCard } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Advantage {
  icon: LucideIcon
  title: string
  desc: string
}

const advantages: Advantage[] = [
  {
    icon: ShieldCheck,
    title: "Güvenilir Yedek Parça",
    desc: "Orijinal, OEM ve muadil kategorilerinde kaliteli yedek parça. Ürün bazında açık sınıflandırma.",
  },
  {
    icon: Zap,
    title: "Aynı Gün Kargo",
    desc: "Stoklu ürünlerde iş günleri 15:00'a kadar verilen siparişler aynı gün kargoya teslim edilir.",
  },
  {
    icon: Headphones,
    title: "Teknik Destek",
    desc: "WhatsApp üzerinden uzman ekibimize anlık ulaşabilirsiniz.",
  },
  {
    icon: CreditCard,
    title: "Güvenli Ödeme",
    desc: "SSL korumalı altyapı ile tüm ödeme yöntemleri desteklenir.",
  },
]

export default function AdvantageSection() {
  return (
    <section
      className="border-t border-b border-[#E2E6EA] bg-[#F8F9FA]"
      aria-label="Neden Biz"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
        {advantages.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-4 p-5 bg-white rounded-xl"
            style={{ border: "1px solid #E2E6EA" }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
              style={{
                background: "rgba(37,99,235,0.06)",
                border: "1px solid rgba(37,99,235,0.12)",
              }}
            >
              <Icon size={18} className="text-blue-600" aria-hidden="true" />
            </div>
            <div>
              <div className="text-[13px] font-bold mb-1 text-gray-900">
                {title}
              </div>
              <div className="text-[12px] leading-[1.65] text-gray-500">
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
