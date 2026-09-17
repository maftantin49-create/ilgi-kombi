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
        background: "#090A0C",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "440px" }}>
        <div
          style={{
            width: "52px",
            height: "52px",
            background: "rgba(212,160,23,0.08)",
            border: "1px solid rgba(212,160,23,0.2)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            margin: "0 auto 20px",
          }}
        >
          !
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#F4F4F2",
            marginBottom: "10px",
          }}
        >
          Sayfa yüklenemedi
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "#A5A5A5",
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
                color: "#444",
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
              background: "#D4A017",
              color: "#090A0C",
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
              color: "#A5A5A5",
              padding: "11px 22px",
              border: "1px solid rgba(255,255,255,0.1)",
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
