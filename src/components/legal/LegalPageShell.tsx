import React, { type ReactNode } from "react"

interface Props {
  category: string
  title: string
  lastUpdated: string
  children: ReactNode
}

export default function LegalPageShell({ category, title, lastUpdated, children }: Props) {
  return (
    <div className="bg-white min-h-screen">
      <div style={{ borderBottom: "1px solid #E2E6EA" }}>
        <div className="max-w-[820px] mx-auto px-6 py-12">
          <p style={{ color: "#2563EB", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
            {category}
          </p>
          <h1 style={{ color: "#111827", fontSize: 30, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
            {title}
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: 13 }}>Son güncelleme: {lastUpdated}</p>
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
    <h2 style={{ color: "#111827", fontSize: 18, fontWeight: 800, marginTop: 40, marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #E2E6EA" }}>
      {children}
    </h2>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ color: "#1E3A8A", fontSize: 14, fontWeight: 700, marginTop: 24, marginBottom: 8 }}>
      {children}
    </h3>
  )
}

export function Para({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.85, marginBottom: 12, ...style }}>
      {children}
    </p>
  )
}

export function InfoCard({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: "#F8F9FA",
      border: "1px solid #E2E6EA",
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
      <div style={{ color: "#9CA3AF", fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: "#111827", fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  )
}
