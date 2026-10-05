"use client"

import { useState, useCallback, useMemo } from "react"
import type { StockItem, StockStatus } from "@/lib/admin/inventory"
import { InventoryTable, type SortColumn, type SortState } from "./InventoryTable"
import InventoryActionBar from "./InventoryActionBar"
import BulkStockModal from "@/components/admin/products/BulkStockModal"

type Operation = "add" | "remove" | "set"

const STATUS_ORDER: Record<StockStatus, number> = {
  in_stock: 0, low_stock: 1, critical_reservation: 2, out_of_stock: 3,
}

function sortItems(items: StockItem[], sort: SortState): StockItem[] {
  if (!sort) return items
  return [...items].sort((a, b) => {
    let cmp = 0
    switch (sort.column) {
      case "name":            cmp = a.name.localeCompare(b.name, "tr"); break
      case "sku":             cmp = a.sku.localeCompare(b.sku, "tr"); break
      case "brand":           cmp = (a.brands?.name ?? "").localeCompare(b.brands?.name ?? "", "tr"); break
      case "stock_quantity":  cmp = a.stock_quantity - b.stock_quantity; break
      case "available_stock": cmp = a.available_stock - b.available_stock; break
      case "status":          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]; break
    }
    return sort.direction === "asc" ? cmp : -cmp
  })
}

interface Props {
  items: StockItem[]
}

export default function InventoryBulkShell({ items }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [stockOpen, setStockOpen] = useState(false)
  const [initialOp, setInitialOp] = useState<Operation | undefined>(undefined)
  const [sortState, setSortState] = useState<SortState>(null)

  // ── Sort ───────────────────────────────────────────────────────────────────

  const handleSort = useCallback((column: SortColumn) => {
    setSortState((prev) => {
      if (prev?.column === column) {
        return prev.direction === "asc"
          ? { column, direction: "desc" }
          : null
      }
      return { column, direction: "asc" }
    })
  }, [])

  const sortedItems = useMemo(() => sortItems(items, sortState), [items, sortState])

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
        items={sortedItems}
        selection={{
          selectedIds,
          onToggle: toggle,
          onToggleAll: toggleAll,
          allSelected,
          someSelected,
        }}
        sortState={sortState}
        onSort={handleSort}
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
