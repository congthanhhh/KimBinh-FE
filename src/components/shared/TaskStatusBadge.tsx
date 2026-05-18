import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getTaskStatus, getTaskStatusLabel } from "@/utils/task-status"

type TaskStatusBadgeProps = {
  progress: number
  completedAt: string | null
}

export function TaskStatusBadge({ progress, completedAt }: TaskStatusBadgeProps) {
  const status = getTaskStatus(progress, completedAt)

  return (
    <Badge
      variant="outline"
      className={cn(
        status === "NOT_STARTED" && "border-border bg-muted/60 text-muted-foreground",
        status === "IN_PROGRESS" && "border-amber-200 bg-amber-50 text-amber-700",
        status === "COMPLETED" && "border-emerald-200 bg-emerald-50 text-emerald-700"
      )}
    >
      {getTaskStatusLabel(status)}
    </Badge>
  )
}
