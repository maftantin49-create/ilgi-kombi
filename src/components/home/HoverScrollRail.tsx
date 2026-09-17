"use client"

import { useRef, useEffect } from "react"

// ── Tek hız sabiti — tüm ana sayfa ürün vitrinlerini buradan ayarla ──────────
// Birimi: piksel / saniye (otomatik scroll hızı)
const SCROLL_SPEED_PX_S = 30

interface HoverScrollRailProps {
  children: React.ReactNode
  className?: string
  "aria-label"?: string
  autoScroll?: boolean
}

/**
 * Desktop hover-triggered infinite auto-scroll rail.
 *
 * - Desktop: mouse enter → sağdan sola akıcı scroll; mouse leave → duraklama.
 *   Tekrar hover: kaldığı yerden devam eder.
 * - Mobile/touch: bu component yalnız desktop'ta kullanılır (`hidden md:flex`);
 *   mobile swipe üst katmanda native overflow-x:auto ile ayrıca sağlanır.
 * - Reduced-motion: `prefers-reduced-motion: reduce` aktifse otomatik scroll yok;
 *   statik layout korunur.
 * - Visibility API: sayfa/sekme gizlendiğinde scroll durur.
 * - ResizeObserver: orijinal içerik viewport'a sığıyorsa scroll çalışmaz;
 *   resize sonrası yeniden değerlendirilir.
 * - RAF + deltaTime: 60Hz / 120Hz ekranlarda yaklaşık aynı hız.
 * - scrollLeft + overflow-x:hidden: layout recalc yok, GPU transform değil.
 *
 * Sonsuz loop için caller, children'ı iki kez render eder (original + clone).
 * Clone wrapper'larında `aria-hidden="true"` ekstra erişilebilirlik için gerekli.
 */
export default function HoverScrollRail({
  children,
  className = "",
  "aria-label": ariaLabel,
  autoScroll = true,
}: HoverScrollRailProps) {
  const railRef           = useRef<HTMLDivElement>(null)
  const lastTsRef         = useRef<number | null>(null)
  const canScrollRef      = useRef(false)
  const reducedMotionRef  = useRef(false)
  const rafRef            = useRef<number | null>(null)

  // ── prefers-reduced-motion sync ──────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionRef.current = mq.matches
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches
    }
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // ── RAF animation loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoScroll) return

    const tick = (ts: number) => {
      const rail = railRef.current

      if (
        rail &&
        canScrollRef.current &&
        !reducedMotionRef.current
      ) {
        if (lastTsRef.current !== null) {
          // Sekme geçişi sonrası büyük delta sıçramasını önle (max 100 ms)
          const delta     = Math.min((ts - lastTsRef.current) / 1000, 0.1)
          const halfWidth = rail.scrollWidth / 2

          if (halfWidth > 0) {
            rail.scrollLeft += SCROLL_SPEED_PX_S * delta

            // Seamless loop: orijinal kopya bitince klon setine seamless geçiş.
            // scroll-behavior:auto ile bu reset kullanıcıya görünmez.
            if (rail.scrollLeft >= halfWidth) {
              rail.scrollLeft -= halfWidth
            }
          }
        }
        lastTsRef.current = ts
      } else {
        // Scroll aktif değil — timestamp'i sıfırla; sonraki hover'da delta sıfırdan başlar
        lastTsRef.current = null
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [autoScroll])

  // ── ResizeObserver: overflow kontrolü ────────────────────────────────────
  useEffect(() => {
    if (!autoScroll) return
    const rail = railRef.current
    if (!rail) return

    const check = () => {
      canScrollRef.current = rail.scrollWidth / 2 > rail.clientWidth + 1
    }
    check()

    const ro = new ResizeObserver(check)
    ro.observe(rail)
    return () => ro.disconnect()
  }, [autoScroll])

  // ── Page Visibility API: sekme gizlenince scroll dur ─────────────────────
  useEffect(() => {
    if (!autoScroll) return
    const onVisibility = () => {
      if (document.hidden) {
        lastTsRef.current = null
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [autoScroll])

  return (
    <div
      ref={railRef}
      aria-label={ariaLabel}
      className={className}
      style={autoScroll
        ? ({ overflowX: "hidden", scrollBehavior: "auto" } as React.CSSProperties)
        : ({ overflowX: "auto", scrollBehavior: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties)
      }
    >
      {children}
    </div>
  )
}
