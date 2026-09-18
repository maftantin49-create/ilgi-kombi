import type { Metadata } from "next"
import { getStoreSettings, validEmail } from "@/lib/storefront/settings"
import { siteConfig } from "@/config/site"
import { legal } from "@/config/legal"
import LegalPageShell, { H2, H3, Para, InfoCard, InfoRow } from "@/components/legal/LegalPageShell"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `KVKK Aydınlatma Metni | ${s.siteName}`,
    description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanan aydınlatma metnimiz.",
    robots: "index, follow",
  }
}

export default async function KvkkPage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)
  // LEGAL_DEBT: tradeName, taxOffice, taxNumber, mersisNumber, fullAddress required
  // for complete veri sorumlusu declaration under KVKK Art.10.

  return (
    <LegalPageShell
      category="Yasal Bilgilendirme"
      title="KVKK Aydınlatma Metni"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          6698 Sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 10. maddesi uyarınca, veri sorumlusu sıfatıyla
          kişisel verilerinizin işlenmesine ilişkin sizi aydınlatmak amacıyla bu metin hazırlanmıştır.
        </Para>
      </InfoCard>

      <H2>1. Veri Sorumlusunun Kimliği</H2>
      <InfoCard>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <InfoRow label="Ticari Unvan"    value={legal.tradeName} />
          <InfoRow label="Vergi Dairesi"   value={legal.taxOffice} />
          <InfoRow label="Vergi Numarası"  value={legal.taxNumber} />
          <InfoRow label="MERSİS No"       value={legal.mersisNumber} />
          <InfoRow label="Adres"           value={legal.fullAddress} />
          {s.phone && <InfoRow label="Telefon"  value={s.phone} />}
          {validMail && <InfoRow label="E-posta" value={validMail} />}
          <InfoRow label="Web Sitesi"      value={siteConfig.url} />
        </div>
      </InfoCard>

      <H2>2. İşlenen Kişisel Veriler</H2>
      <Para>Hizmetlerimiz kapsamında aşağıdaki kategorilerdeki kişisel veriler işlenmektedir:</Para>

      <H3>Kimlik ve İletişim Verileri</H3>
      <Para>Ad, soyad, e-posta adresi, telefon numarası</Para>

      <H3>Adres ve Teslimat Verileri</H3>
      <Para>Fatura adresi, teslimat adresi, posta kodu</Para>

      <H3>İşlem ve Sipariş Verileri</H3>
      <Para>Sipariş numarası, satın alınan ürünler, ödeme yöntemi (kart bilgileri hariç), fatura tutarı</Para>

      <H3>Teknik Veriler</H3>
      <Para>IP adresi, tarayıcı türü, işletim sistemi, siteye erişim saatleri ve gezilen sayfalar</Para>

      <H2>3. Kişisel Verilerin İşlenme Amaçları ve Hukuki Sebepler</H2>
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ textAlign: "left", color: "#D4A534", padding: "10px 12px", fontWeight: 700, fontSize: 12 }}>Amaç</th>
              <th style={{ textAlign: "left", color: "#D4A534", padding: "10px 12px", fontWeight: 700, fontSize: 12 }}>Hukuki Sebep</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Sipariş işleme ve kargo gönderimi",         "KVKK m.5/2-c — Sözleşmenin ifası"],
              ["Fatura düzenleme ve muhasebe kayıtları",    "KVKK m.5/2-ç — Yasal yükümlülük"],
              ["Müşteri hizmetleri ve şikâyet yönetimi",   "KVKK m.5/2-c — Sözleşmenin ifası"],
              ["Dolandırıcılık önleme ve site güvenliği",  "KVKK m.5/2-f — Meşru menfaat"],
              ["Pazarlama e-postaları ve bildirimler",      "KVKK m.5/1 — Açık rıza"],
              ["Yasal talepler ve resmi bildirimler",       "KVKK m.5/2-ç — Yasal yükümlülük"],
            ].map(([amac, sebep], i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ color: "#A0A0A0", padding: "10px 12px" }}>{amac}</td>
                <td style={{ color: "#A0A0A0", padding: "10px 12px" }}>{sebep}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>4. Kişisel Verilerin Aktarıldığı Taraflar</H2>
      <Para>Kişisel verileriniz aşağıdaki alıcı kategorilerine, yalnızca amacın gerektirdiği ölçüde aktarılmaktadır:</Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>
          <strong style={{ color: "#F4F4F2" }}>
            {legal.shippingCompany || "Kargo Firması"}:
          </strong>
          {" "}Teslimat için ad, adres, telefon
        </li>
        <li><strong style={{ color: "#F4F4F2" }}>Banka / Ödeme Kuruluşu:</strong> Havale/EFT işlem doğrulaması</li>
        <li><strong style={{ color: "#F4F4F2" }}>Supabase Inc. (ABD):</strong> Veritabanı barındırma — yeterli koruma önlemleri alınmıştır</li>
        <li><strong style={{ color: "#F4F4F2" }}>Yetkili Kamu Kurumları:</strong> Kanunen zorunlu hallerde</li>
      </ul>

      <H2>5. Kişisel Verilerin Saklanma Süreleri</H2>
      <Para>
        Sipariş ve fatura kayıtları 5 yıl (Vergi Usul Kanunu), muhasebe kayıtları 10 yıl saklanır.
        Teknik log kayıtları 1 yıl içinde silinir. Pazarlama onayı geri alındığında 30 gün içinde
        listeden çıkarma işlemi tamamlanır.
      </Para>

      <H2>6. İlgili Kişi Hakları</H2>
      <Para>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
        <li>Eksik/yanlış işlenen verilerin düzeltilmesini isteme</li>
        <li>Kişisel verilerin silinmesini/yok edilmesini isteme</li>
        <li>Otomatik sistemle analiz sonucu aleyhinize çıkan sonuca itiraz etme</li>
        <li>Zararın giderilmesini talep etme</li>
      </ul>

      <H2>7. Başvuru Yöntemi</H2>
      <InfoCard>
        <Para>
          Haklarınızı kullanmak için aşağıdaki kanallardan birini kullanabilirsiniz:
        </Para>
        <Para>
          <strong style={{ color: "#F4F4F2" }}>E-posta:</strong>{" "}
          {validMail
            ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
            : "iletişim sayfamızdaki e-posta adresimiz"
          }
          {" "}(konu: KVKK Başvurusu)
        </Para>
        {legal.fullAddress && (
          <Para>
            <strong style={{ color: "#F4F4F2" }}>Posta:</strong>{" "}
            {legal.tradeName && <>{legal.tradeName}, </>}{legal.fullAddress} — &quot;KVKK Başvurusu&quot; ibaresiyle
          </Para>
        )}
        <Para style={{ marginBottom: 0 }}>
          Başvurunuz 30 gün içinde sonuçlandırılır. Yetersiz yanıt verilmesi halinde
          Kişisel Verileri Koruma Kurumu&apos;na (kvkk.gov.tr) şikâyette bulunabilirsiniz.
        </Para>
      </InfoCard>
    </LegalPageShell>
  )
}
