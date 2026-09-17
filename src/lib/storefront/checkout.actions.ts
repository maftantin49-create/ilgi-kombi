"use server"

import {
  validateCheckoutCart,
  type CheckoutInputItem,
  type CheckoutValidationResult,
} from "./checkout"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MAX_ITEMS = 50

const EMPTY: CheckoutValidationResult = {
  ok: false,
  items: [],
  subtotal: 0,
  shippingFee: 0,
  grandTotal: 0,
}

// Trust boundary: only productId + quantity accepted from client.
// All prices, availability, and totals are re-fetched from DB.
// UUID format is validated to prevent malformed PostgREST queries.
export async function validateCheckoutAction(
  rawItems: Array<{ productId: string; quantity: number }>
): Promise<CheckoutValidationResult> {
  if (!Array.isArray(rawItems) || rawItems.length === 0) return EMPTY

  const input: CheckoutInputItem[] = rawItems
    .slice(0, MAX_ITEMS)
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

  if (input.length === 0) return EMPTY

  return validateCheckoutCart(input)
}
