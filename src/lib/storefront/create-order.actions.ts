"use server"

import { z } from "zod"
import { validateCheckoutCart } from "./checkout"
import { createServiceClient } from "@/lib/supabase/server"

// ── Input schemas ─────────────────────────────────────────────────────────────

const customerSchema = z.object({
  firstName: z.string().trim().min(2, "Ad en az 2 karakter olmalı").max(100),
  lastName:  z.string().trim().min(2, "Soyad en az 2 karakter olmalı").max(100),
  phone:     z.string().trim().min(10, "Geçerli bir telefon numarası girin").max(20),
  email:     z.string().trim().email("Geçerli bir e-posta adresi girin").transform(s => s.toLowerCase()),
})

const addressSchema = z.object({
  city:         z.string().trim().min(2, "Şehir gerekli").max(100),
  district:     z.string().trim().min(2, "İlçe gerekli").max(100),
  neighborhood: z.string().trim().max(200).optional(),
  addressLine:  z.string().trim().min(5, "Adres en az 5 karakter olmalı").max(500),
  postalCode:   z.string().trim().max(10).optional(),
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ── Return types ──────────────────────────────────────────────────────────────

export type OrderSuccess = {
  ok: true
  idempotent: boolean
  orderId: string
  orderNumber: string
  status: string
  subtotal: number
  shippingFee: number
  grandTotal: number
  reservationExpiresAt: string
}

export type OrderFailure = {
  ok: false
  error: string
  field?: string
  details?: string
}

export type OrderResult = OrderSuccess | OrderFailure

// ── Action ────────────────────────────────────────────────────────────────────

export async function createOrderAction(input: {
  items:            Array<{ productId: string; quantity: number }>
  customer:         unknown
  address:          unknown
  expectedSubtotal: number     // last server-computed subtotal shown to the user (PRICE_CHANGED detection)
  idempotencyKey:   string     // client-generated UUID for this checkout attempt
  legalConsent:     boolean    // user must affirm Mesafeli Satış Sözleşmesi before order is created
  notes?:           string
}): Promise<OrderResult> {

  // ── 0. Legal consent — must be explicitly true ────────────────────────────
  if (input.legalConsent !== true) {
    return { ok: false, error: "CONSENT_REQUIRED" }
  }

  // ── 1. Input size limits ───────────────────────────────────────────────────
  if (
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 50
  ) {
    return { ok: false, error: "INVALID_INPUT" }
  }

  // Idempotency key must be a valid UUID (server validates; client must supply)
  if (!UUID_RE.test(input.idempotencyKey ?? "")) {
    return { ok: false, error: "INVALID_INPUT" }
  }

  // ── 2. Customer + address Zod validation ──────────────────────────────────
  const customerParse = customerSchema.safeParse(input.customer)
  if (!customerParse.success) {
    const e = customerParse.error.issues[0]
    return {
      ok:      false,
      error:   "CUSTOMER_VALIDATION",
      field:   String(e?.path[0] ?? ""),
      details: e?.message ?? "Form bilgilerini kontrol edin",
    }
  }

  const addressParse = addressSchema.safeParse(input.address)
  if (!addressParse.success) {
    const e = addressParse.error.issues[0]
    return {
      ok:      false,
      error:   "ADDRESS_VALIDATION",
      field:   String(e?.path[0] ?? ""),
      details: e?.message ?? "Adres bilgilerini kontrol edin",
    }
  }

  const customer = customerParse.data
  const address  = addressParse.data

  // ── 3. UUID + quantity validation on items ────────────────────────────────
  const cleanItems = input.items
    .filter(
      (i) =>
        i !== null &&
        typeof i === "object" &&
        typeof i.productId === "string" &&
        UUID_RE.test(i.productId) &&
        typeof i.quantity === "number" &&
        Number.isInteger(i.quantity) &&
        i.quantity >= 1
    )
    .map((i) => ({ productId: i.productId, quantity: i.quantity }))

  if (cleanItems.length === 0) {
    return { ok: false, error: "INVALID_INPUT" }
  }

  // ── 4. Server-side cart re-validation ────────────────────────────────────
  // Trust boundary: all prices/stock/is_active re-fetched from DB here.
  // Client snapshot is never used for any calculation.
  const validation = await validateCheckoutCart(cleanItems)

  if (!validation.ok) {
    const errItem = validation.items.find((i) => i.error !== null)
    return { ok: false, error: errItem?.error ?? "VALIDATION_FAILED" }
  }

  // Deduplicate and use server-confirmed quantities (stock-capped)
  const rpcItems = validation.items
    .filter((i) => i.error === null)
    .map((i) => ({ productId: i.productId, quantity: i.confirmedQuantity }))

  // ── 5. Build RPC payloads ─────────────────────────────────────────────────
  // Address snapshot uses snake_case to match AddressSnapshot type in admin/orders.ts
  const shippingSnapshot = {
    first_name:   customer.firstName,
    last_name:    customer.lastName,
    phone:        customer.phone,
    city:         address.city,
    district:     address.district,
    neighborhood: address.neighborhood ?? null,
    address_line: address.addressLine,
    postal_code:  address.postalCode ?? null,
  }

  const customerJsonb = {
    email:     customer.email,
    firstName: customer.firstName,
    lastName:  customer.lastName,
    phone:     customer.phone,
  }

  // ── 6. Call RPC via service_role ─────────────────────────────────────────
  // service_role is required: orders/customers have no anon/authenticated INSERT policy.
  // The key never leaves server — this function has "use server" at the top of the file.
  const db = createServiceClient()

  const { data, error: rpcError } = await (db as ReturnType<typeof createServiceClient> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: any; error: any }>
  }).rpc("create_pending_order", {
    p_items:             rpcItems,
    p_customer:          customerJsonb,
    p_shipping_addr:     shippingSnapshot,
    p_billing_addr:      null,
    p_idempotency_key:   input.idempotencyKey,
    p_expected_subtotal: input.expectedSubtotal,
    p_notes:             input.notes ?? null,
  })

  if (rpcError) {
    console.error("[createOrderAction] RPC error:", rpcError.message ?? rpcError)
    return { ok: false, error: "INTERNAL_ERROR" }
  }

  if (!data || typeof data !== "object") {
    return { ok: false, error: "INTERNAL_ERROR" }
  }

  // ── 7. Map RPC response ───────────────────────────────────────────────────
  const r = data as Record<string, unknown>

  if (r.ok !== true) {
    // Structured error from RPC — never expose raw DB errors to client
    const code = typeof r.error === "string" ? r.error : "INTERNAL_ERROR"
    return { ok: false, error: code }
  }

  const orderId = String(r.orderId ?? "")

  return {
    ok:                   true,
    idempotent:           r.idempotent === true,
    orderId,
    orderNumber:          String(r.orderNumber ?? ""),
    status:               String(r.status ?? "pending_payment"),
    subtotal:             Number(r.subtotal ?? 0),
    shippingFee:          Number(r.shippingFee ?? 0),
    grandTotal:           Number(r.grandTotal ?? 0),
    reservationExpiresAt: String(r.reservationExpiresAt ?? ""),
  }
}
