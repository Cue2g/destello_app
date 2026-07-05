"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type TagInfo = { id: number; name: string; color: string }

type Experience = { title: string; company: string; period: string; description: string }
type Education = { degree: string; institution: string; year: string }
type Course = { name: string; institution: string; year: string }

type ParsedData = {
  name: string
  email: string
  phone: string
  address: string
  education: Education[]
  experience: Experience[]
  skills: string[]
  courses: Course[]
  summary: string
  suggestedTags: TagInfo[]
}

type PreviewData = ParsedData & {
  fileName: string
  filePath: string
  rawText: string
}

export function UploadForm() {
  const [pending, setPending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const file = formData.get("file") as File

    if (!file || file.size === 0) {
      setError("Selecciona un archivo")
      setPending(false)
      return
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al subir el archivo")
      setPending(false)
      return
    }

    const parsed: ParsedData = {
      ...data.parsed,
      education: Array.isArray(data.parsed.education) ? data.parsed.education : [],
      experience: Array.isArray(data.parsed.experience) ? data.parsed.experience : [],
      skills: Array.isArray(data.parsed.skills) ? data.parsed.skills : [],
      courses: Array.isArray(data.parsed.courses) ? data.parsed.courses : [],
      suggestedTags: Array.isArray(data.parsed.suggestedTags) ? data.parsed.suggestedTags : [],
    }

    const suggestedIds = (parsed.suggestedTags || []).map((t: TagInfo) => t.id)
    setSelectedTagIds(suggestedIds)
    setPreview({ ...parsed, fileName: data.fileName, filePath: data.filePath, rawText: data.cleanedText || '' })
    setPending(false)
  }

  function toggleTag(id: number) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  async function handleConfirm() {
    if (!preview) return
    setSaving(true)

    const res = await fetch("/api/upload/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: preview.name,
        email: preview.email,
        phone: preview.phone,
        address: preview.address,
        education: preview.education,
        experience: preview.experience,
        skills: preview.skills,
        courses: preview.courses,
        summary: preview.summary,
        rawText: preview.rawText,
        fileName: preview.fileName,
        filePath: preview.filePath,
        tagIds: selectedTagIds,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al guardar")
      setSaving(false)
      return
    }

    setPreview(null)
    setSelectedTagIds([])
    router.push("/panel/upload?created=1")
    router.refresh()
  }

  function handleCancel() {
    setPreview(null)
    setSelectedTagIds([])
  }

  function Field({ label, value }: { label: string; value: string }) {
    if (!value) return null
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">{label}</span>
        <span className="text-sm text-base-content">{value}</span>
      </div>
    )
  }

  function BadgeField({ label, items }: { label: string; items: string[] }) {
    if (!items || items.length === 0) return null
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">{label}</span>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="badge badge-sm bg-base-200 text-base-content border-none">
              {item}
            </span>
          ))}
        </div>
      </div>
    )
  }

  function ExperienceCards({ items }: { items: Experience[] }) {
    if (!items || items.length === 0) return null
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Experiencia</span>
        <div className="flex flex-col gap-2">
          {items.map((exp, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-3">
              <div className="font-medium text-sm text-base-content">{exp.title}</div>
              {(exp.company || exp.period) && (
                <div className="text-xs text-base-content/60 mt-0.5">
                  {exp.company}{exp.company && exp.period ? ' · ' : ''}{exp.period}
                </div>
              )}
              {exp.description && (
                <div className="text-xs text-base-content/70 mt-1 leading-relaxed">{exp.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  function EducationCards({ items }: { items: Education[] }) {
    if (!items || items.length === 0) return null
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Educación</span>
        <div className="flex flex-col gap-2">
          {items.map((edu, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-3">
              <div className="font-medium text-sm text-base-content">{edu.degree}</div>
              {(edu.institution || edu.year) && (
                <div className="text-xs text-base-content/60 mt-0.5">
                  {edu.institution}{edu.institution && edu.year ? ' · ' : ''}{edu.year}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  function CourseCards({ items }: { items: Course[] }) {
    if (!items || items.length === 0) return null
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Cursos / Certificaciones</span>
        <div className="flex flex-col gap-2">
          {items.map((course, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-3">
              <div className="font-medium text-sm text-base-content">{course.name}</div>
              {(course.institution || course.year) && (
                <div className="text-xs text-base-content/60 mt-0.5">
                  {course.institution}{course.institution && course.year ? ' · ' : ''}{course.year}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="text-sm text-error flex items-center gap-1">
            <span className="icon-[tabler--alert-circle] size-4" />
            {error}
          </div>
        )}
        <div>
          <input
            type="file"
            name="file"
            accept=".pdf,.docx,.doc"
            className="file-input w-full"
            required
          />
          <p className="text-xs text-base-content/60 mt-1">
            PDF o DOCX, máximo 10MB
          </p>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={pending}
        >
          <span className="icon-[tabler--file-upload] size-5" />
          {pending ? "Procesando..." : "Subir y procesar"}
        </button>
      </form>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card bg-base-100 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="card-body gap-6">
              <header className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="icon-[tabler--file-text] size-7" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold">Vista previa</h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    Datos extraídos del CV
                  </p>
                </div>
              </header>

              <div className="divider my-0" />

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre" value={preview.name} />
                  <Field label="Email" value={preview.email} />
                  <Field label="Teléfono" value={preview.phone} />
                  <Field label="Dirección" value={preview.address} />
                </div>

                <ExperienceCards items={preview.experience} />
                <BadgeField label="Skills" items={preview.skills} />
                <EducationCards items={preview.education} />
                <CourseCards items={preview.courses} />

                {preview.summary && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Resumen</span>
                    <p className="text-sm text-base-content leading-relaxed">{preview.summary}</p>
                  </div>
                )}

                {preview.suggestedTags.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Tags sugeridos</span>
                    <div className="flex flex-wrap gap-2">
                      {preview.suggestedTags.map((tag) => {
                        const selected = selectedTagIds.includes(tag.id)
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`badge cursor-pointer transition-all gap-1 ${
                              selected ? "" : "opacity-40"
                            }`}
                            style={{
                              backgroundColor: selected ? tag.color + "20" : "transparent",
                              color: tag.color,
                              borderColor: tag.color + "40",
                            }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                            <span
                              className={`icon-[tabler--${selected ? "check" : "plus"}] size-3`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="divider my-0" />

              <div className="flex gap-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-1"
                  onClick={handleConfirm}
                  disabled={saving}
                >
                  <span className="icon-[tabler--check] size-5" />
                  {saving ? "Guardando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
