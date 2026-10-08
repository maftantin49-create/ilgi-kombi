"use client"

import { useActionState, useRef, useState } from "react"
import Link from "next/link"
import { INITIAL_STATE, type ActionState } from "@/lib/admin/schemas/product"
import type {
  ProductDetail,
  SelectOption,
  ProductImage,
  ProductOemCode,
  ProductSpecification,
  ProductDevice,
} from "@/lib/admin/products"
import { generateSeo } from "@/lib/admin/seo-generator"
import { ImageUploadZone } from "./ImageUploadZone"
import { GalleryGrid, type GalleryItem } from "./GalleryGrid"
import { ProductPreviewCard } from "./ProductPreviewCard"
import { OemEditor, type OemItem } from "./OemEditor"
import { SpecEditor, type SpecItem } from "./SpecEditor"
import { DeviceSearch, type SelectedDevice } from "./DeviceSearch"

type Tab = "general" | "media" | "pricing" | "classification" | "attributes" | "seo"

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "general", label: "Genel" },
  { id: "media", label: "Görseller" },
  { id: "pricing", label: "Fiyat & Stok" },
  { id: "classification", label: "Sınıflandırma" },
  { id: "attributes", label: "Özellikler" },
  { id: "seo", label: "SEO" },
]

const LABEL = "block text-xs font-medium mb-1.5"
const INPUT =
  "w-full rounded px-3 py-2.5 text-sm outline-none transition-colors focus:ring-1 focus:ring-yellow-600"
const INPUT_STYLE: React.CSSProperties = {
  background: "#111214",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#F4F4F2",
}
const MUTED: React.CSSProperties = { color: "#A5A5A5" }
const GOLD: React.CSSProperties = { color: "#D4A017" }
const CARD: React.CSSProperties = {
  background: "#151618",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "10px",
  padding: "20px",
}
const SECTION_DIVIDER: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.06)",
  marginTop: 20,
  paddingTop: 20,
}

function FieldError({ msgs }: { msgs?: string[] }) {
  if (!msgs?.length) return null
  return (
    <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
      {msgs[0]}
    </p>
  )
}

function Checkbox({
  name,
  label,
  checked,
  onChange,
}: {
  name: string
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-yellow-600"
      />
      <span className="text-sm" style={{ color: "#D0D0D0" }}>
        {label}
      </span>
    </label>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold mb-3" style={{ color: "#A5A5A5", letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {children}
    </p>
  )
}

function generateSlug(name: string): string {
  const map: Record<string, string> = {
    ğ: "g", Ğ: "g", ü: "u", Ü: "u", ş: "s", Ş: "s",
    ı: "i", İ: "i", ö: "o", Ö: "o", ç: "c", Ç: "c",
  }
  return name
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

interface Props {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
  mode: "create" | "edit"
  brands: SelectOption[]
  categories: SelectOption[]
  initialData?: ProductDetail | null
  pendingProductId: string
  initialGallery?: ProductImage[]
  initialOemItems?: ProductOemCode[]
  initialSpecItems?: ProductSpecification[]
  initialDeviceItems?: ProductDevice[]
}

export default function ProductForm({
  action,
  mode,
  brands,
  categories,
  initialData,
  pendingProductId,
  initialGallery = [],
  initialOemItems = [],
  initialSpecItems = [],
  initialDeviceItems = [],
}: Props) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)
  const [activeTab, setActiveTab] = useState<Tab>("general")

  // ── Preview state ──
  const [pvName, setPvName] = useState(initialData?.name ?? "")
  const [pvPrice, setPvPrice] = useState(String(initialData?.price ?? ""))
  const [pvCompare, setPvCompare] = useState(String(initialData?.compare_at_price ?? ""))
  const [pvSku, setPvSku] = useState(initialData?.sku ?? "")
  const [pvBrandId, setPvBrandId] = useState(initialData?.brand_id ?? "")
  const [pvCategoryId, setPvCategoryId] = useState(initialData?.category_id ?? "")
  const [pvSlug, setPvSlug] = useState(initialData?.slug ?? "")
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title ?? "")
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description ?? "")
  const [pvIsActive, setPvIsActive] = useState(initialData?.is_active ?? true)
  const [pvIsFeatured, setPvIsFeatured] = useState(initialData?.is_featured ?? false)
  const [pvIsNew, setPvIsNew] = useState(initialData?.is_new ?? false)
  const [pvSameDay, setPvSameDay] = useState(initialData?.same_day_shipping ?? false)
  const [trackStock, setTrackStock] = useState(initialData?.track_stock ?? true)

  // ── Image URL hidden fields ──
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url ?? "")
  const [hoverImageUrl, setHoverImageUrl] = useState<string>(
    initialData?.hover_image_url ?? ""
  )

  // ── Gallery ──
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
    initialGallery.map((img) => ({
      key: img.id,
      url: img.url,
      path: img.storage_path,
      altText: img.alt_text ?? "",
      sortOrder: img.sort_order,
    }))
  )

  // ── OEM codes ──
  const [oemItems, setOemItems] = useState<OemItem[]>(() =>
    initialOemItems.map((o) => ({
      key: o.id,
      code: o.code,
      manufacturer: o.manufacturer ?? "",
      note: o.note ?? "",
      sortOrder: o.sort_order,
    }))
  )

  // ── Specs ──
  const [specItems, setSpecItems] = useState<SpecItem[]>(() =>
    initialSpecItems.map((s) => ({
      key: s.id,
      specKey: s.spec_key,
      specValue: s.spec_value,
      unit: s.unit ?? "",
      sortOrder: s.sort_order,
    }))
  )

  // ── Devices ──
  const [deviceItems, setDeviceItems] = useState<SelectedDevice[]>(() =>
    initialDeviceItems.map((d) => ({
      id: d.device_model_id,
      brandName: d.device_models?.brands?.name ?? "—",
      model: d.device_models?.model ?? "",
      category: d.device_models?.category ?? null,
      note: d.note ?? "",
    }))
  )

  // ── Refs ──
  const slugRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  const brandName = brands.find((b) => b.id === pvBrandId)?.name ?? ""
  const categoryName = categories.find((c) => c.id === pvCategoryId)?.name ?? ""
  const fe = state.fieldErrors ?? {}

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
      {/* ── LEFT: form ── */}
      <form action={formAction} className="space-y-4">
        {/* ── Hidden fields: always in DOM regardless of active tab ── */}
        <input type="hidden" name="pendingProductId" value={pendingProductId} />
        <input type="hidden" name="image_url" value={imageUrl} />
        <input type="hidden" name="hover_image_url" value={hoverImageUrl} />

        {/* Gallery hidden fields */}
        {galleryItems.map((item) => (
          <span key={item.key}>
            <input type="hidden" name="gallery_url" value={item.url} />
            <input type="hidden" name="gallery_path" value={item.path} />
            <input type="hidden" name="gallery_alt" value={item.altText} />
            <input type="hidden" name="gallery_sort" value={String(item.sortOrder)} />
          </span>
        ))}

        {/* OEM hidden fields */}
        {oemItems.map((item) => (
          <span key={item.key}>
            <input type="hidden" name="oem_code" value={item.code} />
            <input type="hidden" name="oem_manufacturer" value={item.manufacturer} />
            <input type="hidden" name="oem_note" value={item.note} />
            <input type="hidden" name="oem_sort" value={String(item.sortOrder)} />
          </span>
        ))}

        {/* Spec hidden fields */}
        {specItems.map((item) => (
          <span key={item.key}>
            <input type="hidden" name="spec_key" value={item.specKey} />
            <input type="hidden" name="spec_value" value={item.specValue} />
            <input type="hidden" name="spec_unit" value={item.unit} />
            <input type="hidden" name="spec_sort" value={String(item.sortOrder)} />
          </span>
        ))}

        {/* Device hidden fields */}
        {deviceItems.map((item) => (
          <span key={item.id}>
            <input type="hidden" name="device_model_id" value={item.id} />
            <input type="hidden" name="device_note" value={item.note} />
          </span>
        ))}

        {/* Global error banner */}
        {!state.success && state.message && (
          <div
            className="rounded px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#EF4444",
            }}
          >
            {state.message}
          </div>
        )}

        {/* ── Tab nav ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                style={{
                  padding: "9px 14px",
                  fontSize: "13px",
                  fontWeight: activeTab === id ? 500 : 400,
                  color: activeTab === id ? "#D4A017" : "#6B7280",
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeTab === id ? "2px solid #D4A017" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "color 0.15s",
                  marginBottom: "-1px",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab: Genel ── */}
        <section
          className={activeTab !== "general" ? "hidden" : "space-y-4"}
          style={CARD}
        >
          <div>
            <label htmlFor="name" className={LABEL} style={MUTED}>
              Ürün Adı <span style={GOLD}>*</span>
            </label>
            <input
              ref={nameRef}
              id="name"
              name="name"
              type="text"
              required
              defaultValue={initialData?.name ?? ""}
              className={INPUT}
              style={INPUT_STYLE}
              onChange={(e) => setPvName(e.target.value)}
            />
            <FieldError msgs={fe.name} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="slug" className={LABEL} style={{ ...MUTED, marginBottom: 0 }}>
                Slug <span style={GOLD}>*</span>
              </label>
              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => {
                    const name = nameRef.current?.value ?? ""
                    const generated = generateSlug(name)
                    if (slugRef.current) slugRef.current.value = generated
                    setPvSlug(generated)
                  }}
                  className="text-xs px-2 py-0.5 rounded transition-opacity hover:opacity-80"
                  style={{ color: "#D4A017", border: "1px solid rgba(212,160,23,0.3)" }}
                >
                  İsimden üret
                </button>
              )}
            </div>
            <input
              ref={slugRef}
              id="slug"
              name="slug"
              type="text"
              required
              defaultValue={initialData?.slug ?? ""}
              placeholder="kombi-brinsa-su-pompasi"
              className={INPUT}
              style={INPUT_STYLE}
              onChange={(e) => setPvSlug(e.target.value)}
            />
            <FieldError msgs={fe.slug} />
          </div>

          <div>
            <label htmlFor="sku" className={LABEL} style={MUTED}>
              SKU <span style={GOLD}>*</span>
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              required
              defaultValue={initialData?.sku ?? ""}
              placeholder="KOM-BRS-001"
              className={INPUT}
              style={INPUT_STYLE}
              onChange={(e) => setPvSku(e.target.value)}
            />
            <FieldError msgs={fe.sku} />
          </div>

          <div>
            <label htmlFor="description" className={LABEL} style={MUTED}>
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialData?.description ?? ""}
              className={INPUT}
              style={{ ...INPUT_STYLE, resize: "vertical" }}
            />
            <FieldError msgs={fe.description} />
          </div>

          <div>
            <label htmlFor="short_description" className={LABEL} style={MUTED}>
              Kısa Açıklama
            </label>
            <textarea
              id="short_description"
              name="short_description"
              rows={2}
              defaultValue={initialData?.short_description ?? ""}
              className={INPUT}
              style={{ ...INPUT_STYLE, resize: "vertical" }}
              placeholder="Ürün başlığının altında görünecek özet"
            />
            <FieldError msgs={fe.short_description} />
          </div>
        </section>

        {/* ── Tab: Görseller ── */}
        <section
          className={activeTab !== "media" ? "hidden" : "space-y-5"}
          style={CARD}
        >
          <div className="grid grid-cols-2 gap-4">
            <ImageUploadZone
              productId={pendingProductId}
              imageRole="main"
              initialUrl={initialData?.image_url ?? null}
              label="Ana Görsel"
              onUploaded={(url) => {
                setImageUrl(url)
                setPvName(pvName)
              }}
              onRemoved={() => setImageUrl("")}
            />
            <ImageUploadZone
              productId={pendingProductId}
              imageRole="hover"
              initialUrl={initialData?.hover_image_url ?? null}
              label="Hover Görseli"
              onUploaded={(url) => setHoverImageUrl(url)}
              onRemoved={() => setHoverImageUrl("")}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={MUTED}>
                Galeri{" "}
                <span style={{ color: "#4B5563" }}>({galleryItems.length}/10)</span>
              </p>
            </div>
            <GalleryGrid
              productId={pendingProductId}
              initialItems={galleryItems}
              onChange={setGalleryItems}
            />
          </div>
        </section>

        {/* ── Tab: Fiyat & Stok ── */}
        <section
          className={activeTab !== "pricing" ? "hidden" : "space-y-4"}
          style={CARD}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className={LABEL} style={MUTED}>
                Satış Fiyatı (₺) <span style={GOLD}>*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={initialData?.price ?? ""}
                placeholder="0.00"
                className={INPUT}
                style={INPUT_STYLE}
                onChange={(e) => setPvPrice(e.target.value)}
              />
              <FieldError msgs={fe.price} />
            </div>

            <div>
              <label htmlFor="compare_at_price" className={LABEL} style={MUTED}>
                Karşılaştırma Fiyatı (₺)
              </label>
              <input
                id="compare_at_price"
                name="compare_at_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialData?.compare_at_price ?? ""}
                placeholder="0.00"
                className={INPUT}
                style={INPUT_STYLE}
                onChange={(e) => setPvCompare(e.target.value)}
              />
              <FieldError msgs={fe.compare_at_price} />
            </div>
          </div>

          <div>
            <label htmlFor="stock_quantity" className={LABEL} style={MUTED}>
              Başlangıç Stok{" "}
              {mode === "create" && <span style={GOLD}>*</span>}
            </label>
            {mode === "edit" ? (
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 rounded px-3 py-2.5 text-sm font-semibold"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color:
                      (initialData?.stock_quantity ?? 0) === 0
                        ? "#EF4444"
                        : (initialData?.stock_quantity ?? 0) < 5
                        ? "#FBBF24"
                        : "#F4F4F2",
                  }}
                >
                  {initialData?.stock_quantity ?? 0} adet
                </div>
                <span
                  className="text-xs rounded px-2 py-1 whitespace-nowrap"
                  style={{
                    color: "#6B7280",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  Stok hareketi ile güncellenir
                </span>
              </div>
            ) : (
              <input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                step="1"
                min="0"
                required
                defaultValue={initialData?.stock_quantity ?? 0}
                className={INPUT}
                style={INPUT_STYLE}
              />
            )}
            <FieldError msgs={fe.stock_quantity} />
          </div>

          <div style={SECTION_DIVIDER}>
            <SectionHeading>Stok Takibi</SectionHeading>
            <Checkbox
              name="track_stock"
              label="Stok takibi aktif"
              checked={trackStock}
              onChange={setTrackStock}
            />
            {!trackStock && (
              <p className="text-xs mt-2" style={{ color: "#6B7280" }}>
                Stok takibi kapalı — ürün stok miktarından bağımsız olarak her zaman satışta görünür.
              </p>
            )}
          </div>
        </section>

        {/* ── Tab: Sınıflandırma ── */}
        <section
          className={activeTab !== "classification" ? "hidden" : "space-y-4"}
          style={CARD}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="brand_id" className={LABEL} style={MUTED}>
                Marka
              </label>
              <select
                id="brand_id"
                name="brand_id"
                defaultValue={initialData?.brand_id ?? ""}
                className={INPUT}
                style={INPUT_STYLE}
                onChange={(e) => setPvBrandId(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <FieldError msgs={fe.brand_id} />
            </div>

            <div>
              <label htmlFor="category_id" className={LABEL} style={MUTED}>
                Kategori
              </label>
              <select
                id="category_id"
                name="category_id"
                defaultValue={initialData?.category_id ?? ""}
                className={INPUT}
                style={INPUT_STYLE}
                onChange={(e) => setPvCategoryId(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldError msgs={fe.category_id} />
            </div>
          </div>
        </section>

        {/* ── Tab: Özellikler ── */}
        <section
          className={activeTab !== "attributes" ? "hidden" : "space-y-0"}
          style={CARD}
        >
          {/* Flags */}
          <div>
            <SectionHeading>Ürün Bayrakları</SectionHeading>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Checkbox
                name="is_active"
                label="Aktif"
                checked={pvIsActive}
                onChange={setPvIsActive}
              />
              <Checkbox
                name="is_featured"
                label="Öne çıkan"
                checked={pvIsFeatured}
                onChange={setPvIsFeatured}
              />
              <Checkbox
                name="is_new"
                label="Yeni ürün"
                checked={pvIsNew}
                onChange={setPvIsNew}
              />
              <Checkbox
                name="same_day_shipping"
                label="Aynı gün kargo"
                checked={pvSameDay}
                onChange={setPvSameDay}
              />
            </div>
          </div>

          {/* OEM Codes */}
          <div style={SECTION_DIVIDER}>
            <SectionHeading>OEM Kodlar</SectionHeading>
            <OemEditor initialItems={oemItems} onChange={setOemItems} />
          </div>

          {/* Technical Specs */}
          <div style={SECTION_DIVIDER}>
            <SectionHeading>Teknik Özellikler</SectionHeading>
            <SpecEditor initialItems={specItems} onChange={setSpecItems} />
          </div>

          {/* Compatible Devices */}
          <div style={SECTION_DIVIDER}>
            <SectionHeading>Uyumlu Cihaz / Model</SectionHeading>
            <DeviceSearch
              brands={brands}
              initialItems={deviceItems}
              onChange={setDeviceItems}
            />
          </div>
        </section>

        {/* ── Tab: SEO ── */}
        <section
          className={activeTab !== "seo" ? "hidden" : "space-y-4"}
          style={CARD}
        >
          {/* Header + generate button */}
          <div className="flex items-center justify-between">
            <SectionHeading>SEO Yönetimi</SectionHeading>
            <button
              type="button"
              onClick={() => {
                const currentName = pvName || (nameRef.current?.value ?? "")
                if (!currentName.trim()) return
                const generated = generateSeo({
                  name: currentName,
                  brandName: brandName || undefined,
                  categoryName: categoryName || undefined,
                })
                setSeoTitle(generated.seoTitle)
                setSeoDescription(generated.seoDescription)
                if (slugRef.current && !slugRef.current.value) {
                  slugRef.current.value = generated.slug
                }
              }}
              className="text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-80"
              style={{
                color: "#D4A017",
                border: "1px solid rgba(212,160,23,0.3)",
                background: "rgba(212,160,23,0.05)",
              }}
            >
              SEO Oluştur
            </button>
          </div>

          {/* SEO Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="seo_title" className={LABEL} style={{ ...MUTED, marginBottom: 0 }}>
                SEO Başlık
              </label>
              <span
                className="text-xs tabular-nums"
                style={{
                  color:
                    seoTitle.length > 60
                      ? "#EF4444"
                      : seoTitle.length >= 50
                      ? "#4ade80"
                      : "#6B7280",
                }}
              >
                {seoTitle.length}/60
              </span>
            </div>
            <input
              id="seo_title"
              name="seo_title"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className={INPUT}
              style={INPUT_STYLE}
              placeholder="Boş bırakılırsa ürün adı kullanılır"
              maxLength={120}
            />
          </div>

          {/* SEO Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="seo_description" className={LABEL} style={{ ...MUTED, marginBottom: 0 }}>
                SEO Açıklama
              </label>
              <span
                className="text-xs tabular-nums"
                style={{
                  color:
                    seoDescription.length > 160
                      ? "#EF4444"
                      : seoDescription.length >= 140
                      ? "#4ade80"
                      : "#6B7280",
                }}
              >
                {seoDescription.length}/160
              </span>
            </div>
            <textarea
              id="seo_description"
              name="seo_description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              rows={3}
              className={INPUT + " resize-none"}
              style={INPUT_STYLE}
              placeholder="Arama sonuçlarında görünecek kısa açıklama"
              maxLength={300}
            />
          </div>

          {/* Google preview */}
          {(seoTitle || seoDescription || pvName) && (
            <div
              style={{
                background: "#111214",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "8px",
                padding: "14px 16px",
              }}
            >
              <p className="text-xs mb-3" style={{ color: "#6B7280", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Google Önizleme
              </p>
              <div
                style={{
                  background: "#fff",
                  borderRadius: "6px",
                  padding: "12px 14px",
                  maxWidth: "600px",
                }}
              >
                <p style={{ fontSize: "12px", color: "#3c4043", marginBottom: "2px" }}>
                  ilgikombiyedekparca.com
                  {pvSlug ? ` › urunler › ${pvSlug}` : " › urunler › ..."}
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    color: "#1a0dab",
                    lineHeight: "1.3",
                    marginBottom: "4px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {seoTitle || pvName}
                </p>
                {seoDescription && (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#4d5156",
                      lineHeight: "1.5",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {seoDescription}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Footer ── */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded text-sm transition-opacity hover:opacity-80"
            style={{ color: "#A5A5A5", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#D4A017", color: "#090A0C" }}
          >
            {isPending
              ? "Kaydediliyor..."
              : mode === "create"
              ? "Ürün Oluştur"
              : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>

      {/* ── RIGHT: sticky live preview ── */}
      <div className="xl:sticky xl:top-6 space-y-3">
        <p className="text-xs font-medium" style={{ color: "#4B5563" }}>
          Canlı Önizleme
        </p>
        <ProductPreviewCard
          name={pvName}
          price={pvPrice}
          compareAtPrice={pvCompare}
          sku={pvSku}
          imageUrl={imageUrl || null}
          isActive={pvIsActive}
          isFeatured={pvIsFeatured}
          isNew={pvIsNew}
          sameDayShipping={pvSameDay}
          brandName={brandName}
        />
        <p className="text-xs text-center" style={{ color: "#374151" }}>
          Form dolduğunda güncellenir
        </p>
      </div>
    </div>
  )
}
