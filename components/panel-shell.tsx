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
    <div className="flex min-h-screen">
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0 md:w-64"
        } transition-[width] duration-300 overflow-hidden shrink-0`}
      >
        <PanelSidebar
          userName={userName}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 btn btn-ghost btn-square"
        aria-label="Toggle sidebar"
      >
        <span
          className={`icon-[tabler--menu-2] size-6 ${
            sidebarOpen ? "hidden" : "block"
          }`}
        />
        <span
          className={`icon-[tabler--x] size-6 ${
            sidebarOpen ? "block" : "hidden"
          }`}
        />
      </button>

      <main
        className={`flex-1 bg-base-200 p-6 overflow-auto ${
          sidebarOpen ? "max-md:pt-20" : "max-md:pt-20"
        }`}
      >
        {children}
      </main>
    </div>
  )
}
