"use client"

import { useRouter } from "next/navigation"
import { createVacancy, updateVacancy } from "./[id]/actions"
import { showToast } from "@/components/toast"

interface VacancyFormProps {
  vacancy?: {
    id: number
    title: string
    description: string | null
    requirements: string | null
    location: string | null
    modality: string | null
    salaryMin: number | null
    salaryMax: number | null
    status: string
    closedAt: string | null
  }
}

export function VacancyForm({ vacancy }: VacancyFormProps) {
  const router = useRouter()
  const isEditing = !!vacancy

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      if (isEditing) {
        await updateVacancy(vacancy!.id, formData)
        showToast("Vacante actualizada")
        router.push(`/panel/vacancies/${vacancy!.id}`)
      } else {
        const result = await createVacancy(formData)
        showToast("Vacante creada")
        router.push(`/panel/vacancies/${result.id}`)
      }
      router.refresh()
    } catch (err) {
      showToast((err as Error).message, "error")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="input-floating">
        <input
          type="text"
          id="vacancy-title"
          className="input"
          placeholder=""
          name="title"
          defaultValue={vacancy?.title ?? ""}
          required
        />
        <label htmlFor="vacancy-title" className="input-floating-label">
          Título del puesto
        </label>
      </div>

      <div className="input-floating">
        <textarea
          id="vacancy-description"
          className="input"
          placeholder=""
          name="description"
          rows={3}
          defaultValue={vacancy?.description ?? ""}
        />
        <label htmlFor="vacancy-description" className="input-floating-label">
          Descripción
        </label>
      </div>

      <div className="input-floating">
        <textarea
          id="vacancy-requirements"
          className="input"
          placeholder=""
          name="requirements"
          rows={3}
          defaultValue={vacancy?.requirements ?? ""}
        />
        <label htmlFor="vacancy-requirements" className="input-floating-label">
          Requisitos
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="input-floating">
          <input
            type="text"
            id="vacancy-location"
            className="input"
            placeholder=""
            name="location"
            defaultValue={vacancy?.location ?? ""}
          />
          <label htmlFor="vacancy-location" className="input-floating-label">
            Ubicación
          </label>
        </div>

        <div className="input-floating">
          <select
            id="vacancy-modality"
            className="input"
            name="modality"
            defaultValue={vacancy?.modality ?? ""}
          >
            <option value="">Seleccionar</option>
            <option value="REMOTO">Remoto</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="HIBRIDO">Híbrido</option>
          </select>
          <label htmlFor="vacancy-modality" className="input-floating-label">
            Modalidad
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="input-floating">
          <input
            type="number"
            id="vacancy-salaryMin"
            className="input"
            placeholder=""
            name="salaryMin"
            min={0}
            defaultValue={vacancy?.salaryMin ?? ""}
          />
          <label htmlFor="vacancy-salaryMin" className="input-floating-label">
            Salario mínimo (USD)
          </label>
        </div>

        <div className="input-floating">
          <input
            type="number"
            id="vacancy-salaryMax"
            className="input"
            placeholder=""
            name="salaryMax"
            min={0}
            defaultValue={vacancy?.salaryMax ?? ""}
          />
          <label htmlFor="vacancy-salaryMax" className="input-floating-label">
            Salario máximo (USD)
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="input-floating">
          <select
            id="vacancy-status"
            className="input"
            name="status"
            defaultValue={vacancy?.status ?? "OPEN"}
          >
            <option value="OPEN">Abierta</option>
            <option value="PAUSED">Pausada</option>
            <option value="CLOSED">Cerrada</option>
          </select>
          <label htmlFor="vacancy-status" className="input-floating-label">
            Estado
          </label>
        </div>

        <div className="input-floating">
          <input
            type="date"
            id="vacancy-closedAt"
            className="input"
            placeholder=""
            name="closedAt"
            defaultValue={vacancy?.closedAt ? vacancy.closedAt.split("T")[0] : ""}
          />
          <label htmlFor="vacancy-closedAt" className="input-floating-label">
            Fecha de cierre
          </label>
        </div>
      </div>

      <div className="divider my-0" />

      <button type="submit" className="btn btn-primary w-full mt-1">
        {isEditing ? "Guardar cambios" : "Crear vacante"}
      </button>
    </form>
  )
}
