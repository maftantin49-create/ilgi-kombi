import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { getStoreSettings } from "@/lib/storefront/settings"
import { siteConfig } from "@/config/site"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default:  s.seo.defaultTitle  || s.siteName,
      template: s.seo.titleTemplate || `%s | ${s.siteName}`,
    },
    description: s.seo.description || undefined,
    keywords:    s.seo.keywords.length > 0 ? s.seo.keywords : undefined,
    openGraph: {
      title:       s.seo.defaultTitle || s.siteName,
      description: s.seo.description || undefined,
      url:         siteConfig.url,
      locale:      "tr_TR",
      type:        "website",
    },
    alternates: { canonical: siteConfig.url },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={geist.variable}>
      <body className="antialiased min-h-full">{children}</body>
    </html>
  )
}
