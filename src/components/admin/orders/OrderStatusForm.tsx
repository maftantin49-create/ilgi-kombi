"use client"

import { useActionState } from "react"
import { VALID_TRANSITIONS, ORDER_STATUS_LABELS } from "@/lib/admin/schemas/order"
import { INITIAL_STATE } from "@/lib/admin/schemas/product"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { OrderStatus } from "@/types/database.types"

interface Props {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  currentStatus: string
}

export default function OrderStatusForm({ action, currentStatus }: Props) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)

  const allowedTransitions =
    VALID_TRANSITIONS[currentStatus as OrderStatus] ?? []

  if (allowedTransitions.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "#A5A5A5", fontStyle: "italic" }}>
        Bu siparişin durumu değiştirilemez.
      </p>
    )
  }

  return (
    <form action={formAction} style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
      <select
        name="status"
        defaultValue={allowedTransitions[0]}
        disabled={isPending}
        style={{
          background: "#111214",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#F4F4F2",
          borderRadius: "6px",
          padding: "7px 12px",
          fontSize: "13px",
          outline: "none",
          minWidth: "180px",
        }}
      >
        {allowedTransitions.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={isPending}
        style={{
          background: isPending ? "rgba(212,160,23,0.4)" : "#D4A017",
          color: "#090A0C",
          border: "none",
          borderRadius: "6px",
          padding: "7px 16px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: isPending ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {isPending ? "Güncelleniyor..." : "Durumu Güncelle"}
      </button>

      {state.message && !state.success && (
        <p style={{ width: "100%", fontSize: "12px", color: "#f87171", marginTop: "4px" }}>
          {state.message}
        </p>
      )}
    </form>
  )
}
