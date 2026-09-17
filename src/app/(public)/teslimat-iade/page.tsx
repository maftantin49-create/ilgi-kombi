import type { Metadata } from "next"
import { site } from "@/config/site"
import { legal } from "@/config/legal"
import LegalPageShell, { H2, H3, Para, InfoCard } from "@/components/legal/LegalPageShell"

export const metadata: Metadata = {
  title: `Teslimat ve İade | ${site.siteName}`,
  description: "Kargo süreleri, teslimat koşulları ve iade süreçleri hakkında bilgi.",
  robots: "index, follow",
}

export default function TeslimatIadePage() {
  const returnAddr = legal.returnAddress || legal.fullAddress

  return (
    <LegalPageShell
      category="Alışveriş Bilgisi"
      title="Teslimat ve İade"
      lastUpdated="Ağustos 2026"
    >

      {/* ── TESLİMAT ──────────────────────────────────────────────────── */}
      <H2>Teslimat Bilgileri</H2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {[
          ...(legal.shippingCompany ? [{ label: "Kargo Firması", value: legal.shippingCompany }] : []),
          { label: "Ücretsiz Kargo",  value: `${site.freeShippingThreshold} TL ve üzeri` },
          { label: "Kargo Ücreti",    value: `${site.shippingCost} TL` },
          { label: "Aynı Gün Kesme", value: `${site.shippingCutoff} (iş günleri)` },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "#111111",
            border: "1px solid rgba(212,165,52,0.12)",
            borderRadius: 12,
            padding: "16px 18px",
          }}>
            <div style={{ color: "#5A5A5A", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {label}
            </div>
            <div style={{ color: "#F4F4F2", fontSize: 18, fontWeight: 800 }}>{value}</div>
          </div>
        ))}
      </div>

      <H3>Teslimat Süresi</H3>
      <Para>
        Ödeme onayının alınmasından itibaren siparişler en geç 7 iş günü içinde kargoya verilir.
        Stokta bulunan ürünlerde tahmini teslimat süresi yaklaşık 2 iş günüdür (adrese ve kargo
        rotasına göre değişebilir).
      </Para>

      <H3>Aynı Gün Kargo</H3>
      <Para>
        Hafta içi saat {site.shippingCutoff}&apos;e kadar verilen ve ödeme onaylanan siparişler aynı iş günü
        kargoya teslim edilir. Hafta sonu verilen siparişler bir sonraki iş günü kargoya verilir.
        Resmi tatil günlerinde ise takip eden ilk iş gününde kargoya verilir.
      </Para>

      <H3>Teslimat Takibi</H3>
      <Para>
        Siparişiniz kargoya verildiğinde takip numarası SMS ve e-posta ile bildirilir. Teslimat
        gecikmeleri için{" "}
        <a href={`tel:${site.phone}`} style={{ color: "#D4A534" }}>{site.phoneDisplay}</a> numaralı
        hattımızı arayabilirsiniz.
      </Para>

      <H3>Teslimat Sorunları</H3>
      <Para>
        Teslimatta hasarlı veya eksik ürün tespit ederseniz teslimi reddedip tutanak tutturmanızı
        öneririz. Ardından{" "}
        <a href={`mailto:${site.email}`} style={{ color: "#D4A534" }}>{site.email}</a> adresine
        fotoğraflı bildirim yapın; 2 iş günü içinde dönüş sağlanır.
      </Para>

      {/* ── İADE ──────────────────────────────────────────────────────── */}
      <H2>İade Bilgileri</H2>

      <H3>Cayma Hakkı</H3>
      <Para>
        Teslim tarihinden itibaren <strong style={{ color: "#F4F4F2" }}>14 gün</strong> içinde,
        herhangi bir gerekçe göstermeksizin iade talebinde bulunabilirsiniz.
        Bu hak 6502 sayılı Tüketici Kanunu güvencesindedir.
      </Para>

      <H3>İade Koşulları</H3>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır</li>
        <li>Fatura veya sipariş numarası ile birlikte gönderilmelidir</li>
        <li>14 günlük cayma süresi geçmemiş olmalıdır</li>
        <li>Kişiye özel sipariş edilen ürünler cayma hakkı kapsamında değerlendirilemez</li>
      </ul>

      <H3>İade Adresi</H3>
      <InfoCard>
        {returnAddr ? (
          <>
            {legal.tradeName && (
              <Para style={{ marginBottom: 6 }}>
                <strong style={{ color: "#F4F4F2" }}>{legal.tradeName}</strong>
              </Para>
            )}
            <Para style={{ marginBottom: 8 }}>{returnAddr}</Para>
          </>
        ) : (
          <Para style={{ marginBottom: 8 }}>
            İade adresi için{" "}
            <a href={`mailto:${site.email}`} style={{ color: "#D4A534" }}>{site.email}</a> adresine
            sipariş numaranızı belirterek ulaşın.
          </Para>
        )}
        <Para style={{ marginBottom: 0 }}>
          İade paketinin üzerine sipariş numaranızı yazmayı unutmayın.
          İade kargo ücreti, ürün ayıplı değilse alıcıya aittir.
        </Para>
      </InfoCard>

      <H3>Geri Ödeme</H3>
      <Para>
        İade ürünü aldıktan ve kontrol ettikten sonra{" "}
        <strong style={{ color: "#F4F4F2" }}>14 gün</strong> içinde ödemeniz iade edilir.
        Geri ödeme aynı ödeme yöntemiyle yapılır. Kredi kartı iadeleri bankanızın işlem
        süresine bağlı olarak ekstrenize 1-3 iş günü sonra yansır.
      </Para>

      <H3>Ayıplı (Kusurlu) Ürün</H3>
      <Para>
        Ürün hasarlı veya tanımından farklı teslim edildiyse iade kargo bedeli tarafımıza aittir.
        Ayıplı ürünlerde şu haklardan birini kullanabilirsiniz: ücretsiz onarım, değişim,
        iade veya fiyat indirimi.
      </Para>

      <InfoCard>
        <H3>İade Başlatmak İçin</H3>
        <Para>
          <strong style={{ color: "#F4F4F2" }}>E-posta:</strong>{" "}
          <a href={`mailto:${site.email}`} style={{ color: "#D4A534" }}>{site.email}</a>
          {" "}— konu: &quot;İade Talebi — Sipariş No:&quot;
        </Para>
        <Para style={{ marginBottom: 0 }}>
          <strong style={{ color: "#F4F4F2" }}>WhatsApp / Telefon:</strong>{" "}
          <a href={`tel:${site.phone}`} style={{ color: "#D4A534" }}>{site.phoneDisplay}</a>
          {" "}— Her gün {site.workingHours.weekdays}
        </Para>
      </InfoCard>
    </LegalPageShell>
  )
}
