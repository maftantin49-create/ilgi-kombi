import { z } from "zod"

export type { ActionState } from "@/lib/admin/schemas/product"
export { INITIAL_STATE } from "@/lib/admin/schemas/product"

const checkboxBool = z.preprocess(
  (v) => v === "on" || v === true || v === "true",
  z.boolean()
)

export const brandSchema = z.object({
  name: z.string().min(1, "Marka adı zorunludur").max(100, "Marka adı çok uzun"),
  slug: z
    .string()
    .min(1, "Slug zorunludur")
    .max(100, "Slug çok uzun")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: küçük harf, rakam ve tire kullanın"),
  is_active: checkboxBool,
})

export type BrandFormData = z.infer<typeof brandSchema>
