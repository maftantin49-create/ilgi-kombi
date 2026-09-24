# Release Notes — v0.1.0

**PITT Commerce Core — Admin Panel İlk Sürüm**
Tarih: 2026-08-11
Durum: READY FOR RELEASE

---

## Bu Sürümde Ne Var

v0.1.0, İlgi Kombi yedek parça e-ticaret platformunun
ilk production-ready admin panelini içerir.

### Admin Panel — 10 Modül

**Kimlik Doğrulama**
- Supabase SSR JWT tabanlı giriş
- `admin_profiles.is_active` ikinci katman kontrolü
- `requireAdmin()` her layout ve server action'da zorunlu
- Oturum zaman aşımında otomatik `/admin/giris` redirect

**Dashboard**
- Gerçek zamanlı metrikler: toplam ürün, stok uyarısı, son siparişler
- `stock_quantity < 10` ürünler için uyarı kartı

**Ürün Yönetimi**
- Listeleme: arama (SKU/isim), kategori/marka/stok/aktiflik filtresi, sayfalama
- Oluştur / Güncelle: SKU ve slug UNIQUE guard ile çakışma engeli
- is_active toggle (silme v0.2.0 kapsamı)

**Marka & Kategori Yönetimi**
- Marka CRUD: slug otomatik oluşturma, `brands.name UNIQUE` constraint
- Kategori CRUD: parent/child ağaç yapısı
- Her ikisi için ürün sayısı delete guard

**Stok Yönetimi**
- Atomic stok düzeltme: `admin_stock_adjustment()` RPC
- Audit log: tüm stok hareketleri (tip, miktar, önceki/sonraki, not)
- Stok altına indirecek azaltma engeli

**Sipariş Yönetimi**
- Sipariş listesi: durum, ödeme durumu, arama, sayfalama
- Durum güncellemesi: `VALID_TRANSITIONS` whitelist (geçersiz geçiş reddedilir)
- Her geçiş audit log'a kaydedilir

**Müşteri CRM (Read-only)**
- Aggregate metrikler: toplam harcama, sipariş sayısı, son sipariş tarihi
- Adres geçmişi, sipariş özeti

**Ödeme Yönetimi (Read-only)**
- Deneme geçmişi, iyzico response JSON
- `redactSensitive()`: 20+ anahtar otomatik redaction (server-only)
- `token` alanı select listesinden tamamen dışlandı

**Sistem Ayarları**
- 9 sekme: Genel, Firma, SEO, Sosyal, E-posta, Stok, Sipariş, Güvenlik, Entegrasyonlar
- Hibrit mimari: 5 kritik flat key + 9 JSONB grup
- Entegrasyonlar sekmesi: secret değer yok, yalnızca boolean flag

**Altyapı**
- `error.tsx` / `loading.tsx`: admin + public route grupları
- `global-error.tsx`: kök layout hataları için kendi html/body render
- `m<T>()`, `format.ts`, `StatusBadge.tsx` — merkezileştirilmiş yardımcılar
- `proxy.ts` (Next.js 16 middleware): optimistik session redirect

---

## Güvenlik

- `SUPABASE_SERVICE_ROLE_KEY` NEXT_PUBLIC_ değişkeninde yok — doğrulandı
- İyzico secret'ları code tarafından tüketilmiyor, bundle'a girmiyor
- Admin mutation'ları server-side, client değerlere güvenilmiyor
- Audit log değerleri değil, yalnızca alan adları kaydediliyor

---

## Veritabanı

14 migration dosyası (001–014). Tümü production'da uygulandı.

| Migration | İçerik |
|-----------|--------|
| 001 | Extensions, enum'lar |
| 002–007 | Core tablolar (brands → system_settings) |
| 008 | Functions: `create_order_atomic()`, `set_updated_at()` |
| 009 | RLS policies (14 tablo) |
| 010 | Performans indexleri |
| 011 | Seed: static veriler |
| 012 | `admin_stock_adjustment()` RPC |
| 013 | Settings JSONB grup seed ✅ |
| 014 | `brands.name UNIQUE` constraint ✅ |

---

## Bilinen Sınırlamalar

| # | Sınır | Plan |
|---|-------|------|
| KI-1 | Ürün silme yok, yalnızca is_active toggle | v0.2.0 |
| KI-2 | iyzico entegrasyonu yok, canlı ödeme alınamıyor | v0.2.0 |
| KI-3 | `getCustomers()` LIMIT yok (>10k sipariş riski) | v0.2.0 |
| KI-4 | `inventory_movements.quantity` DB CHECK yok | v0.2.0 |
| KI-5 | `config/site.ts` ↔ `public_settings` double source | v0.2.0 |

---

## Test

- Smoke Test: 55/55 PASS, 2 N/A (P8/P9 — ürün silme kapsam dışı)
- `tsc --noEmit`: 0 hata
- `npm run lint`: 0 uyarı
- `npm run build`: clean (2.6s, 35 route)

---

## Sonraki Sürüm

v0.2.0 kapsamı için `ROADMAP.md` dosyasına bakın.
