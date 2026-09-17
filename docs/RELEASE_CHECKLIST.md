# Release Readiness Checklist — v0.1.0

Son güncelleme: 2026-08-11

Tüm maddeler ✅ olmadan release yapılmaz.

---

## 1. Veritabanı

| # | Kontrol | Durum | Not |
|---|---------|-------|-----|
| DB1 | `013_settings_seed.sql` production'da uygulandı | ✅ | public_settings grupları + system_settings.security doğrulandı |
| DB2 | `014_brands_name_unique.sql` production'da uygulandı | ✅ | Doğrulandı |
| DB3 | RLS tüm 14 tabloda aktif | ✅ | 009 migration |
| DB4 | `create_order_atomic()` RPC mevcut | ✅ | 008 migration |
| DB5 | `admin_stock_adjustment()` RPC mevcut | ✅ | 012 migration |
| DB6 | Duplicate marka adı yok | ✅ | 014 öncesi SQL kontrolü yapıldı |

---

## 2. Güvenlik

| # | Kontrol | Durum | Not |
|---|---------|-------|-----|
| SEC1 | `SUPABASE_SERVICE_ROLE_KEY` hiçbir NEXT_PUBLIC_ değişkeninde yok | ✅ | Doğrulandı |
| SEC2 | `service_role` key client bundle'a girmiyor | ✅ | server.ts only |
| SEC3 | Tüm server action'larda `requireAdmin()` ilk satır | ✅ | 6 action dosyası |
| SEC4 | `dangerouslySetInnerHTML` / `innerHTML` / `eval` yok | ✅ | Tarama yapıldı |
| SEC5 | Payments `token` alanı select listesinden dışlandı | ✅ | payments.ts |
| SEC6 | `redactSensitive()` server-only | ✅ | |
| SEC7 | Settings'te secret değer tutulmuyor (sadece boolean flag) | ✅ | IntegrationsTab |
| SEC8 | Audit log değerleri loglamıyor (sadece field adları) | ✅ | |

---

## 3. Kod Kalitesi

| # | Kontrol | Durum | Not |
|---|---------|-------|-----|
| CQ1 | `npx tsc --noEmit` → 0 hata | ✅ | Sprint 1 Aşama 4 sonrası |
| CQ2 | `npm run lint` → 0 uyarı | ✅ | Sprint 1 Aşama 4 sonrası |
| CQ3 | `npm run build` → clean build | ✅ | Sprint 1 Aşama 4 sonrası |
| CQ4 | `eslint-disable` sayısı ≤ 2 (gerekçeli) | ✅ | settings.actions.ts |
| CQ5 | `as any` sayısı ≤ 1 (gerekçeli) | ✅ | settings.actions.ts:98 |
| CQ6 | Audit log catch bloğu boş değil | ✅ | Sprint 1 Aşama 4 |

---

## 4. Modül Hazırlığı

| Modül | Durum | Not |
|-------|-------|-----|
| Authentication | ✅ | |
| Authorization | ✅ | |
| Dashboard | ✅ | |
| Ürün Yönetimi | ✅ | |
| Marka Yönetimi | ✅ | brands.name UNIQUE eklendi |
| Kategori Yönetimi | ✅ | |
| Stok Yönetimi | ✅ | 012 RPC uygulandı |
| Sipariş Yönetimi | ✅ | |
| Müşteri CRM | ✅ | Read-only |
| Ödeme Yönetimi | ✅ | Read-only, redaction |
| Sistem Ayarları | ✅ | 013 migration uygulandı, doğrulandı |
| Public Site | ✅ | |
| Error Boundaries | ✅ | R9 tamamlandı |
| Loading States | ✅ | R9 tamamlandı |

---

## 5. Test

| # | Kontrol | Durum | Not |
|---|---------|-------|-----|
| T1 | Smoke Test (SMOKE_TEST.md) tamamlandı — 55/55 PASS, 2 N/A | ✅ | P8/P9 ürün silme v0.1.0 kapsamı dışı |
| T2 | Authentication kritik path geçti (A1-A5) | ✅ | RC1 Smoke Test |
| T3 | brands.name duplicate engeli test edildi (BR2) | ✅ | RC1 Smoke Test |
| T4 | Stok altına indirecek azaltma engeli test edildi (ST4) | ✅ | RC1 Smoke Test |
| T5 | Geçersiz durum geçişi reddedildi (O5) | ✅ | RC1 Smoke Test |
| T6 | Payments token redacted doğrulandı (PY3) | ✅ | RC1 Smoke Test |
| T7 | Settings kaydet çalışıyor (S3) | ✅ | RC1 Smoke Test |

---

## 6. Performans

| # | Kontrol | Durum | Not |
|---|---------|-------|-----|
| P1 | Performance Baseline ölçüldü (PERFORMANCE_BASELINE.md) | ⬜ | |
| P2 | Admin sayfa ortalama response < 1500ms | ⬜ | |
| P3 | Build bundle size kabul edilebilir (< 250kB first load) | ⬜ | |
| P4 | DB sipariş sayısı < 5000 (hasOrders sorgu güvenli) | ⬜ | KNOWN_DEBT M4 |
| P5 | DB ürün sayısı < 1000 (getStockList güvenli) | ⬜ | KNOWN_DEBT M5 |

---

## 7. Ortam & Deployment

| # | Kontrol | Durum | Not |
|---|---------|-------|-----|
| ENV1 | `NEXT_PUBLIC_SUPABASE_URL` production değeri Vercel'de tanımlı | ✅ | İnsan tarafından doğrulandı |
| ENV2 | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` production değeri Vercel'de tanımlı | ✅ | İnsan tarafından doğrulandı |
| ENV3 | `SUPABASE_SERVICE_ROLE_KEY` production değeri Vercel'de tanımlı (server-only) | ✅ | İnsan tarafından doğrulandı |
| ENV4 | `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL` Vercel'de tanımlı | ⬜ | v0.1.0'da tüketilmiyor; v0.2.0 hazırlığı |
| ENV5 | Vercel environment "Production" olarak seçili (Preview değil) | ⬜ | |
| ENV6 | Custom domain SSL sertifikası aktif | ⬜ | |

---

## 8. Dokümantasyon

| # | Kontrol | Durum | Not |
|---|---------|-------|-----|
| DOC1 | `CHANGELOG.md` v0.1.0 bölümü tamamlandı | ✅ | Sprint 2 |
| DOC2 | `ARCHITECTURE.md` güncel | ✅ | Sprint 2 |
| DOC3 | `KNOWN_DEBT.md` güncel | ✅ | Sprint 2 |
| DOC4 | `ROADMAP.md` güncel | ✅ | Sprint 2 |
| DOC5 | `SMOKE_TEST.md` hazır | ✅ | Sprint 2 |

---

## Release Geçiş Koşulları (Bloklayan)

Aşağıdakilerin tümü ✅ olmadan release yapılmaz:

- [x] DB1 (013 migration) ✅
- [x] T1 (Smoke Test 55/55 PASS, 2 N/A) ✅
- [x] T2 (Auth kritik path) ✅
- [x] T6 (Payments redaction) ✅
- [x] ENV1-ENV3 (Supabase production değerleri Vercel'de tanımlı) ✅

---

## İmza

```
Release Tarihi: ___________
Onaylayan: ___________
Ortam: Production
Versiyon: v0.1.0
```
