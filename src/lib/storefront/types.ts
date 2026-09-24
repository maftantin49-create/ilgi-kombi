// Storefront domain types — DB field names (snake_case), not mock/frontend naming.
// These are the shapes returned by the public query layer.
// src/types/index.ts (mock types) coexists until Wave 1C page migration.

// ── Shared sub-types ──────────────────────────────────────────────────────────

export interface StorefrontBrand {
  id: string
  name: string
  slug: string
  is_featured: boolean
  logo_url: string | null
  sort_order: number
}

export interface StorefrontCategory {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
  is_featured: boolean
  image_url: string | null
  description: string | null
  seo_title: string | null
  seo_description: string | null
}

export interface StorefrontProductImage {
  id: string
  url: string
  alt_text: string | null
  sort_order: number
}

export interface StorefrontOEMCode {
  id: string
  code: string
  manufacturer: string | null
  sort_order: number
}

export interface StorefrontSpecification {
  id: string
  spec_key: string
  spec_value: string
  unit: string | null
  sort_order: number
}

export interface StorefrontCompatibleDevice {
  id: string
  family: string | null
  series: string | null
  model: string
  category: string | null
  year_from: number | null
  year_to: number | null
  brand: StorefrontBrand
}

// ── Product card — used in listing pages ──────────────────────────────────────

export interface StorefrontProductCard {
  id: string
  slug: string
  sku: string
  name: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  image_url: string | null
  hover_image_url: string | null
  is_featured: boolean
  is_new: boolean
  same_day_shipping: boolean
  brand: StorefrontBrand | null
  category: Pick<StorefrontCategory, "id" | "name" | "slug"> | null
}

// ── Product detail — used on product detail page ──────────────────────────────

export interface StorefrontProductDetail extends Omit<StorefrontProductCard, "category"> {
  description: string | null
  seo_title: string | null
  seo_description: string | null
  category: Pick<StorefrontCategory, "id" | "name" | "slug" | "parent_id"> | null
  images: StorefrontProductImage[]
  oem_codes: StorefrontOEMCode[]
  specifications: StorefrontSpecification[]
  compatible_devices: StorefrontCompatibleDevice[]
}

// ── Domain helpers ─────────────────────────────────────────────────────────────

export type ProductAvailability = "available" | "out_of_stock" | "price_on_request"

export function getProductAvailability(
  product: Pick<StorefrontProductCard, "price" | "stock_quantity">
): ProductAvailability {
  if (product.stock_quantity <= 0) return "out_of_stock"
  if (product.price <= 0) return "price_on_request"
  return "available"
}

export function canAddToCart(
  product: Pick<StorefrontProductCard, "price" | "stock_quantity">
): boolean {
  return product.price > 0 && product.stock_quantity > 0
}

// ── Image helpers ──────────────────────────────────────────────────────────────

export const PRODUCT_IMAGE_PLACEHOLDER = "/images/product-placeholder.png"

export function getProductImageUrl(imageUrl: string | null | undefined): string {
  return imageUrl ?? PRODUCT_IMAGE_PLACEHOLDER
}
