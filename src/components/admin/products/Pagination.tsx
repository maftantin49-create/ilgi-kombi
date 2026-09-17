"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"

interface Props {
  count: number
  pageSize: number
  currentPage: number
  paramName?: string
  label?: string
}

export default function Pagination({
  count,
  pageSize,
  currentPage,
  paramName = "page",
  label = "ürün",
}: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const totalPages = Math.ceil(count / pageSize)

  if (totalPages <= 1) return null

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramName, String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs" style={{ color: "#A5A5A5" }}>
        Toplam <span style={{ color: "#F4F4F2" }}>{count}</span> {label} —{" "}
        sayfa{" "}
        <span style={{ color: "#F4F4F2" }}>
          {currentPage}/{totalPages}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded text-sm transition-opacity disabled:opacity-30 hover:opacity-80"
          style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#F4F4F2" }}
        >
          ← Önceki
        </button>

        {/* Page number chips */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              Math.abs(p - currentPage) <= 1
          )
          .reduce<(number | "...")[]>((acc, p, i, arr) => {
            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...")
            acc.push(p)
            return acc
          }, [])
          .map((item, i) =>
            item === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs" style={{ color: "#A5A5A5" }}>
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => goToPage(item as number)}
                className="w-8 h-8 rounded text-sm transition-opacity hover:opacity-80"
                style={{
                  background:
                    item === currentPage ? "#D4A017" : "transparent",
                  color: item === currentPage ? "#090A0C" : "#F4F4F2",
                  border:
                    item === currentPage
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                  fontWeight: item === currentPage ? 600 : 400,
                }}
              >
                {item}
              </button>
            )
          )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded text-sm transition-opacity disabled:opacity-30 hover:opacity-80"
          style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#F4F4F2" }}
        >
          Sonraki →
        </button>
      </div>
    </div>
  )
}
