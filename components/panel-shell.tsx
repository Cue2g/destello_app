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

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <PanelSidebar
            userName={userName}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-neutral/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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
