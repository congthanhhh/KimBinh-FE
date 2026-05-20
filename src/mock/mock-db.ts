import {
  deliveryOrderCustomsClearanceMock,
  deliveryOrderDeliveryTrackingMock,
  deliveryOrderFinanceTaxMock,
  deliveryOrderItemsMock,
  deliveryOrderLogisticsShippingMock,
  deliveryOrderPurchaseOrdersMock,
  deliveryOrderProcessMilestonesMock,
  deliveryOrdersMock,
  deliveryOrderSapIntegrationsMock,
  deliveryOrderWarehouseTrackingMock,
} from "@/mock/data/delivery-orders.mock"
import {
  efmsAccountingNoteChargesMock,
  efmsAccountingNotesMock,
  efmsAssignmentsMock,
  efmsAttachmentsMock,
  efmsChargesMock,
  efmsContainersMock,
  efmsHouseBillsMock,
  efmsManifestHouseBillsMock,
  efmsManifestsMock,
  efmsShippingInstructionsMock,
} from "@/mock/data/efms.mock"
import { personnelAssignmentsMock, personnelTasksMock } from "@/mock/data/personnel-tasks.mock"
import { purchaseOrderPurchaseRequestsMock, purchaseOrdersMock } from "@/mock/data/purchase-orders.mock"
import { purchaseRequestsMock } from "@/mock/data/purchase-requests.mock"
import { appUsersMock, partnersMock } from "@/mock/data/users-partners.mock"
import type { AppUser, MockActor, MockApiErrorCode, Partner } from "@/types/common.types"
import type {
  DeliveryOrder,
  DeliveryOrderCustomsClearance,
  DeliveryOrderDeliveryTracking,
  DeliveryOrderFinanceTax,
  DeliveryOrderItem,
  DeliveryOrderLogisticsShipping,
  DeliveryOrderPurchaseOrder,
  DeliveryOrderProcessMilestone,
  DeliveryOrderSapIntegration,
  DeliveryOrderStatus,
  DeliveryOrderWarehouseTracking,
} from "@/types/delivery-order.types"
import type {
  EfmsAccountingNote,
  EfmsAccountingNoteCharge,
  EfmsAssignment,
  EfmsAttachment,
  EfmsCharge,
  EfmsContainer,
  EfmsHouseBill,
  EfmsManifest,
  EfmsManifestHouseBill,
  EfmsShippingInstruction,
} from "@/types/efms.types"
import type { PersonnelAssignment, PersonnelRoleKey, PersonnelTaskRecord } from "@/types/personnel-task.types"
import type { PurchaseOrder, PurchaseOrderPurchaseRequest, PurchaseOrderStatus } from "@/types/purchase-order.types"
import type { PurchaseRequest, PurchaseRequestStatus } from "@/types/purchase-request.types"

const schemaVersion = 2
const storageKey = "factory-import-dashboard:mock-api-db:v2"
const defaultLatencyMs = 120

export const defaultMockActor: MockActor = { role: "admin", user_id: "US0001" }

export type MockDatabase = {
  app_users: AppUser[]
  partners: Partner[]
  purchase_orders: PurchaseOrder[]
  purchase_requests: PurchaseRequest[]
  purchase_order_purchase_requests: PurchaseOrderPurchaseRequest[]
  delivery_orders: DeliveryOrder[]
  delivery_order_purchase_orders: DeliveryOrderPurchaseOrder[]
  delivery_order_items: DeliveryOrderItem[]
  delivery_order_sap_integrations: DeliveryOrderSapIntegration[]
  delivery_order_logistics_shipping: DeliveryOrderLogisticsShipping[]
  delivery_order_warehouse_tracking: DeliveryOrderWarehouseTracking[]
  delivery_order_finance_tax: DeliveryOrderFinanceTax[]
  delivery_order_customs_clearance: DeliveryOrderCustomsClearance[]
  delivery_order_delivery_tracking: DeliveryOrderDeliveryTracking[]
  personnel_assignments: PersonnelAssignment[]
  personnel_tasks: PersonnelTaskRecord[]
  delivery_order_manifests: EfmsManifest[]
  delivery_order_shipping_instructions: EfmsShippingInstruction[]
  delivery_order_house_bills: EfmsHouseBill[]
  delivery_order_manifest_house_bills: EfmsManifestHouseBill[]
  delivery_order_containers: EfmsContainer[]
  delivery_order_charges: EfmsCharge[]
  delivery_order_accounting_notes: EfmsAccountingNote[]
  delivery_order_accounting_note_charges: EfmsAccountingNoteCharge[]
  delivery_order_efms_assignments: EfmsAssignment[]
  delivery_order_attachments: EfmsAttachment[]
  delivery_order_process_milestones: DeliveryOrderProcessMilestone[]
}

export class MockApiError extends Error {
  code: MockApiErrorCode
  status: number
  details?: Record<string, unknown>

  constructor(code: MockApiErrorCode, message: string, status: number, details?: Record<string, unknown>) {
    super(message)
    this.name = "MockApiError"
    this.code = code
    this.status = status
    this.details = details
  }
}

export const purchaseRequestStatuses: PurchaseRequestStatus[] = [
  "NEW",
  "APPROVED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
]

export const purchaseOrderStatuses: PurchaseOrderStatus[] = [
  "DRAFT",
  "CREATED",
  "CONFIRMED",
  "PARTIALLY_DELIVERED",
  "COMPLETED",
  "CANCELLED",
]

export const deliveryOrderStatuses: DeliveryOrderStatus[] = [
  "DRAFT",
  "PO_CREATED",
  "IN_TRANSIT",
  "CUSTOMS_PROCESSING",
  "WAREHOUSE_RECEIVED",
  "COMPLETED",
  "DELAYED",
]

export type PermissionAction =
  | "view"
  | "create_pr"
  | "manage_pr"
  | "manage_po"
  | "manage_do"
  | "manage_sap"
  | "manage_logistics"
  | "manage_warehouse"
  | "manage_finance_tax"
  | "manage_customs"
  | "manage_task"
  | "manage_efms"

export function createInitialMockDb(): MockDatabase {
  return clone({
    app_users: appUsersMock,
    partners: partnersMock,
    purchase_orders: purchaseOrdersMock,
    purchase_requests: purchaseRequestsMock,
    purchase_order_purchase_requests: purchaseOrderPurchaseRequestsMock,
    delivery_orders: deliveryOrdersMock,
    delivery_order_purchase_orders: deliveryOrderPurchaseOrdersMock,
    delivery_order_items: deliveryOrderItemsMock,
    delivery_order_sap_integrations: deliveryOrderSapIntegrationsMock,
    delivery_order_logistics_shipping: deliveryOrderLogisticsShippingMock,
    delivery_order_warehouse_tracking: deliveryOrderWarehouseTrackingMock,
    delivery_order_finance_tax: deliveryOrderFinanceTaxMock,
    delivery_order_customs_clearance: deliveryOrderCustomsClearanceMock,
    delivery_order_delivery_tracking: deliveryOrderDeliveryTrackingMock,
    personnel_assignments: personnelAssignmentsMock,
    personnel_tasks: personnelTasksMock,
    delivery_order_manifests: efmsManifestsMock,
    delivery_order_shipping_instructions: efmsShippingInstructionsMock,
    delivery_order_house_bills: efmsHouseBillsMock,
    delivery_order_manifest_house_bills: efmsManifestHouseBillsMock,
    delivery_order_containers: efmsContainersMock,
    delivery_order_charges: efmsChargesMock,
    delivery_order_accounting_notes: efmsAccountingNotesMock,
    delivery_order_accounting_note_charges: efmsAccountingNoteChargesMock,
    delivery_order_efms_assignments: efmsAssignmentsMock,
    delivery_order_attachments: efmsAttachmentsMock,
    delivery_order_process_milestones: deliveryOrderProcessMilestonesMock,
  })
}

export function readMockDb(): MockDatabase {
  const storage = getStorage()
  if (!storage) return createInitialMockDb()

  const stored = storage.getItem(storageKey)
  if (!stored) {
    const initial = createInitialMockDb()
    writeMockDb(initial)
    return initial
  }

  try {
    const parsed = JSON.parse(stored) as Partial<MockDatabase> & { __schema_version?: number }
    if (!isCurrentSchema(parsed)) {
      const initial = createInitialMockDb()
      writeMockDb(initial)
      return initial
    }
    return parsed as MockDatabase
  } catch {
    const initial = createInitialMockDb()
    writeMockDb(initial)
    return initial
  }
}

export function writeMockDb(db: MockDatabase) {
  const storage = getStorage()
  if (storage) storage.setItem(storageKey, JSON.stringify({ ...db, __schema_version: schemaVersion }))
}

export function resetMockDb() {
  const db = createInitialMockDb()
  writeMockDb(db)
  return clone(db)
}

export async function withMockLatency<T>(value: T, latencyMs = defaultLatencyMs): Promise<T> {
  await new Promise((resolve) => globalThis.setTimeout(resolve, latencyMs))
  return clone(value)
}

export function active<T extends { deleted_at?: string | null }>(items: T[]): T[] {
  return items.filter((item) => !item.deleted_at)
}

export function clone<T>(value: T): T {
  return structuredClone(value)
}

export function nowIso() {
  return new Date().toISOString()
}

export function todayIso() {
  return nowIso().slice(0, 10)
}

export function createMockId(prefix: string, existingCount: number) {
  return `${prefix}-${String(existingCount + 1).padStart(6, "0")}`
}

export function assertPermission(actor: MockActor | undefined, action: PermissionAction, taskRole?: PersonnelRoleKey) {
  if (canPerform(actor ?? defaultMockActor, action, taskRole)) return
  throw new MockApiError("FORBIDDEN", "This demo role cannot perform the requested action.", 403, {
    role: actor?.role ?? defaultMockActor.role,
    action,
    taskRole,
  })
}

export function canPerform(actor: MockActor, action: PermissionAction, taskRole?: PersonnelRoleKey) {
  if (actor.role === "admin") return true
  if (action === "view") return true
  if (actor.role === "requester") return action === "create_pr"
  if (actor.role === "purchasing_manager") {
    if (action === "manage_task") return taskRole === "pic_manager"
    return ["manage_pr", "manage_po", "manage_do", "manage_sap", "manage_logistics", "manage_warehouse", "manage_efms"].includes(action)
  }
  if (actor.role === "sale_staff") return action === "manage_task" && taskRole === "sale_staff"
  if (actor.role === "port_officer") return action === "manage_task" && taskRole === "port_officer"
  if (actor.role === "customs_officer") {
    return (
      action === "manage_finance_tax" ||
      action === "manage_customs" ||
      (action === "manage_task" && taskRole === "customs_officer")
    )
  }
  return false
}

export function assertFound<T>(value: T | undefined | null, entityName: string, id: string): T {
  if (value) return value
  throw new MockApiError("NOT_FOUND", `${entityName} was not found.`, 404, { id })
}

export function assertUnique(activeItems: { [key: string]: unknown }[], field: string, value: unknown, entityName: string) {
  if (!activeItems.some((item) => item[field] === value)) return
  throw new MockApiError("CONFLICT", `${entityName} already exists with the same ${field}.`, 409, { field, value })
}

export function assertPositiveQuantity(quantity: number | undefined, field = "quantity") {
  if (quantity === undefined || quantity > 0) return
  throw new MockApiError("VALIDATION_ERROR", `${field} must be greater than 0.`, 422, { field, value: quantity })
}

export function assertProgress(progress: number | undefined, completed_at?: string | null) {
  if (progress !== undefined && (progress < 0 || progress > 100)) {
    throw new MockApiError("VALIDATION_ERROR", "progress must be between 0 and 100.", 422, { progress })
  }

  if (completed_at && progress !== 100) {
    throw new MockApiError("VALIDATION_ERROR", "completed_at is only valid when progress is 100.", 422, {
      progress,
      completed_at,
    })
  }
}

export function assertStatus<T extends string>(status: T | undefined, allowed: readonly T[], field = "status") {
  if (status === undefined || allowed.includes(status)) return
  throw new MockApiError("VALIDATION_ERROR", `${field} must use a documented uppercase enum value.`, 422, {
    field,
    status,
    allowed,
  })
}

export function assertDelayDaysNotWritable(payload: Record<string, unknown>) {
  if (!("delay_days" in payload)) return
  throw new MockApiError("VALIDATION_ERROR", "delay_days is computed and cannot be manually overridden.", 422, {
    field: "delay_days",
  })
}

export function computeDelayDays(deadline?: string | null, actualOrExpected?: string | null, fallbackExpected?: string | null) {
  if (!deadline) return 0
  const candidate = actualOrExpected ?? fallbackExpected
  if (!candidate) return 0
  const diffMs = new Date(candidate).getTime() - new Date(deadline).getTime()
  return Math.max(0, Math.ceil(diffMs / 86_400_000))
}

export function recalculatePurchaseRequestDelay(request: PurchaseRequest): PurchaseRequest {
  return {
    ...request,
    delay_days: computeDelayDays(
      request.warehouse_deadline_date,
      request.actual_warehouse_entry_date ?? request.expected_arrival_date,
      request.supplier_expected_delivery_date
    ),
  }
}

export function recalculateWarehouseDelay(tracking: DeliveryOrderWarehouseTracking): DeliveryOrderWarehouseTracking {
  return {
    ...tracking,
    delay_days: computeDelayDays(tracking.warehouse_deadline, tracking.actual_entry_date, tracking.planned_entry_date),
  }
}

export function findPurchaseOrderRequestLink(db: MockDatabase, purchase_order_id: string, purchase_request_id: string) {
  return active(db.purchase_order_purchase_requests).find(
    (item) => item.purchase_order_id === purchase_order_id && item.purchase_request_id === purchase_request_id
  )
}

export function assertPurchaseOrderRequestLink(db: MockDatabase, purchase_order_id: string, purchase_request_id: string) {
  const po = assertFound(
    active(db.purchase_orders).find((item) => item.id === purchase_order_id),
    "Purchase order",
    purchase_order_id
  )
  const pr = assertFound(
    active(db.purchase_requests).find((item) => item.id === purchase_request_id),
    "Purchase request",
    purchase_request_id
  )

  const link = findPurchaseOrderRequestLink(db, purchase_order_id, purchase_request_id)
  if (!link) {
    throw new MockApiError("INVALID_RELATIONSHIP", "Selected PR must belong to the selected PO.", 422, {
      purchase_order_id,
      purchase_request_id,
    })
  }

  return { po, pr, link }
}

export function touch<T extends { updated_at: string }>(record: T): T {
  return { ...record, updated_at: nowIso() }
}

export function softDelete<T extends { deleted_at?: string | null; updated_at: string }>(record: T): T {
  return { ...record, deleted_at: nowIso(), updated_at: nowIso() }
}

function getStorage() {
  if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) return null
  return globalThis.localStorage
}

function isCurrentSchema(db: Partial<MockDatabase> & { __schema_version?: number }) {
  return (
    db.__schema_version === schemaVersion &&
    Array.isArray(db.purchase_order_purchase_requests) &&
    Array.isArray(db.delivery_order_purchase_orders) &&
    Array.isArray(db.delivery_order_items)
  )
}
