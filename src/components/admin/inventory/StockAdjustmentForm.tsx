"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import {
  INITIAL_STATE,
  type ActionState,
} from "@/lib/admin/schemas/inventory"
import type { ProductStockDetail } from "@/lib/admin/inventory"

type Operation = "add" | "remove" | "adjust"

const OPERATION_OPTIONS: { value: Operation; label: string; desc: string }[] = [
  {
    value: "add",
    label: "Stok Ekle",
    desc: "Mevcut stoğa ekle (örn. yeni sevkiyat)",
  },
  {
    value: "remove",
    label: "Stok Azalt",
    desc: "Kullanılabilir stoktan düş (hasar, kayıp vb.)",
  },
  {
    value: "adjust",
    label: "Düzeltme",
    desc: "Stoğu belirtilen mutlak değere ayarla",
  },
]

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
const inputStyle = {
  background: "#111214",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#F4F4F2",
}

interface Props {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  product: ProductStockDetail
}

export function StockAdjustmentForm({ action, product }: Props) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)
  const [operation, setOperation] = useState<Operation>("add")

  function fieldError(field: string) {
    return state.fieldErrors?.[field]?.[0]
  }

  const quantityLabel =
    operation === "adjust" ? "Yeni Stok Miktarı" : "Miktar"

  const quantityHelp = {
    add: "Bu miktar mevcut stoğa eklenecek.",
    remove: `Kullanılabilir stok: ${product.available_stock} adet`,
    adjust: `Mevcut fiziksel stok: ${product.stock_quantity} — bu değere ayarlanacak.`,
  }[operation]

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
        >
          {state.message}
        </div>
      )}

      {/* Ürün özeti */}
      <div
        className="rounded-lg px-4 py-3 grid grid-cols-3 gap-4 text-sm"
        style={{ background: "rgba(255,255,255,0.03)" }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: "#A5A5A5" }}>
            Fiziksel Stok
          </p>
          <p className="text-xl font-semibold tabular-nums" style={{ color: "#F4F4F2" }}>
            {product.stock_quantity}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: "#A5A5A5" }}>
            Rezerve Stok
          </p>
          <p
            className="text-xl font-semibold tabular-nums"
            style={{ color: product.reserved_stock > 0 ? "#fb923c" : "#A5A5A5" }}
          >
            {product.reserved_stock}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: "#A5A5A5" }}>
            Kullanılabilir
          </p>
          <p
            className="text-xl font-semibold tabular-nums"
            style={{
              color:
                product.available_stock <= 0
                  ? "#f87171"
                  : product.available_stock <= 5
                  ? "#D4A017"
                  : "#34d399",
            }}
          >
            {product.available_stock}
          </p>
        </div>
      </div>

      {/* İşlem tipi */}
      <div className="space-y-2">
        <p className="text-sm font-medium" style={{ color: "#F4F4F2" }}>
          İşlem Tipi <span style={{ color: "#D4A017" }}>*</span>
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {OPERATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setOperation(opt.value)}
              className="text-left px-4 py-3 rounded-lg transition-all"
              style={{
                border:
                  operation === opt.value
                    ? "1px solid #D4A017"
                    : "1px solid rgba(255,255,255,0.09)",
                background:
                  operation === opt.value
                    ? "rgba(212,160,23,0.08)"
                    : "#111214",
              }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: operation === opt.value ? "#D4A017" : "#F4F4F2" }}
              >
                {opt.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#A5A5A5" }}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
        {/* Hidden field for operation */}
        <input type="hidden" name="operation" value={operation} />
      </div>

      {/* Miktar */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          {quantityLabel} <span style={{ color: "#D4A017" }}>*</span>
        </label>
        <input
          type="number"
          name="quantity"
          min={operation === "adjust" ? 0 : 1}
          step={1}
          className={inputClass}
          style={{
            ...inputStyle,
            ...(fieldError("quantity") ? { borderColor: "#f87171" } : {}),
          }}
          placeholder={operation === "adjust" ? String(product.stock_quantity) : "1"}
        />
        {fieldError("quantity") ? (
          <p className="text-xs" style={{ color: "#f87171" }}>
            {fieldError("quantity")}
          </p>
        ) : (
          <p className="text-xs" style={{ color: "#A5A5A5" }}>
            {quantityHelp}
          </p>
        )}
      </div>

      {/* Sebep */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          Sebep <span style={{ color: "#D4A017" }}>*</span>
        </label>
        <textarea
          name="reason"
          rows={3}
          className={`${inputClass} resize-none`}
          style={{
            ...inputStyle,
            ...(fieldError("reason") ? { borderColor: "#f87171" } : {}),
          }}
          placeholder="Stok değişikliğinin sebebini açıklayın (zorunlu, en az 10 karakter)…"
          maxLength={500}
        />
        {fieldError("reason") && (
          <p className="text-xs" style={{ color: "#f87171" }}>
            {fieldError("reason")}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity"
          style={{
            background: "#D4A017",
            color: "#090A0C",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending ? "İşleniyor…" : "Stok Güncelle"}
        </button>
        <Link
          href="/admin/inventory"
          className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-75"
          style={{ background: "rgba(255,255,255,0.06)", color: "#A5A5A5" }}
        >
          İptal
        </Link>
      </div>
    </form>
  )
}
