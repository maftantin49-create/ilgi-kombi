# Architecture — PITT Commerce Core

İlgi Kombi yedek parça e-ticaret admin paneli teknik mimarisi.

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

## İki Supabase Client Mimarisi

```
Browser ─────────────────────────────────────────────────────────┐
                                                                  │
Next.js Server                                                    │
  ├── createAuthServerClient()   ← NEXT_PUBLIC_SUPABASE_URL       │
  │     NEXT_PUBLIC_SUPABASE_ANON_KEY                             │
  │     Cookie-aware (SSR auth)                                   │
  │     Kullanım: requireAdmin() → session okuma                  │
  │                                                               │
  └── createServiceClient()      ← SUPABASE_SERVICE_ROLE_KEY      │
        Server-only, env secret                                    │
        RLS bypass                                                 │
        Kullanım: tüm DB yazma/okuma operasyonları                │
```

**Kural:** `SUPABASE_SERVICE_ROLE_KEY` hiçbir zaman `NEXT_PUBLIC_` önekli değişkende bulunmayacak, client bundle'a girmeyecek.

---

## Route Yapısı

```
src/app/
├── (public)/                    ← Herkese açık
│   ├── layout.tsx               Header + Footer
│   ├── error.tsx                Public error boundary
│   ├── loading.tsx              Public loading skeleton
│   ├── page.tsx                 Ana sayfa
│   ├── urunler/
│   ├── kategoriler/[slug]/
│   ├── markalar/
│   ├── sepet/
│   ├── odeme/
│   └── ...
│
├── admin/
│   └── (protected)/             ← requireAdmin() zorunlu
│       ├── layout.tsx           AdminSidebar + AdminTopbar
│       ├── error.tsx            Admin error boundary
│       ├── loading.tsx          Admin loading skeleton
│       ├── page.tsx             Dashboard
│       ├── products/
│       ├── brands/
│       ├── categories/
│       ├── inventory/
│       ├── orders/
│       ├── customers/
│       ├── payments/
│       └── settings/
│
├── global-error.tsx             Kök layout hataları (kendi html/body)
└── not-found.tsx
```

---

## Authentication & Authorization

```
İstek gelir
    │
    ▼
layout.tsx (route group)
    │
    ├── requireAdmin() ─── React.cache() ile deduplicate
    │       │
    │       ├── createAuthServerClient().auth.getUser()
    │       │     → JWT doğrulama
    │       │
    │       └── createServiceClient()
    │             .from("admin_profiles")
    │             .select("id, is_active")
    │             .eq("user_id", user.id)
    │             .eq("is_active", true)
    │             → is_active false veya kayıt yoksa redirect("/admin/giris")
    │
    └── Her server action da requireAdmin() çağırır (double-layer)
```

**Kural:** Client'tan gelen `role`, `is_active`, fiyat, stok değerleri asla güvenilir kabul edilmez.

---

## Server Actions Pattern

```typescript
// 1. File-level "use server" — sadece action dosyalarında
"use server"

// 2. requireAdmin() her action'ın ilk satırı
export async function someAction(_prevState, formData) {
  const admin = await requireAdmin()  // ← ilk satır, kesinlikle

  // 3. Zod ile form doğrulama
  const parsed = schema.safeParse(...)
  if (!parsed.success) return { success: false, fieldErrors: ... }

  // 4. DB işlemi
  const db = createServiceClient()
  await db.from("table").insert(m(data))  // m<T>() TypeScript workaround

  // 5. Audit log (fire-and-forget)
  await createAuditLog({ ... })

  // 6. Revalidate + Redirect
  revalidatePath("/admin/...")
  redirect("/admin/...")
}

// Client tarafı — bind() pattern
const boundAction = action.bind(null, entityId)
const [state, dispatch] = useActionState(boundAction, initialState)
```

---

## Veritabanı Şema Özeti

```
001 extensions_enums    → citext, pgcrypto; order_status, payment_status enum
002 core_tables         → brands, categories, products
003 customer_tables     → customers, customer_addresses
004 order_tables        → orders, order_items, inventory_reservations
005 payment_tables      → payment_attempts, inventory_movements
006 admin_audit_tables  → admin_profiles, audit_logs
007 settings_tables     → public_settings, system_settings
008 functions           → set_updated_at(), create_order_atomic(), ...
009 rls_policies        → 14 tablo, authenticated/anon ayrımı
010 indexes             → performans indexleri
011 seed_static         → enum etiketleri, varsayılan ayarlar
012 admin_stock_adj_rpc → admin_stock_adjustment() RPC
013 settings_seed       → JSONB grup seed (henüz uygulanmadı)
014 brands_name_unique  → brands.name UNIQUE constraint
```

**Kritik:** `create_order_atomic()` fonksiyonu `shipping_cost` ve `free_shipping_threshold` anahtarlarını `public_settings` tablosunda **flat key** olarak okur. Bu anahtarlar JSONB'ye taşınmayacak.

---

## Settings Mimarisi

```
public_settings tablosu
├── "shipping_cost"           → flat key (number)  ← create_order_atomic reads
├── "free_shipping_threshold" → flat key (number)  ← create_order_atomic reads
├── "currency"                → flat key (string)
├── "reservation_ttl_minutes" → flat key (number)
├── "max_cart_quantity"       → flat key (number)
├── "general"                 → JSONB group
├── "company"                 → JSONB group
├── "seo"                     → JSONB group
├── "social"                  → JSONB group
├── "mail"                    → JSONB group
├── "stock_config"            → JSONB group
└── "order_config"            → JSONB group

system_settings tablosu
└── "security"                → JSONB group (RLS: sadece service_role)
```

---

## Güvenlik Kuralları (Değişmez)

1. `service_role` key hiçbir `NEXT_PUBLIC_` değişkeninde bulunmayacak
2. API key, secret key, DB password hiçbir tabloda tutulmayacak — sadece env secret
3. Admin mutation'ları server-side çalışacak
4. Client'tan gelen fiyat, stok, role değerleri körü körüne güvenilir kabul edilmeyecek
5. Hassas secret veya credential audit log'a yazılmayacak
6. iyzico secret, Google Ads secret, SMTP password, API token, WhatsApp token settings tablolarında tutulmayacak

---

## proxy.ts — Middleware Decision Note

Next.js 16 App Router, middleware dosyası için `proxy.ts` adını kullanır (`middleware.ts` deprecated).

```
src/proxy.ts  ←  Next.js 16 convention
  export function proxy(request: NextRequest) { ... }
  export const config = { matcher: ["/admin/:path*"] }
```

**Proxy'nin rolü — yalnızca optimistic redirect:**
- Session cookie varlığını kontrol eder (Edge Runtime'da)
- Cookie yoksa → `/admin/giris`'e 307 redirect
- Cookie varsa → `NextResponse.next()` — işlemi server component'e bırakır

**Proxy yetkilendirme DEĞİL:**
- Edge Runtime'da `service_role` sorgusu yapılamaz
- `admin_profiles.is_active` kontrolü burada yapılmaz
- Gerçek authentication + authorization:
  1. `requireAdmin()` — her admin layout ve server component'de
  2. `requireAdmin()` — her server action'ın ilk satırında

Proxy yalnızca gereksiz server render maliyetini azaltan erken engel katmanıdır.

---

## Önemli Dosyalar

| Dosya | Amaç |
|-------|------|
| `src/lib/supabase/server.ts` | İki client factory |
| `src/lib/admin/requireAdmin.ts` | Auth guard, React.cache |
| `src/lib/admin/audit.ts` | Audit log helper |
| `src/lib/admin/_utils.ts` | `m<T>()` TypeScript workaround |
| `src/lib/admin/format.ts` | formatDate / formatDateTime / formatPrice |
| `src/components/admin/StatusBadge.tsx` | Generic status badge |
| `src/lib/admin/schemas/settings.ts` | TAB_SCHEMAS, VALID_TAB_KEYS |
| `src/lib/admin/settings.actions.ts` | Settings upsert, audit |
| `supabase/migrations/` | 014 migration dosyası |
| `src/proxy.ts` | Next.js 16 middleware (optimistic session redirect) |
