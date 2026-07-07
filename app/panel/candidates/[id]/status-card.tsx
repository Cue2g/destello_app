"use client"

import { useState } from "react"
import { updateStatus } from "./actions"
import { ConfirmDialog, openConfirm } from "@/components/confirm-dialog"
import { showToast } from "@/components/toast"

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
  const [selectValue, setSelectValue] = useState(currentStatus)

  async function handleConfirmStatus() {
    if (!selectedStatus) return
    setPending(true)
    try {
      const formData = new FormData()
      formData.set("status", selectedStatus)
      await updateStatus(candidateId, formData)
      showToast(`Estado cambiado a ${statusLabels[selectedStatus] ?? selectedStatus}`)
    } catch {
      showToast("Error al actualizar el estado", "error")
      setSelectValue(currentStatus)
    } finally {
      setPending(false)
      setSelectedStatus(null)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    if (newStatus === currentStatus) return
    setSelectValue(newStatus)
    setSelectedStatus(newStatus)
    openConfirm("confirm-status")
  }

  function handleCancel() {
    setSelectValue(currentStatus)
    setSelectedStatus(null)
  }

  return (
    <>
      <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 intersect-half motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg p-5">
        <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="icon-[tabler--toggle-left] size-4 text-primary" />
          Cambiar estado
        </h2>
        <select
          className="select select-bordered w-full text-sm"
          value={selectValue}
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
      <ConfirmDialog
        id="confirm-status"
        title="Cambiar estado"
        message={`¿Estás seguro de cambiar el estado a "${statusLabels[selectedStatus ?? ""] ?? ""}"?`}
        confirmText="Sí, cambiar"
        variant="primary"
        onConfirm={handleConfirmStatus}
        onCancel={handleCancel}
      />
    </>
  )
}
