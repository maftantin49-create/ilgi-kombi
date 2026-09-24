import { z } from "zod"

export type { ActionState } from "@/lib/admin/schemas/product"
export { INITIAL_STATE } from "@/lib/admin/schemas/product"

const checkboxBool = z.preprocess(
  (v) => v === "on" || v === true || v === "true",
  z.boolean()
)

const nullableUUID = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : v),
  z.string().uuid("Geçerli bir üst kategori seçin").nullable().optional()
)

const nullableText = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : String(v).trim()),
  z.string().nullable().optional()
)

export const categorySchema = z.object({
  name: z.string().min(1, "Kategori adı zorunludur").max(100, "Kategori adı çok uzun"),
  slug: z
    .string()
    .min(1, "Slug zorunludur")
    .max(100, "Slug çok uzun")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: küçük harf, rakam ve tire kullanın"),
  parent_id:   nullableUUID,
  sort_order:  z.preprocess(
    (v) => {
      if (v === "" || v === undefined || v === null) return 0
      const n = parseInt(String(v), 10)
      return isNaN(n) ? 0 : n
    },
    z.number().int("Sıralama tam sayı olmalı").min(0, "Sıralama 0'dan küçük olamaz")
  ),
  is_active:   checkboxBool,
  is_featured: checkboxBool,
  image_url:       nullableText,
  description:     nullableText,
  seo_title:       nullableText,
  seo_description: nullableText,
})

export type CategoryFormData = z.infer<typeof categorySchema>
