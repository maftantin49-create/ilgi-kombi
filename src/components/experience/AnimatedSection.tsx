"use client"

import { useRef, useEffect, useState, type ReactNode, type ElementType } from "react"

type Variant =
  | "fade-up"
  | "fade-in"
  | "slide-left"
  | "slide-right"
  | "scale-in"
  | "stagger-children"

interface Props extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode
  variant?: Variant
  delay?: number
  duration?: number
  as?: ElementType
  threshold?: number
}

const initialStyles: Record<Variant, React.CSSProperties> = {
  "fade-up": { opacity: 0, transform: "translateY(24px)" },
  "fade-in": { opacity: 0 },
  "slide-left": { opacity: 0, transform: "translateX(-28px)" },
  "slide-right": { opacity: 0, transform: "translateX(28px)" },
  "scale-in": { opacity: 0, transform: "scale(0.94)" },
  "stagger-children": {},
}

const activeStyles: Record<Variant, React.CSSProperties> = {
  "fade-up": { opacity: 1, transform: "translateY(0)" },
  "fade-in": { opacity: 1 },
  "slide-left": { opacity: 1, transform: "translateX(0)" },
  "slide-right": { opacity: 1, transform: "translateX(0)" },
  "scale-in": { opacity: 1, transform: "scale(1)" },
  "stagger-children": {},
}

export default function AnimatedSection({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 550,
  className = "",
  as: Tag = "div",
  threshold = 0.12,
  ...rest
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  // Lazy init: read once on client, avoid SSR mismatch for 99%+ users
  const [prefersReduced] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  useEffect(() => {
    if (prefersReduced) return // styles resolve to {} — no observer needed

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true) // inside callback — not a synchronous effect setState
          observer.disconnect()
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReduced, threshold])

  const El = Tag as React.ElementType

  const currentStyle: React.CSSProperties = prefersReduced
    ? {}
    : visible
    ? {
        ...activeStyles[variant],
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }
    : { ...initialStyles[variant] }

  return (
    <El ref={ref} className={className} style={currentStyle} {...rest}>
      {children}
    </El>
  )
}

/** Stagger wrapper for children — applies incremental delays */
export function StaggerChildren({
  children,
  stagger = 60,
  delay = 0,
  className = "",
  threshold = 0.1,
}: {
  children: ReactNode[]
  stagger?: number
  delay?: number
  className?: string
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [prefersReduced] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  useEffect(() => {
    if (prefersReduced) return

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true) // inside callback — ok
          observer.disconnect()
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReduced, threshold])

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          style={prefersReduced ? {} : {
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 500ms ease ${delay + i * stagger}ms, transform 500ms cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}ms`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
