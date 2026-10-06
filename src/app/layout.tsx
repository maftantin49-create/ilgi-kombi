import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { getStoreSettings, validPhone, validEmail, validSocial } from "@/lib/storefront/settings"
import type { StoreSettings } from "@/lib/storefront/settings"
import { siteConfig } from "@/config/site"
import { legal } from "@/config/legal"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const LOGO_PATH = "/brand/logo.png"

// "09:00-18:00" → { opens: "09:00", closes: "18:00" }
function parseHours(range: string): { opens: string; closes: string } | null {
  const m = range.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/)
  return m ? { opens: m[1], closes: m[2] } : null
}

// "Street District / City" → PostalAddress object
function buildPostalAddress(full: string): object {
  const parts = full.split(" / ")
  if (parts.length === 2) {
    const region = parts[1].trim()
    const localityAndStreet = parts[0].trim()
    const lastSpace = localityAndStreet.lastIndexOf(" ")
    if (lastSpace > 0) {
      return {
        "@type": "PostalAddress",
        streetAddress: localityAndStreet.slice(0, lastSpace),
        addressLocality: localityAndStreet.slice(lastSpace + 1),
        addressRegion: region,
        addressCountry: "TR",
      }
    }
  }
  return { "@type": "PostalAddress", streetAddress: full, addressCountry: "TR" }
}

function buildRootSchemas(s: StoreSettings, siteUrl: string): object[] {
  const phone     = validPhone(s.phone)
  const email     = validEmail(s.email)
  const instagram = validSocial(s.social.instagram)
  const facebook  = validSocial(s.social.facebook)
  // legal.fullAddress = verified registered address; fall back to DB address
  const addressRaw = legal.fullAddress || s.address
  const logoUrl    = `${siteUrl}${LOGO_PATH}`

  const openingHours: object[] = []
  const weekday  = parseHours(s.workingHours.weekdays)
  const saturday = parseHours(s.workingHours.saturday)
  const sunday   = parseHours(s.workingHours.sunday)
  if (weekday)  openingHours.push({ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: weekday.opens,  closes: weekday.closes  })
  if (saturday) openingHours.push({ "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: saturday.opens, closes: saturday.closes })
  if (sunday)   openingHours.push({ "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday"],   opens: sunday.opens,  closes: sunday.closes   })

  const sameAs = [instagram, facebook].filter((x): x is string => !!x)

  const organization: object = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: s.siteName,
    url: siteUrl,
    logo: { "@type": "ImageObject", url: logoUrl },
    ...(phone ? { contactPoint: [{ "@type": "ContactPoint", telephone: phone, contactType: "customer service", availableLanguage: "Turkish" }] } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }

  const website: object = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: s.siteName,
    url: siteUrl,
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/urunler?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }

  const localBusiness: object = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    "@id": `${siteUrl}/#localbusiness`,
    name: s.siteName,
    url: siteUrl,
    image: logoUrl,
    ...(phone       ? { telephone: phone } : {}),
    ...(email       ? { email }            : {}),
    ...(addressRaw  ? { address: buildPostalAddress(addressRaw) } : {}),
    ...(openingHours.length > 0 ? { openingHoursSpecification: openingHours } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }

  return [organization, website, localBusiness]
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getStoreSettings()
  const logoUrl = `${siteConfig.url}${LOGO_PATH}`
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
      description: s.seo.description  || undefined,
      url:         siteConfig.url,
      locale:      "tr_TR",
      type:        "website",
      images:      [{ url: logoUrl, width: 512, height: 512, alt: s.siteName }],
    },
    twitter: {
      card: "summary_large_image",
    },
    alternates: { canonical: siteConfig.url },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getStoreSettings()
  const schemas = buildRootSchemas(s, siteConfig.url)

  return (
    <html lang="tr" className={geist.variable}>
      <body className="antialiased min-h-full">
        {schemas.map((schema, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        {children}
      </body>
    </html>
  )
}
