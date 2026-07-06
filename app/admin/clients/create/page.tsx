import { redirect } from "next/navigation"
import { createClient } from "@/lib/actions/create-user"
import { PageHeader } from "@/components/page-header"

export default function CreateClientPage() {
  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Clientes", href: "/admin/clients" },
          { label: "Crear" },
        ]}
        backHref="/admin/clients"
      />
      <div className="max-w-sm mx-auto">
        <div className="flex flex-col items-center gap-6">
          <header className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--building-store] size-5" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">Crear cliente</h1>
              <p className="text-xs text-base-content/70 mt-1">
                Registrar un nuevo cliente
              </p>
            </div>
          </header>

          <div className="border border-base-300 bg-base-100 rounded-lg w-full p-6">

          <form
            action={async (formData: FormData) => {
              "use server"
              await createClient(formData)
              redirect("/admin/clients")
            }}
            className="flex flex-col gap-5"
          >
            <div className="input-floating">
              <input
                name="name"
                type="text"
                placeholder=""
                className="input"
                id="create-client-name"
                required
              />
              <label className="input-floating-label" htmlFor="create-client-name">
                Nombre del cliente
              </label>
            </div>

            <div className="input-floating">
              <input
                name="email"
                type="email"
                placeholder=""
                className="input"
                id="create-client-email"
                required
              />
              <label className="input-floating-label" htmlFor="create-client-email">
                Email
              </label>
            </div>

            <button type="submit" className="btn btn-primary mt-1">
              Crear cliente
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}
