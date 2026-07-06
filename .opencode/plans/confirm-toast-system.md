# Implementation: Confirm Dialog + Toast System + Status Auto-Update

## Files to create

### 1. `components/confirm-dialog.tsx`
```tsx
"use client"

import { useEffect, useRef } from "react"

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
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return

    const handleClose = () => {
      import("flyonui/flyonui").then(({ default: HSOverlay }) => {
        HSOverlay.close(`#${id}`)
      })
    }

    el.addEventListener("click", (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("[data-overlay-close]")) {
        handleClose()
      }
    })
  }, [id])

  function handleConfirm() {
    onConfirm()
    import("flyonui/flyonui").then(({ default: HSOverlay }) => {
      HSOverlay.close(`#${id}`)
    })
  }

  return (
    <div
      ref={dialogRef}
      id={id}
      className="overlay overlay-open:opacity-100 hidden overlay-open:visible overlay-open:duration-500"
      role="dialog"
    >
      <div className="overlay-animation-target modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{title}</h3>
              <button
                type="button"
                className="btn btn-text btn-circle btn-sm absolute right-2 top-2"
                data-overlay-close
              >
                <span className="icon-[tabler--x] size-5" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-base-content/80">{message}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" data-overlay-close>
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
    </div>
  )
}

export function openConfirm(id: string) {
  import("flyonui/flyonui").then(({ default: HSOverlay }) => {
    HSOverlay.open(`#${id}`)
  })
}
```

### 2. `components/toast.tsx`
```tsx
"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const iconMap: Record<ToastType, string> = {
    success: "icon-[tabler--circle-check]",
    error: "icon-[tabler--alert-circle]",
    info: "icon-[tabler--info-circle]",
    warning: "icon-[tabler--alert-triangle]",
  }

  const alertMap: Record<ToastType, string> = {
    success: "alert-success",
    error: "alert-error",
    info: "alert-info",
    warning: "alert-warning",
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`alert ${alertMap[toast.type]} flex items-center gap-2 shadow-lg`}
          >
            <span className={`${iconMap[toast.type]} size-5 shrink-0`} />
            <span className="text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}
```

### 3. `app/panel/candidates/[id]/status-card.tsx`
```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateStatus } from "./actions"
import { ConfirmDialog, openConfirm } from "@/components/confirm-dialog"
import { useToast } from "@/components/toast"

const statusLabels: Record<string, string> = {
  NEW: "Nuevo",
  REVIEWED: "Revisado",
  CONTACTED: "Contactado",
  REJECTED: "Rechazado",
  HIRED: "Contratado",
}

interface StatusCardProps {
  candidateId: number
  currentStatus: string
}

export function StatusCard({ candidateId, currentStatus }: StatusCardProps) {
  const [pending, setPending] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const router = useRouter()
  const { showToast } = useToast()

  async function handleConfirmStatus() {
    if (!selectedStatus) return
    setPending(true)
    try {
      const formData = new FormData()
      formData.set("status", selectedStatus)
      await updateStatus(candidateId, formData)
      showToast(`Estado cambiado a ${statusLabels[selectedStatus] ?? selectedStatus}`, "success")
      router.refresh()
    } catch {
      showToast("Error al actualizar el estado", "error")
    } finally {
      setPending(false)
      setSelectedStatus(null)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (newStatus === currentStatus) return
    setSelectedStatus(newStatus)
    openConfirm("confirm-status")
  }

  return (
    <>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="icon-[tabler--toggle-left] size-5 text-primary" />
            Cambiar estado
          </h2>
          <div className="mt-3">
            <select
              className="select select-bordered w-full text-sm"
              value={currentStatus}
              onChange={handleChange}
              disabled={pending}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <ConfirmDialog
        id="confirm-status"
        title="Cambiar estado"
        message={`¿Estás seguro de cambiar el estado a "${statusLabels[selectedStatus ?? ""] ?? ""}"?`}
        confirmText="Sí, cambiar"
        variant="primary"
        onConfirm={handleConfirmStatus}
      />
    </>
  )
}
```

## Files to modify

### 4. `app/panel/candidates/[id]/page.tsx`
- **Import** the new `StatusCard` component instead of the form
- **Remove** the status form block (lines 315-340) and replace with `<StatusCard candidateId={candidate.id} currentStatus={candidate.status} />`

### 5. `app/panel/candidates/[id]/delete-button.tsx`
Replace `confirm()` with:
```tsx
import { ConfirmDialog, openConfirm } from "@/components/confirm-dialog"

// Add dialog + button
<ConfirmDialog id="confirm-delete" title="Eliminar candidato" message={`¿Eliminar a "${name || 'este candidato'}"? También se borrará el archivo.`} confirmText="Eliminar" variant="error" onConfirm={handleDelete} />
// Button onClick → openConfirm("confirm-delete")
```

### 6. `app/panel/tags/tag-list.tsx`
Same pattern: Replace `confirm()` with ConfirmDialog + openConfirm.

### 7. `app/panel/upload/delete-button.tsx`
Same pattern: Replace `confirm()` with ConfirmDialog + openConfirm.

### 8. `app/layout.tsx`
Add `import { ToastProvider } from "../components/toast"` and wrap `{children}` with `<ToastProvider>...</ToastProvider>`.
