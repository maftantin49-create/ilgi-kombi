"use client"

import { useEffect } from "react"

/**
 * Sets --pointer-x and --pointer-y (0–1 normalized) on :root.
 * Runs only on pointer:fine (desktop). No React state — zero re-renders.
 * Touch devices and reduced-motion: no-op.
 */
export default function PointerTracker() {
  useEffect(() => {
    const noPointer = !window.matchMedia("(pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (noPointer || reduced) return

    let rafId = 0
    let px = 0.5
    let py = 0.5

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        px = e.clientX / window.innerWidth
        py = e.clientY / window.innerHeight
        const root = document.documentElement
        root.style.setProperty("--pointer-x", px.toFixed(4))
        root.style.setProperty("--pointer-y", py.toFixed(4))
      })
    }

    document.addEventListener("pointermove", onMove, { passive: true })

    // Set initial neutral values
    document.documentElement.style.setProperty("--pointer-x", "0.5")
    document.documentElement.style.setProperty("--pointer-y", "0.5")

    return () => {
      document.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}
