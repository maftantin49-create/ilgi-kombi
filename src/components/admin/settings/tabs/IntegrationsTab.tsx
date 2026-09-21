"use client"

import { useActionState } from "react"
import type { ActionState } from "@/lib/admin/schemas/product"
import type { IntegrationsSettings } from "@/lib/admin/settings"
import { labelStyle, fieldStyle, hintStyle, SaveBar, SectionCard } from "@/components/admin/settings/SettingsFormUI"

interface Props {
  settings: IntegrationsSettings
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

const INTEGRATIONS: {
  key: keyof IntegrationsSettings
  label: string
  description: string
  envVars: string[]
}[] = [
  {
    key: "bank_transfer_enabled",
    label: "Havale / EFT",
    description: "Müşterilere banka havalesi veya EFT ile ödeme seçeneği sunar. IBAN bilgileri sipariş onayında gösterilir.",
    envVars: [],
  },
  {
    key: "cash_on_delivery_enabled",
    label: "Kapıda Ödeme",
    description: "Kapıda nakit veya kart ile ödeme seçeneğini etkinleştirir.",
    envVars: [],
  },
  {
    key: "online_payment_enabled",
    label: "Online Ödeme (Kart)",
    description: "Kredi/banka kartı ile online ödeme altyapısını etkinleştirir. Sağlayıcı bilgileri ayrıca yapılandırılmalıdır.",
    envVars: [],
  },
  {
    key: "whatsapp_enabled",
    label: "WhatsApp Destek",
    description: "Storefront'ta WhatsApp iletişim butonunu gösterir.",
    envVars: [],
  },
  {
    key: "whatsapp_order_enabled",
    label: "WhatsApp Sipariş",
    description: "Siparişin WhatsApp üzerinden tamamlanmasına izin verir (DB sipariş akışı yerine).",
    envVars: [],
  },
  {
    key: "google_ads_enabled",
    label: "Google Ads",
    description: "Google Ads dönüşüm izleme ve remarketing tag'ini etkinleştirir.",
    envVars: ["GOOGLE_ADS_CONVERSION_ID", "GOOGLE_ADS_CONVERSION_LABEL"],
  },
  {
    key: "meta_enabled",
    label: "Meta Pixel (Facebook)",
    description: "Meta Pixel izlemesini etkinleştirir.",
    envVars: ["META_PIXEL_ID"],
  },
  {
    key: "shipping_provider_enabled",
    label: "Kargo Entegrasyonu",
    description: "Kargo firması API entegrasyonunu etkinleştirir.",
    envVars: ["SHIPPING_API_KEY", "SHIPPING_SENDER_CODE"],
  },
]

export default function IntegrationsTab({ settings, action }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })

  return (
    <form action={formAction}>
      <SectionCard title="Entegrasyonlar">
        <div
          style={{
            background: "rgba(212,160,23,0.05)",
            border: "1px solid rgba(212,160,23,0.15)",
            borderRadius: "6px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "12px",
            color: "#A5A5A5",
          }}
        >
          Buradaki toggle&apos;lar yalnızca entegrasyonun aktif olup olmadığını belirler.
          API anahtarları ve secret değerleri{" "}
          <strong style={{ color: "#F4F4F2" }}>hiçbir zaman</strong> veritabanında tutulmaz —
          sunucu ortam değişkenlerinden (.env) yönetilir.
        </div>

        {INTEGRATIONS.map(({ key, label, description, envVars }) => (
          <div
            key={key}
            style={{
              ...fieldStyle,
              padding: "16px",
              background: "#111214",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "6px",
            }}
          >
            <label
              htmlFor={key}
              style={{ ...labelStyle, display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}
            >
              <input
                id={key}
                name={key}
                type="checkbox"
                defaultChecked={settings[key]}
                style={{ width: "16px", height: "16px", accentColor: "#D4A017", cursor: "pointer", marginTop: "1px", flexShrink: 0 }}
              />
              <div>
                <span style={{ color: "#F4F4F2", fontSize: "13px", fontWeight: 500 }}>{label}</span>
                <p style={{ ...hintStyle, marginTop: "2px", marginBottom: "6px" }}>{description}</p>
                <p style={hintStyle}>
                  Gerekli env değişkenler:{" "}
                  {envVars.map((v, i) => (
                    <span key={v}>
                      <span style={{ fontFamily: "monospace", color: "#60a5fa" }}>{v}</span>
                      {i < envVars.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>
            </label>
          </div>
        ))}

        <SaveBar state={state} isPending={isPending} />
      </SectionCard>
    </form>
  )
}
