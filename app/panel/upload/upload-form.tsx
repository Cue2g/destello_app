"use client"

import { useState, useRef } from "react"
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
  rawText: string
}

const ACCEPTED_TYPES = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg']

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-base-content/60 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm text-base-content">{value}</span>
    </div>
  )
}

function BadgeField({ label, items }: { label: string; items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-base-content/60 uppercase tracking-wider font-medium">{label}</span>
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
      <span className="text-xs text-base-content/60 uppercase tracking-wider font-medium">Experiencia</span>
      <div className="flex flex-col gap-2">
        {items.map((exp, i) => (
          <div key={i} className="bg-base-200 rounded-lg p-3">
            <div className="font-medium text-sm text-base-content">{exp.title}</div>
            {(exp.company || exp.period) && (
              <div className="text-xs text-base-content/75 mt-0.5">
                {exp.company}{exp.company && exp.period ? ' · ' : ''}{exp.period}
              </div>
            )}
            {exp.description && (
              <div className="text-xs text-base-content/80 mt-1 leading-relaxed">{exp.description}</div>
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
      <span className="text-xs text-base-content/60 uppercase tracking-wider font-medium">Educación</span>
      <div className="flex flex-col gap-2">
        {items.map((edu, i) => (
          <div key={i} className="bg-base-200 rounded-lg p-3">
            <div className="font-medium text-sm text-base-content">{edu.degree}</div>
            {(edu.institution || edu.year) && (
              <div className="text-xs text-base-content/75 mt-0.5">
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
      <span className="text-xs text-base-content/60 uppercase tracking-wider font-medium">Cursos / Certificaciones</span>
      <div className="flex flex-col gap-2">
        {items.map((course, i) => (
          <div key={i} className="bg-base-200 rounded-lg p-3">
            <div className="font-medium text-sm text-base-content">{course.name}</div>
            {(course.institution || course.year) && (
              <div className="text-xs text-base-content/75 mt-0.5">
                {course.institution}{course.institution && course.year ? ' · ' : ''}{course.year}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'tabler--file-type-pdf'
  if (['doc', 'docx'].includes(ext || '')) return 'tabler--file-text'
  if (['png', 'jpg', 'jpeg'].includes(ext || '')) return 'tabler--photo'
  return 'tabler--file'
}

export function UploadForm() {
  const [step, setStep] = useState<"upload" | "review">("upload")
  const [pending, setPending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function setInputFile(file: File) {
    const dt = new DataTransfer()
    dt.items.add(file)
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files
    }
  }

  function handleFile(file: File) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError("Formato no soportado. Usa PDF, DOCX, PNG o JPG.")
      return
    }
    setError(null)
    setSelectedFile(file)
    setInputFile(file)
  }

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
    setPreview({ ...parsed, rawText: data.cleanedText || '' })
    setStep("review")
    setPending(false)
  }

  function toggleTag(id: number) {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    )
  }

  async function handleConfirm() {
    if (!preview) return
    if (!selectedFile) {
      setError("El archivo ya no está disponible. Vuelve a subirlo.")
      return
    }
    setSaving(true)

    const formData = new FormData()
    formData.append("file", selectedFile)
    formData.append("name", preview.name)
    formData.append("email", preview.email)
    formData.append("phone", preview.phone)
    formData.append("address", preview.address)
    formData.append("summary", preview.summary)
    formData.append("rawText", preview.rawText)
    formData.append("education", JSON.stringify(preview.education))
    formData.append("experience", JSON.stringify(preview.experience))
    formData.append("skills", JSON.stringify(preview.skills))
    formData.append("courses", JSON.stringify(preview.courses))
    formData.append("tagIds", JSON.stringify(selectedTagIds))

    const res = await fetch("/api/upload/confirm", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Error al guardar")
      setSaving(false)
      if (res.status === 409) {
        setPreview(null)
        setSelectedFile(null)
        setSelectedTagIds([])
        setStep("upload")
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      return
    }

    setPreview(null)
    setSelectedTagIds([])
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    router.push(`/panel/candidates/${data.id}`)
    router.refresh()
  }

  function handleCancel() {
    setPreview(null)
    setSelectedTagIds([])
    setSelectedFile(null)
    setStep("upload")
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (step === "review" && preview) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
            <span className="icon-[tabler--file-text] size-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Vista previa</h2>
            <p className="text-sm text-base-content/75">
              {preview.name ? `Datos extraídos de ${preview.name}` : 'Datos extraídos del CV'}
            </p>
          </div>
        </div>

        <div className="divider my-0" />

        <div className="grid lg:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre" value={preview.name} />
              <Field label="Email" value={preview.email} />
              <Field label="Teléfono" value={preview.phone} />
              <Field label="Dirección" value={preview.address} />
            </div>

            {preview.skills.length > 0 && <BadgeField label="Skills" items={preview.skills} />}

            {preview.summary && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-base-content/60 uppercase tracking-wider font-medium">Resumen</span>
                <p className="text-sm text-base-content leading-relaxed">{preview.summary}</p>
              </div>
            )}

            {preview.suggestedTags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-base-content/60 uppercase tracking-wider font-medium">Tags sugeridos</span>
                <div className="flex flex-wrap gap-2">
                  {preview.suggestedTags.map((tag) => {
                    const selected = selectedTagIds.includes(tag.id)
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`badge cursor-pointer transition-all gap-1 ${selected ? "" : "opacity-40"}`}
                        style={{
                          backgroundColor: selected ? tag.color + "20" : "transparent",
                          color: tag.color,
                          borderColor: tag.color + "40",
                        }}
                      >
                        <span className="size-2 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                        <span className={`icon-[tabler--${selected ? "check" : "plus"}] size-3`} />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <ExperienceCards items={preview.experience} />
            <EducationCards items={preview.education} />
            <CourseCards items={preview.courses} />
          </div>
        </div>

        <div className="divider my-0" />

        {error && (
          <div className="text-sm text-error flex items-center gap-1">
            <span className="icon-[tabler--alert-circle] size-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={handleCancel}
            disabled={saving}
          >
            Subir otro CV
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
    )
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-6">
        <header className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="icon-[tabler--file-upload] size-6" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight">Subir CV</h1>
            <p className="text-xs text-base-content/70 mt-1">
              PDF, DOCX o imagen. Extraemos los datos automáticamente.
            </p>
          </div>
        </header>
        <div className="border border-base-300 bg-base-100 rounded-lg w-full p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="text-sm text-error flex items-center gap-1">
                <span className="icon-[tabler--alert-circle] size-4 shrink-0" />
                {error}
              </div>
            )}

            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-base-300 hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0])
                }}
                required
              />

              {pending && (
                <div className="absolute inset-0 bg-base-100/60 rounded-xl flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-2">
                    <span className="icon-[tabler--loader-2] size-7 text-primary animate-spin" />
                    <span className="text-sm text-base-content/75 font-medium">Procesando archivo...</span>
                  </div>
                </div>
              )}

              {selectedFile && !pending ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className={`icon-[${getFileIcon(selectedFile.name)}] size-7`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-base-content">{selectedFile.name}</p>
                    <p className="text-xs text-base-content/75 mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                      setError(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : !pending ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="icon-[tabler--file-upload] size-7" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-base-content">
                      Arrastra tu archivo aquí
                    </p>
                    <p className="text-xs text-base-content/75 mt-1">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="badge badge-sm gap-1">
                      <span className="icon-[tabler--file-type-pdf] size-3.5" />
                      PDF
                    </span>
                    <span className="badge badge-sm gap-1">
                      <span className="icon-[tabler--file-text] size-3.5" />
                      DOCX
                    </span>
                    <span className="badge badge-sm gap-1">
                      <span className="icon-[tabler--photo] size-3.5" />
                      PNG
                    </span>
                    <span className="badge badge-sm gap-1">
                      <span className="icon-[tabler--photo] size-3.5" />
                      JPG
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={pending || !selectedFile}
            >
              <span className="icon-[tabler--file-upload] size-5" />
              {pending ? "Procesando..." : "Subir y procesar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
