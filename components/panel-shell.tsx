"use client"

import { useState } from "react"
import { PanelSidebar } from "@/components/panel-sidebar"

export function PanelShell({
  userName,
  children,
}: {
  userName: string | null | undefined
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <PanelSidebar
          userName={userName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile sidebar wrapper */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <PanelSidebar
          userName={userName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-neutral/50 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile hamburger opener */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-50 btn btn-ghost btn-square ${
          sidebarOpen ? "hidden" : "block"
        }`}
        aria-label="Open sidebar"
      >
        <span className="icon-[tabler--menu-2] size-6" />
      </button>

      <main
        className={`flex-1 bg-base-200 overflow-auto ${
          sidebarOpen ? "max-md:pt-20" : "max-md:pt-20"
        }`}
      >
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
