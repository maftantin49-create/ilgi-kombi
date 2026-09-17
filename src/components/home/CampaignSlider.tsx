"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Percent, Truck, Sparkles, Tag } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Campaign {
  id: number
  badge: string
  icon: LucideIcon
  title: string
  highlight: string
  desc: string
  cta: { label: string; href: string }
}

const campaigns: Campaign[] = [
  {
    id: 1,
    badge: "Kampanya",
    icon: Percent,
    title: "Sirkülasyon Pompalarında",
    highlight: "%25 İndirim",
    desc: "Wilo ve Grundfos markalı pompalarda seçili ürünlerde özel fiyat avantajı.",
    cta: { label: "Kampanyayı Gör", href: "/urunler?kategori=pompalar" },
  },
  {
    id: 2,
    badge: "Aynı Gün Kargo",
    icon: Truck,
    title: "Bugün Sipariş Ver",
    highlight: "Bugün Elinde",
    desc: "Saat 16:00'a kadar verilen siparişler aynı gün kargoya verilir.",
    cta: { label: "Ürünleri Gör", href: "/urunler" },
  },
  {
    id: 3,
    badge: "Yeni Gelenler",
    icon: Sparkles,
    title: "Taze Stok Geldi",
    highlight: "Yeni Ürünler",
    desc: "Ferroli, Ariston ve Demirdöküm serisi yeni parçalar stoka girdi.",
    cta: { label: "Yeni Ürünlere Bak", href: "/urunler" },
  },
  {
    id: 4,
    badge: "Servis Özel",
    icon: Tag,
    title: "Toplu Siparişe",
    highlight: "Özel Fiyat",
    desc: "Servis firmaları ve ustalar için toplu sipariş avantajları. WhatsApp'tan bilgi alın.",
    cta: { label: "Teklif Al", href: "/iletisim" },
  },
]

function CampaignCard({ c, index }: { c: Campaign; index: number }) {
  const Icon = c.icon

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { type: "spring", stiffness: 340, damping: 28 } }}
      className="flex flex-col h-full p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(148deg, #19160E 0%, #111214 60%)",
        border: "1px solid rgba(255,196,0,0.14)",
        borderRadius: "24px",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-px pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.60), transparent)",
        }}
        aria-hidden="true"
      />

      {/* Badge + icon row */}
      <div className="flex items-start justify-between mb-6">
        <span
          className="text-[10px] font-bold px-2.5 py-[5px] rounded-full tracking-[0.08em] uppercase"
          style={{
            background: "rgba(212,160,23,0.08)",
            border: "1px solid rgba(212,160,23,0.26)",
            color: "#D4A017",
          }}
        >
          {c.badge}
        </span>

        <div
          className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            background: "rgba(212,160,23,0.08)",
            border: "1px solid rgba(212,160,23,0.20)",
          }}
        >
          <Icon size={18} style={{ color: "#D4A017" }} aria-hidden="true" />
        </div>
      </div>

      {/* Content */}
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.10em] mb-[6px]"
        style={{ color: "#5E5E58" }}
      >
        {c.title}
      </div>

      <div
        className="font-black leading-[1.15] mb-4"
        style={{ color: "#F2C94C", fontSize: "clamp(22px, 2.2vw, 28px)" }}
      >
        {c.highlight}
      </div>

      <p
        className="text-[13px] leading-[1.72] flex-1"
        style={{ color: "#636360" }}
      >
        {c.desc}
      </p>

      <Link
        href={c.cta.href}
        className="group/link mt-6 inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.07em] uppercase transition-colors duration-150 hover:text-[#F2C94C]"
        style={{ color: "#D4A017" }}
      >
        {c.cta.label}
        <span
          className="transition-transform duration-150 group-hover/link:translate-x-1"
          aria-hidden="true"
        >
          →
        </span>
      </Link>
    </motion.article>
  )
}

export default function CampaignSlider() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  const scrollToIdx = useCallback((idx: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[idx] as HTMLElement | undefined
    if (!card) return
    track.scrollTo({ left: card.offsetLeft, behavior: "smooth" })
    setActiveIdx(idx)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onScroll = () => {
      const cardWidth = track.scrollWidth / campaigns.length
      setActiveIdx(Math.round(track.scrollLeft / cardWidth))
    }
    track.addEventListener("scroll", onScroll, { passive: true })
    return () => track.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section
      className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14"
      aria-label="Kampanyalar ve fırsatlar"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 lg:mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-[4px] h-[4px] rounded-full shrink-0"
              style={{ background: "#D4A017", boxShadow: "0 0 6px rgba(212,160,23,0.80)" }}
              aria-hidden="true"
            />
            <span
              className="text-[10px] font-bold tracking-[0.26em] uppercase"
              style={{ color: "#D4A017" }}
            >
              Fırsatlar
            </span>
          </div>
          <h2
            className="font-black leading-[1.1]"
            style={{ color: "#F4F4F2", fontSize: "clamp(22px, 2.4vw, 30px)" }}
          >
            Kampanyalar
          </h2>
        </div>

        <div className="flex gap-2 md:hidden">
          <button
            onClick={() => scrollToIdx(Math.max(0, activeIdx - 1))}
            aria-label="Önceki kampanya"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{
              background: "#151618",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#A5A5A5",
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={() => scrollToIdx(Math.min(campaigns.length - 1, activeIdx + 1))}
            aria-label="Sonraki kampanya"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
            style={{
              background: "#151618",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#A5A5A5",
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Desktop: 4-column grid */}
      <div className="hidden md:grid grid-cols-4 gap-5 items-stretch">
        {campaigns.map((c, i) => (
          <CampaignCard key={c.id} c={c} index={i} />
        ))}
      </div>

      {/* Mobile: horizontal scroll snap */}
      <div
        ref={trackRef}
        className="md:hidden flex gap-3 overflow-x-auto pb-1"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}
      >
        {campaigns.map((c, i) => (
          <div
            key={c.id}
            className="flex-none flex flex-col"
            style={{ scrollSnapAlign: "start", width: "82vw" }}
          >
            <CampaignCard c={c} index={i} />
          </div>
        ))}
      </div>

      {/* Mobile dots */}
      <div className="flex justify-center gap-1.5 mt-4 md:hidden">
        {campaigns.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIdx(i)}
            aria-label={`Kampanya ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === activeIdx ? "20px" : "6px",
              height: "6px",
              background: i === activeIdx ? "#D4A017" : "rgba(212,160,23,0.20)",
            }}
          />
        ))}
      </div>
    </section>
  )
}
