import type { Metadata } from "next"
import { getStoreSettings, validEmail } from "@/lib/storefront/settings"
import { legal } from "@/config/legal"
import { siteConfig } from "@/config/site"
import LegalPageShell, { H2, H3, Para, InfoCard } from "@/components/legal/LegalPageShell"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `Kullanım Koşulları | ${s.siteName}`,
    description: "Web sitemizi kullanırken geçerli olan hüküm ve koşullar.",
    robots: "index, follow",
  }
}

export default async function KullanimKosullariPage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)

  return (
    <LegalPageShell
      category="Yasal Bilgilendirme"
      title="Kullanım Koşulları"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          Bu Kullanım Koşulları, <strong style={{ color: "#F4F4F2" }}>{siteConfig.url}</strong> adresinde
          sunulan hizmetlere erişim ve kullanımına ilişkin kuralları belirler.
          Siteyi kullanarak bu koşulları kabul etmiş sayılırsınız.
        </Para>
        <Para style={{ marginBottom: 0 }}>
          İşletmeci:{" "}
          {legal.tradeName
            ? <strong style={{ color: "#F4F4F2" }}>{legal.tradeName}</strong>
            : <strong style={{ color: "#F4F4F2" }}>{s.siteName}</strong>
          }
          {validMail ? ` — ${validMail}` : ""}{s.phone ? ` — ${s.phone}` : ""}
        </Para>
      </InfoCard>

      <H2>1. Hizmetin Kapsamı</H2>
      <Para>
        {s.siteName} olarak kombi ve ısıtma sistemleri yedek parçalarının online satışını
        gerçekleştiriyoruz. Site yalnızca Türkiye&apos;deki bireysel tüketicilere ve işletmelere hizmet
        vermektedir. Bazı ürünlerin teknik bilgi gerektirdiğini; doğru parça seçimi için müşteri
        hizmetlerimize danışmanızı tavsiye ederiz.
      </Para>

      <H2>2. Üyelik ve Hesap Güvenliği</H2>
      <Para>
        Sipariş oluşturmak için üyelik zorunlu değildir; misafir olarak ödeme yapılabilir.
        Hesap oluşturursanız, giriş bilgilerinizin gizliliğini korumak sizin sorumluluğunuzdadır.
        Hesabınızda yetkisiz bir işlem tespit ederseniz derhal{" "}
        {validMail
          ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
          : "iletişim kanallarımız aracılığıyla"
        }{" "}bildirin.
      </Para>

      <H2>3. Ürün Bilgileri ve Fiyatlar</H2>

      <H3>3.1 Ürün Uyumluluk Sorumluluğu</H3>
      <Para>
        Ürün açıklamaları ve uyumluluk bilgileri genel referans amacıyla sunulmaktadır.
        Sipariş vermeden önce cihazınızın seri numarası ve model bilgisini bizimle paylaşmanızı
        öneririz. Yanlış ürün seçiminden kaynaklanan zararlardan sorumluluk kabul etmiyoruz.
      </Para>

      <H3>3.2 Fiyat Değişiklikleri</H3>
      <Para>
        Sitedeki fiyatlar önceden haber verilmeksizin değiştirilebilir. Sipariş onayı sonrasında
        fiyat değişikliği siparişinizi etkilemez; onaylı sipariş fiyatı sabit kalır.
      </Para>

      <H3>3.3 Stok Durumu</H3>
      <Para>
        Stok bilgileri gerçek zamanlı güncellenmektedir. Sipariş sonrası stok tükenmesi halinde
        durumu derhal bildiririz; tam iade veya alternatif ürün önerisi sunarız.
      </Para>

      <H2>4. Sipariş Süreci</H2>
      <Para>
        Sepete ürün eklemek bir satış teklifi niteliği taşımaz. Bağlayıcı sözleşme, ödemenizin
        onaylanması ve tarafımızca sipariş onay e-postasının gönderilmesiyle kurulur.
        Detaylar için <a href="/mesafeli-satis-sozlesmesi" style={{ color: "#D4A534" }}>Mesafeli Satış Sözleşmesi</a>&apos;ni
        inceleyin.
      </Para>

      <H2>5. Fikri Mülkiyet</H2>
      <Para>
        Sitedeki tüm içerik (metinler, görseller, logo, tasarım, kod) {s.siteName}&apos;e aittir
        veya lisanslıdır. İzin almaksızın kopyalanamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
      </Para>

      <H2>6. Yasak Kullanımlar</H2>
      <Para>Aşağıdaki davranışlar kesinlikle yasaktır:</Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Sahte veya yanıltıcı bilgi girişi</li>
        <li>Otomatik araçlarla sitenin taranması (scraping)</li>
        <li>Sitenin güvenlik mekanizmalarını aşmaya çalışmak</li>
        <li>Başkalarının hesabına erişim</li>
        <li>Spam, zararlı yazılım veya virüs yayma</li>
      </ul>

      <H2>7. Sorumluluk Sınırlaması</H2>
      <Para>
        Mücbir sebepler (doğal afet, kargo gecikmesi, tedarik kesintisi) nedeniyle oluşan
        gecikmelerden sorumluluk üstlenemeyiz. Teknik arızalardan kaynaklanan kesintilerde doğrudan
        zararın ötesinde tazminat talep edilemez. Tüketici hakları kapsamındaki yasal güvenceler
        saklıdır.
      </Para>

      <H2>8. Uygulanacak Hukuk</H2>
      <Para>
        Bu koşullar Türk Hukuku&apos;na tabidir. Uyuşmazlıklarda İstanbul Tüketici Mahkemeleri ve
        Tüketici Hakem Heyetleri yetkilidir.
      </Para>

      <H2>9. Değişiklikler</H2>
      <Para>
        Kullanım Koşulları önceden duyurulmaksızın güncellenebilir. Güncel koşullar her zaman bu
        sayfada yayımlanır. Siteyi kullanmaya devam etmek, güncel koşulları kabul anlamına gelir.
      </Para>

      <InfoCard>
        <H3>Sorularınız İçin</H3>
        <Para style={{ marginBottom: 0 }}>
          {validMail
            ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
            : "İletişim sayfamızı ziyaret edin."
          }
          {s.phone ? ` — ${s.phone}` : ""}
          {s.workingHours.weekdays ? ` (Hafta içi ${s.workingHours.weekdays})` : ""}
        </Para>
      </InfoCard>
    </LegalPageShell>
  )
}
