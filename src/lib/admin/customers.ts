import { createServiceClient } from "@/lib/supabase/server"

export const CUSTOMERS_PAGE_SIZE = 25

export type CustomerFilters = {
  search?: string
  isGuest?: string    // "true" | "false" | undefined
  hasOrders?: string  // "yes" | "no" | undefined
  dateFrom?: string
  dateTo?: string
  page?: number
}

export type CustomerListItem = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company_name: string | null
  is_guest: boolean
  created_at: string
  // Computed from orders aggregation
  order_count: number
  total_spent: number
  last_order_at: string | null
}

export type CustomerAddress = {
  id: string
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

export type CustomerOrderSummary = {
  id: string
  order_number: string
  status: string
  payment_status: string
  grand_total: number
  currency: string
  created_at: string
}

export type CustomerMetrics = {
  order_count: number
  total_spent: number
  avg_order_value: number
  first_order_at: string | null
  last_order_at: string | null
}

export type CustomerRow = {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company_name: string | null
  tax_number: string | null
  is_guest: boolean
  marketing_consent: boolean
  created_at: string
  updated_at: string
}

export type CustomerDetail = {
  customer: CustomerRow
  addresses: CustomerAddress[]
  orders: CustomerOrderSummary[]
  metrics: CustomerMetrics
}

type RawOrderAgg = {
  customer_id: string
  grand_total: number
  created_at: string
}

function computeMetrics(orders: CustomerOrderSummary[]): CustomerMetrics {
  if (orders.length === 0) {
    return { order_count: 0, total_spent: 0, avg_order_value: 0, first_order_at: null, last_order_at: null }
  }
  // Orders arrive sorted by created_at DESC
  const total_spent = orders.reduce((sum, o) => sum + Number(o.grand_total), 0)
  return {
    order_count: orders.length,
    total_spent,
    avg_order_value: total_spent / orders.length,
    last_order_at: orders[0].created_at,
    first_order_at: orders[orders.length - 1].created_at,
  }
}

export async function getCustomers(filters: CustomerFilters) {
  const db = createServiceClient()
  const page = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * CUSTOMERS_PAGE_SIZE

  // ── hasOrders pre-filter (2 queries: orders → customer_ids → IN/NOT IN) ──────
  // Note: fetches all non-null customer_ids from orders; acceptable for small catalogs.
  let orderCustomerIds: string[] | null = null
  if (filters.hasOrders === "yes" || filters.hasOrders === "no") {
    const { data: orderRows } = await db
      .from("orders")
      .select("customer_id")
      .not("customer_id", "is", null)

    orderCustomerIds = [
      ...new Set(
        ((orderRows ?? []) as { customer_id: string }[]).map((r) => r.customer_id)
      ),
    ]
  }

  let query = db
    .from("customers")
    .select(
      "id, first_name, last_name, email, phone, company_name, is_guest, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (filters.search) {
    const s = filters.search
    query = query.or(
      `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%,company_name.ilike.%${s}%`
    )
  }

  if (filters.isGuest === "true") {
    query = query.eq("is_guest", true)
  } else if (filters.isGuest === "false") {
    query = query.eq("is_guest", false)
  }

  if (filters.hasOrders === "yes" && orderCustomerIds !== null) {
    if (orderCustomerIds.length === 0) {
      return { customers: [], count: 0, page, pageSize: CUSTOMERS_PAGE_SIZE }
    }
    query = query.in("id", orderCustomerIds)
  } else if (filters.hasOrders === "no" && orderCustomerIds !== null) {
    if (orderCustomerIds.length > 0) {
      query = query.not("id", "in", `(${orderCustomerIds.join(",")})`)
    }
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo + "T23:59:59.999Z")
  }

  const { data: customerRows, count } = await query.range(
    offset,
    offset + CUSTOMERS_PAGE_SIZE - 1
  )

  if (!customerRows || customerRows.length === 0) {
    return { customers: [], count: count ?? 0, page, pageSize: CUSTOMERS_PAGE_SIZE }
  }

  // ── Aggregate orders for this page's customers ──────────────────────────────
  const customerIds = (customerRows as { id: string }[]).map((c) => c.id)

  const { data: aggRows } = await db
    .from("orders")
    .select("customer_id, grand_total, created_at")
    .in("customer_id", customerIds)

  type AggEntry = { count: number; total: number; lastAt: string | null }
  const aggMap = new Map<string, AggEntry>()

  for (const row of ((aggRows ?? []) as RawOrderAgg[])) {
    const existing = aggMap.get(row.customer_id) ?? { count: 0, total: 0, lastAt: null }
    existing.count++
    existing.total += Number(row.grand_total)
    if (!existing.lastAt || row.created_at > existing.lastAt) {
      existing.lastAt = row.created_at
    }
    aggMap.set(row.customer_id, existing)
  }

  const customers: CustomerListItem[] = (customerRows as CustomerListItem[]).map((c) => {
    const agg = aggMap.get(c.id)
    return {
      ...c,
      order_count: agg?.count ?? 0,
      total_spent: agg?.total ?? 0,
      last_order_at: agg?.lastAt ?? null,
    }
  })

  return { customers, count: count ?? 0, page, pageSize: CUSTOMERS_PAGE_SIZE }
}

export async function getCustomerById(id: string): Promise<CustomerDetail | null> {
  const db = createServiceClient()

  // Sequential awaits — avoids TypeScript 5.9 + Supabase 2.x Promise.all never issue
  const { data: customerData } = await db
    .from("customers")
    .select(
      "id, first_name, last_name, email, phone, company_name, tax_number, is_guest, marketing_consent, created_at, updated_at"
    )
    .eq("id", id)
    .single()

  if (!customerData) return null

  const { data: addressData } = await db
    .from("addresses")
    .select(
      "id, title, first_name, last_name, phone, city, district, neighborhood, address_line, postal_code, is_default, created_at"
    )
    .eq("customer_id", id)
    .order("is_default", { ascending: false })
    .order("created_at")

  const { data: orderData } = await db
    .from("orders")
    .select("id, order_number, status, payment_status, grand_total, currency, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })

  const orders = (orderData ?? []) as CustomerOrderSummary[]

  return {
    customer: customerData as unknown as CustomerRow,
    addresses: (addressData ?? []) as CustomerAddress[],
    orders,
    metrics: computeMetrics(orders),
  }
}
