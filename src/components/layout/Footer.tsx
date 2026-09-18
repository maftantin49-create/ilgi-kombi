"use client"

import Link from "next/link"
import SiteLogo from "@/components/layout/SiteLogo"
import { Phone, Mail, MapPin, Clock } from "lucide-react"
import { buildWa } from "@/lib/whatsapp"
import { validPhone, validEmail, validWhatsApp, validSocial } from "@/lib/storefront/guards"

function WaIcon() {
  return (
    <svg className="w-[18px] h-[18px] shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const navLinks = {
  musteriHizmetleri: [
    { href: "/musteri-hizmetleri",  label: "Müşteri Hizmetleri" },
    { href: "/sss",                 label: "Sıkça Sorulan Sorular" },
    { href: "/garanti-ve-iade",     label: "Garanti ve İade" },
    { href: "/teslimat-bilgileri",  label: "Teslimat Bilgileri" },
    { href: "/kargo-ve-tasima",     label: "Kargo ve Taşıma Bilgileri" },
    { href: "/kvkk",                label: "KVKK" },
  ],
  kurumsal: [
    { href: "/",            label: "Ana Sayfa" },
    { href: "/hakkimizda",  label: "Hakkımızda" },
    { href: "/blog",        label: "Blog" },
    { href: "/iletisim",    label: "İletişim" },
  ],
  legal: [
    { href: "/gizlilik",                  label: "Gizlilik" },
    { href: "/kullanim-kosullari",        label: "Kullanım Koşulları" },
    { href: "/mesafeli-satis-sozlesmesi", label: "Mesafeli Satış Sözleşmesi" },
    { href: "/iptal-iade",                label: "İptal ve İade" },
    { href: "/teslimat-iade",             label: "Teslimat ve İade" },
  ] as { href: string; label: string }[],
}

interface FooterProps {
  siteName: string
  phone: string
  whatsapp: string
  email: string
  address: string
  workingHours: { weekdays: string; saturday: string; sunday: string }
  social: { instagram: string; facebook: string; youtube: string }
}

export default function Footer({
  siteName, phone, whatsapp, email, address, workingHours, social,
}: FooterProps) {
  const validPh   = validPhone(phone)
  const validWa   = validWhatsApp(whatsapp)
  const validMail = validEmail(email)
  const validFb   = validSocial(social.facebook)
  const validIg   = validSocial(social.instagram)
  const wa        = buildWa(validWa)

  const hasWorkingHours = workingHours.weekdays || workingHours.saturday || workingHours.sunday

  return (
    <footer style={{ background: "#090A0C", color: "#A5A5A5" }}>

      {/* ── Main Grid ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-3 mb-5" aria-label={`${siteName} Ana Sayfa`}>
            <SiteLogo
              siteName={siteName}
              width={38}
              height={38}
              className="object-contain"
            />
            <div className="leading-[1.25]">
              <div className="font-black text-white text-[15px]">{siteName}</div>
            </div>
          </Link>

          {/* Social */}
          <div className="flex gap-2">
            {validFb && (
              <a
                href={validFb}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 hover:-translate-y-0.5"
                style={{ background: "#151618", border: "1px solid rgba(255,255,255,0.08)", color: "#5A5A58" }}
              >
                f
              </a>
            )}
            {validIg && (
              <a
                href={validIg}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150 hover:-translate-y-0.5"
                style={{ background: "#151618", border: "1px solid rgba(255,255,255,0.08)", color: "#5A5A58" }}
              >
                ig
              </a>
            )}
            {wa.home && (
              <a
                href={wa.home}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.22)",
                  color: "#22c55e",
                }}
              >
                <WaIcon />
              </a>
            )}
          </div>
        </div>

        {/* Müşteri Hizmetleri */}
        <div>
          <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] mb-5" style={{ color: "#E8E8E2" }}>
            Müşteri Hizmetleri
          </h4>
          <ul className="space-y-2.5 text-[13px]">
            {navLinks.musteriHizmetleri.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors duration-150 hover:text-[#D4A017]"
                  style={{ color: "#4A4A48" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kurumsal */}
        <div>
          <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] mb-5" style={{ color: "#E8E8E2" }}>
            Kurumsal
          </h4>
          <ul className="space-y-2.5 text-[13px]">
            {navLinks.kurumsal.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="transition-colors duration-150 hover:text-[#D4A017]"
                  style={{ color: "#4A4A48" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* İletişim */}
        <div>
          <h4 className="font-bold text-[13px] uppercase tracking-[0.12em] mb-5" style={{ color: "#E8E8E2" }}>
            İletişim
          </h4>

          <ul className="space-y-3 text-[13px] mb-5">
            {validPh && (
              <li>
                <a
                  href={`tel:${validPh}`}
                  className="flex items-start gap-2.5 transition-colors duration-150 hover:text-[#D4A017]"
                  style={{ color: "#4A4A48" }}
                >
                  <Phone size={13} className="mt-0.5 shrink-0" style={{ color: "#D4A017" }} aria-hidden="true" />
                  {validPh}
                </a>
              </li>
            )}
            {validMail && (
              <li>
                <a
                  href={`mailto:${validMail}`}
                  className="flex items-start gap-2.5 transition-colors duration-150 hover:text-[#D4A017]"
                  style={{ color: "#4A4A48" }}
                >
                  <Mail size={13} className="mt-0.5 shrink-0" style={{ color: "#D4A017" }} aria-hidden="true" />
                  {validMail}
                </a>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-2.5" style={{ color: "#4A4A48" }}>
                <MapPin size={13} className="mt-0.5 shrink-0" style={{ color: "#D4A017" }} aria-hidden="true" />
                {address}
              </li>
            )}
          </ul>

          {/* Çalışma Saatleri — only if configured */}
          {hasWorkingHours && (
            <div
              className="rounded-[14px] p-4 text-[12px]"
              style={{
                background: "#111214",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-1.5 font-semibold mb-3" style={{ color: "#A5A5A5" }}>
                <Clock size={12} style={{ color: "#D4A017" }} aria-hidden="true" />
                Çalışma Saatleri
              </div>
              <div className="space-y-1.5">
                {workingHours.weekdays && (
                  <div className="flex justify-between">
                    <span style={{ color: "#4A4A48" }}>Hafta içi</span>
                    <span style={{ color: "#E0E0DC" }}>{workingHours.weekdays}</span>
                  </div>
                )}
                {workingHours.saturday && (
                  <div className="flex justify-between">
                    <span style={{ color: "#4A4A48" }}>Cumartesi</span>
                    <span style={{ color: "#E0E0DC" }}>{workingHours.saturday}</span>
                  </div>
                )}
                {workingHours.sunday && (
                  <div className="flex justify-between">
                    <span style={{ color: "#4A4A48" }}>Pazar</span>
                    <span style={{ color: "#E0E0DC" }}>{workingHours.sunday}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col gap-3">
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            {navLinks.legal.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[11px] transition-colors duration-150 hover:text-[#D4A017]"
                style={{ color: "#3A3A38" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-[11px] gap-1">
            <span style={{ color: "#3A3A38" }}>
              © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.
            </span>
            {validMail && (
              <span style={{ color: "#3A3A38" }}>{validMail}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
