"use client"

import { Notyf } from "notyf"

let notyfInstance: Notyf | null = null

function getNotyf() {
  if (!notyfInstance) {
    notyfInstance = new Notyf({
      duration: 4000,
      position: { x: "right", y: "bottom" },
      dismissible: true,
      ripple: true,
      types: [
        {
          type: "success",
          background: "var(--color-primary)",
          icon: { className: "icon-[tabler--circle-check]", tagName: "i" },
        },
        {
          type: "error",
          background: "var(--color-error)",
          icon: { className: "icon-[tabler--alert-circle]", tagName: "i" },
        },
      ],
    })
  }
  return notyfInstance
}

export function showToast(message: string, type: "success" | "error" = "success") {
  const notyf = getNotyf()
  if (type === "error") {
    notyf.error(message)
  } else {
    notyf.success(message)
  }
}
