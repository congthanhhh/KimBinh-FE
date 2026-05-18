import { useEffect, useMemo, useState } from "react"

import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { TaskList } from "@/components/tasks/TaskList"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { usePagination } from "@/hooks/usePagination"
import { useDemoStore } from "@/store/demoStore"
import { personnelDemoRoles, personnelRoleLabels, roleLabels, roleMainActions } from "@/utils/permissions"
import { getTaskStatus } from "@/utils/task-status"

export function TasksPage() {
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const tasks = useDemoStore((state) => state.personnelTasks)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const taskStatus = getTaskStatus(task.progress, task.completed_at)
        const matchesQuery = [task.task_name, task.role_label, task.assignee, task.po_number, task.order_number]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())

        return (
          matchesQuery &&
          (roleFilter === "ALL" || task.role === roleFilter) &&
          (statusFilter === "ALL" || taskStatus === statusFilter)
        )
      }),
    [query, roleFilter, statusFilter, tasks]
  )
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems: paginatedTasks,
    setPageSize,
    nextPage,
    previousPage,
    resetPage,
  } = usePagination(filteredTasks)

  useEffect(() => {
    resetPage()
  }, [query, resetPage, roleFilter, statusFilter])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý công việc"
        description="Trọng tâm tương tác theo role mentor: mỗi role nhân sự chỉ cập nhật nhóm task được giao."
      />
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Chế độ xem: {roleLabels[selectedRole]}</div>
            <div className="text-xs text-muted-foreground">
              Admin cập nhật mọi nhóm task; Quản lý mua hàng / PIC, Nhân viên kinh doanh, Nhân viên cảng vụ và Nhân viên hải quan chỉ cập nhật nhóm của mình.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {roleMainActions[selectedRole].slice(0, 2).map((action) => (
              <Badge key={action} variant="outline">{action}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_190px]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm vai trò, người phụ trách, công việc, PO hoặc DO"
            />
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Lọc vai trò"
            >
              <option value="ALL">Tất cả vai trò</option>
              {personnelDemoRoles.map((role) => (
                <option key={role} value={role}>{personnelRoleLabels[role]}</option>
              ))}
            </select>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Lọc trạng thái công việc"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NOT_STARTED">Chưa bắt đầu</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>
          <TaskList tasks={paginatedTasks} />
          {totalItems > 0 && (
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageSizeChange={setPageSize}
              onPreviousPage={previousPage}
              onNextPage={nextPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
