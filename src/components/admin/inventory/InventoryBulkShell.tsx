"use client"

import { useState, useCallback } from "react"
import type { StockItem } from "@/lib/admin/inventory"
import { InventoryTable } from "./InventoryTable"
import InventoryActionBar from "./InventoryActionBar"
import BulkStockModal from "@/components/admin/products/BulkStockModal"

type Operation = "add" | "remove" | "set"

interface Props {
  items: StockItem[]
}

export default function InventoryBulkShell({ items }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [stockOpen, setStockOpen] = useState(false)
  const [initialOp, setInitialOp] = useState<Operation | undefined>(undefined)

  // ── Selection ──────────────────────────────────────────────────────────────

  const allPageIds = items.map((i) => i.id)
  const allSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id))
  const someSelected =
    !allSelected && allPageIds.some((id) => selectedIds.has(id))

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const ids = items.map((i) => i.id)
      if (ids.every((id) => prev.has(id))) {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      }
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
  }, [items])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  // ── Modal open helpers ─────────────────────────────────────────────────────

  const openStock = useCallback((op: Operation) => {
    setInitialOp(op)
    setStockOpen(true)
  }, [])

  // ── Success handler ────────────────────────────────────────────────────────

  const handleStockSuccess = useCallback(() => {
    setStockOpen(false)
    clearSelection()
  }, [clearSelection])

  // ── Selected product data (shape required by BulkStockModal) ──────────────

  const selectedProducts = items
    .filter((i) => selectedIds.has(i.id))
    .map((i) => ({
      id: i.id,
      sku: i.sku,
      name: i.name,
      stock_quantity: i.stock_quantity,
      reserved_stock: i.reserved_stock,
    }))

  const count = selectedIds.size

  return (
    <>
      <InventoryTable
        items={items}
        selection={{
          selectedIds,
          onToggle: toggle,
          onToggleAll: toggleAll,
          allSelected,
          someSelected,
        }}
      />

      {count > 0 && <div className="h-16" />}

      <InventoryActionBar
        count={count}
        onClear={clearSelection}
        onAdd={() => openStock("add")}
        onRemove={() => openStock("remove")}
        onSet={() => openStock("set")}
      />

      {stockOpen && (
        <BulkStockModal
          open={stockOpen}
          selectedProducts={selectedProducts}
          onClose={() => setStockOpen(false)}
          onSuccess={handleStockSuccess}
          initialOperation={initialOp}
        />
      )}
    </>
  )
}
