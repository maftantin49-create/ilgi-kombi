"use client"

import { createContext, useContext } from "react"

const WaCtx = createContext<string | null>(null)

export function WaProvider({
  children,
  waNumber,
}: {
  children: React.ReactNode
  waNumber: string
}) {
  return <WaCtx.Provider value={waNumber || null}>{children}</WaCtx.Provider>
}

export function useWaNumber(): string | null {
  return useContext(WaCtx)
}
