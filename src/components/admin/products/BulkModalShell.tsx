"use client"

import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: number
}

export default function BulkModalShell({
  open,
  onClose,
  title,
  children,
  maxWidth = 700,
}: Props) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 49,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(2px)",
          }}
        />
        <Dialog.Popup
          style={{
            position: "fixed",
            zIndex: 50,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `min(${maxWidth}px, calc(100vw - 1.5rem))`,
            maxHeight: "90dvh",
            display: "flex",
            flexDirection: "column",
            background: "#1A1B1E",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
            overflow: "hidden",
          }}
          aria-modal="true"
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <Dialog.Title
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#F4F4F2",
                margin: 0,
              }}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "none",
                background: "transparent",
                color: "#A5A5A5",
                cursor: "pointer",
              }}
              aria-label="Kapat"
            >
              <X size={14} />
            </Dialog.Close>
          </div>

          {/* Body — scrollable */}
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {children}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
