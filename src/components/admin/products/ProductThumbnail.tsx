"use client"

import { useState } from "react"
import { Package } from "lucide-react"

export interface ProductThumbnailProps {
  src?: string | null
  alt: string
  size?: number
  preview?: boolean
}

function Placeholder({ size, title }: { size: number; title: string }) {
  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 6,
        background: "rgba(255,255,255,0.02)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#2D3139",
        flexShrink: 0,
      }}
    >
      <Package size={Math.round(size * 0.33)} />
    </div>
  )
}

export function ProductThumbnail({
  src,
  alt,
  size = 48,
  preview = true,
}: ProductThumbnailProps) {
  const [broken, setBroken] = useState(false)
  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src)

  // Render-time derived state: reset broken when src changes.
  // React explicitly supports calling setState during render when tracking prev props.
  // This avoids the extra render cycle that useEffect would introduce.
  if (src !== prevSrc) {
    setPrevSrc(src)
    setBroken(false)
  }

  if (!src || broken) {
    return <Placeholder size={size} title="Görsel yok" />
  }

  return (
    <div
      className={preview ? "relative group" : "relative"}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: size,
          height: size,
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 6,
          background: "#17191b",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          width={size}
          height={size}
          onError={() => setBroken(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Hover preview — CSS only, no layout shift, disabled on touch */}
      {preview && (
        <div
          className="absolute z-50 hidden group-hover:block"
          style={{
            left: size + 8,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            style={{
              width: 192,
              height: 192,
              objectFit: "contain",
              background: "#151618",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
              display: "block",
            }}
          />
        </div>
      )}
    </div>
  )
}
