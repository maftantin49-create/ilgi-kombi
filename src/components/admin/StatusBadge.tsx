export function StatusBadge({
  value,
  labels,
  styles,
  size = "md",
}: {
  value: string
  labels: Record<string, string>
  styles: Record<string, { color: string; bg: string }>
  size?: "sm" | "md"
}) {
  const s = styles[value] ?? { color: "#A5A5A5", bg: "rgba(165,165,165,0.08)" }
  return (
    <span
      style={{
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.color}33`,
        borderRadius: size === "sm" ? "4px" : "5px",
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        fontSize: size === "sm" ? "11px" : "12px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {labels[value] ?? value}
    </span>
  )
}
