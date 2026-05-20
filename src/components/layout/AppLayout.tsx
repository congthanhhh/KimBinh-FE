import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"

import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { useDemoStore } from "@/store/demoStore"

export function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const initializeDemoData = useDemoStore((state) => state.initializeDemoData)

  useEffect(() => {
    void initializeDemoData()
  }, [initializeDemoData])

  function handleMenuClick() {
    setIsMobileSidebarOpen((open) => !open)
  }

  function handleCloseSidebar() {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="flex min-h-svh bg-muted/40">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={handleCloseSidebar} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={handleMenuClick} isMobileMenuOpen={isMobileSidebarOpen} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
