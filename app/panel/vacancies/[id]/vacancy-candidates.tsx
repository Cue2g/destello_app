"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { assignCandidate, removeCandidate, updateCandidateStage } from "./actions"
import { showToast } from "@/components/toast"

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

interface CandidateInfo {
  candidateId: number
  name: string | null
  email: string
  phone: string | null
  skills: string[]
  tags: { id: number; name: string; color: string }[]
  stage: string
  assignedAt: Date
  assignedByName: string | null
}

interface Props {
  vacancyId: number
  candidates: CandidateInfo[]
}

export function VacancyCandidatesSection({ vacancyId, candidates }: Props) {
  const router = useRouter()
  const [showAssign, setShowAssign] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{ id: number; name: string | null; email: string }[]>([])
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
      const res = await fetch(`/api/vacancies/${vacancyId}/candidates?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data.candidates ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  async function handleAssign(candidateId: number) {
    try {
      await assignCandidate(vacancyId, candidateId)
      showToast("Candidato asignado a la vacante")
      setShowAssign(false)
      setSearchTerm("")
      setSearchResults([])
      router.refresh()
    } catch (err) {
      showToast((err as Error).message, "error")
    }
  }

  async function handleRemove(candidateId: number, name: string | null) {
    if (!confirm(`¿Desasignar a "${name || "este candidato"}" de esta vacante?`)) return
    try {
      await removeCandidate(vacancyId, candidateId)
      showToast("Candidato desasignado")
      router.refresh()
    } catch (err) {
      showToast((err as Error).message, "error")
    }
  }

  async function handleStageChange(candidateId: number, stage: string) {
    try {
      await updateCandidateStage(vacancyId, candidateId, stage)
      showToast("Etapa actualizada")
      router.refresh()
    } catch (err) {
      showToast((err as Error).message, "error")
    }
  }

  return (
    <div className="border border-base-300 bg-base-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest flex items-center gap-2">
          <span className="icon-[tabler--users] size-4 text-primary" />
          Candidatos asignados
          {candidates.length > 0 && (
            <span className="badge badge-sm badge-ghost">{candidates.length}</span>
          )}
        </h2>
        <button
          type="button"
          className="btn btn-primary btn-xs gap-1"
          onClick={() => setShowAssign(!showAssign)}
        >
          <span className="icon-[tabler--plus] size-3.5" />
          Asignar
        </button>
      </div>

      {/* Assign candidate search */}
      {showAssign && (
        <div className="mb-4 p-3 bg-base-200 rounded-lg space-y-2">
          <div className="input-floating">
            <input
              type="text"
              id="search-candidate"
              className="input input-sm"
              placeholder=""
              value={searchTerm}
              onChange={handleSearch}
              autoFocus
            />
            <label htmlFor="search-candidate" className="input-floating-label">
              Buscar candidato por nombre o email...
            </label>
          </div>

          {searching && (
            <p className="text-xs text-base-content/70">Buscando...</p>
          )}

          {searchResults.length > 0 && (
            <div className="border border-base-300 rounded-lg bg-base-100 max-h-48 overflow-y-auto">
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-base-200 border-b border-base-200 last:border-b-0 flex items-center justify-between"
                  onClick={() => handleAssign(c.id)}
                >
                  <span>{c.name || "Sin nombre"}</span>
                  <span className="text-xs text-base-content/60">{c.email}</span>
                </button>
              ))}
            </div>
          )}

          {searchTerm.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-xs text-base-content/60">Sin resultados</p>
          )}
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex size-10 items-center justify-center rounded-full bg-base-200 text-base-content/50 mx-auto mb-3">
            <span className="icon-[tabler--user-plus] size-5" />
          </div>
          <p className="text-sm text-base-content/60">
            {showAssign
              ? "Busca un candidato para asignarlo a esta vacante"
              : "Aún no hay candidatos asignados"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {candidates.map((cv) => (
            <div
              key={cv.candidateId}
              className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <a
                    href={`/panel/candidates/${cv.candidateId}`}
                    className="font-medium text-sm text-base-content hover:text-primary truncate"
                  >
                    {cv.name || "Sin nombre"}
                  </a>
                  <span className={`badge badge-xs ${stageColors[cv.stage] ?? "badge-ghost"}`}>
                    {stageLabels[cv.stage] ?? cv.stage}
                  </span>
                </div>
                <div className="text-xs text-base-content/70 mt-0.5">
                  {cv.email}
                  {cv.phone && ` · ${cv.phone}`}
                </div>
                {cv.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cv.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="badge badge-xs"
                        style={{
                          backgroundColor: tag.color + "20",
                          color: tag.color,
                          borderColor: tag.color + "40",
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <select
                  className="select select-xs w-auto"
                  value={cv.stage}
                  onChange={(e) => handleStageChange(cv.candidateId, e.target.value)}
                >
                  {Object.entries(stageLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                  title="Desasignar"
                  onClick={() => handleRemove(cv.candidateId, cv.name)}
                >
                  <span className="icon-[tabler--x] size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
