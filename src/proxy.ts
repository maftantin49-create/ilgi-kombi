import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ── Admin route session kontrolü ───────────────────────────────────────────
// Yalnızca session var mı diye bakar — Edge Runtime'da service_role sorgusu yapılmaz.
// Gerçek rol ve yetki doğrulaması server component / server action / API route
// başında createServiceClient() + admin_profiles sorgusuyla yeniden yapılır.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  // Giriş sayfası döngüye girmesin
  if (pathname === "/admin/giris") {
    return NextResponse.next()
  }

  // Supabase session cookie varlığını kontrol et
  const hasSession =
    request.cookies.has("sb-access-token") ||
    request.cookies.has("sb-refresh-token") ||
    // @supabase/ssr'nin ürettiği dinamik cookie adı (proje ref içerir)
    [...request.cookies.getAll()].some(c => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"))

  if (!hasSession) {
    const loginUrl = new URL("/admin/giris", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
