import { redirect } from "next/navigation"
import { createUser } from "@/lib/actions/create-user"

export default function CreateUserPage() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6">
          <header className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--user-plus] size-5" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">Crear usuario</h1>
              <p className="text-xs text-base-content/50 mt-1">
                Nuevo usuario del sistema
              </p>
            </div>
          </header>

          <div className="border border-base-300 bg-base-100 rounded-lg w-full p-6">

          <form
            action={async (formData: FormData) => {
              "use server"
              await createUser(formData)
              redirect("/admin/users")
            }}
            className="flex flex-col gap-5"
          >
            <div className="input-floating">
              <input
                name="email"
                type="email"
                placeholder=""
                className="input"
                id="create-user-email"
                required
              />
              <label className="input-floating-label" htmlFor="create-user-email">
                Email
              </label>
            </div>

            <div className="input-floating">
              <input
                name="name"
                type="text"
                placeholder=""
                className="input"
                id="create-user-name"
              />
              <label className="input-floating-label" htmlFor="create-user-name">
                Nombre
              </label>
            </div>

            <div className="input-floating">
              <input
                name="password"
                type="password"
                placeholder=""
                className="input"
                id="create-user-password"
                required
              />
              <label className="input-floating-label" htmlFor="create-user-password">
                Contraseña
              </label>
            </div>

            <div className="input-floating">
              <select
                name="role"
                className="input"
                id="create-user-role"
                defaultValue="VIEWER"
              >
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <label className="input-floating-label" htmlFor="create-user-role">
                Rol
              </label>
            </div>

            <button type="submit" className="btn btn-primary mt-1">
              Crear usuario
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  )
}
