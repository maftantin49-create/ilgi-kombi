"use client"

import { useEffect } from "react"

export default function AdminSwRegistrar() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/admin-sw.js", { scope: "/admin/" })
        .catch(() => {})
    }
  }, [])

  return null
}
