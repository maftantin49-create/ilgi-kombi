import type { Metadata } from "next"
import Link from "next/link"
import {
  Phone, Mail, MessageCircle, ArrowRight,
  ShoppingCart, Package, Wrench, Truck, RefreshCw,
  Shield, AlertTriangle, HeadphonesIcon, Lock, BookOpen,
  HelpCircle, FileText,
} from "lucide-react"
import { getStoreSettings, validEmail, validPhone, validWhatsApp } from "@/lib/storefront/settings"
import { buildWa } from "@/lib/whatsapp"
import { siteConfig } from "@/config/site"
import { legal } from "@/config/legal"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `Müşteri Hizmetleri | ${s.siteName}`,
    description:
      "Sipariş, ürün uyumluluğu, kargo, iade ve teknik destek konularında yardım almak için müşteri hizmetleri merkezimizi ziyaret edin.",
    robots: "index, follow",
    alternates: { canonical: `${siteConfig.url}/musteri-hizmetleri` },
  }
}

const allPages = [
  { label: "Sıkça Sorulan Sorular",      href: "/sss" },
  { label: "Garanti ve İade",            href: "/garanti-ve-iade" },
  { label: "Teslimat Bilgileri",         href: "/teslimat-bilgileri" },
  { label: "Kargo ve Taşıma Bilgileri", href: "/kargo-ve-tasima" },
  { label: "KVKK",                       href: "/kvkk" },
  { label: "Gizlilik Politikası",        href: "/gizlilik" },
  { label: "Kullanım Koşulları",         href: "/kullanim-kosullari" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/mesafeli-satis-sozlesmesi" },
  { label: "İptal ve İade",             href: "/iptal-iade" },
  { label: "Teslimat ve İade",          href: "/teslimat-iade" },
  { label: "Teknik Rehberler / Blog",   href: "/rehberler" },
  { label: "İletişim",                  href: "/iletisim" },
]

export default async function MusteriHizmetleriPage() {
  const s = await getStoreSettings()
  const validPh = validPhone(s.phone)
  const validMail = validEmail(s.email)
  const waContact = buildWa(validWhatsApp(s.whatsapp)).contact

  type TopicLink = { label: string; href: string; external?: true }
  const waLink = (label: string): TopicLink =>
    waContact
      ? { label, href: waContact, external: true }
      : { label: "İletişim Formu", href: "/iletisim" }

  const serviceTopics = [
    {
      icon: ShoppingCart,
      title: "Sipariş ve Ödeme",
      desc: "Sipariş verme, ödeme yöntemleri, fatura ve sipariş iptali",
      links: [{ label: "Sıkça Sorulan Sorular", href: "/sss" }] as TopicLink[],
    },
    {
      icon: Package,
      title: "Sipariş Takibi",
      desc: "Kargoya verilen siparişinizin anlık durumunu öğrenin",
      links: [waLink("WhatsApp ile Takip Et"), { label: "İletişim", href: "/iletisim" }] as TopicLink[],
    },
    {
      icon: Wrench,
      title: "Ürün Seçimi ve Uyumluluk",
      desc: "Kombinize uygun parçayı bulmak için yardım alın",
      links: [
        { label: "Parça Bul Aracı", href: "/parca-bul" },
        { label: "SSS — Ürün Seçimi", href: "/sss" },
      ] as TopicLink[],
    },
    {
      icon: Truck,
      title: "Kargo ve Teslimat",
      desc: "Aynı gün kargo, teslimat süresi, kargo takibi ve adres bilgileri",
      links: [
        { label: "Teslimat Bilgileri", href: "/teslimat-bilgileri" },
        { label: "Kargo ve Taşıma", href: "/kargo-ve-tasima" },
      ] as TopicLink[],
    },
    {
      icon: RefreshCw,
      title: "İade ve Değişim",
      desc: "14 günlük cayma hakkı, iade prosedürü ve geri ödeme süreci",
      links: [
        { label: "Garanti ve İade", href: "/garanti-ve-iade" },
        { label: "İptal ve İade Koşulları", href: "/iptal-iade" },
      ] as TopicLink[],
    },
    {
      icon: Shield,
      title: "Garanti",
      desc: "Ürün garantisi, üretim kusurları ve garanti başvurusu",
      links: [{ label: "Garanti Bilgileri", href: "/garanti-ve-iade" }] as TopicLink[],
    },
    {
      icon: AlertTriangle,
      title: "Hasarlı / Hatalı Ürün",
      desc: "Yanlış, eksik veya hasarlı ürün teslimi durumunda yapılacaklar",
      links: [
        { label: "Garanti ve İade", href: "/garanti-ve-iade" },
        waLink("WhatsApp Destek"),
      ] as TopicLink[],
    },
    {
      icon: HeadphonesIcon,
      title: "Teknik Destek",
      desc: "Parça seçimi, montaj öncesi kontrol ve teknik sorular",
      links: [
        waLink("WhatsApp ile Sor"),
        { label: "Teknik Rehberler", href: "/rehberler" },
      ] as TopicLink[],
    },
    {
      icon: Lock,
      title: "Güvenli Alışveriş",
      desc: "Ödeme güvenliği, kart bilgileri ve site güvenlik altyapısı",
      links: [{ label: "Gizlilik Politikası", href: "/gizlilik" }] as TopicLink[],
    },
    {
      icon: FileText,
      title: "KVKK ve Gizlilik",
      desc: "Kişisel verilerinizin nasıl işlendiği ve haklarınız",
      links: [
        { label: "KVKK Aydınlatma", href: "/kvkk" },
        { label: "Gizlilik Politikası", href: "/gizlilik" },
      ] as TopicLink[],
    },
    {
      icon: BookOpen,
      title: "Blog ve Rehberler",
      desc: "Kombi parçaları hakkında teknik rehberler",
      links: [{ label: "Teknik Rehberler", href: "/rehberler" }] as TopicLink[],
    },
    {
      icon: HelpCircle,
      title: "Diğer Sorular",
      desc: "SSS'te yanıt bulamadığınız tüm konular için",
      links: [
        { label: "İletişim Formu", href: "/iletisim" },
        { label: "Sıkça Sorulan Sorular", href: "/sss" },
      ] as TopicLink[],
    },
  ]

  return (
    <div className="bg-white min-h-screen">

      {/* Hero */}
      <div style={{ borderBottom: "1px solid #E2E6EA" }}>
        <div className="max-w-[960px] mx-auto px-6 py-12">
          <p style={{ color: "#2563EB", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
            Destek Merkezi
          </p>
          <h1 style={{ color: "#111827", fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
            Müşteri Hizmetleri
          </h1>
          <p style={{ color: "#6B7280", fontSize: 15, lineHeight: 1.75, maxWidth: 600 }}>
            Doğru parçayı bulmaktan siparişinizin teslim sürecine, iade talebinden teknik soruya —
            her konuda size yardımcı olmak için buradayız.
          </p>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 py-10">

        {/* Hızlı İletişim */}
        <h2 style={{ color: "#111827", fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
          Hızlı Destek Kanalları
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">

          {/* WhatsApp */}
          {waContact ? (
            <a
              href={waContact}
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
                <div className="font-bold text-sm text-gray-900">WhatsApp</div>
                <div className="text-xs mt-0.5" style={{ color: "#22c55e" }}>En hızlı yanıt</div>
                <div className="text-xs mt-1 text-gray-400">Uzman 5 dk&apos;da dönüş yapar</div>
              </div>
            </a>
          ) : (
            <Link
              href="/iletisim"
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
                <div className="font-bold text-sm text-gray-900">Canlı Destek</div>
                <div className="text-xs mt-0.5" style={{ color: "#22c55e" }}>İletişim formunu kullanın</div>
              </div>
            </Link>
          )}

          {/* Telefon */}
          {validPh ? (
            <a
              href={`tel:${validPh}`}
              className="flex flex-col gap-3 p-5 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "#FFFFFF", border: "1px solid #E2E6EA" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
              >
                <Phone size={18} style={{ color: "#2563EB" }} />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">Telefon</div>
                <div className="text-xs mt-0.5" style={{ color: "#2563EB" }}>{validPh}</div>
                {s.workingHours.weekdays && (
                  <div className="text-xs mt-1 text-gray-400">Her gün {s.workingHours.weekdays}</div>
                )}
              </div>
            </a>
          ) : null}

          {/* E-posta */}
          {validMail ? (
            <a
              href={`mailto:${validMail}`}
              className="flex flex-col gap-3 p-5 rounded-xl transition-all hover:-translate-y-0.5"
              style={{ background: "#FFFFFF", border: "1px solid #E2E6EA" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
              >
                <Mail size={18} style={{ color: "#2563EB" }} />
              </div>
              <div>
                <div className="font-bold text-sm text-gray-900">E-posta</div>
                <div className="text-xs mt-0.5 break-all text-gray-500">{validMail}</div>
                <div className="text-xs mt-1 text-gray-400">1 iş gününde yanıt</div>
              </div>
            </a>
          ) : null}
        </div>

        {/* Çalışma Saatleri */}
        {(s.workingHours.weekdays || s.workingHours.saturday || s.workingHours.sunday) && (
          <div
            className="rounded-xl p-5 mb-12"
            style={{ background: "#F8F9FA", border: "1px solid #E2E6EA" }}
          >
            <p style={{ color: "#9CA3AF", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
              Çalışma Saatleri
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Hafta içi", value: s.workingHours.weekdays },
                { label: "Cumartesi", value: s.workingHours.saturday },
                { label: "Pazar",     value: s.workingHours.sunday },
              ].filter(h => h.value).map(({ label, value }) => (
                <div key={label}>
                  <div style={{ color: "#9CA3AF", fontSize: 12 }}>{label}</div>
                  <div style={{ color: "#111827", fontSize: 14, fontWeight: 700, marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
            {s.shippingCutoff && (
              <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 10, paddingTop: 10, borderTop: "1px solid #E2E6EA" }}>
                Hafta içi saat {s.shippingCutoff}&apos;e kadar verilen siparişler aynı gün kargoya verilir.
              </div>
            )}
          </div>
        )}

        {/* Konu Bazlı Destek */}
        <h2 style={{ color: "#111827", fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
          Sipariş Öncesi ve Sipariş Sonrası Destek
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {serviceTopics.map(({ icon: Icon, title, desc, links }) => (
            <div
              key={title}
              className="flex flex-col gap-3 p-5 rounded-xl border border-[#E2E6EA] hover:border-[#93C5FD] transition-colors"
              style={{ background: "#FFFFFF" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.12)" }}
              >
                <Icon size={16} style={{ color: "#2563EB" }} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1 text-gray-900">{title}</div>
                <div className="text-xs leading-snug text-gray-500">{desc}</div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: "1px solid #E2E6EA" }}>
                {links.map(link => (
                  "external" in link && link.external ? (
                    <a
                      key={link.href + link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors hover:text-blue-700"
                      style={{ background: "#F1F3F5", color: "#374151" }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href + link.label}
                      href={link.href}
                      className="text-xs px-2.5 py-1 rounded-md font-medium transition-colors hover:text-blue-700"
                      style={{ background: "#F1F3F5", color: "#374151" }}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Firma Bilgileri */}
        <div
          className="rounded-xl p-5 mb-12"
          style={{ background: "#F8F9FA", border: "1px solid #E2E6EA" }}
        >
          <p style={{ color: "#9CA3AF", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Firma Bilgileri
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: "İşletmeci", value: legal.tradeName },
              { label: "Vergi Dairesi", value: legal.taxOffice },
              { label: "Vergi No", value: legal.taxNumber },
              { label: "Adres", value: legal.fullAddress },
              { label: "Telefon", value: validPh },
              { label: "E-posta", value: validMail },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: "#9CA3AF", fontSize: 11, marginBottom: 2 }}>{label}</div>
                <div style={{ color: "#374151", fontSize: 13 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tüm Bilgi Sayfaları */}
        <h2 style={{ color: "#111827", fontSize: 15, fontWeight: 800, marginBottom: 14 }}>
          Tüm Bilgi Sayfaları
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allPages.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 border border-[#E2E6EA] hover:border-[#93C5FD] group"
              style={{ background: "#FFFFFF", color: "#374151" }}
            >
              <span className="group-hover:text-blue-700 transition-colors">{label}</span>
              <ArrowRight size={13} className="text-gray-300 group-hover:text-blue-600 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
