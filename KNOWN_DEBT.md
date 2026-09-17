# Technical Debt — PITT Commerce Core

Son güncelleme: 2026-08-24 (Storefront Wave 1F-B — Atomic Order Creation)

---

## Durum Göstergesi

| Sembol | Anlam |
|--------|-------|
| ✅ | Çözüldü |
| ⬜ | Açık |
| 🔴 | High |
| 🟠 | Medium |
| 🟡 | Low |

---

## High — Fonksiyonel etki

| # | Sorun | Konum | Etki | Durum |
|---|-------|-------|------|-------|
| H1 | `brands.name` UNIQUE constraint eksikti | `002_core_tables.sql` | Duplicate marka girişi mümkündü | ✅ `014` migration uygulandı |
| H2 | `013_settings_seed.sql` uygulanmadı | `supabase/migrations/013_*` | Settings başlangıç değerleri DB'den değil code default'lardan geliyor | ✅ Production DB'de uygulandı, doğrulandı |
| H3 | `audit.ts` catch block boştu | `src/lib/admin/audit.ts:29` | Audit log başarısızlıkları sessiz kayıp | ✅ `console.error("[AuditLog]", err)` eklendi |

---

## Medium — Bakım / Ölçek riski

| # | Sorun | Konum | Etki | Durum |
|---|-------|-------|------|-------|
| M1 | `m<T>()` helper 6 dosyada kopya | actions/*.ts | Değişiklik 6 yerde yapılmalıydı | ✅ `_utils.ts`'e taşındı |
| M2 | `formatPrice/Date/DateTime` 6+ dosyada ayrı tanım | pages & tables | Davranış tutarsızlığı riski; naming inconsistency | ✅ `format.ts`'e taşındı |
| M3 | 5 Badge/StatusBadge implementasyonu | orders, payments, tables | Stil tutarsızlığı riski | ✅ `StatusBadge.tsx`'e taşındı |
| M4 | `getCustomers()` hasOrders LIMIT yok | `customers.ts:113-123` | 10k+ sipariş → JS'de bellek baskısı | ⬜ `LIMIT 1` eklenebilir |
| M5 | `getStockList()` TypeScript sayfalama | `inventory.ts:70-80` | 10k+ ürün → JS'de bellek baskısı | ⬜ DB-side sayfalama gerekiyor |
| M6 | `getCustomerById()` 3 sequential await | `customers.ts:207-244` | Gereksiz latency (~3x); TS 5.9 workaround | ⬜ TS fix sonrası Promise.all'a geçilebilir |
| M7 | `inventory_movements.quantity` DB CHECK yok | `005_payment_tables.sql` | Doğrudan INSERT korumasız (RPC korumalı) | ⬜ `CHECK (quantity != 0)` migration gerekiyor |
| M8 | `NEXT_PUBLIC_SITE_URL` tanımlı ama kullanılmıyor | `.env.local` / `next.config.ts` | Env tutarsızlığı | ⬜ Kullanılacak veya kaldırılacak |
| M9 | `config/site.ts` ↔ `public_settings` double source | `src/config/site.ts` | Kargo ücreti iki yerden yönetiliyor; senkronizasyon riski | ⬜ `config/site.ts` v0.2.0'da DB'den okuyacak |
| M10 | `Pagination.tsx` yanlış konumda | `src/components/admin/products/` | İmport yolu yanıltıcı, paylaşılmış component burada olmamalı | ⬜ `components/admin/` köküne taşınacak |
| M11 | Toplu import 10k+ satır için Storage + Async Job mimarisi gerekiyor | `lib/admin/import*` | 10k üstü dosya FormData bodySizeLimit'i aşar; timeout riski | ⬜ Supabase Storage upload + Edge Function + polling ile çözülecek |
| M12 | 50k+ import response Vercel 4.5 MB limitini aşar | `lib/admin/import.actions.ts` | 50k satır × %20 hata ≈ 9 MB response | ⬜ Streaming response veya paginated rowStatuses gerekiyor |
| M13 | Import idempotency: session deduplication yok | `lib/admin/import-commit.actions.ts` | Ağ hatası sonrası retry → unique_violation → kullanıcı için belirsiz | ⬜ `product_import_jobs` tablosu + session_id UNIQUE constraint |
| M14 | `products.image_url` / `hover_image_url` için storage path saklanmıyor | `products` tablosu | Ana/hover görsel değiştirildiğinde eski Storage dosyası orphan kalıyor | ⬜ `image_path` + `hover_image_path` kolonu eklenecek |
| M15 | Galeri görsel silme Storage'a asenkron yansıyor | `products.actions.ts` | Save öncesi storage remove best-effort; RPC rollback olursa dosya silinmiş olabilir | ⬜ Transactional cleanup için DB trigger veya cron job |
| M16 | `getStockList()` tüm ürünleri belleğe çeker | `inventory.ts:81` | 500k ürün → JS bellek baskısı; status filter TypeScript'te yapılıyor | ⬜ DB-side status filter + sayfalama gerekiyor (mevcut debt, Sprint 2 dışı) |
| M17 | Device search multi-word semantics zayıf | `device-models.actions.ts` | `normQ` boşlukları siler ("ecotec plus" → "ECOTECPLUS") ama `model_norm` boşluk korur ("ECOTEC PLUS") → trigram GIN index kullanılamaz, fallback `model.ilike` sequential scan; 50k+ cihazda yavaşlar | ⬜ `model_norm` arama stratejisi iyileştirilecek — ya normQ'ya boşluk koru ya da `websearch_to_tsquery` ile FTS geç |
| M18 | Cart fiyat/stok revalidation yok (checkout güvensiz) | `src/lib/cart.ts`, gelecek Wave 1F | `CartItem.unitPrice` ve `stockQuantity` localStorage snapshot'ı — sunucu-tarafı doğrulama yok. Checkout Wave 1F'de: `productId[]` → server → DB `is_active`, `price`, `stock` yeniden doğrulanmalı; eski fiyat / stok tükenen ürün siparişe girmemeli | ✅ Wave 1F-A: `validateCheckoutAction` + `/odeme` sayfası ile çözüldü |
| M19 | `useFavorites` hâlâ mock `Product` tipine bağımlı | `src/lib/favorites.ts` | Favorites store tam `Product` nesnesini localStorage'da saklıyor — Wave 1E kapsamı dışı | ⬜ Favorites refactor: Wave 1F veya sonrası |
| M20 | `customers.email UNIQUE` — guest tekrar sipariş çakışması | `003_customer_tables.sql` | ✅ Wave 1F-B: `create_pending_order` RPC içinde `ON CONFLICT (email) DO UPDATE` ile çözüldü |
| M21 | `inventory_reservations` için cleanup job yok | `005_payment_tables.sql` | Tüm stok sorguları `status='active' AND expires_at > now()` guard'ı kullanıyor (MAINTENANCE DEBT, correctness blocker değil). pg_cron veya Supabase Edge Function Wave 1G+ ile eklenecek | ⬜ Wave 1G+ |
| M22 | Ödeme / sipariş oluşturma henüz yok | `/odeme` sayfası | ✅ Wave 1F-B: `create_pending_order` RPC + `createOrderAction` ile çözüldü. Status = pending_payment. |
| M23 | İyzico entegrasyonu yok | — | ✅ Wave 1G: REST HMAC-SHA256 client, `initializePaymentAction`, callback skeleton tamamlandı. Wave 1H: retrieve + order finalize kaldı. | ✅ Wave 1G (kısmi) |
| M24 | `database.types.ts` 026 migration'dan sonra stale | `src/types/database.types.ts` | `orders.idempotency_key` ve `create_pending_order()` tipi yok. `(db as ReturnType<...>)` cast kullanılıyor (wave 1F-B). Migration uygulandıktan sonra `supabase gen types typescript` çalıştırılmalı. | ⬜ Migration sonrası |
| M25 | Pending order reservation lifecycle tanımsız | `/odeme`, `create_pending_order` | `pending_payment + expired reservation` sonrası yeni checkout veya reservation refresh mekanizması yok. Wave 1G iyzico entegrasyonunda netleştirilecek. | ⬜ Wave 1G |

---

## Wave 1G İyzico Debt

| # | Sorun | Konum | Etki | Durum |
|---|-------|-------|------|-------|
| W1G-1 | `identityNumber` TC kimlik no toplanmıyor | `payment.actions.ts` buyer | Sandbox: iyzico test değeri "74300864791" kullanılıyor. **Canlıya geçmeden önce TC kimlik no checkout formuna eklenmeli veya B2B muafiyet araştırılmalı.** | ⬜ PRODUCTION BLOCKER |
| W1G-2 | Gerçek istemci IP'si kullanılmıyor | `payment.actions.ts` buyer.ip | Sandbox: "127.0.0.1" kullanılıyor. Canlıda `x-forwarded-for` header'dan alınmalı (Vercel: `req.headers.get("x-forwarded-for")`) | ⬜ Production öncesi |
| W1G-3 | Callback finalize yok | `api/payments/iyzico/callback/route.ts` | ✅ Wave 1H: retrieve → cross-check (conversationId, basketId, amount, currency, fraudStatus) → finalize_iyzico_payment RPC → stock decrement → /odeme/sonuc redirect | ✅ Wave 1H |
| W1G-4 | paymentAccessToken yalnızca React state'te | `/odeme/page.tsx` | Sayfa yenilenirse token kaybolur, online ödeme başlatılamaz. WhatsApp fallback çalışıyor. Kalıcı çözüm: sessionStorage veya e-posta linki | ⬜ Wave 1H+ |
| W1G-5 | `IYZICO_CALLBACK_URL` localhost'ta çalışmaz | `.env.example` | iyzico callback URL dışarıdan ulaşılabilir olmalı. Geliştirme için ngrok veya benzeri tünel gerekiyor. | ⬜ Dev setup |

---

## Low — Kozmetik / Temizlik

| # | Sorun | Konum | Durum |
|---|-------|-------|-------|
| L1 | `CountUpNumber.tsx`, `MagneticButton.tsx` dead component | `src/components/` | ⬜ Silinecek veya kullanılacak |
| L2 | `@base-ui/react` kullanılmayan ~12MB dependency | `package.json` | ⬜ `ui/badge.tsx` dışında kullanım yok; değerlendirilecek |
| L3 | `puppeteer` kullanılmayan ~25MB devDependency | `package.json` | ⬜ Kaldırılacak |
| L4 | `DeleteConfirmButton.tsx` hardcode `name="brandId"` | `src/components/admin/brands/` | ⬜ Generic `name` prop'a dönüştürülecek |
| L5 | Inventory filtre + boş durum → generic mesaj | `inventory/page.tsx` | ⬜ Filter aktifken bağlama özel mesaj gösterilecek |
| L6 | Data retention policy tanımsız | `005_payment_tables.sql:9` | ⬜ Legal + mali danışmanlık sonrası |
| L7 | Import RELAXED mode desteklenmiyor | `lib/admin/import/validate.ts` | Bilinmeyen marka/kategori → ERROR; bazı senaryolarda null insert tercih edilebilir | ⬜ v0.3.0+ STRICT/RELAXED toggle |
| L8 | Fuzzy brand/category matching yok | `lib/admin/import/validate.ts` | "Vaillantt" yazım hatası → ERROR; kullanıcı düzeltmek zorunda | ⬜ Levenshtein distance ile "Bunu mu demek istediniz?" önerisi |

---

## Sprint Hedefleri

### v0.1.0 Release öncesi (H2)
- [x] `013_settings_seed.sql` production'da uygulandı ✅

### v0.2.0 kapsamı (M4, M5, M7, M9, L1-L5)
- Performans iyileştirmeleri (M4, M5)
- DB constraint tamamlama (M7)
- Config → DB migration (M9)
- Temizlik (L1-L5)

### v0.3.0+ kapsamı (M11, M12, M13, L7, L8)
- 10k+ satır import: Storage + Async Job (M11)
- 50k+ response scalability (M12)
- Import idempotency / session deduplication (M13)
- Relaxed import mode (L7)
- Fuzzy brand/category matching (L8)

---

## Wave 6 Bulk Operations Debt

| # | Sorun | Konum | Etki | Durum |
|---|-------|-------|------|-------|
| W6-1 | TEST-BULK-001/002/003 test ürünleri DB'de kaldı | `products` tablosu | `is_active=false`, katalogdan gizli — admin panelden manuel sil | ⬜ Bekliyor |
| W6-2 | `bulk_excel_product_update` Database Function tipi oluşturulmadı | `types/database.types.ts` | `(db as any).rpc(...)` cast kullanıyor — supabase gen types sonrası kaldırılmalı | ⬜ v0.2.0 |
| W6-3 | Bulk update undo/history yok | — | Commit geri alınamaz, yalnızca yeni bulk update ile eski değerlere dönülebilir | ⬜ v0.3.0+ |
| W6-4 | 10k+ satır dry-run → issueRows büyük JSON response riski | `validateBulkUpdateAction` | 10k hata × ~200 byte ≈ 2MB; Vercel 4.5MB limit güvenli, 50k için server-side export gerekir | ⬜ v0.3.0+ |
| W6-5 | Async bulk job sistemi yok | — | 500 ürün limiti formData+RPC ile çalışıyor; 10k commit için Supabase Storage + Edge Function gerekir | ⬜ v0.3.0+ |
