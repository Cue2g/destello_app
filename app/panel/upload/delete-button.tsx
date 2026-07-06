"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ConfirmDialog, openConfirm } from "@/components/confirm-dialog"

export function DeleteButton({ id, name }: { id: number; name: string }) {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setPending(true)
    const res = await fetch(`/api/upload/delete?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      router.refresh()
    }
    setPending(false)
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm text-error"
        onClick={() => openConfirm("confirm-upload-delete")}
        disabled={pending}
        title="Eliminar"
      >
        <span className="icon-[tabler--trash] size-4" />
      </button>
      <ConfirmDialog
        id="confirm-upload-delete"
        title="Eliminar candidato"
        message={`¿Eliminar a "${name || 'este candidato'}"? También se borrará el archivo.`}
        confirmText="Eliminar"
        variant="error"
        onConfirm={handleDelete}
      />
    </>
  )
}
