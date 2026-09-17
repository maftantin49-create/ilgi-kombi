"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { StockConfigSettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: StockConfigSettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function StockTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="Stok Yapılandırması">
        <div style={fieldStyle}>
          <label htmlFor="low_stock_threshold" style={labelStyle}>
            Düşük Stok Eşiği <span style={{ color: "#f87171" }}>*</span>
          </label>
          <p style={hintStyle}>
            Mevcut stok bu sayının altına düştüğünde ürün &quot;Düşük Stok&quot; uyarısı alır.
            Admin panelinde sarı renkte gösterilir. (1–100 arası)
          </p>
          <input
            id="low_stock_threshold"
            name="low_stock_threshold"
            type="number"
            defaultValue={settings.low_stock_threshold}
            style={{ ...inputStyle, maxWidth: "120px" }}
            min={1}
            max={100}
            step={1}
            required
          />
          <FieldError errors={state.fieldErrors?.low_stock_threshold} />
        </div>

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
