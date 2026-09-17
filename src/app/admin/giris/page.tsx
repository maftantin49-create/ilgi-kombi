import { adminLogin } from "./actions"

interface Props {
  searchParams: Promise<{ error?: string; redirect?: string }>
}

const errorMessages: Record<string, string> = {
  validation:  "Lütfen geçerli bir email ve şifre girin.",
  credentials: "Email veya şifre hatalı.",
  yetkisiz:    "Bu hesabın admin yetkisi bulunmuyor.",
}

export default async function AdminGirisPage({ searchParams }: Props) {
  const { error, redirect: redirectTo } = await searchParams

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#090A0C" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-2"
            style={{ color: "#D4A017" }}
          >
            Admin Panel
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: "#F4F4F2" }}>
            Admin Girişi
          </h1>
        </div>

        <div
          className="rounded-lg p-6 space-y-5"
          style={{ background: "#151618", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {error && (
            <div
              className="rounded px-3 py-2.5 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                color:      "#EF4444",
                border:     "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {errorMessages[error] ?? "Bir hata oluştu. Tekrar deneyin."}
            </div>
          )}

          <form action={adminLogin} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo ?? "/admin"} />

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium"
                style={{ color: "#A5A5A5" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "#111214",
                  border:     "1px solid rgba(255,255,255,0.1)",
                  color:      "#F4F4F2",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium"
                style={{ color: "#A5A5A5" }}
              >
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "#111214",
                  border:     "1px solid rgba(255,255,255,0.1)",
                  color:      "#F4F4F2",
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: "#D4A017", color: "#090A0C" }}
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
