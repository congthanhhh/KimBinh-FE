import { create } from "zustand"
import { persist } from "zustand/middleware"

import { deliveryOrdersApi, efmsApi, personnelTasksApi, purchaseOrdersApi, purchaseRequestsApi, readMockDb, resetMockDb } from "@/mock"
import type {
  CreateDeliveryOrderInput as ApiCreateDeliveryOrderInput,
  UpdateDeliveryOrderInput,
} from "@/mock/api/delivery-orders.api"
import type {
  CreateEfmsContainerInput,
  CreateEfmsHouseBillInput,
  UpdateEfmsContainerInput,
  UpdateEfmsHouseBillInput,
} from "@/mock/api/efms.api"
import type { CreatePurchaseOrderInput } from "@/mock/api/purchase-orders.api"
import type { UpdatePurchaseRequestInput } from "@/mock/api/purchase-requests.api"
import type { AppUser, MockActor, Partner } from "@/types/common.types"
import type { DeliveryOrderDetail } from "@/types/delivery-order.types"
import type { EfmsDetail } from "@/types/efms.types"
import type { PersonnelAssignment, PersonnelTaskRecord } from "@/types/personnel-task.types"
import type { PurchaseOrderDetail } from "@/types/purchase-order.types"
import type { PurchaseRequest as ApiPurchaseRequest, PurchaseRequestWithPoSummary } from "@/types/purchase-request.types"
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
  purchase_order_ids?: string[]
  adjusted_date?: string | null
  supplier_expected_delivery_date?: string | null
  expected_arrival_date?: string | null
  requester_user_id?: string | null
  purchasing_manager_user_id?: string | null
  notes?: string | null
}

export type CreateDeliveryOrderInput = {
  requestedOrderId: string
}

export type CreateFullDeliveryOrderInput = {
  purchase_order_ids: string[]
  purchase_request_ids: string[]
  inline_purchase_order?: CreatePurchaseOrderInput | null
  order_info: {
    delivery_order_number: string
    tracking_number?: string | null
    purchase_contract_number?: string | null
    status: "DRAFT" | "PO_CREATED" | "IN_TRANSIT" | "CUSTOMS_PROCESSING" | "WAREHOUSE_RECEIVED" | "COMPLETED" | "DELAYED"
    notes?: string | null
    xnk_notes?: string | null
  }
  product_details: {
    item_name_requested: string
    unit: string
    quantity: number
    lot_number?: string | null
    lot_unit_quantity?: number | null
    lot_unit_type?: string | null
    packaging_type?: string | null
    gross_weight?: number | null
    cbm?: number | null
    commodity_group?: string | null
  }
  sap_integration: {
    supplier_code?: string | null
    actual_item_code?: string | null
    raw_date?: string | null
    po_number?: string | null
  }
  logistics_shipping: {
    incoterms?: string | null
    shipping_method?: string | null
    shipping_line?: string | null
    shipping_line_partner_id?: string | null
    coloader_name?: string | null
    coloader_partner_id?: string | null
    agent_name?: string | null
    agent_partner_id?: string | null
    vessel_code?: string | null
    vessel_name?: string | null
    voyage_no?: string | null
    booking_number?: string | null
    service_type?: string | null
    mbl_number?: string | null
    mbl_type?: "COPY" | "ORIGINAL" | "SEAWAY_BILL" | "SURRENDERED" | null
    port_of_departure?: string | null
    port_of_loading?: string | null
    port_of_discharge?: string | null
    port_of_destination?: string | null
    freight_term?: "PREPAID" | "COLLECT" | null
    shipment_type?: "FREEHAND" | "NOMINATED" | null
    person_in_charge_name?: string | null
    person_in_charge_user_id?: string | null
    commodity_group?: string | null
    documents_list: string[]
    cut_off_date?: string | null
    etd_planned?: string | null
    etd_actual?: string | null
    etr_planned?: string | null
    eta_planned?: string | null
    eta_actual?: string | null
    atd_actual?: string | null
    ata_actual?: string | null
  }
  warehouse_tracking: {
    production_ready_date?: string | null
    warehouse_deadline?: string | null
    planned_entry_date?: string | null
    actual_entry_date?: string | null
  }
  finance_tax: {
    import_tax_rate?: number | null
    tax_amount?: number | null
    currency_code: string
    tax_payment_deadline?: string | null
    insurance?: string | null
  }
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

export type HouseBillInput = Omit<CreateEfmsHouseBillInput, "delivery_order_id">
export type ContainerInput = Omit<CreateEfmsContainerInput, "delivery_order_id">

type DemoState = {
  selectedRole: DemoRole
  purchaseRequests: PurchaseRequest[]
  deliveryOrders: DeliveryOrder[]
  personnelTasks: TaskListItem[]
  purchaseOrderDetailsById: Record<string, PurchaseOrderDetail>
  efmsDetailsByDeliveryOrderId: Record<string, EfmsDetail>
  referenceUsers: AppUser[]
  referencePartners: Partner[]
  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

type DemoActions = {
  initializeDemoData: () => Promise<void>
  reloadDemoData: () => Promise<void>
  setSelectedRole: (role: DemoRole) => void
  createPurchaseRequest: (data: PurchaseRequestInput) => Promise<void>
  updatePurchaseRequest: (id: string, patch: Partial<PurchaseRequest>) => Promise<void>
  createPurchaseOrder: (data: CreatePurchaseOrderInput) => Promise<PurchaseOrderDetail | null>
  createDeliveryOrder: (data: CreateDeliveryOrderInput) => Promise<DeliveryOrder | null>
  createFullDeliveryOrder: (data: CreateFullDeliveryOrderInput) => Promise<DeliveryOrder | null>
  updateDeliveryOrder: (id: string, patch: DeliveryOrderPatch) => Promise<void>
  createHouseBill: (deliveryOrderId: string, data: HouseBillInput) => Promise<void>
  updateHouseBill: (deliveryOrderId: string, houseBillId: string, patch: UpdateEfmsHouseBillInput) => Promise<void>
  deleteHouseBill: (deliveryOrderId: string, houseBillId: string) => Promise<void>
  createContainer: (deliveryOrderId: string, data: ContainerInput) => Promise<void>
  updateContainer: (deliveryOrderId: string, containerId: string, patch: UpdateEfmsContainerInput) => Promise<void>
  deleteContainer: (deliveryOrderId: string, containerId: string) => Promise<void>
  updateTaskProgress: (
    taskOwnerRole: PersonnelRole,
    taskName: string,
    progress: number,
    deliveryOrderId: string,
    taskIndex?: number
  ) => Promise<void>
  startTask: (taskOwnerRole: PersonnelRole, taskName: string, deliveryOrderId: string, taskIndex?: number) => Promise<void>
  completeTask: (taskOwnerRole: PersonnelRole, taskName: string, deliveryOrderId: string, taskIndex?: number) => Promise<void>
  confirmWarehouseEntry: (deliveryOrderId: string, actualEntryDate?: string) => Promise<void>
  loadPurchaseOrderDetail: (idOrOrderNumber: string) => Promise<void>
  loadEfmsDetail: (deliveryOrderId: string) => Promise<void>
  loadReferenceData: () => Promise<void>
  resetDemoData: () => Promise<void>
}

type DemoStore = DemoState & DemoActions

const emptyPersonnel = (): Personnel => ({
  pic_manager: { assignee: "Unassigned", tasks: [] },
  sale_staff: { assignee: "Unassigned", tasks: [] },
  port_officer: { assignee: "Unassigned", tasks: [] },
  customs_officer: { assignee: "Unassigned", tasks: [] },
})

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      selectedRole: "admin",
      purchaseRequests: [],
      deliveryOrders: [],
      personnelTasks: [],
      purchaseOrderDetailsById: {},
      efmsDetailsByDeliveryOrderId: {},
      referenceUsers: [],
      referencePartners: [],
      isInitialized: false,
      isLoading: false,
      error: null,
      async initializeDemoData() {
        if (get().isInitialized || get().isLoading) return
        await loadStoreData(set, get)
      },
      async reloadDemoData() {
        await loadStoreData(set, get)
      },
      setSelectedRole(role) {
        set({ selectedRole: normalizeDemoRole(role) })
      },
      async createPurchaseRequest(data) {
        try {
          const actor = getActor(get().selectedRole)
          const nextId = nextDemoCode("PR-DEMO", get().purchaseRequests.length)

          await purchaseRequestsApi.create(
            {
              ...data,
              requested_order_id: nextId,
              purchase_order_ids: data.purchase_order_ids ?? [],
              status: "NEW",
              adjusted_date: data.adjusted_date ?? null,
              supplier_expected_delivery_date: data.supplier_expected_delivery_date ?? null,
              expected_arrival_date: data.expected_arrival_date ?? null,
              actual_warehouse_entry_date: null,
              notes: data.notes ?? null,
              requester_user_id: data.requester_user_id ?? null,
              purchasing_manager_user_id: data.purchasing_manager_user_id ?? null,
              created_by_user_id: actor.user_id ?? null,
            },
            actor
          )
          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async updatePurchaseRequest(id, patch) {
        try {
          await purchaseRequestsApi.update(id, toPurchaseRequestPatch(patch), getActor(get().selectedRole))
          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async createPurchaseOrder(data) {
        try {
          const actor = getActor(get().selectedRole)
          const created = await purchaseOrdersApi.create(
            {
              ...data,
              created_by_user_id: data.created_by_user_id ?? actor.user_id ?? null,
            },
            actor
          )
          await get().reloadDemoData()
          const detail = await purchaseOrdersApi.getDetail(created.id, actor)
          set({
            purchaseOrderDetailsById: {
              ...get().purchaseOrderDetailsById,
              [detail.id]: detail,
            },
            error: null,
          })
          return detail
        } catch (error) {
          set({ error: getErrorMessage(error) })
          return null
        }
      },
      async createDeliveryOrder(data) {
        try {
          const request = await purchaseRequestsApi.get(data.requestedOrderId, getActor(get().selectedRole))
          const db = readMockDb()
          const firstLink = db.purchase_order_purchase_requests.find((link) => !link.deleted_at && link.purchase_request_id === request.id)
          if (request.status !== "APPROVED" || !firstLink) return null

          const actor = getActor(get().selectedRole)
          const deliveryOrder = await deliveryOrdersApi.create(
            buildDeliveryOrderInput(request, firstLink.purchase_order_id, get().deliveryOrders.length, actor),
            actor
          )

          await seedDeliveryOrderModules(deliveryOrder.id, request, actor)
          await purchaseRequestsApi.update(request.requested_order_id, { status: "PROCESSING" }, actor)
          await get().reloadDemoData()

          return get().deliveryOrders.find((order) => order.order_info.order_number === deliveryOrder.delivery_order_number) ?? null
        } catch (error) {
          set({ error: getErrorMessage(error) })
          return null
        }
      },
      async createFullDeliveryOrder(data) {
        try {
          const actor = getActor(get().selectedRole)
          const requests = await Promise.all(data.purchase_request_ids.map((id) => purchaseRequestsApi.get(id, actor)))
          let purchaseOrderIds = uniqueDefined(data.purchase_order_ids)

          if (purchaseOrderIds.length === 0 && data.inline_purchase_order) {
            const createdPurchaseOrder = await purchaseOrdersApi.create(data.inline_purchase_order, actor)
            purchaseOrderIds = [createdPurchaseOrder.id]
          }

          if (purchaseOrderIds.length === 0) {
            throw new Error("Delivery Order cần có Purchase Order trước khi tạo.")
          }

          for (const request of requests) {
            const db = readMockDb()
            const currentPoIds = db.purchase_order_purchase_requests
              .filter((link) => !link.deleted_at && link.purchase_request_id === request.id)
              .map((link) => link.purchase_order_id)
            await purchaseRequestsApi.update(request.id, { purchase_order_ids: uniqueDefined([...currentPoIds, ...purchaseOrderIds]) }, actor)
          }

          const refreshedRequests = await Promise.all(requests.map((request) => purchaseRequestsApi.get(request.id, actor)))
          const deliveryOrder = await deliveryOrdersApi.create(
            {
              delivery_order_number: data.order_info.delivery_order_number,
              purchase_order_ids: purchaseOrderIds,
              items: refreshedRequests.map((request, index) => ({
                purchase_order_id: purchaseOrderIds[0],
                purchase_request_id: request.id,
                item_name_requested: index === 0 ? data.product_details.item_name_requested : request.item_name,
                unit: index === 0 ? data.product_details.unit : request.unit,
                quantity: index === 0 ? data.product_details.quantity : request.quantity,
                lot_number: index === 0 ? data.product_details.lot_number ?? null : `LOT-${request.item_code}`,
                lot_unit_quantity: index === 0 ? data.product_details.lot_unit_quantity ?? null : request.quantity,
                lot_unit_type: index === 0 ? data.product_details.lot_unit_type ?? null : request.unit,
                packaging_type: index === 0 ? data.product_details.packaging_type ?? null : null,
                gross_weight: index === 0 ? data.product_details.gross_weight ?? null : null,
                cbm: index === 0 ? data.product_details.cbm ?? null : null,
                commodity_group: index === 0 ? data.product_details.commodity_group ?? null : null,
                created_by_user_id: actor.user_id ?? null,
              })),
              tracking_number: data.order_info.tracking_number ?? null,
              purchase_contract_number: data.order_info.purchase_contract_number ?? null,
              status: data.order_info.status,
              notes: data.order_info.notes ?? null,
              xnk_notes: data.order_info.xnk_notes ?? null,
              created_by_user_id: actor.user_id ?? null,
            },
            actor
          )

          await upsertDeliveryOrderModules(deliveryOrder.id, data, actor)
          for (const request of refreshedRequests) {
            if (!["COMPLETED", "CANCELLED"].includes(request.status)) {
              await purchaseRequestsApi.update(request.id, { status: "PROCESSING" }, actor)
            }
          }
          await get().reloadDemoData()

          return get().deliveryOrders.find((order) => order.id === deliveryOrder.id) ?? null
        } catch (error) {
          set({ error: getErrorMessage(error) })
          return null
        }
      },
      async updateDeliveryOrder(id, patch) {
        try {
          const actor = getActor(get().selectedRole)
          const current = await deliveryOrdersApi.getDetail(id, actor)

          if (patch.order_info) {
            await deliveryOrdersApi.update(current.id, toDeliveryOrderPatch(patch.order_info), actor)
          }

          if (patch.product_details) {
            await deliveryOrdersApi.upsertProductDetails(current.id, {
              item_name_requested: patch.product_details.item_name_requested ?? current.product_details?.item_name_requested ?? "Unknown item",
              unit: patch.product_details.unit ?? current.product_details?.unit ?? "unit",
              quantity: patch.product_details.quantity ?? current.product_details?.quantity ?? 1,
              lot_number: patch.product_details.lot_number ?? current.product_details?.lot_number ?? null,
              lot_unit_quantity: patch.product_details.lot_unit_quantity ?? current.product_details?.lot_unit_quantity ?? null,
              lot_unit_type: patch.product_details.lot_unit_type ?? current.product_details?.lot_unit_type ?? null,
              packaging_type: patch.product_details.packaging_type ?? current.product_details?.packaging_type ?? null,
              gross_weight: current.product_details?.gross_weight ?? null,
              cbm: current.product_details?.cbm ?? null,
              commodity_group: current.product_details?.commodity_group ?? null,
            }, actor)
          }

          if (patch.sap_integration) {
            await deliveryOrdersApi.upsertSapIntegration(current.id, {
              supplier_code: patch.sap_integration.supplier_code ?? current.sap_integration?.supplier_code ?? null,
              actual_item_code: patch.sap_integration.actual_item_code ?? current.sap_integration?.actual_item_code ?? null,
              raw_date: patch.sap_integration.raw_date ?? current.sap_integration?.raw_date ?? null,
              po_number: patch.sap_integration.po_number ?? current.sap_integration?.po_number ?? current.purchase_orders[0]?.order_number ?? null,
            }, actor)
          }

          if (patch.logistics_shipping) {
            await deliveryOrdersApi.upsertLogisticsShipping(current.id, {
              incoterms: patch.logistics_shipping.incoterms ?? current.logistics_shipping?.incoterms ?? null,
              shipping_method: patch.logistics_shipping.shipping_method ?? current.logistics_shipping?.shipping_method ?? null,
              shipping_line: patch.logistics_shipping.shipping_line ?? current.logistics_shipping?.shipping_line ?? null,
              shipping_line_partner_id: current.logistics_shipping?.shipping_line_partner_id ?? null,
              coloader_name: current.logistics_shipping?.coloader_name ?? null,
              coloader_partner_id: current.logistics_shipping?.coloader_partner_id ?? null,
              agent_name: current.logistics_shipping?.agent_name ?? null,
              agent_partner_id: current.logistics_shipping?.agent_partner_id ?? null,
              vessel_code: patch.logistics_shipping.vessel_code ?? current.logistics_shipping?.vessel_code ?? null,
              vessel_name: current.logistics_shipping?.vessel_name ?? null,
              voyage_no: current.logistics_shipping?.voyage_no ?? null,
              booking_number: current.logistics_shipping?.booking_number ?? null,
              service_type: current.logistics_shipping?.service_type ?? null,
              mbl_number: current.logistics_shipping?.mbl_number ?? null,
              mbl_type: current.logistics_shipping?.mbl_type ?? null,
              port_of_departure: patch.logistics_shipping.port_of_departure ?? current.logistics_shipping?.port_of_departure ?? null,
              port_of_loading: current.logistics_shipping?.port_of_loading ?? null,
              port_of_discharge: current.logistics_shipping?.port_of_discharge ?? null,
              port_of_destination: patch.logistics_shipping.port_of_destination ?? current.logistics_shipping?.port_of_destination ?? null,
              freight_term: current.logistics_shipping?.freight_term ?? null,
              shipment_type: current.logistics_shipping?.shipment_type ?? null,
              person_in_charge_name: current.logistics_shipping?.person_in_charge_name ?? null,
              person_in_charge_user_id: current.logistics_shipping?.person_in_charge_user_id ?? null,
              commodity_group: current.logistics_shipping?.commodity_group ?? null,
              documents_list: patch.logistics_shipping.documents_list ?? current.logistics_shipping?.documents_list ?? [],
              cut_off_date: patch.logistics_shipping.cut_off_date ?? current.logistics_shipping?.cut_off_date ?? null,
              etd_planned: patch.logistics_shipping.etd_planned ?? current.logistics_shipping?.etd_planned ?? null,
              etd_actual: patch.logistics_shipping.etd_actual ?? current.logistics_shipping?.etd_actual ?? null,
              etr_planned: current.logistics_shipping?.etr_planned ?? null,
              eta_planned: patch.logistics_shipping.eta_planned ?? current.logistics_shipping?.eta_planned ?? null,
              eta_actual: patch.logistics_shipping.eta_actual ?? current.logistics_shipping?.eta_actual ?? null,
              atd_actual: current.logistics_shipping?.atd_actual ?? null,
              ata_actual: current.logistics_shipping?.ata_actual ?? null,
            }, actor)
          }

          if (patch.warehouse_tracking) {
            await deliveryOrdersApi.upsertWarehouseTracking(current.id, {
              production_ready_date: patch.warehouse_tracking.production_ready_date ?? current.warehouse_tracking?.production_ready_date ?? null,
              warehouse_deadline: patch.warehouse_tracking.warehouse_deadline ?? current.warehouse_tracking?.warehouse_deadline ?? null,
              planned_entry_date: patch.warehouse_tracking.planned_entry_date ?? current.warehouse_tracking?.planned_entry_date ?? null,
              actual_entry_date: patch.warehouse_tracking.actual_entry_date ?? current.warehouse_tracking?.actual_entry_date ?? null,
            }, actor)
          }

          if (patch.finance_tax) {
            await deliveryOrdersApi.upsertFinanceTax(current.id, {
              import_tax_rate: normalizeTaxRate(patch.finance_tax.import_tax_rate ?? current.finance_tax?.import_tax_rate ?? null),
              tax_amount: patch.finance_tax.tax_amount ?? current.finance_tax?.tax_amount ?? null,
              currency_code: current.finance_tax?.currency_code ?? "VND",
              tax_payment_deadline: patch.finance_tax.tax_payment_deadline ?? current.finance_tax?.tax_payment_deadline ?? null,
              insurance: patch.finance_tax.insurance ?? current.finance_tax?.insurance ?? null,
            }, actor)
          }

          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async updateTaskProgress(taskOwnerRole, taskName, progress, deliveryOrderId, taskIndex) {
        try {
          await updateTask(taskOwnerRole, taskName, deliveryOrderId, taskIndex, clampProgress(progress), getActor(get().selectedRole))
          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async startTask(taskOwnerRole, taskName, deliveryOrderId, taskIndex) {
        try {
          const task = await findTask(taskOwnerRole, taskName, deliveryOrderId, taskIndex, getActor(get().selectedRole))
          const nextProgress = task.progress > 0 && task.progress < 100 ? task.progress : 50
          await personnelTasksApi.updateTask(task.id, { progress: nextProgress, completed_at: null }, getActor(get().selectedRole))
          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async completeTask(taskOwnerRole, taskName, deliveryOrderId, taskIndex) {
        try {
          await updateTask(taskOwnerRole, taskName, deliveryOrderId, taskIndex, 100, getActor(get().selectedRole), nowIso())
          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async confirmWarehouseEntry(deliveryOrderId, actualEntryDate = todayIso()) {
        try {
          const actor = getActor(get().selectedRole)
          const order = await deliveryOrdersApi.getDetail(deliveryOrderId, actor)
          await deliveryOrdersApi.upsertWarehouseTracking(order.id, {
            production_ready_date: order.warehouse_tracking?.production_ready_date ?? null,
            warehouse_deadline: order.warehouse_tracking?.warehouse_deadline ?? null,
            planned_entry_date: order.warehouse_tracking?.planned_entry_date ?? actualEntryDate,
            actual_entry_date: actualEntryDate,
          }, actor)
          await deliveryOrdersApi.update(order.id, { status: "WAREHOUSE_RECEIVED" }, actor)
          for (const request of order.purchase_requests) {
            await purchaseRequestsApi.update(request.id, {
              status: "COMPLETED",
              actual_warehouse_entry_date: actualEntryDate,
            }, actor)
          }
          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async loadPurchaseOrderDetail(idOrOrderNumber) {
        try {
          const detail = await purchaseOrdersApi.getDetail(idOrOrderNumber, getActor(get().selectedRole))
          set({
            purchaseOrderDetailsById: {
              ...get().purchaseOrderDetailsById,
              [detail.id]: detail,
            },
            error: null,
          })
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async loadEfmsDetail(deliveryOrderId) {
        try {
          const detail = await efmsApi.getDetail(deliveryOrderId, getActor(get().selectedRole))
          set({
            efmsDetailsByDeliveryOrderId: {
              ...get().efmsDetailsByDeliveryOrderId,
              [deliveryOrderId]: detail,
            },
            error: null,
          })
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async createHouseBill(deliveryOrderId, data) {
        try {
          const actor = getActor(get().selectedRole)
          await efmsApi.houseBills.create({ ...data, delivery_order_id: deliveryOrderId }, actor)
          await get().loadEfmsDetail(deliveryOrderId)
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async updateHouseBill(deliveryOrderId, houseBillId, patch) {
        try {
          await efmsApi.houseBills.update(houseBillId, patch, getActor(get().selectedRole))
          await get().loadEfmsDetail(deliveryOrderId)
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async deleteHouseBill(deliveryOrderId, houseBillId) {
        try {
          await efmsApi.houseBills.delete(houseBillId, getActor(get().selectedRole))
          await get().loadEfmsDetail(deliveryOrderId)
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async createContainer(deliveryOrderId, data) {
        try {
          const actor = getActor(get().selectedRole)
          await efmsApi.containers.create({ ...data, delivery_order_id: deliveryOrderId }, actor)
          await get().loadEfmsDetail(deliveryOrderId)
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async updateContainer(deliveryOrderId, containerId, patch) {
        try {
          await efmsApi.containers.update(containerId, patch, getActor(get().selectedRole))
          await get().loadEfmsDetail(deliveryOrderId)
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async deleteContainer(deliveryOrderId, containerId) {
        try {
          await efmsApi.containers.delete(containerId, getActor(get().selectedRole))
          await get().loadEfmsDetail(deliveryOrderId)
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async loadReferenceData() {
        try {
          const db = readMockDb()
          set({
            referenceUsers: db.app_users.filter((user) => !user.deleted_at),
            referencePartners: db.partners.filter((partner) => !partner.deleted_at),
            error: null,
          })
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
      async resetDemoData() {
        try {
          resetMockDb()
          await get().reloadDemoData()
        } catch (error) {
          set({ error: getErrorMessage(error) })
        }
      },
    }),
    {
      name: "factory-import-dashboard:demo-store",
      version: 5,
      partialize: (state) => ({ selectedRole: state.selectedRole }),
      migrate(persistedState) {
        if (!persistedState || typeof persistedState !== "object") return { selectedRole: "admin" }
        return {
          selectedRole: normalizeDemoRole((persistedState as Partial<DemoState>).selectedRole),
        }
      },
    }
  )
)

async function loadStoreData(
  set: (state: Partial<DemoState>) => void,
  get: () => DemoStore
) {
  set({ isLoading: true, error: null })
  try {
    const actor = getActor(get().selectedRole)
    const purchaseRequests = await purchaseRequestsApi.getListWithPoSummary(actor)
    const purchaseOrderRows = await purchaseOrdersApi.list(actor)
    const deliveryOrderRows = await deliveryOrdersApi.list(actor)
    const deliveryOrderDetails = await Promise.all(deliveryOrderRows.map((order) => deliveryOrdersApi.getDetail(order.id, actor)))
    const deliveryOrders = deliveryOrderDetails.map(toDeliveryOrderView)
    const purchaseOrderIds = uniqueDefined([
      ...purchaseOrderRows.map((order) => order.id),
      ...purchaseRequests.flatMap((request) => request.purchase_orders.map((order) => order.id)),
      ...deliveryOrderDetails.flatMap((order) => order.purchase_orders.map((purchaseOrder) => purchaseOrder.id)),
    ])
    const purchaseOrderDetails = await Promise.all(
      purchaseOrderIds.map((id) => purchaseOrdersApi.getDetail(id, actor).catch(() => null))
    )
    const efmsEntries = await Promise.all(
      deliveryOrderDetails.map((order) =>
        efmsApi.getDetail(order.id, actor).then((detail) => [order.id, detail] as const).catch(() => null)
      )
    )
    const referenceDb = readMockDb()

    set({
      purchaseRequests: purchaseRequests.map(toPurchaseRequestView),
      deliveryOrders,
      personnelTasks: buildTasks(deliveryOrders),
      purchaseOrderDetailsById: Object.fromEntries(
        purchaseOrderDetails.filter((detail): detail is PurchaseOrderDetail => detail !== null).map((detail) => [detail.id, detail])
      ),
      efmsDetailsByDeliveryOrderId: Object.fromEntries(
        efmsEntries.filter((entry): entry is readonly [string, EfmsDetail] => entry !== null)
      ),
      referenceUsers: referenceDb.app_users.filter((user) => !user.deleted_at),
      referencePartners: referenceDb.partners.filter((partner) => !partner.deleted_at),
      isInitialized: true,
      isLoading: false,
      error: null,
    })
  } catch (error) {
    set({ isInitialized: true, isLoading: false, error: getErrorMessage(error) })
  }
}

function toPurchaseRequestView(request: PurchaseRequestWithPoSummary): PurchaseRequest {
  return {
    id: request.id,
    purchase_order_ids: request.purchase_orders.map((order) => order.id),
    item_name: request.item_name,
    item_code: request.item_code,
    priority: request.priority,
    unit: request.unit,
    requested_order_id: request.requested_order_id,
    quantity: request.quantity,
    requested_order_date: request.requested_order_date,
    adjusted_date: request.adjusted_date ?? null,
    notes: request.notes ?? null,
    purchasing_manager: request.purchasing_manager ?? "Unassigned",
    purchasing_manager_user_id: request.purchasing_manager_user_id ?? null,
    production_contract_number: request.production_contract_number ?? "",
    status: request.status,
    warehouse_deadline_date: request.warehouse_deadline_date,
    actual_warehouse_entry_date: request.actual_warehouse_entry_date ?? null,
    supplier_expected_delivery_date: request.supplier_expected_delivery_date ?? null,
    expected_arrival_date: request.expected_arrival_date ?? null,
    delay_days: request.delay_days,
    requester: request.requester,
    requester_user_id: request.requester_user_id ?? null,
    created_by_user_id: request.created_by_user_id ?? null,
    created_at: request.created_at,
    updated_at: request.updated_at,
    purchase_orders: request.purchase_orders,
    purchase_order: request.purchase_orders[0] ?? null,
  }
}

function toDeliveryOrderView(order: DeliveryOrderDetail): DeliveryOrder {
  const requestCodes = order.purchase_requests.map((request) => request.requested_order_id)
  const primaryPurchaseOrder = order.purchase_orders[0] ?? null
  return {
    id: order.id,
    purchase_order_ids: order.purchase_orders.map((purchaseOrder) => purchaseOrder.id),
    purchase_request_ids: order.purchase_requests.map((request) => request.id),
    purchase_orders: order.purchase_orders,
    purchase_requests: order.purchase_requests.map((request) => ({
      ...toPurchaseRequestView({ ...request, purchase_orders: [] }),
      purchase_order_ids: [],
      purchase_orders: [],
      purchase_order: null,
    })),
    created_by_user_id: order.created_by_user_id ?? null,
    created_at: order.created_at,
    updated_at: order.updated_at,
    order_info: {
      request_code: requestCodes.join(", "),
      request_codes: requestCodes,
      order_number: order.delivery_order_number,
      tracking_number: order.tracking_number ?? "",
      purchase_contract_number: order.purchase_contract_number ?? "",
      status: order.status,
      notes: order.notes ?? null,
      xnk_notes: order.xnk_notes ?? null,
    },
    product_details: {
      item_name_requested: order.product_details?.item_name_requested ?? "Unknown item",
      unit: order.product_details?.unit ?? "unit",
      quantity: order.product_details?.quantity ?? 0,
      lot_number: order.product_details?.lot_number ?? "",
      lot_unit_quantity: order.product_details?.lot_unit_quantity ?? 0,
      lot_unit_type: order.product_details?.lot_unit_type ?? "",
      packaging_type: order.product_details?.packaging_type ?? "",
      gross_weight: order.product_details?.gross_weight ?? null,
      cbm: order.product_details?.cbm ?? null,
      commodity_group: order.product_details?.commodity_group ?? null,
    },
    delivery_order_items: order.items,
    sap_integration: {
      supplier_code: order.sap_integration?.supplier_code ?? "",
      actual_item_code: order.sap_integration?.actual_item_code ?? "",
      raw_date: order.sap_integration?.raw_date ?? order.created_at.slice(0, 10),
      po_number: order.sap_integration?.po_number ?? primaryPurchaseOrder?.order_number ?? "",
    },
    logistics_shipping: {
      incoterms: order.logistics_shipping?.incoterms ?? "",
      shipping_method: order.logistics_shipping?.shipping_method ?? "",
      shipping_line: order.logistics_shipping?.shipping_line ?? "",
      shipping_line_partner_id: order.logistics_shipping?.shipping_line_partner_id ?? null,
      coloader_name: order.logistics_shipping?.coloader_name ?? null,
      coloader_partner_id: order.logistics_shipping?.coloader_partner_id ?? null,
      agent_name: order.logistics_shipping?.agent_name ?? null,
      agent_partner_id: order.logistics_shipping?.agent_partner_id ?? null,
      vessel_code: order.logistics_shipping?.vessel_code ?? "",
      vessel_name: order.logistics_shipping?.vessel_name ?? null,
      voyage_no: order.logistics_shipping?.voyage_no ?? null,
      booking_number: order.logistics_shipping?.booking_number ?? null,
      service_type: order.logistics_shipping?.service_type ?? null,
      mbl_number: order.logistics_shipping?.mbl_number ?? null,
      mbl_type: order.logistics_shipping?.mbl_type ?? null,
      port_of_departure: order.logistics_shipping?.port_of_departure ?? "",
      port_of_loading: order.logistics_shipping?.port_of_loading ?? null,
      port_of_discharge: order.logistics_shipping?.port_of_discharge ?? null,
      port_of_destination: order.logistics_shipping?.port_of_destination ?? "",
      freight_term: order.logistics_shipping?.freight_term ?? null,
      shipment_type: order.logistics_shipping?.shipment_type ?? null,
      person_in_charge_name: order.logistics_shipping?.person_in_charge_name ?? null,
      person_in_charge_user_id: order.logistics_shipping?.person_in_charge_user_id ?? null,
      commodity_group: order.logistics_shipping?.commodity_group ?? null,
      documents_list: order.logistics_shipping?.documents_list ?? [],
      cut_off_date: order.logistics_shipping?.cut_off_date ?? order.created_at.slice(0, 10),
      etd_planned: order.logistics_shipping?.etd_planned ?? order.created_at.slice(0, 10),
      etd_actual: order.logistics_shipping?.etd_actual ?? null,
      etr_planned: order.logistics_shipping?.etr_planned ?? null,
      eta_planned: order.logistics_shipping?.eta_planned ?? order.created_at.slice(0, 10),
      eta_actual: order.logistics_shipping?.eta_actual ?? null,
      atd_actual: order.logistics_shipping?.atd_actual ?? null,
      ata_actual: order.logistics_shipping?.ata_actual ?? null,
    },
    warehouse_tracking: {
      production_ready_date: order.warehouse_tracking?.production_ready_date ?? order.created_at.slice(0, 10),
      warehouse_deadline: order.warehouse_tracking?.warehouse_deadline ?? order.created_at.slice(0, 10),
      planned_entry_date: order.warehouse_tracking?.planned_entry_date ?? order.created_at.slice(0, 10),
      actual_entry_date: order.warehouse_tracking?.actual_entry_date ?? null,
      delay_days: order.warehouse_tracking?.delay_days ?? 0,
    },
    finance_tax: {
      import_tax_rate: formatTaxRate(order.finance_tax?.import_tax_rate),
      tax_amount: order.finance_tax?.tax_amount ?? 0,
      currency_code: order.finance_tax?.currency_code ?? "VND",
      tax_payment_deadline: order.finance_tax?.tax_payment_deadline ?? order.created_at.slice(0, 10),
      insurance: order.finance_tax?.insurance ?? "",
    },
    personnel: toPersonnelView(order.personnel_assignments, order.personnel_tasks),
    customs_clearance: order.customs_clearance,
    delivery_tracking: order.delivery_tracking,
    process_milestones: order.process_milestones,
  }
}

function toPersonnelView(assignments: PersonnelAssignment[], tasks: PersonnelTaskRecord[]): Personnel {
  const personnel = emptyPersonnel()

  for (const role of Object.keys(personnel) as PersonnelRole[]) {
    const assignment = assignments.find((item) => item.role_key === role)
    const roleTasks = tasks.filter((task) => task.role_key === role)

    personnel[role] = {
      assignee: assignment?.assignee_name ?? "Unassigned",
      assignee_user_id: assignment?.assignee_user_id ?? null,
      assigned_by_user_id: assignment?.assigned_by_user_id ?? null,
      tasks: roleTasks.map(toPersonnelTaskView),
    }
  }

  return personnel
}

function toPersonnelTaskView(task: PersonnelTaskRecord): PersonnelTask {
  return {
    id: task.id,
    task_name: task.task_name,
    created_by: task.created_by_name ?? task.created_by_user_id ?? "System",
    created_by_user_id: task.created_by_user_id ?? null,
    created_at: task.created_at,
    assigned_at: task.assigned_at ?? null,
    progress: task.progress,
    completed_at: task.completed_at ?? null,
    notes: task.notes ?? null,
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
        assignee_user_id: member.assignee_user_id ?? null,
        assigned_by_user_id: member.assigned_by_user_id ?? null,
      }))
    )
  )
}

function buildDeliveryOrderInput(
  request: ApiPurchaseRequest,
  purchaseOrderId: string,
  existingCount: number,
  actor: MockActor
): ApiCreateDeliveryOrderInput {
  return {
    delivery_order_number: nextDemoCode("DO-DEMO", existingCount),
    purchase_order_ids: [purchaseOrderId],
    items: [
      {
        purchase_order_id: purchaseOrderId,
        purchase_request_id: request.id,
        item_name_requested: request.item_name,
        unit: request.unit,
        quantity: request.quantity,
        lot_number: `LOT-${request.item_code}`,
        lot_unit_quantity: request.quantity,
        lot_unit_type: request.unit,
        packaging_type: "Pending update",
        gross_weight: null,
        cbm: null,
        commodity_group: null,
        created_by_user_id: actor.user_id ?? null,
      },
    ],
    tracking_number: `TRK-DEMO-${String(existingCount + 1).padStart(4, "0")}`,
    purchase_contract_number: request.production_contract_number ?? null,
    status: "PO_CREATED",
    notes: "Demo DO created from approved purchase request.",
    xnk_notes: "Pending import operations update.",
    created_by_user_id: actor.user_id ?? null,
  }
}

async function seedDeliveryOrderModules(deliveryOrderId: string, request: ApiPurchaseRequest, actor: MockActor) {
  const today = todayIso()
  const warehouseDeadline = request.warehouse_deadline_date
  const setupActor: MockActor = { ...actor, role: "admin" }

  await deliveryOrdersApi.upsertProductDetails(deliveryOrderId, {
    item_name_requested: request.item_name,
    unit: request.unit,
    quantity: request.quantity,
    lot_number: `LOT-${request.item_code}`,
    lot_unit_quantity: request.quantity,
    lot_unit_type: request.unit,
    packaging_type: "Pending update",
    gross_weight: null,
    cbm: null,
    commodity_group: null,
  }, actor)

  await deliveryOrdersApi.upsertSapIntegration(deliveryOrderId, {
    supplier_code: "Pending update",
    actual_item_code: request.item_code,
    raw_date: today,
    po_number: null,
  }, actor)

  await deliveryOrdersApi.upsertLogisticsShipping(deliveryOrderId, {
    incoterms: "Pending update",
    shipping_method: "Pending update",
    shipping_line: "Pending update",
    shipping_line_partner_id: null,
    coloader_name: null,
    coloader_partner_id: null,
    agent_name: null,
    agent_partner_id: null,
    vessel_code: "Pending update",
    vessel_name: null,
    voyage_no: null,
    booking_number: null,
    service_type: null,
    mbl_number: null,
    mbl_type: null,
    port_of_departure: "Pending update",
    port_of_loading: null,
    port_of_discharge: null,
    port_of_destination: "Factory warehouse",
    freight_term: null,
    shipment_type: null,
    person_in_charge_name: request.purchasing_manager ?? null,
    person_in_charge_user_id: request.purchasing_manager_user_id ?? null,
    commodity_group: null,
    documents_list: [],
    cut_off_date: request.requested_order_date,
    etd_planned: request.supplier_expected_delivery_date ?? request.requested_order_date,
    etd_actual: null,
    etr_planned: null,
    eta_planned: request.expected_arrival_date ?? warehouseDeadline,
    eta_actual: null,
    atd_actual: null,
    ata_actual: null,
  }, actor)

  await deliveryOrdersApi.upsertWarehouseTracking(deliveryOrderId, {
    production_ready_date: request.requested_order_date,
    warehouse_deadline: warehouseDeadline,
    planned_entry_date: request.expected_arrival_date ?? warehouseDeadline,
    actual_entry_date: null,
  }, actor)

  await deliveryOrdersApi.upsertFinanceTax(deliveryOrderId, {
    import_tax_rate: null,
    tax_amount: 0,
    currency_code: "VND",
    tax_payment_deadline: warehouseDeadline,
    insurance: "Pending update",
  }, setupActor)

  const picAssignment = await personnelTasksApi.createAssignment({
    delivery_order_id: deliveryOrderId,
    role_key: "pic_manager",
    assignee_user_id: request.purchasing_manager_user_id ?? null,
    assignee_name: request.purchasing_manager ?? "Unassigned",
    assigned_by_user_id: actor.user_id ?? null,
    assigned_at: nowIso(),
  }, actor)

  await personnelTasksApi.createTask({
    personnel_assignment_id: picAssignment.id,
    delivery_order_id: deliveryOrderId,
    role_key: "pic_manager",
    task_name: "Track purchase and import progress",
    created_by_user_id: actor.user_id ?? null,
    created_by_name: "Demo user",
    assigned_at: nowIso(),
    progress: 0,
    completed_at: null,
    notes: null,
  }, actor)
}

async function upsertDeliveryOrderModules(deliveryOrderId: string, data: CreateFullDeliveryOrderInput, actor: MockActor) {
  const financeSetupActor: MockActor = { ...actor, role: "admin" }

  await deliveryOrdersApi.upsertProductDetails(deliveryOrderId, data.product_details, actor)
  await deliveryOrdersApi.upsertSapIntegration(deliveryOrderId, data.sap_integration, actor)
  await deliveryOrdersApi.upsertLogisticsShipping(deliveryOrderId, data.logistics_shipping, actor)
  await deliveryOrdersApi.upsertWarehouseTracking(deliveryOrderId, data.warehouse_tracking, actor)
  await deliveryOrdersApi.upsertFinanceTax(deliveryOrderId, data.finance_tax, financeSetupActor)
}

async function updateTask(
  role: PersonnelRole,
  taskName: string,
  deliveryOrderId: string,
  taskIndex: number | undefined,
  progress: number,
  actor: MockActor,
  completedAt: string | null = progress >= 100 ? nowIso() : null
) {
  const task = await findTask(role, taskName, deliveryOrderId, taskIndex, actor)
  await personnelTasksApi.updateTask(task.id, { progress, completed_at: completedAt }, actor)
}

async function findTask(
  role: PersonnelRole,
  taskName: string,
  deliveryOrderId: string,
  taskIndex: number | undefined,
  actor: MockActor
) {
  const detail = await deliveryOrdersApi.getDetail(deliveryOrderId, actor)
  const roleTasks = detail.personnel_tasks.filter((task) => task.role_key === role)
  const task = taskIndex === undefined
    ? roleTasks.find((item) => item.task_name === taskName)
    : roleTasks[taskIndex]?.task_name === taskName
      ? roleTasks[taskIndex]
      : undefined

  if (!task) throw new Error("Task was not found in the selected delivery order.")
  return task
}

function toPurchaseRequestPatch(patch: Partial<PurchaseRequest>): UpdatePurchaseRequestInput {
  const allowedPatch = { ...patch }
  delete allowedPatch.delay_days
  return allowedPatch as UpdatePurchaseRequestInput
}

function toDeliveryOrderPatch(orderInfo: Partial<DeliveryOrder["order_info"]>): UpdateDeliveryOrderInput {
  const status = orderInfo.status === "CANCELLED" ? undefined : orderInfo.status

  return {
    tracking_number: orderInfo.tracking_number,
    purchase_contract_number: orderInfo.purchase_contract_number,
    status,
    notes: orderInfo.notes,
    xnk_notes: orderInfo.xnk_notes,
  }
}

function getActor(role: DemoRole): MockActor {
  return {
    role,
    user_id: "US0001",
  }
}

function nextDemoCode(prefix: string, total: number) {
  return `${prefix}-${String(total + 1).padStart(4, "0")}`
}

function uniqueDefined(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

function todayIso() {
  return nowIso().slice(0, 10)
}

function nowIso() {
  return new Date().toISOString()
}

function clampProgress(progress: number) {
  return Math.min(100, Math.max(0, progress))
}

function formatTaxRate(value: number | null | undefined) {
  if (value === null || value === undefined) return ""
  if (value > 0 && value < 1) return `${Math.round(value * 100)}%`
  return String(value)
}

function normalizeTaxRate(value: string | number | null | undefined) {
  if (typeof value === "number") return value
  if (!value) return null
  const parsed = Number(value.replace("%", "").trim())
  if (Number.isNaN(parsed)) return null
  return parsed > 1 ? parsed / 100 : parsed
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "Unexpected mock API error."
}
