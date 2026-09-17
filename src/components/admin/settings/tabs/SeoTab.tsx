"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { SeoSettings } from "@/lib/admin/settings"
import {
  inputStyle, labelStyle, fieldStyle, hintStyle,
  FieldError, SaveBar, SectionCard,
} from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: SeoSettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

export default function SeoTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="SEO Ayarları">
        <div style={fieldStyle}>
          <label htmlFor="title_template" style={labelStyle}>
            Sayfa Başlığı Şablonu <span style={{ color: "#f87171" }}>*</span>
          </label>
          <p style={hintStyle}>
            %s yerine sayfa başlığı gelir. Örn: %s | Mağaza Adı
          </p>
          <input
            id="title_template"
            name="title_template"
            type="text"
            defaultValue={settings.title_template}
            style={inputStyle}
            maxLength={100}
            required
          />
          <FieldError errors={state.fieldErrors?.title_template} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="default_title" style={labelStyle}>
            Varsayılan Sayfa Başlığı <span style={{ color: "#f87171" }}>*</span>
          </label>
          <p style={hintStyle}>Özel başlığı olmayan sayfalar için kullanılır.</p>
          <input
            id="default_title"
            name="default_title"
            type="text"
            defaultValue={settings.default_title}
            style={inputStyle}
            maxLength={100}
            required
          />
          <FieldError errors={state.fieldErrors?.default_title} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="description" style={labelStyle}>Meta Açıklaması</label>
          <p style={hintStyle}>Arama motoru sonuçlarında görünür. Önerilen: 120–160 karakter.</p>
          <textarea
            id="description"
            name="description"
            defaultValue={settings.description}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            maxLength={300}
          />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="keywords" style={labelStyle}>Anahtar Kelimeler</label>
          <p style={hintStyle}>
            Her satıra bir kelime girin. Virgülle ayrılmış da kabul edilir.
            Tekrarlar otomatik kaldırılır. En fazla 20 kelime.
          </p>
          <textarea
            id="keywords"
            name="keywords"
            defaultValue={settings.keywords.join("\n")}
            rows={6}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <FieldError errors={state.fieldErrors?.keywords} />
        </div>

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
