import type { PersonnelRole, TaskListItem } from "@/types"

export type DemoRole =
  | "admin"
  | "requester"
  | "purchasing_manager"
  | "sale_staff"
  | "port_officer"
  | "customs_officer"

export type DemoAction =
  | "viewDashboard"
  | "viewPurchaseRequests"
  | "createPurchaseRequest"
  | "updatePurchaseRequestCore"
  | "updatePurchaseRequestStatus"
  | "assignPurchasingManager"
  | "viewDeliveryOrders"
  | "createDeliveryOrder"
  | "updateDeliveryOrderCore"
  | "updateOrderInfoStatus"
  | "updateProductDetails"
  | "updateSapIntegration"
  | "updateLogisticsShipping"
  | "updateWarehouseTracking"
  | "updateFinanceTax"
  | "viewTasks"
  | "updatePicManagerTask"
  | "updateSaleStaffTask"
  | "updatePortOfficerTask"
  | "updateCustomsOfficerTask"
  | "updateAnyTask"
  | "resetDemoData"

export const demoRoles: DemoRole[] = [
  "admin",
  "requester",
  "purchasing_manager",
  "sale_staff",
  "port_officer",
  "customs_officer",
]

export const personnelDemoRoles: PersonnelRole[] = [
  "pic_manager",
  "sale_staff",
  "port_officer",
  "customs_officer",
]

export const roleLabels: Record<DemoRole, string> = {
  admin: "Quản trị viên",
  requester: "Người yêu cầu/Requester",
  purchasing_manager: "Quản lý mua hàng / PIC",
  sale_staff: "Nhân viên kinh doanh/Sale Staff",
  port_officer: "Nhân viên cảng vụ/Port Officer",
  customs_officer: "Nhân viên hải quan/Customs Officer",
}

export const personnelRoleLabels: Record<PersonnelRole, string> = {
  pic_manager: "PIC Manager",
  sale_staff: "Nhân viên kinh doanh/Sale Staff",
  port_officer: "Nhân viên cảng vụ/Port Officer",
  customs_officer: "Nhân viên hải quan/Customs Officer",
}

export const roleDescriptions: Record<DemoRole, string> = {
  admin: "Có quyền xem và thao tác toàn bộ quy trình demo.",
  requester: "Khởi tạo yêu cầu mua hàng từ nhu cầu vật tư của bộ phận sản xuất.",
  purchasing_manager: "Điều phối xử lý PR, PO/DO, SAP, vận chuyển và nhập kho.",
  sale_staff: "Cập nhật các công việc liên quan giá cả, thị trường và thông tin tham chiếu nếu dữ liệu hiện tại hỗ trợ.",
  port_officer: "Cập nhật tiến độ các công việc hiện trường tại cảng.",
  customs_officer: "Cập nhật thông tin thuế, thông quan và tiến độ khai báo hải quan.",
}

export const roleFocus: Record<DemoRole, string> = {
  admin: "Toàn bộ quy trình PR, DO, SAP, vận chuyển, kho, tài chính và công việc",
  requester: "Tạo PR và theo dõi bối cảnh workflow",
  purchasing_manager: "Điều phối PR, PO/DO, SAP, vận chuyển, nhập kho và task PIC",
  sale_staff: "Công việc kinh doanh được giao",
  port_officer: "Công việc cảng vụ được giao",
  customs_officer: "Thông tin thuế, thông quan và task hải quan",
}

export const roleMainActions: Record<DemoRole, string[]> = {
  admin: ["Tạo/cập nhật PR", "Tạo/cập nhật DO", "Cập nhật mọi nhóm công việc"],
  requester: ["Tạo PR", "Xem PR/DO và trạng thái công việc"],
  purchasing_manager: ["Cập nhật trạng thái PR", "Cập nhật PO/DO, SAP, vận chuyển, nhập kho", "Cập nhật task PIC Manager"],
  sale_staff: ["Xem dữ liệu PR/DO để nắm bối cảnh", "Cập nhật task kinh doanh"],
  port_officer: ["Xem dữ liệu vận chuyển để nắm bối cảnh", "Cập nhật task cảng vụ"],
  customs_officer: ["Cập nhật tài chính/thuế", "Cập nhật task hải quan"],
}

type RoleAllowedActionDescription = {
  label: string
  requiredActions: DemoAction[]
}

export type RoleActionDetails = {
  role: DemoRole
  label: string
  description: string
  allowedActions: string[]
  limitations: string[]
}

const personnelViewActions: DemoAction[] = [
  "viewDashboard",
  "viewPurchaseRequests",
  "viewDeliveryOrders",
  "viewTasks",
]

const roleActions: Record<Exclude<DemoRole, "admin">, DemoAction[]> = {
  requester: [...personnelViewActions, "createPurchaseRequest", "updatePurchaseRequestCore"],
  purchasing_manager: [
    ...personnelViewActions,
    "updatePurchaseRequestStatus",
    "assignPurchasingManager",
    "createDeliveryOrder",
    "updateDeliveryOrderCore",
    "updateOrderInfoStatus",
    "updateProductDetails",
    "updateSapIntegration",
    "updateLogisticsShipping",
    "updateWarehouseTracking",
    "updatePicManagerTask",
  ],
  sale_staff: [...personnelViewActions, "updateSaleStaffTask"],
  port_officer: [...personnelViewActions, "updatePortOfficerTask"],
  customs_officer: [...personnelViewActions, "updateFinanceTax", "updateCustomsOfficerTask"],
}

const taskUpdateActions: Record<PersonnelRole, DemoAction> = {
  pic_manager: "updatePicManagerTask",
  sale_staff: "updateSaleStaffTask",
  port_officer: "updatePortOfficerTask",
  customs_officer: "updateCustomsOfficerTask",
}

const roleAllowedActionDescriptions: Record<DemoRole, RoleAllowedActionDescription[]> = {
  admin: [
    { label: "Xem và thao tác toàn bộ quy trình demo.", requiredActions: ["viewDashboard"] },
    { label: "Tạo và cập nhật PR.", requiredActions: ["createPurchaseRequest", "updatePurchaseRequestStatus"] },
    { label: "Tạo DO từ PR phù hợp.", requiredActions: ["createDeliveryOrder"] },
    { label: "Cập nhật PO/DO, SAP, vận chuyển, nhập kho, tài chính/thuế.", requiredActions: ["updateDeliveryOrderCore", "updateSapIntegration", "updateLogisticsShipping", "updateWarehouseTracking", "updateFinanceTax"] },
    { label: "Cập nhật tất cả nhóm công việc.", requiredActions: ["updateAnyTask"] },
    { label: "Reset dữ liệu demo.", requiredActions: ["resetDemoData"] },
  ],
  requester: [
    { label: "Tạo yêu cầu mua hàng từ nhu cầu vật tư.", requiredActions: ["createPurchaseRequest"] },
    { label: "Nhập thông tin hàng hóa, số lượng, mức ưu tiên, hạn nhập kho và hợp đồng sản xuất.", requiredActions: ["createPurchaseRequest", "updatePurchaseRequestCore"] },
    { label: "Xem PR, DO và tiến độ công việc để theo dõi bối cảnh.", requiredActions: ["viewPurchaseRequests", "viewDeliveryOrders", "viewTasks"] },
  ],
  purchasing_manager: [
    { label: "Cập nhật người phụ trách mua hàng và trạng thái PR.", requiredActions: ["assignPurchasingManager", "updatePurchaseRequestStatus"] },
    { label: "Tạo DO từ PR phù hợp nếu workflow cho phép.", requiredActions: ["createDeliveryOrder"] },
    { label: "Cập nhật thông tin sản phẩm, SAP, vận chuyển và nhập kho.", requiredActions: ["updateProductDetails", "updateSapIntegration", "updateLogisticsShipping", "updateWarehouseTracking"] },
    { label: "Xem tài chính/thuế để điều phối.", requiredActions: ["viewDeliveryOrders"] },
    { label: "Cập nhật nhóm công việc PIC Manager.", requiredActions: ["updatePicManagerTask"] },
  ],
  sale_staff: [
    { label: "Xem PR/DO để nắm bối cảnh.", requiredActions: ["viewPurchaseRequests", "viewDeliveryOrders"] },
    { label: "Cập nhật tiến độ công việc kinh doanh được giao.", requiredActions: ["updateSaleStaffTask"] },
  ],
  port_officer: [
    { label: "Xem DO và thông tin vận chuyển để nắm bối cảnh hiện trường.", requiredActions: ["viewDeliveryOrders"] },
    { label: "Cập nhật tiến độ công việc cảng vụ được giao.", requiredActions: ["updatePortOfficerTask"] },
  ],
  customs_officer: [
    { label: "Xem PR/DO, vận chuyển và kho để nắm bối cảnh.", requiredActions: ["viewPurchaseRequests", "viewDeliveryOrders"] },
    { label: "Cập nhật thông tin tài chính/thuế liên quan thông quan.", requiredActions: ["updateFinanceTax"] },
    { label: "Cập nhật tiến độ công việc hải quan được giao.", requiredActions: ["updateCustomsOfficerTask"] },
  ],
}

const roleLimitations: Record<DemoRole, string[]> = {
  admin: ["Đây vẫn là quyền demo trên frontend, không phải phân quyền production."],
  requester: ["Không cập nhật trạng thái PR, phụ trách mua hàng, DO, SAP, vận chuyển, kho, tài chính/thuế hoặc task nhân sự."],
  purchasing_manager: ["Không cập nhật task của Sale Staff, Port Officer hoặc Customs Officer nếu không phải Admin."],
  sale_staff: [
    "Chỉ cập nhật thông tin giá/thị trường nếu schema hiện tại đã có field phù hợp.",
    "Không tạo PR/DO, không cập nhật SAP, vận chuyển, kho, tài chính/thuế hoặc task role khác.",
  ],
  port_officer: [
    "Không cập nhật trực tiếp logistics core, warehouse_tracking hoặc finance_tax.",
    "Thông tin task cảng vụ là bối cảnh để Quản lý mua hàng / PIC cập nhật nhập kho.",
  ],
  customs_officer: ["Không cập nhật PR status, SAP, logistics, warehouse_tracking hoặc task role khác."],
}

export const adminOnlyReason = "Chỉ Quản trị viên được thao tác mục này trong bản demo."
export const actionUnavailableReason = "Vai trò hiện tại không có quyền thực hiện hành động này trong demo."
export const adminOrPurchasingManagerReason = "Chỉ Quản trị viên hoặc Quản lý mua hàng / PIC được thao tác mục này."
export const mentorUndefinedReason = "Quyền này đang được đánh dấu tạm thời vì mentor chưa xác nhận chi tiết."
export const taskGroupUnavailableReason = "Bạn chỉ có thể cập nhật nhóm công việc được phân công cho vai trò hiện tại."

export function canPerform(role: DemoRole, action: DemoAction) {
  if (!isDemoRole(role)) return false
  if (role === "admin") return true
  return roleActions[role].includes(action)
}

export const can = canPerform

export function canUpdateTaskGroup(role: DemoRole, personnelKey: PersonnelRole) {
  return canPerform(role, "updateAnyTask") || canPerform(role, taskUpdateActions[personnelKey])
}

export function canUpdateTask(role: DemoRole, task: Pick<TaskListItem, "role">) {
  return canUpdateTaskGroup(role, task.role)
}

export function getPermissionLabel(canAct: boolean) {
  return canAct ? "Có thể thao tác" : "Chỉ xem"
}

export function getTaskDisabledReason(role: DemoRole, taskRole: PersonnelRole) {
  if (canUpdateTaskGroup(role, taskRole)) {
    return ""
  }

  return taskGroupUnavailableReason
}

export function isDemoRole(value: unknown): value is DemoRole {
  return typeof value === "string" && demoRoles.includes(value as DemoRole)
}

export function normalizeDemoRole(value: unknown): DemoRole {
  if (isDemoRole(value)) return value
  if (typeof value !== "string") return "admin"

  const normalizedValue = value.trim().toLowerCase()

  if (
    normalizedValue === "pic_manager" ||
    normalizedValue === "purchasing" ||
    normalizedValue === "purchasing_department" ||
    normalizedValue === "mua_hang" ||
    normalizedValue === "mua hàng" ||
    normalizedValue === "purchasing_manager_pic"
  ) {
    return "purchasing_manager"
  }

  if (
    normalizedValue === "production" ||
    normalizedValue === "production_department" ||
    normalizedValue === "san_xuat" ||
    normalizedValue === "sản xuất" ||
    normalizedValue === "nguoi_yeu_cau" ||
    normalizedValue === "người yêu cầu" ||
    normalizedValue === "requester-like" ||
    normalizedValue === "requester_role"
  ) {
    return "requester"
  }

  if (
    normalizedValue === "warehouse" ||
    normalizedValue === "warehouse_staff" ||
    normalizedValue === "kho_hang" ||
    normalizedValue === "kho hàng"
  ) {
    return "admin"
  }

  return "admin"
}

export const normalizeRole = normalizeDemoRole

export function getRoleLabel(role: DemoRole) {
  return roleLabels[role]
}

export function getRoleDescription(role: DemoRole) {
  return roleDescriptions[role]
}

export function getRoleActionDetails(role: DemoRole): RoleActionDetails {
  return {
    role,
    label: getRoleLabel(role),
    description: getRoleDescription(role),
    allowedActions: roleAllowedActionDescriptions[role]
      .filter((action) => action.requiredActions.every((requiredAction) => canPerform(role, requiredAction)))
      .map((action) => action.label),
    limitations: roleLimitations[role],
  }
}
