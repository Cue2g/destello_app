"use client"

import { useState } from "react"
import { updateObservations } from "./actions"
import { showToast } from "@/components/toast"

interface ObservationsCardProps {
  candidateId: number
  observations: string | null
}

export function ObservationsCard({ candidateId, observations }: ObservationsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(observations || "")
  const [pending, setPending] = useState(false)

  function handleEdit() {
    setDraft(observations || "")
    setIsEditing(true)
  }

  function handleCancel() {
    setDraft(observations || "")
    setIsEditing(false)
  }

  async function handleSave() {
    setPending(true)
    try {
      const formData = new FormData()
      formData.set("observations", draft)
      await updateObservations(candidateId, formData)
      showToast("Observaciones guardadas")
      setIsEditing(false)
    } catch {
      showToast("Error al guardar observaciones", "error")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="border border-base-300 bg-base-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest flex items-center gap-2">
          <span className="icon-[tabler--notes] size-4 text-primary" />
          Observaciones
        </h2>
        {!isEditing && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleEdit}
            disabled={pending}
          >
            <span className="icon-[tabler--pencil] size-3.5" />
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="textarea textarea-bordered w-full text-sm"
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Notas, seguimiento, comentarios..."
            disabled={pending}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm flex-1"
              onClick={handleCancel}
              disabled={pending}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex-1"
              onClick={handleSave}
              disabled={pending}
            >
              <span className="icon-[tabler--device-floppy] size-4" />
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <div>
          {observations ? (
            <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
              {observations}
            </p>
          ) : (
            <p className="text-sm text-base-content/50 italic">
              Sin observaciones
            </p>
          )}
        </div>
      )}
    </div>
  )
}
