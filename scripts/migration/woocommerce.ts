import type {
  WcProduct,
  WcCategory,
  WcBrand,
  WcProductAttribute,
  WpPage,
} from "./interface"

// ── WooCommerce REST API v3 client (read-only) ────────────────────────────────
// Auth: HTTP Basic — CK as username, CS as password.
// Never calls POST/PUT/DELETE/PATCH.

export class WooCommerceClient {
  private readonly auth: string
  private readonly base: string

  constructor(sourceUrl: string, consumerKey: string, consumerSecret: string) {
    this.base = sourceUrl.replace(/\/$/, "") + "/wp-json/wc/v3"
    this.auth = "Basic " + Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")
  }

  private async get<T>(
    path: string,
    params: Record<string, string> = {}
  ): Promise<{ data: T; total: number; totalPages: number }> {
    const url = new URL(`${this.base}${path}`)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization:  this.auth,
        "Content-Type": "application/json",
        "User-Agent":   "PITT-Migration/1.0 (read-only)",
      },
    })

    if (!res.ok) {
      const body = await res.text().catch(() => "")
      throw new WcApiError(res.status, path, body)
    }

    const data = (await res.json()) as T
    const total      = parseInt(res.headers.get("X-WP-Total")      ?? "0", 10)
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10)

    return { data, total, totalPages }
  }

  async testConnection(): Promise<{ ok: boolean; productCount: number }> {
    try {
      const { total } = await this.get<WcProduct[]>("/products", { per_page: "1", page: "1" })
      return { ok: true, productCount: total }
    } catch (e) {
      if (e instanceof WcApiError && e.status === 401) {
        throw new Error("WooCommerce authentication failed — check CK/CS credentials")
      }
      throw e
    }
  }

  async fetchAll<T>(
    endpoint: string,
    extraParams: Record<string, string> = {}
  ): Promise<T[]> {
    const results: T[] = []
    let page = 1

    while (true) {
      const { data, totalPages } = await this.get<T[]>(endpoint, {
        per_page: "100",
        page:     String(page),
        ...extraParams,
      })

      results.push(...data)

      if (page >= totalPages) break
      page++
    }

    return results
  }

  async getProducts(): Promise<WcProduct[]> {
    // Fetch published, draft, and private products separately
    const [published, drafts, privates] = await Promise.all([
      this.fetchAll<WcProduct>("/products", { status: "publish" }),
      this.fetchAll<WcProduct>("/products", { status: "draft"   }),
      this.fetchAll<WcProduct>("/products", { status: "private" }),
    ])
    return [...published, ...drafts, ...privates]
  }

  async getCategories(): Promise<WcCategory[]> {
    return this.fetchAll<WcCategory>("/products/categories", { hide_empty: "false" })
  }

  /** Returns null if the brands plugin endpoint is not available */
  async getBrands(): Promise<WcBrand[] | null> {
    try {
      return await this.fetchAll<WcBrand>("/products/brands")
    } catch (e) {
      if (e instanceof WcApiError && (e.status === 404 || e.status === 403)) {
        return null
      }
      throw e
    }
  }

  async getAttributes(): Promise<WcProductAttribute[]> {
    const { data } = await this.get<WcProductAttribute[]>("/products/attributes")
    return data
  }

  /** Full products including yoast_head_json and all commerce fields */
  async getProductsFull(): Promise<WcProduct[]> {
    return this.getProducts()
  }

  /** Full categories including yoast_head_json */
  async getCategoriesFull(): Promise<WcCategory[]> {
    return this.fetchAll<WcCategory>("/products/categories", { hide_empty: "false" })
  }

  /** Full brands including description, image, yoast_head_json */
  async getBrandsFull(): Promise<WcBrand[] | null> {
    try {
      return await this.fetchAll<WcBrand>("/products/brands")
    } catch (e) {
      if (e instanceof WcApiError && (e.status === 404 || e.status === 403)) return null
      throw e
    }
  }

  /** WordPress public pages — no WC auth needed for published pages */
  async getWordPressPages(): Promise<WpPage[]> {
    const wpBase = this.base.replace("/wp-json/wc/v3", "/wp-json/wp/v2")
    const url = new URL(`${wpBase}/pages`)
    url.searchParams.set("per_page", "100")
    url.searchParams.set("status", "publish")

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "User-Agent": "PITT-Migration/1.0 (read-only)" },
    })

    if (!res.ok) return []
    return (await res.json()) as WpPage[]
  }
}

export class WcApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path:   string,
    public readonly body:   string
  ) {
    super(`WC API ${status} on ${path}`)
    this.name = "WcApiError"
  }
}
