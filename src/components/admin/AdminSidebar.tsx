"use client"
import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Tag, FolderTree, Warehouse, ShoppingCart, Users, CreditCard, Settings, FileUp, RefreshCw } from "lucide-react"

const navItems: {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  exact: boolean
  exclude?: string | string[]
}[] = [
  { href: "/admin",                    label: "Dashboard",      icon: LayoutDashboard, exact: true  },
  {
    href: "/admin/products", label: "Ürünler", icon: Package, exact: false,
    exclude: ["/admin/products/import", "/admin/products/bulk-update"],
  },
  { href: "/admin/products/import",       label: "Toplu Aktar",    icon: FileUp,      exact: false },
  { href: "/admin/products/bulk-update",  label: "Toplu Güncelle", icon: RefreshCw,   exact: false },
  { href: "/admin/brands",     label: "Markalar",    icon: Tag,             exact: false },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderTree,      exact: false },
  { href: "/admin/inventory",  label: "Stok",        icon: Warehouse,       exact: false },
  { href: "/admin/orders",     label: "Siparişler",  icon: ShoppingCart,    exact: false },
  { href: "/admin/customers",  label: "Müşteriler",  icon: Users,           exact: false },
  { href: "/admin/payments",   label: "Ödemeler",    icon: CreditCard,      exact: false },
  { href: "/admin/settings",   label: "Ayarlar",     icon: Settings,        exact: false },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col w-56 shrink-0 h-full"
      style={{ background: "#101114", borderRight: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <p className="text-xs font-medium" style={{ color: "#A5A5A5" }}>İstanbul Kombi Klima</p>
        <p className="text-xs mt-0.5 font-semibold tracking-wide" style={{ color: "#D4A017" }}>
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact, exclude }) => {
          const excluded = Array.isArray(exclude)
            ? exclude.some((ex) => pathname.startsWith(ex))
            : exclude ? pathname.startsWith(exclude) : false
          const isActive =
            (exact ? pathname === href : pathname.startsWith(href)) && !excluded
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                color:      isActive ? "#D4A017" : "#A5A5A5",
                background: isActive ? "rgba(212,160,23,0.08)" : "transparent",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
