import { z } from "zod"

// ─────────────────────────────────────────────────────────────────────────────
// Shared base
// ─────────────────────────────────────────────────────────────────────────────

const productIdsField = z
  .array(z.string().uuid("Geçersiz ürün kimliği"))
  .min(1, "En az 1 ürün seçilmeli")
  .max(500, "En fazla 500 ürün seçilebilir")

// ─────────────────────────────────────────────────────────────────────────────
// Centralized operation type literals
// ─────────────────────────────────────────────────────────────────────────────

export type BulkStockOperation = "add" | "remove" | "set"

export type BulkPriceOperation =
  | "set"
  | "increase_fixed"
  | "decrease_fixed"
  | "increase_percent"
  | "decrease_percent"

export type BulkClassificationField = "brand_id" | "category_id"

// ─────────────────────────────────────────────────────────────────────────────
// BulkActionResult — predictable response contract for all 4 actions
// ─────────────────────────────────────────────────────────────────────────────

export type FailedProductInfo = {
  product_id: string
  sku: string
  current?: number      // current_stock (stock) | current_price (price)
  calculated?: number   // would_be (stock) | calculated_price (price)
  reserved?: number     // reserved_stock (stock only)
  reason: string        // RPC error code (NEGATIVE_STOCK, NEGATIVE_PRICE, …)
}

export type BulkActionResult =
  | {
      ok: true
      affected: number
      operationId: string
    }
  | {
      ok: false
      error: string        // Türkçe kullanıcı mesajı
      code: string         // RPC error code or VALIDATION_ERROR / DB_ERROR
      failedProducts?: FailedProductInfo[]
    }

// ─────────────────────────────────────────────────────────────────────────────
// bulkStockSchema
// ─────────────────────────────────────────────────────────────────────────────
//
// value rules:
//   add / remove → integer, > 0
//   set          → integer, >= 0  (0 = clear stock)
//
// reason: trim + 10..500 char (mirrors RPC guard)

export const bulkStockSchema = z
  .object({
    productIds: productIdsField,
    operation: z.enum(["add", "remove", "set"] as const, {
      error: "Geçerli bir işlem seçin",
    }),
    value: z
      .number({ error: "Geçerli bir miktar girin" })
      .int("Miktar tam sayı olmalı"),
    reason: z
      .string()
      .trim()
      .min(10, "Sebep en az 10 karakter olmalı")
      .max(500, "Sebep 500 karakteri geçemez"),
  })
  .superRefine((data, ctx) => {
    if (data.operation === "add" || data.operation === "remove") {
      if (data.value <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["value"],
          message: "add ve remove işlemleri için değer 0'dan büyük olmalı",
        })
      }
    } else if (data.operation === "set" && data.value < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "set işlemi için değer 0 veya daha büyük olmalı",
      })
    }
  })

export type BulkStockInput = z.infer<typeof bulkStockSchema>

// ─────────────────────────────────────────────────────────────────────────────
// bulkPriceSchema
// ─────────────────────────────────────────────────────────────────────────────
//
// value rules (mirrors RPC):
//   set              → >= 0
//   increase_fixed   → > 0
//   decrease_fixed   → > 0
//   increase_percent → 0 < v <= 1000
//   decrease_percent → 0 < v < 100

export const bulkPriceSchema = z
  .object({
    productIds: productIdsField,
    operation: z.enum(
      ["set", "increase_fixed", "decrease_fixed", "increase_percent", "decrease_percent"] as const,
      { error: "Geçerli bir işlem seçin" }
    ),
    value: z.number({ error: "Geçerli bir değer girin" }),
  })
  .superRefine((data, ctx) => {
    const { operation, value } = data
    switch (operation) {
      case "set":
        if (value < 0) {
          ctx.addIssue({
            code: "custom",
            path: ["value"],
            message: "Fiyat negatif olamaz",
          })
        }
        break
      case "increase_fixed":
      case "decrease_fixed":
        if (value <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["value"],
            message: "Değer 0'dan büyük olmalı",
          })
        }
        break
      case "increase_percent":
        if (value <= 0 || value > 1000) {
          ctx.addIssue({
            code: "custom",
            path: ["value"],
            message: "Artış yüzdesi 0 ile 1000 arasında olmalı (0 hariç)",
          })
        }
        break
      case "decrease_percent":
        if (value <= 0 || value >= 100) {
          ctx.addIssue({
            code: "custom",
            path: ["value"],
            message: "İndirim yüzdesi 0 ile 100 arasında olmalı (her ikisi hariç)",
          })
        }
        break
    }
  })

export type BulkPriceInput = z.infer<typeof bulkPriceSchema>

// ─────────────────────────────────────────────────────────────────────────────
// bulkFlagsSchema
// ─────────────────────────────────────────────────────────────────────────────
//
// flags: partial — yalnızca gönderilen flag'ler güncellenir
// En az 1 flag zorunlu; tüm değerler boolean olmalı

export const bulkFlagsSchema = z
  .object({
    productIds: productIdsField,
    flags: z.object({
      is_active: z.boolean().optional(),
      is_featured: z.boolean().optional(),
      is_new: z.boolean().optional(),
      same_day_shipping: z.boolean().optional(),
    }),
  })
  .refine(
    (data) => Object.values(data.flags).some((v) => v !== undefined),
    { message: "En az bir flag belirtilmeli", path: ["flags"] }
  )

export type BulkFlagsInput = z.infer<typeof bulkFlagsSchema>

// ─────────────────────────────────────────────────────────────────────────────
// bulkClassificationSchema
// ─────────────────────────────────────────────────────────────────────────────
//
// field: 'brand_id' | 'category_id'
// value: UUID string veya null (null → ilişkiyi kaldır)

export const bulkClassificationSchema = z.object({
  productIds: productIdsField,
  field: z.enum(["brand_id", "category_id"] as const, {
    error: "Geçerli bir alan seçin",
  }),
  value: z.string().uuid("Geçerli bir UUID girin").nullable(),
})

export type BulkClassificationInput = z.infer<typeof bulkClassificationSchema>
