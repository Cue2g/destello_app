"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { assignCandidate, removeCandidate } from "@/app/panel/vacancies/[id]/actions"
import { showToast } from "@/components/toast"

interface AssignedVacancy {
  vacancyId: number
  title: string
  stage: string
  assignedAt: Date
}

interface Props {
  candidateId: number
  initialVacancies: AssignedVacancy[]
}

const stageLabels: Record<string, string> = {
  NEW: "Nuevo",
  SCREENING: "Screening",
  INTERVIEW: "Entrevista",
  OFFER: "Oferta",
  HIRED: "Contratado",
  REJECTED: "Rechazado",
}

const stageColors: Record<string, string> = {
  NEW: "badge-info",
  SCREENING: "badge-warning",
  INTERVIEW: "badge-primary",
  OFFER: "badge-accent",
  HIRED: "badge-success",
  REJECTED: "badge-error",
}

export function VacanciesCard({ candidateId, initialVacancies }: Props) {
  const router = useRouter()
  const [showAssign, setShowAssign] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: number; title: string; status: string }[]>([])
  const [searching, setSearching] = useState(false)

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchTerm(q)
    if (q.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/vacancies/search?q=${encodeURIComponent(q)}&excludeCandidateId=${candidateId}`)
      const data = await res.json()
      setSearchResults(data.vacancies ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  async function handleAssign(vacancyId: number) {
    try {
      await assignCandidate(vacancyId, candidateId)
      showToast("Vacante asignada")
      setShowAssign(false)
      setSearchTerm("")
      setSearchResults([])
      router.refresh()
    } catch (err) {
      showToast((err as Error).message, "error")
    }
  }

  async function handleRemove(vacancyId: number, title: string) {
    if (!confirm(`¿Desasignar de "${title}"?`)) return
    try {
      await removeCandidate(vacancyId, candidateId)
      showToast("Vacante desasignada")
      router.refresh()
    } catch (err) {
      showToast((err as Error).message, "error")
    }
  }

  return (
    <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 intersect-half motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest flex items-center gap-2">
          <span className="icon-[tabler--briefcase] size-4 text-primary" />
          Vacantes
        </h2>
        <button
          type="button"
          className="btn btn-ghost btn-xs"
          onClick={() => setShowAssign(!showAssign)}
        >
          <span className="icon-[tabler--plus] size-3.5" />
          Asignar
        </button>
      </div>

      {showAssign && (
        <div className="mb-3 p-3 bg-base-200 rounded-lg space-y-2">
          <div className="input-floating">
            <input
              type="text"
              id="candidate-search-vacancy"
              className="input input-sm"
              placeholder=""
              value={searchTerm}
              onChange={handleSearch}
              autoFocus
            />
            <label htmlFor="candidate-search-vacancy" className="input-floating-label">
              Buscar vacante...
            </label>
          </div>

          {searching && <p className="text-xs text-base-content/70">Buscando...</p>}

          {searchResults.length > 0 && (
            <div className="border border-base-300 rounded-lg bg-base-100 max-h-40 overflow-y-auto">
              {searchResults.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 border-b border-base-200 last:border-b-0 flex items-center justify-between"
                  onClick={() => handleAssign(v.id)}
                >
                  <span>{v.title}</span>
                  <span className="text-xs text-base-content/60">
                    {v.status === "OPEN" ? "Abierta" : v.status === "PAUSED" ? "Pausada" : "Cerrada"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-base-content/60">Sin resultados</p>
          )}
        </div>
      )}

      {initialVacancies.length === 0 ? (
        <p className="text-sm text-base-content/50 italic">
          Sin vacantes asignadas
        </p>
      ) : (
        <div className="space-y-2">
          {initialVacancies.map((v) => (
            <div
              key={v.vacancyId}
              className="flex items-center justify-between gap-2 py-2 border-b border-base-200 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <a
                  href={`/panel/vacancies/${v.vacancyId}`}
                  className="text-sm text-base-content hover:text-primary truncate block"
                >
                  {v.title}
                </a>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`badge badge-xs ${stageColors[v.stage] ?? "badge-ghost"}`}>
                    {stageLabels[v.stage] ?? v.stage}
                  </span>
                  <span className="text-[10px] text-base-content/50">
                    {new Date(v.assignedAt).toLocaleDateString("es-VE")}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                title="Desasignar"
                onClick={() => handleRemove(v.vacancyId, v.title)}
              >
                <span className="icon-[tabler--x] size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
