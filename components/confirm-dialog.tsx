"use client"

import { useEffect } from "react"

function forceCloseOverlay(id: string) {
  window.HSOverlay?.close(`#${id}`)

  setTimeout(() => {
    const modal = document.querySelector(`#${id}`)
    if (modal) {
      modal.classList.add("hidden")
      modal.classList.remove("overlay-open")
    }

    document.querySelectorAll(".overlay-backdrop").forEach((el) => el.remove())
    document.querySelectorAll("[data-overlay-wrapper]").forEach((el) => el.remove())

    document.body.classList.remove("overlay-open", "modal-open", "overflow-hidden")
    document.body.style.overflow = ""
    document.body.style.paddingRight = ""
  }, 350)
}

interface ConfirmDialogProps {
  id: string
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "primary" | "error"
  onConfirm: () => void
  onCancel?: () => void
}

export function ConfirmDialog({
  id,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    window.HSStaticMethods?.autoInit()
  }, [])

  function handleConfirm() {
    onConfirm()
    forceCloseOverlay(id)
  }

  function handleCancel() {
    onCancel?.()
    forceCloseOverlay(id)
  }

  return (
    <div
      id={id}
      className="overlay modal modal-middle hidden overlay-open:opacity-100 overlay-open:duration-300"
      role="dialog"
      tabIndex={-1}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button
              type="button"
              className="btn btn-text btn-circle btn-sm absolute end-3 top-3"
              aria-label="Close"
              onClick={handleCancel}
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
              onClick={handleCancel}
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
