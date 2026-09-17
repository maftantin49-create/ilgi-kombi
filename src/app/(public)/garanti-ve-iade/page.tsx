import type { Metadata } from "next"
import Link from "next/link"
import { site } from "@/config/site"
import { legal } from "@/config/legal"
import { wa } from "@/lib/whatsapp"
import LegalPageShell, { H2, H3, Para, InfoCard } from "@/components/legal/LegalPageShell"

export const metadata: Metadata = {
  title: `Garanti ve İade | ${site.siteName}`,
  description:
    "İstanbul Kombi Yedek Parça ürünleri için garanti kapsamı, iade koşulları ve süreç hakkında detaylı bilgi.",
  robots: "index, follow",
  alternates: { canonical: `${site.url}/garanti-ve-iade` },
}

export default function GarantiVeIadePage() {
  const returnAddr = legal.returnAddress || legal.fullAddress

  return (
    <LegalPageShell
      category="Alışveriş Bilgisi"
      title="Garanti ve İade"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          Satın aldığınız ürünlerde sorun yaşarsanız veya farklı bir ürün geldiyse
          çözüme kavuşturmak için buradayız. 6502 sayılı Tüketici Kanunu ve Mesafeli
          Sözleşmeler Yönetmeliği kapsamında haklarınız güvence altındadır.
        </Para>
      </InfoCard>

      {/* ── GARANTİ ────────────────────────────────────────────────────── */}
      <H2>Garanti Kapsamı</H2>

      <H3>Garanti Süresi</H3>
      <Para>
        Ürünlerimiz <strong style={{ color: "#F4F4F2" }}>12 ay</strong> garanti
        kapsamındadır. Üreticinin sunduğu garanti süresi veya mevzuatın zorunlu
        kıldığı süre daha uzun ise bu hak saklıdır. Belirli ürünlerin garanti
        koşulları ürün sayfasında belirtilir.
      </Para>

      <H3>Garanti Nedir?</H3>
      <Para>
        Satışını gerçekleştirdiğimiz ürünler, üretici firma standartlarına ve ürün
        açıklamasına uygun olarak teslim edilir. Ürünün ambalaj açılmadan, montaj
        yapılmadan önce kontrol edilmesini öneririz; ürün açıklamasından farklı veya
        hatalı bir ürün teslim alırsanız aşağıdaki süreçleri işleterek çözüm sağlarız.
      </Para>

      <H3>Üretim ve Ürün Kusurları</H3>
      <Para>
        Ürünün üretim kaynaklı bir kusuru varsa; onarım, değişim, bedel indirimi veya
        iade seçeneklerinden birini kullanma hakkına sahipsiniz. Bu durumda iade kargo
        bedeli tarafımıza aittir.
      </Para>

      <H3>Yanlış Ürün Teslimi</H3>
      <Para>
        Sipariş ettiğinizden farklı bir ürün teslim aldıysanız; ürünü kullanmadan,
        orijinal ambalajında tutun ve derhal bizimle iletişime geçin. Doğru ürünü
        en kısa sürede gönderir, yanlış ürünü ücretsiz olarak geri alırız.
      </Para>

      <H3>Hasarlı Ürün Teslimi</H3>
      <Para>
        Teslimatta hasarlı ürün fark ederseniz teslimi reddedin ve kargo görevlisiyle
        tutanak tutturun. Teslimden sonra fark ettiyseniz fotoğraflı belgelemeyle birlikte
        2 iş günü içinde bize bildirin.
      </Para>

      <H3>Eksik Ürün</H3>
      <Para>
        Siparişinizde eksik ürün varsa sipariş numaranızı ve eksik ürün detayını
        iletişim kanallarımızdan iletin; en kısa sürede tamamlanır.
      </Para>

      <H3>Montaj Öncesi Kontrol</H3>
      <Para>
        Teknik parçaları montaj yapmadan önce cihazınıza uygunluğunu ve fiziksel
        durumunu mutlaka kontrol edin. Montaj sonrasında ortaya çıkan uyumsuzluklar
        yasal cayma hakkı kapsamında değerlendirilemez; bu nedenle sipariş öncesi
        uyumluluk teyidi almayı öneririz.
      </Para>

      <H3>Montaj Yapılmış Ürünler</H3>
      <Para>
        Montaj öncesinde ürünün cihazınıza uyumluluğunu ve fiziksel durumunu kontrol
        etmenizi öneririz. Montaj sonrasında sorun yaşıyorsanız durumu fotoğraflı
        olarak belgeleyip bize iletebilirsiniz; teknik inceleme sonucuna göre çözüm
        üretiriz. Cayma hakkı değerlendirmesi ürüne ve koşullara göre yapılır.
      </Para>

      <H3>Teknik Parçalarda Dikkat Edilmesi Gerekenler</H3>
      <Para>
        Hava prosestatı, 3 yollu motor, gaz valfi gibi bazı teknik parçalar için
        iade/garanti değerlendirmesi ürüne ve koşullara bağlı olarak farklılık
        gösterebilir. Bu ürünlerde sipariş öncesi WhatsApp üzerinden uyumluluk
        teyidi almanızı ve montaj için yetkili teknik servis kullanmanızı öneririz.
      </Para>

      <H3>Kullanılmış Ürünler</H3>
      <Para>
        Kullanılmış ürünlerde cayma hakkı kapsamında iade normalde değerlendirilemez.
        Ürün üretim kaynaklı bir kusur içeriyorsa farklı değerlendirme yapılabilir;
        bu durumda bizimle iletişime geçin.
      </Para>

      {/* ── GARANTİ TALEBİ ──────────────────────────────────────────────── */}
      <H2>Garanti Talebi — Nasıl Başlatılır?</H2>

      <Para>
        Garanti veya teknik sorun yaşadığınızda aşağıdaki adımları takip edin:
      </Para>

      <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
        {[
          { no: "01", title: "Talep Oluşturun", desc: `WhatsApp, telefon veya ${site.email} adresinden bize ulaşın. Sipariş numaranızı, ürün kodunu, sorunu ve mümkünse fotoğrafı paylaşın.` },
          { no: "02", title: "Ön Değerlendirme", desc: "Ekibimiz problemi ön olarak değerlendirir. Gerekirse ek bilgi (cihaz modeli, montaj durumu, servis belgesi) isteyebiliriz." },
          { no: "03", title: "Ürün Gönderimi (gerekiyorsa)", desc: "Uzaktan çözülemeyen durumlarda ürünü orijinal ambalajında, sipariş numarasını belirterek bize göndermenizi isteyebiliriz." },
          { no: "04", title: "Teknik Değerlendirme", desc: "Ürün inceleme hedefimiz 48 saattir. Değerlendirmede yanlış montaj, voltaj, sıvı, darbe, oksitlenme gibi teknik faktörler dikkate alınır." },
          { no: "05", title: "Sonuç ve Çözüm", desc: "Değerlendirme sonucu size iletilir. Üretim kaynaklı kusur tespit edilmesi durumunda onarım, değişim veya iade seçeneklerinden biri uygulanır." },
        ].map(step => (
          <div key={step.no} style={{
            display: "flex", gap: 20, padding: "14px 18px",
            background: "#111214", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12,
          }}>
            <div style={{
              minWidth: 36, height: 36, borderRadius: "50%",
              background: "rgba(212,160,23,0.10)", border: "1px solid rgba(212,160,23,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#D4A017", fontSize: 12, fontWeight: 900, flexShrink: 0,
            }}>
              {step.no}
            </div>
            <div>
              <div style={{ color: "#F4F4F2", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{step.title}</div>
              <div style={{ color: "#888882", fontSize: 13, lineHeight: 1.7 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Para>
        Kağıt faturanızın kaybolması durumunda sistem üzerinden sipariş doğrulaması
        yapılabilir; bu durum tek başına garanti hakkı kaybı anlamına gelmez.
      </Para>

      {/* ── İADE ────────────────────────────────────────────────────────── */}
      <H2>İade Hakkı ve Koşulları</H2>

      <H3>Cayma Hakkı</H3>
      <Para>
        Teslim tarihinden itibaren <strong style={{ color: "#F4F4F2" }}>14 takvim günü</strong>{" "}
        içinde gerekçe göstermeksizin iade hakkınız bulunmaktadır. Bu hak 6502 sayılı
        Tüketici Kanunu ile güvence altındadır.
      </Para>

      <H3>İade Koşulları</H3>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır</li>
        <li>Tüm aksesuarlar ve belgeler eksiksiz iade edilmelidir</li>
        <li>Sipariş belgesi veya fatura numarası ibraz edilmelidir</li>
        <li>14 günlük cayma süresi geçmemiş olmalıdır</li>
      </ul>

      <H3>Cayma Hakkının Kullanılamadığı Durumlar</H3>
      <Para>
        6502 sayılı Tüketici Kanunu kapsamındaki cayma hakkı aşağıdaki durumlarda
        uygulanmaz. Ayıplı ürün (üretim kusuru, hasarlı teslim) veya yanlış ürün
        gönderimi bu listeden bağımsız olarak ayrı bir süreçle ele alınır.
      </Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Kişiye özel / özel sipariş üretilen ürünler</li>
        <li>Cayma süresinin (14 takvim günü) geçtiği durumlar</li>
        <li>Mevzuat kapsamındaki diğer istisnai durumlar</li>
      </ul>

      {/* ── İADE SÜRECİ ─────────────────────────────────────────────────── */}
      <H2>İade Süreci — 4 Adım</H2>

      <div style={{ marginBottom: 24 }}>
        {[
          {
            no: "01",
            title: "Talep Oluşturun",
            desc: `E-posta: ${site.email} — Konu: "İade Talebi — Sipariş No: XXXXX"\nAd soyad, sipariş numarası ve iade gerekçenizi belirtin.`,
          },
          {
            no: "02",
            title: "Onay E-postası Alın",
            desc: "1 iş günü içinde iade onayı ve kargo talimatlarını içeren e-posta gönderilir.",
          },
          {
            no: "03",
            title: "Ürünü Gönderin",
            desc: returnAddr
              ? `Ürünü orijinal ambalajında paketleyip sipariş numaranızı yazarak aşağıdaki adrese kargolayın:\n${returnAddr}\nKargo ücreti (ayıplı ürün değilse) size aittir.`
              : "Onay e-postasındaki iade adresine, orijinal ambalajında ve sipariş numarasını belirterek kargolayın.",
          },
          {
            no: "04",
            title: "Geri Ödeme Alın",
            desc: "Ürün tarafımıza ulaştıktan ve incelendikten sonra 14 gün içinde ödemeniz iade edilir.",
          },
        ].map(step => (
          <div key={step.no} style={{
            display: "flex",
            gap: 20,
            marginBottom: 16,
            padding: "16px 20px",
            background: "#111214",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
          }}>
            <div style={{
              minWidth: 40, height: 40, borderRadius: "50%",
              background: "rgba(212,160,23,0.10)", border: "1px solid rgba(212,160,23,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#D4A017", fontSize: 13, fontWeight: 900, flexShrink: 0,
            }}>
              {step.no}
            </div>
            <div>
              <div style={{ color: "#F4F4F2", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                {step.title}
              </div>
              <div style={{ color: "#888882", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {step.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PARA İADESİ ──────────────────────────────────────────────────── */}
      <H2>Para İadesi</H2>

      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
              <th style={{ textAlign: "left", color: "#D4A017", padding: "10px 12px", fontWeight: 700, fontSize: 12 }}>Ödeme Yöntemi</th>
              <th style={{ textAlign: "left", color: "#D4A017", padding: "10px 12px", fontWeight: 700, fontSize: 12 }}>İade Süresi</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Kredi Kartı", "14 gün (bankanıza bağlı olarak ekstreye 1–3 gün sonra yansır)"],
              ["Banka Kartı", "5–10 iş günü"],
              ["Havale / EFT", "5–7 iş günü — sipariş sırasında belirtilen IBAN'a aktarılır"],
            ].map(([method, time], i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ color: "#F4F4F2", padding: "10px 12px", fontWeight: 600 }}>{method}</td>
                <td style={{ color: "#A0A0A0", padding: "10px 12px" }}>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Para>
        İade kargo bedeli, ürün ayıplı (hasarlı veya hatalı teslim) değilse alıcıya aittir.
        Ürün ayıplıysa iade kargo bedeli tarafımızca karşılanır.
      </Para>

      {/* ── İLETİŞİM ─────────────────────────────────────────────────────── */}
      <InfoCard>
        <H3>Garanti ve İade için İletişim</H3>
        <Para>
          <strong style={{ color: "#F4F4F2" }}>E-posta:</strong>{" "}
          <a href={`mailto:${site.email}`} style={{ color: "#D4A534" }}>{site.email}</a>
          {" "}(konu: İade Talebi / Garanti Bildirimi)
        </Para>
        <Para>
          <strong style={{ color: "#F4F4F2" }}>WhatsApp:</strong>{" "}
          <a href={wa.contact} target="_blank" rel="noopener noreferrer" style={{ color: "#22c55e" }}>
            Hızlı Destek — WhatsApp
          </a>
        </Para>
        <Para style={{ marginBottom: 0 }}>
          <strong style={{ color: "#F4F4F2" }}>Telefon:</strong>{" "}
          <a href={`tel:${site.phone}`} style={{ color: "#D4A534" }}>{site.phoneDisplay}</a>
          {" "}— Her gün {site.workingHours.weekdays}
        </Para>
      </InfoCard>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
        <Link href="/iptal-iade" style={{ color: "#D4A017", fontSize: 13 }}>→ İptal ve İade Koşulları</Link>
        <Link href="/teslimat-iade" style={{ color: "#D4A017", fontSize: 13 }}>→ Teslimat ve İade Bilgisi</Link>
        <Link href="/sss" style={{ color: "#D4A017", fontSize: 13 }}>→ Sıkça Sorulan Sorular</Link>
      </div>
    </LegalPageShell>
  )
}
