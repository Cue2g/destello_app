"use client"

import { useRouter } from "next/navigation"

export function CandidateFilters({
  source,
  status,
}: {
  source: string
  status: string
}) {
  const router = useRouter()

  function applyFilter() {
    const form = document.getElementById("candidate-filters") as HTMLFormElement
    if (!form) return
    const fd = new FormData(form)
    const params = new URLSearchParams()
    const s = fd.get("source") as string
    const st = fd.get("status") as string
    if (s) params.set("source", s)
    if (st) params.set("status", st)
    const qs = params.toString()
    router.push(qs ? `/panel/candidates?${qs}` : "/panel/candidates")
  }

  return (
    <form id="candidate-filters" className="flex flex-wrap gap-3">
      <select
        name="source"
        className="select select-bordered select-sm"
        defaultValue={source}
        onChange={applyFilter}
      >
        <option value="">Todas las fuentes</option>
        <option value="WHATSAPP">WhatsApp</option>
        <option value="EMAIL">Email</option>
        <option value="UPLOAD">Upload</option>
      </select>

      <select
        name="status"
        className="select select-bordered select-sm"
        defaultValue={status}
        onChange={applyFilter}
      >
        <option value="">Todos los estados</option>
        <option value="NEW">Nuevo</option>
        <option value="REVIEWED">Revisado</option>
        <option value="CONTACTED">Contactado</option>
        <option value="REJECTED">Rechazado</option>
        <option value="HIRED">Contratado</option>
      </select>

      {(source || status) && (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => router.push("/panel/candidates")}
        >
          <span className="icon-[tabler--x] size-4" />
          Limpiar
        </button>
      )}
    </form>
  )
}
