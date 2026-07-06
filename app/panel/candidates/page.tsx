import Link from "next/link"
import prisma from "@/lib/prisma"
import { CandidateFilters } from "./candidate-filters"

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

const sourceBadgeColors: Record<string, string> = {
  WHATSAPP: "bg-green-500/10 text-green-700 border-green-300 dark:text-green-300",
  EMAIL: "bg-blue-500/10 text-blue-700 border-blue-300 dark:text-blue-300",
  UPLOAD: "bg-purple-500/10 text-purple-700 border-purple-300 dark:text-purple-300",
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string }>
}) {
  const sp = await searchParams
  const source = sp.source ?? ""
  const status = sp.status ?? ""

  const where: Record<string, string> = {}
  if (source && ["WHATSAPP", "EMAIL", "UPLOAD"].includes(source)) {
    where.source = source
  }
  if (status && ["NEW", "REVIEWED", "CONTACTED", "REJECTED", "HIRED"].includes(status)) {
    where.status = status
  }

  const candidates = await prisma.candidate.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Candidatos</h1>
        <CandidateFilters source={source} status={status} />
      </div>

      {candidates.length === 0 ? (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center py-12">
            <div className="flex size-14 items-center justify-center rounded-full bg-base-200 text-base-content/40">
              <span className="icon-[tabler--users] size-7" />
            </div>
            <p className="text-base-content/60 mt-4 text-sm">
              {source || status
                ? "No se encontraron candidatos con esos filtros."
                : "No hay candidatos registrados aún."}
            </p>
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/40 uppercase tracking-wider">
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Fuente</th>
                  <th>Estado</th>
                  <th>Tags</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-base-200/50">
                    <td>
                      <Link
                        href={`/panel/candidates/${c.id}`}
                        className="font-medium text-sm text-base-content link link-hover"
                      >
                        {c.name || "Sin nombre"}
                      </Link>
                    </td>
                    <td>
                      <div className="text-sm text-base-content/70 space-y-0.5">
                        {c.email && <div className="truncate max-w-40">{c.email}</div>}
                        {c.phone && <div className="text-xs">{c.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-sm border ${sourceBadgeColors[c.source] ?? ""}`}>
                        {sourceLabels[c.source] ?? c.source}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${statusColors[c.status] ?? "badge-ghost"}`}>
                        {statusLabels[c.status] ?? c.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {c.tags.length === 0 && (
                          <span className="text-xs text-base-content/30">—</span>
                        )}
                        {c.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="badge badge-xs"
                            style={{
                              backgroundColor: tag.color + "20",
                              color: tag.color,
                              borderColor: tag.color + "40",
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="text-xs text-base-content/40">+{c.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-xs text-base-content/50 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("es-VE")}
                    </td>
                    <td>
                      <Link
                        href={`/panel/candidates/${c.id}`}
                        className="btn btn-sm btn-ghost"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
