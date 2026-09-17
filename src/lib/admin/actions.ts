"use server"
import { createAuthServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function adminSignOut() {
  const supabase = await createAuthServerClient()
  await supabase.auth.signOut()
  redirect("/admin/giris")
}
