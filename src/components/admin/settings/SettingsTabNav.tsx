import Link from "next/link"
import type { TabKey } from "@/lib/admin/schemas/settings"

const TABS: { key: TabKey; label: string }[] = [
  { key: "general",      label: "Genel" },
  { key: "company",      label: "Firma" },
  { key: "seo",          label: "SEO" },
  { key: "social",       label: "Sosyal Medya" },
  { key: "order_config", label: "Sipariş" },
  { key: "stock_config", label: "Stok" },
  { key: "mail",         label: "Mail" },
  { key: "security",     label: "Güvenlik" },
  { key: "integrations", label: "Entegrasyonlar" },
]

export default function SettingsTabNav({ activeTab }: { activeTab: TabKey }) {
  return (
    <nav
      style={{
        width: "180px",
        flexShrink: 0,
        background: "#101114",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        padding: "8px",
      }}
    >
      {TABS.map(({ key, label }) => {
        const isActive = key === activeTab
        return (
          <Link
            key={key}
            href={`/admin/settings?tab=${key}`}
            style={{
              display: "block",
              padding: "9px 12px",
              marginBottom: "2px",
              borderRadius: "5px",
              fontSize: "13px",
              color:      isActive ? "#D4A017" : "#A5A5A5",
              background: isActive ? "rgba(212,160,23,0.08)" : "transparent",
              fontWeight: isActive ? 500 : 400,
              textDecoration: "none",
              borderLeft: isActive
                ? "2px solid #D4A017"
                : "2px solid transparent",
              transition: "color 0.12s, background 0.12s",
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
