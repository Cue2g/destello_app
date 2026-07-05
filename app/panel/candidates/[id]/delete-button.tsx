"use client"

import { useRouter } from "next/navigation"
import { deleteCandidate } from "./actions"

export function DeleteCandidateButton({ id, name }: { id: number; name: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`¿Eliminar a "${name || 'este candidato'}"? También se borrará el archivo.`)) return
    await deleteCandidate(id)
    router.push("/panel/candidates")
    router.refresh()
  }

  return (
    <button type="button" onClick={handleDelete} className="btn btn-error btn-sm">
      <span className="icon-[tabler--trash] size-4" />
      Eliminar
    </button>
  )
}
