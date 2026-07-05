import { redirect } from "next/navigation"
import { createUser } from "@/lib/actions/create-user"

export default function CreateUserPage() {
  return (
    <div className="flex items-center justify-center">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body p-8 gap-8">
          <header className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-trust/10 text-trust">
              <span className="icon-[tabler--user-plus] size-7" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Crear usuario</h1>
              <p className="text-sm text-base-content/60 mt-1">
                Nuevo usuario del sistema
              </p>
            </div>
          </header>

          <div className="divider my-0" />

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

            <button type="submit" className="btn btn-trust mt-1">
              Crear usuario
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
