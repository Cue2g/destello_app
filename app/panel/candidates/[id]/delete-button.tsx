"use client"

import { useRouter } from "next/navigation"
import { deleteCandidate } from "./actions"
import { ConfirmDialog, openConfirm } from "@/components/confirm-dialog"

export function DeleteCandidateButton({ id, name }: { id: number; name: string }) {
  const router = useRouter()

  async function handleDelete() {
    await deleteCandidate(id)
    router.push("/panel/candidates")
    router.refresh()
  }

  return (
    <>
      <button type="button" onClick={() => openConfirm("confirm-delete")} className="btn btn-error btn-sm">
        <span className="icon-[tabler--trash] size-4" />
        Eliminar
      </button>
      <ConfirmDialog
        id="confirm-delete"
        title="Eliminar candidato"
        message={`¿Eliminar a "${name || 'este candidato'}"? También se borrará el archivo.`}
        confirmText="Eliminar"
        variant="error"
        onConfirm={handleDelete}
      />
    </>
  )
}
