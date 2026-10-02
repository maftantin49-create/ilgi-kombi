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
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              transition: { type: "spring", stiffness: 340, damping: 28 },
            }}
            className="p-6 rounded-[22px] flex flex-col gap-4 cursor-default bg-white"
            style={{ border: "1px solid #E2E6EA" }}
          >
            {/* Quote icon + Stars */}
            <div className="flex items-start justify-between">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] font-black select-none text-blue-600"
                style={{
                  background: "rgba(37,99,235,0.06)",
                  border: "1px solid rgba(37,99,235,0.12)",
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                &ldquo;
              </div>
              <div className="flex gap-0.5" aria-label={`${t.rating} yıldız`}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={13} style={{ color: "#F59E0B", fill: "#F59E0B" }} aria-hidden="true" />
                ))}
              </div>
            </div>

            <blockquote
              className="text-[14px] leading-[1.72] flex-1 text-gray-600"
            >
              {t.text}
            </blockquote>

            <div style={{ borderTop: "1px solid #E2E6EA", paddingTop: "14px" }}>
              <div className="font-bold text-[13px] text-gray-900">{t.name}</div>
              <div className="text-[11px] mt-0.5 text-gray-400">{t.role}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
