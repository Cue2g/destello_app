import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Link href="/admin/users/create" className="btn btn-trust">
          Nuevo usuario
        </Link>
      </div>

      <div className="overflow-x-auto rounded-box border border-base-300">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.name || "—"}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === "ADMIN" ? "badge-accent" : "badge-ghost"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="text-sm text-base-content/60">
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
