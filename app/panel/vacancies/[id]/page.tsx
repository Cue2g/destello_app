import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { VacancyCandidatesSection } from "./vacancy-candidates"

const statusLabels: Record<string, string> = {
  OPEN: "Abierta",
  CLOSED: "Cerrada",
  PAUSED: "Pausada",
}

const statusColors: Record<string, string> = {
  OPEN: "badge-success",
  CLOSED: "badge-error",
  PAUSED: "badge-warning",
}

const modalityLabels: Record<string, string> = {
  REMOTO: "Remoto",
  PRESENCIAL: "Presencial",
  HIBRIDO: "Híbrido",
}

export default async function VacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { id } = await params
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: parseInt(id) },
    include: {
      candidates: {
        include: {
          candidate: { include: { tags: true } },
          assignedBy: { select: { name: true } },
        },
        orderBy: { assignedAt: "desc" },
      },
    },
  })

  if (!vacancy || vacancy.clientId !== session.user.clientId!) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Panel", href: "/panel" },
          { label: "Vacantes", href: "/panel/vacancies" },
          { label: vacancy.title },
        ]}
        backHref="/panel/vacancies"
      />
      {/* Header */}
      <div className="border border-base-300 bg-base-100 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight">{vacancy.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 ml-9">
              <span className={`badge ${statusColors[vacancy.status] ?? "badge-ghost"}`}>
                {statusLabels[vacancy.status] ?? vacancy.status}
              </span>
              {vacancy.modality && (
                <span className="badge badge-sm bg-base-200 text-base-content/80 border-none">
                  {modalityLabels[vacancy.modality] ?? vacancy.modality}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/panel/vacancies/${vacancy.id}/edit`}
              className="btn btn-outline btn-sm"
            >
              <span className="icon-[tabler--pencil] size-4" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {vacancy.description && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="icon-[tabler--file-description] size-4 text-primary" />
                Descripción
              </h2>
              <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                {vacancy.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {vacancy.requirements && (
            <div className="border border-base-300 bg-base-100 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="icon-[tabler--list-check] size-4 text-primary" />
                Requisitos
              </h2>
              <p className="text-sm text-base-content/80 whitespace-pre-wrap leading-relaxed">
                {vacancy.requirements}
              </p>
            </div>
          )}

          {/* Candidates assigned */}
          <VacancyCandidatesSection
            vacancyId={vacancy.id}
            candidates={vacancy.candidates.map((cv) => ({
              candidateId: cv.candidateId,
              name: cv.candidate.name,
              email: cv.candidate.email,
              phone: cv.candidate.phone,
              skills: cv.candidate.skills,
              tags: cv.candidate.tags,
              stage: cv.stage,
              assignedAt: cv.assignedAt,
              assignedByName: cv.assignedBy?.name ?? null,
            }))}
          />
        </div>

        {/* Right - sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="border border-base-300 bg-base-100 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="icon-[tabler--info-circle] size-4 text-primary" />
              Detalles
            </h2>
            <div className="space-y-3 text-sm">
              {vacancy.location && (
                <div>
                  <span className="text-[11px] text-base-content/60 uppercase tracking-wider">Ubicación</span>
                  <p className="text-base-content mt-0.5">{vacancy.location}</p>
                </div>
              )}
              {(vacancy.salaryMin || vacancy.salaryMax) && (
                <div>
                  <span className="text-[11px] text-base-content/60 uppercase tracking-wider">Rango salarial</span>
                  <p className="text-base-content mt-0.5">
                    {vacancy.salaryMin ? `$${vacancy.salaryMin.toLocaleString()}` : ""}
                    {vacancy.salaryMin && vacancy.salaryMax ? " — " : ""}
                    {vacancy.salaryMax ? `$${vacancy.salaryMax.toLocaleString()}` : ""}
                    {" USD"}
                  </p>
                </div>
              )}
              {vacancy.closedAt && (
                <div>
                  <span className="text-[11px] text-base-content/60 uppercase tracking-wider">Fecha de cierre</span>
                  <p className="text-base-content mt-0.5">
                    {new Date(vacancy.closedAt).toLocaleDateString("es-VE")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="border border-base-300 bg-base-100 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="icon-[tabler--chart-bar] size-4 text-primary" />
              Estadísticas
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/75">Total candidatos</span>
                <span className="font-semibold">{vacancy.candidates.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/75">En entrevista</span>
                <span className="font-semibold">
                  {vacancy.candidates.filter(c => c.stage === "INTERVIEW").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/75">Contratados</span>
                <span className="font-semibold">
                  {vacancy.candidates.filter(c => c.stage === "HIRED").length}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="border border-base-300 bg-base-100 rounded-lg p-5">
            <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="icon-[tabler--clock] size-4 text-primary" />
              Metadatos
            </h2>
            <div className="space-y-2 text-xs text-base-content/75">
              <div className="flex justify-between">
                <span>ID</span>
                <span>#{vacancy.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Creado</span>
                <span>{new Date(vacancy.createdAt).toLocaleString("es-VE")}</span>
              </div>
              <div className="flex justify-between">
                <span>Actualizado</span>
                <span>{new Date(vacancy.updatedAt).toLocaleString("es-VE")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
