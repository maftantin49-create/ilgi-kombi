"use client"

import Link from "next/link"
import { useEffect } from "react"

// Header + Footer görünür kalır — bu component yalnızca <main> alanında render edilir
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[PublicError]", error)
  }, [error])

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        background: "#FFFFFF",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "440px" }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            margin: "0 auto 20px",
            color: "#EF4444",
          }}
        >
          !
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "10px",
          }}
        >
          Sayfa yüklenemedi
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            marginBottom: "28px",
            lineHeight: 1.65,
          }}
        >
          Beklenmedik bir hata oluştu. Sayfayı yenileyebilir veya ana sayfaya
          dönebilirsiniz.
          {error.digest && (
            <span
              style={{
                display: "block",
                fontFamily: "monospace",
                fontSize: "11px",
                marginTop: "10px",
                color: "#9CA3AF",
              }}
            >
              Hata kodu: {error.digest}
            </span>
          )}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={reset}
            style={{
              background: "#1E3A8A",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "0.04em",
              padding: "11px 22px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "13px",
              fontWeight: 500,
              color: "#6B7280",
              padding: "11px 22px",
              border: "1px solid #E2E6EA",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            Ana Sayfa
          </Link>
        </div>
      </div>
    </div>
  )
}
