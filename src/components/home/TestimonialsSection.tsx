"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import SectionHeader from "@/components/ui/SectionHeader"

const testimonials = [
  {
    name: "Mehmet Usta",
    role: "Isıtma Teknisyeni",
    text: "5 yıldır buradan alıyorum. Parçalar orijinal, kargo hızlı. Tavsiye ederim.",
    rating: 5,
  },
  {
    name: "Ahmet Bey",
    role: "Ev Sahibi",
    text: "Kombim arızalandı, hangi parça gerektiğini bilmiyordum. WhatsApp'tan yardım ettiler, doğru parçayı bulduk.",
    rating: 5,
  },
  {
    name: "Soğutma Servis A.Ş.",
    role: "Teknik Servis",
    text: "Toplu sipariş veriyoruz, her zaman stokta var ve zamanında geliyor.",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section
      className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16"
      aria-label="Müşteri yorumları"
    >
      <div className="mb-8 lg:mb-10">
        <SectionHeader
          eyebrow="Müşteri Yorumları"
          title="Müşterilerimiz Ne Diyor?"
          align="center"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.42, ease: "easeOut" }}
            whileHover={{
              y: -4,
              boxShadow: "0 8px 28px rgba(212,160,23,0.09)",
              transition: { type: "spring", stiffness: 340, damping: 28 },
            }}
            className="p-6 rounded-[22px] flex flex-col gap-4 cursor-default"
            style={{
              background: "radial-gradient(ellipse at top left, rgba(212,160,23,0.04) 0%, #151618 55%)",
              border: "1px solid rgba(255,196,0,0.12)",
            }}
          >
            {/* Quote icon + Stars */}
            <div className="flex items-start justify-between">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] font-black select-none"
                style={{
                  background: "rgba(212,160,23,0.08)",
                  border: "1px solid rgba(212,160,23,0.20)",
                  color: "#D4A017",
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                &ldquo;
              </div>
              <div className="flex gap-0.5" aria-label={`${t.rating} yıldız`}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} style={{ color: "#D4A017", fill: "#D4A017" }} aria-hidden="true" />
                ))}
              </div>
            </div>

            <blockquote
              className="text-[14px] leading-[1.72] flex-1"
              style={{ color: "#C8C8C4" }}
            >
              {t.text}
            </blockquote>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px" }}>
              <div className="font-bold text-[13px] text-white">{t.name}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "#5A5A58" }}>{t.role}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
