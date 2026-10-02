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
  const btnInactive = "text-gray-500 hover:text-blue-700 hover:bg-blue-50"

  return (
    <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
      <p className="text-sm text-gray-400">
        Sayfa {currentPage} / {totalPages} — {total} ürün
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Önceki sayfa"
          className={`${btnBase} ${btnInactive} disabled:opacity-30 disabled:cursor-not-allowed`}
          style={{ border: "1px solid #E2E6EA" }}
        >
          <ChevronLeft size={16} />
        </button>

        {left > 1 && (
          <>
            <button
              onClick={() => goTo(1)}
              className={`${btnBase} ${btnInactive}`}
              style={{ border: "1px solid #E2E6EA" }}
            >
              1
            </button>
            {left > 2 && (
              <span className="w-9 h-9 flex items-center justify-center text-sm text-gray-300">
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
            className={`${btnBase} ${p === currentPage ? "text-white font-bold" : btnInactive}`}
            style={
              p === currentPage
                ? { background: "#1E3A8A", border: "1px solid #1E3A8A" }
                : { border: "1px solid #E2E6EA" }
            }
          >
            {p}
          </button>
        ))}

        {right < totalPages && (
          <>
            {right < totalPages - 1 && (
              <span className="w-9 h-9 flex items-center justify-center text-sm text-gray-300">
                …
              </span>
            )}
            <button
              onClick={() => goTo(totalPages)}
              className={`${btnBase} ${btnInactive}`}
              style={{ border: "1px solid #E2E6EA" }}
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
          style={{ border: "1px solid #E2E6EA" }}
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
