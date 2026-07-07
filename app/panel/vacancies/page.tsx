import Link from "next/link"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"

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

export default async function VacanciesPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const vacancies = await prisma.vacancy.findMany({
    where: { clientId: session.user.clientId! },
    include: { _count: { select: { candidates: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Panel", href: "/panel" }, { label: "Vacantes" }]}
        backHref="/panel"
      />
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Vacantes</h1>
        <Link href="/panel/vacancies/new" className="btn btn-primary btn-sm gap-1.5">
          <span className="icon-[tabler--plus] size-4" />
          Nueva vacante
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <div className="intersect:motion-preset-pop motion-duration-700 border border-base-300 bg-base-100 rounded-lg">
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-base-200 text-base-content/50">
              <span className="icon-[tabler--briefcase] size-6" />
            </div>
            <p className="text-sm text-base-content/70">
              No hay vacantes registradas aún.
            </p>
          </div>
        </div>
      ) : (
        <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-[11px] text-base-content/60 uppercase tracking-wider border-b border-base-300">
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Modalidad</th>
                  <th>Candidatos</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vacancies.map((v) => (
                  <tr key={v.id} className="hover:bg-base-200/40 border-b border-base-200/60 last:border-b-0 ">
                    <td>
                      <Link
                        href={`/panel/vacancies/${v.id}`}
                        className="font-medium text-sm text-base-content"
                      >
                        {v.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${statusColors[v.status] ?? "badge-ghost"}`}>
                        {statusLabels[v.status] ?? v.status}
                      </span>
                    </td>
                    <td className="text-xs text-base-content/75">
                      {v.modality ? modalityLabels[v.modality] ?? v.modality : "—"}
                    </td>
                    <td className="text-xs text-base-content/75">
                      {v._count.candidates}
                    </td>
                    <td className="text-[11px] text-base-content/60 whitespace-nowrap">
                      {new Date(v.createdAt).toLocaleDateString("es-VE")}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <Link
                          href={`/panel/vacancies/${v.id}`}
                          className="btn btn-ghost btn-xs"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/panel/vacancies/${v.id}/edit`}
                          className="btn btn-ghost btn-xs"
                        >
                          Editar
                        </Link>
                      </div>
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
