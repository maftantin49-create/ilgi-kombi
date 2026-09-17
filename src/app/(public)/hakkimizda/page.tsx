import Link from "next/link"
import {
  Flame, MapPin, Phone, Mail, Shield, Zap, Package, Star,
  Users, Award, Truck, CheckCircle,
} from "lucide-react"
import { site } from "@/config/site"
import { wa } from "@/lib/whatsapp"

export const metadata = {
  title: "Hakkımızda — İstanbul Kombi Yedek Parça",
  description: "İstanbul Kombi Yedek Parça olarak 10 yılı aşkın tecrübemizle kombi yedek parça sektöründe güvenilir hizmet sunuyoruz.",
}

const WaIcon = () => (
  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const GoldDot = () => (
  <span
    className="w-[5px] h-[5px] rounded-full shrink-0"
    style={{ background: "#D4A534", boxShadow: "0 0 6px rgba(212,165,52,0.70)" }}
    aria-hidden="true"
  />
)

const eyebrow = (label: string) => (
  <div className="flex items-center justify-center gap-2 mb-3">
    <GoldDot />
    <span className="text-[10px] font-bold tracking-[0.26em] uppercase" style={{ color: "#D4A534" }}>
      {label}
    </span>
  </div>
)

const surface: React.CSSProperties = {
  background: "#111111",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "20px",
}

const goldSurface: React.CSSProperties = {
  background: "rgba(212,165,52,0.06)",
  border: "1px solid rgba(212,165,52,0.18)",
  borderRadius: "20px",
}

const values = [
  {
    icon: <Shield size={22} />,
    title: "Özgünlük",
    desc: "Her ürün orijinal ve sertifikalı. Sahte veya muadil parça kesinlikle satmıyoruz.",
  },
  {
    icon: <Zap size={22} />,
    title: "Hız",
    desc: "Saat 14:00'a kadar verilen siparişler aynı gün kargoya çıkar. Acil ihtiyaçlar için hazırız.",
  },
  {
    icon: <Package size={22} />,
    title: "Uzmanlık",
    desc: "10 yılı aşkın sektör tecrübesiyle her modele uygun parçayı hızla tespit ediyoruz.",
  },
  {
    icon: <Users size={22} />,
    title: "Şeffaflık",
    desc: "Fiyat, stok ve kargo bilgisi her zaman açık ve güncel. Sürpriz yok.",
  },
  {
    icon: <Star size={22} />,
    title: "Müşteri Odaklılık",
    desc: "Doğru parçayı bulmak için teknik destek sunuyor, montaj rehberliği yapıyoruz.",
  },
  {
    icon: <Award size={22} />,
    title: "Güvenilirlik",
    desc: "Binlerce müşteri ve servis firmasının güvenilir tedarikçisiyiz.",
  },
]

const whyUs = [
  { icon: <CheckCircle size={18} />, text: "Tüm büyük markalara orijinal yedek parça" },
  { icon: <Truck size={18} />,        text: "Aynı gün kargo garantisi (saat 14:00'a kadar)" },
  { icon: <Shield size={18} />,       text: "1 yıl ürün garantisi, 14 gün iade hakkı" },
  { icon: <Zap size={18} />,          text: "WhatsApp teknik destek — anında yanıt" },
  { icon: <Users size={18} />,        text: "Teknik servisler için toplu sipariş kolaylığı" },
  { icon: <Star size={18} />,         text: "Montaj rehberleri ve teknik dokümantasyon" },
]

export default function HakkimizdaPage() {
  return (
    <div style={{ background: "#090A0C" }}>

      {/* ── Hero ── */}
      <section
        className="relative text-center py-20 px-6 overflow-hidden"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Subtle gold glow bg */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(212,165,52,0.10) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-2xl mx-auto">
          {eyebrow("Kurumsal")}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            İstanbul&apos;un Güvenilir<br />
            <span style={{ color: "#D4A534" }}>Yedek Parça</span> Adresi
          </h1>
          <p className="text-[16px] leading-relaxed" style={{ color: "#A0A0A0" }}>
            10 yılı aşkın tecrübemizle kombi yedek parça sektöründe binlerce müşteriye ve
            teknik servise güvenilir çözümler sunuyoruz.
          </p>
        </div>
      </section>

      {/* ── Şirket Hikayesi ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            {eyebrow("Hikayemiz")}
            <h2 className="text-3xl font-black text-white mb-5 text-center md:text-left">
              Uzmanlıkla Başladı,<br />Güvenle Büyüdü
            </h2>
            <div className="space-y-4 text-[14px] leading-relaxed" style={{ color: "#A0A0A0" }}>
              <p>
                {site.siteName}, İstanbul&apos;da küçük bir yedek parça atölyesi olarak yola çıktı.
                Kurucumuzun ısıtma sistemleri alanındaki derin teknik bilgisi ve müşteri odaklı yaklaşımı,
                kısa sürede markamızı sektörün güvenilir adreslerinden biri haline getirdi.
              </p>
              <p>
                Bugün onlarca marka için orijinal kombi yedek parçasını stokta tutuyor,
                aynı gün kargo seçeneğiyle İstanbul başta olmak üzere Türkiye&apos;nin her noktasına hizmet veriyoruz.
                Hem bireysel müşteriler hem de teknik servis firmaları için güvenilir bir tedarik kaynağıyız.
              </p>
              <p>
                Temel ilkemiz değişmedi: doğru parça, doğru fiyat, hızlı teslimat.
              </p>
            </div>
          </div>
          {/* Stats card */}
          <div className="rounded-[24px] p-8" style={goldSurface}>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "10+",   label: "Yıllık Tecrübe" },
                { value: "5.000+", label: "Ürün Çeşidi" },
                { value: "20+",   label: "Desteklenen Marka" },
                { value: "Aynı Gün", label: "Kargo Garantisi" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div
                    className="text-[28px] font-black mb-0.5"
                    style={{ color: "#D4A534" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-[12px]" style={{ color: "#A0A0A0" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Neden Biz ── */}
      <section
        className="py-16 px-6"
        style={{ background: "#0A0B0D", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-4xl mx-auto">
          {eyebrow("Neden Biz")}
          <h2 className="text-3xl font-black text-white mb-10 text-center">
            Farkımızı Yaratan Detaylar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyUs.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-[14px]"
                style={surface}
              >
                <span style={{ color: "#D4A534" }} className="mt-0.5 shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="text-[14px]" style={{ color: "#E0E0DC" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Değerlerimiz ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        {eyebrow("Değerlerimiz")}
        <h2 className="text-3xl font-black text-white mb-10 text-center">
          Bizi Biz Yapan Prensipler
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map((v, i) => (
            <div key={i} className="p-6 rounded-[20px] group" style={surface}>
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-4 transition-colors duration-150"
                style={{
                  background: "rgba(212,165,52,0.10)",
                  border: "1px solid rgba(212,165,52,0.20)",
                  color: "#D4A534",
                }}
                aria-hidden="true"
              >
                {v.icon}
              </div>
              <h3 className="font-bold text-white mb-2">{v.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "#A0A0A0" }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── İstatistikler ── */}
      <section
        className="py-16 px-6"
        style={{
          background: "#0A0B0D",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          {eyebrow("Rakamlarla Biz")}
          <h2 className="text-3xl font-black text-white mb-10 text-center">
            Güvenin Somut Göstergeleri
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Package size={20} />,  value: "5.000+",   label: "Ürün Çeşidi" },
              { icon: <Star size={20} />,     value: "4.9/5",    label: "Ortalama Puan" },
              { icon: <Truck size={20} />,    value: "%98",      label: "Zamanında Teslimat" },
              { icon: <Users size={20} />,    value: "1.000+",   label: "Aktif Müşteri" },
            ].map((s, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-[18px]"
                style={goldSurface}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(212,165,52,0.12)", color: "#D4A534" }}
                  aria-hidden="true"
                >
                  {s.icon}
                </div>
                <div className="text-[26px] font-black" style={{ color: "#D4A534" }}>{s.value}</div>
                <div className="text-[12px] mt-0.5" style={{ color: "#A0A0A0" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── İletişim Bilgileri ── */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        {eyebrow("Bize Ulaşın")}
        <h2 className="text-3xl font-black text-white mb-8 text-center">
          Sorularınız İçin Buradayız
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Phone size={16} />, label: "Telefon", value: site.phoneDisplay, href: `tel:${site.phone}` },
            { icon: <Mail size={16} />,  label: "E-posta", value: site.email,        href: `mailto:${site.email}` },
            { icon: <MapPin size={16} />, label: "Adres",  value: site.address,      href: undefined },
          ].map((c, i) => (
            <div key={i} className="p-5 rounded-[18px] text-center" style={surface}>
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(212,165,52,0.10)", color: "#D4A534" }}
                aria-hidden="true"
              >
                {c.icon}
              </div>
              <div className="text-[11px] font-semibold mb-1 uppercase tracking-wider" style={{ color: "#5A5A5A" }}>
                {c.label}
              </div>
              {c.href ? (
                <a
                  href={c.href}
                  className="text-[13px] font-medium text-white hover:text-[#D4A534] transition-colors"
                >
                  {c.value}
                </a>
              ) : (
                <p className="text-[13px] font-medium text-white">{c.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={wa.home}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-[12px] font-bold text-[14px] transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: "rgba(34,197,94,0.10)",
              border: "1px solid rgba(34,197,94,0.30)",
              color: "#22c55e",
            }}
          >
            <WaIcon />
            WhatsApp&apos;tan Yaz
          </a>
          <Link
            href="/iletisim"
            className="flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-bold text-[14px] transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: "#D4A534",
              color: "#090A0C",
              boxShadow: "0 2px 16px rgba(212,165,52,0.25)",
            }}
          >
            İletişim Formuna Git
          </Link>
          <Link
            href="/urunler"
            className="flex items-center gap-2 px-7 py-3.5 rounded-[12px] font-bold text-[14px] transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#A0A0A0",
            }}
          >
            Ürünleri Keşfet
          </Link>
        </div>
      </section>

      {/* ── Logo / Brand footer strip ── */}
      <div
        className="py-8 px-6 text-center"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center justify-center gap-2">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "rgba(212,165,52,0.12)", border: "1px solid rgba(212,165,52,0.25)" }}
            aria-hidden="true"
          >
            <Flame size={18} style={{ color: "#D4A534" }} />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-xl text-white">{site.siteName}</span>
          </div>
        </div>
        <p className="mt-2 text-[12px]" style={{ color: "#3A3A3A" }}>
          {site.siteName} — {site.address}
        </p>
      </div>
    </div>
  )
}
