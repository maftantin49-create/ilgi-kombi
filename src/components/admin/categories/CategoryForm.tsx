"use client"

import { useActionState } from "react"
import Link from "next/link"
import { INITIAL_STATE, type ActionState } from "@/lib/admin/schemas/category"
import type { Category } from "@/lib/admin/categories"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface Props {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  mode: "create" | "edit"
  initialData?: Category
  allCategories: Category[]
  editingId?: string
}

const inputClass =
  "w-full px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 transition-all"
const inputStyle = {
  background: "#111214",
  border: "1px solid rgba(255,255,255,0.09)",
  color: "#F4F4F2",
}

export function CategoryForm({
  action,
  mode,
  initialData,
  allCategories,
  editingId,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)

  function fieldError(field: string) {
    return state.fieldErrors?.[field]?.[0]
  }

  // Exclude the category being edited and its descendants from parent options
  const parentOptions = allCategories.filter((c) => c.id !== editingId)

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {state.message && !state.success && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}
        >
          {state.message}
        </div>
      )}

      {/* Kategori Adı */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          Kategori Adı <span style={{ color: "#D4A017" }}>*</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={initialData?.name ?? ""}
          className={inputClass}
          style={{
            ...inputStyle,
            ...(fieldError("name") ? { borderColor: "#f87171" } : {}),
          }}
          placeholder="örn. Kombi Parçaları"
          maxLength={100}
          required
          onChange={(e) => {
            if (mode === "create") {
              const slugInput = e.currentTarget.form?.elements.namedItem(
                "slug"
              ) as HTMLInputElement | null
              if (slugInput && slugInput.dataset.manual !== "true") {
                slugInput.value = generateSlug(e.currentTarget.value)
              }
            }
          }}
        />
        {fieldError("name") && (
          <p className="text-xs" style={{ color: "#f87171" }}>
            {fieldError("name")}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          Slug <span style={{ color: "#D4A017" }}>*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            name="slug"
            defaultValue={initialData?.slug ?? ""}
            className={inputClass}
            style={{
              ...inputStyle,
              flex: 1,
              ...(fieldError("slug") ? { borderColor: "#f87171" } : {}),
            }}
            placeholder="örn. kombi-parcalari"
            maxLength={100}
            required
            onChange={(e) => {
              e.currentTarget.dataset.manual = "true"
            }}
          />
          {mode === "create" && (
            <button
              type="button"
              onClick={() => {
                const form = document.querySelector("form")
                const nameInput = form?.elements.namedItem(
                  "name"
                ) as HTMLInputElement | null
                const slugInput = form?.elements.namedItem(
                  "slug"
                ) as HTMLInputElement | null
                if (nameInput && slugInput) {
                  slugInput.value = generateSlug(nameInput.value)
                  slugInput.dataset.manual = "false"
                }
              }}
              className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-opacity hover:opacity-75"
              style={{ background: "rgba(212,160,23,0.12)", color: "#D4A017" }}
            >
              Üret
            </button>
          )}
        </div>
        {fieldError("slug") && (
          <p className="text-xs" style={{ color: "#f87171" }}>
            {fieldError("slug")}
          </p>
        )}
      </div>

      {/* Üst Kategori */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          Üst Kategori
        </label>
        <select
          name="parent_id"
          defaultValue={initialData?.parent_id ?? ""}
          className={inputClass}
          style={{
            ...inputStyle,
            ...(fieldError("parent_id") ? { borderColor: "#f87171" } : {}),
          }}
        >
          <option value="">— Ana kategori (üst yok) —</option>
          {parentOptions.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {fieldError("parent_id") && (
          <p className="text-xs" style={{ color: "#f87171" }}>
            {fieldError("parent_id")}
          </p>
        )}
        <p className="text-xs" style={{ color: "#A5A5A5" }}>
          Boş bırakırsanız kök kategori olarak oluşturulur.
        </p>
      </div>

      {/* Sıralama */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          Sıralama
        </label>
        <input
          type="number"
          name="sort_order"
          defaultValue={initialData?.sort_order ?? 0}
          className={inputClass}
          style={{
            ...inputStyle,
            ...(fieldError("sort_order") ? { borderColor: "#f87171" } : {}),
          }}
          min={0}
          step={1}
        />
        {fieldError("sort_order") && (
          <p className="text-xs" style={{ color: "#f87171" }}>
            {fieldError("sort_order")}
          </p>
        )}
        <p className="text-xs" style={{ color: "#A5A5A5" }}>
          Küçük değer önce sıralanır.
        </p>
      </div>

      {/* Durum */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          defaultChecked={initialData?.is_active ?? true}
          className="w-4 h-4 rounded"
          style={{ accentColor: "#D4A017" }}
        />
        <label htmlFor="is_active" className="text-sm" style={{ color: "#F4F4F2" }}>
          Aktif — ürün seçiminde listelensin
        </label>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity"
          style={{
            background: "#D4A017",
            color: "#090A0C",
            opacity: isPending ? 0.6 : 1,
          }}
        >
          {isPending
            ? "Kaydediliyor..."
            : mode === "create"
            ? "Kategori Oluştur"
            : "Değişiklikleri Kaydet"}
        </button>
        <Link
          href="/admin/categories"
          className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-75"
          style={{ background: "rgba(255,255,255,0.06)", color: "#A5A5A5" }}
        >
          İptal
        </Link>
      </div>
    </form>
  )
}
