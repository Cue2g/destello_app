import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CandidateStatus } from "@/app/generated/prisma/enums"
import { CandidateSource } from "@/app/generated/prisma/enums"
import { DeleteCandidateButton } from "./delete-button"
import { StatusCard } from "./status-card"
import { ObservationsCard } from "./observations-card"

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
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const candidate = await prisma.candidate.findUnique({
    where: { id: parseInt(id) },
    include: { tags: true },
  })

  if (!candidate || candidate.clientId !== session.user.clientId!) {
    notFound()
  }

  const experience = toExperience(candidate.experience)
  const education = toEducation(candidate.education)
  const courses = toCourses(candidate.courses)
  const skills = toStrings(candidate.skills)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border border-base-300 bg-base-100 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight">{candidate.name || "Sin nombre"}</h1>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="border border-base-300 bg-base-100 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="icon-[tabler--user-circle] size-4 text-primary" />
              Contacto
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {candidate.email && (
                <div>
                  <span className="text-[11px] text-base-content/40 uppercase tracking-wider">Email</span>
                  <p className="text-sm text-base-content mt-0.5">{candidate.email}</p>
                </div>
              )}
              {candidate.phone && (
                <div>
                  <span className="text-[11px] text-base-content/40 uppercase tracking-wider">Teléfono</span>
                  <p className="text-sm text-base-content mt-0.5">{candidate.phone}</p>
                </div>
              )}
              {candidate.address && (
                <div className="sm:col-span-2">
                  <span className="text-[11px] text-base-content/40 uppercase tracking-wider">Dirección</span>
                  <p className="text-sm text-base-content mt-0.5">{candidate.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="icon-[tabler--bolt] size-4 text-primary" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span key={i} className="badge badge-sm bg-base-200 text-base-content border-none text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="icon-[tabler--briefcase] size-4 text-primary" />
                Experiencia
              </h2>
              <div className="flex flex-col gap-3">
                {experience.map((exp, i) => (
                  <div key={i} className="bg-base-200 rounded-lg p-4">
                    <div className="font-semibold text-sm text-base-content">{exp.title}</div>
                    {(exp.company || exp.period) && (
                      <div className="text-xs text-base-content/50 mt-0.5">
                        {exp.company}{exp.company && exp.period ? " · " : ""}{exp.period}
                      </div>
                    )}
                    {exp.description && (
                      <p className="text-xs text-base-content/60 mt-2 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="icon-[tabler--school] size-4 text-primary" />
                Educación
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {education.map((edu, i) => (
                  <div key={i} className="bg-base-200 rounded-lg p-4">
                    <div className="font-semibold text-sm text-base-content">{edu.degree}</div>
                    {(edu.institution || edu.year) && (
                      <div className="text-xs text-base-content/50 mt-1">
                        {edu.institution}{edu.institution && edu.year ? " · " : ""}{edu.year}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          {courses.length > 0 && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="icon-[tabler--certificate] size-4 text-primary" />
                Cursos / Certificaciones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {courses.map((course, i) => (
                  <div key={i} className="bg-base-200 rounded-lg p-4">
                    <div className="font-semibold text-sm text-base-content">{course.name}</div>
                    {(course.institution || course.year) && (
                      <div className="text-xs text-base-content/50 mt-1">
                        {course.institution}{course.institution && course.year ? " · " : ""}{course.year}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {candidate.cvSummary && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="icon-[tabler--file-text] size-4 text-primary" />
                Resumen
              </h2>
              <p className="text-sm text-base-content/70 leading-relaxed">{candidate.cvSummary}</p>
            </div>
          )}

        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          <StatusCard candidateId={candidate.id} currentStatus={candidate.status} />
          <ObservationsCard candidateId={candidate.id} observations={candidate.observations} />

          {/* CV File */}
          {candidate.cvFilePath && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="icon-[tabler--file] size-4 text-primary" />
                CV adjunto
              </h2>
              <a
                href={candidate.cvFilePath}
                target="_blank"
                className="btn btn-ghost btn-sm w-full"
              >
                <span className="icon-[tabler--file-text] size-4" />
                Ver CV
              </a>
            </div>
          )}

          {/* Raw text */}
          {candidate.rawText && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <details>
                <summary className="text-xs font-semibold text-base-content/50 uppercase tracking-widest cursor-pointer flex items-center gap-2">
                  <span className="icon-[tabler--code] size-4 text-primary" />
                  Texto extraído
                </summary>
                <pre className="mt-3 text-xs text-base-content/60 whitespace-pre-wrap max-h-96 overflow-y-auto bg-base-200 rounded-lg p-3">
                  {candidate.rawText}
                </pre>
              </details>
            </div>
          )}

          {/* Metadata */}
          <div className="border border-base-300 bg-base-100 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="icon-[tabler--info-circle] size-4 text-primary" />
              Metadatos
            </h2>
            <div className="space-y-2 text-xs text-base-content/60">
              <div className="flex justify-between">
                <span>ID</span>
                <span>#{candidate.id}</span>
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
  )
}
