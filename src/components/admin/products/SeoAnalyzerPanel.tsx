import { siteConfig } from "@/config/site"

interface SeoProduct {
  name: string
  slug: string
  sku: string
  description: string | null
  seo_title: string | null
  seo_description: string | null
  image_url: string | null
}

interface SeoProductFull extends SeoProduct {
  brandName: string | null
  categoryName: string | null
}

type RuleStatus = "pass" | "warning" | "error"

interface Rule {
  label: string
  status: RuleStatus
  detail: string
  points: number
  maxPoints: number
}

function analyze(p: SeoProductFull): { rules: Rule[]; score: number } {
  const rules: Rule[] = []

  // ── 1. Ürün Adı ─────────────────────────────────────────────────────────────
  const nameLen = p.name.length
  rules.push(
    nameLen >= 30 && nameLen <= 70
      ? { label: "Ürün Adı", status: "pass", detail: `${nameLen} karakter (ideal: 30–70)`, points: 25, maxPoints: 25 }
      : nameLen >= 15
      ? { label: "Ürün Adı", status: "warning", detail: `${nameLen} karakter (ideal: 30–70)`, points: 12, maxPoints: 25 }
      : { label: "Ürün Adı", status: "error", detail: `${nameLen} karakter — çok kısa (min. 15)`, points: 0, maxPoints: 25 }
  )

  // ── 2. Meta Açıklama ─────────────────────────────────────────────────────────
  const desc = p.seo_description
  const descLen = desc?.length ?? 0
  rules.push(
    !desc || descLen === 0
      ? { label: "Meta Açıklama", status: "error", detail: "Boş — Google açıklama üretemez", points: 0, maxPoints: 25 }
      : descLen >= 120 && descLen <= 160
      ? { label: "Meta Açıklama", status: "pass", detail: `${descLen} karakter (ideal: 120–160)`, points: 25, maxPoints: 25 }
      : descLen >= 60
      ? { label: "Meta Açıklama", status: "warning", detail: `${descLen} karakter (ideal: 120–160)`, points: 12, maxPoints: 25 }
      : { label: "Meta Açıklama", status: "error", detail: `${descLen} karakter — çok kısa (min. 60)`, points: 0, maxPoints: 25 }
  )

  // ── 3. Ürün Açıklaması ───────────────────────────────────────────────────────
  const prodDescLen = p.description?.length ?? 0
  rules.push(
    prodDescLen >= 100
      ? { label: "Ürün Açıklaması", status: "pass", detail: `${prodDescLen} karakter`, points: 20, maxPoints: 20 }
      : prodDescLen >= 30
      ? { label: "Ürün Açıklaması", status: "warning", detail: `${prodDescLen} karakter (öneri: 100+)`, points: 10, maxPoints: 20 }
      : { label: "Ürün Açıklaması", status: "error", detail: "Boş veya çok kısa (min. 30 karakter)", points: 0, maxPoints: 20 }
  )

  // ── 4. Marka ─────────────────────────────────────────────────────────────────
  rules.push(
    p.brandName
      ? { label: "Marka", status: "pass", detail: p.brandName, points: 10, maxPoints: 10 }
      : { label: "Marka", status: "error", detail: "Marka atanmamış", points: 0, maxPoints: 10 }
  )

  // ── 5. Kategori ──────────────────────────────────────────────────────────────
  rules.push(
    p.categoryName
      ? { label: "Kategori", status: "pass", detail: p.categoryName, points: 10, maxPoints: 10 }
      : { label: "Kategori", status: "error", detail: "Kategori atanmamış", points: 0, maxPoints: 10 }
  )

  // ── 6. Görsel ────────────────────────────────────────────────────────────────
  rules.push(
    p.image_url
      ? { label: "Ürün Görseli", status: "pass", detail: "Görsel mevcut", points: 10, maxPoints: 10 }
      : { label: "Ürün Görseli", status: "warning", detail: "Görsel yok — SERP'te görselsiz çıkar", points: 5, maxPoints: 10 }
  )

  const score = Math.round(rules.reduce((s, r) => s + r.points, 0))
  return { rules, score }
}

const STATUS_COLORS: Record<RuleStatus, { bg: string; border: string; text: string; badge: string }> = {
  pass:    { bg: "rgba(34,197,94,0.06)",  border: "rgba(34,197,94,0.20)",  text: "#16A34A", badge: "PASS" },
  warning: { bg: "rgba(234,179,8,0.08)",  border: "rgba(234,179,8,0.22)",  text: "#A16207", badge: "UYARI" },
  error:   { bg: "rgba(239,68,68,0.07)",  border: "rgba(239,68,68,0.20)",  text: "#DC2626", badge: "HATA" },
}

function scoreColor(score: number) {
  if (score >= 75) return "#16A34A"
  if (score >= 50) return "#A16207"
  return "#DC2626"
}

export default function SeoAnalyzerPanel({ product, brandName, categoryName }: {
  product: SeoProduct
  brandName: string | null
  categoryName: string | null
}) {
  const p: SeoProductFull = { ...product, brandName, categoryName }
  const { rules, score } = analyze(p)

  const displayTitle = p.seo_title || p.name
  const displayDesc = p.seo_description || p.description?.slice(0, 160) || "Meta açıklama girilmemiş."
  const displayUrl = `${siteConfig.url}/urunler/${p.slug}`
  const truncDesc = displayDesc.length > 155 ? displayDesc.slice(0, 152) + "..." : displayDesc

  const color = scoreColor(score)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#1C1C1C", border: "1px solid #2A2A2A" }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid #2A2A2A" }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "#F4F4F2" }}>SEO Analizi</h2>
          <p className="text-[11px] mt-0.5" style={{ color: "#A5A5A5" }}>
            Bu skor sıralama garantisi değil; iyileştirme rehberidir.
          </p>
        </div>
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full text-2xl font-black shrink-0"
          style={{ border: `3px solid ${color}`, color }}
        >
          {score}
        </div>
      </div>

      {/* Google SERP Preview */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid #2A2A2A" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#A5A5A5" }}>
          Google Önizleme
        </p>
        <div
          className="rounded-lg p-4"
          style={{ background: "#FFFFFF" }}
        >
          <p
            className="text-[18px] font-medium leading-snug mb-0.5"
            style={{ color: "#1558D6", fontFamily: "Arial, sans-serif" }}
          >
            {displayTitle.length > 60 ? displayTitle.slice(0, 57) + "..." : displayTitle}
          </p>
          <p className="text-[13px] mb-1" style={{ color: "#006621", fontFamily: "Arial, sans-serif" }}>
            {displayUrl.length > 70 ? displayUrl.slice(0, 67) + "..." : displayUrl}
          </p>
          <p className="text-[13px] leading-snug" style={{ color: "#545454", fontFamily: "Arial, sans-serif" }}>
            {truncDesc}
          </p>
        </div>
      </div>

      {/* Rules */}
      <div className="px-5 py-4 space-y-2">
        {rules.map((rule) => {
          const c = STATUS_COLORS[rule.status]
          return (
            <div
              key={rule.label}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}
            >
              <span
                className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                style={{ background: c.border, color: c.text }}
              >
                {c.badge}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold" style={{ color: "#F4F4F2" }}>{rule.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#A5A5A5" }}>{rule.detail}</p>
              </div>
              <span className="shrink-0 text-[11px] font-medium" style={{ color: "#A5A5A5" }}>
                {rule.points}/{rule.maxPoints}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
