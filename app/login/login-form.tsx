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
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body p-8 gap-8">
          <header className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-trust/10 text-trust">
              <span className="icon-[tabler--login-2] size-7" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Destello</h1>
              <p className="text-sm text-base-content/60 mt-1">
                Inicia sesión para continuar
              </p>
            </div>
          </header>

          <div className="divider my-0" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="text-sm text-error text-center">{error}</div>
            )}

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

            <button type="submit" className="btn btn-trust mt-1 transition-transform active:scale-[0.98]" disabled={pending}>
              {pending ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
