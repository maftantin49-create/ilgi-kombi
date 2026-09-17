"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Droplets,
  Thermometer,
  Cpu,
  Gauge,
  Flame,
  Wind,
  GitBranch,
  Package,
  Wrench,
  Activity,
  Award,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { kombiCategories } from "@/data/categories"

type ItemVariant = "collection" | "category"

interface StoryItem {
  id: string
  shortName: string
  href: string
  icon: LucideIcon
  variant: ItemVariant
  image?: string
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  pompalar:             Droplets,
  esanjorler:           Thermometer,
  "elektronik-kartlar": Cpu,
  sensorler:            Gauge,
  "gaz-valfleri":       Flame,
  fanlar:               Wind,
  "uc-yollu-vanalar":   GitBranch,
  "genlesme-tanklari":  Package,
  orijinaller:          Award,
  prosestatlar:         Activity,
  "tamir-takimlari":    Wrench,
}

function TileItem({ item }: { item: StoryItem }) {
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      aria-label={item.shortName}
      style={{ scrollSnapAlign: "start", width: "clamp(90px, 12.5vw, 175px)" }}
      className="flex flex-col items-center gap-[9px] shrink-0 group"
    >
      <motion.div
        whileHover={{
          scale: 1.07,
          y: -3,
          transition: { type: "spring", stiffness: 380, damping: 26 },
        }}
        whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: "clamp(64px, 9vw, 110px)",
          height: "clamp(64px, 9vw, 110px)",
          background: "#151618",
          border: "1px solid rgba(255,196,0,0.14)",
          borderRadius: "15px",
          willChange: "transform",
        }}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={`${item.shortName} ürün görseli`}
            width={88}
            height={88}
            className="object-contain object-center opacity-80 group-hover:opacity-100 transition-opacity duration-200"
            style={{ width: "68%", height: "68%" }}
          />
        ) : (
          <Icon
            size={28}
            strokeWidth={1.5}
            aria-hidden="true"
            style={{ color: "#D4A017", transition: "color 200ms" }}
            className="group-hover:[color:#F2C94C]"
          />
        )}

        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            borderRadius: "15px",
            boxShadow: "inset 0 0 0 1px rgba(255,196,0,0.50)",
            background: "radial-gradient(ellipse at center, rgba(212,160,23,0.07) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
      </motion.div>

      <span
        className="text-center leading-[1.3] line-clamp-2 transition-colors duration-200 group-hover:text-[#F2C94C]"
        style={{
          fontSize: "clamp(10px, 1.1vw, 13px)",
          fontWeight: 500,
          color: "#A5A5A5",
          width: "clamp(80px, 11vw, 155px)",
        }}
      >
        {item.shortName}
      </span>
    </Link>
  )
}

export default function StoryCategories() {
  const categoryItems: StoryItem[] = kombiCategories.map((cat) => ({
    id: cat.id,
    shortName: cat.shortName,
    href: cat.href,
    icon: CATEGORY_ICONS[cat.id] ?? Flame,
    variant: "category" as const,
    image: cat.thumbImage ?? cat.image,
  }))

  const allItems: StoryItem[] = categoryItems

  const edgePadding = "max(16px, calc((100vw - 1280px) / 2 + 16px))"

  return (
    <section
      aria-label="Kategori hızlı erişim"
      style={{
        background: "#0D0E11",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex gap-[16px] sm:gap-[20px] lg:gap-[22px] py-[10px] lg:py-[14px]"
        style={{
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
          paddingLeft: edgePadding,
          paddingRight: edgePadding,
        } as React.CSSProperties}
      >
        {allItems.map((item) => (
          <TileItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
