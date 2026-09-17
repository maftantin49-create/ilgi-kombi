import { z } from "zod"

export type { ActionState } from "@/lib/admin/schemas/product"
export { INITIAL_STATE } from "@/lib/admin/schemas/product"

export const inventoryAdjustSchema = z.object({
  operation: z.enum(["add", "remove", "adjust"], {
    error: "Geçerli bir işlem seçin",
  }),
  quantity: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : parseInt(String(v), 10)),
    z
      .number({ error: "Geçerli bir miktar girin" })
      .int("Miktar tam sayı olmalı")
      .positive("Miktar 0'dan büyük olmalı")
  ),
  reason: z
    .string()
    .trim()
    .min(10, "Sebep en az 10 karakter olmalı")
    .max(500, "Sebep çok uzun"),
})

export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>
