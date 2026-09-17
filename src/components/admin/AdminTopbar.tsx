import { LogOut } from "lucide-react"
import { adminSignOut } from "@/lib/admin/actions"
import type { AdminUser } from "@/lib/admin/requireAdmin"

interface AdminTopbarProps {
  admin: AdminUser
}

const roleLabel: Record<string, string> = {
  super_admin: "Süper Admin",
  admin:       "Admin",
  staff:       "Personel",
}

export default function AdminTopbar({ admin }: AdminTopbarProps) {
  return (
    <header
      className="flex items-center justify-end gap-4 px-6 h-13 shrink-0"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#101114", minHeight: "52px" }}
    >
      <div className="text-right">
        <p className="text-sm font-medium" style={{ color: "#F4F4F2" }}>{admin.email}</p>
        <p className="text-xs" style={{ color: "#D4A017" }}>{roleLabel[admin.role] ?? admin.role}</p>
      </div>

      <form action={adminSignOut}>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-opacity hover:opacity-70"
          style={{ color: "#A5A5A5", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <LogOut size={12} />
          Çıkış
        </button>
      </form>
    </header>
  )
}
