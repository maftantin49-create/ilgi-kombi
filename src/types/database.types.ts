// ─────────────────────────────────────────────────────────────────────────────
// database.types.ts — Supabase şema tip taslağı
// Bu dosya elle yazılmıştır. Migration çalıştırıldıktan sonra:
//   npx supabase gen types typescript --local > src/types/database.types.ts
// komutuyla otomatik olarak yeniden üretilmelidir.
// ─────────────────────────────────────────────────────────────────────────────

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ── Enum tipleri ──────────────────────────────────────────────────────────────

export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "partially_refunded"

export type PaymentStatus =
  | "initialized"
  | "pending"
  | "success"
  | "failed"
  | "cancelled"
  | "refunded"

export type InventoryMovementType =
  | "sale"
  | "return"
  | "manual_adjustment"
  | "restock"
  | "reservation"
  | "reservation_release"

export type AddressType = "shipping" | "billing" | "both"

export type AdminRole = "super_admin" | "admin" | "staff"

export type ReservationStatus = "active" | "converted" | "released" | "expired"

// ── Tablo row tipleri ─────────────────────────────────────────────────────────

export interface Brand {
  id: string
  slug: string
  name: string
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  slug: string
  name: string
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  slug: string
  sku: string
  name: string
  description: string | null
  price: number
  compare_at_price: number | null
  stock_quantity: number
  brand_id: string | null
  category_id: string | null
  compatible_brands: Json | null  // string[]
  image_url: string | null
  hover_image_url: string | null
  is_active: boolean
  is_featured: boolean
  is_new: boolean
  same_day_shipping: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  storage_path: string
  alt_text: string | null
  sort_order: number
  created_at: string
}

export interface ProductOemCode {
  id: string
  product_id: string
  code: string
  code_norm: string
  manufacturer: string | null
  note: string | null
  sort_order: number
  created_at: string
}

// product_specifications has no created_at — see migration 020
export interface ProductSpecification {
  id: string
  product_id: string
  spec_key: string
  spec_key_norm: string
  spec_value: string
  unit: string | null
  sort_order: number
}

export interface DeviceModel {
  id: string
  brand_id: string
  family: string | null
  series: string | null
  model: string
  model_norm: string
  category: string | null
  year_from: number | null
  year_to: number | null
  is_active: boolean
  created_at: string
}

// Junction table — PK is (product_id, device_model_id)
export interface ProductDeviceModel {
  product_id: string
  device_model_id: string
  note: string | null
  created_at: string
}

export interface Customer {
  id: string
  auth_user_id: string | null
  email: string | null
  phone: string | null
  first_name: string
  last_name: string
  company_name: string | null
  tax_number: string | null
  is_guest: boolean
  marketing_consent: boolean
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  customer_id: string
  title: string
  first_name: string
  last_name: string
  phone: string | null
  city: string
  district: string
  neighborhood: string | null
  address_line: string
  postal_code: string | null
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string | null
  status: OrderStatus
  payment_status: PaymentStatus
  subtotal: number
  shipping_fee: number
  discount_total: number
  grand_total: number
  currency: string
  shipping_address_snapshot: Json
  billing_address_snapshot: Json | null
  notes: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  sku_snapshot: string
  product_name_snapshot: string
  unit_price: number
  quantity: number
  line_total: number
}

export interface Payment {
  id: string
  order_id: string
  attempt_number: number
  provider: string
  provider_payment_id: string | null
  conversation_id: string
  token: string | null
  status: PaymentStatus
  amount: number
  currency: string
  installment: number | null
  sanitized_response: Json | null
  created_at: string
  completed_at: string | null
}

export interface InventoryReservation {
  id: string
  product_id: string
  order_id: string
  quantity: number
  status: ReservationStatus
  expires_at: string
  created_at: string
}

export interface InventoryMovement {
  id: string
  product_id: string
  order_id: string | null
  type: InventoryMovementType
  quantity: number
  reason: string | null
  created_at: string
}

export interface AdminProfile {
  id: string
  auth_user_id: string
  role: AdminRole
  is_active: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  actor_user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: Json | null
  created_at: string
}

export interface PublicSetting {
  key: string
  value: Json
  updated_at: string
}

export interface SystemSetting {
  key: string
  value: Json
  updated_at: string
}

// ── Supabase Database tipi (createClient<Database>() için) ───────────────────

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: Brand
        Insert: Omit<Brand, "id" | "created_at"> & Partial<Pick<Brand, "id" | "created_at">>
        Update: Partial<Omit<Brand, "id">>
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: Omit<Category, "id" | "created_at"> & Partial<Pick<Category, "id" | "created_at">>
        Update: Partial<Omit<Category, "id">>
        Relationships: []
      }
      products: {
        Row: Product
        Insert: Omit<Product, "id" | "created_at" | "updated_at"> & Partial<Pick<Product, "id" | "created_at" | "updated_at">>
        Update: Partial<Omit<Product, "id">>
        Relationships: []
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, "id" | "created_at"> & Partial<Pick<ProductImage, "id" | "created_at">>
        Update: Partial<Omit<ProductImage, "id">>
        Relationships: []
      }
      product_oem_codes: {
        Row: ProductOemCode
        Insert: Omit<ProductOemCode, "id" | "created_at"> & Partial<Pick<ProductOemCode, "id" | "created_at">>
        Update: Partial<Omit<ProductOemCode, "id">>
        Relationships: []
      }
      product_specifications: {
        Row: ProductSpecification
        Insert: Omit<ProductSpecification, "id"> & Partial<Pick<ProductSpecification, "id">>
        Update: Partial<Omit<ProductSpecification, "id">>
        Relationships: []
      }
      device_models: {
        Row: DeviceModel
        Insert: Omit<DeviceModel, "id" | "created_at"> & Partial<Pick<DeviceModel, "id" | "created_at">>
        Update: Partial<Omit<DeviceModel, "id">>
        Relationships: []
      }
      product_device_models: {
        Row: ProductDeviceModel
        Insert: Omit<ProductDeviceModel, "created_at"> & Partial<Pick<ProductDeviceModel, "created_at">>
        Update: Partial<Pick<ProductDeviceModel, "note">>
        Relationships: []
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, "id" | "created_at" | "updated_at"> & Partial<Pick<Customer, "id" | "created_at" | "updated_at">>
        Update: Partial<Omit<Customer, "id">>
        Relationships: []
      }
      addresses: {
        Row: Address
        Insert: Omit<Address, "id" | "created_at"> & Partial<Pick<Address, "id" | "created_at">>
        Update: Partial<Omit<Address, "id">>
        Relationships: []
      }
      orders: {
        Row: Order
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & Partial<Pick<Order, "id" | "created_at" | "updated_at">>
        Update: Partial<Omit<Order, "id">>
        Relationships: []
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, "id"> & Partial<Pick<OrderItem, "id">>
        Update: Partial<Omit<OrderItem, "id">>
        Relationships: []
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, "id" | "created_at"> & Partial<Pick<Payment, "id" | "created_at">>
        Update: Partial<Omit<Payment, "id">>
        Relationships: []
      }
      inventory_reservations: {
        Row: InventoryReservation
        Insert: Omit<InventoryReservation, "id" | "created_at"> & Partial<Pick<InventoryReservation, "id" | "created_at">>
        Update: Partial<Omit<InventoryReservation, "id">>
        Relationships: []
      }
      inventory_movements: {
        Row: InventoryMovement
        Insert: Omit<InventoryMovement, "id" | "created_at"> & Partial<Pick<InventoryMovement, "id" | "created_at">>
        Update: Partial<Omit<InventoryMovement, "id">>
        Relationships: []
      }
      admin_profiles: {
        Row: AdminProfile
        Insert: Omit<AdminProfile, "id" | "created_at"> & Partial<Pick<AdminProfile, "id" | "created_at">>
        Update: Partial<Omit<AdminProfile, "id">>
        Relationships: []
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, "id" | "created_at"> & Partial<Pick<AuditLog, "id" | "created_at">>
        Update: Partial<Omit<AuditLog, "id">>
        Relationships: []
      }
      public_settings: {
        Row: PublicSetting
        Insert: PublicSetting
        Update: Partial<PublicSetting>
        Relationships: []
      }
      system_settings: {
        Row: SystemSetting
        Insert: SystemSetting
        Update: Partial<SystemSetting>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      admin_stock_adjustment: {
        Args: {
          p_product_id: string
          p_operation: string
          p_quantity: number
          p_reason: string
          p_actor_id: string
        }
        Returns: Json
      }
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      create_order_atomic: {
        Args: {
          p_items: Json
          p_customer_id: string | null
          p_shipping_addr: Json
          p_billing_addr: Json | null
        }
        Returns: Json
      }
      create_payment_attempt: {
        Args: {
          p_order_id: string
          p_conversation_id: string
          p_amount: number
          p_provider?: string
        }
        Returns: Json
      }
    }
    CompositeTypes: Record<string, never>
    Enums: {
      order_status: OrderStatus
      payment_status: PaymentStatus
      inventory_movement_type: InventoryMovementType
      address_type: AddressType
      admin_role: AdminRole
      reservation_status: ReservationStatus
    }
  }
}
