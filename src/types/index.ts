export interface Product {
  id: string
  name: string
  slug: string
  category: string
  subcategory: string
  brand: string
  compatibleBrands: string[]
  price: number
  originalPrice?: number
  stock: number
  sku: string
  image: string
  hoverImage?: string
  description: string
  isNew?: boolean
  isFeatured?: boolean
  sameDayShipping: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  productCount: number
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  slug: string
}

export interface CartItem {
  product: Product
  quantity: number
}
