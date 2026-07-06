"use client"

import { useEffect } from "react"

export function MotionObserver() {
  useEffect(() => {
    import("tailwindcss-intersect").then(({ Observer }) => {
      Observer.start()
    })
  }, [])

  return null
}
