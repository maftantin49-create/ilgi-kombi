import type { Metadata } from "next"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { getStoreSettings, validEmail, validWhatsApp } from "@/lib/storefront/settings"
import { buildWa } from "@/lib/whatsapp"
import { legal } from "@/config/legal"
import { siteConfig } from "@/config/site"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    title: `Sıkça Sorulan Sorular | ${s.siteName}`,
    description: "Sipariş, ürün uyumluluğu, kargo, iade ve ödeme konularında sık sorulan sorulara yanıtlar.",
    robots: "index, follow",
    alternates: { canonical: `${siteConfig.url}/sss` },
  }
}

interface QA { q: string; a: string }
interface Group { title: string; items: QA[] }

export default async function SSSPage() {
  const s = await getStoreSettings()
  const validMail = validEmail(s.email)
  const waContact = buildWa(validWhatsApp(s.whatsapp)).contact

  const mailStr = validMail ?? "e-posta adresimize"
  const hours = s.workingHours.weekdays

  const groups: Group[] = [
    {
      title: "Sipariş",
      items: [
        {
          q: "Sipariş vermek için üyelik gerekli mi?",
          a: "Hayır. Misafir olarak üyelik açmadan ödeme yapabilir ve sipariş verebilirsiniz. Üyelik oluşturursanız geçmiş siparişlerinizi görüntüleyebilirsiniz.",
        },
        {
          q: "Sipariş nasıl verilir?",
          a: "Aradığınız ürünü ürünler sayfasından veya Parça Bul aracımızla bulun, sepete ekleyin ve ödeme adımlarını tamamlayın. Parça kodunu bilmiyorsanız WhatsApp üzerinden de sipariş verebilirsiniz.",
        },
        {
          q: "Siparişimi nasıl takip ederim?",
          a: "Siparişiniz kargoya verildiğinde kayıtlı e-posta ve telefon numaranıza takip numarası gönderilir. Bu numara ile kargo firmasının web sitesinden anlık takip yapabilirsiniz.",
        },
        {
          q: "Sipariş sonrası nasıl bilgi alırım?",
          a: "Sipariş onayı ve kargoya veriliş bildirimi otomatik olarak e-posta ve SMS ile iletilir. Ayrıca WhatsApp veya telefon ile sipariş durumunu öğrenebilirsiniz.",
        },
        {
          q: "Kargoya verilmeden önce sipariş iptali nasıl yapılır?",
          a: `Siparişiniz henüz kargoya verilmemişse ${mailStr} sipariş numaranızı belirterek iptal talebinizi iletin.${hours ? ` Hafta içi ${hours} saatleri arasında talep alındığında aynı gün işleme alınır.` : ""} Ödemeniz 5-7 iş günü içinde iade edilir.`,
        },
        {
          q: "Sipariş sonrası değişiklik yapabilir miyim?",
          a: "Kargoya verilmeden önce adres değişikliği veya ürün değişikliği talebinizi iletişim kanallarımızdan yapabilirsiniz. Kargoya verildikten sonra değişiklik mümkün olmayabilir.",
        },
      ],
    },
    {
      title: "Ürün Seçimi",
      items: [
        {
          q: "Doğru kombi yedek parçasını nasıl seçerim?",
          a: "Kombi markanızı, modelinizi ve üretim yılını belirleyin. Cihazın iç kapağında veya teknik plakasında model kodu yazar. Bu bilgiyle Parça Bul aracımızı kullanabilir veya WhatsApp üzerinden fotoğraf göndererek yönlendirme isteyebilirsiniz.",
        },
        {
          q: "OEM / ürün kodu nedir, nerede bulunur?",
          a: "OEM kodu, ürünün üretici tarafından atanmış orijinal parça numarasıdır. Parçanın üzerindeki etiket, kombinizin servis kartı veya kullanma kılavuzunda bulunabilir. Parça kodunu biliyorsanız arama kutusuna direkt girebilirsiniz.",
        },
        {
          q: "Cihazımla uyumluluğu nasıl kontrol ederim?",
          a: "Her ürün sayfasında uyumlu cihaz listesi belirtilir. Cihazınız listede yoksa WhatsApp üzerinden marka, model ve arıza bilgisini paylaşın; teknik ekibimiz uyumluluğu teyit eder.",
        },
        {
          q: "Ürünler orijinal mi?",
          a: "Mağazamızda orijinal, OEM (özgün ekipman üreticisi) ve muadil kategorilerinde ürün bulunmaktadır. Her ürünün kategorisi ürün sayfasında belirtilir. Belirli bir ürünün kategorisi hakkında WhatsApp üzerinden bilgi alabilirsiniz.",
        },
        {
          q: "Muadil / uyumlu ürünler nasıl belirtilir?",
          a: "Orijinal üretici yerine başka bir firma tarafından üretilen uyumlu parçalar, ürün sayfasında \"muadil\" veya \"uyumlu\" olarak belirtilir. Muadil ürün orijinal olarak gösterilmez.",
        },
        {
          q: "Stokta olmayan ürün için ne yapabilirim?",
          a: "Ürün sayfasındaki veya WhatsApp üzerindeki destek hattımıza ulaşın. Temin süresi ve alternatif seçenekleri sizi bilgilendiririz. Bazı ürünler için özel sipariş alınabilmektedir.",
        },
        {
          q: "Fiyatı görünmeyen ürün için nasıl bilgi alabilirim?",
          a: "Fiyat belirtilmemiş ürünler için WhatsApp hattımızdan veya iletişim formundan teklif talep edebilirsiniz. Stok durumu ve fiyatı en kısa sürede bildiririz.",
        },
        {
          q: "WhatsApp üzerinden parça teyidi yapılabilir mi?",
          a: "Evet. Cihazınızın fotoğrafını, model etiketini veya mevcut parçanın fotoğrafını WhatsApp üzerinden gönderin. Teknik ekibimiz hangi parçanın uygun olduğunu belirtir.",
        },
      ],
    },
    {
      title: "Kargo ve Teslimat",
      items: [
        {
          q: "Aynı gün kargo şartları nelerdir?",
          a: `Stokta bulunan ürünlerde hafta içi iş günleri${s.shippingCutoff ? ` saat ${s.shippingCutoff}'e` : ""} kadar ödeme onaylanan siparişler aynı gün${legal.shippingCompany ? ` ${legal.shippingCompany} aracılığıyla` : ""} kargoya teslim edilir. Hafta sonu ve resmi tatil günlerinde sipariş alınmakla birlikte kargo işlemi bir sonraki iş günü yapılır.`,
        },
        {
          q: s.shippingCutoff ? `${s.shippingCutoff}'dan önce sipariş verirsem kargom aynı gün gider mi?` : "Aynı gün kargo için ne zaman sipariş vermeliyim?",
          a: `Hafta içi iş günleri${s.shippingCutoff ? ` ${s.shippingCutoff}'e` : ""} kadar ödeme onayı alınan, stokta bulunan siparişler aynı iş günü kargoya verilir. Ödeme gecikmesi veya stok kontrolü gerektiren durumlarda süre uzayabilir.`,
        },
        {
          q: "Kargo takibimi nasıl yaparım?",
          a: `Siparişiniz${legal.shippingCompany ? ` ${legal.shippingCompany}'e` : ""} teslim edildiğinde e-posta ve SMS ile takip numarası iletilir.${legal.shippingCompany ? ` ${legal.shippingCompany}'in web sitesi veya mobil uygulaması` : " Kargo firmasının web sitesi"} üzerinden anlık takip yapabilirsiniz. Bildirim gelmemişse sipariş numaranızla bizimle iletişime geçin.`,
        },
        {
          q: "Teslimat süresi ne kadar?",
          a: `Kargoya verildikten sonra${legal.shippingCompany ? ` ${legal.shippingCompany} aracılığıyla` : ""} normal şartlarda yaklaşık 2 iş günü içinde teslim edilir. Uzak bölgeler, resmi tatiller ve adres koşullarına bağlı olarak süre değişebilir.`,
        },
        {
          q: "Kargo ücreti nasıl belirlenir?",
          a: `${s.shippingCost > 0 ? `Kargo ücreti ${s.shippingCost} TL'dir. ` : ""}${s.freeShippingThreshold > 0 ? `${s.freeShippingThreshold} TL ve üzeri siparişlerde kargo ücretsizdir.` : ""}${legal.shippingCompany ? ` ${legal.shippingCompany} aracılığıyla gönderim yapılmaktadır.` : ""}`.trim() || "Kargo ücreti sipariş tutarına ve ürün boyutuna göre belirlenir.",
        },
        {
          q: "Ücretsiz kargo limiti nedir?",
          a: s.freeShippingThreshold > 0
            ? `${s.freeShippingThreshold} TL ve üzeri siparişlerde kargo ücreti alınmaz.`
            : "Güncel ücretsiz kargo limiti için iletişime geçin.",
        },
        {
          q: "Hasarlı paket gelirse ne yapmalıyım?",
          a: "Teslimatta pakette ezilme, ıslanma veya açılma varsa önce kargo görevlisiyle hasar tutanağı tutturun. Tutanak olmadan hasar talebi işleme alınamaz. Sonrasında fotoğraflı bildirimle bize ulaşın.",
        },
        {
          q: "Teslimatta paket kontrolü gerekli mi?",
          a: "Evet. Teslim alırken dış ambalajı kontrol edin. Herhangi bir hasar görürseniz kargo görevlisiyle tutanak düzenleyin; imza atmadan önce içini kontrol etme hakkınız bulunmaktadır.",
        },
        {
          q: "Teslim alamazsam ne olur?",
          a: `Adresinizde teslim alıcı bulunamadığında${legal.shippingCompany ? ` ${legal.shippingCompany}` : " kargo firması"} ihbar bırakır. Belirtilen süre içinde şubeye gidebilir veya yeni teslimat randevusu alabilirsiniz. İade olması durumunda yeniden kargo ücreti uygulanabilir.`,
        },
        {
          q: "Elden teslim var mı?",
          a: `Evet. Uygun koşullarda işyerimizden elden teslim alabilirsiniz.${legal.fullAddress ? ` Adresimiz: ${legal.fullAddress}.` : ""} Elden teslim için sipariş öncesinde WhatsApp veya telefon ile iletişime geçin; hazırlık onayından sonra teslim alınabilir.`,
        },
      ],
    },
    {
      title: "İade ve Garanti",
      items: [
        {
          q: "İade nasıl başlatılır?",
          a: `Teslim tarihinden itibaren 14 gün içinde ${mailStr}${validMail ? " adresine" : ""} "İade Talebi — Sipariş No:" konusuyla ulaşın. Ad soyad, sipariş numarası ve iade nedeninizi belirtin; 1 iş günü içinde onay ve talimat gönderilir.`,
        },
        {
          q: "İade koşulları nelerdir?",
          a: "Cayma hakkı kapsamında iade için ürün kullanılmamış, ambalajı açılmamış ve eksiksiz olmalıdır. 14 günlük cayma süresi geçmemiş olmalıdır. Ayıplı veya yanlış ürün geldiğinde farklı süreç işletilir — bu durumda bizimle iletişime geçin.",
        },
        {
          q: "Yanlış ürün geldiyse ne yapmalıyım?",
          a: "Ürünü kullanmadan orijinal ambalajında tutun. WhatsApp veya e-posta ile durumu bildirin; doğru ürünü en kısa sürede gönderir, yanlış ürünü ücretsiz geri alırız.",
        },
        {
          q: "Arızalı / hasarlı ürün geldiyse ne yapmalıyım?",
          a: "Önce ürünün fotoğrafını çekin. Teslimatta fark ettiyseniz tutanak tutturun. Fotoğraflı bildirim ve sipariş numarasıyla e-posta veya WhatsApp üzerinden bize ulaşın; teknik inceleme sonrası çözüm üretiriz.",
        },
        {
          q: "Montaj yapılmış ürünü iade edebilir miyim?",
          a: "Montaj öncesi ürünün uyumluluğunu kontrol etmenizi öneririz. Montaj sonrasında sorun yaşıyorsanız durumu fotoğraflı olarak belgeleyip bizimle iletişime geçin. Üretim kaynaklı kusur tespiti durumunda çözüm üretiriz. Cayma hakkı değerlendirmesi ürüne ve koşullara göre yapılır.",
        },
        {
          q: "Kullanılmış ürünü iade edebilir miyim?",
          a: "Kullanılmış ürünlerde cayma hakkı kapsamında iade normalde değerlendirilemez. Ancak üretim kaynaklı bir kusur söz konusuysa bizimle iletişime geçin; durumu değerlendiririz.",
        },
        {
          q: "Cayma hakkı kaç gündür?",
          a: "Teslim tarihinden itibaren 14 takvim günü içinde gerekçe göstermeksizin cayma hakkınız bulunmaktadır. Bu hak 6502 sayılı Tüketici Kanunu güvencesindedir.",
        },
        {
          q: "İade kargo ücreti kime ait?",
          a: "Ürün ayıplı (hatalı teslim veya hasarlı teslim) değilse cayma hakkı kapsamındaki iadelerde kargo ücreti alıcıya aittir. Ürün ayıplıysa iade kargo bedeli tarafımızca karşılanır.",
        },
        {
          q: "Para iadesi ne zaman yapılır?",
          a: "İade ürün tarafımıza ulaştıktan ve incelendikten sonra 14 gün içinde aynı ödeme yöntemiyle iade yapılır. Kredi kartı iadeleri bankanıza bağlı olarak 1–3 iş günü içinde ekstrenize yansıyabilir.",
        },
        {
          q: "Garanti süresi kaç ay?",
          a: "Ürünlerimiz 12 ay garanti kapsamındadır. Üreticinin sunduğu garanti süresi veya yasal zorunlu garanti daha uzun ise bu hak saklıdır. Ürüne göre garanti koşulları farklılık gösterebilir.",
        },
        {
          q: "Garanti hangi durumları kapsar?",
          a: "Üretim kaynaklı kusurlar garanti kapsamında değerlendirilir. Teknik incelemede yanlış montaj, yanlış bağlantı, dış darbe, sıvı teması, oksitlenme veya uygunsuz kullanım gibi faktörler dikkate alınır; ancak otomatik sonuç çıkarılmaz, teknik değerlendirme sonucuna göre işlem yapılır.",
        },
      ],
    },
    {
      title: "Ödeme",
      items: [
        {
          q: "Hangi ödeme yöntemleri kabul ediliyor?",
          a: "Havale/EFT ve WhatsApp üzerinden ödeme yapılabilir. Sipariş tamamlandıktan sonra ödeme bilgileri iletilir.",
        },
        {
          q: "Havale/EFT ile ödeme yapabilir miyim?",
          a: "Evet. Havale/EFT ile ödeme seçeneği mevcuttur. Ödeme bilgileri sipariş sürecinde iletilir.",
        },
        {
          q: "Kapıda ödeme var mı?",
          a: "Hayır. Kapıda ödeme seçeneği sunulmamaktadır.",
        },
        {
          q: "Kredi kartı bilgilerim saklanıyor mu?",
          a: "Ödeme işlemleri yalnızca havale/EFT yöntemiyle gerçekleştirilir. Kart bilgisi alınmamaktadır.",
        },
        {
          q: "3D Secure nedir?",
          a: "3D Secure, bankanızın kartı sahibinin onayını doğrulamak için kullandığı ek güvenlik adımıdır. Ödeme sırasında telefonunuza SMS veya mobil bankacılık uygulamanıza bildirim gelerek onay istenir.",
        },
        {
          q: "Ödeme başarısız olursa ne yapmalıyım?",
          a: "Farklı bir kart veya banka deneyebilirsiniz. Sorun devam ederse bankanızın müşteri hizmetleriyle iletişime geçin ya da WhatsApp üzerinden bizimle destek alın.",
        },
        {
          q: "Fatura kesiliyor mu?",
          a: "Evet. Siparişinize ait fatura e-posta adresinize iletilir.",
        },
      ],
    },
    {
      title: "Teknik Destek",
      items: [
        {
          q: "Teknik destek nasıl alırım?",
          a: `WhatsApp, telefon veya e-posta üzerinden teknik ekibimize ulaşabilirsiniz.${hours ? ` Her gün ${hours} saatleri arasında destek sağlıyoruz.` : ""}`,
        },
        {
          q: "Ürün fotoğrafı göndererek yardım alabilir miyim?",
          a: "Evet. Mevcut parçanın fotoğrafını, model etiketini veya kombinizin iç kapağındaki teknik plakayı WhatsApp üzerinden gönderin. Ekibimiz doğru parçayı tespit etmenize yardımcı olur.",
        },
        {
          q: "Montaj için yönlendirme yapılıyor mu?",
          a: "Teknik parçaların montajı konusunda genel bilgi paylaşabiliriz; ancak montaj işleminin yetkili teknik servis tarafından yapılmasını öneririz. Kombinin montaj aşamasında hatalı müdahale cihaza zarar verebilir.",
        },
      ],
    },
  ]

  const totalQuestions = groups.reduce((acc, g) => acc + g.items.length, 0)

  return (
    <div style={{ background: "#090A0C", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-[820px] mx-auto px-6 py-12">
          <p style={{ color: "#D4A017", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
            Yardım Merkezi
          </p>
          <h1 style={{ color: "#F4F4F2", fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
            Sıkça Sorulan Sorular
          </h1>
          <p style={{ color: "#A0A0A0", fontSize: 15, lineHeight: 1.75, maxWidth: 520 }}>
            {totalQuestions} soruya yanıt bulacağınız yardım merkezimiz. Aradığınızı bulamadıysanız
            WhatsApp üzerinden doğrudan sorabilirsiniz.
          </p>
        </div>
      </div>

      {/* SSS Accordion */}
      <div className="max-w-[820px] mx-auto px-6 py-10 space-y-10">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 style={{
              color: "#D4A017", fontSize: 11, fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 12,
            }}>
              {group.title}
            </h2>

            <div className="space-y-2">
              {group.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl overflow-hidden"
                  style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <summary
                    className="flex items-center justify-between gap-3 cursor-pointer select-none list-none px-5 py-4"
                    style={{ color: "#C0C0BA" }}
                  >
                    <span className="font-semibold text-sm leading-snug pr-2">{item.q}</span>
                    <ChevronDown
                      size={16}
                      className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                      style={{ color: "#D4A017" }}
                      aria-hidden="true"
                    />
                  </summary>
                  <div
                    className="px-5 pb-5 pt-2 text-sm leading-relaxed"
                    style={{ color: "#888882", borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <div
          className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
          style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.18)" }}
        >
          <div>
            <p className="font-bold mb-1" style={{ color: "#4ade80" }}>Sorunuzu bulamadınız mı?</p>
            {hours && (
              <p className="text-sm" style={{ color: "#555550" }}>
                Teknik ekibimiz her gün {hours} hizmetinizdedir.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {waContact ? (
              <a
                href={waContact}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold"
                style={{ background: "#22c55e", color: "#fff" }}
              >
                WhatsApp ile Sor
              </a>
            ) : (
              <Link
                href="/iletisim"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold"
                style={{ background: "#22c55e", color: "#fff" }}
              >
                Bize Ulaşın
              </Link>
            )}
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,196,0,0.35)] transition-colors"
              style={{ color: "#C0C0BA" }}
            >
              İletişim Formu
            </Link>
          </div>
        </div>

        {/* İlgili sayfalar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24 }}>
          <p style={{ color: "#555550", fontSize: 13, marginBottom: 12 }}>İlgili sayfalar</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Garanti ve İade",     href: "/garanti-ve-iade" },
              { label: "Teslimat Bilgileri",  href: "/teslimat-bilgileri" },
              { label: "Kargo ve Taşıma",     href: "/kargo-ve-tasima" },
              { label: "İptal ve İade",       href: "/iptal-iade" },
              { label: "Müşteri Hizmetleri", href: "/musteri-hizmetleri" },
              { label: "Parça Bul",            href: "/parca-bul" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:text-[#D4A017] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(255,196,0,0.30)]"
                style={{ background: "#151618", color: "#888882" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
