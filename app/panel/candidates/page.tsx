import Link from "next/link"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
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
  const session = await auth()
  if (!session) redirect("/login")

  const sp = await searchParams
  const source = sp.source ?? ""
  const status = sp.status ?? ""

  const where: Record<string, unknown> = { clientId: session.user.clientId! }
  if (source && ["WHATSAPP", "EMAIL", "UPLOAD"].includes(source)) {
    where.source = source
  }
  if (status && ["NEW", "REVIEWED", "CONTACTED", "REJECTED", "HIRED"].includes(status)) {
    where.status = status
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: { tags: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Panel", href: "/panel" }, { label: "Candidatos" }]}
        backHref="/panel"
      />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Candidatos</h1>
        <CandidateFilters source={source} status={status} />
      </div>

      {candidates.length === 0 ? (
        <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 intersect-half motion-ease-spring-smooth intersect:motion-duration-700 border border-base-300 bg-base-100 rounded-lg">
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-base-200 text-base-content/50">
              <span className="icon-[tabler--users] size-6" />
            </div>
            <p className="text-sm text-base-content/70">
              {source || status
                ? "No se encontraron candidatos con esos filtros."
                : "No hay candidatos registrados aún."}
            </p>
          </div>
        </div>
      ) : (
        <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 intersect-half motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-[11px] text-base-content/60 uppercase tracking-wider border-b border-base-300">
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Fuente</th>
                  <th>Estado</th>
                  <th>Tags</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-base-200/40 border-b border-base-200/60 last:border-b-0 "
                  >
                    <td>
                      <Link
                        href={`/panel/candidates/${c.id}`}
                        className="font-medium text-sm text-base-content"
                      >
                        {c.name || "Sin nombre"}
                      </Link>
                    </td>
                    <td>
                      <div className="text-xs text-base-content/75 space-y-0.5">
                        {c.email && <div className="truncate max-w-36">{c.email}</div>}
                        {c.phone && <div className="text-[11px]">{c.phone}</div>}
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
                          <span className="text-[11px] text-base-content/40">—</span>
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
                          <span className="text-[11px] text-base-content/60">+{c.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="text-[11px] text-base-content/60 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("es-VE")}
                    </td>
                    <td>
                      <Link
                        href={`/panel/candidates/${c.id}`}
                        className="btn btn-ghost btn-xs"
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
