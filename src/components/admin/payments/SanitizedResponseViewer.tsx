import { redactSensitive } from "@/lib/admin/payments"

interface Props {
  data: unknown
}

// Server component — redaction and rendering happen server-side only.
// Raw sanitized_response is never passed to the client.
export default function SanitizedResponseViewer({ data }: Props) {
  if (data === null || data === undefined) {
    return (
      <p style={{ fontSize: "13px", color: "#A5A5A5", fontStyle: "italic" }}>
        Bu ödeme için yanıt kaydı yok
      </p>
    )
  }

  const redacted = redactSensitive(data)
  const formatted = JSON.stringify(redacted, null, 2)

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            color: "#D4A017",
            background: "rgba(212,160,23,0.1)",
            border: "1px solid rgba(212,160,23,0.25)",
            borderRadius: "3px",
            padding: "2px 7px",
            fontWeight: 500,
          }}
        >
          Hassas alanlar redakte edildi
        </span>
        <span style={{ fontSize: "11px", color: "#A5A5A5" }}>
          token · cardNumber · pan · cvv · signature ve diğerleri gizlendi
        </span>
      </div>
      <pre
        style={{
          background: "#0d0e10",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "6px",
          padding: "14px",
          fontSize: "12px",
          lineHeight: "1.6",
          color: "#A5A5A5",
          overflowX: "auto",
          maxHeight: "480px",
          overflowY: "auto",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {formatted}
      </pre>
    </div>
  )
}
