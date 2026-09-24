# PITT Commerce Core — v0.1.0

İlgi Kombi yedek parça e-ticaret platformu.
Admin paneli + müşteri sitesi — Next.js 16 App Router üzerine inşa edildi.

---

## Tech Stack

| Katman | Teknoloji | Versiyon |
|--------|-----------|---------|
| Framework | Next.js App Router | 16.2.11 |
| Bundler | Turbopack | (built-in) |
| Language | TypeScript | 5.9.3 |
| Database | Supabase (PostgreSQL 15) | — |
| Auth | Supabase Auth (SSR) | 2.112.2 |
| Validation | Zod | 4.4.3 |
| Styling | Tailwind CSS | 4.x |
| Runtime | React | 19 |

---

## Admin Panel — Modüller

| Modül | Açıklama |
|-------|----------|
| Authentication | Supabase SSR JWT + `admin_profiles.is_active` çift katman |
| Dashboard | Toplam ürün, stok uyarısı, son hareketler |
| Ürün Yönetimi | Listeleme, arama, filtre, oluştur, güncelle, is_active toggle |
| Marka Yönetimi | CRUD, slug, UNIQUE constraint, ürün sayısı delete guard |
| Kategori Yönetimi | Ağaç yapısı (parent/child), delete guard |
| Stok Yönetimi | Atomic ayarlama RPC, hareket geçmişi |
| Sipariş Yönetimi | Durum whitelist geçişi, audit log |
| Müşteri CRM | Aggregate metrikler, adres geçmişi, sipariş özeti (read-only) |
| Ödeme Yönetimi | Deneme geçmişi, iyzico JSON redaction (read-only) |
| Sistem Ayarları | 9 sekme, hibrit flat-key + JSONB mimarisi |

---

## Geliştirme

```bash
npm install
npm run dev        # http://localhost:3000 (Turbopack)
```

### Ortam Değişkenleri

`.env.local` dosyasını oluştur:

```bash
NEXT_PUBLIC_SUPABASE_URL=<proje-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-only, NEXT_PUBLIC_ olmaz
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Migration'ları Uygula

Supabase Studio SQL Editor'da `supabase/migrations/` içindeki dosyaları
sırasıyla (001 → 014) çalıştır.

---

## Güvenlik Kuralları (Değişmez)

- `SUPABASE_SERVICE_ROLE_KEY` hiçbir `NEXT_PUBLIC_` değişkeninde bulunmaz
- Admin mutation'ları server-side çalışır — client'tan gelen değerlere körü körüne güvenilmez
- iyzico secret, SMTP şifresi, API token settings tablolarında tutulmaz
- Hassas değerler audit log'a yazılmaz

Detay: `ARCHITECTURE.md`

---

## Proje Yapısı

```
src/
├── app/
│   ├── (public)/          Müşteri sitesi
│   └── admin/
│       └── (protected)/   Admin paneli (requireAdmin guard)
├── components/admin/      Admin UI bileşenleri
├── lib/
│   ├── admin/             Server actions, helpers, schemas
│   └── supabase/          İki client: service + auth
└── types/                 Database types
supabase/migrations/       001–014 SQL migration dosyaları
```

---

## Dokümantasyon

| Dosya | İçerik |
|-------|--------|
| `CHANGELOG.md` | Sürüm geçmişi |
| `ARCHITECTURE.md` | Teknik mimari |
| `KNOWN_DEBT.md` | Teknik borç listesi |
| `ROADMAP.md` | v0.2.0 + v0.3.0 planı |
| `docs/SMOKE_TEST.md` | Manuel test planı (55 test) |
| `docs/RELEASE_CHECKLIST.md` | Release onay listesi |
| `docs/DEPLOY_RUNBOOK.md` | Deploy sırası + rollback + izleme |

---

## Sürüm

**v0.1.0** — Admin Panel İlk Sürüm (2026-08-11)

Sonraki: v0.2.0 — İyzico entegrasyonu, performans iyileştirmeleri
