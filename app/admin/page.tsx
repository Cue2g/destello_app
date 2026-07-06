import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-lg font-bold tracking-tight mb-6">Panel de administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="border border-base-300 bg-base-100 rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--users] size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Usuarios</h2>
              <p className="text-xs text-base-content/50 mt-1">
                Gestionar usuarios del sistema
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users/create"
          className="border border-base-300 bg-base-100 rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--user-plus] size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Crear usuario</h2>
              <p className="text-xs text-base-content/50 mt-1">
                Añadir un nuevo usuario al sistema
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
