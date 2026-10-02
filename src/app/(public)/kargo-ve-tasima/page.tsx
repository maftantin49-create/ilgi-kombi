import type { Metadata } from "next"
import Link from "next/link"
import { getStoreSettings, validEmail, validPhone, validWhatsApp } from "@/lib/storefront/settings"
import { buildWa } from "@/lib/whatsapp"
import { siteConfig } from "@/config/site"
import { legal } from "@/config/legal"
import LegalPageShell, { H2, H3, Para, InfoCard } from "@/components/legal/LegalPageShell"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `Kargo ve Taşıma Bilgileri | ${s.siteName}`,
    description: "Paketleme süreci, kargo takibi, teslim alınamayan sipariş ve iade kargosuna dair bilgiler.",
    robots: "index, follow",
    alternates: { canonical: `${siteConfig.url}/kargo-ve-tasima` },
  }
}

export default async function KargoVeTasimaPage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)
  const validPh = validPhone(s.phone)
  const waContact = buildWa(validWhatsApp(s.whatsapp)).contact

  return (
    <LegalPageShell
      category="Alışveriş Bilgisi"
      title="Kargo ve Taşıma Bilgileri"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          Ürünlerinizin güvenli ve hasarsız ulaşması en önemli önceliğimizdir.
          Paketleme sürecinden teslimata kadar dikkatli bir süreç yönetimi uygulanmaktadır.
        </Para>
      </InfoCard>

      <H2>Paketleme Süreci</H2>
      <Para>
        Tüm siparişler, ürünün boyut ve hassasiyetine göre uygun ambalaj malzemeleriyle
        paketlenir. Kırılgan veya hassas elektronik parçalar, darbe emici malzeme
        kullanılarak ek koruma altına alınır. Paketin dış yüzeyine sipariş ve adres
        bilgileri eksiksiz olarak yerleştirilir.
      </Para>

      <H2>Kargoya Teslim</H2>

      <H3>İş Günleri ve Tahmini Süre</H3>
      <Para>
        Siparişler{legal.shippingCompany ? ` ${legal.shippingCompany} ile` : ""} gönderilir.
        {s.shippingCutoff && (
          <> Aynı gün kargo için kesme saati hafta içi{" "}
          <strong style={{ color: "#111827" }}>{s.shippingCutoff}</strong>&apos;dir.
          Bu saatten sonra verilen siparişler bir sonraki iş günü kargoya verilir.</>
        )}
        {" "}Normal koşullarda teslimat <strong style={{ color: "#111827" }}>yaklaşık 2 iş günü</strong> sürer.
      </Para>

      <H3>Resmi Tatiller</H3>
      <Para>
        Resmi tatil günlerinde kargo firması kabul yapmayabilir. Bu tarihlerde verilen
        siparişler takip eden ilk iş gününde kargoya verilir.
      </Para>

      <H2>Kargo Ücretlendirmesi</H2>
      <Para>
        Kargo ücreti, ürünün boyut ve ağırlığına (desi hesabı) göre kargo firması
        tarafından belirlenir. Sipariş tamamlama aşamasında kargo tutarı hesaplanarak
        görüntülenir.
      </Para>

      {s.freeShippingThreshold > 0 && (
        <div style={{
          background: "rgba(37,99,235,0.04)",
          border: "1px solid rgba(37,99,235,0.14)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 16,
        }}>
          <div style={{ color: "#2563EB", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
            Ücretsiz Kargo
          </div>
          <Para style={{ marginBottom: 0 }}>
            <strong style={{ color: "#111827" }}>{s.freeShippingThreshold} TL</strong> ve üzeri
            siparişlerde kargo ücreti alınmaz.
          </Para>
        </div>
      )}

      <H2>Kargo Takibi</H2>
      <Para>
        Siparişiniz kargoya teslim edildiğinde e-posta ve SMS ile takip numarası
        gönderilir. Bu numara ile kargo firmasının web sitesi veya mobil uygulaması
        üzerinden anlık takip yapabilirsiniz.
      </Para>
      <Para>
        Takip bilgisi ulaşmadıysa veya takipte sorun yaşıyorsanız sipariş numaranızı
        belirterek bizimle iletişime geçin; durumu kargo firmasıyla takip ederiz.
      </Para>

      <H2>Teslimat Adresi Sorumluluğu</H2>
      <Para>
        Siparişte belirtilen adrese kargo teslim edilir. Yanlış veya eksik adres
        bilgisi nedeniyle yaşanan gecikmeler veya iade edilmeler tarafımızın
        sorumluluğu dışındadır.
      </Para>
      <ul style={{ color: "#374151", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Teslimat adresini eksiksiz ve doğru girin (kapı no, kat, daire)</li>
        <li>Ulaşılabilir bir telefon numarası bırakın</li>
        <li>Teslimat sırasında adreste bulunmamanız halinde komşu bırakma talebi yapabilirsiniz</li>
      </ul>

      <H2>Teslim Alınamayan Sipariş</H2>
      <Para>
        Adresinizde teslim alıcı bulunamadığında kargo firması ihbar bırakır.
        Belirtilen süre içinde gidilmezse kargo bize iade edilir. Bu durumda
        tekrar kargo göndermek için yeni kargo ücreti tahakkuk edebilir.
      </Para>
      <Para>
        Kargonuzu almak için kargo firmasının şubesine gidebilir veya yeni teslimat
        randevusu alabilirsiniz.
      </Para>

      <H2>Hasarlı Koli ve Tutanak</H2>
      <Para>
        Kargonuzu teslim alırken dış ambalajda hasar, ezilme veya ıslanma fark
        ederseniz:
      </Para>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {[
          "Teslim almadan önce kargo görevlisine hasarı bildirin",
          "Fotoğrafla belgeleyin",
          "Kargo görevlisiyle birlikte resmi hasar tutanağı düzenleyin",
          "Tutanağın bir kopyasını sakların",
          validMail
            ? `Tutanak ve fotoğraflarla birlikte ${validMail} adresine bildirin`
            : "Tutanak ve fotoğraflarla birlikte e-posta yoluyla bildirin",
        ].map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "12px 16px", background: "#F8F9FA",
            border: "1px solid #E2E6EA", borderRadius: 10,
          }}>
            <span style={{
              minWidth: 24, height: 24, borderRadius: "50%",
              background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.20)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#2563EB", fontSize: 11, fontWeight: 900, flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <span style={{ color: "#374151", fontSize: 13, lineHeight: 1.6 }}>{step}</span>
          </div>
        ))}
      </div>
      <Para>
        Tutanak olmadan hasar şikâyetleri değerlendirilemez. Hasarın kargo kaynaklı
        mı yoksa ürün kaynaklı mı olduğunu tutanak üzerinden tespit ederiz.
      </Para>

      <H2>İade Gönderimi</H2>
      <Para>
        İade onayı aldıktan sonra ürünü orijinal ambalajında paketleyip sipariş
        numaranızı dış ambalaja yazarak kargolayın. İade kargo ücreti, ürün ayıplı
        değilse alıcıya aittir. Ayıplı (hatalı veya hasarlı) ürünlerde kargo bedeli
        tarafımızca karşılanır.
      </Para>
      <Para>
        Ödemeli veya karşılıklı gönderimler kabul edilmez; kendi kargolamanızda
        tercih ettiğiniz firmayı kullanabilirsiniz.
      </Para>

      <InfoCard>
        <H3>Kargo Sorunları için İletişim</H3>
        {waContact && (
          <Para>
            <strong style={{ color: "#111827" }}>WhatsApp:</strong>{" "}
            <a href={waContact} target="_blank" rel="noopener noreferrer" style={{ color: "#22c55e" }}>
              Hızlı Destek — WhatsApp
            </a>
          </Para>
        )}
        {validMail && (
          <Para>
            <strong style={{ color: "#111827" }}>E-posta:</strong>{" "}
            <a href={`mailto:${validMail}`} style={{ color: "#2563EB" }}>{validMail}</a>
          </Para>
        )}
        <Para style={{ marginBottom: 0 }}>
          <strong style={{ color: "#111827" }}>Telefon:</strong>{" "}
          {validPh
            ? <a href={`tel:${validPh}`} style={{ color: "#2563EB" }}>{validPh}</a>
            : "iletişim sayfamızdaki numaramız"
          }
          {s.workingHours.weekdays ? ` — Her gün ${s.workingHours.weekdays}` : ""}
        </Para>
      </InfoCard>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <Link href="/teslimat-bilgileri" style={{ color: "#2563EB", fontSize: 13 }}>→ Teslimat Bilgileri</Link>
        <Link href="/garanti-ve-iade" style={{ color: "#2563EB", fontSize: 13 }}>→ Garanti ve İade</Link>
        <Link href="/musteri-hizmetleri" style={{ color: "#2563EB", fontSize: 13 }}>→ Müşteri Hizmetleri</Link>
      </div>
    </LegalPageShell>
  )
}
