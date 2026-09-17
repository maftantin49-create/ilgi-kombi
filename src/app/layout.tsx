import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { site } from "@/config/site"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.seo.defaultTitle, template: site.seo.titleTemplate },
  description: site.description,
  keywords: site.seo.keywords,
  openGraph: {
    title: site.seo.defaultTitle,
    description: site.description,
    url: site.url,
    locale: "tr_TR",
    type: "website",
  },
  alternates: { canonical: site.url },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={geist.variable}>
      <body className="antialiased min-h-full">{children}</body>
    </html>
  )
}
