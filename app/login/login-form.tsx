"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(undefined)

    const formData = new FormData(e.currentTarget)

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    })

    setPending(false)

    if (result?.error) {
      setError("Credenciales inválidas")
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-8">
          <header className="flex flex-col items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="icon-[tabler--login-2] size-6" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight">Destello</h1>
              <p className="text-sm text-base-content/50 mt-1">
                Inicia sesión para continuar
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="card bg-base-100 w-full">
            <div className="card-body p-6 gap-6">
              {error && (
                <div className="text-sm text-error flex items-center gap-2 justify-center">
                  <span className="icon-[tabler--alert-circle] size-4" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div className="input-floating">
                  <input
                    name="email"
                    type="email"
                    placeholder=""
                    className="input"
                    id="login-email"
                    required
                  />
                  <label className="input-floating-label" htmlFor="login-email">
                    Email
                  </label>
                </div>

                <div className="input-floating">
                  <input
                    name="password"
                    type="password"
                    placeholder=""
                    className="input"
                    id="login-password"
                    required
                  />
                  <label className="input-floating-label" htmlFor="login-password">
                    Contraseña
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
