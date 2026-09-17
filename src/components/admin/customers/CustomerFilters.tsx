"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useRef, useTransition } from "react"

export default function CustomerFilters() {
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

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="search"
        placeholder="Ad, soyad, e-posta, telefon, şirket..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ ...inputStyle, minWidth: "240px" }}
      />

      <select
        defaultValue={searchParams.get("guest") ?? ""}
        onChange={(e) => updateParam("guest", e.target.value)}
        style={{ ...inputStyle, paddingRight: "28px" }}
      >
        <option value="">Tüm müşteriler</option>
        <option value="false">Kayıtlı</option>
        <option value="true">Misafir</option>
      </select>

      <select
        defaultValue={searchParams.get("orders") ?? ""}
        onChange={(e) => updateParam("orders", e.target.value)}
        style={{ ...inputStyle, paddingRight: "28px" }}
      >
        <option value="">Sipariş durumu (tümü)</option>
        <option value="yes">Siparişi var</option>
        <option value="no">Sipariş yok</option>
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
