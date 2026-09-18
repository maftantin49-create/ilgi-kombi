import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import WhatsAppFloat from "@/components/layout/WhatsAppFloat"
import { getStorefrontCategories } from "@/lib/storefront/categories"
import { getStoreSettings } from "@/lib/storefront/settings"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [categories, settings] = await Promise.all([
    getStorefrontCategories(),
    getStoreSettings(),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        categories={categories}
        siteName={settings.siteName}
        phone={settings.phone}
        whatsapp={settings.whatsapp}
      />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer
        siteName={settings.siteName}
        phone={settings.phone}
        whatsapp={settings.whatsapp}
        email={settings.email}
        address={settings.address}
        workingHours={settings.workingHours}
        social={settings.social}
      />
      <WhatsAppFloat waNumber={settings.whatsapp} siteName={settings.siteName} />
    </div>
  )
}
