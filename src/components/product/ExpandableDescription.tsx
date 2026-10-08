"use client"

import { useState, useRef, useEffect } from "react"

interface Props {
  text?: string
  html?: string
  maxLines?: number
}

export default function ExpandableDescription({ text, html, maxLines = 4 }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setClamped(el.scrollHeight > el.clientHeight + 2)
  }, [text, html])

  const clampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: maxLines,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  }

  return (
    <div>
      {html ? (
        <div
          ref={ref}
          className="prose prose-sm max-w-none text-gray-600 leading-relaxed transition-all duration-200"
          style={expanded ? undefined : clampStyle}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p
          ref={ref as React.RefObject<HTMLParagraphElement>}
          className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-600 transition-all duration-200"
          style={expanded ? undefined : clampStyle}
        >
          {text}
        </p>
      )}
      {(clamped || expanded) && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-1.5 text-[13px] font-semibold text-blue-700 hover:text-blue-900 transition-colors"
        >
          {expanded ? "Daha az göster" : "Devamını Oku"}
        </button>
      )}
    </div>
  )
}
