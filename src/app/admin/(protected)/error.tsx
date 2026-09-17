"use client"

import { useEffect } from "react"

// AdminSidebar + AdminTopbar görünür kalır
// Bu component yalnızca <main> içerik alanında render edilir
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[AdminError]", error)
  }, [error])

  return (
    <div
      style={{
        background: "#151618",
        border: "1px solid rgba(248,113,113,0.2)",
        borderRadius: "8px",
        padding: "32px 28px",
        maxWidth: "520px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          background: "rgba(248,113,113,0.08)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          marginBottom: "16px",
        }}
      >
        ⚠
      </div>

      <h2
        style={{
          color: "#F4F4F2",
          fontSize: "16px",
          fontWeight: 600,
          marginBottom: "8px",
        }}
      >
        Sayfa yüklenemedi
      </h2>

      <p
        style={{
          color: "#A5A5A5",
          fontSize: "13px",
          lineHeight: 1.6,
          marginBottom: error.digest ? "4px" : "20px",
        }}
      >
        Beklenmedik bir hata oluştu. Sayfayı yeniden yükleyebilirsiniz.
      </p>

      {error.digest && (
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: "#555",
            marginBottom: "20px",
          }}
        >
          digest: {error.digest}
        </p>
      )}

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          onClick={reset}
          style={{
            background: "#D4A017",
            color: "#090A0C",
            fontWeight: 600,
            fontSize: "13px",
            padding: "8px 20px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Tekrar Dene
        </button>
        <a
          href="/admin"
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "13px",
            color: "#A5A5A5",
            padding: "8px 20px",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Dashboard&apos;a Dön
        </a>
      </div>
    </div>
  )
}
