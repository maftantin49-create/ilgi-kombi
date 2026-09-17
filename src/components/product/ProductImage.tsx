"use client"

import Image from "next/image"
import { useState } from "react"

interface Props {
  src: string
  alt: string
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
}

export default function ProductImage({ src, alt, fill, className, sizes, priority }: Props) {
  const [error, setError] = useState(false)

  return (
    <Image
      src={error ? "/images/product-placeholder.svg" : src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
