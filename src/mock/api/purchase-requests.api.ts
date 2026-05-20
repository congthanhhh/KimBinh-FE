import {
  active,
  assertDelayDaysNotWritable,
  assertFound,
  assertPermission,
  assertPositiveQuantity,
  assertStatus,
  assertUnique,
  createMockId,
  defaultMockActor,
  MockApiError,
  nowIso,
  purchaseRequestStatuses,
  readMockDb,
  recalculatePurchaseRequestDelay,
  softDelete,
  touch,
  withMockLatency,
  writeMockDb,
} from "@/mock/mock-db"
import type { MockActor } from "@/types/common.types"
import type { PurchaseRequest, PurchaseRequestWithPoSummary } from "@/types/purchase-request.types"

export type CreatePurchaseRequestInput = Omit<
  PurchaseRequest,
  "id" | "delay_days" | "created_at" | "updated_at" | "deleted_at"
> & {
  purchase_order_ids?: string[]
}

export type UpdatePurchaseRequestInput = Partial<
  Omit<PurchaseRequest, "id" | "requested_order_id" | "delay_days" | "created_at" | "updated_at" | "deleted_at">
> & {
  purchase_order_ids?: string[]
} & Record<string, unknown>

export async function listPurchaseRequests(actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  const db = readMockDb()
  return withMockLatency(active(db.purchase_requests).map(recalculatePurchaseRequestDelay))
}

export async function getPurchaseRequest(requested_order_id: string, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  const db = readMockDb()
  const request = assertFound(
    active(db.purchase_requests).find((item) => item.requested_order_id === requested_order_id || item.id === requested_order_id),
    "Purchase request",
    requested_order_id
  )
  return withMockLatency(recalculatePurchaseRequestDelay(request))
}

export async function createPurchaseRequest(input: CreatePurchaseRequestInput, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "create_pr")
  assertDelayDaysNotWritable(input as Record<string, unknown>)
  assertPositiveQuantity(input.quantity)
  assertStatus(input.status, purchaseRequestStatuses)

  const db = readMockDb()
  assertUnique(active(db.purchase_requests), "requested_order_id", input.requested_order_id, "Purchase request")

  const { purchase_order_ids: purchaseOrderIdsFromInput = [], ...requestInput } = input
  const purchaseOrderIds = unique(purchaseOrderIdsFromInput)
  for (const purchaseOrderId of purchaseOrderIds) {
    assertFound(active(db.purchase_orders).find((item) => item.id === purchaseOrderId), "Purchase order", purchaseOrderId)
  }

  const timestamp = nowIso()
  const request = recalculatePurchaseRequestDelay({
    ...requestInput,
    id: createMockId("pr", db.purchase_requests.length),
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
    delay_days: 0,
    created_by_user_id: input.created_by_user_id ?? actor.user_id ?? null,
  })

  db.purchase_requests.push(request)
  for (const purchaseOrderId of purchaseOrderIds) {
    const purchaseOrder = assertFound(active(db.purchase_orders).find((item) => item.id === purchaseOrderId), "Purchase order", purchaseOrderId)
    db.purchase_order_purchase_requests.push({
      id: createMockId("popr", db.purchase_order_purchase_requests.length),
      purchase_order_id: purchaseOrder.id,
      order_number: purchaseOrder.order_number,
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

  writeMockDb(db)
  return withMockLatency(request)
}

export async function updatePurchaseRequest(
  requested_order_id: string,
  patch: UpdatePurchaseRequestInput,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_pr")
  assertDelayDaysNotWritable(patch)
  assertPositiveQuantity(patch.quantity)
  assertStatus(patch.status, purchaseRequestStatuses)

  const db = readMockDb()
  const index = db.purchase_requests.findIndex(
    (item) => !item.deleted_at && (item.requested_order_id === requested_order_id || item.id === requested_order_id)
  )
  const current = assertFound(db.purchase_requests[index], "Purchase request", requested_order_id)
  const { purchase_order_ids: purchaseOrderIdsPatch, ...requestPatch } = patch

  const updated = recalculatePurchaseRequestDelay(touch({ ...current, ...requestPatch }))
  db.purchase_requests[index] = updated

  if (purchaseOrderIdsPatch) {
    syncPurchaseOrderLinks(db, updated, unique(purchaseOrderIdsPatch), actor)
  }

  writeMockDb(db)
  return withMockLatency(updated)
}

export async function deletePurchaseRequest(requested_order_id: string, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "manage_pr")
  const db = readMockDb()
  const index = db.purchase_requests.findIndex(
    (item) => !item.deleted_at && (item.requested_order_id === requested_order_id || item.id === requested_order_id)
  )
  const current = assertFound(db.purchase_requests[index], "Purchase request", requested_order_id)

  const hasActiveDeliveryOrder = active(db.delivery_order_items).some((item) => item.purchase_request_id === current.id)
  if (hasActiveDeliveryOrder) {
    throw new MockApiError("CONFLICT", "Cannot delete a PR with active delivery orders.", 409, {
      requested_order_id: current.requested_order_id,
    })
  }

  const deleted = softDelete(current)
  db.purchase_requests[index] = deleted
  db.purchase_order_purchase_requests = db.purchase_order_purchase_requests.map((link) =>
    link.purchase_request_id === current.id && !link.deleted_at ? softDelete(link) : link
  )
  writeMockDb(db)
  return withMockLatency(deleted)
}

export async function getPurchaseRequestsWithPoSummary(actor: MockActor = defaultMockActor): Promise<PurchaseRequestWithPoSummary[]> {
  assertPermission(actor, "view")
  const db = readMockDb()
  const purchaseOrders = active(db.purchase_orders)
  const links = active(db.purchase_order_purchase_requests)
  const requests = active(db.purchase_requests).map((request) => ({
    ...recalculatePurchaseRequestDelay(request),
    purchase_orders: links
      .filter((link) => link.purchase_request_id === request.id)
      .map((link) => purchaseOrders.find((item) => item.id === link.purchase_order_id))
      .filter((order): order is NonNullable<typeof order> => Boolean(order))
      .map((po) => ({
        id: po.id,
        order_number: po.order_number,
        supplier_name: po.supplier_name,
        status: po.status,
      })),
  }))

  return withMockLatency(requests)
}

export const purchaseRequestsApi = {
  list: listPurchaseRequests,
  get: getPurchaseRequest,
  create: createPurchaseRequest,
  update: updatePurchaseRequest,
  delete: deletePurchaseRequest,
  getListWithPoSummary: getPurchaseRequestsWithPoSummary,
}

function syncPurchaseOrderLinks(
  db: ReturnType<typeof readMockDb>,
  request: PurchaseRequest,
  purchaseOrderIds: string[],
  actor: MockActor
) {
  for (const purchaseOrderId of purchaseOrderIds) {
    assertFound(active(db.purchase_orders).find((item) => item.id === purchaseOrderId), "Purchase order", purchaseOrderId)
  }

  const timestamp = nowIso()
  for (const link of db.purchase_order_purchase_requests) {
    if (link.purchase_request_id === request.id && !purchaseOrderIds.includes(link.purchase_order_id) && !link.deleted_at) {
      Object.assign(link, softDelete(link))
    }
  }

  for (const purchaseOrderId of purchaseOrderIds) {
    const existing = db.purchase_order_purchase_requests.find(
      (link) => link.purchase_request_id === request.id && link.purchase_order_id === purchaseOrderId
    )
    const purchaseOrder = assertFound(active(db.purchase_orders).find((item) => item.id === purchaseOrderId), "Purchase order", purchaseOrderId)
    if (existing) {
      Object.assign(existing, {
        order_number: purchaseOrder.order_number,
        allocated_quantity: request.quantity,
        unit: request.unit,
        updated_at: timestamp,
        deleted_at: null,
      })
      continue
    }
    db.purchase_order_purchase_requests.push({
      id: createMockId("popr", db.purchase_order_purchase_requests.length),
      purchase_order_id: purchaseOrder.id,
      order_number: purchaseOrder.order_number,
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

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}
