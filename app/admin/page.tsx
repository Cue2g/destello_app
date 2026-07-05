import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Panel de administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
        >
          <div className="card-body items-center text-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--users] size-7" />
            </div>
            <h2 className="card-title">Usuarios</h2>
            <p className="text-sm text-base-content/60">
              Gestionar usuarios del sistema
            </p>
          </div>
        </Link>

        <Link
          href="/admin/users/create"
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border-l-4 border-trust"
        >
          <div className="card-body items-center text-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-trust/10 text-trust">
              <span className="icon-[tabler--user-plus] size-7" />
            </div>
            <h2 className="card-title">Crear usuario</h2>
            <p className="text-sm text-base-content/60">
              Añadir un nuevo usuario al sistema
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
