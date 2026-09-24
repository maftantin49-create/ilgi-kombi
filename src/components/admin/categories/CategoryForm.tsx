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

      {/* Görsel URL */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          Görsel URL
        </label>
        <input
          type="url"
          name="image_url"
          defaultValue={(initialData as Record<string, unknown>)?.image_url as string ?? ""}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.09)", color: "#F4F4F2" }}
          placeholder="https://..."
        />
        <p className="text-xs" style={{ color: "#A5A5A5" }}>
          Opsiyonel. Kategori listesinde gösterilir.
        </p>
      </div>

      {/* Açıklama */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
          Açıklama
        </label>
        <textarea
          name="description"
          defaultValue={(initialData as Record<string, unknown>)?.description as string ?? ""}
          rows={2}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
          style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.09)", color: "#F4F4F2" }}
          placeholder="Kısa kategori açıklaması"
        />
      </div>

      {/* Durum ve Featured */}
      <div className="space-y-2">
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
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_featured"
            name="is_featured"
            defaultChecked={(initialData as Record<string, unknown>)?.is_featured as boolean ?? false}
            className="w-4 h-4 rounded"
            style={{ accentColor: "#D4A017" }}
          />
          <label htmlFor="is_featured" className="text-sm" style={{ color: "#F4F4F2" }}>
            Öne Çıkar — anasayfada göster
          </label>
        </div>
      </div>

      {/* SEO */}
      <div className="space-y-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-xs font-semibold" style={{ color: "#A5A5A5", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          SEO
        </p>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
            SEO Başlık
          </label>
          <input
            type="text"
            name="seo_title"
            defaultValue={(initialData as Record<string, unknown>)?.seo_title as string ?? ""}
            className={inputClass}
            style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.09)", color: "#F4F4F2" }}
            placeholder="Boş bırakılırsa kategori adı kullanılır"
            maxLength={120}
          />
          <p className="text-xs" style={{ color: "#A5A5A5" }}>
            Tarayıcı sekmesi ve arama sonuçlarında görünür. En fazla 60 karakter önerilir.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: "#F4F4F2" }}>
            SEO Açıklama
          </label>
          <textarea
            name="seo_description"
            defaultValue={(initialData as Record<string, unknown>)?.seo_description as string ?? ""}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ background: "#111214", border: "1px solid rgba(255,255,255,0.09)", color: "#F4F4F2" }}
            placeholder="Arama sonuçlarında görünecek kısa açıklama"
            maxLength={300}
          />
          <p className="text-xs" style={{ color: "#A5A5A5" }}>
            En fazla 155 karakter önerilir.
          </p>
        </div>
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
