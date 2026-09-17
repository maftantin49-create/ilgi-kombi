"use client"

import { useState, useCallback } from "react"
import type { ProductListItem, SelectOption } from "@/lib/admin/products"
import ProductTable from "./ProductTable"
import BulkActionBar from "./BulkActionBar"
import BulkStockModal from "./BulkStockModal"
import BulkPriceModal from "./BulkPriceModal"
import BulkFlagsModal from "./BulkFlagsModal"
import BulkBrandModal from "./BulkBrandModal"
import BulkCategoryModal from "./BulkCategoryModal"

interface Props {
  products: ProductListItem[]
  brands: SelectOption[]
  categories: SelectOption[]
}

export default function ProductsBulkShell({ products, brands, categories }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [stockOpen, setStockOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [flagsOpen, setFlagsOpen] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  // ── Selection ─────────────────────────────────────────────────────────────

  const allPageIds = products.map((p) => p.id)
  const allSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id))
  const someSelected =
    !allSelected && allPageIds.some((id) => selectedIds.has(id))

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const ids = products.map((p) => p.id)
      if (ids.every((id) => prev.has(id))) {
        const next = new Set(prev)
        ids.forEach((id) => next.delete(id))
        return next
      }
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
  }, [products])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // ── Selected product details ──────────────────────────────────────────────

  const selectedProducts = products.filter((p) => selectedIds.has(p.id))

  // ── Success handlers ──────────────────────────────────────────────────────

  const handleStockSuccess = useCallback(() => {
    setStockOpen(false)
    clearSelection()
  }, [clearSelection])

  const handlePriceSuccess = useCallback(() => {
    setPriceOpen(false)
    clearSelection()
  }, [clearSelection])

  const handleFlagsSuccess = useCallback(() => {
    setFlagsOpen(false)
    clearSelection()
  }, [clearSelection])

  const handleBrandSuccess = useCallback(() => {
    setBrandOpen(false)
    clearSelection()
  }, [clearSelection])

  const handleCategorySuccess = useCallback(() => {
    setCategoryOpen(false)
    clearSelection()
  }, [clearSelection])

  const count = selectedIds.size

  return (
    <>
      <ProductTable
        products={products}
        selection={{
          selectedIds,
          onToggle: toggle,
          onToggleAll: toggleAll,
          allSelected,
          someSelected,
        }}
      />

      {/* Spacer so content isn't hidden behind fixed BulkActionBar */}
      {count > 0 && <div className="h-16" />}

      <BulkActionBar
        count={count}
        onClear={clearSelection}
        onStock={() => setStockOpen(true)}
        onPrice={() => setPriceOpen(true)}
        onFlags={() => setFlagsOpen(true)}
        onBrand={() => setBrandOpen(true)}
        onCategory={() => setCategoryOpen(true)}
      />

      {stockOpen && (
        <BulkStockModal
          open={stockOpen}
          selectedProducts={selectedProducts}
          onClose={() => setStockOpen(false)}
          onSuccess={handleStockSuccess}
        />
      )}

      {priceOpen && (
        <BulkPriceModal
          open={priceOpen}
          selectedProducts={selectedProducts}
          onClose={() => setPriceOpen(false)}
          onSuccess={handlePriceSuccess}
        />
      )}

      {flagsOpen && (
        <BulkFlagsModal
          open={flagsOpen}
          selectedProducts={selectedProducts}
          onClose={() => setFlagsOpen(false)}
          onSuccess={handleFlagsSuccess}
        />
      )}

      {brandOpen && (
        <BulkBrandModal
          open={brandOpen}
          selectedProducts={selectedProducts}
          brands={brands}
          onClose={() => setBrandOpen(false)}
          onSuccess={handleBrandSuccess}
        />
      )}

      {categoryOpen && (
        <BulkCategoryModal
          open={categoryOpen}
          selectedProducts={selectedProducts}
          categories={categories}
          onClose={() => setCategoryOpen(false)}
          onSuccess={handleCategorySuccess}
        />
      )}
    </>
  )
}
