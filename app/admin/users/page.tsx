import prisma from "@/lib/prisma"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="motion-preset-fade motion-duration-500">
      <PageHeader
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Usuarios" }]}
        backHref="/admin"
      />
      <div className="flex items-center justify-between mb-6 motion-preset-slide-up motion-duration-500">
        <h1 className="text-lg font-bold tracking-tight">Usuarios</h1>
        <Link href="/admin/users/create" className="btn btn-primary btn-sm active:motion-preset-compress">
          Nuevo usuario
        </Link>
      </div>

      <div className="intersect:motion-preset-slide-up intersect:motion-opacity-in-0 motion-ease-spring-smooth border border-base-300 bg-base-100 rounded-lg overflow-hidden">
        <table className="table w-full">
          <thead>
            <tr className="text-[11px] text-base-content/60 uppercase tracking-wider border-b border-base-300">
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Cliente</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-base-200/40 border-b border-base-200/60 last:border-b-0 ">
                <td className="text-sm">{user.email}</td>
                <td className="text-sm">{user.name || "—"}</td>
                <td>
                  <span
                    className={`badge badge-sm ${
                      user.role === "ADMIN" ? "badge-accent" : "badge-ghost"
                    }`}
                  >
                    {user.role === "ADMIN" ? "Admin" : "Cliente"}
                  </span>
                </td>
                <td className="text-sm text-base-content/75">
                  {user.client?.name || "—"}
                </td>
                <td className="text-xs text-base-content/60">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
