import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { CandidateStatus } from "@/app/generated/prisma/enums"
import { CandidateSource } from "@/app/generated/prisma/enums"
import { updateStatus, updateObservations } from "./actions"
import { DeleteCandidateButton } from "./delete-button"

type Experience = { title: string; company: string; period: string; description: string }
type Education = { degree: string; institution: string; year: string }
type Course = { name: string; institution: string; year: string }

const statusLabels: Record<string, string> = {
  NEW: "Nuevo",
  REVIEWED: "Revisado",
  CONTACTED: "Contactado",
  REJECTED: "Rechazado",
  HIRED: "Contratado",
}

const statusColors: Record<string, string> = {
  NEW: "badge-info",
  REVIEWED: "badge-warning",
  CONTACTED: "badge-primary",
  HIRED: "badge-success",
  REJECTED: "badge-error",
}

const sourceLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  UPLOAD: "Upload",
}

const sourceIcons: Record<string, string> = {
  WHATSAPP: "icon-[tabler--brand-whatsapp]",
  EMAIL: "icon-[tabler--mail]",
  UPLOAD: "icon-[tabler--upload]",
}

const sourceBadgeColors: Record<string, string> = {
  WHATSAPP: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-300",
  EMAIL: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300",
  UPLOAD: "bg-purple-500/10 text-purple-700 border-purple-300 dark:text-purple-300",
}

function toExperience(raw: unknown): Experience[] {
  if (typeof raw !== "string") return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((v: unknown): v is Experience =>
      typeof v === "object" && v !== null &&
      (typeof (v as Record<string, unknown>).title === "string" ||
       typeof (v as Record<string, unknown>).company === "string")
    )
  } catch { return [] }
}

function toEducation(raw: unknown): Education[] {
  if (typeof raw !== "string") return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((v: unknown): v is Education =>
      typeof v === "object" && v !== null &&
      (typeof (v as Record<string, unknown>).degree === "string" ||
       typeof (v as Record<string, unknown>).institution === "string")
    )
  } catch { return [] }
}

function toCourses(raw: unknown): Course[] {
  if (typeof raw !== "string") return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter((v: unknown): v is Course =>
      typeof v === "object" && v !== null &&
      (typeof (v as Record<string, unknown>).name === "string" ||
       typeof (v as Record<string, unknown>).institution === "string")
    )
  } catch { return [] }
}

function toStrings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((v): v is string => typeof v === "string")
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const candidate = await prisma.candidate.findUnique({
    where: { id: parseInt(id) },
    include: { tags: true },
  })

  if (!candidate) {
    notFound()
  }

  const experience = toExperience(candidate.experience)
  const education = toEducation(candidate.education)
  const courses = toCourses(candidate.courses)
  const skills = toStrings(candidate.skills)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{candidate.name || "Sin nombre"}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`badge ${statusColors[candidate.status] ?? "badge-ghost"}`}>
                  {statusLabels[candidate.status] ?? candidate.status}
                </span>
                <span
                  className={`badge border ${sourceBadgeColors[candidate.source] ?? ""}`}
                >
                  <span className={`${sourceIcons[candidate.source] ?? ""} size-3.5 mr-1`} />
                  {sourceLabels[candidate.source] ?? candidate.source}
                </span>
                {candidate.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="badge badge-sm"
                    style={{
                      backgroundColor: tag.color + "20",
                      color: tag.color,
                      borderColor: tag.color + "40",
                    }}
                  >
                    <span className="size-1.5 rounded-full mr-1" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            <DeleteCandidateButton id={candidate.id} name={candidate.name || ""} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="icon-[tabler--user-circle] size-5 text-primary" />
                Contacto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                {candidate.email && (
                  <div>
                    <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Email</span>
                    <p className="text-sm text-base-content mt-0.5">{candidate.email}</p>
                  </div>
                )}
                {candidate.phone && (
                  <div>
                    <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Teléfono</span>
                    <p className="text-sm text-base-content mt-0.5">{candidate.phone}</p>
                  </div>
                )}
                {candidate.address && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-base-content/40 uppercase tracking-wider font-medium">Dirección</span>
                    <p className="text-sm text-base-content mt-0.5">{candidate.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="icon-[tabler--bolt] size-5 text-primary" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {skills.map((skill, i) => (
                    <span key={i} className="badge badge-sm bg-base-200 text-base-content border-none">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="icon-[tabler--briefcase] size-5 text-primary" />
                  Experiencia
                </h2>
                <div className="flex flex-col gap-3 mt-3">
                  {experience.map((exp, i) => (
                    <div key={i} className="bg-base-200 rounded-xl p-4">
                      <div className="font-semibold text-base-content">{exp.title}</div>
                      {(exp.company || exp.period) && (
                        <div className="text-sm text-base-content/60 mt-0.5">
                          {exp.company}{exp.company && exp.period ? " · " : ""}{exp.period}
                        </div>
                      )}
                      {exp.description && (
                        <p className="text-sm text-base-content/70 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="icon-[tabler--school] size-5 text-primary" />
                  Educación
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {education.map((edu, i) => (
                    <div key={i} className="bg-base-200 rounded-xl p-4">
                      <div className="font-semibold text-sm text-base-content">{edu.degree}</div>
                      {(edu.institution || edu.year) && (
                        <div className="text-xs text-base-content/60 mt-1">
                          {edu.institution}{edu.institution && edu.year ? " · " : ""}{edu.year}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Courses */}
          {courses.length > 0 && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="icon-[tabler--certificate] size-5 text-primary" />
                  Cursos / Certificaciones
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {courses.map((course, i) => (
                    <div key={i} className="bg-base-200 rounded-xl p-4">
                      <div className="font-semibold text-sm text-base-content">{course.name}</div>
                      {(course.institution || course.year) && (
                        <div className="text-xs text-base-content/60 mt-1">
                          {course.institution}{course.institution && course.year ? " · " : ""}{course.year}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {candidate.cvSummary && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="icon-[tabler--file-text] size-5 text-primary" />
                  Resumen
                </h2>
                <p className="text-sm text-base-content/80 mt-3 leading-relaxed">{candidate.cvSummary}</p>
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="icon-[tabler--notes] size-5 text-primary" />
                Observaciones
              </h2>
              <form action={updateObservations.bind(null, candidate.id)} className="mt-3">
                <textarea
                  name="observations"
                  className="textarea textarea-bordered w-full text-sm"
                  rows={4}
                  defaultValue={candidate.observations || ""}
                  placeholder="Notas, seguimiento, comentarios..."
                />
                <button type="submit" className="btn btn-primary btn-sm mt-2 w-full">
                  <span className="icon-[tabler--device-floppy] size-4" />
                  Guardar observaciones
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="icon-[tabler--toggle-left] size-5 text-primary" />
                Cambiar estado
              </h2>
              <form action={updateStatus.bind(null, candidate.id)} className="mt-3 space-y-3">
                <select
                  name="status"
                  className="select select-bordered w-full text-sm"
                  defaultValue={candidate.status}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary w-full btn-sm">
                  <span className="icon-[tabler--refresh] size-4" />
                  Actualizar
                </button>
              </form>
            </div>
          </div>

          {/* CV File */}
          {candidate.cvFilePath && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="icon-[tabler--file] size-5 text-primary" />
                  CV adjunto
                </h2>
                <a
                  href={candidate.cvFilePath}
                  target="_blank"
                  className="btn btn-ghost btn-sm w-full mt-3"
                >
                  <span className="icon-[tabler--file-text] size-4" />
                  Ver CV
                </a>
              </div>
            </div>
          )}

          {/* Raw text */}
          {candidate.rawText && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <details>
                  <summary className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                    <span className="icon-[tabler--code] size-5 text-primary" />
                    Texto extraído
                  </summary>
                  <pre className="mt-3 text-xs text-base-content/70 whitespace-pre-wrap max-h-96 overflow-y-auto bg-base-200 rounded-lg p-3">
                    {candidate.rawText}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="icon-[tabler--info-circle] size-5 text-primary" />
                Metadatos
              </h2>
              <div className="space-y-2 mt-3 text-xs text-base-content/70">
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="font-mono">#{candidate.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Creado</span>
                  <span>{new Date(candidate.createdAt).toLocaleString("es-VE")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Actualizado</span>
                  <span>{new Date(candidate.updatedAt).toLocaleString("es-VE")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
