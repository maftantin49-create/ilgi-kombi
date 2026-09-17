"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useRef, useTransition } from "react"
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from "@/lib/admin/schemas/order"
import type { OrderStatus, PaymentStatus } from "@/types/database.types"

export default function OrderFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateParam("q", value), 350)
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

  const selectStyle = { ...inputStyle, paddingRight: "28px" }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="search"
        placeholder="Sipariş no / e-posta / telefon"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ ...inputStyle, minWidth: "220px" }}
      />

      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => updateParam("status", e.target.value)}
        style={selectStyle}
      >
        <option value="">Tüm sipariş durumları</option>
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s as OrderStatus]}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("payment") ?? ""}
        onChange={(e) => updateParam("payment", e.target.value)}
        style={selectStyle}
      >
        <option value="">Tüm ödeme durumları</option>
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PAYMENT_STATUS_LABELS[s as PaymentStatus]}
          </option>
        ))}
      </select>

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
