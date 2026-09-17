// Public sayfaları için genel yükleme ekranı
// Header + Footer zaten render edilmiş olur — bu yalnızca <main> alanını kapsar
export default function PublicLoading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "#090A0C",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "28px",
          height: "28px",
          border: "2px solid rgba(212,160,23,0.15)",
          borderTopColor: "#D4A017",
          borderRadius: "50%",
        }}
      />
      <p style={{ fontSize: "13px", color: "#A5A5A5" }}>Yükleniyor…</p>
    </div>
  )
}
