import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface SectionHeaderProps {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
  ctaLabel?: string
  ctaHref?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  ctaLabel,
  ctaHref,
}: SectionHeaderProps) {
  if (align === "center") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2 mb-2.5">
          <span
            className="w-[4px] h-[4px] rounded-full shrink-0"
            style={{ background: "#D4A017", boxShadow: "0 0 5px rgba(212,160,23,0.70)" }}
            aria-hidden="true"
          />
          <span
            className="text-[10px] font-bold tracking-[0.26em] uppercase"
            style={{ color: "#D4A017" }}
          >
            {eyebrow}
          </span>
        </div>
        <h2
          className="font-black leading-[1.1]"
          style={{ color: "#F4F4F2", fontSize: "clamp(20px, 2.2vw, 28px)" }}
        >
          {title}
        </h2>
        {description && (
          <p className="text-[13px] mt-1.5 leading-relaxed max-w-xl" style={{ color: "#666660" }}>
            {description}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="w-[4px] h-[4px] rounded-full shrink-0"
            style={{ background: "#D4A017", boxShadow: "0 0 5px rgba(212,160,23,0.70)" }}
            aria-hidden="true"
          />
          <span
            className="text-[10px] font-bold tracking-[0.26em] uppercase"
            style={{ color: "#D4A017" }}
          >
            {eyebrow}
          </span>
        </div>
        <h2
          className="font-black leading-[1.1]"
          style={{ color: "#F4F4F2", fontSize: "clamp(20px, 2.2vw, 28px)" }}
        >
          {title}
        </h2>
        {description && (
          <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "#666660" }}>
            {description}
          </p>
        )}
      </div>

      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="group/link flex items-center gap-1 text-[12px] font-bold tracking-[0.07em] uppercase shrink-0 transition-colors duration-150 hover:text-[#F2C94C]"
          style={{ color: "#D4A017" }}
        >
          {ctaLabel}
          <ChevronRight
            size={13}
            className="transition-transform duration-150 group-hover/link:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  )
}
