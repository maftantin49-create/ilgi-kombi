"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useRef, useTransition } from "react"
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUSES } from "@/lib/admin/schemas/order"
import type { PaymentStatus } from "@/types/database.types"

export default function PaymentFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const orderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pidDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const inputStyle = {
    background: "#111214",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#F4F4F2",
    borderRadius: "6px",
    padding: "7px 10px",
    fontSize: "13px",
    outline: "none",
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="search"
        placeholder="Sipariş numarası..."
        defaultValue={searchParams.get("order") ?? ""}
        onChange={(e) => {
          if (orderDebounceRef.current) clearTimeout(orderDebounceRef.current)
          orderDebounceRef.current = setTimeout(() => updateParam("order", e.target.value), 350)
        }}
        style={{ ...inputStyle, minWidth: "180px" }}
      />

      <input
        type="search"
        placeholder="Provider payment ID..."
        defaultValue={searchParams.get("pid") ?? ""}
        onChange={(e) => {
          if (pidDebounceRef.current) clearTimeout(pidDebounceRef.current)
          pidDebounceRef.current = setTimeout(() => updateParam("pid", e.target.value), 350)
        }}
        style={{ ...inputStyle, minWidth: "180px" }}
      />

      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        style={{ ...inputStyle, paddingRight: "28px" }}
      >
        <option value="">Tüm durumlar</option>
        <option value="__success">Başarılı</option>
        <option value="__failed">Başarısız (failed + cancelled)</option>
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PAYMENT_STATUS_LABELS[s as PaymentStatus]}
          </option>
        ))}
      </select>

      <input
        type="search"
        placeholder="Provider (manual...)"
        defaultValue={searchParams.get("provider") ?? ""}
        onChange={(e) => {
          if (orderDebounceRef.current) clearTimeout(orderDebounceRef.current)
          orderDebounceRef.current = setTimeout(() => updateParam("provider", e.target.value), 350)
        }}
        style={{ ...inputStyle, minWidth: "140px" }}
      />

      <input
        type="date"
        defaultValue={searchParams.get("from") ?? ""}
        onChange={(e) => updateParam("from", e.target.value)}
        style={{ ...inputStyle, colorScheme: "dark" }}
        title="Başlangıç tarihi"
      />

      <input
        type="date"
        defaultValue={searchParams.get("to") ?? ""}
        onChange={(e) => updateParam("to", e.target.value)}
        style={{ ...inputStyle, colorScheme: "dark" }}
        title="Bitiş tarihi"
      />
    </div>
  )
}
