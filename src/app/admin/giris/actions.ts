"use server"
import { z } from "zod"
import { createAuthServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const loginSchema = z.object({
  email:      z.string().email(),
  password:   z.string().min(1),
  redirectTo: z.string().default("/admin"),
})

export async function adminLogin(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email:      formData.get("email"),
    password:   formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? "/admin",
  })

  if (!parsed.success) {
    redirect("/admin/giris?error=validation")
  }

  const supabase = await createAuthServerClient()
  const { error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    redirect("/admin/giris?error=credentials")
  }

  redirect(parsed.data.redirectTo)
}
