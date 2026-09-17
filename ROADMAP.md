# Roadmap — PITT Commerce Core

---

## v0.1.0 — Release Candidate (Mevcut)

Admin panel ilk sürümü. Ürün, stok, sipariş, müşteri, ödeme ve sistem ayarları yönetimi.

**Release koşulları:**
- [x] 014 migration (brands.name UNIQUE) uygulandı
- [ ] 013 migration (settings seed) uygulanacak
- [ ] Smoke test geçecek
- [ ] Performance baseline alınacak

---

## v0.2.0 — Ödeme & Entegrasyon (Tahmini: 2026-09)

### P1 — Zorunlu

**iyzico Entegrasyonu**
- Sandbox kurulumu ve test ödemeleri
- `create_payment_attempt` webhook handler
- Başarılı ödeme → `create_order_atomic` tetiklemesi
- 3D Secure flow
- Refund endpoint

**Tech Debt Kapatma**
- `013_settings_seed.sql` zaten uygulanmış olacak
- `inventory_movements.quantity` CHECK constraint (015 migration)
- `getCustomers()` hasOrders `LIMIT 1` fix
- `getStockList()` DB-side sayfalama (status filtresi için partial index)
- `CountUpNumber.tsx`, `MagneticButton.tsx` kaldırma
- `puppeteer` devDependency kaldırma
- `Pagination.tsx` doğru konuma taşıma

### P2 — Yüksek Değer

**E-posta Bildirimleri**
- Sipariş onayı (müşteriye)
- Kargo bildirimi (müşteriye)
- Düşük stok uyarısı (admin)
- SMTP yapılandırması settings'ten

**Public Site → DB Bağlantısı**
- `config/site.ts` kaldırılacak
- Kargo ücreti, serbest kargo limiti `public_settings`'ten okunacak
- Site adı, iletişim bilgileri `company` JSONB grubundan

**Kargo Entegrasyonu**
- Yurtiçi Kargo / MNG / Sürat API (veya ortak portal)
- Tracking kodu sipariş detayına
- Kargo durumu otomatik güncelleme (webhook)

### P3 — Orta Vadeli

**Admin Analytics Dashboard**
- Günlük/haftalık/aylık gelir grafiği
- En çok satan 10 ürün
- Dönüşüm oranı (ziyaretçi → sipariş)
- Stok seviyesi trendi

**Ürün Toplu İşlem**
- Toplu status toggle (checkbox seçimi)
- Toplu kategori/marka atama
- CSV import/export

**Müşteri Segmentasyon**
- Toplam harcama bazlı gruplar
- Son sipariş tarihine göre filtreleme
- KVKK uyumlu notlar

---

## v0.3.0 — Pazarlama & Otomasyon (Tahmini: 2026-11)

### P1
**WhatsApp Entegrasyonu**
- Sipariş durumu bildirim mesajı
- Destek buton otomasyonu (müşteri profil sayfasında)

**Google Ads Entegrasyonu**
- Dönüşüm takibi (ödeme tamamlandı eventi)
- Ürün feed XML export (merchant center)

### P2
**inventory_reservations Cleanup**
- Supabase Edge Function: süresi dolan rezervasyonları serbest bırak
- pg_cron ile zamanlanmış tetikleme (her 5 dakika)
- Tasarım Sprint 1'de tamamlandı

**Gelişmiş SEO**
- Sitemap.xml (ürün, kategori, marka)
- Structured data (Product schema)
- Meta robots per-page kontrolü

### P3
**Data Retention & Arşivleme**
- Legal + mali danışman onayı sonrası
- Eski sipariş/ödeme arşivleme stratejisi
- KVKK veri silme akışı

---

## Açık Sorular

| Konu | Durum |
|------|-------|
| iyzico sandbox test ortamı erişimi | Bekliyor |
| Kargo firması API tercihi | Kararlaştırılmadı |
| KVKK müşteri veri silme politikası | Legal onay bekliyor |
| Google Ads hesap erişimi | Bekliyor |
| WhatsApp Business API erişimi | Bekliyor |
