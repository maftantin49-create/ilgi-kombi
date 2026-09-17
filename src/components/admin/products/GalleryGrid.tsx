"use client"

import { useRef, useState, useTransition } from "react"
import { Plus, X, GripVertical } from "lucide-react"
import { uploadProductImageAction } from "@/lib/admin/product-image.actions"

export interface GalleryItem {
  key: string
  url: string
  path: string
  altText: string
  sortOrder: number
}

interface Props {
  productId: string
  initialItems?: GalleryItem[]
  onChange: (items: GalleryItem[]) => void
}

const MAX_GALLERY = 10

export function GalleryGrid({ productId, initialItems = [], onChange }: Props) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)

  const publish = (next: GalleryItem[]) => {
    const reordered = next.map((item, i) => ({ ...item, sortOrder: i }))
    setItems(reordered)
    onChange(reordered)
  }

  const upload = (file: File) => {
    if (items.length >= MAX_GALLERY) return
    setUploadError(null)
    setUploading(true)

    startTransition(async () => {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("productId", productId)
      fd.append("imageRole", "gallery")

      const result = await uploadProductImageAction(fd)
      setUploading(false)

      if (!result.ok) {
        setUploadError(result.error)
        return
      }

      const newItem: GalleryItem = {
        key: crypto.randomUUID(),
        url: result.url,
        path: result.path,
        altText: "",
        sortOrder: items.length,
      }
      publish([...items, newItem])
    })
  }

  const remove = (key: string) => {
    publish(items.filter((i) => i.key !== key))
  }

  const setAlt = (key: string, alt: string) => {
    const next = items.map((i) => (i.key === key ? { ...i, altText: alt } : i))
    setItems(next)
    onChange(next)
  }

  // HTML5 native drag for reorder (no external library)
  const onDragStart = (index: number) => {
    dragIndexRef.current = index
  }
  const onDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(index, 0, moved)
    dragIndexRef.current = index
    setItems(next.map((item, i) => ({ ...item, sortOrder: i })))
  }
  const onDragEnd = () => {
    dragIndexRef.current = null
    onChange(items)
  }

  const onDropZone = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  const isLoading = uploading || isPending

  return (
    <div className="space-y-3">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
      >
        {items.map((item, index) => (
          <div
            key={item.key}
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOverItem(e, index)}
            onDragEnd={onDragEnd}
            className="group relative"
            style={{
              background: "#0D0E10",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              overflow: "hidden",
              aspectRatio: "1",
              cursor: "grab",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.altText || `Galeri ${index + 1}`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              draggable={false}
            />

            {/* Drag handle (visible on hover) */}
            <div
              className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: "rgba(9,10,12,0.8)",
                borderRadius: "4px",
                padding: "2px",
                color: "#A5A5A5",
                display: "flex",
              }}
            >
              <GripVertical size={11} />
            </div>

            {/* Order badge */}
            <div
              className="absolute bottom-1 left-1"
              style={{
                background: "rgba(9,10,12,0.75)",
                borderRadius: "4px",
                padding: "1px 4px",
                fontSize: "10px",
                color: "#6B7280",
                lineHeight: "1.4",
              }}
            >
              {index + 1}
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => remove(item.key)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Kaldır"
              style={{
                background: "rgba(9,10,12,0.8)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "4px",
                padding: "2px",
                color: "#EF4444",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <X size={11} />
            </button>

            {/* Alt text overlay (visible on hover) */}
            <div
              className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(9,10,12,0.9)", padding: "4px 5px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={item.altText}
                onChange={(e) => setAlt(item.key, e.target.value)}
                placeholder="Alt text..."
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "9px",
                  color: "#F4F4F2",
                }}
              />
            </div>
          </div>
        ))}

        {/* Upload / drop cell */}
        {items.length < MAX_GALLERY && (
          <div
            onDrop={onDropZone}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !isLoading && inputRef.current?.click()}
            style={{
              background: "#0D0E10",
              border: "2px dashed rgba(255,255,255,0.08)",
              borderRadius: "8px",
              aspectRatio: "1",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              transition: "border-color 0.2s",
            }}
            className="hover:border-yellow-600/30"
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={isLoading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) upload(file)
                if (inputRef.current) inputRef.current.value = ""
              }}
            />
            {isLoading ? (
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "rgba(212,160,23,0.2)",
                  borderTopColor: "#D4A017",
                }}
              />
            ) : (
              <>
                <Plus size={16} style={{ color: "#374151" }} />
                <span style={{ fontSize: "9px", color: "#374151" }}>
                  {items.length}/{MAX_GALLERY}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-xs" style={{ color: "#EF4444" }}>
          {uploadError}
        </p>
      )}

      {items.length > 0 && (
        <p className="text-xs" style={{ color: "#374151" }}>
          Görselleri sürükleyerek sıralayabilirsiniz. Alt text için görselin üzerine gelin.
        </p>
      )}
    </div>
  )
}
