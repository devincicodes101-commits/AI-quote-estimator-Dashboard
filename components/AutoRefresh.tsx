"use client"

import { useEffect } from "react"

// Reloads the page on a fixed interval so the dashboard picks up new
// rows from the Google Sheet without a manual F5.
export function AutoRefresh({ intervalMs }: { intervalMs: number }) {
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        window.location.reload()
      }
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return null
}
