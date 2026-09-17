import { z } from "zod"

export type ActionState = {
  success: boolean
  message?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export const INITIAL_STATE: ActionState = { success: false }

// Transforms empty/whitespace strings to null
const nullableStr = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.string().nullable().optional()
)

// Transforms empty string or missing to null, otherwise parses as float
const nullableNum = z.preprocess(
  (v) => {
    if (v === null || v === undefined || v === "") return null
    const n = parseFloat(String(v))
    return isNaN(n) ? null : n
  },
  z.number().min(0).nullable().optional()
)

// Checkbox in FormData: "on" when checked, absent (undefined) when unchecked
const checkboxBool = z.preprocess(
  (v) => v === "on" || v === true || v === "true",
  z.boolean()
)

// UUID select: empty string → null
const nullableUUID = z.preprocess(
  (v) => (v === "" || v === null ? null : v),
  z.string().uuid("Geçerli bir seçenek seçin").nullable().optional()
)

// Comma-separated string → string[] | null
const compatibleBrandsField = z.preprocess((v) => {
  if (typeof v !== "string" || v.trim() === "") return null
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}, z.array(z.string()).nullable().optional())

export const createProductSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunludur").max(255, "Ürün adı çok uzun"),
  slug: z
    .string()
    .min(1, "Slug zorunludur")
    .max(255, "Slug çok uzun")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: küçük harf, rakam ve tire kullanın"),
  sku: z.string().min(1, "SKU zorunludur").max(100, "SKU çok uzun"),
  description: nullableStr,
  price: z.preprocess(
    (v) => (v === "" ? undefined : parseFloat(String(v))),
    z.number({ error: "Geçerli fiyat girin" }).min(0, "Fiyat 0'dan küçük olamaz")
  ),
  compare_at_price: nullableNum,
  stock_quantity: z.preprocess(
    (v) => (v === "" ? undefined : parseInt(String(v), 10)),
    z
      .number({ error: "Geçerli stok miktarı girin" })
      .int("Stok tam sayı olmalı")
      .min(0, "Stok 0'dan küçük olamaz")
  ),
  brand_id: nullableUUID,
  category_id: nullableUUID,
  compatible_brands: compatibleBrandsField,
  image_url: nullableStr,
  hover_image_url: nullableStr,
  is_active: checkboxBool,
  is_featured: checkboxBool,
  is_new: checkboxBool,
  same_day_shipping: checkboxBool,
})

// Edit schema: no stock_quantity (managed by Wave 4 inventory system)
export const updateProductSchema = createProductSchema.omit({ stock_quantity: true })

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
