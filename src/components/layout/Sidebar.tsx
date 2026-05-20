import { ClipboardList, FileText, LayoutDashboard, ListChecks, PackageCheck } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"
import { getRouteLabel } from "@/utils/labels"

const navItems = [
  { label: getRouteLabel("/dashboard"), href: "/dashboard", icon: LayoutDashboard },
  { label: getRouteLabel("/purchase-requests"), href: "/purchase-requests", icon: ClipboardList },
  { label: getRouteLabel("/purchase-orders"), href: "/purchase-orders", icon: FileText },
  { label: getRouteLabel("/delivery-orders"), href: "/delivery-orders", icon: PackageCheck },
  { label: getRouteLabel("/tasks"), href: "/tasks", icon: ListChecks },
]

type SidebarProps = {
  isMobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isMobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="app-sidebar"
        data-state={isMobileOpen ? "open" : "closed"}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card shadow-lg transition-transform duration-200 ease-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b px-5 py-4">
          <div className="text-base font-semibold">KBI-DASHBOARD</div>
          <div className="text-xs text-muted-foreground">Bảng điều hành vận hành</div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
