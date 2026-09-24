"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Product } from "@/types"

interface FavoritesStore {
  items: Product[]
  toggleFavorite: (product: Product) => void
  isFavorite: (id: string) => boolean
  totalFavorites: () => number
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product) => {
        const exists = get().items.some(p => p.id === product.id)
        set({
          items: exists
            ? get().items.filter(p => p.id !== product.id)
            : [...get().items, product],
        })
      },
      isFavorite: (id) => get().items.some(p => p.id === id),
      totalFavorites: () => get().items.length,
    }),
    { name: "ilgikombi-favorites" }
  )
)
