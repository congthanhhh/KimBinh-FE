import { ClipboardList, LayoutDashboard, ListChecks, PackageCheck } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"
import { getRouteLabel } from "@/utils/labels"

const navItems = [
  { label: getRouteLabel("/dashboard"), href: "/dashboard", icon: LayoutDashboard },
  { label: getRouteLabel("/purchase-requests"), href: "/purchase-requests", icon: ClipboardList },
  { label: getRouteLabel("/delivery-orders"), href: "/delivery-orders", icon: PackageCheck },
  { label: getRouteLabel("/tasks"), href: "/tasks", icon: ListChecks },
]

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <div className="border-b px-5 py-4">
        <div className="text-base font-semibold">KBI-DASHBOARD</div>
        <div className="text-xs text-muted-foreground">Bảng điều hành vận hành</div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
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
  )
}
