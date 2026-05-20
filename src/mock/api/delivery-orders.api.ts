import {
  active,
  assertDelayDaysNotWritable,
  assertFound,
  assertPermission,
  assertPositiveQuantity,
  assertPurchaseOrderRequestLink,
  assertStatus,
  assertUnique,
  createMockId,
  defaultMockActor,
  nowIso,
  deliveryOrderStatuses,
  readMockDb,
  recalculateWarehouseDelay,
  softDelete,
  touch,
  withMockLatency,
  writeMockDb,
} from "@/mock/mock-db"
import type { MockActor } from "@/types/common.types"
import type {
  DeliveryOrder,
  DeliveryOrderCustomsClearance,
  DeliveryOrderDeliveryTracking,
  DeliveryOrderDetail,
  DeliveryOrderFinanceTax,
  DeliveryOrderItem,
  DeliveryOrderLogisticsShipping,
  DeliveryOrderProductDetails,
  DeliveryOrderPurchaseOrder,
  DeliveryOrderSapIntegration,
  DeliveryOrderWarehouseTracking,
} from "@/types/delivery-order.types"

export type CreateDeliveryOrderItemInput = Omit<
  DeliveryOrderItem,
  | "id"
  | "delivery_order_id"
  | "delivery_order_purchase_order_id"
  | "order_number"
  | "purchase_order_purchase_request_id"
  | "requested_order_id"
  | "created_at"
  | "updated_at"
  | "deleted_at"
>

export type CreateDeliveryOrderInput = Omit<DeliveryOrder, "id" | "created_at" | "updated_at" | "deleted_at"> & {
  purchase_order_ids: string[]
  items: CreateDeliveryOrderItemInput[]
}

export type UpdateDeliveryOrderInput = Partial<
  Omit<DeliveryOrder, "id" | "delivery_order_number" | "created_at" | "updated_at" | "deleted_at">
>

export async function listDeliveryOrders(actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  return withMockLatency(active(readMockDb().delivery_orders))
}

export async function getDeliveryOrder(idOrNumber: string, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  const db = readMockDb()
  const order = assertFound(findDeliveryOrder(db.delivery_orders, idOrNumber), "Delivery order", idOrNumber)
  return withMockLatency(order)
}

export async function createDeliveryOrder(input: CreateDeliveryOrderInput, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "manage_do")
  assertStatus(input.status, deliveryOrderStatuses)
  if (input.items.length === 0) {
    throw new Error("Delivery order requires at least one item linked to a PO-PR allocation.")
  }

  const db = readMockDb()
  assertUnique(active(db.delivery_orders), "delivery_order_number", input.delivery_order_number, "Delivery order")

  const { purchase_order_ids: purchaseOrderIdsFromInput, items, ...orderInput } = input
  const purchaseOrderIds = unique([...purchaseOrderIdsFromInput, ...items.map((item) => item.purchase_order_id)])
  for (const purchaseOrderId of purchaseOrderIds) {
    assertFound(active(db.purchase_orders).find((item) => item.id === purchaseOrderId), "Purchase order", purchaseOrderId)
  }
  for (const item of items) {
    assertPositiveQuantity(item.quantity)
    assertPurchaseOrderRequestLink(db, item.purchase_order_id, item.purchase_request_id)
  }

  const timestamp = nowIso()
  const order: DeliveryOrder = {
    ...orderInput,
    id: createMockId("do", db.delivery_orders.length),
    created_by_user_id: input.created_by_user_id ?? actor.user_id ?? null,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  }

  db.delivery_orders.push(order)
  const deliveryOrderPurchaseOrders = purchaseOrderIds.map((purchaseOrderId) => {
    const po = assertFound(active(db.purchase_orders).find((item) => item.id === purchaseOrderId), "Purchase order", purchaseOrderId)
    const link: DeliveryOrderPurchaseOrder = {
      id: createMockId("dopo", db.delivery_order_purchase_orders.length),
      delivery_order_id: order.id,
      purchase_order_id: po.id,
      order_number: po.order_number,
      notes: null,
      created_by_user_id: actor.user_id ?? null,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    }
    db.delivery_order_purchase_orders.push(link)
    return link
  })

  for (const itemInput of items) {
    const relationship = assertPurchaseOrderRequestLink(db, itemInput.purchase_order_id, itemInput.purchase_request_id)
    const deliveryOrderPurchaseOrder = assertFound(
      deliveryOrderPurchaseOrders.find((link) => link.purchase_order_id === itemInput.purchase_order_id),
      "Delivery order purchase order link",
      itemInput.purchase_order_id
    )
    db.delivery_order_items.push({
      ...itemInput,
      id: createMockId("doi", db.delivery_order_items.length),
      delivery_order_id: order.id,
      delivery_order_purchase_order_id: deliveryOrderPurchaseOrder.id,
      order_number: relationship.po.order_number,
      purchase_order_purchase_request_id: relationship.link.id,
      requested_order_id: relationship.pr.requested_order_id,
      created_by_user_id: actor.user_id ?? null,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    })
  }

  writeMockDb(db)
  return withMockLatency(order)
}

export async function updateDeliveryOrder(
  idOrNumber: string,
  patch: UpdateDeliveryOrderInput,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_do")
  assertStatus(patch.status, deliveryOrderStatuses)

  const db = readMockDb()
  const index = db.delivery_orders.findIndex(
    (item) => !item.deleted_at && (item.id === idOrNumber || item.delivery_order_number === idOrNumber)
  )
  const current = assertFound(db.delivery_orders[index], "Delivery order", idOrNumber)
  const updated = touch({ ...current, ...patch })

  db.delivery_orders[index] = updated
  writeMockDb(db)
  return withMockLatency(updated)
}

export async function deleteDeliveryOrder(idOrNumber: string, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "manage_do")
  const db = readMockDb()
  const index = db.delivery_orders.findIndex(
    (item) => !item.deleted_at && (item.id === idOrNumber || item.delivery_order_number === idOrNumber)
  )
  const current = assertFound(db.delivery_orders[index], "Delivery order", idOrNumber)
  const deleted = softDelete(current)
  db.delivery_orders[index] = deleted
  db.delivery_order_purchase_orders = db.delivery_order_purchase_orders.map((link) =>
    link.delivery_order_id === current.id && !link.deleted_at ? softDelete(link) : link
  )
  db.delivery_order_items = db.delivery_order_items.map((item) =>
    item.delivery_order_id === current.id && !item.deleted_at ? softDelete(item) : item
  )
  writeMockDb(db)
  return withMockLatency(deleted)
}

export async function getDeliveryOrderDetail(idOrNumber: string, actor: MockActor = defaultMockActor): Promise<DeliveryOrderDetail> {
  assertPermission(actor, "view")
  const db = readMockDb()
  const order = assertFound(findDeliveryOrder(db.delivery_orders, idOrNumber), "Delivery order", idOrNumber)
  const purchaseOrderLinks = active(db.delivery_order_purchase_orders).filter((item) => item.delivery_order_id === order.id)
  const items = active(db.delivery_order_items).filter((item) => item.delivery_order_id === order.id)
  const purchaseRequestLinks = active(db.purchase_order_purchase_requests).filter((link) =>
    items.some((item) => item.purchase_order_purchase_request_id === link.id)
  )

  return withMockLatency({
    ...order,
    purchase_orders: purchaseOrderLinks
      .map((link) => active(db.purchase_orders).find((item) => item.id === link.purchase_order_id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    purchase_requests: unique(items.map((item) => item.purchase_request_id))
      .map((purchaseRequestId) => active(db.purchase_requests).find((item) => item.id === purchaseRequestId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    purchase_order_links: purchaseOrderLinks,
    purchase_request_links: purchaseRequestLinks,
    items,
    product_details: items[0] ?? null,
    house_bills: active(db.delivery_order_house_bills).filter((item) => item.delivery_order_id === order.id),
    containers: active(db.delivery_order_containers).filter((item) => item.delivery_order_id === order.id),
    sap_integration: active(db.delivery_order_sap_integrations).find((item) => item.delivery_order_id === order.id) ?? null,
    logistics_shipping: active(db.delivery_order_logistics_shipping).find((item) => item.delivery_order_id === order.id) ?? null,
    warehouse_tracking: active(db.delivery_order_warehouse_tracking).find((item) => item.delivery_order_id === order.id) ?? null,
    finance_tax: active(db.delivery_order_finance_tax).find((item) => item.delivery_order_id === order.id) ?? null,
    customs_clearance: active(db.delivery_order_customs_clearance).find((item) => item.delivery_order_id === order.id) ?? null,
    delivery_tracking: active(db.delivery_order_delivery_tracking).find((item) => item.delivery_order_id === order.id) ?? null,
    personnel_assignments: active(db.personnel_assignments).filter((item) => item.delivery_order_id === order.id),
    personnel_tasks: active(db.personnel_tasks).filter((item) => item.delivery_order_id === order.id),
    process_milestones: active(db.delivery_order_process_milestones).filter((item) => item.delivery_order_id === order.id),
  })
}

export async function upsertDeliveryOrderProductDetails(
  deliveryOrderId: string,
  input: Omit<
    DeliveryOrderProductDetails,
    | "id"
    | "delivery_order_id"
    | "delivery_order_purchase_order_id"
    | "purchase_order_id"
    | "order_number"
    | "purchase_order_purchase_request_id"
    | "purchase_request_id"
    | "requested_order_id"
    | "created_by_user_id"
    | "created_at"
    | "updated_at"
    | "deleted_at"
  >,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_do")
  assertPositiveQuantity(input.quantity)
  const db = readMockDb()
  assertFound(findDeliveryOrder(db.delivery_orders, deliveryOrderId), "Delivery order", deliveryOrderId)
  const index = db.delivery_order_items.findIndex((item) => !item.deleted_at && item.delivery_order_id === deliveryOrderId)
  const current = assertFound(db.delivery_order_items[index], "Delivery order item", deliveryOrderId)
  const updated = touch({ ...current, ...input })
  db.delivery_order_items[index] = updated
  writeMockDb(db)
  return withMockLatency(updated)
}

export async function upsertDeliveryOrderSapIntegration(
  deliveryOrderId: string,
  input: Omit<DeliveryOrderSapIntegration, "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_sap")
  return upsertByDeliveryOrderId("delivery_order_sap_integrations", deliveryOrderId, input)
}

export async function upsertDeliveryOrderLogisticsShipping(
  deliveryOrderId: string,
  input: Omit<DeliveryOrderLogisticsShipping, "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_logistics")
  return upsertByDeliveryOrderId("delivery_order_logistics_shipping", deliveryOrderId, input)
}

export async function upsertDeliveryOrderWarehouseTracking(
  deliveryOrderId: string,
  input: Omit<DeliveryOrderWarehouseTracking, "delivery_order_id" | "delay_days" | "created_at" | "updated_at" | "deleted_at"> &
    Record<string, unknown>,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_warehouse")
  assertDelayDaysNotWritable(input)
  await upsertByDeliveryOrderId("delivery_order_warehouse_tracking", deliveryOrderId, input)
  const db = readMockDb()
  const index = db.delivery_order_warehouse_tracking.findIndex((item) => item.delivery_order_id === deliveryOrderId)
  const updated = recalculateWarehouseDelay(db.delivery_order_warehouse_tracking[index])
  db.delivery_order_warehouse_tracking[index] = updated
  writeMockDb(db)
  return withMockLatency(updated)
}

export async function upsertDeliveryOrderFinanceTax(
  deliveryOrderId: string,
  input: Omit<DeliveryOrderFinanceTax, "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_finance_tax")
  return upsertByDeliveryOrderId("delivery_order_finance_tax", deliveryOrderId, input)
}

export async function upsertDeliveryOrderCustomsClearance(
  deliveryOrderId: string,
  input: Omit<DeliveryOrderCustomsClearance, "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_customs")
  return upsertByDeliveryOrderId("delivery_order_customs_clearance", deliveryOrderId, input)
}

export async function upsertDeliveryOrderDeliveryTracking(
  deliveryOrderId: string,
  input: Omit<DeliveryOrderDeliveryTracking, "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_logistics")
  return upsertByDeliveryOrderId("delivery_order_delivery_tracking", deliveryOrderId, input)
}

export async function getOverdueOrDelayedDeliveryOrders(actor: MockActor = defaultMockActor): Promise<DeliveryOrderDetail[]> {
  assertPermission(actor, "view")
  const db = readMockDb()
  const delayedIds = new Set(
    active(db.delivery_order_warehouse_tracking)
      .filter((item) => item.delay_days > 0)
      .map((item) => item.delivery_order_id)
  )
  const delayedOrders = active(db.delivery_orders).filter((item) => item.status === "DELAYED" || delayedIds.has(item.id))
  const details = await Promise.all(delayedOrders.map((item) => getDeliveryOrderDetail(item.id, actor)))
  return withMockLatency(details, 0)
}

export const deliveryOrdersApi = {
  list: listDeliveryOrders,
  get: getDeliveryOrder,
  create: createDeliveryOrder,
  update: updateDeliveryOrder,
  delete: deleteDeliveryOrder,
  getDetail: getDeliveryOrderDetail,
  getOverdueOrDelayed: getOverdueOrDelayedDeliveryOrders,
  upsertProductDetails: upsertDeliveryOrderProductDetails,
  upsertSapIntegration: upsertDeliveryOrderSapIntegration,
  upsertLogisticsShipping: upsertDeliveryOrderLogisticsShipping,
  upsertWarehouseTracking: upsertDeliveryOrderWarehouseTracking,
  upsertFinanceTax: upsertDeliveryOrderFinanceTax,
  upsertCustomsClearance: upsertDeliveryOrderCustomsClearance,
  upsertDeliveryTracking: upsertDeliveryOrderDeliveryTracking,
}

type UpsertTableName =
  | "delivery_order_sap_integrations"
  | "delivery_order_logistics_shipping"
  | "delivery_order_warehouse_tracking"
  | "delivery_order_finance_tax"
  | "delivery_order_customs_clearance"
  | "delivery_order_delivery_tracking"

type UpsertRecord = {
  delivery_order_id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

async function upsertByDeliveryOrderId<T extends Record<string, unknown>>(
  table: UpsertTableName,
  deliveryOrderId: string,
  input: T
) {
  const db = readMockDb()
  assertFound(findDeliveryOrder(db.delivery_orders, deliveryOrderId), "Delivery order", deliveryOrderId)

  const records = db[table] as UpsertRecord[]
  const index = records.findIndex((item) => item.delivery_order_id === deliveryOrderId)
  const timestamp = nowIso()

  if (index >= 0) {
    const updated = { ...records[index], ...input, updated_at: timestamp, deleted_at: null }
    records[index] = updated
    writeMockDb(db)
    return withMockLatency(updated)
  }

  const created = {
    ...input,
    delivery_order_id: deliveryOrderId,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  }
  records.push(created as UpsertRecord)
  writeMockDb(db)
  return withMockLatency(created)
}

function findDeliveryOrder(deliveryOrders: DeliveryOrder[], idOrNumber: string) {
  return active(deliveryOrders).find((item) => item.id === idOrNumber || item.delivery_order_number === idOrNumber)
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}
