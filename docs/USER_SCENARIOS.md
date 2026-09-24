# Kullanıcı Senaryoları — v0.1.0

İlgi Kombi admin kullanıcısının gerçek günlük iş akışları.

---

## Aktörler

**Admin (Ali Bey)** — Stok ve sipariş yönetiminden sorumlu, teknik bilgisi orta düzey.

**Müşteri** — E-ticaret sitesinden sipariş veren son kullanıcı (admin paneli kullanmıyor).

---

## Senaryo 1 — Sabah Rutini: Gelen Siparişleri İşleme

**Trigger:** Admin her sabah sisteme giriş yapar.

**Akış:**
1. `/admin` → Dashboard açılır. "Bugünkü Siparişler" metriki gözden geçirilir.
2. `/admin/orders` → Filtre: Durum = `pending_payment`. Bekleyen siparişler listelenir.
3. Her sipariş için detaya gidilir.
4. Ödeme doğrulandıysa (payments sayfasından teyit): Durum `paid` → `preparing` yapılır.
5. Kargoya verilirse: Durum `preparing` → `shipped` yapılır.

**Kritik path:** Sipariş durumu güncelleme, VALID_TRANSITIONS whitelist kontrolü.

**Beklenen süre:** 2–5 dakika/sipariş.

---

## Senaryo 2 — Yeni Ürün Kataloğa Ekleme

**Trigger:** Tedarikçiden yeni parça geldi.

**Akış:**
1. Önce marka kontrolü: `/admin/brands` → Tedarikçi markası var mı?
   - Yoksa: "Yeni Marka" → slug auto-gen, kaydet.
2. Önce kategori kontrolü: `/admin/categories` → Uygun kategori var mı?
   - Yoksa: "Yeni Kategori" → parent seç, slug auto-gen, kaydet.
3. `/admin/products/new` → Ürün formu doldur:
   - SKU: Tedarikçi kodu (ör. `ARÇ-KMB-NTC-001`)
   - Slug: Otomatik önerilir veya manuel
   - Fiyat, marka, kategori seç
   - is_active toggle
4. Kaydet → Listeye redirect.

**Kritik path:** SKU/slug unique guard, marka/kategori varlık kontrolü.

---

## Senaryo 3 — Stok Alma: Yeni Teslimat Sonrası

**Trigger:** Depoya stok geldi.

**Akış:**
1. `/admin/inventory` → Ürün listesi, mevcut stok seviyeleri görünür.
2. Stok gelen ürünü bul (arama veya filtreyle).
3. Satıra tıkla → Stok düzeltme formu: Tip = `in`, Miktar = +50, Not = "Fatura #1234".
4. Kaydet → Hareket kaydı oluştu, stok güncellendi.
5. Hareket geçmişi sekmesi: İşlem doğrulandı.

**Kritik path:** `admin_stock_adjustment` RPC, audit log.

---

## Senaryo 4 — İade İşlemi

**Trigger:** Müşteri ürünü iade etmek istiyor.

**Akış:**
1. `/admin/customers` → Müşteriyi e-posta ile bul.
2. Müşteri detayı → Sipariş geçmişinde ilgili sipariş bulunur.
3. `/admin/orders/{id}` → Durum: `paid` → `refunded` güncellenir.
4. `/admin/inventory/{product_id}` → Stok düzeltme: Tip = `in`, Miktar = +1, Not = "İade sipariş #{order_number}".
5. Ödeme iadesi iyzico panelinden ayrıca yapılır (v0.1.0'da admin panelinde iade butonu yok).

**Kritik path:** Sipariş durum geçişi (`paid` → `refunded` whitelist'te olmalı), stok geri alımı.

**Eksiklik (v0.2.0):** Admin panelinden iyzico refund tetiklemesi yok.

---

## Senaryo 5 — Müşteri Desteği: "Sipariş Nerede?" Sorusu

**Trigger:** Müşteri WhatsApp/telefon ile arar.

**Akış:**
1. `/admin/customers` → Müşteriyi e-posta veya telefon ile bul.
2. Müşteri detayı → Son sipariş görünür: tarih, tutar, durum.
3. `/admin/orders/{id}` → Kargo bilgisi (v0.1.0'da tracking kodu yok, sadece durum).
4. Admin müşteriye sözlü bilgi verir.

**Eksiklik (v0.2.0):** Kargo entegrasyonu, tracking kodu, otomatik bildirim.

---

## Senaryo 6 — Fiyat Güncellemesi: Zamm Dönemi

**Trigger:** Tedarikçi fiyatlarını artırdı.

**Akış:**
1. `/admin/products` → Marka veya kategori filtresiyle ilgili ürünler listelenir.
2. Her ürün için edit sayfası açılır, fiyat güncellenir.
3. (v0.1.0'da toplu fiyat güncelleme yok — ürün başına tek tek gidilmeli)

**Eksiklik (v0.2.0):** Toplu fiyat güncelleme, CSV import.

---

## Senaryo 7 — Sistem Bakımı: Tatil Dönemi

**Trigger:** Bayram tatili, siparişler alınmayacak.

**Akış:**
1. `/admin/settings?tab=security` → Güvenlik sekmesi.
2. "Bakım Modu" toggle aktif edilir → Uyarı banner onaylanır.
3. Kaydet → `maintenance_mode: true` DB'ye yazıldı.
4. Public site maintenance sayfası gösterir (middleware entegrasyonu v0.2.0'da).

**Eksiklik (v0.2.0):** Middleware `maintenance_mode` kontrolü, public maintenance page.

---

## Senaryo 8 — SEO Güncelleme: Yeni Anahtar Kelimeler

**Trigger:** SEO danışmanı yeni kelimeler önerdi.

**Akış:**
1. `/admin/settings?tab=seo` → SEO sekmesi.
2. Keywords textarea: Yeni kelimeler virgül veya satır başı ile girilir.
3. Kaydet → split → trim → dedup → DB'ye string[] olarak yazılır.
4. Site metatag'leri güncel değerleri okur.

---

## Senaryo 9 — Yeni Admin Ekleme

**Trigger:** Yeni çalışan işe başladı.

**Akış (v0.1.0'da admin UI yok):**
1. Supabase Auth paneli → Yeni kullanıcı oluştur.
2. Supabase SQL Editor:
   ```sql
   INSERT INTO admin_profiles (user_id, is_active)
   VALUES ('<new-user-uuid>', true);
   ```
3. Kullanıcı artık `/admin/giris`'ten giriş yapabilir.

**Eksiklik (v0.2.0):** Admin kullanıcı yönetimi UI.

---

## Senaryo 10 — Performans İzleme: Yavaş Sayfa

**Trigger:** Admin bir sayfanın yavaş yüklendiğini fark eder.

**Kontrol edilecekler:**
1. Vercel/hosting panel → Response time metrics.
2. `getCustomers()`: 10k+ sipariş varsa `hasOrders` sorgusu yavaş olabilir (KNOWN_DEBT M4).
3. `getStockList()`: 10k+ ürün varsa bellek baskısı (KNOWN_DEBT M5).
4. Network tab: Hangi istek yavaş?

**Geçici çözüm:** Admin stok listesinde filtre kullanarak sonuç setini küçültür.
