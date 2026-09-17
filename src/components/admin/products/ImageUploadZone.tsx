"use client"

import { useRef, useState, useTransition } from "react"
import { Upload, X, RefreshCw, ImageIcon } from "lucide-react"
import { uploadProductImageAction } from "@/lib/admin/product-image.actions"

type Stage = "idle" | "dragging" | "uploading" | "success" | "error"

interface Props {
  productId: string
  imageRole: "main" | "hover"
  initialUrl?: string | null
  onUploaded: (url: string, path: string) => void
  onRemoved: () => void
  label?: string
}

export function ImageUploadZone({
  productId,
  imageRole,
  initialUrl,
  onUploaded,
  onRemoved,
  label,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null)
  const [stage, setStage] = useState<Stage>(initialUrl ? "success" : "idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const isLoading = stage === "uploading" || isPending

  const processFile = (file: File) => {
    if (isLoading) return
    setStage("uploading")
    setErrorMsg(null)

    startTransition(async () => {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("productId", productId)
      fd.append("imageRole", imageRole)

      try {
        const result = await uploadProductImageAction(fd)
        if (!result.ok) {
          setStage("error")
          setErrorMsg(result.error)
          return
        }
        setPreviewUrl(result.url)
        setStage("success")
        onUploaded(result.url, result.path)
      } catch {
        setStage("error")
        setErrorMsg("Görsel yüklenemedi, lütfen tekrar deneyin")
      }
    })
  }

  const remove = () => {
    setPreviewUrl(null)
    setStage("idle")
    setErrorMsg(null)
    if (inputRef.current) inputRef.current.value = ""
    onRemoved()
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (isLoading) return
    setStage("idle")
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isLoading && stage !== "success") setStage("dragging")
  }

  const onDragLeave = () => {
    if (stage === "dragging") setStage("idle")
  }

  const borderColor =
    stage === "dragging"
      ? "#D4A017"
      : stage === "error"
      ? "rgba(239,68,68,0.5)"
      : stage === "success"
      ? "rgba(34,197,94,0.25)"
      : "rgba(255,255,255,0.1)"

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-xs font-medium" style={{ color: "#A5A5A5" }}>
          {label}
        </p>
      )}

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => {
          if (!isLoading && stage !== "success") inputRef.current?.click()
        }}
        style={{
          background: "#0D0E10",
          border: `2px dashed ${borderColor}`,
          borderRadius: "8px",
          minHeight: "172px",
          position: "relative",
          overflow: "hidden",
          cursor: isLoading ? "not-allowed" : stage === "success" ? "default" : "pointer",
          transition: "border-color 0.2s",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={isLoading}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
          }}
        />

        {/* Success: thumbnail */}
        {stage === "success" && previewUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={label ?? "Görsel"}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "8px",
              }}
            />
            <div
              className="absolute top-2 right-2 flex gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                title="Değiştir"
                style={{
                  background: "rgba(9,10,12,0.85)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "6px",
                  padding: "5px",
                  color: "#F4F4F2",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <RefreshCw size={13} />
              </button>
              <button
                type="button"
                onClick={remove}
                title="Kaldır"
                style={{
                  background: "rgba(9,10,12,0.85)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "6px",
                  padding: "5px",
                  color: "#EF4444",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            </div>
          </>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{
                borderColor: "rgba(212,160,23,0.2)",
                borderTopColor: "#D4A017",
              }}
            />
            <p className="text-xs" style={{ color: "#6B7280" }}>
              Yükleniyor...
            </p>
          </div>
        )}

        {/* Idle / dragging / error */}
        {!isLoading && stage !== "success" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
            {stage === "dragging" ? (
              <>
                <ImageIcon size={26} style={{ color: "#D4A017" }} />
                <p className="text-xs font-medium" style={{ color: "#D4A017" }}>
                  Bırakın
                </p>
              </>
            ) : stage === "error" ? (
              <>
                <X size={22} style={{ color: "#EF4444" }} />
                <p className="text-xs text-center leading-relaxed" style={{ color: "#EF4444" }}>
                  {errorMsg}
                </p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  Tekrar denemek için tıklayın
                </p>
              </>
            ) : (
              <>
                <Upload size={22} style={{ color: "#4B5563" }} />
                <div className="text-center">
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    Sürükleyin veya tıklayın
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#374151" }}>
                    JPG · PNG · WebP — maks. 5 MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
