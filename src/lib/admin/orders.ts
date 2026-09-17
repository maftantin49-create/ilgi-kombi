import { createServiceClient } from "@/lib/supabase/server"

export const ORDERS_PAGE_SIZE = 25

export type OrderFilters = {
  search?: string
  status?: string
  paymentStatus?: string
  dateFrom?: string
  dateTo?: string
  page?: number
}

export type OrderListItem = {
  id: string
  order_number: string
  status: string
  payment_status: string
  grand_total: number
  currency: string
  created_at: string
  paid_at: string | null
  customer_id: string | null
  customers: {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  } | null
  order_items: { id: string }[]
}

export type AddressSnapshot = {
  title?: string
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  district?: string
  neighborhood?: string
  address_line?: string
  postal_code?: string
}

export type OrderDetailItem = {
  id: string
  sku_snapshot: string
  product_name_snapshot: string
  unit_price: number
  quantity: number
  line_total: number
  product_id: string | null
}

export type OrderDetail = {
  id: string
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  shipping_fee: number
  discount_total: number
  grand_total: number
  currency: string
  notes: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
  customer_id: string | null
  shipping_address_snapshot: AddressSnapshot
  billing_address_snapshot: AddressSnapshot | null
  customers: {
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    company_name: string | null
  } | null
  order_items: OrderDetailItem[]
}

export async function getOrders(filters: OrderFilters) {
  const db = createServiceClient()
  const page = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * ORDERS_PAGE_SIZE

  let query = db
    .from("orders")
    .select(
      "id, order_number, status, payment_status, grand_total, currency, created_at, paid_at, customer_id, customers(first_name, last_name, email, phone), order_items(id)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (filters.search) {
    const s = filters.search
    // Find customers matching email or phone for cross-table search (2 queries, not N+1)
    const { data: matchingCustomers } = await db
      .from("customers")
      .select("id")
      .or(`email.ilike.%${s}%,phone.ilike.%${s}%`)
      .limit(100)

    const customerIds = ((matchingCustomers ?? []) as { id: string }[]).map((c) => c.id)

    if (customerIds.length > 0) {
      query = query.or(
        `order_number.ilike.%${s}%,customer_id.in.(${customerIds.join(",")})`
      )
    } else {
      query = query.ilike("order_number", `%${s}%`)
    }
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.paymentStatus) {
    query = query.eq("payment_status", filters.paymentStatus)
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo + "T23:59:59.999Z")
  }

  const { data, count } = await query.range(offset, offset + ORDERS_PAGE_SIZE - 1)

  return {
    orders: (data ?? []) as OrderListItem[],
    count: count ?? 0,
    page,
    pageSize: ORDERS_PAGE_SIZE,
  }
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const db = createServiceClient()

  const { data } = await db
    .from("orders")
    .select(
      "id, order_number, status, payment_status, subtotal, shipping_fee, discount_total, grand_total, currency, notes, created_at, updated_at, paid_at, customer_id, shipping_address_snapshot, billing_address_snapshot, customers(first_name, last_name, email, phone, company_name), order_items(id, sku_snapshot, product_name_snapshot, unit_price, quantity, line_total, product_id)"
    )
    .eq("id", id)
    .single()

  if (!data) return null
  return data as unknown as OrderDetail
}
