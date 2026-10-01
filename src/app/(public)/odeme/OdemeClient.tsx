"use client"

import { useEffect, useTransition, useState, useRef } from "react"
import Link from "next/link"
import ProductImage from "@/components/product/ProductImage"
import {
  ArrowLeft, ShoppingBag, AlertCircle, AlertTriangle,
  Loader2, CheckCircle2, RefreshCw,
} from "lucide-react"
import { useCart } from "@/lib/cart"
import { validateCheckoutAction } from "@/lib/storefront/checkout.actions"
import { createOrderAction, type OrderResult } from "@/lib/storefront/create-order.actions"
import type { CheckoutValidationResult, ValidatedCheckoutItem } from "@/lib/storefront/checkout"
import { getProductImageUrl } from "@/lib/storefront/types"
import { buildWa } from "@/lib/whatsapp"
import { Button } from "@/components/ui/button"

// ── Error messages (Turkish) ──────────────────────────────────────────────────

function itemErrorMsg(error: ValidatedCheckoutItem["error"]): string {
  switch (error) {
    case "NOT_FOUND":     return "Bu ürün artık mevcut değil."
    case "OUT_OF_STOCK":  return "Bu ürün stokta kalmadı."
    default:              return ""
  }
}

function orderErrorMsg(code: string, details?: string): string {
  switch (code) {
    case "PRICE_CHANGED":
      return "Ürün fiyatları güncellendi. Lütfen aşağıdaki yeni fiyatları inceleyip tekrar deneyin."
    case "INSUFFICIENT_STOCK":
      return "Bir veya daha fazla ürünün stoğu değişti. Lütfen sepetinizi kontrol edin."
    case "PRODUCT_NOT_FOUND":
    case "INACTIVE_PRODUCT":
      return "Bazı ürünler artık mevcut değil. Lütfen sepete dönüp kaldırın."
    case "CUSTOMER_VALIDATION":
    case "ADDRESS_VALIDATION":
      return details ?? "Lütfen form bilgilerini kontrol edin."
    case "MISSING_SHIPPING_CONFIG":
      return "Kargo yapılandırması eksik. Lütfen tekrar deneyin."
    case "DUPLICATE_REQUEST":
      return "Bu sipariş zaten oluşturuldu."
    case "CONSENT_REQUIRED":
      return "Devam etmek için Mesafeli Satış Sözleşmesi'ni onaylamanız gerekiyor."
    default:
      return "Teknik bir hata oluştu. Lütfen tekrar deneyin."
  }
}

// ── Submit state machine ──────────────────────────────────────────────────────

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; result: Extract<OrderResult, { ok: true }> }
  | { status: "error"; code: string; details?: string }

// ── Form field component ──────────────────────────────────────────────────────

function FormInput({
  label,
  required,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition-all placeholder:text-gray-400"
      />
    </div>
  )
}

// ── Form state ────────────────────────────────────────────────────────────────

interface CustomerForm {
  firstName:    string
  lastName:     string
  phone:        string
  email:        string
  city:         string
  district:     string
  neighborhood: string
  addressLine:  string
  postalCode:   string
  notes:        string
}

const emptyForm: CustomerForm = {
  firstName: "", lastName: "", phone: "", email: "",
  city: "", district: "", neighborhood: "",
  addressLine: "", postalCode: "", notes: "",
}

function isFormValid(f: CustomerForm): boolean {
  return (
    f.firstName.trim().length >= 2 &&
    f.lastName.trim().length >= 2 &&
    f.phone.trim().length >= 10 &&
    f.email.trim().includes("@") &&
    f.city.trim().length >= 2 &&
    f.district.trim().length >= 2 &&
    f.addressLine.trim().length >= 5
  )
}

// ── Main client component ─────────────────────────────────────────────────────

export default function OdemeClient({ waNumber }: { waNumber: string | null }) {
  const wa = buildWa(waNumber)

  const { items: cartItems, totalItems } = useCart()
  const count = totalItems()

  // Idempotency key: one UUID per page load, reset only on success
  const idempotencyKey = useRef<string>(crypto.randomUUID())

  // Validation (cart re-check from server)
  const [isValidating, startValidation] = useTransition()
  const [validation, setValidation] = useState<CheckoutValidationResult | null>(null)
  const [revalidationKey, setRevalidationKey] = useState(0) // increment to force re-validation

  // Order submission
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" })

  // Customer form
  const [form, setForm] = useState<CustomerForm>(emptyForm)
  const setField =
    (field: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  // Legal consent — Mesafeli Satış Sözleşmesi onayı
  const [legalConsent, setLegalConsent] = useState(false)

  // Re-validate cart whenever cart items or revalidation key changes
  useEffect(() => {
    if (cartItems.length === 0) return
    startValidation(async () => {
      const result = await validateCheckoutAction(
        cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      )
      setValidation(result)
    })
  }, [cartItems, revalidationKey])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitState.status === "submitting") return
    if (!validation?.ok) return
    if (!legalConsent) return  // UI guard — server action enforces independently

    setSubmitState({ status: "submitting" })

    const result = await createOrderAction({
      items:            cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      customer: {
        firstName: form.firstName,
        lastName:  form.lastName,
        phone:     form.phone,
        email:     form.email,
      },
      address: {
        city:         form.city,
        district:     form.district,
        neighborhood: form.neighborhood || undefined,
        addressLine:  form.addressLine,
        postalCode:   form.postalCode || undefined,
      },
      expectedSubtotal: validation.subtotal,
      idempotencyKey:   idempotencyKey.current,
      legalConsent,
      notes:            form.notes || undefined,
    })

    if (result.ok) {
      idempotencyKey.current = crypto.randomUUID() // consume key, ready for next attempt
      setSubmitState({ status: "success", result })
    } else {
      setSubmitState({ status: "error", code: result.error, details: result.details })
      // On price change: force re-validation so user sees new prices
      if (result.error === "PRICE_CHANGED") {
        setRevalidationKey((k) => k + 1)
      }
    }
  }

  // ── Empty cart ───────────────────────────────────────────────────────────────

  if (count === 0 && submitState.status !== "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">🛒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sepetiniz boş</h2>
        <p className="text-gray-500 mb-8">Ödeme yapabilmek için sepetinize ürün ekleyin.</p>
        <Link href="/urunler">
          <Button className="bg-[#1E40AF] hover:bg-blue-800 text-white px-8">
            Alışverişe Başla
          </Button>
        </Link>
      </div>
    )
  }

  // ── Success state ────────────────────────────────────────────────────────────

  if (submitState.status === "success") {
    const r = submitState.result
    const expiresAt = r.reservationExpiresAt
      ? new Date(r.reservationExpiresAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      : null

    const successWaHref = wa.cartOrder(
      cartItems.map((i) => ({ name: i.name, sku: i.sku, quantity: i.quantity, unitPrice: i.unitPrice })),
      r.grandTotal
    )

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle2 size={32} className="text-green-600" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Siparişiniz Alındı</h2>
        <p className="text-gray-500 mb-1">Sipariş No: <strong className="text-gray-800">{r.orderNumber}</strong></p>
        <p className="text-gray-500 mb-6">Toplam: <strong className="text-[#1E40AF]">{r.grandTotal.toLocaleString("tr-TR")} ₺</strong></p>

        {expiresAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
            Siparişiniz için stok rezervasyonu yapıldı.
            Ödemenizi <strong>{expiresAt}</strong>&apos;a kadar tamamlamanız gerekmektedir.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {successWaHref && (
            <a
              href={successWaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              WhatsApp ile Ödeme Bildir
            </a>
          )}

          <Link href="/urunler">
            <Button variant="outline" className="px-6 py-3">
              Alışverişe Devam
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ── Main checkout layout ──────────────────────────────────────────────────────

  // Build productId → cartItem map for price-change comparison
  const cartMap = new Map(cartItems.map((i) => [i.productId, i]))

  // Totals: use server values; pre-validation fallback shows 0 for shipping until server confirms
  const subtotal    = validation?.subtotal    ?? cartItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const shippingFee = validation?.shippingFee ?? 0
  const grandTotal  = validation?.grandTotal  ?? subtotal + shippingFee

  const hasHardError    = validation !== null && !validation.ok
  const canSubmit       =
    isFormValid(form) &&
    legalConsent &&
    validation?.ok === true &&
    !isValidating &&
    submitState.status !== "submitting"

  // WA fallback: use server-confirmed prices when available
  const waItems = (validation?.items ?? [])
    .filter((i) => i.error === null)
    .map((i) => ({ name: i.name, sku: i.sku, quantity: i.confirmedQuantity, unitPrice: i.serverPrice }))
  const waHref = wa.cartOrder(
    waItems.length > 0 ? waItems : cartItems.map((i) => ({ name: i.name, sku: i.sku, quantity: i.quantity, unitPrice: i.unitPrice })),
    subtotal
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/sepet"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#1E40AF] mb-6 transition-colors"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Sepete dön
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ödeme</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Customer info form ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Global order error */}
            {submitState.status === "error" && (
              <div
                role="alert"
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  {orderErrorMsg(submitState.code, submitState.details)}
                  {submitState.code === "PRICE_CHANGED" && (
                    <button
                      type="button"
                      onClick={() => setRevalidationKey((k) => k + 1)}
                      className="ml-2 inline-flex items-center gap-1 underline hover:no-underline text-red-700"
                    >
                      <RefreshCw size={12} aria-hidden="true" /> Fiyatları yenile
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-gray-800 mb-5 text-lg">Teslimat Bilgileri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Ad"     required value={form.firstName} onChange={setField("firstName")} placeholder="Adınız" />
                <FormInput label="Soyad"  required value={form.lastName}  onChange={setField("lastName")}  placeholder="Soyadınız" />
                <FormInput label="Telefon" required type="tel"   value={form.phone} onChange={setField("phone")} placeholder="05XX XXX XX XX" />
                <FormInput label="E-posta" required type="email" value={form.email} onChange={setField("email")} placeholder="ornek@email.com" />
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-gray-800 mb-5 text-lg">Teslimat Adresi</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Şehir"  required value={form.city}     onChange={setField("city")}     placeholder="İstanbul" />
                <FormInput label="İlçe"   required value={form.district} onChange={setField("district")} placeholder="Kadıköy" />
                <div className="sm:col-span-2">
                  <FormInput label="Mahalle / Semt" value={form.neighborhood} onChange={setField("neighborhood")} placeholder="Mahalle (isteğe bağlı)" />
                </div>
                <div className="sm:col-span-2">
                  <FormInput label="Adres Satırı" required value={form.addressLine} onChange={setField("addressLine")} placeholder="Sokak, bina no, daire" />
                </div>
                <FormInput label="Posta Kodu" value={form.postalCode} onChange={setField("postalCode")} placeholder="34XXX" />
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6">
              <h2 className="font-bold text-gray-800 mb-3 text-lg">Sipariş Notu</h2>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Teslimat veya ürün hakkında eklemek istediğiniz notlar (isteğe bağlı)"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent transition-all resize-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* ── Order summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-xl p-5 sticky top-24 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Sipariş Özeti</h3>

              {/* Validation loading */}
              {isValidating && (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-1">
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  Stok ve fiyatlar doğrulanıyor…
                </div>
              )}

              {/* Hard error banner */}
              {hasHardError && !isValidating && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Bazı ürünlerde sorun var.{" "}
                    <Link href="/sepet" className="underline font-medium">
                      Sepete dönüp
                    </Link>{" "}
                    sorunlu ürünleri kaldırın.
                  </span>
                </div>
              )}

              {/* Cart item list */}
              <div className="space-y-3">
                {(
                  validation
                    ? validation.items
                    : cartItems.map((c) => ({
                        productId:         c.productId,
                        slug:              c.slug,
                        sku:               c.sku,
                        name:              c.name,
                        imageUrl:          c.imageUrl,
                        brandName:         c.brandName,
                        confirmedQuantity: c.quantity,
                        serverPrice:       c.unitPrice,
                        lineTotal:         c.unitPrice * c.quantity,
                        error:             null as null,
                        stockCapped:       false,
                      }))
                ).map((item) => {
                  const cartItem = cartMap.get(item.productId)
                  const priceChanged =
                    validation !== null &&
                    item.error === null &&
                    cartItem !== undefined &&
                    Math.abs(item.serverPrice - cartItem.unitPrice) > 0.001

                  return (
                    <div
                      key={item.productId}
                      className={`flex gap-3 pb-3 border-b last:border-b-0 last:pb-0 ${item.error ? "opacity-50" : ""}`}
                    >
                      <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden relative shrink-0">
                        <ProductImage
                          src={getProductImageUrl(item.imageUrl)}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.sku}</p>

                        {item.error && (
                          <p className="flex items-center gap-1 mt-1 text-xs text-red-600 font-medium">
                            <AlertCircle size={11} aria-hidden="true" />
                            {itemErrorMsg(item.error)}
                          </p>
                        )}

                        {!item.error && item.stockCapped && (
                          <p className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                            <AlertTriangle size={11} aria-hidden="true" />
                            Stok: {item.confirmedQuantity} adet ile sınırlandı
                          </p>
                        )}

                        {priceChanged && cartItem && (
                          <p className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                            <AlertTriangle size={11} aria-hidden="true" />
                            Fiyat:{" "}
                            <span className="line-through">{cartItem.unitPrice.toLocaleString("tr-TR")} ₺</span>
                            {" → "}{item.serverPrice.toLocaleString("tr-TR")} ₺
                          </p>
                        )}

                        {!item.error && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {item.confirmedQuantity} × {item.serverPrice.toLocaleString("tr-TR")} ₺
                            </span>
                            <span className="text-sm font-bold text-[#1E40AF]">
                              {item.lineTotal.toLocaleString("tr-TR")} ₺
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Ara toplam</span>
                  <span>{subtotal.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kargo</span>
                  <span className={shippingFee === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingFee === 0 ? "Ücretsiz" : `${shippingFee.toFixed(2)} ₺`}
                  </span>
                </div>
                {shippingFee > 0 && validation?.subtotal !== undefined && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded p-2">
                    Ücretsiz kargo için sepetinizi artırın.
                  </p>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>Toplam</span>
                <span className="text-[#1E40AF]">{grandTotal.toLocaleString("tr-TR")} ₺</span>
              </div>

              {/* Legal consent checkbox */}
              <div className="flex items-start gap-2.5 py-1">
                <input
                  id="legal-consent"
                  type="checkbox"
                  checked={legalConsent}
                  onChange={(e) => setLegalConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-[#1E40AF]"
                />
                <label htmlFor="legal-consent" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                  <Link href="/on-bilgilendirme" target="_blank" rel="noopener noreferrer"
                    className="underline hover:text-[#1E40AF] transition-colors font-medium">
                    Ön Bilgilendirme Formu
                  </Link>
                  {"'nu ve "}
                  <Link href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noopener noreferrer"
                    className="underline hover:text-[#1E40AF] transition-colors font-medium">
                    Mesafeli Satış Sözleşmesi
                  </Link>
                  {"'ni okudum ve kabul ediyorum. "}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </label>
              </div>

              {/* Payment obligation notice */}
              <p className="text-xs text-gray-400 text-center">
                Siparişi tamamladığınızda ödeme yükümlülüğü doğar.
              </p>

              {/* Primary CTA */}
              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-[#1E40AF] hover:bg-blue-800 text-white h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitState.status === "submitting" ? (
                  <><Loader2 size={18} className="mr-2 animate-spin" aria-hidden="true" /> İşleniyor…</>
                ) : (
                  <><ShoppingBag size={18} className="mr-2" aria-hidden="true" /> Siparişi Tamamla</>
                )}
              </Button>

              {!canSubmit && !isValidating && validation?.ok && !legalConsent && (
                <p className="text-xs text-red-400 text-center">
                  Devam etmek için Ön Bilgilendirme Formu&apos;nu onaylayın.
                </p>
              )}
              {!canSubmit && !isValidating && validation?.ok && legalConsent && (
                <p className="text-xs text-gray-400 text-center">
                  Devam etmek için tüm zorunlu alanları doldurun.
                </p>
              )}

              {/* WhatsApp fallback */}
              {waItems.length > 0 && waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium transition-colors text-sm"
                >
                  WhatsApp ile Sipariş Ver
                </a>
              )}

              <p className="text-xs text-gray-400 text-center">
                Siparişiniz alındıktan sonra WhatsApp üzerinden ödeme bilgilerinizi iletebilirsiniz.
              </p>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
