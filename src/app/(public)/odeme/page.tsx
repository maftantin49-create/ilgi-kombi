import { getStoreSettings, validWhatsApp } from "@/lib/storefront/settings"
import OdemeClient from "./OdemeClient"

export default async function OdemePage() {
  const settings = await getStoreSettings()
  const waNumber = validWhatsApp(settings.whatsapp)
  return <OdemeClient waNumber={waNumber} />
}
