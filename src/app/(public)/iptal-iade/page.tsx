import type { Metadata } from "next"
import { site } from "@/config/site"
import { legal } from "@/config/legal"
import LegalPageShell, { H2, H3, Para, InfoCard } from "@/components/legal/LegalPageShell"

export const metadata: Metadata = {
  title: `İptal ve İade Koşulları | ${site.siteName}`,
  description: "Sipariş iptali, ürün iadesi ve geri ödeme koşulları.",
  robots: "index, follow",
}

export default function IptalIadePage() {
  const returnAddr = legal.returnAddress || legal.fullAddress

  return (
    <LegalPageShell
      category="Alışveriş Bilgisi"
      title="İptal ve İade Koşulları"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          6502 sayılı Tüketici Kanunu ve Mesafeli Sözleşmeler Yönetmeliği kapsamında
          müşterilerimize 14 günlük cayma hakkı tanıyoruz. Aşağıda iptal ve iade süreçleri
          adım adım açıklanmıştır.
        </Para>
      </InfoCard>

      {/* ── İPTAL ──────────────────────────────────────────────────────── */}
      <H2>Sipariş İptali</H2>

      <H3>Kargoya Verilmeden Önce İptal</H3>
      <Para>
        Siparişiniz henüz kargoya verilmemişse iptal talebinizi{" "}
        <a href={`mailto:${site.email}`} style={{ color: "#D4A534" }}>{site.email}</a> adresine
        iletebilirsiniz. Her gün {site.workingHours.weekdays} saatleri arasında talep
        alındığında aynı gün işleme alınır. Ödemeniz 5-7 iş günü içinde iade edilir.
      </Para>

      <H3>Kargoya Verildikten Sonra İptal</H3>
      <Para>
        Kargo sürecine giren siparişler artık iptal edilemez; ancak ürünü teslim aldıktan sonra
        14 gün cayma hakkı kapsamında iade başlatabilirsiniz (aşağıya bakınız).
      </Para>

      {/* ── İADE ──────────────────────────────────────────────────────── */}
      <H2>Cayma Hakkı ve İade</H2>

      <H3>Cayma Süresi</H3>
      <Para>
        Ürünü teslim aldığınız tarihten itibaren{" "}
        <strong style={{ color: "#F4F4F2" }}>14 takvim günü</strong> içinde gerekçe
        göstermeksizin cayma hakkını kullanabilirsiniz.
      </Para>

      <H3>İade Prosedürü — 4 Adım</H3>
      <div style={{ marginBottom: 24 }}>
        {[
          {
            no: "01",
            title: "Bildirim Yapın",
            desc: `${site.email} adresine "İade Talebi — Sipariş No: XXXXX" konusuyla e-posta gönderin. Ad soyad, sipariş numarası ve iade nedeninizi belirtin.`,
          },
          {
            no: "02",
            title: "Onay Alın",
            desc: "1 iş günü içinde iade onayı ve kargo talimatlarını içeren e-posta gönderilir.",
          },
          {
            no: "03",
            title: "Ürünü Gönderin",
            desc: returnAddr
              ? `Ürünü orijinal ambalajında, sipariş numarasını belirterek "${returnAddr}" adresine kargolayın. Kargo ücreti (ayıplı ürün değilse) size aittir.`
              : "Onay e-postasında belirtilen iade adresine orijinal ambalajında kargolayın. Kargo ücreti (ayıplı ürün değilse) size aittir.",
          },
          {
            no: "04",
            title: "Geri Ödeme",
            desc: "Ürün tarafımıza ulaştıktan ve kontrol edildikten sonra 14 gün içinde ödeme iade edilir.",
          },
        ].map(step => (
          <div key={step.no} style={{
            display: "flex",
            gap: 20,
            marginBottom: 16,
            padding: "16px 20px",
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
          }}>
            <div style={{
              minWidth: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(212,165,52,0.1)",
              border: "1px solid rgba(212,165,52,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#D4A534",
              fontSize: 13,
              fontWeight: 900,
            }}>
              {step.no}
            </div>
            <div>
              <div style={{ color: "#F4F4F2", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                {step.title}
              </div>
              <div style={{ color: "#A0A0A0", fontSize: 13, lineHeight: 1.7 }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <H2>İade Koşulları</H2>
      <Para>İade kabul edilebilmesi için:</Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Ürün kullanılmamış ve orijinal ambalajında olmalıdır</li>
        <li>Fatura veya sipariş belgesi ile birlikte gönderilmelidir</li>
        <li>14 günlük cayma süresi aşılmamış olmalıdır</li>
      </ul>

      <H2>Cayma Hakkının Uygulanmadığı Durumlar</H2>
      <Para>
        Aşağıdaki durumlarda cayma hakkı kullanılamaz. Ayıplı ürün (üretim kusuru,
        hasarlı teslim) veya yanlış ürün gönderimi bu listeden bağımsız olarak ayrı
        bir süreçle ele alınır.
      </Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Kişiye özel / özel sipariş üretilen ürünler</li>
        <li>Cayma süresinin (14 takvim günü) dolduğu durumlar</li>
        <li>Mevzuat kapsamındaki diğer istisnai durumlar (Mesafeli Sözleşmeler Yönetmeliği m.15)</li>
      </ul>

      <H2>Ayıplı Ürün İadesi</H2>
      <Para>
        Ürün hasarlı, eksik veya tanımından farklı ise iade kargo bedeli tarafımıza aittir.
        Teslimde fark ettiyseniz tutanak tutup reddedin; teslimden sonra fark ettiyseniz
        fotoğraflı bildirim yapın. Tercih hakkınız: ücretsiz onarım, değişim, iade veya fiyat indirimi.
      </Para>

      {returnAddr && (
        <>
          <H2>İade Adresi</H2>
          <InfoCard>
            {legal.tradeName && (
              <Para style={{ marginBottom: 6 }}>
                <strong style={{ color: "#F4F4F2" }}>{legal.tradeName}</strong>
              </Para>
            )}
            <Para style={{ marginBottom: 8 }}>{returnAddr}</Para>
            <Para style={{ marginBottom: 0 }}>
              Pakete sipariş numaranızı yazın. Kargosuz/ödemeli iadeler kabul edilmez.
            </Para>
          </InfoCard>
        </>
      )}

      <H2>Geri Ödeme Süreleri</H2>
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ textAlign: "left", color: "#D4A534", padding: "10px 12px", fontWeight: 700, fontSize: 12 }}>Ödeme Yöntemi</th>
              <th style={{ textAlign: "left", color: "#D4A534", padding: "10px 12px", fontWeight: 700, fontSize: 12 }}>Geri Ödeme Süresi</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Kredi Kartı",       "14 gün (ekstrenize 1-3 gün sonra yansır)"],
              ["Banka Kartı",       "5-10 iş günü"],
              ["Havale / EFT",      "5-7 iş günü — sipariş sırasında belirtilen IBAN'a aktarılır"],
            ].map(([method, time], i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ color: "#F4F4F2", padding: "10px 12px", fontWeight: 600 }}>{method}</td>
                <td style={{ color: "#A0A0A0", padding: "10px 12px" }}>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InfoCard>
        <H3>İptal / İade Talebi İçin</H3>
        <Para>
          <strong style={{ color: "#F4F4F2" }}>E-posta:</strong>{" "}
          <a href={`mailto:${site.email}`} style={{ color: "#D4A534" }}>{site.email}</a>
        </Para>
        <Para style={{ marginBottom: 0 }}>
          <strong style={{ color: "#F4F4F2" }}>Telefon / WhatsApp:</strong>{" "}
          <a href={`tel:${site.phone}`} style={{ color: "#D4A534" }}>{site.phoneDisplay}</a>
          {" "}— Her gün {site.workingHours.weekdays}
        </Para>
      </InfoCard>
    </LegalPageShell>
  )
}
