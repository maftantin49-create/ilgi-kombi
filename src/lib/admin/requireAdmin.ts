import { cache } from "react"
import { redirect } from "next/navigation"
import { createAuthServerClient, createServiceClient } from "@/lib/supabase/server"
import type { AdminProfile, AdminRole } from "@/types/database.types"

export interface AdminUser {
  id: string
  email: string
  role: AdminRole
}

export const requireAdmin = cache(async (): Promise<AdminUser> => {
  const authClient = await createAuthServerClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    redirect("/admin/giris")
  }

  const serviceClient = createServiceClient()
  const result = await serviceClient
    .from("admin_profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single()

  const profile = result.data as AdminProfile | null

  if (!profile?.is_active) {
    redirect("/admin/giris?error=yetkisiz")
  }

  return {
    id: user.id,
    email: user.email ?? "",
    role: profile.role,
  }
})
