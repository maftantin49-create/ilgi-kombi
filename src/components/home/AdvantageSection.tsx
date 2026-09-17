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
      className="border-t border-b"
      style={{ background: "#0E0F12", borderColor: "#1E1E22" }}
      aria-label="Neden Biz"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5">
        {advantages.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col gap-4 p-5"
            style={{
              background: "#151619",
              border: "1px solid #252528",
              borderRadius: "10px",
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
              style={{
                background: "rgba(216,155,0,0.08)",
                border: "1px solid rgba(216,155,0,0.16)",
              }}
            >
              <Icon size={18} style={{ color: "#D89B00" }} aria-hidden="true" />
            </div>
            <div>
              <div className="text-[13px] font-bold mb-1" style={{ color: "#E8E8E2" }}>
                {title}
              </div>
              <div className="text-[12px] leading-[1.65]" style={{ color: "#525250" }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
