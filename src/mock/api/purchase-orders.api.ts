import {
  active,
  assertFound,
  assertPermission,
  assertStatus,
  assertUnique,
  createMockId,
  defaultMockActor,
  MockApiError,
  nowIso,
  purchaseOrderStatuses,
  readMockDb,
  softDelete,
  touch,
  withMockLatency,
  writeMockDb,
} from "@/mock/mock-db"
import type { MockActor } from "@/types/common.types"
import type { DeliveryOrderPurchaseOrder } from "@/types/delivery-order.types"
import type { PurchaseOrder, PurchaseOrderDetail } from "@/types/purchase-order.types"

export type CreatePurchaseOrderInput = Omit<PurchaseOrder, "id" | "created_at" | "updated_at" | "deleted_at"> & {
  purchase_request_ids?: string[]
  delivery_order_ids?: string[]
}
export type UpdatePurchaseOrderInput = Partial<Omit<PurchaseOrder, "id" | "order_number" | "created_at" | "updated_at" | "deleted_at">> & {
  purchase_request_ids?: string[]
  delivery_order_ids?: string[]
}

export async function listPurchaseOrders(actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  return withMockLatency(active(readMockDb().purchase_orders))
}

export async function getPurchaseOrder(idOrOrderNumber: string, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  const db = readMockDb()
  const order = assertFound(
    active(db.purchase_orders).find((item) => item.id === idOrOrderNumber || item.order_number === idOrOrderNumber),
    "Purchase order",
    idOrOrderNumber
  )
  return withMockLatency(order)
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "manage_po")
  assertStatus(input.status, purchaseOrderStatuses)

  const db = readMockDb()
  assertUnique(active(db.purchase_orders), "order_number", input.order_number, "Purchase order")

  if (input.supplier_partner_id) {
    assertFound(active(db.partners).find((item) => item.id === input.supplier_partner_id), "Partner", input.supplier_partner_id)
  }

  const timestamp = nowIso()
  const { purchase_request_ids: purchaseRequestIds = [], delivery_order_ids: deliveryOrderIds = [], ...orderInput } = input
  const order: PurchaseOrder = {
    ...orderInput,
    id: createMockId("po", db.purchase_orders.length),
    created_by_user_id: input.created_by_user_id ?? actor.user_id ?? null,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  }

  db.purchase_orders.push(order)
  syncPurchaseRequestLinks(db, order, unique(purchaseRequestIds), actor)
  syncDeliveryOrderLinks(db, order, unique(deliveryOrderIds), actor)
  writeMockDb(db)
  return withMockLatency(order)
}

export async function updatePurchaseOrder(
  idOrOrderNumber: string,
  patch: UpdatePurchaseOrderInput,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_po")
  assertStatus(patch.status, purchaseOrderStatuses)

  const db = readMockDb()
  const index = db.purchase_orders.findIndex(
    (item) => !item.deleted_at && (item.id === idOrOrderNumber || item.order_number === idOrOrderNumber)
  )
  const current = assertFound(db.purchase_orders[index], "Purchase order", idOrOrderNumber)

  if (patch.supplier_partner_id) {
    assertFound(active(db.partners).find((item) => item.id === patch.supplier_partner_id), "Partner", patch.supplier_partner_id)
  }

  const { purchase_request_ids: purchaseRequestIds, delivery_order_ids: deliveryOrderIds, ...orderPatch } = patch
  const updated = touch({ ...current, ...orderPatch })
  db.purchase_orders[index] = updated

  if (purchaseRequestIds) {
    syncPurchaseRequestLinks(db, updated, unique(purchaseRequestIds), actor)
  }
  if (deliveryOrderIds) {
    syncDeliveryOrderLinks(db, updated, unique(deliveryOrderIds), actor)
  }

  writeMockDb(db)
  return withMockLatency(updated)
}

export async function deletePurchaseOrder(idOrOrderNumber: string, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "manage_po")
  const db = readMockDb()
  const index = db.purchase_orders.findIndex(
    (item) => !item.deleted_at && (item.id === idOrOrderNumber || item.order_number === idOrOrderNumber)
  )
  const current = assertFound(db.purchase_orders[index], "Purchase order", idOrOrderNumber)
  const hasActiveChildren =
    active(db.purchase_order_purchase_requests).some((item) => item.purchase_order_id === current.id) ||
    active(db.delivery_order_purchase_orders).some((item) => item.purchase_order_id === current.id)

  if (hasActiveChildren) {
    throw new MockApiError("CONFLICT", "Cannot delete a PO with active PR or DO records.", 409, {
      order_number: current.order_number,
    })
  }

  const deleted = softDelete(current)
  db.purchase_orders[index] = deleted
  writeMockDb(db)
  return withMockLatency(deleted)
}

export async function getPurchaseOrderDetail(idOrOrderNumber: string, actor: MockActor = defaultMockActor): Promise<PurchaseOrderDetail> {
  assertPermission(actor, "view")
  const db = readMockDb()
  const order = assertFound(
    active(db.purchase_orders).find((item) => item.id === idOrOrderNumber || item.order_number === idOrOrderNumber),
    "Purchase order",
    idOrOrderNumber
  )
  const purchaseRequestLinks = active(db.purchase_order_purchase_requests).filter((item) => item.purchase_order_id === order.id)
  const deliveryOrderLinks = active(db.delivery_order_purchase_orders).filter((item) => item.purchase_order_id === order.id)

  return withMockLatency({
    ...order,
    purchase_requests: purchaseRequestLinks
      .map((link) => active(db.purchase_requests).find((item) => item.id === link.purchase_request_id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    delivery_orders: deliveryOrderLinks
      .map((link) => active(db.delivery_orders).find((item) => item.id === link.delivery_order_id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    purchase_request_links: purchaseRequestLinks,
  })
}

export const purchaseOrdersApi = {
  list: listPurchaseOrders,
  get: getPurchaseOrder,
  create: createPurchaseOrder,
  update: updatePurchaseOrder,
  delete: deletePurchaseOrder,
  getDetail: getPurchaseOrderDetail,
}

function syncPurchaseRequestLinks(
  db: ReturnType<typeof readMockDb>,
  order: PurchaseOrder,
  purchaseRequestIds: string[],
  actor: MockActor
) {
  for (const purchaseRequestId of purchaseRequestIds) {
    assertFound(active(db.purchase_requests).find((item) => item.id === purchaseRequestId), "Purchase request", purchaseRequestId)
  }

  const timestamp = nowIso()
  for (const link of db.purchase_order_purchase_requests) {
    if (link.purchase_order_id === order.id && !purchaseRequestIds.includes(link.purchase_request_id) && !link.deleted_at) {
      Object.assign(link, softDelete(link))
    }
  }

  for (const purchaseRequestId of purchaseRequestIds) {
    const request = assertFound(active(db.purchase_requests).find((item) => item.id === purchaseRequestId), "Purchase request", purchaseRequestId)
    const existing = db.purchase_order_purchase_requests.find(
      (link) => link.purchase_order_id === order.id && link.purchase_request_id === purchaseRequestId
    )
    if (existing) {
      Object.assign(existing, {
        order_number: order.order_number,
        requested_order_id: request.requested_order_id,
        allocated_quantity: request.quantity,
        unit: request.unit,
        updated_at: timestamp,
        deleted_at: null,
      })
      continue
    }
    db.purchase_order_purchase_requests.push({
      id: createMockId("popr", db.purchase_order_purchase_requests.length),
      purchase_order_id: order.id,
      order_number: order.order_number,
      purchase_request_id: request.id,
      requested_order_id: request.requested_order_id,
      allocated_quantity: request.quantity,
      unit: request.unit,
      allocation_notes: null,
      created_by_user_id: actor.user_id ?? null,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    })
  }
}

function syncDeliveryOrderLinks(
  db: ReturnType<typeof readMockDb>,
  order: PurchaseOrder,
  deliveryOrderIds: string[],
  actor: MockActor
) {
  for (const deliveryOrderId of deliveryOrderIds) {
    assertFound(active(db.delivery_orders).find((item) => item.id === deliveryOrderId), "Delivery order", deliveryOrderId)
  }

  const timestamp = nowIso()
  for (const link of db.delivery_order_purchase_orders) {
    if (link.purchase_order_id === order.id && !deliveryOrderIds.includes(link.delivery_order_id) && !link.deleted_at) {
      Object.assign(link, softDelete(link))
    }
  }

  for (const deliveryOrderId of deliveryOrderIds) {
    const existing = db.delivery_order_purchase_orders.find(
      (link) => link.purchase_order_id === order.id && link.delivery_order_id === deliveryOrderId
    )
    if (existing) {
      Object.assign(existing, {
        order_number: order.order_number,
        updated_at: timestamp,
        deleted_at: null,
      })
      continue
    }

    const link: DeliveryOrderPurchaseOrder = {
      id: createMockId("dopo", db.delivery_order_purchase_orders.length),
      delivery_order_id: deliveryOrderId,
      purchase_order_id: order.id,
      order_number: order.order_number,
      notes: "Linked from purchase order create form.",
      created_by_user_id: actor.user_id ?? null,
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null,
    }
    db.delivery_order_purchase_orders.push(link)
  }
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}
