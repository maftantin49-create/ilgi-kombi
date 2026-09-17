import { createServiceClient } from "@/lib/supabase/server"

export const PAYMENTS_PAGE_SIZE = 30

export type PaymentFilters = {
  orderNumber?: string
  providerPaymentId?: string
  status?: string    // payment_status value or "__failed" (failed + cancelled)
  provider?: string
  dateFrom?: string
  dateTo?: string
  page?: number
}

export type PaymentListItem = {
  id: string
  order_id: string
  attempt_number: number
  provider: string
  provider_payment_id: string | null
  status: string
  amount: number
  currency: string
  installment: number | null
  created_at: string
  completed_at: string | null
  orders: {
    order_number: string
    status: string
    customers: {
      first_name: string
      last_name: string
      email: string | null
    } | null
  } | null
}

export type PaymentAttempt = {
  id: string
  attempt_number: number
  status: string
  amount: number
  currency: string
  provider: string
  created_at: string
  completed_at: string | null
}

export type PaymentDetail = {
  id: string
  order_id: string
  attempt_number: number
  provider: string
  provider_payment_id: string | null
  conversation_id: string
  status: string
  amount: number
  currency: string
  installment: number | null
  // sanitized_response is redacted before use — never exposed raw
  sanitized_response: unknown | null
  created_at: string
  completed_at: string | null
  orders: {
    id: string
    order_number: string
    status: string
    payment_status: string
    grand_total: number
    customer_id: string | null
    customers: {
      first_name: string
      last_name: string
      email: string | null
      phone: string | null
    } | null
  } | null
  attempts: PaymentAttempt[]
}

// ── Sensitive key redaction ────────────────────────────────────────────────────
// Applied server-side before any rendering. Never expose raw sanitized_response.

const REDACT_KEYS = new Set([
  "authorization",
  "token",
  "access_token",
  "accesstoken",
  "secret",
  "api_key",
  "apikey",
  "signature",
  "conversationdata",
  "paymentcard",
  "cardnumber",
  "pan",
  "cvv",
  "cvc",
  "cardholdername",
  "binnumber",
  "hmac",
  "hash",
  "checksum",
  "callbackurl",
  "returnurl",
  "password",
  "passwd",
  "3dsecretkey",
  "authenticationkey",
])

export function redactSensitive(value: unknown): unknown {
  if (value === null || value === undefined) return value
  if (typeof value !== "object") return value
  if (Array.isArray(value)) return value.map(redactSensitive)

  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (REDACT_KEYS.has(key.toLowerCase())) {
      result[key] = "[REDACTED]"
    } else {
      result[key] = redactSensitive(val)
    }
  }
  return result
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getPayments(filters: PaymentFilters) {
  const db = createServiceClient()
  const page = Math.max(1, filters.page ?? 1)
  const offset = (page - 1) * PAYMENTS_PAGE_SIZE

  // Order number search requires a pre-fetch (no direct column on payments)
  let orderIdFilter: string[] | null = null
  if (filters.orderNumber) {
    const { data: matchingOrders } = await db
      .from("orders")
      .select("id")
      .ilike("order_number", `%${filters.orderNumber}%`)
      .limit(200)

    orderIdFilter = ((matchingOrders ?? []) as { id: string }[]).map((o) => o.id)
    // If no orders matched, return early — no payments can match
    if (orderIdFilter.length === 0) {
      return { payments: [], count: 0, page, pageSize: PAYMENTS_PAGE_SIZE }
    }
  }

  // CRITICAL: token and sanitized_response are intentionally excluded from the list query.
  // token = provider-specific payment token (sensitive — must not be displayed)
  // sanitized_response = too large for list; errorCode extracted in detail view only
  let query = db
    .from("payments")
    .select(
      "id, order_id, attempt_number, provider, provider_payment_id, status, amount, currency, installment, created_at, completed_at, orders(order_number, status, customers(first_name, last_name, email))",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  if (orderIdFilter !== null) {
    query = query.in("order_id", orderIdFilter)
  }

  if (filters.providerPaymentId) {
    query = query.ilike("provider_payment_id", `%${filters.providerPaymentId}%`)
  }

  if (filters.status === "__failed") {
    query = query.in("status", ["failed", "cancelled"])
  } else if (filters.status === "__success") {
    query = query.eq("status", "success")
  } else if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.provider) {
    query = query.ilike("provider", `%${filters.provider}%`)
  }

  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo + "T23:59:59.999Z")
  }

  const { data, count } = await query.range(offset, offset + PAYMENTS_PAGE_SIZE - 1)

  return {
    payments: (data ?? []) as unknown as PaymentListItem[],
    count: count ?? 0,
    page,
    pageSize: PAYMENTS_PAGE_SIZE,
  }
}

export async function getPaymentById(id: string): Promise<PaymentDetail | null> {
  const db = createServiceClient()

  // CRITICAL: token is explicitly excluded. sanitized_response is fetched here
  // only for the detail view and is ALWAYS passed through redactSensitive() before rendering.
  const { data: paymentData } = await db
    .from("payments")
    .select(
      "id, order_id, attempt_number, provider, provider_payment_id, conversation_id, status, amount, currency, installment, sanitized_response, created_at, completed_at, orders(id, order_number, status, payment_status, grand_total, customer_id, customers(first_name, last_name, email, phone))"
    )
    .eq("id", id)
    .single()

  if (!paymentData) return null

  const payment = paymentData as unknown as Omit<PaymentDetail, "attempts">

  // Fetch all payment attempts for the same order (retry history)
  const { data: attemptsData } = await db
    .from("payments")
    .select(
      "id, attempt_number, status, amount, currency, provider, created_at, completed_at"
    )
    .eq("order_id", payment.order_id)
    .order("attempt_number")

  return {
    ...payment,
    attempts: (attemptsData ?? []) as PaymentAttempt[],
  }
}
