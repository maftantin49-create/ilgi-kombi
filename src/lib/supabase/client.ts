"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database.types"

// ── Browser client ─────────────────────────────────────────────────────────
// Publishable key — client bundle'a girmesi güvenlidir.
// Yazma işlemleri için kullanılmaz: RLS tüm transactional tablolarda
// anon/authenticated write'ı reddeder.
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
