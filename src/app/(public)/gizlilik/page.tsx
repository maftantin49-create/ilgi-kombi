import type { Metadata } from "next"
import { getStoreSettings, validEmail } from "@/lib/storefront/settings"
import { siteConfig } from "@/config/site"
import { legal } from "@/config/legal"
import LegalPageShell, { H2, H3, Para, InfoCard } from "@/components/legal/LegalPageShell"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `Gizlilik Politikası | ${s.siteName}`,
    description: "Kişisel verilerinizin nasıl toplandığı, işlendiği ve korunduğuna ilişkin gizlilik politikamız.",
    robots: "index, follow",
  }
}

export default async function GizlilikPage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)
  // LEGAL_DEBT: legal.tradeName required for veri sorumlusu declaration (KVKK Art.10)
  const returnAddr = legal.returnAddress || legal.fullAddress

  return (
    <LegalPageShell
      category="Yasal Bilgilendirme"
      title="Gizlilik Politikası"
      lastUpdated="Ağustos 2026"
    >
      <InfoCard>
        <Para>
          Bu Gizlilik Politikası, <strong style={{ color: "#F4F4F2" }}>{s.siteName}</strong> olarak{" "}
          <strong style={{ color: "#F4F4F2" }}>{siteConfig.url}</strong> adresinde sunduğumuz hizmetler kapsamında
          kişisel verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.
        </Para>
        {legal.tradeName && (
          <Para>
            Veri sorumlusu:{" "}
            <strong style={{ color: "#F4F4F2" }}>{legal.tradeName}</strong>
            {legal.fullAddress ? ` — ${legal.fullAddress}` : ""}
          </Para>
        )}
      </InfoCard>

      <H2>1. Topladığımız Veriler</H2>

      <H3>1.1 Doğrudan Verdiğiniz Veriler</H3>
      <Para>
        Sipariş oluştururken ad, soyad, e-posta adresi, telefon numarası, fatura ve teslimat adresi bilgilerinizi
        topluyoruz. İletişim formu veya WhatsApp üzerinden gönderdiğiniz mesajlar bu kapsama girer.
      </Para>

      <H3>1.2 Otomatik Toplanan Veriler</H3>
      <Para>
        Sitemizi ziyaret ettiğinizde IP adresi, tarayıcı türü, işletim sistemi ve ziyaret ettiğiniz sayfalar
        gibi teknik veriler sunucu kayıtlarımıza otomatik olarak kaydedilir. Bu veriler analitik amaçla
        kullanılır, kişisel kimlik tespitine yönelik işlenmez.
      </Para>

      <H3>1.3 Ödeme Verileri</H3>
      <Para>
        Ödeme işlemleri havale/EFT yöntemiyle gerçekleştirilir.
        Banka hesap bilgileriniz tarafımızca depolanmaz.
      </Para>

      <H2>2. Verilerin Kullanım Amaçları</H2>
      <Para>Topladığımız kişisel verileri aşağıdaki amaçlarla işliyoruz:</Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        <li>Sipariş işleme, faturalama ve kargo gönderimleri</li>
        <li>Müşteri hizmetleri ve teknik destek</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi (vergi, muhasebe)</li>
        <li>Site güvenliği ve dolandırıcılık önleme</li>
        <li>Onayınız alındığında: kampanya ve bilgilendirme e-postaları</li>
      </ul>

      <H2>3. Veri Paylaşımı</H2>
      <Para>
        Kişisel verilerinizi üçüncü kişilere satmıyoruz. Yalnızca aşağıdaki hizmet sağlayıcılarla,
        hizmetin ifası için zorunlu olan ölçüde paylaşıyoruz:
      </Para>
      <ul style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 2, paddingLeft: 20, marginBottom: 12 }}>
        {legal.shippingCompany && (
          <li>
            <strong style={{ color: "#F4F4F2" }}>{legal.shippingCompany}</strong> (kargo): Teslimat için ad, adres, telefon
          </li>
        )}
        {!legal.shippingCompany && (
          <li>Kargo firması: Teslimat için ad, adres, telefon</li>
        )}
        <li>Banka / Ödeme Kuruluşu: Havale/EFT doğrulaması ve işlem kaydı</li>
        <li>Supabase Inc.: Veritabanı altyapısı (veri Türkiye dışında işlenebilir — açık rıza gereklidir)</li>
        <li>Yetkili kamu kurumları: Yasal zorunluluk halinde</li>
      </ul>

      <H2>4. Çerezler (Cookies)</H2>
      <Para>
        Sitemiz oturum yönetimi ve teknik işlevsellik için zorunlu çerezler kullanır. Analitik çerezler
        yalnızca açık onayınızla etkinleştirilir. Tarayıcı ayarlarınızdan çerezleri istediğiniz zaman
        silebilirsiniz; ancak bu, bazı site işlevlerini etkileyebilir.
      </Para>

      <H2>5. Veri Güvenliği</H2>
      <Para>
        Kişisel verileriniz HTTPS şifrelemesi, erişim kısıtlamaları ve güvenli veri tabanı altyapısı ile
        korunmaktadır. Bir güvenlik ihlali tespit etmeniz halinde lütfen derhal{" "}
        {validMail
          ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
          : "e-posta yoluyla"
        }{" "}adresine bildirin.
      </Para>

      <H2>6. Saklama Süreleri</H2>
      <Para>
        Sipariş kayıtları ve fatura bilgileri Vergi Usul Kanunu gereği 5 yıl; muhasebe kayıtları 10 yıl
        saklanır. İletişim formundan gönderilen mesajlar 2 yıl içinde silinir. Pazarlama onayı geri
        alındığında 30 gün içinde e-posta listemizden çıkarılırsınız.
      </Para>

      <H2>7. Haklarınız</H2>
      <Para>
        6698 sayılı KVKK kapsamında verilerinize erişim, düzeltme, silme, işlemenin kısıtlanması,
        itiraz ve taşınabilirlik haklarına sahipsiniz. Taleplerinizi{" "}
        {validMail
          ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
          : "e-posta yoluyla"
        }{" "}adresine yazılı
        olarak iletebilirsiniz; 30 gün içinde yanıt veririz.
        {" "}Detaylı bilgi için <a href="/kvkk" style={{ color: "#D4A534" }}>KVKK Aydınlatma Metni</a>&apos;ni inceleyin.
      </Para>

      <H2>8. İade Adresi</H2>
      {returnAddr ? (
        <Para>{returnAddr}</Para>
      ) : (
        <Para>
          İade ve fiziksel iletişim adresi için{" "}
          {validMail
            ? <a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
            : "e-posta yoluyla"
          }{" "}adresine
          veya {s.phone || "telefon ile"} başvurun.
        </Para>
      )}

      <H2>9. Değişiklikler</H2>
      <Para>
        Bu politika zaman zaman güncellenebilir. Önemli değişiklikler sitemizde duyurulur. Siteyi
        kullanmaya devam etmeniz güncel politikayı kabul ettiğiniz anlamına gelir.
      </Para>

      <InfoCard>
        <H3>İletişim</H3>
        <Para style={{ marginBottom: 0 }}>
          Gizlilik politikamıza ilişkin sorularınız için:{" "}
          {validMail
            ? <><a href={`mailto:${validMail}`} style={{ color: "#D4A534" }}>{validMail}</a>
                {s.phone ? ` — ${s.phone}` : ""}</>
            : "iletişim sayfamızı ziyaret edin."
          }
        </Para>
      </InfoCard>
    </LegalPageShell>
  )
}
