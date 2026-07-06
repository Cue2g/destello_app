import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { UploadForm } from "./upload-form"
import { DeleteButton } from "./delete-button"

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const { created, error } = await searchParams

  const candidates = await prisma.candidate.findMany({
    where: { source: "UPLOAD" },
    include: { tags: { select: { id: true, name: true, color: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Subir CV</h1>

      {created && (
        <div className="alert alert-success mb-4">
          <span className="icon-[tabler--circle-check] size-5" />
          CV subido y procesado correctamente
        </div>
      )}
      {error && (
        <div className="alert alert-error mb-4">
          <span className="icon-[tabler--alert-circle] size-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-8 gap-8">
              <header className="flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="icon-[tabler--file-upload] size-7" />
                </div>
                <div className="text-center">
                  <h2 className="card-title">Subir archivo</h2>
                  <p className="text-sm text-base-content/60 mt-1">
                    Sube un archivo PDF, DOCX o imagen (PNG/JPG). El sistema extraerá los datos automáticamente.
                  </p>
                </div>
              </header>
              <div className="divider my-0" />
              <UploadForm />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              <div className="px-6 py-4 border-b border-base-300 flex items-center justify-between">
                <h2 className="card-title">Candidatos subidos</h2>
                <span className="badge gap-1">
                  <span className="icon-[tabler--upload] size-3.5" />
                  {candidates.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Tags</th>
                      <th>Fecha</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.length === 0 && (
                      <tr>
                        <td colSpan={6}>
                          <div className="flex flex-col items-center py-12 text-base-content/60">
                            <div className="flex size-12 items-center justify-center rounded-full bg-base-200 text-base-content/40 mb-3">
                              <span className="icon-[tabler--file-upload] size-6" />
                            </div>
                            <p className="text-sm">Sin CVs subidos aún</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {candidates.map((c) => (
                      <tr key={c.id}>
                        <td>{c.name || "—"}</td>
                        <td className="text-sm">{c.email || "—"}</td>
                        <td className="text-sm">{c.phone || "—"}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {c.tags.length === 0 && (
                              <span className="text-xs text-base-content/40">—</span>
                            )}
                            {c.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag.id}
                                className="badge badge-sm gap-1"
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
                              <span className="text-xs text-base-content/40">
                                +{c.tags.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-sm text-base-content/60">
                          {c.createdAt.toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <a href={`/panel/candidates/${c.id}`} className="btn btn-sm btn-ghost">
                              Ver
                            </a>
                            <DeleteButton id={c.id} name={c.name || ''} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
