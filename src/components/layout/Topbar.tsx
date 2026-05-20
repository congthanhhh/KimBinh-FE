import { Bell, Menu, Search, Settings, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDemoStore } from "@/store/demoStore"
import { canPerform, demoRoles, roleLabels, type DemoRole } from "@/utils/permissions"

type TopbarProps = {
  onMenuClick?: () => void
  isMobileMenuOpen?: boolean
}

export function Topbar({ onMenuClick, isMobileMenuOpen = false }: TopbarProps) {
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const setSelectedRole = useDemoStore((state) => state.setSelectedRole)
  const resetDemoData = useDemoStore((state) => state.resetDemoData)
  const canResetDemoData = canPerform(selectedRole, "resetDemoData")
  const menuLabel = isMobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"

  function handleResetDemoData() {
    if (!canResetDemoData) return
    resetDemoData()
    setSelectedRole("admin")
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="flex min-h-14 flex-wrap items-center gap-2 px-3 py-2 sm:flex-nowrap sm:gap-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 shrink-0 items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuClick}
            aria-label={menuLabel}
            aria-expanded={isMobileMenuOpen}
            aria-controls="app-sidebar"
          >
            <Menu className="size-4" />
          </Button>
          <div className="text-sm font-semibold">KBI-DASHBOARD</div>
        </div>
        <div className="relative order-last hidden w-full sm:order-none sm:ml-auto sm:block sm:max-w-[240px] md:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Tìm PR, DO, PO, SAP hoặc công việc" />
        </div>
        <label className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 text-xs font-medium text-muted-foreground sm:ml-0 sm:flex-none">
          <span className="hidden sm:inline">Vai trò demo</span>
          <select
            className="h-8 min-w-0 max-w-[46vw] rounded-lg border border-input bg-background px-2 text-sm font-medium text-foreground sm:max-w-none sm:w-auto"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as DemoRole)}
          >
            {demoRoles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </label>
        <Button className="hidden sm:inline-flex" variant="ghost" size="icon-sm" aria-label="Thông báo">
          <Bell />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="sm:h-7 sm:w-auto sm:px-2.5"
          onClick={handleResetDemoData}
          disabled={!canResetDemoData}
          aria-label="Reset dữ liệu demo"
        >
          <RefreshCcw className="size-4" />
          <span className="ml-2 hidden sm:inline">Data</span>
        </Button>
        <Button className="hidden sm:inline-flex" variant="ghost" size="icon-sm" aria-label="Cài đặt">
          <Settings />
        </Button>
      </div>
    </header>
  )
}
