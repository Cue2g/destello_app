"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"

export function AdminNav({
  userName,
  userEmail,
}: {
  userName: string | null | undefined
  userEmail: string | null | undefined
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push("/login")
    router.refresh()
  }

  return (
    <nav className="flex h-14 items-center justify-between border-b border-base-300 bg-base-100 px-6">
      <div className="flex items-center gap-6">
        <Link
          href="/admin"
          className="text-sm font-bold tracking-tight text-base-content no-underline"
        >
          Destello
        </Link>
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/admin/users"
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              pathname.startsWith("/admin/users")
                ? "bg-base-200 text-base-content font-medium"
                : "text-base-content/50 hover:text-base-content hover:bg-base-200/50"
            }`}
          >
            Usuarios
          </Link>
          <Link
            href="/admin/clients"
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              pathname.startsWith("/admin/clients")
                ? "bg-base-200 text-base-content font-medium"
                : "text-base-content/50 hover:text-base-content hover:bg-base-200/50"
            }`}
          >
            Clientes
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="dropdown relative inline-flex [--auto-close:inside] [--offset:8] [--placement:bottom-end]"
        >
          <button
            id="admin-profile-dropdown"
            type="button"
            className="dropdown-toggle flex items-center"
            aria-haspopup="menu"
            aria-expanded="false"
            aria-label="Dropdown"
          >
            <div className="avatar">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="icon-[tabler--user] size-4" />
              </div>
            </div>
          </button>
          <ul
            className="dropdown-menu dropdown-open:opacity-100 hidden min-w-56"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="admin-profile-dropdown"
          >
            <li className="dropdown-header gap-2">
              <div className="avatar">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="icon-[tabler--user] size-5" />
                </div>
              </div>
              <div>
                <h6 className="text-sm font-semibold text-base-content">
                  {userName || "Usuario"}
                </h6>
                <small className="text-xs text-base-content/50">{userEmail}</small>
              </div>
            </li>
            <li>
              <Link href="/admin/users" className="dropdown-item text-sm">
                <span className="icon-[tabler--users] size-4" />
                Usuarios
              </Link>
            </li>
            <li>
              <Link href="/admin/clients" className="dropdown-item text-sm">
                <span className="icon-[tabler--building-store] size-4" />
                Clientes
              </Link>
            </li>
            <li className="dropdown-footer gap-2">
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-ghost btn-sm btn-block text-error"
              >
                <span className="icon-[tabler--logout] size-4" />
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        className="md:hidden collapse-toggle btn btn-ghost btn-sm btn-square"
        data-collapse="#admin-navbar-collapse"
        aria-controls="admin-navbar-collapse"
        aria-label="Toggle navigation"
      >
        <span className="icon-[tabler--menu-2] collapse-open:hidden size-4" />
        <span className="icon-[tabler--x] collapse-open:block hidden size-4" />
      </button>
      <div
        id="admin-navbar-collapse"
        className="md:hidden collapse hidden basis-full overflow-hidden transition-[height] duration-300"
      >
        <ul className="menu gap-0.5 p-0 text-sm">
          <li>
            <Link
              href="/admin/users"
              className={pathname.startsWith("/admin/users") ? "active" : ""}
            >
              <span className="icon-[tabler--users] size-4" />
              Usuarios
            </Link>
          </li>
          <li>
            <Link
              href="/admin/clients"
              className={pathname.startsWith("/admin/clients") ? "active" : ""}
            >
              <span className="icon-[tabler--building-store] size-4" />
              Clientes
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
