import type { Metadata, Viewport } from "next"
import AdminSwRegistrar from "@/components/admin/AdminSwRegistrar"

export const viewport: Viewport = {
  themeColor: "#090A0C",
}

export const metadata: Metadata = {
  manifest: "/admin-manifest.json",
  applicationName: "İlgi Kombi Yönetim Paneli",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "İlgi Kombi Yönetim Paneli",
  },
  formatDetection: { telephone: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminSwRegistrar />
      {children}
    </>
  )
}
