import type { Metadata } from "next"
import Link from "next/link"
import {
  Phone, Mail, MessageCircle, ArrowRight,
  ShoppingCart, Package, Wrench, Truck, RefreshCw,
  Shield, AlertTriangle, HeadphonesIcon, Lock, BookOpen,
  HelpCircle, FileText,
} from "lucide-react"
import { site } from "@/config/site"
import { legal } from "@/config/legal"
import { wa } from "@/lib/whatsapp"

export const metadata: Metadata = {
  title: `Müşteri Hizmetleri | ${site.siteName}`,
  description:
    "Sipariş, ürün uyumluluğu, kargo, iade ve teknik destek konularında yardım almak için müşteri hizmetleri merkezimizi ziyaret edin.",
  robots: "index, follow",
  alternates: { canonical: `${site.url}/musteri-hizmetleri` },
}

const serviceTopics = [
  {
    icon: ShoppingCart,
    title: "Sipariş ve Ödeme",
    desc: "Sipariş verme, ödeme yöntemleri, fatura ve sipariş iptali",
    href: "/sss#siparis",
    links: [{ label: "Sıkça Sorulan Sorular", href: "/sss" }],
  },
  {
    icon: Package,
    title: "Sipariş Takibi",
    desc: "Kargoya verilen siparişinizin anlık durumunu öğrenin",
    href: null,
    links: [
      { label: "WhatsApp ile Takip Et", href: wa.contact, external: true },
      { label: "İletişim", href: "/iletisim" },
    ],
  },
  {
    icon: Wrench,
    title: "Ürün Seçimi ve Uyumluluk",
    desc: "Kombinize uygun parçayı bulmak için yardım alın",
    href: "/parca-bul",
    links: [
      { label: "Parça Bul Aracı", href: "/parca-bul" },
      { label: "SSS — Ürün Seçimi", href: "/sss" },
    ],
  },
  {
    icon: Truck,
    title: "Kargo ve Teslimat",
    desc: "Aynı gün kargo, teslimat süresi, kargo takibi ve adres bilgileri",
    href: "/teslimat-bilgileri",
    links: [
      { label: "Teslimat Bilgileri", href: "/teslimat-bilgileri" },
      { label: "Kargo ve Taşıma", href: "/kargo-ve-tasima" },
    ],
  },
  {
    icon: RefreshCw,
    title: "İade ve Değişim",
    desc: "14 günlük cayma hakkı, iade prosedürü ve geri ödeme süreci",
    href: "/garanti-ve-iade",
    links: [
      { label: "Garanti ve İade", href: "/garanti-ve-iade" },
      { label: "İptal ve İade Koşulları", href: "/iptal-iade" },
    ],
  },
  {
    icon: Shield,
    title: "Garanti",
    desc: "Ürün garantisi, üretim kusurları ve garanti başvurusu",
    href: "/garanti-ve-iade",
    links: [{ label: "Garanti Bilgileri", href: "/garanti-ve-iade" }],
  },
  {
    icon: AlertTriangle,
    title: "Hasarlı / Hatalı Ürün",
    desc: "Yanlış, eksik veya hasarlı ürün teslimi durumunda yapılacaklar",
    href: "/garanti-ve-iade",
    links: [
      { label: "Garanti ve İade", href: "/garanti-ve-iade" },
      { label: "WhatsApp Destek", href: wa.contact, external: true },
    ],
  },
  {
    icon: HeadphonesIcon,
    title: "Teknik Destek",
    desc: "Parça seçimi, montaj öncesi kontrol ve teknik sorular",
    href: null,
    links: [
      { label: "WhatsApp ile Sor", href: wa.contact, external: true },
      { label: "Teknik Rehberler", href: "/rehberler" },
    ],
  },
  {
    icon: Lock,
    title: "Güvenli Alışveriş",
    desc: "Ödeme güvenliği, kart bilgileri ve site güvenlik altyapısı",
    href: "/gizlilik",
    links: [{ label: "Gizlilik Politikası", href: "/gizlilik" }],
  },
  {
    icon: FileText,
    title: "KVKK ve Gizlilik",
    desc: "Kişisel verilerinizin nasıl işlendiği ve haklarınız",
    href: "/kvkk",
    links: [
      { label: "KVKK Aydınlatma", href: "/kvkk" },
      { label: "Gizlilik Politikası", href: "/gizlilik" },
    ],
  },
  {
    icon: BookOpen,
    title: "Blog ve Rehberler",
    desc: "Kombi parçaları hakkında teknik rehberler",
    href: "/rehberler",
    links: [{ label: "Teknik Rehberler", href: "/rehberler" }],
  },
  {
    icon: HelpCircle,
    title: "Diğer Sorular",
    desc: "SSS'te yanıt bulamadığınız tüm konular için",
    href: "/iletisim",
    links: [
      { label: "İletişim Formu", href: "/iletisim" },
      { label: "Sıkça Sorulan Sorular", href: "/sss" },
    ],
  },
]

const allPages = [
  { label: "Sıkça Sorulan Sorular", href: "/sss" },
  { label: "Garanti ve İade", href: "/garanti-ve-iade" },
  { label: "Teslimat Bilgileri", href: "/teslimat-bilgileri" },
  { label: "Kargo ve Taşıma Bilgileri", href: "/kargo-ve-tasima" },
  { label: "KVKK", href: "/kvkk" },
  { label: "Gizlilik Politikası", href: "/gizlilik" },
  { label: "Kullanım Koşulları", href: "/kullanim-kosullari" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
  { label: "İptal ve İade", href: "/iptal-iade" },
  { label: "Teslimat ve İade", href: "/teslimat-iade" },
  { label: "Teknik Rehberler / Blog", href: "/rehberler" },
  { label: "İletişim", href: "/iletisim" },
]

export default function MusteriHizmetleriPage() {
  return (
    <div style={{ background: "#090A0C", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-[960px] mx-auto px-6 py-12">
          <p style={{ color: "#D4A017", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
            Destek Merkezi
          </p>
          <h1 style={{ color: "#F4F4F2", fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
            Müşteri Hizmetleri
          </h1>
          <p style={{ color: "#A0A0A0", fontSize: 15, lineHeight: 1.75, maxWidth: 600 }}>
            Doğru parçayı bulmaktan siparişinizin teslim sürecine, iade talebinden teknik soruya —
            her konuda size yardımcı olmak için buradayız.
          </p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-10">

        {/* ── Hızlı İletişim ── */}
        <h2 style={{ color: "#F4F4F2", fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
          Hızlı Destek Kanalları
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">

          {/* WhatsApp */}
          <a
            href={wa.contact}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-3 p-5 rounded-xl transition-all hover:-translate-y-0.5"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.22)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <MessageCircle size={18} style={{ color: "#22c55e" }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#F4F4F2" }}>WhatsApp</div>
              <div className="text-xs mt-0.5" style={{ color: "#22c55e" }}>En hızlı yanıt</div>
              <div className="text-xs mt-1" style={{ color: "#555550" }}>Uzman 5 dk&apos;da dönüş yapar</div>
            </div>
          </a>

          {/* Telefon */}
          <a
            href={`tel:${site.phone}`}
            className="flex flex-col gap-3 p-5 rounded-xl transition-all hover:-translate-y-0.5"
            style={{ background: "#111214", border: "1px solid rgba(255,196,0,0.14)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.20)" }}
            >
              <Phone size={18} style={{ color: "#D4A017" }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#F4F4F2" }}>Telefon</div>
              <div className="text-xs mt-0.5" style={{ color: "#D4A017" }}>{site.phoneDisplay}</div>
              <div className="text-xs mt-1" style={{ color: "#555550" }}>Her gün {site.workingHours.weekdays}</div>
            </div>
          </a>

          {/* E-posta */}
          <a
            href={`mailto:${site.email}`}
            className="flex flex-col gap-3 p-5 rounded-xl transition-all hover:-translate-y-0.5"
            style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(212,160,23,0.06)", border: "1px solid rgba(255,196,0,0.12)" }}
            >
              <Mail size={18} style={{ color: "#D4A017" }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: "#F4F4F2" }}>E-posta</div>
              <div className="text-xs mt-0.5 break-all" style={{ color: "#888882" }}>{site.email}</div>
              <div className="text-xs mt-1" style={{ color: "#555550" }}>1 iş gününde yanıt</div>
            </div>
          </a>
        </div>

        {/* ── Çalışma Saatleri ── */}
        <div
          className="rounded-xl p-5 mb-12"
          style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p style={{ color: "#888882", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
            Çalışma Saatleri
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Hafta içi", value: site.workingHours.weekdays },
              { label: "Cumartesi", value: site.workingHours.saturday },
              { label: "Pazar", value: site.workingHours.sunday },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: "#555550", fontSize: 12 }}>{label}</div>
                <div style={{ color: "#E0E0DC", fontSize: 14, fontWeight: 700, marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ color: "#444440", fontSize: 11, marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            Hafta içi saat {site.shippingCutoff}&apos;e kadar verilen siparişler aynı gün kargoya verilir.
          </div>
        </div>

        {/* ── Konu Bazlı Destek ── */}
        <h2 style={{ color: "#F4F4F2", fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
          Sipariş Öncesi ve Sipariş Sonrası Destek
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {serviceTopics.map(({ icon: Icon, title, desc, links }) => (
            <div
              key={title}
              className="flex flex-col gap-3 p-5 rounded-xl border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,196,0,0.25)] transition-colors"
              style={{ background: "#111214" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(212,160,23,0.08)", border: "1px solid rgba(255,196,0,0.14)" }}
              >
                <Icon size={16} style={{ color: "#D4A017" }} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1" style={{ color: "#C0C0BA" }}>{title}</div>
                <div className="text-xs leading-snug" style={{ color: "#555550" }}>{desc}</div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                {links.map(link => (
                  "external" in link && link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors hover:text-[#D4A017]"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#888882" }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors hover:text-[#D4A017]"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#888882" }}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Firma Bilgileri ── */}
        <div
          className="rounded-xl p-5 mb-12"
          style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p style={{ color: "#888882", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Firma Bilgileri
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "İşletmeci", value: legal.tradeName },
              { label: "Vergi Dairesi", value: legal.taxOffice },
              { label: "Vergi No", value: legal.taxNumber },
              { label: "Adres", value: legal.fullAddress },
              { label: "Telefon", value: site.phoneDisplay },
              { label: "E-posta", value: site.email },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: "#444440", fontSize: 11, marginBottom: 2 }}>{label}</div>
                <div style={{ color: "#C0C0BA", fontSize: 13 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tüm Bilgi Sayfaları ── */}
        <h2 style={{ color: "#F4F4F2", fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
          Tüm Bilgi Sayfaları
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allPages.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,196,0,0.30)] group"
              style={{ background: "#111214", color: "#A0A0A0" }}
            >
              <span className="group-hover:text-[#D4A017] transition-colors">{label}</span>
              <ArrowRight size={13} style={{ color: "#444440" }} className="group-hover:text-[#D4A017] shrink-0 transition-colors" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
