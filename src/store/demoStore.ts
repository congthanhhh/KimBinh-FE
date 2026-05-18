import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  deliveryOrders as initialDeliveryOrders,
  purchaseRequests as initialPurchaseRequests,
} from "@/data/mock-data"
import type {
  DeliveryOrder,
  Personnel,
  PersonnelRole,
  PersonnelTask,
  PurchaseRequest,
  TaskListItem,
} from "@/types"
import { normalizeDemoRole, personnelRoleLabels, type DemoRole } from "@/utils/permissions"

export type PurchaseRequestInput = Pick<
  PurchaseRequest,
  | "item_name"
  | "item_code"
  | "quantity"
  | "unit"
  | "priority"
  | "requested_order_date"
  | "warehouse_deadline_date"
  | "production_contract_number"
  | "requester"
  | "purchasing_manager"
> & {
  notes?: string | null
}

export type CreateDeliveryOrderInput = {
  requestedOrderId: string
}

export type DeliveryOrderPatch = {
  order_info?: Partial<DeliveryOrder["order_info"]>
  product_details?: Partial<DeliveryOrder["product_details"]>
  sap_integration?: Partial<DeliveryOrder["sap_integration"]>
  logistics_shipping?: Partial<DeliveryOrder["logistics_shipping"]>
  warehouse_tracking?: Partial<DeliveryOrder["warehouse_tracking"]>
  finance_tax?: Partial<DeliveryOrder["finance_tax"]>
  personnel?: Partial<Personnel>
}

type DemoState = {
  selectedRole: DemoRole
  purchaseRequests: PurchaseRequest[]
  deliveryOrders: DeliveryOrder[]
  personnelTasks: TaskListItem[]
}

type DemoActions = {
  setSelectedRole: (role: DemoRole) => void
  createPurchaseRequest: (data: PurchaseRequestInput) => void
  updatePurchaseRequest: (id: string, patch: Partial<PurchaseRequest>) => void
  createDeliveryOrder: (data: CreateDeliveryOrderInput) => DeliveryOrder | null
  updateDeliveryOrder: (id: string, patch: DeliveryOrderPatch) => void
  updateTaskProgress: (taskOwnerRole: PersonnelRole, taskName: string, progress: number, deliveryOrderId: string, taskIndex?: number) => void
  startTask: (taskOwnerRole: PersonnelRole, taskName: string, deliveryOrderId: string, taskIndex?: number) => void
  completeTask: (taskOwnerRole: PersonnelRole, taskName: string, deliveryOrderId: string, taskIndex?: number) => void
  confirmWarehouseEntry: (deliveryOrderId: string, actualEntryDate?: string) => void
  resetDemoData: () => void
}

type DemoStore = DemoState & DemoActions

const initialData = buildInitialState()

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...initialData,
      selectedRole: "admin",
      setSelectedRole(role) {
        set({ selectedRole: normalizeDemoRole(role) })
      },
      createPurchaseRequest(data) {
        set((state) => ({
          purchaseRequests: [
            ...state.purchaseRequests,
            {
              ...data,
              requested_order_id: nextDemoCode("PR-DEMO", state.purchaseRequests.length),
              status: "NEW",
              adjusted_date: null,
              supplier_expected_delivery_date: null,
              expected_arrival_date: null,
              actual_warehouse_entry_date: null,
              delay_days: 0,
              notes: data.notes ?? null,
            },
          ],
        }))
      },
      updatePurchaseRequest(id, patch) {
        set((state) => ({
          purchaseRequests: state.purchaseRequests.map((request) =>
            request.requested_order_id === id ? { ...request, ...patch } : request
          ),
        }))
      },
      createDeliveryOrder(data) {
        const request = get().purchaseRequests.find((item) => item.requested_order_id === data.requestedOrderId)
        if (!request || request.status !== "APPROVED") return null

        const orderNumber = nextDemoCode("DO-DEMO", get().deliveryOrders.length)
        const newOrder = buildDeliveryOrderFromRequest(request, orderNumber)

        set((state) => {
          const deliveryOrders = [...state.deliveryOrders, newOrder]
          return {
            purchaseRequests: state.purchaseRequests.map((item) =>
              item.requested_order_id === data.requestedOrderId ? { ...item, status: "PROCESSING" } : item
            ),
            deliveryOrders,
            personnelTasks: buildTasks(deliveryOrders),
          }
        })

        return newOrder
      },
      updateDeliveryOrder(id, patch) {
        set((state) => {
          const deliveryOrders = state.deliveryOrders.map((order) =>
            order.order_info.order_number === id ? mergeDeliveryOrderPatch(order, patch) : order
          )

          return {
            deliveryOrders,
            personnelTasks: buildTasks(deliveryOrders),
          }
        })
      },
      updateTaskProgress(taskOwnerRole, taskName, progress, deliveryOrderId, taskIndex) {
        if (!deliveryOrderId) return

        set((state) => {
          const normalizedProgress = clampProgress(progress)
          const deliveryOrders = state.deliveryOrders.map((order) =>
            order.order_info.order_number !== deliveryOrderId
              ? order
              : updateOrderTask(order, taskOwnerRole, taskName, taskIndex, (task) => ({
                ...task,
                progress: normalizedProgress,
                completed_at: normalizedProgress >= 100 ? todayIso() : null,
              }))
          )

          return {
            deliveryOrders,
            personnelTasks: buildTasks(deliveryOrders),
          }
        })
      },
      startTask(taskOwnerRole, taskName, deliveryOrderId, taskIndex) {
        if (!deliveryOrderId) return

        set((state) => {
          const deliveryOrders = state.deliveryOrders.map((order) =>
            order.order_info.order_number !== deliveryOrderId
              ? order
              : updateOrderTask(order, taskOwnerRole, taskName, taskIndex, (task) => ({
                ...task,
                progress: task.progress > 0 && task.progress < 100 ? task.progress : 50,
                completed_at: null,
              }))
          )

          return {
            deliveryOrders,
            personnelTasks: buildTasks(deliveryOrders),
          }
        })
      },
      completeTask(taskOwnerRole, taskName, deliveryOrderId, taskIndex) {
        if (!deliveryOrderId) return

        set((state) => {
          const deliveryOrders = state.deliveryOrders.map((order) =>
            order.order_info.order_number !== deliveryOrderId
              ? order
              : updateOrderTask(order, taskOwnerRole, taskName, taskIndex, (task) => ({
                ...task,
                progress: 100,
                completed_at: todayIso(),
              }))
          )

          return {
            deliveryOrders,
            personnelTasks: buildTasks(deliveryOrders),
          }
        })
      },
      confirmWarehouseEntry(deliveryOrderId, actualEntryDate = todayIso()) {
        set((state) => {
          const relatedOrder = state.deliveryOrders.find((order) => order.order_info.order_number === deliveryOrderId)
          const deliveryOrders: DeliveryOrder[] = state.deliveryOrders.map((order) =>
            order.order_info.order_number === deliveryOrderId
              ? {
                ...order,
                order_info: { ...order.order_info, status: "WAREHOUSE_RECEIVED" as const },
                warehouse_tracking: {
                  ...order.warehouse_tracking,
                  actual_entry_date: actualEntryDate,
                  delay_days: calculateDelayDays(order.warehouse_tracking.warehouse_deadline, actualEntryDate),
                },
              }
              : order
          )

          return {
            purchaseRequests: state.purchaseRequests.map((request) =>
              relatedOrder && request.requested_order_id === relatedOrder.order_info.request_code
                ? {
                  ...request,
                  actual_warehouse_entry_date: actualEntryDate,
                  status: "COMPLETED",
                  delay_days: calculateDelayDays(request.warehouse_deadline_date, actualEntryDate),
                }
                : request
            ),
            deliveryOrders,
            personnelTasks: buildTasks(deliveryOrders),
          }
        })
      },
      resetDemoData() {
        set({ ...buildInitialState(), selectedRole: "admin" })
      },
    }),
    {
      name: "factory-import-dashboard:demo-store",
      version: 4,
      migrate(persistedState, version) {
        if (!persistedState || typeof persistedState !== "object") return persistedState

        if (version < 3) {
          return {
            ...buildInitialState(),
            selectedRole: normalizeDemoRole((persistedState as Partial<DemoState>).selectedRole),
          }
        }

        return {
          ...persistedState,
          selectedRole: normalizeDemoRole((persistedState as Partial<DemoState>).selectedRole),
        }
      },
    }
  )
)

function buildInitialState(): DemoState {
  const deliveryOrders = structuredClone(initialDeliveryOrders)
  return {
    selectedRole: "admin",
    purchaseRequests: structuredClone(initialPurchaseRequests),
    deliveryOrders,
    personnelTasks: buildTasks(deliveryOrders),
  }
}

function buildTasks(deliveryOrders: DeliveryOrder[]): TaskListItem[] {
  return deliveryOrders.flatMap((order) =>
    Object.entries(order.personnel).flatMap(([role, member]) =>
      member.tasks.map((task, taskIndex) => ({
        ...task,
        order_number: order.order_info.order_number,
        po_number: order.sap_integration.po_number,
        role: role as PersonnelRole,
        task_index: taskIndex,
        role_label: personnelRoleLabels[role as PersonnelRole],
        assignee: member.assignee,
      }))
    )
  )
}

function buildDeliveryOrderFromRequest(request: PurchaseRequest, orderNumber: string): DeliveryOrder {
  return {
    order_info: {
      request_code: request.requested_order_id,
      order_number: orderNumber,
      tracking_number: "Đang cập nhật",
      purchase_contract_number: `PUR-DEMO-${request.requested_order_id}`,
      status: "PO_CREATED",
      notes: "DO demo được tạo từ yêu cầu mua hàng đã duyệt.",
      xnk_notes: "Chưa có ghi chú XNK.",
    },
    product_details: {
      item_name_requested: request.item_name,
      unit: request.unit,
      quantity: request.quantity,
      lot_number: `LOT-DEMO-${request.item_code}`,
      lot_unit_quantity: request.quantity,
      lot_unit_type: request.unit,
      packaging_type: "Đang cập nhật",
    },
    sap_integration: {
      supplier_code: "Đang cập nhật",
      actual_item_code: request.item_code,
      raw_date: todayIso(),
      po_number: `SAP-PO-${orderNumber.replace(/\D/g, "")}`,
    },
    logistics_shipping: {
      incoterms: "Đang cập nhật",
      shipping_method: "Đang cập nhật",
      shipping_line: "Đang cập nhật",
      vessel_code: "Đang cập nhật",
      port_of_departure: "Đang cập nhật",
      port_of_destination: "Đang cập nhật",
      documents_list: [],
      cut_off_date: request.requested_order_date,
      etd_planned: request.supplier_expected_delivery_date ?? request.requested_order_date,
      etd_actual: null,
      eta_planned: request.expected_arrival_date ?? request.warehouse_deadline_date,
      eta_actual: null,
    },
    warehouse_tracking: {
      production_ready_date: request.requested_order_date,
      warehouse_deadline: request.warehouse_deadline_date,
      planned_entry_date: request.expected_arrival_date ?? request.warehouse_deadline_date,
      actual_entry_date: null,
      delay_days: request.delay_days,
    },
    finance_tax: {
      import_tax_rate: "Đang cập nhật",
      tax_amount: 0,
      tax_payment_deadline: request.warehouse_deadline_date,
      insurance: "Đang cập nhật",
    },
    personnel: {
      pic_manager: {
        assignee: request.purchasing_manager,
        tasks: [
          {
            task_name: "Theo dõi tiến độ mua hàng",
            created_by: "Quản trị viên demo",
            created_at: todayIso(),
            assigned_at: todayIso(),
            progress: 0,
            completed_at: null,
          },
        ],
      },
      sale_staff: { assignee: "Chưa phân công", tasks: [] },
      port_officer: { assignee: "Chưa phân công", tasks: [] },
      customs_officer: { assignee: "Chưa phân công", tasks: [] },
    },
  }
}

function mergeDeliveryOrderPatch(order: DeliveryOrder, patch: DeliveryOrderPatch): DeliveryOrder {
  return {
    ...order,
    order_info: { ...order.order_info, ...patch.order_info },
    product_details: { ...order.product_details, ...patch.product_details },
    sap_integration: { ...order.sap_integration, ...patch.sap_integration },
    logistics_shipping: { ...order.logistics_shipping, ...patch.logistics_shipping },
    warehouse_tracking: { ...order.warehouse_tracking, ...patch.warehouse_tracking },
    finance_tax: { ...order.finance_tax, ...patch.finance_tax },
    personnel: { ...order.personnel, ...patch.personnel },
  }
}

function updateOrderTask(
  order: DeliveryOrder,
  role: PersonnelRole,
  taskName: string,
  taskIndex: number | undefined,
  updater: (task: PersonnelTask) => PersonnelTask
): DeliveryOrder {
  return {
    ...order,
    personnel: {
      ...order.personnel,
      [role]: {
        ...order.personnel[role],
        tasks: order.personnel[role].tasks.map((task, index) =>
          (taskIndex === undefined ? task.task_name === taskName : index === taskIndex && task.task_name === taskName)
            ? updater(task)
            : task
        ),
      },
    },
  }
}

function nextDemoCode(prefix: string, total: number) {
  return `${prefix}-${String(total + 1).padStart(4, "0")}`
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, progress))
}

function calculateDelayDays(deadline: string, entryDate: string) {
  const deadlineTime = new Date(deadline).getTime()
  const entryTime = new Date(entryDate).getTime()
  const diffDays = Math.ceil((entryTime - deadlineTime) / 86_400_000)
  return Math.max(0, diffDays)
}
