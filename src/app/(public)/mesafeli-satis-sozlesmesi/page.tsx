import type { Metadata } from "next"
import { getStoreSettings, validEmail } from "@/lib/storefront/settings"
import { siteConfig } from "@/config/site"
import { legal } from "@/config/legal"
import LegalPageShell, { H2, H3, Para, InfoCard, InfoRow } from "@/components/legal/LegalPageShell"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `Mesafeli Satış Sözleşmesi | ${s.siteName}`,
    description: "6502 sayılı Tüketici Kanunu ve Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanan satış sözleşmemiz.",
    robots: "index, follow",
  }
}

export default async function MesafeliSatisSozlesmesiPage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)
  // LEGAL_DEBT: tradeName, taxOffice, taxNumber, mersisNumber, fullAddress, returnAddress
  // are required by Mesafeli Sözleşmeler Yönetmeliği Art.4 (mandatory satıcı bilgileri).
  const returnAddr = legal.returnAddress || legal.fullAddress

  return (
    <LegalPageShell
      category="Yasal Bilgilendirme"
      title="Mesafeli Satış Sözleşmesi"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          Bu sözleşme, 6502 Sayılı Tüketici Kanunu ve Mesafeli Sözleşmeler Yönetmeliği
          (RG: 27.11.2014 / 29188) hükümlerine uygun olarak hazırlanmıştır.
          Sipariş tamamlandığında bu sözleşme taraflar arasında otomatik olarak kurulmuş sayılır.
        </Para>
      </InfoCard>

      <H2>Madde 1 — Taraflar</H2>

      <H3>1.1 Satıcı (SATICI)</H3>
      <InfoCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InfoRow label="Ticari Unvan"         value={legal.tradeName} />
          <InfoRow label="Vergi Dairesi / No"
            value={[legal.taxOffice, legal.taxNumber].filter(Boolean).join(" / ")} />
          <InfoRow label="MERSİS Numarası"      value={legal.mersisNumber} />
          <InfoRow label="Adres"                value={legal.fullAddress} />
          {s.phone && <InfoRow label="Telefon"  value={s.phone} />}
          {validMail && <InfoRow label="E-posta" value={validMail} />}
          <InfoRow label="Web Sitesi"           value={siteConfig.url} />
        </div>
      </InfoCard>

      <H3>1.2 Alıcı (ALICI / TÜKETİCİ)</H3>
      <Para>
        Sipariş formunu dolduran gerçek veya tüzel kişi. Alıcı bilgileri sipariş sırasında sisteme
        kaydedilen ad, soyad, adres, e-posta ve telefon bilgileridir.
      </Para>

      <H2>Madde 2 — Sözleşmenin Konusu</H2>
      <Para>
        Bu sözleşme, ALICI&apos;nın {siteConfig.url} adresindeki elektronik ortamda sipariş verdiği
        ürün/ürünlerin satışı ve teslimatına ilişkin tarafların hak ve yükümlülüklerini düzenler.
      </Para>

      <H2>Madde 3 — Ürün Bilgileri</H2>
      <Para>
        Sipariş edilen ürünlerin adı, adedi, birim fiyatı, toplam fiyatı ve ödeme bilgileri sipariş
        tamamlama ekranında ve e-posta onayında ALICI&apos;ya bildirilir. Bu bilgiler sözleşmenin
        ayrılmaz parçasını oluşturur.
      </Para>

      <H2>Madde 4 — Teslimat Koşulları</H2>

      <H3>4.1 Teslimat Süresi</H3>
      <Para>
        Siparişler, ödeme onayının alınmasından itibaren en geç 7 (yedi) iş günü içinde kargoya
        verilir. Stokta bulunan ürünler için tahmini teslimat süresi yaklaşık 2 iş günüdür.
      </Para>

      <H3>4.2 Aynı Gün Kargo Kesme Saati</H3>
      <Para>
        {s.shippingCutoff ? (
          <>
            Saat {s.shippingCutoff}&apos;den önce verilen ve ödeme onaylanan siparişler aynı iş günü kargoya
            teslim edilir. {s.shippingCutoff} sonrası siparişler bir sonraki iş günü işleme alınır.
          </>
        ) : (
          "Hafta içi iş günleri ödeme onaylanan siparişler aynı gün kargoya verilebilir. Detaylar sipariş sırasında bildirilir."
        )}
      </Para>

      <H3>4.3 Kargo</H3>
      <Para>
        {s.freeShippingThreshold > 0 ? `${s.freeShippingThreshold} TL` : "Belirli bir tutar"} ve üzerindeki siparişlerde kargo ücretsizdir.
        {s.shippingCost > 0 ? ` Bu tutarın altında ${s.shippingCost} TL kargo ücreti uygulanır.` : ""}
        {legal.shippingCompany && <> Kargo firması: <strong style={{ color: "#F4F4F2" }}>{legal.shippingCompany}</strong>.</>}
      </Para>

      <H3>4.4 Risk Geçişi</H3>
      <Para>
        Ürün kargo firmasına tesliminden itibaren hasar/kayıp riski ALICI&apos;ya geçer.
        Teslimatta hasar tespit edilirse tutanak tutulması ve tarafımıza bildirilmesi zorunludur.
      </Para>

      <H2>Madde 5 — Ödeme</H2>
      <Para>
        Ödeme havale/EFT veya WhatsApp üzerinden gerçekleştirilir.
        Ödeme yöntemi ve banka bilgisi sipariş onayından sonra iletilir.
      </Para>

      <H2>Madde 6 — Cayma Hakkı</H2>

      <H3>6.1 Cayma Süresi</H3>
      <Para>
        ALICI, teslim tarihinden itibaren <strong style={{ color: "#F4F4F2" }}>14 (on dört) gün</strong> içinde
        herhangi bir gerekçe göstermeksizin ve cezai şart ödenmeksizin sözleşmeden cayabilir.
      </Para>

      <H3>6.2 Cayma Bildirimi</H3>
      <Para>
        Cayma hakkını kullanmak için{" "}
        {validMail
          ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
          : "iletişim kanallarımız aracılığıyla"
        }{" "}yazılı bildirim yapılmalı veya{" "}
        <a href="/iptal-iade" style={{ color: "#D4A534" }}>İptal ve İade</a> sayfası kullanılmalıdır.
      </Para>

      <H3>6.3 İstisnalar</H3>
      <Para>Aşağıdaki durumlarda cayma hakkı kullanılamaz (Yönetmelik m.15):</Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>ALICI özel isteğine göre üretilmiş veya kişiselleştirilmiş ürünler</li>
        <li>Fiyatı piyasa dalgalanmalarına bağlı ve SATICI kontrolünde olmayan mallar</li>
        <li>Mevzuat kapsamındaki diğer istisnai durumlar (Mesafeli Sözleşmeler Yönetmeliği m.15)</li>
      </ul>

      <H2>Madde 7 — İade ve Geri Ödeme</H2>
      {returnAddr ? (
        <Para>
          Cayma hakkı kullanıldığında ürün ALICI tarafından{" "}
          <strong style={{ color: "#F4F4F2" }}>{returnAddr}</strong> adresine gönderilir.
          Ürün SATICI&apos;ya ulaştıktan sonra 14 gün içinde ödeme iade edilir.
          İade kargo bedeli ALICI&apos;ya aittir (ürün ayıplı değilse).
        </Para>
      ) : (
        <Para>
          Cayma hakkını kullanmak için{" "}
          {validMail
            ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
            : "iletişim kanallarımız aracılığıyla"
          }{" "}bildirim yapın; iade adresi ve prosedürü tarafınıza iletilir.
          Ürün tarafımıza ulaştıktan sonra 14 gün içinde ödeme iade edilir.
        </Para>
      )}

      <H2>Madde 8 — Ayıplı Mal</H2>
      <Para>
        Ayıplı ürünlerde ALICI, 6502 sayılı Kanun&apos;un 11. maddesi kapsamında bedelsiz onarım,
        değiştirme, iade veya fiyat indirimi haklarından birini kullanabilir. Ayıplı ürün iade
        kargo bedeli SATICI&apos;ya aittir.
      </Para>

      <H2>Madde 9 — Uyuşmazlık Çözümü</H2>
      <Para>
        6502 sayılı Kanun kapsamında tüketici şikâyetleri için İstanbul Tüketici Hakem Heyetleri
        ve Tüketici Mahkemeleri yetkilidir. Tüketiciler ayrıca e-Devlet üzerinden
        Tüketici Bilgi Sistemi&apos;ne (tbs.gtb.gov.tr) başvurabilir.
      </Para>

      <H2>Madde 10 — Yürürlük</H2>
      <Para>
        Sipariş onayı ile ALICI bu sözleşmeyi okuduğunu, anladığını ve kabul ettiğini beyan eder.
        Sözleşme, siparişin oluşturulduğu tarihte yürürlüğe girer.
      </Para>
    </LegalPageShell>
  )
}
