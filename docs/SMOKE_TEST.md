# Smoke Test Planı — v0.1.0

Bu plan, her deployment öncesinde elle çalıştırılır.
Tahmini süre: 45–60 dakika.

Ortam: Production (veya production-mirror staging).

---

## Ön Koşullar

- [ ] `.env.production` değişkenleri doğru tanımlı
- [ ] `013_settings_seed.sql` uygulanmış (settings UI test için)
- [ ] `014_brands_name_unique.sql` uygulanmış (zaten uygulandı)
- [ ] Test admin hesabı hazır (`admin_profiles.is_active = true`)
- [ ] Test müşteri hesabı hazır (orders tablosunda en az 1 sipariş)

---

## 1. Authentication

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| A1 | `/admin` adresine git (login değil) | `/admin/giris`'e redirect | ⬜ |
| A2 | Geçersiz e-posta ile giriş yap | Hata mesajı, sayfa kırılmaz | ⬜ |
| A3 | Geçerli admin ile giriş yap | `/admin` dashboard'a yönlendirildi | ⬜ |
| A4 | Sidebar'da "Çıkış" yap | `/admin/giris`'e redirect, session temizlendi | ⬜ |
| A5 | Login olmadan `/admin/products` URL'sine git | `/admin/giris`'e redirect | ⬜ |

---

## 2. Dashboard

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| D1 | Dashboard'u aç | 4 metrik kart görünür, rakamlar DB'den geliyor | ⬜ |
| D2 | Stok uyarı kartı | `stock_quantity < 10` ürün sayısı doğru | ⬜ |
| D3 | Sayfa 3 saniye içinde yüklendi | Loading skeleton geçici görünür, sonra içerik | ⬜ |

---

## 3. Ürün Yönetimi

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| P1 | Ürün listesini aç | Tüm ürünler, sayfalama çalışıyor | ⬜ |
| P2 | Arama: var olan SKU | Sadece o ürün listelenir | ⬜ |
| P3 | Filtre: Stok Yok | Yalnızca stock_quantity = 0 ürünler | ⬜ |
| P4 | Yeni ürün oluştur (zorunlu alanlar dolu) | Başarı, listeye redirect | ⬜ |
| P5 | Aynı SKU ile ikinci ürün oluştur | "Bu SKU zaten kullanılıyor" field hatası | ⬜ |
| P6 | Aynı slug ile ikinci ürün oluştur | "Bu slug zaten kullanılıyor" field hatası | ⬜ |
| P7 | Ürün düzenle (isim değiştir) | Başarı, değişiklik yansıdı | ⬜ |
| P8 | ~~Stoklu ürünü silmeye çalış~~ | ~~Engelleme sayfası veya redirect~~ | **N/A** — Ürün silme v0.1.0 kapsamı dışı; yalnızca is_active toggle var |
| P9 | ~~Stoksuz ürünü sil~~ | ~~Başarı, listeden kalktı~~ | **N/A** — Aynı sebep |

---

## 4. Marka Yönetimi

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| BR1 | Yeni marka oluştur | Başarı | ⬜ |
| BR2 | Aynı isimle marka oluştur | "Bu marka adı zaten kullanılıyor" field hatası | ⬜ |
| BR3 | Aynı slug ile marka oluştur | "Bu slug zaten kullanılıyor" field hatası | ⬜ |
| BR4 | Ürünü olan markayı silmeye çalış | Engelleme, ürün sayısı gösterilir | ⬜ |
| BR5 | Ürünsüz markayı sil | Başarı | ⬜ |

---

## 5. Kategori Yönetimi

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| C1 | Parent kategori oluştur | Başarı | ⬜ |
| C2 | Child kategori oluştur | Parent listesinde görünür | ⬜ |
| C3 | Ürünlü kategoriyi silmeye çalış | Engelleme | ⬜ |
| C4 | Child'lı kategoriyi silmeye çalış | Engelleme | ⬜ |

---

## 6. Stok Yönetimi

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| ST1 | Stok listesi aç | Ürünler, stok renk bandı doğru | ⬜ |
| ST2 | Stok artır (+5) | Başarı, hareket kaydı oluştu | ⬜ |
| ST3 | Stok azalt (-3) | Başarı, hareket kaydı oluştu | ⬜ |
| ST4 | Stok altına indirecek azaltma (stok=2, -5 gir) | Hata: yetersiz stok | ⬜ |
| ST5 | Hareket geçmişini aç | Önceki/sonraki stok, not görünür | ⬜ |

---

## 7. Sipariş Yönetimi

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| O1 | Sipariş listesini aç | Tüm siparişler, durum badge'leri | ⬜ |
| O2 | Sipariş numarasıyla ara | İlgili sipariş bulunur | ⬜ |
| O3 | Sipariş detayını aç | Kalemler, adres, tutarlar görünür | ⬜ |
| O4 | Geçerli durum geçişi yap (pending_payment → paid) | Başarı, badge güncellendi | ⬜ |
| O5 | Geçersiz durum geçişi (delivered → draft) | Hata mesajı, geçiş reddedildi | ⬜ |
| O6 | Var olmayan sipariş ID'sine git | 404 sayfası | ⬜ |

---

## 8. Müşteri CRM

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| CU1 | Müşteri listesini aç | Müşteriler, aggregate metrikler | ⬜ |
| CU2 | E-posta ile ara | Sonuçlar doğru filtrelenir | ⬜ |
| CU3 | Müşteri detayını aç | Adresler, sipariş geçmişi görünür | ⬜ |
| CU4 | Var olmayan müşteri ID'sine git | 404 sayfası | ⬜ |

---

## 9. Ödeme Yönetimi

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| PY1 | Ödeme listesini aç | Ödemeler, durum, tutarlar | ⬜ |
| PY2 | Ödeme detayını aç | Deneme geçmişi, redacted JSON | ⬜ |
| PY3 | JSON viewer'da `token` veya `apiKey` alanı görünüyor mu | Görünmemeli (redacted) | ⬜ |

---

## 10. Sistem Ayarları

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| S1 | Ayarlar sayfasını aç (Genel sekmesi) | Form değerleri DB'den yüklendi | ⬜ |
| S2 | SEO sekmesi → keywords textarea | Virgülle ayrılmış değerler satır satır gösterilir | ⬜ |
| S3 | Genel sekmede bir değer değiştir → Kaydet | Başarı mesajı, sayfa yenilendi | ⬜ |
| S4 | Güvenlik sekmesi → maintenance_mode toggle | Uyarı banner görünür | ⬜ |
| S5 | Entegrasyonlar sekmesi | Secret değer yok, sadece boolean flag ve env hint | ⬜ |
| S6 | Geçersiz sekme query param (`?tab=xyz`) | Genel sekmesine fall back | ⬜ |

---

## 11. Error Boundaries & Loading

| # | Test | Beklenen | Sonuç |
|---|------|----------|-------|
| E1 | Network yavaşken admin sayfası aç | Loading skeleton görünür | ⬜ |
| E2 | `loading.tsx` animasyon çalışıyor mu | Pulse animasyon görünür | ⬜ |
| E3 | `/admin/products/invalid-uuid-xyz` | 404 sayfası (notFound) | ⬜ |
| E4 | `global-error.tsx` kendi html/body render ediyor | (gerekli durum yaratılamıyorsa atla) | ⬜ |

---

## 12. Build & Tip Kontrolü

```bash
npx tsc --noEmit    # → 0 hata
npm run lint        # → 0 uyarı
npm run build       # → clean build
```

| # | Kontrol | Sonuç |
|---|---------|-------|
| B1 | `tsc --noEmit` | ⬜ |
| B2 | `npm run lint` | ⬜ |
| B3 | `npm run build` | ⬜ |

---

## Sonuç

| Kategori | PASS | N/A | Toplam |
|----------|------|-----|--------|
| Authentication | — | 0 | 5 |
| Dashboard | — | 0 | 3 |
| Ürün | — | 2 | 9 |
| Marka | — | 0 | 5 |
| Kategori | — | 0 | 4 |
| Stok | — | 0 | 5 |
| Sipariş | — | 0 | 6 |
| Müşteri | — | 0 | 4 |
| Ödeme | — | 0 | 3 |
| Ayarlar | — | 0 | 6 |
| Error/Loading | — | 0 | 4 |
| Build | — | 0 | 3 |
| **Toplam** | — | **2** | **57** |

**Geçme kriteri:** 55/55 çalışan test PASS, 2 N/A (P8/P9 — ürün silme v0.1.0 kapsamı dışı)
Kritik yol — A1-A5, P4-P6, O4-O5, ST3-ST4, PY3 — sıfır başarısızlık
