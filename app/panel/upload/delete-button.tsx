"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function DeleteButton({ id, name }: { id: number; name: string }) {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`¿Eliminar a "${name || 'este candidato'}"? También se borrará el archivo.`)) return
    setPending(true)

    const res = await fetch(`/api/upload/delete?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      router.refresh()
    }
    setPending(false)
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm text-error"
      onClick={handleDelete}
      disabled={pending}
      title="Eliminar"
    >
      <span className="icon-[tabler--trash] size-4" />
    </button>
  )
}
