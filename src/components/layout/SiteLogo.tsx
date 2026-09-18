"use client"

import Image from "next/image"
import { useState } from "react"

interface Props {
  siteName: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

// Renders /brand/logo.png when available; falls back to styled text when the
// file is missing (pre-logo state). Drop a real logo.png to replace instantly.
export default function SiteLogo({ siteName, width, height, className, priority }: Props) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <span
        className="font-black tracking-tight text-white leading-none select-none"
        style={{ fontSize: height * 0.45 }}
        aria-label={siteName}
      >
        {siteName}
      </span>
    )
  }

  return (
    <Image
      src="/brand/logo.png"
      alt={siteName}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setImgError(true)}
    />
  )
}
