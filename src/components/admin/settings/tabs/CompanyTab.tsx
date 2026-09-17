"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { CompanySettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: CompanySettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function CompanyTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="Firma Bilgileri">
        <div style={fieldStyle}>
          <label htmlFor="name" style={labelStyle}>
            Firma Adı <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={settings.name}
            style={inputStyle}
            maxLength={100}
            required
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={fieldStyle}>
            <label htmlFor="phone" style={labelStyle}>Telefon</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={settings.phone}
              style={inputStyle}
              maxLength={30}
            />
          </div>
          <div style={fieldStyle}>
            <label htmlFor="whatsapp" style={labelStyle}>WhatsApp</label>
            <p style={hintStyle}>Başında + olmadan (örn: 905304434885)</p>
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              defaultValue={settings.whatsapp}
              style={inputStyle}
              maxLength={30}
            />
          </div>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="email" style={labelStyle}>E-posta</label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={settings.email}
            style={inputStyle}
            maxLength={200}
            autoComplete="email"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="address" style={labelStyle}>Adres</label>
          <textarea
            id="address"
            name="address"
            defaultValue={settings.address}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" }}
            maxLength={500}
          />
        </div>
      </SectionCard>

      <SectionCard title="Çalışma Saatleri">
        {(
          [
            { field: "working_hours_weekdays", label: "Hafta içi", value: settings.working_hours.weekdays },
            { field: "working_hours_saturday", label: "Cumartesi", value: settings.working_hours.saturday },
            { field: "working_hours_sunday",   label: "Pazar",     value: settings.working_hours.sunday   },
          ] as const
        ).map(({ field, label, value }) => (
          <div key={field} style={fieldStyle}>
            <label htmlFor={field} style={labelStyle}>{label}</label>
            <input
              id={field}
              name={field}
              type="text"
              defaultValue={value}
              style={inputStyle}
              maxLength={30}
              placeholder="09:00 — 18:00"
            />
          </div>
        ))}

        <div style={fieldStyle}>
          <label htmlFor="shipping_cutoff" style={labelStyle}>Kargo Kesim Saati</label>
          <p style={hintStyle}>Bu saatten önce verilen siparişler aynı gün kargoya verilir.</p>
          <input
            id="shipping_cutoff"
            name="shipping_cutoff"
            type="text"
            defaultValue={settings.shipping_cutoff}
            style={{ ...inputStyle, maxWidth: "120px" }}
            maxLength={5}
            placeholder="14:00"
          />
          <FieldError errors={state.fieldErrors?.shipping_cutoff} />
        </div>

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
