"use client"

interface Props {
  name: string
  price: string
  compareAtPrice: string
  sku: string
  imageUrl: string | null
  isActive: boolean
  isFeatured: boolean
  isNew: boolean
  sameDayShipping: boolean
  brandName: string
}

function fmtPrice(val: string): string {
  const n = parseFloat(val)
  if (!val || isNaN(n)) return "—"
  return (
    n.toLocaleString("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " ₺"
  )
}

export function ProductPreviewCard({
  name,
  price,
  compareAtPrice,
  sku,
  imageUrl,
  isActive,
  isFeatured,
  isNew,
  sameDayShipping,
  brandName,
}: Props) {
  const priceNum = parseFloat(price)
  const compareNum = parseFloat(compareAtPrice)
  const hasDiscount = compareAtPrice && !isNaN(compareNum) && !isNaN(priceNum) && compareNum > priceNum
  const discountPct = hasDiscount ? Math.round((1 - priceNum / compareNum) * 100) : 0

  return (
    <div
      className="rounded-xl overflow-hidden select-none"
      style={{
        background: "#151618",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Image area */}
      <div
        className="relative"
        style={{ aspectRatio: "1", background: "#0D0E10" }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name || "Ürün görseli"}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "12px",
            }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "#374151", fontSize: "11px" }}
          >
            Görsel yok
          </div>
        )}

        {/* Status / feature badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && (
            <span
              className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ background: "#D4A017", color: "#090A0C", fontSize: "10px" }}
            >
              Yeni
            </span>
          )}
          {isFeatured && (
            <span
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{
                background: "rgba(212,160,23,0.12)",
                color: "#D4A017",
                border: "1px solid rgba(212,160,23,0.25)",
                fontSize: "10px",
              }}
            >
              Öne çıkan
            </span>
          )}
          {hasDiscount && (
            <span
              className="text-xs px-2 py-0.5 rounded font-bold"
              style={{ background: "#EF4444", color: "#fff", fontSize: "10px" }}
            >
              -%{discountPct}
            </span>
          )}
        </div>

        {/* Passive overlay */}
        {!isActive && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(9,10,12,0.55)" }}
          >
            <span
              style={{
                background: "rgba(239,68,68,0.15)",
                color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "9999px",
                padding: "3px 10px",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              Pasif
            </span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-3 space-y-1">
        {brandName && (
          <p style={{ fontSize: "10px", color: "#D4A017", fontWeight: 500 }}>{brandName}</p>
        )}

        <p
          className="leading-snug line-clamp-2"
          style={{
            fontSize: "12px",
            color: name ? "#F4F4F2" : "#374151",
            fontWeight: 500,
            minHeight: "2.4em",
          }}
        >
          {name || "Ürün adı girilmedi"}
        </p>

        {sku && (
          <p
            className="font-mono"
            style={{ fontSize: "10px", color: "#4B5563" }}
          >
            {sku}
          </p>
        )}

        <div className="flex items-baseline gap-2 pt-0.5">
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#F4F4F2" }}>
            {fmtPrice(price)}
          </span>
          {hasDiscount && (
            <span
              className="line-through"
              style={{ fontSize: "11px", color: "#4B5563" }}
            >
              {fmtPrice(compareAtPrice)}
            </span>
          )}
        </div>

        {sameDayShipping && (
          <p style={{ fontSize: "10px", color: "#34D399" }}>⚡ Aynı gün kargo</p>
        )}
      </div>
    </div>
  )
}
