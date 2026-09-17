# Performance Baseline Ölçüm Planı — v0.1.0

Bu plan, production deployment öncesi ve her minor sürüm sonrası çalıştırılır.
Amaç: Regresyon tespiti için referans değer oluşturmak.

---

## Ölçüm Araçları

| Araç | Kullanım |
|------|---------|
| Chrome DevTools Network | TTFB, toplam yükleme süresi |
| Vercel Analytics | p50/p75/p99 server response time |
| Supabase Dashboard | Query execution time, slow query log |
| `npm run build` output | Bundle size, static/dynamic route analizi |

---

## 1. Build Metrikleri (Her Deployment)

```bash
npm run build 2>&1 | grep -E "Route|Size|First Load"
```

Kayıt edilecekler:

| Route | Type | First Load JS | Hedef |
|-------|------|--------------|-------|
| `/admin` | Dynamic | — | < 200kB |
| `/admin/products` | Dynamic | — | < 200kB |
| `/admin/orders` | Dynamic | — | < 200kB |
| `/admin/settings` | Dynamic | — | < 250kB |
| `/urunler` | Dynamic | — | < 150kB |
| `/` | Static | — | < 150kB |

---

## 2. Server Response Time — Admin Sayfaları

Ölçüm yöntemi: Chrome DevTools → Network → İlk beyaz dokümana TTFB.
Koşul: Cold start değil, warm (ikinci yükleme).
Tekrar: 3 ölçüm, ortalaması alınır.

| Sayfa | Ölçüm 1 | Ölçüm 2 | Ölçüm 3 | Ortalama | Hedef |
|-------|---------|---------|---------|----------|-------|
| `/admin` | — | — | — | — | < 800ms |
| `/admin/products` (50 ürün) | — | — | — | — | < 800ms |
| `/admin/products` (500 ürün) | — | — | — | — | < 1500ms |
| `/admin/orders` (100 sipariş) | — | — | — | — | < 800ms |
| `/admin/customers` (100 müşteri) | — | — | — | — | < 1200ms |
| `/admin/inventory` (50 ürün) | — | — | — | — | < 800ms |
| `/admin/settings` | — | — | — | — | < 600ms |
| `/admin/payments` (100 ödeme) | — | — | — | — | < 800ms |

---

## 3. Supabase Query Performance

Supabase Dashboard → Database → Query Performance (veya SQL Editor ile `EXPLAIN ANALYZE`).

### Kritik Sorgular

```sql
-- Q1: Ürün listesi (filtre yok, 500 ürün)
EXPLAIN ANALYZE
SELECT id, name, sku, price, stock_quantity, is_active, brand_id, category_id
FROM products
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Q2: Stok listesi (tüm ürünler)
EXPLAIN ANALYZE
SELECT p.id, p.name, p.sku, p.stock_quantity, b.name as brand_name
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
ORDER BY p.name;

-- Q3: Müşteri listesi (hasOrders pre-filter)
EXPLAIN ANALYZE
SELECT DISTINCT customer_id FROM orders;

-- Q4: Müşteri detayı (3 sorgu birleşik test)
EXPLAIN ANALYZE
SELECT c.*, ca.city, ca.district
FROM customers c
LEFT JOIN customer_addresses ca ON c.id = ca.customer_id
WHERE c.id = '<test-uuid>';

-- Q5: create_order_atomic RPC (henüz production'da test edilmedi)
-- Manuel olarak sandbox'ta tetiklenecek
```

Kayıt edilecekler:

| Sorgu | Planning Time | Execution Time | Heap Blocks | Hedef |
|-------|--------------|----------------|-------------|-------|
| Q1 | — | — | — | < 5ms |
| Q2 | — | — | — | < 10ms |
| Q3 | — | — | — | < 5ms |
| Q4 | — | — | — | < 5ms |

---

## 4. Index Kontrolü

```sql
-- Tanımlı indexler
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Kullanılmayan indexler
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY tablename;

-- Seq scan tespit (full table scan uyarıları)
SELECT schemaname, relname, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > 100
ORDER BY seq_scan DESC;
```

---

## 5. Memory & Edge Cases

### getCustomers() hasOrders Riski

```sql
-- Production'daki sipariş sayısı
SELECT COUNT(*) FROM orders;

-- Eşik: 5000 altında sorun yok
-- 5000–20000: Review gerekiyor (KNOWN_DEBT M4)
-- 20000+: Acil fix gerekiyor
```

### getStockList() Riski

```sql
-- Production'daki ürün sayısı
SELECT COUNT(*) FROM products;

-- Eşik: 1000 altında sorun yok
-- 1000–5000: Monitor et
-- 5000+: DB-side pagination fix zorunlu (KNOWN_DEBT M5)
```

---

## 6. Public Site Metrikleri (Lighthouse)

Chrome DevTools → Lighthouse → Production URL.
Mod: Desktop + Mobile.

| Metrik | Desktop Hedef | Mobile Hedef |
|--------|--------------|-------------|
| Performance | > 85 | > 70 |
| Accessibility | > 90 | > 90 |
| Best Practices | > 90 | > 90 |
| SEO | > 90 | > 90 |
| LCP | < 2.5s | < 4s |
| CLS | < 0.1 | < 0.1 |
| FID/INP | < 100ms | < 200ms |

---

## 7. Regresyon Eşikleri

Bir sonraki sürümde bu baseline ile karşılaştırılır. Kabul edilemez regresyon:

- Server response time: baseline'dan > %30 artış
- Bundle size: baseline'dan > %20 artış
- Lighthouse Performance: baseline'dan > 10 puan düşüş
- Query execution time: baseline'dan > %50 artış

---

## Baseline Kaydı

```
Ölçüm Tarihi: ___________
Tester: ___________
Commit/Tag: v0.1.0
Ortam: Production
DB Ürün Sayısı: ___________
DB Sipariş Sayısı: ___________
DB Müşteri Sayısı: ___________

Notlar:
```
