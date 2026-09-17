"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { SecuritySettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: SecuritySettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function SecurityTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="Güvenlik Ayarları">
        <div style={fieldStyle}>
          <div
            style={{
              background: "rgba(248,113,113,0.05)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: "6px",
              padding: "12px 16px",
              marginBottom: "12px",
              fontSize: "12px",
              color: "#f87171",
            }}
          >
            Bakım modu aktifleştirildiğinde tüm site ziyaretçileri bakım sayfasını
            görür. Admin paneli erişimi devam eder.
          </div>
          <label
            htmlFor="maintenance_mode"
            style={{ ...labelStyle, display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          >
            <input
              id="maintenance_mode"
              name="maintenance_mode"
              type="checkbox"
              defaultChecked={settings.maintenance_mode}
              style={{ width: "16px", height: "16px", accentColor: "#D4A017", cursor: "pointer" }}
            />
            <span>Bakım modunu aktif et</span>
          </label>
          <p style={{ ...hintStyle, marginTop: "4px", marginLeft: "26px" }}>
            Bakım mesajını Genel sekmesinden özelleştirin.
          </p>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="max_login_attempts" style={labelStyle}>
            Maksimum Giriş Denemesi <span style={{ color: "#f87171" }}>*</span>
          </label>
          <p style={hintStyle}>
            Ardışık başarısız giriş denemesi sayısı bu değere ulaşırsa hesap kilitlenir. (3–20 arası)
          </p>
          <input
            id="max_login_attempts"
            name="max_login_attempts"
            type="number"
            defaultValue={settings.max_login_attempts}
            style={{ ...inputStyle, maxWidth: "120px" }}
            min={3}
            max={20}
            step={1}
            required
          />
          <FieldError errors={state.fieldErrors?.max_login_attempts} />
        </div>

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
