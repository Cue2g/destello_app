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
    <nav className="navbar bg-base-100 rounded-box shadow-sm">
      <div className="w-full md:flex md:items-center md:gap-2">
        <div className="flex items-center justify-between">
          <div className="navbar-start items-center justify-between max-md:w-full">
            <Link
              href="/admin"
              className="link text-base-content link-neutral text-xl font-bold no-underline"
            >
              Destello
            </Link>
            <div className="md:hidden">
              <button
                type="button"
                className="collapse-toggle btn btn-outline btn-secondary btn-sm btn-square"
                data-collapse="#admin-navbar-collapse"
                aria-controls="admin-navbar-collapse"
                aria-label="Toggle navigation"
              >
                <span className="icon-[tabler--menu-2] collapse-open:hidden size-4" />
                <span className="icon-[tabler--x] collapse-open:block hidden size-4" />
              </button>
            </div>
          </div>
        </div>
        <div
          id="admin-navbar-collapse"
          className="md:navbar-start collapse hidden grow basis-full overflow-hidden transition-[height] duration-300 max-md:w-full"
        >
          <ul className="menu md:menu-horizontal gap-2 p-0 text-base max-md:mt-2">
            <li>
              <Link
                href="/admin/users"
                className={pathname.startsWith("/admin/users") ? "active" : ""}
              >
                <span className="icon-[tabler--users] size-4" />
                Usuarios
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:navbar-end flex items-center max-md:mt-2">
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
                <div className="flex size-9.5 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="icon-[tabler--user] size-5" />
                </div>
              </div>
            </button>
            <ul
              className="dropdown-menu dropdown-open:opacity-100 hidden min-w-60"
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
                  <h6 className="text-base-content text-base font-semibold">
                    {userName || "Usuario"}
                  </h6>
                  <small className="text-base-content/50">{userEmail}</small>
                </div>
              </li>
              <li>
                <Link href="/admin/users" className="dropdown-item">
                  <span className="icon-[tabler--users] size-5" />
                  Usuarios
                </Link>
              </li>
              <li className="dropdown-footer gap-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn btn-error btn-soft btn-block"
                >
                  <span className="icon-[tabler--logout] size-5" />
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
