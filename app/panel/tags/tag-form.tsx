"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

export function TagForm() {
  const [name, setName] = useState("")
  const [color, setColor] = useState(TAG_COLORS[0].value)
  const [prompt, setPrompt] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), color, prompt: prompt.trim() || null }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al crear tag")
      setPending(false)
      return
    }

    setName("")
    setColor(TAG_COLORS[0].value)
    setPrompt("")
    setPending(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="text-sm text-error flex items-center gap-1">
          <span className="icon-[tabler--alert-circle] size-4" />
          {error}
        </div>
      )}
      <div className="input-floating">
        <input
          type="text"
          className="input"
          id="tag-name"
          placeholder=""
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label className="input-floating-label" htmlFor="tag-name">
          Nombre del tag
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-base-content/60">Color</label>
        <div className="flex flex-wrap gap-2">
          {TAG_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.name}
              className={`size-8 rounded-full border-2 transition-all ${
                color === c.value ? "border-base-content scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c.value }}
              onClick={() => setColor(c.value)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-base-content/60" htmlFor="tag-prompt">
          Prompt de contexto (opcional)
        </label>
        <textarea
          className="textarea min-h-[80px]"
          id="tag-prompt"
          placeholder="Ej: Personas con experiencia en React, Next.js o frameworks frontend modernos"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <p className="text-xs text-base-content/40">
          La IA usará esta descripción para sugerir este tag al analizar CVs
        </p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        <span className="icon-[tabler--plus] size-5" />
        {pending ? "Creando..." : "Crear tag"}
      </button>
    </form>
  )
}
