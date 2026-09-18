import { getStoreSettings, validWhatsApp } from "@/lib/storefront/settings"
import SepetClient from "./SepetClient"

export default async function SepetPage() {
  const s = await getStoreSettings()
  return (
    <SepetClient
      freeShippingThreshold={s.freeShippingThreshold}
      shippingCost={s.shippingCost}
      waNumber={validWhatsApp(s.whatsapp)}
    />
  )
}
