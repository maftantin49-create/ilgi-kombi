// Shared UI primitives for settings tab forms — no directive (used only by "use client" tabs)
import type { ActionState } from "@/lib/admin/schemas/product"

export const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111214",
  border: "1px solid rgba(255,255,255,0.07)",
  color: "#F4F4F2",
  padding: "8px 12px",
  borderRadius: "6px",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
}

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "#A5A5A5",
  marginBottom: "4px",
  fontWeight: 500,
}

export const hintStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#555",
  marginBottom: "4px",
}

export const fieldStyle: React.CSSProperties = {
  marginBottom: "16px",
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return (
    <p style={{ fontSize: "11px", color: "#f87171", marginTop: "4px" }}>
      {errors[0]}
    </p>
  )
}

export function SaveBar({ state, isPending }: { state: ActionState; isPending: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        paddingTop: "4px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        marginTop: "20px",
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        style={{
          background:  isPending ? "rgba(212,160,23,0.4)" : "#D4A017",
          color:       "#090A0C",
          fontWeight:  600,
          fontSize:    "13px",
          padding:     "8px 20px",
          borderRadius: "6px",
          border:      "none",
          cursor:      isPending ? "not-allowed" : "pointer",
          transition:  "background 0.15s",
        }}
      >
        {isPending ? "Kaydediliyor…" : "Kaydet"}
      </button>
      {state.message && (
        <span style={{ fontSize: "13px", color: state.success ? "#4ade80" : "#f87171" }}>
          {state.message}
        </span>
      )}
    </div>
  )
}

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#151618",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          fontSize: "12px",
          fontWeight: 600,
          color: "#A5A5A5",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  )
}
