"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Truck, Search, MessageCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Banner {
  icon: LucideIcon
  title: string
  description: string
  cta: string
  href: string
  external: boolean
  accentLine: string
}

function makeBanners(shippingCutoff: string, waLink: string | null): Banner[] {
  return [
    {
      icon: Truck,
      title: "Bugün Sipariş Ver, Bugün Yola Çıksın",
      description: shippingCutoff
        ? `Saat ${shippingCutoff}'ya kadar verilen siparişler aynı gün kargoda.`
        : "Hafta içi iş saatlerinde sipariş verin, aynı gün kargoda.",
      cta: "Ürünleri İncele",
      href: "/urunler?kargo=ayni-gun",
      external: false,
      accentLine: "Aynı Gün Kargo",
    },
    {
      icon: Search,
      title: "Kombinize Uygun Parçayı Kolayca Bulun",
      description: "Kombi markaları için uyumlu yedek parçaları kategorilere göre inceleyin.",
      cta: "Kategorileri Gör",
      href: "/kategoriler",
      external: false,
      accentLine: "Geniş Kategori",
    },
    {
      icon: MessageCircle,
      title: "Doğru Parçayı Birlikte Bulalım",
      description: "Kombi modelini ve cihaz bilgilerini gönder, uzman ekibimiz yardımcı olsun.",
      cta: waLink ? "WhatsApp'tan Sor" : "İletişime Geç",
      href: waLink ?? "/iletisim",
      external: !!waLink,
      accentLine: "7/24 Destek",
    },
  ]
}

function PromoCard({ banner, index }: { banner: Banner; index: number }) {
  const Icon = banner.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.42, ease: "easeOut" }}
      whileHover={{
        y: -5,
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        transition: { type: "spring", stiffness: 340, damping: 28 },
      }}
      className="flex flex-col gap-5 p-6 h-full relative overflow-hidden bg-white"
      style={{
        border: "1px solid #E2E6EA",
        borderRadius: "22px",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.35), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Eyebrow */}
      <div className="flex items-center gap-2">
        <span
          className="w-[4px] h-[4px] rounded-full shrink-0 bg-blue-600"
          aria-hidden="true"
        />
        <span
          className="text-[10px] font-bold tracking-[0.22em] uppercase text-blue-600"
        >
          {banner.accentLine}
        </span>
      </div>

      {/* Icon box */}
      <div
        className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
        style={{
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.12)",
        }}
      >
        <Icon size={20} className="text-blue-600" aria-hidden="true" />
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="text-gray-900 font-bold text-[15px] leading-snug mb-2">
          {banner.title}
        </h3>
        <p className="text-[13px] leading-[1.72] text-gray-500">
          {banner.description}
        </p>
      </div>

      <div
        className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.07em] uppercase group/cta text-blue-700 hover:text-blue-900"
      >
        <span className="transition-colors duration-150">
          {banner.cta}
        </span>
        <span
          className="transition-transform duration-150 group-hover/cta:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </div>
    </motion.div>
  )
}

interface Props {
  shippingCutoff?: string
  waLink?: string | null
}

export default function PromoBanners({ shippingCutoff = "", waLink = null }: Props) {
  const banners = makeBanners(shippingCutoff, waLink)

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-8" aria-label="Öne çıkan hizmetler">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {banners.map((banner, i) => {
          const card = <PromoCard banner={banner} index={i} />

          return banner.external ? (
            <a
              key={i}
              href={banner.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {card}
            </a>
          ) : (
            <Link key={i} href={banner.href} className="block">
              {card}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
