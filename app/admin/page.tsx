import Link from "next/link"
import { PageHeader } from "@/components/page-header"

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader breadcrumbs={[{ label: "Admin" }]} />
      <h1 className="text-lg font-bold tracking-tight mb-6">Panel de administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="intersect:motion-scale-in-0 intersect:motion-opacity-in-0 intersect-half motion-ease-spring-bouncy border border-base-300 bg-base-100 rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--users] size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Usuarios</h2>
              <p className="text-xs text-base-content/70 mt-1">
                Gestionar usuarios del sistema
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/users/create"
          className="intersect:motion-scale-in-0 intersect:motion-opacity-in-0 intersect-half intersect:motion-delay-[200ms] motion-ease-spring-bouncy border border-base-300 bg-base-100 rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--user-plus] size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Crear usuario</h2>
              <p className="text-xs text-base-content/70 mt-1">
                Añadir un nuevo usuario al sistema
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/clients"
          className="intersect:motion-scale-in-0 intersect:motion-opacity-in-0 intersect-half intersect:motion-delay-[400ms] motion-ease-spring-bouncy border border-base-300 bg-base-100 rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--building-store] size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Clientes</h2>
              <p className="text-xs text-base-content/70 mt-1">
                Gestionar clientes del sistema
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/clients/create"
          className="intersect:motion-scale-in-0 intersect:motion-opacity-in-0 intersect-half intersect:motion-delay-[600ms] motion-ease-spring-bouncy border border-base-300 bg-base-100 rounded-lg p-6 hover:border-primary/50 transition-colors"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--building-plus] size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Crear cliente</h2>
              <p className="text-xs text-base-content/70 mt-1">
                Registrar un nuevo cliente
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
