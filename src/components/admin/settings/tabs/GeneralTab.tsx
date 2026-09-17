"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { GeneralSettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: GeneralSettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function GeneralTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="Genel Ayarlar">
        <div style={fieldStyle}>
          <label htmlFor="site_name" style={labelStyle}>
            Site Adı <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            id="site_name"
            name="site_name"
            type="text"
            defaultValue={settings.site_name}
            style={inputStyle}
            maxLength={100}
            required
          />
          <FieldError errors={state.fieldErrors?.site_name} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="site_tagline" style={labelStyle}>
            Site Sloganı
          </label>
          <input
            id="site_tagline"
            name="site_tagline"
            type="text"
            defaultValue={settings.site_tagline}
            style={inputStyle}
            maxLength={200}
          />
          <FieldError errors={state.fieldErrors?.site_tagline} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="maintenance_message" style={labelStyle}>
            Bakım Modu Mesajı
          </label>
          <p style={hintStyle}>
            Bakım modu aktifken ziyaretçilere gösterilir. (Bakım modunu Güvenlik sekmesinden açın.)
          </p>
          <textarea
            id="maintenance_message"
            name="maintenance_message"
            defaultValue={settings.maintenance_message}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            maxLength={500}
          />
          <FieldError errors={state.fieldErrors?.maintenance_message} />
        </div>

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
