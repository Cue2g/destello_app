import prisma from "@/lib/prisma"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { users: true, candidates: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="motion-preset-fade motion-duration-500">
      <PageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Clientes" }]}
        backHref="/admin"
      />
      <div className="flex items-center justify-between mb-6 motion-preset-slide-up motion-duration-500">
        <h1 className="text-lg font-bold tracking-tight">Clientes</h1>
        <Link href="/admin/clients/create" className="btn btn-primary btn-sm active:motion-preset-compress">
          Nuevo cliente
        </Link>
      </div>

      <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg overflow-hidden">
        <table className="table w-full">
          <thead>
            <tr className="text-[11px] text-base-content/60 uppercase tracking-wider border-b border-base-300">
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Usuarios</th>
              <th>Candidatos</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-base-200/40 border-b border-base-200/60 last:border-b-0 ">
                <td className="text-sm font-medium">{client.name}</td>
                <td className="text-sm text-base-content/75">{client.email}</td>
                <td className="text-sm text-base-content/75">{client.phone || "—"}</td>
                <td className="text-sm">{client._count.users}</td>
                <td className="text-sm">{client._count.candidates}</td>
                <td>
                  <span className={`badge badge-sm ${client.isActive ? "badge-success" : "badge-ghost"}`}>
                    {client.isActive ? "Sí" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
