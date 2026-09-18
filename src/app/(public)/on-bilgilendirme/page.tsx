import type { Metadata } from "next"
import Link from "next/link"
import { getStoreSettings, validEmail, validPhone, validWhatsApp } from "@/lib/storefront/settings"
import { buildWa } from "@/lib/whatsapp"
import { siteConfig } from "@/config/site"
import { legal } from "@/config/legal"
import LegalPageShell, { H2, H3, Para, InfoCard, InfoRow } from "@/components/legal/LegalPageShell"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `Ön Bilgilendirme Formu | ${s.siteName}`,
    description:
      "Mesafeli Sözleşmeler Yönetmeliği kapsamında sipariş öncesi tüketici bilgilendirmesi: satıcı, teslimat, ödeme, cayma hakkı ve garanti.",
    robots: "index, follow",
    alternates: { canonical: `${siteConfig.url}/on-bilgilendirme` },
  }
}

export default async function OnBilgilendirmePage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)
  const validPh = validPhone(s.phone)
  const waContact = buildWa(validWhatsApp(s.whatsapp)).contact
  const returnAddr = legal.returnAddress || legal.fullAddress

  return (
    <LegalPageShell
      category="Yasal Bilgilendirme"
      title="Ön Bilgilendirme Formu"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          Bu form, 6502 Sayılı Tüketici Kanunu ve Mesafeli Sözleşmeler Yönetmeliği
          (RG: 27.11.2014 / 29188) kapsamında, sipariş tamamlanmadan önce tüketiciye
          sunulmak üzere hazırlanmıştır. Sipariş onayı verilmeden önce dikkatlice
          okunması tavsiye edilir.
        </Para>
        <Para style={{ marginBottom: 0 }}>
          Siparişe özgü bilgiler (ürün adı, adedi, birim fiyatı, kargo ücreti, toplam
          tutar) checkout ekranında ve sipariş onay e-postasında ayrıca gösterilir.
          Bu formda sunulan veriler genel politika bilgisidir.
        </Para>
      </InfoCard>

      <H2>1. Satıcı Bilgileri</H2>

      <InfoCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InfoRow label="Ticari Unvan / Ad Soyad" value={legal.tradeName} />
          <InfoRow label="Vergi Dairesi"            value={legal.taxOffice} />
          <InfoRow label="Vergi Numarası"           value={legal.taxNumber} />
          <InfoRow label="Adres"                    value={legal.fullAddress} />
          {validPh && <InfoRow label="Telefon"  value={validPh} />}
          {validMail && <InfoRow label="E-posta" value={validMail} />}
          <InfoRow label="Web Sitesi"               value={siteConfig.url} />
        </div>
      </InfoCard>

      <H2>2. Ürün ve Sipariş Bilgileri</H2>

      <Para>
        Satışa sunulan ürünler kombi ve ısıtma sistemi yedek parçalarıdır.
        Ürünler orijinal, OEM veya muadil olarak sınıflandırılır; sınıflandırma bilgisi
        ürün sayfasında açıkça belirtilir.
      </Para>
      <Para>
        Siparişinize ait ürünlerin adı, SKU kodu, adedi, birim fiyatı ve satır toplamı
        sipariş özeti ekranında sunulur. Bu bilgiler sipariş onaylanmadan önce
        incelenebilir ve sipariş onay e-postasında da yer alır.
      </Para>

      <H2>3. Ürün Fiyatı ve Vergiler</H2>

      <Para>
        Sitedeki tüm fiyatlar <strong style={{ color: "#F4F4F2" }}>KDV dahil</strong>{" "}
        Türk Lirası (₺) cinsindendir. Fiyatlar önceden bildirilmeksizin değiştirilebilir;
        sipariş onaylanmadan önce checkout ekranındaki güncel fiyat geçerlidir.
        Sipariş onayı sonrası fiyat değişikliği onaylanmış siparişi etkilemez.
      </Para>

      <H2>4. Kargo ve Teslimat Masrafları</H2>

      <Para>
        Normal sipariş kargo ücreti <strong style={{ color: "#F4F4F2" }}>müşteriye</strong> aittir.
        Kargo ücreti, ürün ağırlığı ve boyutuna göre değişebilir; sipariş tamamlama
        ekranında hesaplanarak gösterilir.
      </Para>

      <div style={{
        background: "rgba(212,160,23,0.06)", border: "1px solid rgba(255,196,0,0.18)",
        borderRadius: 10, padding: "14px 18px", marginBottom: 16,
      }}>
        <div style={{ color: "#D4A017", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
          Ücretsiz Kargo Koşulu
        </div>
        <Para style={{ marginBottom: 0 }}>
          {s.freeShippingThreshold > 0
            ? <><strong style={{ color: "#F4F4F2" }}>{s.freeShippingThreshold} TL</strong> ve üzeri siparişlerde kargo ücreti alınmaz.</>
            : "Belirli bir sipariş tutarını aşan siparişlerde kargo ücretsiz olabilir. Geçerli eşik değeri checkout ekranında gösterilir."
          }
        </Para>
      </div>

      <Para>
        Ürün <strong style={{ color: "#F4F4F2" }}>ayıplı</strong> (hasarlı veya hatalı
        teslim) ise iade kargo ücreti satıcıya aittir.
      </Para>

      <H2>5. Kabul Edilen Ödeme Yöntemleri</H2>

      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2.1, paddingLeft: 20, marginBottom: 12 }}>
        <li>
          <strong style={{ color: "#F4F4F2" }}>Havale / EFT</strong>{" "}
          — Sipariş onayından sonra banka hesap bilgisi iletilir.
          Ödeme yapıldıktan sonra sipariş işleme alınır.
        </li>
      </ul>

      <Para>
        Kapıda ödeme seçeneği <strong style={{ color: "#F4F4F2" }}>sunulmamaktadır.</strong>
      </Para>

      <H2>6. Teslimat Bilgileri</H2>

      {legal.shippingCompany && (
        <>
          <H3>Kargo Firması</H3>
          <Para>
            Siparişler <strong style={{ color: "#F4F4F2" }}>{legal.shippingCompany}</strong> ile gönderilir.
            Kargoya teslim edildiğinde takip numarası SMS ve e-posta ile bildirilir.
          </Para>
        </>
      )}

      <H3>Aynı Gün Kargo</H3>
      {s.shippingCutoff ? (
        <Para>
          Stokta bulunan ürünlerde, hafta içi saat{" "}
          <strong style={{ color: "#F4F4F2" }}>{s.shippingCutoff}</strong>&apos;e kadar
          ödeme onaylanan siparişler aynı iş günü kargoya teslim edilir.
          Bu saatten sonra verilen siparişler bir sonraki iş günü kargoya verilir.
        </Para>
      ) : (
        <Para>
          Hafta içi iş günleri ödeme onaylanan, stokta bulunan siparişler aynı gün kargoya verilebilir.
        </Para>
      )}

      <H3>Tahmini Teslimat Süresi</H3>
      <Para>
        Kargoya verilen siparişler normal koşullarda{" "}
        <strong style={{ color: "#F4F4F2" }}>yaklaşık 2 iş günü</strong> içinde teslim edilir.
        Adres ve kargo bölgesine göre değişiklik gösterebilir. Stok dışı veya
        temin gerektiren ürünlerde süre farklılık gösterebilir; bu durumda
        müşteri önceden bilgilendirilir.
      </Para>

      <H3>Elden Teslim</H3>
      <Para>
        Uygun koşullarda ürün işyerimizden elden teslim alınabilir. Elden teslim
        için sipariş öncesinde WhatsApp veya telefon ile iletişime geçilmesi gerekir.
        {legal.fullAddress && <> İşyeri adresi:{" "}
          <strong style={{ color: "#F4F4F2" }}>{legal.fullAddress}</strong>.</>
        }
        {s.workingHours.weekdays && ` Çalışma saatleri: Her gün ${s.workingHours.weekdays}.`}
      </Para>

      <H3>Teslimat Adresi Sorumluluğu</H3>
      <Para>
        Sipariş sırasında girilen teslimat adresi kullanılır. Yanlış veya eksik
        adres bilgisi nedeniyle yaşanan gecikmelerden satıcı sorumlu tutulamaz.
        Hasarlı teslimatlarda kargo görevlisiyle tutanak tutulması ve satıcıya
        bildirilmesi zorunludur.
      </Para>

      <H2>7. Cayma Hakkı</H2>

      <Para>
        Tüketici, ürünü teslim aldığı tarihten itibaren{" "}
        <strong style={{ color: "#F4F4F2" }}>14 (on dört) takvim günü</strong> içinde
        herhangi bir gerekçe göstermeksizin ve cezai şart ödenmeksizin sözleşmeden
        cayma hakkına sahiptir. Bu hak 6502 sayılı Tüketici Kanunu ile güvence altındadır.
      </Para>

      <H3>Cayma Hakkı Kullanılamayan Durumlar</H3>
      <Para>
        Mesafeli Sözleşmeler Yönetmeliği m.15 kapsamında aşağıdaki durumlarda
        cayma hakkı uygulanmaz:
      </Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Tüketicinin özel isteği doğrultusunda üretilmiş veya kişiselleştirilmiş ürünler</li>
        <li>Fiyatı piyasa dalgalanmalarına bağlı ve satıcı kontrolünde olmayan mallar</li>
        <li>Yönetmelik kapsamındaki diğer istisnai durumlar</li>
      </ul>
      <Para>
        Ayıplı ürün (üretim kusuru, hasarlı teslim) veya yanlış ürün gönderimi cayma hakkı
        istisnalarından bağımsız olarak ayrı bir süreçle ele alınır.
      </Para>

      <H2>8. Cayma Hakkının Kullanımı</H2>

      <Para>
        Cayma hakkını kullanmak için 14 günlük süre içinde yazılı bildirim yapılmalıdır:
      </Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        {validMail && (
          <li>
            <strong style={{ color: "#F4F4F2" }}>E-posta:</strong>{" "}
            <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
            {" "}— konu: &quot;Cayma Bildirimi — Sipariş No: XXXXX&quot;
          </li>
        )}
        {waContact && (
          <li>
            <strong style={{ color: "#F4F4F2" }}>WhatsApp:</strong>{" "}
            <a href={waContact} target="_blank" rel="noopener noreferrer" style={{ color: "#22c55e" }}>
              WhatsApp ile Bildir
            </a>
          </li>
        )}
        {!validMail && !waContact && (
          <li>
            İletişim sayfamızdaki kanallardan cayma bildirimini iletebilirsiniz.
          </li>
        )}
      </ul>
      <Para>
        Cayma bildirimi alındıktan sonra 1 iş günü içinde iade onayı ve kargo
        talimatları iletilir. Ürün{" "}
        {returnAddr
          ? <><strong style={{ color: "#F4F4F2" }}>{returnAddr}</strong> adresine</>
          : "onay e-postasında belirtilen adrese"
        }{" "}orijinal ambalajında gönderilmelidir. Cayma hakkı kapsamında iade kargo
        ücreti tüketiciye aittir (ürün ayıplı değilse).
      </Para>
      <Para>
        Ürün satıcıya ulaştıktan sonra{" "}
        <strong style={{ color: "#F4F4F2" }}>14 gün</strong> içinde ödeme iade edilir.
      </Para>

      <H2>9. İade Süreci</H2>

      <Para>
        İade ve değişim koşullarının tamamı için:
      </Para>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <Link href="/garanti-ve-iade" style={{ color: "#D4A017", fontSize: 13 }}>→ Garanti ve İade</Link>
        <Link href="/iptal-iade" style={{ color: "#D4A017", fontSize: 13 }}>→ İptal ve İade Koşulları</Link>
        <Link href="/teslimat-iade" style={{ color: "#D4A017", fontSize: 13 }}>→ Teslimat ve İade</Link>
      </div>

      <H2>10. Garanti ve Ayıplı Mal Hakları</H2>

      <Para>
        Ürünlerimiz{" "}
        <strong style={{ color: "#F4F4F2" }}>12 ay</strong> garanti kapsamındadır.
        Üreticinin sunduğu garanti süresi veya mevzuatın zorunlu kıldığı süre daha
        uzun ise bu hak saklıdır.
      </Para>
      <Para>
        6502 sayılı Kanun&apos;un 11. maddesi kapsamında, ürün ayıplı (üretim kusurlu
        veya tanımdan farklı) ise tüketici şu haklardan birini kullanabilir:
        ücretsiz onarım, değişim, bedel indirimi veya iade. Ayıplı ürün iade kargo
        bedeli satıcıya aittir. Garanti inceleme hedefimiz{" "}
        <strong style={{ color: "#F4F4F2" }}>48 saattir</strong>; teknik inceleme ücretsizdir.
      </Para>
      <Para>
        Garanti talebi için sipariş numarasını, ürün kodunu ve sorunu belirterek
        WhatsApp, telefon veya e-posta ile iletişime geçin. Ayrıntılar için:{" "}
        <Link href="/garanti-ve-iade" style={{ color: "#D4A017" }}>Garanti ve İade sayfası</Link>.
      </Para>

      <H2>11. İletişim ve Uyuşmazlık Çözümü</H2>

      <InfoCard>
        <H3>Müşteri Hizmetleri</H3>
        {validPh && (
          <Para>
            <strong style={{ color: "#F4F4F2" }}>Telefon:</strong>{" "}
            <a href={`tel:${validPh}`} style={{ color: "#D4A534" }}>{validPh}</a>
            {s.workingHours.weekdays && ` — Her gün ${s.workingHours.weekdays}`}
          </Para>
        )}
        {waContact && (
          <Para>
            <strong style={{ color: "#F4F4F2" }}>WhatsApp:</strong>{" "}
            <a href={waContact} target="_blank" rel="noopener noreferrer" style={{ color: "#22c55e" }}>
              Hızlı Destek — WhatsApp
            </a>
          </Para>
        )}
        {validMail && (
          <Para style={{ marginBottom: 0 }}>
            <strong style={{ color: "#F4F4F2" }}>E-posta:</strong>{" "}
            <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
          </Para>
        )}
      </InfoCard>

      <Para>
        Tüketici şikâyetleri için İstanbul Tüketici Hakem Heyetleri ve Tüketici
        Mahkemeleri yetkilidir. Tüketiciler ayrıca e-Devlet üzerinden Tüketici
        Bilgi Sistemi&apos;ne (tbs.gtb.gov.tr) başvurabilir.
      </Para>

      <H2>12. İlgili Belgeler</H2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/mesafeli-satis-sozlesmesi" style={{ color: "#D4A017", fontSize: 13 }}>→ Mesafeli Satış Sözleşmesi</Link>
        <Link href="/garanti-ve-iade"           style={{ color: "#D4A017", fontSize: 13 }}>→ Garanti ve İade</Link>
        <Link href="/iptal-iade"                style={{ color: "#D4A017", fontSize: 13 }}>→ İptal ve İade</Link>
        <Link href="/teslimat-bilgileri"         style={{ color: "#D4A017", fontSize: 13 }}>→ Teslimat Bilgileri</Link>
        <Link href="/sss"                        style={{ color: "#D4A017", fontSize: 13 }}>→ Sıkça Sorulan Sorular</Link>
        <Link href="/musteri-hizmetleri"         style={{ color: "#D4A017", fontSize: 13 }}>→ Müşteri Hizmetleri</Link>
      </div>
    </LegalPageShell>
  )
}
