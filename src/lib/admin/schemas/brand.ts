import { z } from "zod"

export type { ActionState } from "@/lib/admin/schemas/product"
export { INITIAL_STATE } from "@/lib/admin/schemas/product"

const checkboxBool = z.preprocess(
  (v) => v === "on" || v === true || v === "true",
  z.boolean()
)

const nullableText = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : String(v).trim()),
  z.string().nullable().optional()
)

export const brandSchema = z.object({
  name: z.string().min(1, "Marka adı zorunludur").max(100, "Marka adı çok uzun"),
  slug: z
    .string()
    .min(1, "Slug zorunludur")
    .max(100, "Slug çok uzun")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: küçük harf, rakam ve tire kullanın"),
  is_active:   checkboxBool,
  is_featured: checkboxBool,
  logo_url:    nullableText,
  sort_order:  z.preprocess(
    (v) => {
      if (v === "" || v === undefined || v === null) return 0
      const n = parseInt(String(v), 10)
      return isNaN(n) ? 0 : n
    },
    z.number().int().min(0)
  ),
})

export type BrandFormData = z.infer<typeof brandSchema>
