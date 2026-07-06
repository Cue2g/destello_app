import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { users: true, candidates: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold tracking-tight">Clientes</h1>
        <Link href="/admin/clients/create" className="btn btn-primary btn-sm">
          Nuevo cliente
        </Link>
      </div>

      <div className="border border-base-300 bg-base-100 rounded-lg overflow-hidden">
        <table className="table w-full">
          <thead>
            <tr className="text-[11px] text-base-content/40 uppercase tracking-wider border-b border-base-300">
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
              <tr key={client.id} className="hover:bg-base-200/40 border-b border-base-200/60 last:border-b-0">
                <td className="text-sm font-medium">{client.name}</td>
                <td className="text-sm text-base-content/60">{client.email}</td>
                <td className="text-sm text-base-content/60">{client.phone || "—"}</td>
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
