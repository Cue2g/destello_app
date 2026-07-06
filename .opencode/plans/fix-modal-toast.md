# Fix: Modal no abre + Migrar toasts a Notyf

## 1. Instalar notyf

```bash
npm install notyf
```

## 2. Agregar CSS de Notyf en globals.css

```css
@import "tailwindcss";
@plugin "flyonui";
@plugin "@iconify/tailwind4";
@import "../node_modules/flyonui/variants.css";
@import "../node_modules/flyonui/src/vendor/notyf.css";  // ← agregar
@source "./node_modules/flyonui/flyonui.js";
```

## 3. Reemplazar components/toast.tsx

Cambiar de React Context a singleton con Notyf:

```tsx
"use client"

import { useEffect, useRef } from "react"
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
```

## 4. Corregir components/confirm-dialog.tsx

Estructura HTML según la documentación de FlyonUI:

```tsx
"use client"

import { useEffect } from "react"

interface ConfirmDialogProps {
  id: string
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "primary" | "error"
  onConfirm: () => void
}

export function ConfirmDialog({
  id,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    window.HSStaticMethods?.autoInit()
  }, [])

  async function handleConfirm() {
    await onConfirm()
    window.HSOverlay?.close(`#${id}`)
  }

  return (
    <div
      id={id}
      className="overlay modal hidden overlay-open:opacity-100 overlay-open:duration-300"
      role="dialog"
      tabindex="-1"
      aria-haspopup="dialog"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button
              type="button"
              className="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              aria-label="Close"
              data-overlay={`#${id}`}
            >
              <span className="icon-[tabler--x] size-4" />
            </button>
          </div>
          <div className="modal-body">
            <p className="text-base-content/80">{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-soft btn-secondary"
              data-overlay={`#${id}`}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`btn btn-${variant}`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function openConfirm(id: string) {
  window.HSStaticMethods?.autoInit()
  window.HSOverlay?.open(`#${id}`)
}
```

## 5. Actualizar status-card.tsx

Cambiar `import { useToast } from "@/components/toast"` por `import { showToast } from "@/components/toast"` y usar `showToast()` directamente (sin hook).

## 6. Actualizar layout.tsx

Remover `<ToastProvider>` y su import, ya que Notyf no necesita context.

## 7. Actualizar global.d.ts

No es necesario cambiar, `IHSOverlay` ya está definido.
