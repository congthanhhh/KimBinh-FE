export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

export function getTaskStatus(progress: number, completedAt: string | null): TaskStatus {
  if (completedAt || progress >= 100) return "COMPLETED"
  if (progress > 0) return "IN_PROGRESS"
  return "NOT_STARTED"
}

export function getTaskStatusLabel(status: TaskStatus) {
  if (status === "COMPLETED") return "Hoàn thành"
  if (status === "IN_PROGRESS") return "Đang thực hiện"
  return "Chưa bắt đầu"
}
