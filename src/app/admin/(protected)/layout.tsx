import { requireAdmin } from "@/lib/admin/requireAdmin"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"

export const dynamic = "force-dynamic"

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#090A0C" }}>
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AdminTopbar admin={admin} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
