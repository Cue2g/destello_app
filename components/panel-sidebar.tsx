"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { showToast } from "@/components/toast"

const navLinks = [
  {
    href: "/panel",
    label: "Dashboard",
    icon: "icon-[tabler--layout-dashboard]",
    exact: true,
  },
  {
    href: "/panel/candidates",
    label: "Candidatos",
    icon: "icon-[tabler--users]",
    exact: false,
  },
  {
    href: "/panel/connections",
    label: "Conexiones",
    icon: "icon-[tabler--plug-connected]",
    exact: false,
  },
  {
    href: "/panel/tags",
    label: "Tags",
    icon: "icon-[tabler--tags]",
    exact: false,
  },
]

export function PanelSidebar({
  userName,
  isOpen,
  onClose,
}: {
  userName: string | null | undefined
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [hasEmailConfig, setHasEmailConfig] = useState(false)
  const [syncingEmail, setSyncingEmail] = useState(false)

  useEffect(() => {
    fetch("/api/email/config")
      .then(r => r.json())
      .then(d => setHasEmailConfig(!!d.config))
      .catch(() => {})
  }, [])

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  async function handleEmailSync() {
    if (!hasEmailConfig) {
      router.push("/panel/connections")
      return
    }

    setSyncingEmail(true)
    try {
      const res = await fetch("/api/email/sync", { method: "POST" })
      const data = await res.json()

      if (!res.ok) {
        showToast(data.error || "Error al sincronizar", "error")
        return
      }

      if (data.candidatesCreated > 0) {
        showToast(`${data.candidatesCreated} candidato(s) creado(s) desde email`, "success")
      } else if (data.processedEmails === 0) {
        showToast("No se encontraron emails nuevos", "success")
      } else if (data.duplicates > 0) {
        showToast(`${data.duplicates} archivo(s) duplicado(s) ignorados`, "success")
      }
    } catch {
      showToast("Error de conexión al sincronizar", "error")
    } finally {
      setSyncingEmail(false)
      router.refresh()
    }
  }

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  function handleNavigate() {
    onClose()
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-base-300 bg-base-100">
      <div className="flex h-14 items-center px-5">
        <Link
          href="/panel"
          onClick={handleNavigate}
          className="text-sm font-bold tracking-tight text-base-content no-underline"
        >
          Destello
        </Link>
      </div>

      <div className="px-3 mb-3">
        <div className="flex gap-2">
          <Link
            href="/panel/upload"
            onClick={handleNavigate}
            className="btn btn-primary btn-sm flex-1 gap-1.5"
          >
            <span className="icon-[tabler--file-upload] size-4" />
            Subir
          </Link>

          <button
            type="button"
            onClick={() => { handleEmailSync(); handleNavigate() }}
            className="btn btn-outline btn-sm flex-1 gap-1.5"
            disabled={syncingEmail}
          >
            {syncingEmail ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <span className="icon-[tabler--mail-check] size-4" />
            )}
            {syncingEmail ? "..." : hasEmailConfig ? "Correos" : "Conectar"}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <ul className="menu gap-0.5 p-0 text-sm">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={handleNavigate}
                className={isActive(link.href, link.exact) ? "active" : ""}
              >
                <span className={`${link.icon} size-4`} />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-base-300 px-3 py-3">
        <div className="px-3 py-2">
          <p className="text-xs text-base-content/50 truncate">
            {userName || "Usuario"}
          </p>
        </div>
        <ul className="menu gap-0.5 p-0 text-sm">
          <li>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left text-base-content/50 hover:text-error"
            >
              <span className="icon-[tabler--logout] size-4" />
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </aside>
  )
}
