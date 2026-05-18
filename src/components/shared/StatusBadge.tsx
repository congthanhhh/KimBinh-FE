import { Badge } from "@/components/ui/badge"
import { getStatusLabel } from "@/utils/labels"

type StatusBadgeProps = {
  value: string | number | null | undefined
}

function getTone(value: string): "default" | "secondary" | "destructive" | "outline" {
  const normalized = value.toLowerCase()

  if (
    normalized.includes("delayed") ||
    normalized.includes("blocked") ||
    normalized.includes("priority 1") ||
    normalized.includes("high") ||
    normalized.includes("trễ") ||
    normalized.includes("ưu tiên 1") ||
    normalized.includes("cao")
  ) {
    return "destructive"
  }

  if (
    normalized.includes("completed") ||
    normalized.includes("warehouse_received") ||
    normalized.includes("approved") ||
    normalized.includes("done") ||
    normalized.includes("hoàn thành") ||
    normalized.includes("đã nhập kho") ||
    normalized.includes("đã duyệt")
  ) {
    return "default"
  }

  if (
    normalized.includes("new") ||
    normalized.includes("draft") ||
    normalized.includes("priority 3") ||
    normalized.includes("on time") ||
    normalized.includes("mới") ||
    normalized.includes("nháp") ||
    normalized.includes("đúng hạn") ||
    normalized.includes("ưu tiên 3")
  ) {
    return "secondary"
  }

  return "outline"
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const label = getStatusLabel(value)

  return <Badge variant={getTone(`${value ?? label}`)}>{label}</Badge>
}
