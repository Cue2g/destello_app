import prisma from "@/lib/prisma"
import { CandidateSource, CandidateStatus } from "@/app/generated/prisma/enums"

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
  const [total, bySource, byStatus] = await Promise.all([
    prisma.candidate.count(),
    prisma.candidate.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.candidate.groupBy({ by: ["status"], _count: { _all: true } }),
  ])

  const sourceCounts = Object.fromEntries(
    bySource.map((s) => [s.source, s._count._all ?? 0])
  ) as Record<CandidateSource, number>

  const statusCounts = Object.fromEntries(
    byStatus.map((s) => [s.status, s._count._all ?? 0])
  ) as Record<CandidateStatus, number>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Total */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body items-center text-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="icon-[tabler--users-group] size-7" />
          </div>
          <p className="text-4xl font-bold">{total}</p>
          <p className="text-sm text-base-content/60">Candidatos totales</p>
        </div>
      </div>

      {/* Por plataforma */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Por plataforma</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(sourceLabels) as CandidateSource[]).map((src) => (
            <div key={src} className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center gap-2">
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${sourceColors[src]}`}
                >
                  <span className={`${sourceIcons[src]} size-6`} />
                </div>
                <p className="text-3xl font-bold">{sourceCounts[src] ?? 0}</p>
                <p className="text-sm text-base-content/60">
                  {sourceLabels[src]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Por estado - pipeline */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Pipeline de candidatos</h2>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2 sm:gap-0">
              {pipelineOrder.map((st, i) => (
                <div key={st} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                  {i > 0 && (
                    <>
                      <span className="sm:hidden text-base-content/30">
                        <span className="icon-[tabler--chevron-down] size-5" />
                      </span>
                      <span className="hidden sm:block text-base-content/30">
                        <span className="icon-[tabler--chevron-right] size-6" />
                      </span>
                    </>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex size-14 items-center justify-center rounded-full border-2 ${statusColors[st]}`}
                    >
                      <span className="text-lg font-bold">
                        {statusCounts[st] ?? 0}
                      </span>
                    </div>
                    <span className="text-xs text-base-content/60 font-medium whitespace-nowrap">
                      {statusLabels[st]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
