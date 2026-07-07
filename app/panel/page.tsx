import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CandidateSource, CandidateStatus } from "@/app/generated/prisma/enums"
import { PageHeader } from "@/components/page-header"

const sourceLabels: Record<CandidateSource, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
  UPLOAD: "Subidos",
}

const sourceIcons: Record<CandidateSource, string> = {
  WHATSAPP: "icon-[tabler--brand-whatsapp]",
  EMAIL: "icon-[tabler--mail]",
  UPLOAD: "icon-[tabler--upload]",
}

const sourceColors: Record<CandidateSource, string> = {
  WHATSAPP: "bg-green-500/10 text-green-600",
  EMAIL: "bg-blue-500/10 text-blue-600",
  UPLOAD: "bg-purple-500/10 text-purple-600",
}

const statusLabels: Record<CandidateStatus, string> = {
  NEW: "Nuevos",
  REVIEWED: "Revisados",
  CONTACTED: "Contactados",
  REJECTED: "Rechazados",
  HIRED: "Contratados",
}

const statusColors: Record<CandidateStatus, string> = {
  NEW: "bg-info/20 text-info border-info",
  REVIEWED: "bg-warning/20 text-warning border-warning",
  CONTACTED: "bg-primary/20 text-primary border-primary",
  HIRED: "bg-success/20 text-success border-success",
  REJECTED: "bg-error/20 text-error border-error",
}

const pipelineOrder: CandidateStatus[] = ["NEW", "REVIEWED", "CONTACTED", "HIRED", "REJECTED"]

export default async function PanelDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  const clientId = session.user.clientId!
  const [total, bySource, byStatus] = await Promise.all([
    prisma.candidate.count({ where: { clientId } }),
    prisma.candidate.groupBy({ by: ["source"], where: { clientId }, _count: { _all: true } }),
    prisma.candidate.groupBy({ by: ["status"], where: { clientId }, _count: { _all: true } }),
  ])

  const sourceCounts = Object.fromEntries(
    bySource.map((s) => [s.source, s._count._all ?? 0])
  ) as Record<CandidateSource, number>

  const statusCounts = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count._all ?? 0])
  ) as Record<CandidateStatus, number>

  return (
    <div className="space-y-10">
      <PageHeader breadcrumbs={[{ label: "Panel" }]} />

      {/* Total */}
      <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 intersect:motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg p-6 flex items-center gap-5">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
          <span className="icon-[tabler--users-group] size-6" />
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight">{total}</p>
          <p className="text-xs text-base-content/70 mt-0.5">Candidatos totales</p>
        </div>
      </div>

      {/* Por plataforma */}
      <div>
        <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-4">Por plataforma</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(sourceLabels) as CandidateSource[]).map((src, i) => (
            <div
              key={src}
              className={`intersect:motion-preset-slide-up intersect:motion-opacity-in-0 intersect-half motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg p-5 flex items-center gap-4 ${["","intersect:motion-delay-[100ms]","intersect:motion-delay-[200ms]"][i]}`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full shrink-0 ${sourceColors[src]}`}
              >
                <span className={`${sourceIcons[src]} size-5`} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{sourceCounts[src] ?? 0}</p>
                <p className="text-xs text-base-content/70">{sourceLabels[src]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Por estado - pipeline */}
      <div>
        <h2 className="text-xs font-semibold text-base-content/70 uppercase tracking-widest mb-4">Pipeline de candidatos</h2>
        <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 intersect-half motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 sm:gap-0">
            {pipelineOrder.map((st, i) => (
              <div
                key={st}
                className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0"
              >
                {i > 0 && (
                  <>
                    <span className="sm:hidden text-base-content/40">
                      <span className="icon-[tabler--chevron-down] size-4" />
                    </span>
                    <span className="hidden sm:block text-base-content/40">
                      <span className="icon-[tabler--chevron-right] size-5" />
                    </span>
                  </>
                )}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full border ${statusColors[st]}`}
                  >
                    <span className="text-sm font-bold">
                      {statusCounts[st] ?? 0}
                    </span>
                  </div>
                  <span className="text-[11px] text-base-content/70 font-medium whitespace-nowrap">
                    {statusLabels[st]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
