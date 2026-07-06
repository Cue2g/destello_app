"use client"

import { useEffect, useState } from "react"
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

  useEffect(() => {
    setDraft(observations || "")
  }, [observations])

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
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="icon-[tabler--notes] size-5 text-primary" />
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
          <div className="mt-3 space-y-2">
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
          <div className="mt-3">
            {observations ? (
              <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                {observations}
              </p>
            ) : (
              <p className="text-sm text-base-content/40 italic">
                Sin observaciones
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
