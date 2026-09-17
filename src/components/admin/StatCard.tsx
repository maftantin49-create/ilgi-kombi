import type { ReactNode } from "react"

interface StatCardProps {
  label: string
  value: number
  icon?: ReactNode
  variant?: "default" | "warning" | "danger"
}

export default function StatCard({ label, value, icon, variant = "default" }: StatCardProps) {
  const accentColor =
    variant === "danger"  ? "#EF4444" :
    variant === "warning" ? "#FBBF24" :
    "#D4A017"

  return (
    <div
      className="rounded-lg p-5"
      style={{ background: "#151618", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm" style={{ color: "#A5A5A5" }}>{label}</p>
        {icon && <span style={{ color: accentColor }}>{icon}</span>}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: accentColor }}>
        {value.toLocaleString("tr-TR")}
      </p>
    </div>
  )
}
