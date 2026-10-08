"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { SocialSettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: SocialSettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/kullanici" },
  { key: "tiktok",    label: "TikTok",    placeholder: "https://tiktok.com/@kullanici" },
  { key: "facebook",  label: "Facebook",  placeholder: "https://facebook.com/sayfa" },
  { key: "youtube",   label: "YouTube",   placeholder: "https://youtube.com/kanal" },
  { key: "twitter",   label: "X (Twitter)", placeholder: "https://x.com/kullanici" },
  { key: "linkedin",  label: "LinkedIn",  placeholder: "https://linkedin.com/company/firma" },
] as const

export default function SocialTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="Sosyal Medya Hesapları">
        <p style={{ ...hintStyle, marginBottom: "16px" }}>
          Boş bırakılan platformlar site üzerinde gösterilmez. Tam URL girin (https://...).
        </p>
        {PLATFORMS.map(({ key, label, placeholder }) => (
          <div key={key} style={fieldStyle}>
            <label htmlFor={key} style={labelStyle}>{label}</label>
            <input
              id={key}
              name={key}
              type="url"
              defaultValue={settings[key]}
              style={inputStyle}
              maxLength={300}
              placeholder={placeholder}
            />
            <FieldError errors={state.fieldErrors?.[key]} />
          </div>
        ))}
        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
