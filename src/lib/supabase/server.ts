import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"

// ── Service-role client ────────────────────────────────────────────────────
// Server-only. client component, hook veya browser bundle'a import edilmez.
// SUPABASE_SERVICE_ROLE_KEY hiçbir koşulda NEXT_PUBLIC_ olmaz.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY veya NEXT_PUBLIC_SUPABASE_URL tanımlı değil")
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// ── Public server client ───────────────────────────────────────────────────
// Server-only. Publishable key → anon role → RLS enforced.
// No cookie/session dependency: stateless, safe for Server Component data fetching.
// Use for all storefront READ queries. Never for auth-gated or write operations.
export function createPublicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not set"
    )
  }

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// ── Cookie-aware server client ─────────────────────────────────────────────
// auth.getUser() için kullanılır. Publishable key + cookie.
// admin_profiles gibi yetkili sorgular için createServiceClient() kullanılır.
export async function createAuthServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component içinde çağrılırsa set işlemi sessizce başarısız olur.
            // Bu beklenen davranıştır.
          }
        },
      },
    }
  )
}
