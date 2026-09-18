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
    title: `Teslimat Bilgileri | ${s.siteName}`,
    description: "Sipariş hazırlama, aynı gün kargo, kargo takibi ve teslimatta dikkat edilmesi gerekenler.",
    robots: "index, follow",
    alternates: { canonical: `${siteConfig.url}/teslimat-bilgileri` },
  }
}

export default async function TeslimatBilgileriPage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)
  const validPh = validPhone(s.phone)
  const waContact = buildWa(validWhatsApp(s.whatsapp)).contact

  return (
    <LegalPageShell
      category="Alışveriş Bilgisi"
      title="Teslimat Bilgileri"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          Siparişinizin doğru ve hızlı ulaşması için sürecin her adımında şeffaf
          bilgi sunmayı hedefliyoruz. Aşağıda sipariş hazırlama, kargolama ve
          teslim süreçleri hakkında detaylı bilgi bulabilirsiniz.
        </Para>
      </InfoCard>

      <H2>Sipariş Hazırlama Süreci</H2>
      <Para>
        Ödemeniz onaylandıktan sonra siparişiniz hazırlık sürecine alınır. Stokta
        bulunan ürünler aynı veya ertesi iş günü paketlenip kargoya verilir.
        Stok dışı veya temin edilmesi gereken ürünler için süre farklılık gösterebilir;
        bu durumda sizi önceden bilgilendiririz.
      </Para>

      <H2>Aynı Gün Kargo</H2>

      {s.shippingCutoff ? (
        <div style={{
          background: "rgba(212,160,23,0.08)",
          border: "1px solid rgba(255,196,0,0.22)",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 20,
        }}>
          <div style={{ color: "#D4A017", fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
            ⏰ Kesme Saati: {s.shippingCutoff}
          </div>
          <Para style={{ marginBottom: 0 }}>
            Hafta içi saat <strong style={{ color: "#F4F4F2" }}>{s.shippingCutoff}</strong>&apos;e
            kadar ödeme onaylanan siparişler aynı iş günü kargoya teslim edilir.
          </Para>
        </div>
      ) : (
        <Para>
          Hafta içi iş günleri ödeme onaylanan stokta bulunan siparişler aynı gün kargoya verilebilir.
        </Para>
      )}

      <Para>
        Hafta sonu verilen siparişler hafta içi kargo akışına dahil edilir; bir sonraki
        iş günü kargoya teslim edilir. Resmi tatil günlerinde kargo kabul edilmeyebilir;
        bu tarihlerdeki siparişler takip eden ilk iş gününde kargoya verilir.
      </Para>

      <H2>Kargo Takibi</H2>
      <Para>
        Siparişiniz{legal.shippingCompany ? ` ${legal.shippingCompany} aracılığıyla` : ""} kargoya
        teslim edildiğinde, kayıtlı e-posta adresinize ve telefon numaranıza otomatik bildirim
        gönderilir. Bu bildirimde kargo takip numarası yer alır; bu numara ile anlık takip
        yapabilirsiniz.
      </Para>

      <H3>Takip için gerekenler</H3>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Kargo takip numarası (bildirim SMS / e-postasında bulunur)</li>
        {legal.shippingCompany && <li>{legal.shippingCompany} web sitesi veya müşteri hattı üzerinden sorgulayın</li>}
        <li>Alternatif: tarafımızla iletişime geçerek sizi yönlendirmemizi isteyin</li>
      </ul>

      <H2>Tahmini Teslimat Süresi</H2>
      <Para>
        Kargoya verilen siparişler normal koşullarda <strong style={{ color: "#F4F4F2" }}>yaklaşık 2 iş günü</strong>{" "}
        içinde teslim edilir. Teslimat süresi adresinize ve kargo bölgenize göre değişiklik
        gösterebilir; şehir içi teslimatlar genellikle daha kısa sürer, uzak bölgeler daha
        uzun sürebilir.{legal.shippingCompany && ` Kargo firması: ${legal.shippingCompany}.`}
      </Para>

      <H3>Gecikmeler</H3>
      <Para>
        Hava koşulları, yoğunluk dönemleri (bayram, yılbaşı), adres sorunları
        veya kargo firmasından kaynaklanabilecek gecikmeler konusunda tarafımızın
        doğrudan kontrolü bulunmamaktadır. Bu durumlarda derhal kargo firmasıyla
        iletişime geçmenizi öneririz.
      </Para>

      <H2>Teslimat Adresi</H2>
      <Para>
        Sipariş sırasında girdiğiniz adres üzerinden teslimat gerçekleştirilir.
        Adres değişikliği için siparişiniz kargoya verilmeden önce bizimle
        iletişime geçin; kargoya verildikten sonra adres değişikliği mümkün
        olmayabilir.
      </Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Kapı numarası ve kat bilgisi dahil tam adresi girin</li>
        <li>Ulaşılabilecek bir telefon numarası bırakın</li>
        <li>Teslimatta evde olmayacaksanız komşu veya güvenlik görevlisine bırakma talimatı verebilirsiniz</li>
      </ul>

      <H2>Teslim Sırasında Paket Kontrolü</H2>
      <Para>
        Kargonuzu teslim alırken paketin dış yüzeyini kontrol edin. Ezilme,
        ıslanma veya açılma izleri varsa teslimi reddetmeyin — önce kargo
        görevlisiyle hasar tutanağı tutturun.
      </Para>

      <H3>Hasarlı Paket Prosedürü</H3>
      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {[
          "Paketi teslim almadan önce dış hasarı kargo görevlisine bildirin",
          "Kargo görevlisiyle birlikte hasarı fotoğrafla belgeleyin",
          "\"Hasar Tutanağı\" düzenlenmesini isteyin — tutanak olmadan hak talep edemezsiniz",
          validMail
            ? `Durumu ${validMail} adresine veya WhatsApp üzerinden bildirin`
            : "Durumu e-posta veya WhatsApp üzerinden bildirin",
          "2 iş günü içinde çözüm için sizi arayacağız",
        ].map((step, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, alignItems: "flex-start",
            padding: "12px 16px", background: "#111214",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10,
          }}>
            <span style={{
              minWidth: 24, height: 24, borderRadius: "50%",
              background: "rgba(212,160,23,0.10)", border: "1px solid rgba(212,160,23,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#D4A017", fontSize: 11, fontWeight: 900, flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <span style={{ color: "#A0A0A0", fontSize: 13, lineHeight: 1.6 }}>{step}</span>
          </div>
        ))}
      </div>

      <H2>Elden Teslim</H2>
      <Para>
        Uygun koşullarda ürününüzü işyerimizden elden teslim alabilirsiniz.
        Elden teslim için sipariş öncesinde WhatsApp veya telefon ile iletişime geçin;
        hazırlık onayı aldıktan sonra aşağıdaki adresten teslim alabilirsiniz:
      </Para>
      {legal.fullAddress && (
        <div style={{
          background: "rgba(212,160,23,0.06)", border: "1px solid rgba(255,196,0,0.18)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
        }}>
          <div style={{ color: "#D4A017", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>İşyeri Adresi</div>
          <div style={{ color: "#C0C0BA", fontSize: 13 }}>{legal.fullAddress}</div>
        </div>
      )}
      <Para>
        {s.workingHours.weekdays ? `Çalışma saatlerimiz: her gün ${s.workingHours.weekdays}. ` : ""}
        Elden teslim için önceden aranmanız gerekir; hazırlıksız gelen müşteriler için ürün bekletme garantisi verilmez.
      </Para>

      <H2>Eksik Ürün Bildirimi</H2>
      <Para>
        Paketinizde eksik ürün olduğunu fark ederseniz teslim tarihinden itibaren
        2 iş günü içinde sipariş numaranızı belirterek{" "}
        {validMail
          ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
          : "e-posta yoluyla"
        }{" "}adresine bildirin. Eksik ürün en kısa sürede gönderilecektir.
      </Para>

      <InfoCard>
        <H3>Teslimat Sorunları için İletişim</H3>
        {waContact && (
          <Para>
            <strong style={{ color: "#F4F4F2" }}>WhatsApp:</strong>{" "}
            <a href={waContact} target="_blank" rel="noopener noreferrer" style={{ color: "#22c55e" }}>
              Hızlı Destek — WhatsApp
            </a>
          </Para>
        )}
        {validMail && (
          <Para>
            <strong style={{ color: "#F4F4F2" }}>E-posta:</strong>{" "}
            <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
          </Para>
        )}
        <Para style={{ marginBottom: 0 }}>
          <strong style={{ color: "#F4F4F2" }}>Telefon:</strong>{" "}
          {validPh
            ? <a href={`tel:${validPh}`} style={{ color: "#D4A534" }}>{validPh}</a>
            : "iletişim sayfamızdaki numaramız"
          }
          {s.workingHours.weekdays ? ` — Her gün ${s.workingHours.weekdays}` : ""}
        </Para>
      </InfoCard>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <Link href="/kargo-ve-tasima" style={{ color: "#D4A017", fontSize: 13 }}>→ Kargo ve Taşıma Bilgileri</Link>
        <Link href="/garanti-ve-iade" style={{ color: "#D4A017", fontSize: 13 }}>→ Garanti ve İade</Link>
        <Link href="/sss" style={{ color: "#D4A017", fontSize: 13 }}>→ Sıkça Sorulan Sorular</Link>
      </div>
    </LegalPageShell>
  )
}
