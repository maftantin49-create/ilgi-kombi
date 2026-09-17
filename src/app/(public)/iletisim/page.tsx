import { Phone, Mail, MapPin, Clock, Building2 } from "lucide-react"
import { site } from "@/config/site"
import { legal } from "@/config/legal"
import { wa } from "@/lib/whatsapp"
import ContactForm from "@/components/ContactForm"

export const metadata = {
  title: "İletişim — İstanbul Kombi Yedek Parça",
  description: "İstanbul Kombi Yedek Parça ile iletişime geçin. Telefon, WhatsApp ve form ile ulaşabilirsiniz.",
}

const WaIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const hours = [
  { day: "Pazartesi — Cuma", value: site.workingHours.weekdays, closed: false },
  { day: "Cumartesi",         value: site.workingHours.saturday, closed: false },
  { day: "Pazar",             value: site.workingHours.sunday,   closed: false },
]

export default function IletisimPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span
            className="w-[5px] h-[5px] rounded-full shrink-0"
            style={{ background: "#D4A534", boxShadow: "0 0 6px rgba(212,165,52,0.70)" }}
            aria-hidden="true"
          />
          <span className="text-[10px] font-bold tracking-[0.26em] uppercase" style={{ color: "#D4A534" }}>
            İletişim
          </span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2">Size Yardımcı Olalım</h1>
        <p className="text-[15px]" style={{ color: "#A0A0A0" }}>
          Telefon, WhatsApp veya formu kullanarak bize ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Left panel ── */}
        <div className="space-y-4">

          {/* Contact info card */}
          <div
            className="p-6 rounded-[20px]"
            style={{
              background: "#111111",
              border: "1px solid rgba(212,165,52,0.18)",
            }}
          >
            <h2 className="font-bold text-[17px] text-white mb-5">Bize Ulaşın</h2>

            {/* WhatsApp */}
            <a
              href={wa.contact}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4 transition-all duration-150 hover:-translate-y-0.5"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.25)",
              }}
              aria-label="WhatsApp ile ulaş"
            >
              <WaIcon />
              <div>
                <div className="font-semibold text-sm text-white">WhatsApp ile Yaz</div>
                <div className="text-xs" style={{ color: "#22c55e" }}>En hızlı yanıt yöntemi</div>
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${site.phone}`}
              className="flex items-center gap-3 py-3 border-b transition-opacity hover:opacity-75"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <Phone size={16} style={{ color: "#D4A534" }} className="shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-white">{site.phoneDisplay}</div>
                <div className="text-xs" style={{ color: "#A0A0A0" }}>
                  Hafta içi {site.workingHours.weekdays}
                </div>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${site.email}`}
              className="flex items-center gap-3 py-3 border-b transition-opacity hover:opacity-75"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <Mail size={16} style={{ color: "#D4A534" }} className="shrink-0" aria-hidden="true" />
              <span className="text-sm text-white">{site.email}</span>
            </a>

            {/* Address */}
            <div className="flex items-start gap-3 pt-3">
              <MapPin size={16} style={{ color: "#D4A534" }} className="shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm text-white">
                {legal.fullAddress || site.address}
              </span>
            </div>
          </div>

          {/* Firma Bilgileri card */}
          {(legal.tradeName || legal.taxNumber) && (
            <div
              className="p-5 rounded-[20px]"
              style={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} style={{ color: "#D4A534" }} aria-hidden="true" />
                <h3 className="font-semibold text-white text-[14px]">Firma Bilgileri</h3>
              </div>
              <div className="space-y-2.5 text-[13px]">
                {legal.tradeName && (
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "#5A5A5A" }}>İşletmeci</span>
                    <span className="text-right font-medium" style={{ color: "#E0E0DC" }}>{legal.tradeName}</span>
                  </div>
                )}
                {legal.taxOffice && (
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "#5A5A5A" }}>Vergi Dairesi</span>
                    <span className="text-right font-medium" style={{ color: "#E0E0DC" }}>{legal.taxOffice}</span>
                  </div>
                )}
                {legal.taxNumber && (
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "#5A5A5A" }}>Vergi No</span>
                    <span className="font-mono font-medium" style={{ color: "#E0E0DC" }}>{legal.taxNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working hours card */}
          <div
            className="p-5 rounded-[20px]"
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} style={{ color: "#D4A534" }} aria-hidden="true" />
              <h3 className="font-semibold text-white text-[14px]">Çalışma Saatleri</h3>
            </div>
            <div className="space-y-2.5">
              {hours.map(({ day, value, closed }) => (
                <div key={day} className="flex justify-between text-[13px]">
                  <span style={{ color: "#A0A0A0" }}>{day}</span>
                  <span
                    className="font-medium"
                    style={{ color: closed ? "#EF4444" : "#E0E0DC" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="mt-4 pt-3 text-[11px]"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "#A0A0A0" }}
            >
              Saat {site.shippingCutoff}&apos;ya kadar verilen siparişler aynı gün kargoya verilir.
            </div>
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <ContactForm />
      </div>
    </div>
  )
}
