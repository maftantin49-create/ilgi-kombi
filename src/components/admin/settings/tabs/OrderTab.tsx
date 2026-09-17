"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { OrderConfigSettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: OrderConfigSettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function OrderTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="Sipariş Yapılandırması">
        <div style={fieldStyle}>
          <label htmlFor="min_order_amount" style={labelStyle}>
            Minimum Sipariş Tutarı (₺)
          </label>
          <p style={hintStyle}>
            0 girilirse minimum tutar uygulanmaz.
          </p>
          <input
            id="min_order_amount"
            name="min_order_amount"
            type="number"
            defaultValue={settings.min_order_amount}
            style={{ ...inputStyle, maxWidth: "160px" }}
            min={0}
            max={10000}
            step={0.01}
          />
          <FieldError errors={state.fieldErrors?.min_order_amount} />
        </div>

        <div style={fieldStyle}>
          <label
            htmlFor="order_notes_enabled"
            style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          >
            <input
              id="order_notes_enabled"
              name="order_notes_enabled"
              type="checkbox"
              defaultChecked={settings.order_notes_enabled}
              style={{ width: "16px", height: "16px", accentColor: "#D4A017", cursor: "pointer" }}
            />
            <span>Sipariş notu alanını aktif et</span>
          </label>
          <p style={{ ...hintStyle, marginTop: "4px", marginLeft: "26px" }}>
            Müşteriler sipariş oluştururken özel not ekleyebilir.
          </p>
        </div>

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
