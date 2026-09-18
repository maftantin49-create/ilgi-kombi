import { createPublicServerClient } from "@/lib/supabase/server"
import { getStoreSettings } from "@/lib/storefront/settings"

// ── Input / output types ───────────────────────────────────────────────────────

export interface CheckoutInputItem {
  productId: string
  quantity: number
}

// Hard errors remove the item from eligible order lines.
// NOT_FOUND covers both "product doesn't exist" and "product is inactive"
// (RLS filters inactive products to the anon role so they are indistinguishable).
export type CheckoutItemError = "NOT_FOUND" | "OUT_OF_STOCK"

export interface ValidatedCheckoutItem {
  productId: string
  slug: string
  sku: string
  name: string
  imageUrl: string | null
  brandName: string | null
  requestedQuantity: number
  confirmedQuantity: number  // capped at current DB stock; 0 on hard error
  serverPrice: number        // authoritative price — never trust client snapshot
  lineTotal: number          // serverPrice × confirmedQuantity
  stockCapped: boolean       // true when confirmedQuantity < requestedQuantity
  error: CheckoutItemError | null
}

export interface CheckoutValidationResult {
  ok: boolean                // false if any item has a hard error
  items: ValidatedCheckoutItem[]
  subtotal: number           // sum of valid (error === null) line totals
  shippingFee: number        // 0 when subtotal ≥ freeShippingThreshold
  grandTotal: number
}

// ── Core validation ────────────────────────────────────────────────────────────

type BrandRow = { name: string }
type ProductRow = {
  id: string
  slug: string
  sku: string
  name: string
  image_url: string | null
  price: number
  stock_quantity: number
  brands: BrandRow | BrandRow[] | null
}

export async function validateCheckoutCart(
  input: CheckoutInputItem[]
): Promise<CheckoutValidationResult> {
  if (input.length === 0) {
    return { ok: false, items: [], subtotal: 0, shippingFee: 0, grandTotal: 0 }
  }

  const [db, storeSettings] = await Promise.all([
    Promise.resolve(createPublicServerClient()),
    getStoreSettings(),
  ])
  const { data: rows } = await db
    .from("products")
    .select("id, slug, sku, name, image_url, price, stock_quantity, brands!brand_id ( name )")
    .in(
      "id",
      input.map((i) => i.productId)
    )

  const dbMap = new Map(
    ((rows ?? []) as unknown as ProductRow[]).map((r) => [r.id, r])
  )

  let hasHardError = false

  const items: ValidatedCheckoutItem[] = input.map((inp) => {
    const row = dbMap.get(inp.productId)

    if (!row) {
      hasHardError = true
      return {
        productId: inp.productId,
        slug: "",
        sku: "",
        name: "Ürün bulunamadı",
        imageUrl: null,
        brandName: null,
        requestedQuantity: inp.quantity,
        confirmedQuantity: 0,
        serverPrice: 0,
        lineTotal: 0,
        stockCapped: false,
        error: "NOT_FOUND" as const,
      }
    }

    const serverPrice = Number(row.price)
    const stock = Number(row.stock_quantity)
    const brandRow = Array.isArray(row.brands) ? row.brands[0] : row.brands
    const brandName = (brandRow as BrandRow | null)?.name ?? null

    if (stock <= 0) {
      hasHardError = true
      return {
        productId: inp.productId,
        slug: row.slug,
        sku: row.sku,
        name: row.name,
        imageUrl: row.image_url,
        brandName,
        requestedQuantity: inp.quantity,
        confirmedQuantity: 0,
        serverPrice,
        lineTotal: 0,
        stockCapped: true,
        error: "OUT_OF_STOCK" as const,
      }
    }

    const confirmedQty = Math.min(inp.quantity, stock)
    return {
      productId: inp.productId,
      slug: row.slug,
      sku: row.sku,
      name: row.name,
      imageUrl: row.image_url,
      brandName,
      requestedQuantity: inp.quantity,
      confirmedQuantity: confirmedQty,
      serverPrice,
      lineTotal: serverPrice * confirmedQty,
      stockCapped: confirmedQty < inp.quantity,
      error: null,
    }
  })

  const validItems = items.filter((i) => i.error === null)
  const subtotal = validItems.reduce((s, i) => s + i.lineTotal, 0)
  const shippingFee = subtotal >= storeSettings.freeShippingThreshold ? 0 : storeSettings.shippingCost
  const grandTotal = subtotal + shippingFee

  return { ok: !hasHardError, items, subtotal, shippingFee, grandTotal }
}
