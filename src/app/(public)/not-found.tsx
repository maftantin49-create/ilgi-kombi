"use client"

import Link from "next/link"
import { Home, ShoppingBag } from "lucide-react"
import { wa } from "@/lib/whatsapp"

const WaIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default function NotFound() {
  return (
    <div
      className="min-h-[72vh] flex items-center justify-center px-6"
      style={{ background: "#090A0C" }}
    >
      <div className="text-center max-w-lg">

        {/* 404 number */}
        <div
          className="text-[120px] sm:text-[160px] font-black leading-none mb-4 select-none"
          style={{
            background: "linear-gradient(135deg, #D4A534 30%, rgba(212,165,52,0.25) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          aria-hidden="true"
        >
          404
        </div>

        {/* Divider */}
        <div
          className="w-12 h-px mx-auto mb-6"
          style={{ background: "rgba(212,165,52,0.35)" }}
        />

        <h1 className="text-2xl font-bold text-white mb-3">
          Aradığınız sayfa bulunamadı
        </h1>
        <p className="text-[15px] leading-relaxed mb-10" style={{ color: "#A0A0A0" }}>
          Bağlantı kaldırılmış, taşınmış veya yanlış yazılmış olabilir.
          <br />
          Aşağıdan devam edebilirsiniz.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 font-bold text-[13px] tracking-[0.08em] uppercase px-6 py-[13px] text-[#090A0C] bg-[#D4A534] hover:bg-[#F2B705] hover:-translate-y-0.5 transition-all duration-150"
            style={{ borderRadius: "10px", boxShadow: "0 2px 14px rgba(212,165,52,0.22)" }}
          >
            <Home size={15} aria-hidden="true" />
            Ana Sayfa
          </Link>

          <Link
            href="/urunler"
            className="inline-flex items-center justify-center gap-2 font-bold text-[13px] tracking-[0.08em] uppercase px-6 py-[13px] transition-all duration-150 hover:-translate-y-0.5"
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#D0D0CC",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(212,165,52,0.50)"
              e.currentTarget.style.color = "#D4A534"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
              e.currentTarget.style.color = "#D0D0CC"
            }}
          >
            <ShoppingBag size={15} aria-hidden="true" />
            Ürünleri İncele
          </Link>

          <a
            href={wa.notFound}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 font-bold text-[13px] tracking-[0.08em] uppercase px-6 py-[13px] transition-all duration-150 hover:-translate-y-0.5"
            style={{
              borderRadius: "10px",
              border: "1px solid rgba(212,165,52,0.30)",
              color: "#D4A534",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#D4A534"
              e.currentTarget.style.color = "#090A0C"
              e.currentTarget.style.borderColor = "#D4A534"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "#D4A534"
              e.currentTarget.style.borderColor = "rgba(212,165,52,0.30)"
            }}
          >
            <WaIcon />
            WhatsApp Destek
          </a>
        </div>
      </div>
    </div>
  )
}
