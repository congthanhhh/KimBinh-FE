import { EMPTY_VALUE } from "@/utils/formatters"

const statusLabels: Record<string, string> = {
  NEW: "Mới",
  DRAFT: "Nháp",
  CREATED: "Đã tạo",
  APPROVED: "Đã duyệt",
  PROCESSING: "Đang xử lý",
  CONFIRMED: "Đã xác nhận",
  PO_CREATED: "Đã tạo PO",
  IN_TRANSIT: "Đang vận chuyển",
  CUSTOMS_PROCESSING: "Đang khai quan",
  WAREHOUSE_RECEIVED: "Đã nhập kho",
  COMPLETED: "Hoàn thành",
  PARTIALLY_DELIVERED: "Giao một phần",
  DELAYED: "Trễ hạn",
  CANCELLED: "Đã hủy",
  NOT_STARTED: "Chưa bắt đầu",
  IN_PROGRESS: "Đang thực hiện",
  ON_TIME: "Đúng hạn",
}

const priorityLabels: Record<string, string> = {
  Urgent: "Khẩn cấp",
  High: "Cao",
  Normal: "Bình thường",
  Low: "Thấp",
  "Priority 1": "Ưu tiên 1",
  "Priority 2": "Ưu tiên 2",
  "Priority 3": "Ưu tiên 3",
  "Ưu tiên 1": "Ưu tiên 1",
  "Ưu tiên 2": "Ưu tiên 2",
  "Ưu tiên 3": "Ưu tiên 3",
  "Khẩn cấp": "Khẩn cấp",
  "Bình thường": "Bình thường",
}

const routeLabels: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/purchase-requests": "Yêu cầu mua hàng",
  "/purchase-orders": "Đơn mua hàng",
  "/delivery-orders": "Đơn nhập hàng",
  "/tasks": "Công việc",
}

const fieldLabels: Record<string, string> = {
  requested_order_id: "Mã yêu cầu",
  item_code: "Mã hàng",
  item_name: "Tên hàng",
  quantity: "Số lượng",
  unit: "Đơn vị",
  priority: "Mức ưu tiên",
  requester: "Người yêu cầu",
  purchasing_manager: "Phụ trách mua hàng",
  warehouse_deadline_date: "Hạn nhập kho",
  production_contract_number: "Hợp đồng sản xuất",
  po_number: "Số PO",
  tracking_number: "Mã tracking",
  supplier_code: "Mã nhà cung cấp",
  shipping_method: "Phương thức vận chuyển",
  shipping_line: "Hãng tàu",
  vessel_code: "Mã tàu",
  port_of_departure: "Cảng đi",
  port_of_destination: "Cảng đến",
  progress: "Tiến độ",
  assignee: "Người phụ trách",
  created_at: "Ngày tạo",
  assigned_at: "Ngày giao",
  completed_at: "Ngày hoàn thành",
  notes: "Ghi chú",
}

export function getStatusLabel(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE

  const text = String(value)
  const delayMatch = text.match(/^(\d+)\s+days?\s+delayed$/i)

  if (delayMatch) {
    return `Trễ ${delayMatch[1]} ngày`
  }

  return statusLabels[text] ?? priorityLabels[text] ?? text.replaceAll("_", " ")
}

export function getPriorityLabel(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return EMPTY_VALUE

  const text = String(value)

  return priorityLabels[text] ?? text
}

export function getRouteLabel(route: string) {
  return routeLabels[route] ?? route
}

export function getFieldLabel(field: string) {
  return fieldLabels[field] ?? field
}
