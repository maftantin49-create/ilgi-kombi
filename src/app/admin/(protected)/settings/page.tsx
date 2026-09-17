import { requireAdmin } from "@/lib/admin/requireAdmin"
import { getSettings } from "@/lib/admin/settings"
import { updateSettingsAction } from "@/lib/admin/settings.actions"
import { VALID_TAB_KEYS } from "@/lib/admin/schemas/settings"
import type { TabKey } from "@/lib/admin/schemas/settings"
import SettingsTabNav from "@/components/admin/settings/SettingsTabNav"
import GeneralTab from "@/components/admin/settings/tabs/GeneralTab"
import CompanyTab from "@/components/admin/settings/tabs/CompanyTab"
import SeoTab from "@/components/admin/settings/tabs/SeoTab"
import SocialTab from "@/components/admin/settings/tabs/SocialTab"
import MailTab from "@/components/admin/settings/tabs/MailTab"
import StockTab from "@/components/admin/settings/tabs/StockTab"
import OrderTab from "@/components/admin/settings/tabs/OrderTab"
import SecurityTab from "@/components/admin/settings/tabs/SecurityTab"
import IntegrationsTab from "@/components/admin/settings/tabs/IntegrationsTab"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<Record<string, string>>
}

function toValidTab(raw: string | undefined): TabKey {
  if (raw && (VALID_TAB_KEYS as readonly string[]).includes(raw)) {
    return raw as TabKey
  }
  return "general"
}

export default async function SettingsPage({ searchParams }: Props) {
  await requireAdmin()
  const sp = await searchParams
  const activeTab = toValidTab(sp.tab)
  const settings = await getSettings()

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#F4F4F2", fontSize: "20px", fontWeight: 600 }}>
          Sistem Ayarları
        </h1>
        <p style={{ color: "#A5A5A5", fontSize: "13px", marginTop: "2px" }}>
          Platform geneli yapılandırma
        </p>
      </div>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <SettingsTabNav activeTab={activeTab} />

        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === "general" && (
            <GeneralTab
              settings={settings.general}
              action={updateSettingsAction.bind(null, "general")}
            />
          )}
          {activeTab === "company" && (
            <CompanyTab
              settings={settings.company}
              action={updateSettingsAction.bind(null, "company")}
            />
          )}
          {activeTab === "seo" && (
            <SeoTab
              settings={settings.seo}
              action={updateSettingsAction.bind(null, "seo")}
            />
          )}
          {activeTab === "social" && (
            <SocialTab
              settings={settings.social}
              action={updateSettingsAction.bind(null, "social")}
            />
          )}
          {activeTab === "mail" && (
            <MailTab
              settings={settings.mail}
              action={updateSettingsAction.bind(null, "mail")}
            />
          )}
          {activeTab === "stock_config" && (
            <StockTab
              settings={settings.stock_config}
              action={updateSettingsAction.bind(null, "stock_config")}
            />
          )}
          {activeTab === "order_config" && (
            <OrderTab
              settings={settings.order_config}
              action={updateSettingsAction.bind(null, "order_config")}
            />
          )}
          {activeTab === "security" && (
            <SecurityTab
              settings={settings.security}
              action={updateSettingsAction.bind(null, "security")}
            />
          )}
          {activeTab === "integrations" && (
            <IntegrationsTab
              settings={settings.integrations}
              action={updateSettingsAction.bind(null, "integrations")}
            />
          )}
        </div>
      </div>
    </div>
  )
}
