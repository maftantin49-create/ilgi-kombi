"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// ── Domain types ──────────────────────────────────────────────────────────────

// Minimal client-side snapshot of a product in the cart.
// TRUST BOUNDARY: these are optimistic client values.
// Checkout MUST re-validate productId → is_active, current price, current stock
// from the server before accepting an order. (Wave 1F debt)
export interface CartItem {
  productId: string
  slug: string
  sku: string
  name: string
  imageUrl: string | null
  brandName: string | null
  unitPrice: number        // price snapshot at time of add
  stockQuantity: number    // stock snapshot at time of add (soft cap — not DB-authoritative)
  trackStock: boolean      // when false: no stock cap on quantity
  quantity: number
}

// Structural input type for toCartItem() — satisfied by both
// StorefrontProductCard and StorefrontProductDetail without explicit import.
export interface CartableProduct {
  id: string
  slug: string
  sku: string
  name: string
  image_url: string | null
  price: number
  stock_quantity: number
  track_stock?: boolean
  brand?: { name: string } | null
}

// ── Adapter ───────────────────────────────────────────────────────────────────

// Single adapter for StorefrontProductCard and StorefrontProductDetail → CartItem.
// Callers (listing, detail) use this so the conversion logic is never duplicated.
export function toCartItem(product: CartableProduct, quantity = 1): CartItem {
  const tracked = product.track_stock ?? true
  const safeQty = tracked
    ? Math.max(1, Math.min(quantity, product.stock_quantity))
    : Math.max(1, quantity)
  return {
    productId: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    imageUrl: product.image_url,
    brandName: product.brand?.name ?? null,
    unitPrice: product.price,
    stockQuantity: product.stock_quantity,
    trackStock: tracked,
    quantity: safeQty,
  }
}

// ── Guards ────────────────────────────────────────────────────────────────────

// Store-level safety net: UI disable is not the sole guard.
function isAddable(item: CartItem): boolean {
  return (
    item.unitPrice > 0 &&
    Number.isFinite(item.unitPrice) &&
    (!item.trackStock || (item.stockQuantity > 0 && Number.isFinite(item.stockQuantity))) &&
    item.quantity >= 1
  )
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

// ── Migration helper ──────────────────────────────────────────────────────────
// v0/v1 stored full mock Product inside CartItem.product.
// v2 uses flat CartItem snapshot. Safe-convert where possible, clear otherwise.

function migrateFromV0(state: unknown): { items: CartItem[] } {
  try {
    type OldItem = {
      product?: {
        id?: string
        slug?: string
        sku?: string
        name?: string
        image?: string
        price?: number
        stock?: number
        brand?: string
      }
      quantity?: number
    }
    const old = state as { items?: OldItem[] }
    if (!Array.isArray(old?.items)) return { items: [] }

    const items: CartItem[] = old.items
      .filter(
        (i): i is Required<OldItem> =>
          !!i?.product?.id &&
          typeof i.product.price === "number" &&
          i.product.price > 0 &&
          typeof i.product.stock === "number" &&
          i.product.stock > 0
      )
      .map((i) => ({
        productId: i.product.id!,
        slug: i.product.slug ?? "",
        sku: i.product.sku ?? "",
        name: i.product.name ?? "",
        imageUrl: i.product.image ?? null,
        brandName: i.product.brand ?? null,
        unitPrice: i.product.price!,
        stockQuantity: i.product.stock!,
        trackStock: true,
        quantity: Math.max(1, i.quantity ?? 1),
      }))

    return { items }
  } catch {
    return { items: [] }
  }
}

// ── Zustand store ─────────────────────────────────────────────────────────────

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (!isAddable(item)) return

        const existing = get().items.find((i) => i.productId === item.productId)
        if (existing) {
          const uncapped = existing.quantity + item.quantity
          const newQty = item.trackStock
            ? Math.min(uncapped, item.stockQuantity)
            : uncapped
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQty } : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) => {
            if (i.productId !== productId) return i
            const capped = i.trackStock ? Math.min(quantity, i.stockQuantity) : quantity
            return { ...i, quantity: capped }
          }),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => {
          const line = i.unitPrice * i.quantity
          return sum + (Number.isFinite(line) && line > 0 ? line : 0)
        }, 0),
    }),
    {
      name: "ilgikombi-cart",
      version: 2,
      migrate: (state, fromVersion) => {
        if (fromVersion < 2) return migrateFromV0(state)
        return state as { items: CartItem[] }
      },
    }
  )
)
