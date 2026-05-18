import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { actionUnavailableReason } from "@/utils/permissions"

type PermissionActionButtonProps = {
  allowed: boolean
  children: ReactNode
  disabledReason?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  showDisabledReason?: boolean
}

export function PermissionActionButton({
  allowed,
  children,
  disabledReason = actionUnavailableReason,
  variant = "outline",
  size = "sm",
  className,
  onClick,
  type = "button",
  showDisabledReason = false,
}: PermissionActionButtonProps) {
  return (
    <span className="inline-flex flex-col gap-1">
      <Button variant={variant} size={size} disabled={!allowed} className={className} onClick={onClick} type={type}>
        {children}
      </Button>
      {!allowed && showDisabledReason && (
        <span className="max-w-52 text-xs leading-snug text-muted-foreground">{disabledReason}</span>
      )}
    </span>
  )
}

export function PermissionNote({
  allowed,
  disabledReason = actionUnavailableReason,
}: {
  allowed: boolean
  disabledReason?: string
}) {
  if (allowed) {
    return <span className="text-xs text-emerald-700">Có thể thao tác</span>
  }

  return <span className="text-xs text-muted-foreground">{disabledReason}</span>
}
