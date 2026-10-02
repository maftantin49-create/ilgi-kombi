"use client"

// Root layout seviyesinde hatalar için — kendi html/body'sini render etmek zorunda
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          background: "#FFFFFF",
          color: "#111827",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "rgba(248,113,113,0.1)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              margin: "0 auto 20px",
            }}
          >
            ⚠
          </div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "8px",
              color: "#111827",
            }}
          >
            Kritik bir hata oluştu
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "#6B7280",
              marginBottom: "24px",
              lineHeight: 1.6,
            }}
          >
            Sayfa yüklenirken beklenmedik bir sorun meydana geldi.
            {error.digest && (
              <span
                style={{
                  display: "block",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  marginTop: "8px",
                  color: "#9CA3AF",
                }}
              >
                digest: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            style={{
              background: "#1E3A8A",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "13px",
              padding: "10px 24px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 14px rgba(30,58,138,0.20)",
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  )
}
