"use client"

import { useEffect, useRef } from "react"

type Pattern = "pcb" | "circuit" | "pipe" | "fan" | "pump" | "sensor"

interface Props {
  pattern?: Pattern
  accentColor?: string
  opacity?: number
  className?: string
}

const PATHS: Record<Pattern, string[]> = {
  pcb: [
    "M 40 20 L 40 60 L 120 60 L 120 40 L 200 40",
    "M 80 100 L 80 60 L 160 60 L 160 100 L 240 100",
    "M 20 140 L 100 140 L 100 120 L 180 120 L 180 160 L 260 160",
    "M 300 20 L 300 80 L 220 80 L 220 120",
    "M 260 40 L 340 40 L 340 100",
  ],
  circuit: [
    "M 10 50 L 50 50 L 50 30 L 90 30 L 90 50 L 130 50 L 130 70 L 170 70",
    "M 10 90 L 40 90 L 40 110 L 80 110 L 80 90 L 120 90 L 120 130 L 160 130",
    "M 200 20 L 200 60 L 240 60 L 240 40 L 280 40 L 280 80 L 320 80",
    "M 60 150 L 100 150 L 100 170 L 140 170 L 140 150 L 180 150",
  ],
  pipe: [
    "M 20 80 L 100 80 Q 120 80 120 60 L 120 20",
    "M 160 20 L 160 60 Q 160 80 180 80 L 280 80 Q 300 80 300 100 L 300 160",
    "M 60 160 L 60 120 Q 60 100 80 100 L 140 100",
    "M 220 120 L 220 160 L 320 160",
  ],
  fan: [
    "M 160 100 L 160 20",
    "M 160 100 L 225 55",
    "M 160 100 L 240 100",
    "M 160 100 L 225 145",
    "M 160 100 L 160 180",
    "M 160 100 L 95 145",
    "M 160 100 L 80 100",
    "M 160 100 L 95 55",
    "M 100 100 m 60 0 a 60 60 0 1 0 0.01 0",
  ],
  pump: [
    "M 80 120 Q 80 80 120 80 L 200 80 Q 240 80 240 120",
    "M 80 120 Q 80 160 120 160 L 200 160 Q 240 160 240 120",
    "M 160 80 L 160 40",
    "M 160 160 L 160 200",
    "M 40 120 L 80 120",
    "M 240 120 L 280 120",
  ],
  sensor: [
    "M 120 160 L 120 80 L 160 80 L 160 40",
    "M 200 160 L 200 80 L 160 80",
    "M 80 120 L 120 120",
    "M 200 120 L 240 120",
    "M 160 20 L 160 40",
    "M 140 160 L 180 160",
    "M 100 80 L 120 80",
    "M 200 80 L 220 80",
  ],
}

const DOTS: Record<Pattern, [number, number][]> = {
  pcb: [[40,60],[120,40],[160,60],[80,100],[180,120]],
  circuit: [[50,50],[90,30],[130,70],[80,110],[140,130]],
  pipe: [[120,60],[160,60],[300,100],[60,120],[80,100]],
  fan: [[160,100]],
  pump: [[160,80],[160,160],[80,120],[240,120]],
  sensor: [[160,80],[120,120],[200,120],[160,40]],
}

export default function TechnicalLineLayer({
  pattern = "pcb",
  accentColor = "#ffffff",
  opacity = 0.06,
  className = "",
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      svg.querySelectorAll("path").forEach((p) => {
        p.style.strokeDashoffset = "0"
      })
      return
    }

    const paths = svg.querySelectorAll<SVGPathElement>("path[data-animate]")
    paths.forEach((path, i) => {
      const len = path.getTotalLength()
      path.style.strokeDasharray = String(len)
      path.style.strokeDashoffset = String(len)
      path.style.transition = `stroke-dashoffset 1200ms cubic-bezier(0.4,0,0.2,1) ${i * 120}ms`
      requestAnimationFrame(() => {
        path.style.strokeDashoffset = "0"
      })
    })
  }, [pattern])

  const paths = PATHS[pattern] ?? PATHS.pcb
  const dots = DOTS[pattern] ?? []

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 200"
      className={`pointer-events-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          strokeLinecap="round"
          data-animate="true"
        />
      ))}
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill={accentColor} opacity="0.6" />
      ))}
    </svg>
  )
}
