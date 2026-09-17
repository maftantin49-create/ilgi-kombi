"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Suspense } from "react"

interface Props {
  currentPage: number
  totalPages: number
  total: number
}

function PaginationContent({ currentPage, totalPages, total }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p === 1) {
      params.delete("sayfa")
    } else {
      params.set("sayfa", String(p))
    }
    router.push(`/urunler?${params.toString()}`)
  }

  // Show up to 5 page numbers centered around current page
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const delta = 2
  const left = Math.max(1, currentPage - delta)
  const right = Math.min(totalPages, currentPage + delta)
  const pages = range(left, right)

  const btnBase =
    "w-9 h-9 rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-150"
  const btnActive = "text-[#090A0C] font-bold"
  const btnInactive = "text-[#5A5A5A] hover:text-[#E0E0DC]"

  return (
    <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
      <p className="text-sm" style={{ color: "#5A5A5A" }}>
        Sayfa {currentPage} / {totalPages} — {total} ürün
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Önceki sayfa"
          className={`${btnBase} ${btnInactive} disabled:opacity-30 disabled:cursor-not-allowed`}
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ChevronLeft size={16} />
        </button>

        {left > 1 && (
          <>
            <button
              onClick={() => goTo(1)}
              className={`${btnBase} ${btnInactive}`}
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              1
            </button>
            {left > 2 && (
              <span className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: "#3A3A3A" }}>
                …
              </span>
            )}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => goTo(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
            style={
              p === currentPage
                ? { background: "#D4A017", border: "1px solid #D4A017" }
                : { border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {p}
          </button>
        ))}

        {right < totalPages && (
          <>
            {right < totalPages - 1 && (
              <span className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: "#3A3A3A" }}>
                …
              </span>
            )}
            <button
              onClick={() => goTo(totalPages)}
              className={`${btnBase} ${btnInactive}`}
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Sonraki sayfa"
          className={`${btnBase} ${btnInactive} disabled:opacity-30 disabled:cursor-not-allowed`}
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default function UrunlerPagination(props: Props) {
  return (
    <Suspense fallback={null}>
      <PaginationContent {...props} />
    </Suspense>
  )
}
