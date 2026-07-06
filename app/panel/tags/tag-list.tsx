"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ConfirmDialog, openConfirm } from "@/components/confirm-dialog"

const TAG_COLORS = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Rojo", value: "#ef4444" },
  { name: "Verde", value: "#22c55e" },
  { name: "Amarillo", value: "#eab308" },
  { name: "Púrpura", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Naranja", value: "#f97316" },
  { name: "Cian", value: "#06b6d4" },
  { name: "Gris", value: "#6b7280" },
  { name: "Esmeralda", value: "#10b981" },
  { name: "Índigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
]

type TagData = {
  id: number
  name: string
  color: string
  prompt: string | null
  _count: { candidates: number }
}

export function TagList({ tags }: { tags: TagData[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [editPrompt, setEditPrompt] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function startEdit(tag: TagData) {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
    setEditPrompt(tag.prompt || "")
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: number) {
    setSaving(true)
    const res = await fetch("/api/tags", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: editName.trim(),
        color: editColor,
        prompt: editPrompt.trim() || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setEditingId(null)
      router.refresh()
    }
  }

  function requestDelete(id: number) {
    setDeletingId(id)
    openConfirm("confirm-tag-delete")
  }

  async function handleDelete() {
    if (deletingId === null) return
    const res = await fetch(`/api/tags?id=${deletingId}`, { method: "DELETE" })
    if (res.ok) router.refresh()
    setDeletingId(null)
  }

  return (
    <>
      {tags.length === 0 ? (
        <div className="text-center text-base-content/75 py-8">
          No hay tags creados aún
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Prompt</th>
                <th>Candidatos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
            <tr key={tag.id}>
              {editingId === tag.id ? (
                <>
                  <td className="min-w-[180px]">
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        className="input input-sm"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1">
                        {TAG_COLORS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            title={c.name}
                            className={`size-5 rounded-full border ${
                              editColor === c.value ? "border-base-content scale-125" : "border-transparent"
                            }`}
                            style={{ backgroundColor: c.value }}
                            onClick={() => setEditColor(c.value)}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td>
                    <textarea
                      className="textarea textarea-sm min-h-[60px] w-full"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="Sin prompt"
                    />
                  </td>
                  <td className="text-sm text-base-content/75">{tag._count.candidates}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-success"
                        onClick={() => saveEdit(tag.id)}
                        disabled={saving}
                      >
                        <span className="icon-[tabler--check] size-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        <span className="icon-[tabler--x] size-4" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <span
                      className="badge gap-1.5"
                      style={{
                        backgroundColor: tag.color + "20",
                        color: tag.color,
                        borderColor: tag.color + "40",
                      }}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </span>
                  </td>
                  <td className="text-sm text-base-content/75 max-w-[200px] truncate">
                    {tag.prompt || (
                      <span className="text-base-content/50 italic">Sin prompt</span>
                    )}
                  </td>
                  <td className="text-sm text-base-content/75">{tag._count.candidates}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => startEdit(tag)}
                      >
                        <span className="icon-[tabler--pencil] size-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => requestDelete(tag.id)}
                      >
                        <span className="icon-[tabler--trash] size-4" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      )}
      <ConfirmDialog
        id="confirm-tag-delete"
        title="Eliminar tag"
        message="¿Eliminar este tag? Se removerá de todos los candidatos."
        confirmText="Eliminar"
        variant="error"
        onConfirm={handleDelete}
      />
    </>
  )
}
