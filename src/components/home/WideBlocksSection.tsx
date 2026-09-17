"use client"

import Link from "next/link"
import Image from "next/image"
import HoverScrollRail from "@/components/home/HoverScrollRail"

// ── Her blok için image alanı müşteriden bekleniyor ──────────────────────────
// image bağlandığında object-contain ile düzgün oturur, kırpma / stretch olmaz.
interface WideBlock {
  id: string
  title: string
  href: string
  image?: string
}

const WIDE_BLOCKS: WideBlock[] = [
  { id: "block-1", title: "Blok 1", href: "/urunler" },
  { id: "block-2", title: "Blok 2", href: "/urunler" },
  { id: "block-3", title: "Blok 3", href: "/urunler" },
  { id: "block-4", title: "Blok 4", href: "/urunler" },
  { id: "block-5", title: "Blok 5", href: "/urunler" },
  { id: "block-6", title: "Blok 6", href: "/urunler" },
]

const CARD_WIDTH_CLASS = "w-[300px] xl:w-[340px]"

function BlockCard({
  block,
  ariaHidden,
}: {
  block: WideBlock
  ariaHidden?: boolean
}) {
  return (
    <Link
      href={block.href}
      aria-hidden={ariaHidden || undefined}
      tabIndex={ariaHidden ? -1 : undefined}
      className={`${CARD_WIDTH_CLASS} shrink-0 group relative block overflow-hidden rounded-2xl`}
      style={{
        background: "#151618",
        border: "1px solid rgba(255,196,0,0.08)",
        aspectRatio: "16/9",
      }}
    >
      {block.image && (
        <Image
          src={block.image}
          alt={block.title}
          fill
          className="object-contain transition-transform duration-500 group-hover:scale-105"
          sizes="340px"
        />
      )}

      {/* Hover border glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-[inherit]"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,196,0,0.28)" }}
        aria-hidden="true"
      />
    </Link>
  )
}

export default function WideBlocksSection() {
  return (
    <section
      className="max-w-7xl mx-auto px-4 py-6 lg:py-8"
      aria-label="Öne çıkan bloklar"
    >
      {/* Mobile: native overflow scroll */}
      <div
        className="md:hidden flex gap-3 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}
      >
        {WIDE_BLOCKS.map((block) => (
          <BlockCard key={block.id} block={block} />
        ))}
      </div>

      {/* Desktop: hover-triggered auto-scroll */}
      <HoverScrollRail
        className="hidden md:flex gap-4"
        aria-label="Öne çıkan bloklar vitrini"
      >
        {/* Orijinal set */}
        {WIDE_BLOCKS.map((block) => (
          <BlockCard key={block.id} block={block} />
        ))}
        {/* Klon — seamless loop */}
        {WIDE_BLOCKS.map((block) => (
          <BlockCard key={`${block.id}-c`} block={block} ariaHidden />
        ))}
      </HoverScrollRail>
    </section>
  )
}
