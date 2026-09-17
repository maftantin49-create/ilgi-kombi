"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { MailSettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: MailSettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function MailTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="E-posta Gönderim Ayarları">
        <div
          style={{
            background: "rgba(96,165,250,0.05)",
            border: "1px solid rgba(96,165,250,0.2)",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "12px",
            color: "#A5A5A5",
          }}
        >
          SMTP sunucu adresi, port ve şifre gibi teknik ayarlar sunucu ortam
          değişkenlerinden (.env) yönetilir:{" "}
          <span style={{ fontFamily: "monospace", color: "#60a5fa" }}>
            SMTP_HOST, SMTP_PORT, SMTP_PASSWORD
          </span>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="from_name" style={labelStyle}>
            Gönderen Adı <span style={{ color: "#f87171" }}>*</span>
          </label>
          <p style={hintStyle}>E-postalarda &quot;Kimden&quot; alanında görünür.</p>
          <input
            id="from_name"
            name="from_name"
            type="text"
            defaultValue={settings.from_name}
            style={inputStyle}
            maxLength={100}
            required
          />
          <FieldError errors={state.fieldErrors?.from_name} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="from_email" style={labelStyle}>
            Gönderen E-posta <span style={{ color: "#f87171" }}>*</span>
          </label>
          <input
            id="from_email"
            name="from_email"
            type="email"
            defaultValue={settings.from_email}
            style={inputStyle}
            maxLength={200}
            autoComplete="email"
            required
          />
          <FieldError errors={state.fieldErrors?.from_email} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="reply_to" style={labelStyle}>Reply-To E-posta</label>
          <p style={hintStyle}>
            Müşteriler e-postaya yanıt verdiğinde bu adrese yönlendirilir.
            Boş bırakılırsa gönderen adresi kullanılır.
          </p>
          <input
            id="reply_to"
            name="reply_to"
            type="email"
            defaultValue={settings.reply_to}
            style={inputStyle}
            maxLength={200}
            autoComplete="email"
          />
          <FieldError errors={state.fieldErrors?.reply_to} />
        </div>

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
