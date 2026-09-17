import React, { type ReactNode } from "react"

interface Props {
  category: string
  title: string
  lastUpdated: string
  children: ReactNode
}

export default function LegalPageShell({ category, title, lastUpdated, children }: Props) {
  return (
    <div style={{ background: "#090A0C", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-[820px] mx-auto px-6 py-12">
          <p style={{ color: "#D4A534", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
            {category}
          </p>
          <h1 style={{ color: "#F4F4F2", fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
            {title}
          </h1>
          <p style={{ color: "#5A5A5A", fontSize: 13 }}>Son güncelleme: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-[820px] mx-auto px-6 py-12 space-y-0">
        {children}
      </div>
    </div>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ color: "#F4F4F2", fontSize: 18, fontWeight: 800, marginTop: 40, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      {children}
    </h2>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ color: "#D4A534", fontSize: 14, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>
      {children}
    </h3>
  )
}

export function Para({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ color: "#A0A0A0", fontSize: 14, lineHeight: 1.85, marginBottom: 12, ...style }}>
      {children}
    </p>
  )
}

export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: "#111111",
      border: "1px solid rgba(212,165,52,0.18)",
      borderRadius: 14,
      padding: "20px 24px",
      marginBottom: 24,
    }}>
      {children}
    </div>
  )
}

// Renders a label+value row only when value is non-empty. Used in identity grids.
export function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div>
      <div style={{ color: "#5A5A5A", fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: "#E8E8E2", fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  )
}
