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
        background: "#FFFFFF",
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "28px",
          height: "28px",
          border: "2px solid rgba(37,99,235,0.15)",
          borderTopColor: "#2563EB",
          borderRadius: "50%",
        }}
      />
      <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Yükleniyor…</p>
    </div>
  )
}
