import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import WhatsAppFloat from "@/components/layout/WhatsAppFloat"
import { getStorefrontCategories } from "@/lib/storefront/categories"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await getStorefrontCategories()

  return (
    <div className="flex flex-col min-h-screen">
      <Header categories={categories} />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </div>
  )
}
