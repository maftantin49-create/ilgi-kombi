// Admin panel içerik alanı için yükleme iskelet ekranı
// AdminSidebar + AdminTopbar (layout.tsx) zaten render edilmiş olur
// Bu dosya yalnızca <main> alanını kapsar
export default function AdminLoading() {
  return (
    <div>
      {/* Sayfa başlığı iskeleti */}
      <div style={{ marginBottom: "24px" }}>
        <div
          className="animate-pulse"
          style={{
            height: "22px",
            width: "200px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "4px",
            marginBottom: "8px",
          }}
        />
        <div
          className="animate-pulse"
          style={{
            height: "13px",
            width: "140px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* Filtre satırı iskeleti */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        {[160, 120, 100].map((w, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              height: "34px",
              width: `${w}px`,
              background: "rgba(255,255,255,0.05)",
              borderRadius: "6px",
            }}
          />
        ))}
      </div>

      {/* Tablo iskeleti */}
      <div
        style={{
          background: "#151618",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        {/* Tablo başlığı */}
        <div
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "10px 16px",
            display: "flex",
            gap: "24px",
          }}
        >
          {[80, 140, 100, 80, 60].map((w, i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: "12px",
                width: `${w}px`,
                background: "rgba(255,255,255,0.05)",
                borderRadius: "3px",
              }}
            />
          ))}
        </div>

        {/* Tablo satırları */}
        {Array.from({ length: 7 }).map((_, row) => (
          <div
            key={row}
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              display: "flex",
              gap: "24px",
              alignItems: "center",
            }}
          >
            {[80, 140, 100, 80, 60].map((w, col) => (
              <div
                key={col}
                className="animate-pulse"
                style={{
                  height: "12px",
                  width: `${w + (row % 3) * 10}px`,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "3px",
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
