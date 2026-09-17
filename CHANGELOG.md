# Changelog

All notable changes to this project will be documented in this file.

---

## [0.1.0] — 2026-08-11

### Admin Panel — İlk Sürüm

#### Wave 1 — Foundation
- Admin kimlik doğrulama: Supabase SSR JWT + `admin_profiles.is_active` çift katman
- `requireAdmin()` ile `React.cache()` deduplication
- Admin layout: `AdminSidebar` + `AdminTopbar`
- Dashboard: toplam ürün, stok uyarısı, son hareketler (gerçek Supabase sorguları)

#### Wave 2 — Ürün Yönetimi
- Ürün listesi: arama, kategori/marka/stok/aktiflik filtresi, sayfalama
- Ürün oluşturma / güncelleme: SKU ve slug UNIQUE guard
- Ürün silme: stok > 0 ise redirect ile engelleme
- Stok durumu renk bandı (4 seviye)

#### Wave 3 — Marka & Kategori Yönetimi
- Marka CRUD: slug auto-generation, ürün sayısı delete guard
- Kategori CRUD: ağaç yapısı (parent/child), ürün sayısı delete guard
- Toplu is_active toggle (form action)

#### Wave 4 — Stok Yönetimi
- Stok düzeltme: `admin_stock_adjustment` RPC (atomic, audit log)
- Hareket geçmişi: tip, miktar, önceki/sonraki stok, not
- `012_admin_stock_adjustment_rpc.sql` migration

#### Wave 5 — Sipariş Yönetimi
- Sipariş listesi: durum, ödeme, arama, sayfalama
- Sipariş detayı: satır kalemleri, adres, tutar özeti
- Durum güncellemesi: whitelist transition (`VALID_TRANSITIONS`), audit log

#### Wave 6 — Müşteri CRM (v1)
- Müşteri listesi: son sipariş tarihi, toplam harcama, sipariş sayısı
- Müşteri detayı: metrikler, adres geçmişi, sipariş özeti
- Read-only görünüm (bu sürümde düzenleme yok)

#### Wave 7 — Ödeme Yönetimi
- Ödeme listesi: tutar, durum, sipariş numarası
- Ödeme detayı: deneme geçmişi, iyzico JSON (redacted)
- `redactSensitive()`: 20+ anahtar, recursive, server-only
- Read-only görünüm

#### Wave 8 — Sistem Ayarları
- 9 sekme: Genel, Firma, SEO, Sosyal Medya, E-posta, Stok, Sipariş, Güvenlik, Entegrasyonlar
- Hibrit mimari: 5 kritik flat key korundu, 9 yeni JSONB grup
- Her sekme için ayrı Zod şema doğrulaması
- Audit log: `{ tab, fields_changed }` (değerler loglanmaz)

#### Sprint 1 — Stabilizasyon
- `error.tsx` ve `loading.tsx`: admin + public route grupları
- `global-error.tsx`: kök layout hataları
- `014_brands_name_unique.sql`: `brands.name UNIQUE` constraint (production'da uygulandı)
- `_utils.ts`: `m<T>()` helper merkezileştirildi (6 dosyadan)
- `format.ts`: `formatDate / formatDateTime / formatDateTimeFull / formatPrice` merkezileştirildi
- `StatusBadge.tsx`: 5 inline implementasyon tek component'e taşındı
- Audit log catch bloğu: sessiz kayıp → `console.error("[AuditLog]", err)`

#### Sprint 2 — RC1 Final Fix Pass
- `requireAdmin.ts`: `?hata=yetkisiz` → `?error=yetkisiz` (login hata mesajı düzeltmesi)
- `ARCHITECTURE.md`: `proxy.ts` middleware decision note eklendi
- `SMOKE_TEST.md`: RC1 sonuçları güncellendi (55/55 PASS, 2 N/A)
- `RELEASE_CHECKLIST.md`: Smoke test maddeleri tamamlandı

### Altyapı

- Next.js 16.2.11, App Router, Turbopack
- Supabase JS 2.112.2 + TypeScript 5.9.3
- İki Supabase client: publishable (cookie-aware) + service_role (server-only)
- Zod v4.4.3 — tüm server action formları
- React 19 `useActionState` + `bind()` pattern
- 14 migration (001–014), RLS 14 tablo

### Known Issues

| # | Sorun | Etki |
|---|-------|------|
| KI-1 | `013_settings_seed.sql` uygulanmadı | Settings başlangıç değerleri default'lardan geliyor |
| KI-2 | `config/site.ts` ↔ `public_settings` double source | Kargo ücreti iki yerden yönetiliyor |
| KI-3 | iyzico entegrasyonu yok | Canlı ödeme alınamıyor — v0.2.0 kapsamı |
| KI-4 | `inventory_movements.quantity` DB CHECK yok | Doğrudan INSERT korumasız (RPC korumalı) |
| KI-5 | `getCustomers()` hasOrders LIMIT yok | 10k+ sipariş → bellek baskısı riski |

---

## [Unreleased] — Wave 6 Bulk Operations

### Wave 6 — Excel Toplu Ürün Güncelleme

#### Wave 6A — Altyapı + UI
- `BulkUpdateUploader.tsx`: drag-drop yükleme, şablon indir (2-sheet xlsx, Veri + Kurallar)
- `BulkUpdatePreview.tsx`: stats bar, diff tablosu (200-satır önizleme)
- `AdminSidebar.tsx`: "Toplu Güncelle" girişi, `exclude` prop (string | string[])
- Server action: `validateBulkUpdateAction` — parse + validate, `requireAdmin()` gated

#### Wave 6B — Atomic Commit Layer
- `024_bulk_excel_product_update_rpc.sql` — PL/pgSQL SECURITY DEFINER, service_role only
  - JSONB `?` absent-key semantics (absent = unchanged)
  - `FOR UPDATE ORDER BY id` deadlock önleme
  - `inventory_movements` (manual_adjustment, op-id embedded reason)
  - `audit_logs` (bulk_operation entity_type, tam metadata)
  - Guard katmanı: UNAUTHORIZED_ADMIN → EMPTY_ROWS → LIMIT_EXCEEDED → INVALID_PRODUCT → DUPLICATE_PRODUCT → INVALID_BRAND → INVALID_FIELD → NEGATIVE_PRICE → NEGATIVE_STOCK → RESERVED_STOCK_VIOLATION
  - Atomicity: tek hata → tüm batch rollback, audit kaydı yazılmaz
- `bulk-update-commit.actions.ts`: Pattern A (re-parse + re-validate), TOCTOU koruması
- `ResolvedCommitRow`: yalnızca değişen alanlar taşınır

#### Wave 6C — Error Report + UX + Release Readiness
- `issueRows`: tüm hata+uyarı satırları sunucuda hesaplanır, client'a gönderilir (200-satır sınırı yok)
- "Hata Raporunu İndir": client-side SheetJS, `bulk-update-hata-raporu-YYYY-MM-DD-HHmm.xlsx`
  - "Hatalar" sheet: Excel Satırı / SKU / Ürün / Alan / Hata Kodu / Hata Açıklaması / Mevcut Değer / Yeni Değer
  - "Uyarılar" sheet: aynı format, yalnızca warning satırları
- Commit error UX: hata sonrası dry-run state + dosya korunur, kullanıcı düzeltip tekrar commit yapabilir
- Inline hata banner: TOCTOU ve diğer RPC hataları Türkçe gösterilir
- Smoke test: Negative/guard (9/9 PASS) + Positive commit (tüm adımlar PASS, restore onaylandı)

#### Teknik kısıtlar
- Max 10.000 satır (parse), max 500 satır (commit), max 9.5 MB
- Yalnızca mevcut ürünler güncellenir, yeni ürün oluşturulmaz
- Marka/Kategori: boş → değiştirme, `TEMİZLE` → NULL
- Duplicate SKU, bilinmeyen SKU, negatif fiyat/stok, rezervasyon ihlali → tam hata engeli
