# Deploy Runbook — v0.1.0

PITT Commerce Core ilk production deployment rehberi.

---

## Ön Koşul Doğrulama (Deployment Öncesi)

Aşağıdaki tüm maddeler ✅ olmadan deployment yapılmaz:

- [x] `npm run build` clean ✅
- [x] `npx tsc --noEmit` 0 hata ✅
- [x] Smoke Test 55/55 PASS ✅
- [x] Migration 001–014 production'da uygulandı ✅
- [x] `NEXT_PUBLIC_SUPABASE_URL` Vercel'de tanımlı ✅
- [x] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` Vercel'de tanımlı ✅
- [x] `SUPABASE_SERVICE_ROLE_KEY` Vercel'de tanımlı ✅
- [x] `git push origin main` başarılı (3d39f10) ✅
- [x] `git push origin v0.1.0` tag başarılı ✅
- [ ] Vercel deployment READY (Dashboard'dan doğrulanmalı)
- [ ] V1-V5 production smoke test (manual, production URL gerekli)
- [ ] Supabase DB doğrulama (Dashboard SQL Editor)
- [ ] Custom domain SSL aktif

---

## Deploy Sırası

### Adım 1 — Son Durum Kontrolü

```bash
git status          # Uncommitted değişiklik olmamalı
git log --oneline -5
```

Beklenen: çalışma ağacı temiz, son commit `chore: release v0.1.0`

### Adım 2 — Git Tag

```bash
git tag -a v0.1.0 -m "PITT Commerce Core — Admin Panel İlk Sürüm"
git push origin main
git push origin v0.1.0
```

### Adım 3 — Vercel Deployment

**Tercih edilen yol: Vercel Dashboard**

1. Vercel Dashboard → proje → "Deployments" sekmesi
2. "Redeploy" (son commit üzerinde) veya otomatik trigger (main push)
3. Environment: **Production** seçili olduğunu doğrula
4. "Deploy" — build log'u izle

**Alternatif: Vercel CLI**
```bash
vercel --prod
```

### Adım 4 — Build Log İzleme

Beklenen sıraya göre:
```
✓ Compiled successfully
Running TypeScript...
✓ Generating static pages (21/21)
```

Herhangi bir TypeScript hatası veya build failure → **deployment durdur, Adım 6'ya git.**

### Adım 5 — Deployment Sonrası Doğrulama (5 dakika)

Deployment tamamlandıktan sonra sırasıyla kontrol et:

| # | Kontrol | Beklenen |
|---|---------|----------|
| V1 | `/admin` adresine git | `/admin/giris`'e redirect |
| V2 | Admin ile giriş yap | Dashboard yüklendi |
| V3 | Ürün listesi aç | Ürünler görünüyor |
| V4 | Sipariş listesi aç | Siparişler görünüyor |
| V5 | Ayarlar → Genel sekmesi | Değerler DB'den yüklendi |

Bu 5 kontrol PASS → deployment başarılı, izleme planına geç.

Herhangi biri FAIL → **Adım 6: Rollback.**

---

## Rollback Planı

### Ne Zaman Rollback Yapılır

- V1-V5 kontrollerinden herhangi biri FAIL
- Admin girişi çalışmıyor
- Dashboard HTTP 500 dönüyor
- Build sırasında runtime panic / crash

### Rollback — Vercel (Hızlı Yol)

1. Vercel Dashboard → Deployments
2. Bir önceki başarılı deployment'ı bul
3. "..." → **"Promote to Production"**
4. Onay → ~30 saniye içinde eski versiyon aktif

Vercel rollback veri kaybı yaratmaz — yalnızca kod katmanı geri alınır. Supabase veritabanı etkilenmez.

### Rollback — Git (Kod Düzeltme Gerekiyorsa)

```bash
# Sorunu tespit et, düzelt, commit et
git revert HEAD          # veya belirli commit
git push origin main     # → Vercel otomatik rebuild tetikler
```

### Migration Rollback (Gerekirse)

v0.1.0'da yeni migration deploy edilmedi — 013 ve 014 daha önce uygulandı.
Bu nedenle migration rollback senaryosu geçerli değil.

Gelecekte gerekirse: her migration dosyasının başındaki `Rollback:` yorum satırına bak.

---

## Production Sonrası İlk 24 Saat İzleme Planı

### 0–1. Saat: Kritik Kontrol

Deployment tamamlandıktan hemen sonra:

| Kontrol | Araç | Beklenen |
|---------|------|----------|
| Admin girişi çalışıyor | Manuel | Dashboard yüklendi |
| Supabase bağlantısı | Vercel Function Logs | 0 connection error |
| `requireAdmin()` guard | Manuel (login olmadan URL dene) | Redirect çalışıyor |
| Settings değerleri yüklendi | Admin UI | DB'den geliyor |
| Vercel build/runtime log | Vercel Dashboard | 0 error |

### 1–6. Saat: Fonksiyonel İzleme

| Kontrol | Sıklık | Nasıl |
|---------|--------|-------|
| Ürün listesi yüklenme süresi | 2 saatte bir | Tarayıcı Network tab |
| Sipariş detay sayfası | 2 saatte bir | Manuel navigasyon |
| Admin log errors | 2 saatte bir | Vercel Function Logs |
| Supabase DB connections | 2 saatte bir | Supabase Dashboard → Reports |

**Alarm eşiği:** Herhangi bir sayfada HTTP 500 → rollback değerlendirmesi.

### 6–24. Saat: Pasif İzleme

| İzlenecek | Araç | Eşik |
|-----------|------|------|
| Vercel Function error rate | Vercel Dashboard | > 1% → inceleme |
| Supabase DB bağlantı sayısı | Supabase → Reports | Anormal artış → inceleme |
| Build önbelleği geçerliliği | Vercel | Stale cache uyarısı → purge |
| Admin audit_logs tablosu | Supabase SQL | Beklenmedik işlem kaydı |

### 24. Saat: İlk Gün Özeti

Aşağıdaki soruları yanıtla ve belgele:

- [ ] Kaç admin girişi yapıldı?
- [ ] Herhangi bir HTTP 500 veya 4xx spike oldu mu?
- [ ] Supabase connection pool sınırına yaklaşıldı mı?
- [ ] KNOWN_DEBT'ten (M4, M5) herhangi bir limit yaklaştı mı?
- [ ] v0.2.0 planında öncelik değişikliği gerekiyor mu?

---

## Acil İletişim

| Durum | Aksiyon |
|-------|---------|
| Admin girişi çalışmıyor | Vercel logs → Supabase Auth kontrol → Rollback |
| DB bağlantısı yok | Supabase Dashboard → service_role key Vercel'de doğru mu? |
| Build hata | Vercel Deploy log → `tsc --noEmit` local çalıştır |
| Audit log yazılmıyor | `audit.ts` console.error → Supabase RLS kontrol |

---

*Hazırlandı: 2026-08-11 — PITT Commerce Core v0.1.0*
