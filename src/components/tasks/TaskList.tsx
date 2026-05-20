import { CalendarClock } from "lucide-react"
import { Link } from "react-router-dom"

import { PermissionActionButton } from "@/components/shared/PermissionActionButton"
import { TaskStatusBadge } from "@/components/shared/TaskStatusBadge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDemoStore } from "@/store/demoStore"
import type { PersonnelRole, TaskListItem } from "@/types"
import { displayValue, formatDate, formatOptionalDate } from "@/utils/formatters"
import { canUpdateTask, getTaskDisabledReason, personnelDemoRoles, personnelRoleLabels } from "@/utils/permissions"
import { getTaskStatus } from "@/utils/task-status"

type TaskListProps = {
  tasks: TaskListItem[]
}

export function TaskList({ tasks }: TaskListProps) {
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const startTask = useDemoStore((state) => state.startTask)
  const completeTask = useDemoStore((state) => state.completeTask)

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        <div className="font-medium text-foreground">Không tìm thấy dữ liệu phù hợp.</div>
        <div className="mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</div>
      </div>
    )
  }

  const groupedTasks = personnelDemoRoles.map((role) => ({
    role,
    tasks: tasks.filter((task) => task.role === role),
  }))

  return (
    <div className="grid gap-4">
      {groupedTasks.map(({ role, tasks: roleTasks }) => (
        <Card key={role} size="sm">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{personnelRoleLabels[role]}</CardTitle>
              <GroupSummary role={role} tasks={roleTasks} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            {roleTasks.length === 0 && (
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                Không có công việc phù hợp với bộ lọc hiện tại.
              </div>
            )}
            {roleTasks.map((task) => {
              const canUpdate = canUpdateTask(selectedRole, task)
              const disabledReason = getTaskDisabledReason(selectedRole, task.role)
              const taskStatus = getTaskStatus(task.progress, task.completed_at)
              const isCompleted = taskStatus === "COMPLETED"

              return (
                <div key={`${task.order_number}-${task.role}-${task.task_name}`} className="rounded-lg border p-3">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_150px_280px_220px] xl:items-center">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{task.task_name}</div>
                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="whitespace-nowrap">Vai trò: {task.role_label}</span>
                        <span className="max-w-[180px] truncate">Người phụ trách: {task.assignee}</span>
                        <span className="whitespace-nowrap">PO: {task.po_number}</span>
                        <Link className="whitespace-nowrap text-primary underline-offset-4 hover:underline" to={`/delivery-orders/${task.order_number}`}>
                          DO: {task.order_number}
                        </Link>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant={canUpdate ? "secondary" : "outline"}>
                          {canUpdate ? "Có thể thao tác" : "Không có quyền thao tác"}
                        </Badge>
                        {!canUpdate && <span className="text-xs text-muted-foreground">{disabledReason}</span>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-medium uppercase text-muted-foreground">
                        Trạng thái
                      </div>
                      <TaskStatusBadge progress={task.progress} completedAt={task.completed_at} />
                    </div>
                    <div className="grid min-w-0 gap-1 text-xs text-muted-foreground">
                      <span className="truncate">
                        Người tạo: <span className="font-medium text-foreground">{task.created_by}</span>
                      </span>
                      <span className="truncate">
                        Created by ID: <span className="font-medium text-foreground">{displayValue(task.created_by_user_id)}</span>
                      </span>
                      <span className="truncate">
                        Assignee ID: <span className="font-medium text-foreground">{displayValue(task.assignee_user_id)}</span>
                      </span>
                      <span className="truncate">
                        Assigned by ID: <span className="font-medium text-foreground">{displayValue(task.assigned_by_user_id)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarClock className="size-3.5" />
                        Ngày tạo: <span className="font-medium text-foreground">{formatDate(task.created_at)}</span>
                      </span>
                      <span>Ngày giao: <span className="font-medium text-foreground">{formatOptionalDate(task.assigned_at)}</span></span>
                      <span>Ngày hoàn thành: <span className="font-medium text-foreground">{task.completed_at ? formatDate(task.completed_at) : "Chưa hoàn thành"}</span></span>
                      <span className="truncate">Ghi chú: <span className="font-medium text-foreground">{displayValue(task.notes)}</span></span>
                    </div>
                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      {isCompleted ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Đã hoàn thành</Badge>
                      ) : (
                        <>
                          <PermissionActionButton
                            allowed={canUpdate}
                            disabledReason={disabledReason}
                            onClick={() => startTask(task.role, task.task_name, task.order_number, task.task_index)}
                          >
                            Bắt đầu
                          </PermissionActionButton>
                          <PermissionActionButton
                            allowed={canUpdate}
                            disabledReason={disabledReason}
                            onClick={() => completeTask(task.role, task.task_name, task.order_number, task.task_index)}
                          >
                            Hoàn thành
                          </PermissionActionButton>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function GroupSummary({ role, tasks }: { role: PersonnelRole; tasks: TaskListItem[] }) {
  const completed = tasks.filter((task) => task.completed_at || task.progress >= 100).length
  const inProgress = tasks.filter((task) => task.progress > 0 && task.progress < 100 && task.completed_at === null).length
  const notStarted = tasks.filter((task) => task.progress === 0 && task.completed_at === null).length

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="outline">{personnelRoleLabels[role]}</Badge>
      <span>{completed}/{tasks.length} hoàn thành</span>
      {inProgress > 0 && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{inProgress} đang làm</Badge>}
      {notStarted > 0 && <Badge variant="outline" className="bg-muted/60 text-muted-foreground">{notStarted} chưa bắt đầu</Badge>}
    </div>
  )
}
