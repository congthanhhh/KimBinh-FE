import {
  active,
  assertFound,
  assertPermission,
  assertPositiveQuantity,
  assertProgress,
  createMockId,
  defaultMockActor,
  MockApiError,
  nowIso,
  readMockDb,
  softDelete,
  touch,
  withMockLatency,
  writeMockDb,
} from "@/mock/mock-db"
import type { MockActor } from "@/types/common.types"
import type { DeliveryOrderProcessMilestone } from "@/types/delivery-order.types"
import type {
  EfmsAccountingNote,
  EfmsAssignment,
  EfmsAttachment,
  EfmsCharge,
  EfmsContainer,
  EfmsDetail,
  EfmsHouseBill,
  EfmsManifest,
  EfmsShippingInstruction,
} from "@/types/efms.types"

export type CreateEfmsManifestInput = Omit<EfmsManifest, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsManifestInput = Partial<Omit<EfmsManifest, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateEfmsShippingInstructionInput = Omit<EfmsShippingInstruction, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsShippingInstructionInput = Partial<Omit<EfmsShippingInstruction, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateEfmsHouseBillInput = Omit<EfmsHouseBill, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsHouseBillInput = Partial<Omit<EfmsHouseBill, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateEfmsContainerInput = Omit<EfmsContainer, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsContainerInput = Partial<Omit<EfmsContainer, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateEfmsChargeInput = Omit<EfmsCharge, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsChargeInput = Partial<Omit<EfmsCharge, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateEfmsAccountingNoteInput = Omit<EfmsAccountingNote, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsAccountingNoteInput = Partial<Omit<EfmsAccountingNote, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateEfmsAssignmentInput = Omit<EfmsAssignment, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsAssignmentInput = Partial<Omit<EfmsAssignment, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateEfmsAttachmentInput = Omit<EfmsAttachment, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateEfmsAttachmentInput = Partial<Omit<EfmsAttachment, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">>
export type CreateProcessMilestoneInput = Omit<DeliveryOrderProcessMilestone, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdateProcessMilestoneInput = Partial<
  Omit<DeliveryOrderProcessMilestone, "id" | "delivery_order_id" | "created_at" | "updated_at" | "deleted_at">
>

export async function getEfmsDetail(deliveryOrderId: string, actor: MockActor = defaultMockActor): Promise<EfmsDetail> {
  assertPermission(actor, "view")
  const db = readMockDb()
  assertDeliveryOrderExists(deliveryOrderId)

  return withMockLatency({
    manifests: active(db.delivery_order_manifests).filter((item) => item.delivery_order_id === deliveryOrderId),
    shipping_instructions: active(db.delivery_order_shipping_instructions).filter(
      (item) => item.delivery_order_id === deliveryOrderId
    ),
    house_bills: active(db.delivery_order_house_bills).filter((item) => item.delivery_order_id === deliveryOrderId),
    manifest_house_bills: db.delivery_order_manifest_house_bills.filter((link) => {
      const manifest = active(db.delivery_order_manifests).find((item) => item.id === link.manifest_id)
      return manifest?.delivery_order_id === deliveryOrderId
    }),
    containers: active(db.delivery_order_containers).filter((item) => item.delivery_order_id === deliveryOrderId),
    charges: active(db.delivery_order_charges).filter((item) => item.delivery_order_id === deliveryOrderId),
    accounting_notes: active(db.delivery_order_accounting_notes).filter((item) => item.delivery_order_id === deliveryOrderId),
    accounting_note_charges: db.delivery_order_accounting_note_charges.filter((link) => link.delivery_order_id === deliveryOrderId),
    assignments: active(db.delivery_order_efms_assignments).filter((item) => item.delivery_order_id === deliveryOrderId),
    attachments: active(db.delivery_order_attachments).filter((item) => item.delivery_order_id === deliveryOrderId),
  })
}

export const listEfmsManifests = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_manifests", deliveryOrderId, actor)
export const createEfmsManifest = (input: CreateEfmsManifestInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_manifests", input, "manifest", actor)
export const updateEfmsManifest = (id: string, patch: UpdateEfmsManifestInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_manifests", id, patch, actor)
export const deleteEfmsManifest = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_manifests", id, actor)

export const listEfmsShippingInstructions = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_shipping_instructions", deliveryOrderId, actor)
export const createEfmsShippingInstruction = (input: CreateEfmsShippingInstructionInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_shipping_instructions", input, "si", actor)
export const updateEfmsShippingInstruction = (
  id: string,
  patch: UpdateEfmsShippingInstructionInput,
  actor: MockActor = defaultMockActor
) => updateEfmsRecord("delivery_order_shipping_instructions", id, patch, actor)
export const deleteEfmsShippingInstruction = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_shipping_instructions", id, actor)

export const listEfmsHouseBills = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_house_bills", deliveryOrderId, actor)
export const createEfmsHouseBill = (input: CreateEfmsHouseBillInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_house_bills", input, "hbl", actor)
export const updateEfmsHouseBill = (id: string, patch: UpdateEfmsHouseBillInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_house_bills", id, patch, actor)
export const deleteEfmsHouseBill = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_house_bills", id, actor)

export const listEfmsContainers = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_containers", deliveryOrderId, actor)
export const createEfmsContainer = (input: CreateEfmsContainerInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_containers", input, "container", actor)
export const updateEfmsContainer = (id: string, patch: UpdateEfmsContainerInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_containers", id, patch, actor)
export const deleteEfmsContainer = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_containers", id, actor)

export const listEfmsCharges = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_charges", deliveryOrderId, actor)
export const createEfmsCharge = (input: CreateEfmsChargeInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_charges", input, "charge", actor)
export const updateEfmsCharge = (id: string, patch: UpdateEfmsChargeInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_charges", id, patch, actor)
export const deleteEfmsCharge = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_charges", id, actor)

export const listEfmsAccountingNotes = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_accounting_notes", deliveryOrderId, actor)
export const createEfmsAccountingNote = (input: CreateEfmsAccountingNoteInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_accounting_notes", input, "note", actor)
export const updateEfmsAccountingNote = (id: string, patch: UpdateEfmsAccountingNoteInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_accounting_notes", id, patch, actor)
export const deleteEfmsAccountingNote = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_accounting_notes", id, actor)

export const listEfmsAssignments = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_efms_assignments", deliveryOrderId, actor)
export const createEfmsAssignment = (input: CreateEfmsAssignmentInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_efms_assignments", input, "efms-task", actor)
export const updateEfmsAssignment = (id: string, patch: UpdateEfmsAssignmentInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_efms_assignments", id, patch, actor)
export const deleteEfmsAssignment = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_efms_assignments", id, actor)

export const listEfmsAttachments = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_attachments", deliveryOrderId, actor)
export const createEfmsAttachment = (input: CreateEfmsAttachmentInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_attachments", input, "attachment", actor)
export const updateEfmsAttachment = (id: string, patch: UpdateEfmsAttachmentInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_attachments", id, patch, actor)
export const deleteEfmsAttachment = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_attachments", id, actor)

export const listProcessMilestones = (deliveryOrderId: string, actor: MockActor = defaultMockActor) =>
  listByDeliveryOrder("delivery_order_process_milestones", deliveryOrderId, actor)
export const createProcessMilestone = (input: CreateProcessMilestoneInput, actor: MockActor = defaultMockActor) =>
  createEfmsRecord("delivery_order_process_milestones", input, "milestone", actor)
export const updateProcessMilestone = (id: string, patch: UpdateProcessMilestoneInput, actor: MockActor = defaultMockActor) =>
  updateEfmsRecord("delivery_order_process_milestones", id, patch, actor)
export const deleteProcessMilestone = (id: string, actor: MockActor = defaultMockActor) =>
  deleteEfmsRecord("delivery_order_process_milestones", id, actor)

export const efmsApi = {
  getDetail: getEfmsDetail,
  manifests: { list: listEfmsManifests, create: createEfmsManifest, update: updateEfmsManifest, delete: deleteEfmsManifest },
  shippingInstructions: {
    list: listEfmsShippingInstructions,
    create: createEfmsShippingInstruction,
    update: updateEfmsShippingInstruction,
    delete: deleteEfmsShippingInstruction,
  },
  houseBills: { list: listEfmsHouseBills, create: createEfmsHouseBill, update: updateEfmsHouseBill, delete: deleteEfmsHouseBill },
  containers: { list: listEfmsContainers, create: createEfmsContainer, update: updateEfmsContainer, delete: deleteEfmsContainer },
  charges: { list: listEfmsCharges, create: createEfmsCharge, update: updateEfmsCharge, delete: deleteEfmsCharge },
  accountingNotes: {
    list: listEfmsAccountingNotes,
    create: createEfmsAccountingNote,
    update: updateEfmsAccountingNote,
    delete: deleteEfmsAccountingNote,
  },
  assignments: { list: listEfmsAssignments, create: createEfmsAssignment, update: updateEfmsAssignment, delete: deleteEfmsAssignment },
  attachments: { list: listEfmsAttachments, create: createEfmsAttachment, update: updateEfmsAttachment, delete: deleteEfmsAttachment },
  milestones: { list: listProcessMilestones, create: createProcessMilestone, update: updateProcessMilestone, delete: deleteProcessMilestone },
}

type EfmsTableName =
  | "delivery_order_manifests"
  | "delivery_order_shipping_instructions"
  | "delivery_order_house_bills"
  | "delivery_order_containers"
  | "delivery_order_charges"
  | "delivery_order_accounting_notes"
  | "delivery_order_efms_assignments"
  | "delivery_order_attachments"
  | "delivery_order_process_milestones"

type EfmsRecord = {
  id: string
  delivery_order_id: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  house_bill_id?: string | null
  quantity?: number
  unit_price?: number
  charge_type?: string
  is_locked?: boolean
  progress?: number
  completed_at?: string | null
  milestone_status?: string
}

async function listByDeliveryOrder(table: EfmsTableName, deliveryOrderId: string, actor: MockActor) {
  assertPermission(actor, "view")
  const db = readMockDb()
  assertDeliveryOrderExists(deliveryOrderId)
  return withMockLatency(active(db[table] as EfmsRecord[]).filter((item) => item.delivery_order_id === deliveryOrderId))
}

async function createEfmsRecord<T extends { delivery_order_id: string }>(
  table: EfmsTableName,
  input: T,
  idPrefix: string,
  actor: MockActor
) {
  assertPermission(actor, "manage_efms")
  validateEfmsInput(table, input)

  const db = readMockDb()
  assertFound(
    active(db.delivery_orders).find((item) => item.id === input.delivery_order_id),
    "Delivery order",
    input.delivery_order_id
  )

  const records = db[table] as EfmsRecord[]
  const timestamp = nowIso()
  const created = {
    ...input,
    id: createMockId(idPrefix, records.length),
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  }

  records.push(created as EfmsRecord)
  writeMockDb(db)
  return withMockLatency(created)
}

async function updateEfmsRecord<T extends Record<string, unknown>>(table: EfmsTableName, id: string, patch: T, actor: MockActor) {
  assertPermission(actor, "manage_efms")
  validateEfmsInput(table, patch)

  const db = readMockDb()
  const records = db[table] as EfmsRecord[]
  const index = records.findIndex((item) => !item.deleted_at && item.id === id)
  const current = assertFound(records[index], "eFMS record", id)
  const updated = touch({ ...current, ...patch })

  records[index] = updated
  writeMockDb(db)
  return withMockLatency(updated)
}

async function deleteEfmsRecord(table: EfmsTableName, id: string, actor: MockActor) {
  assertPermission(actor, "manage_efms")
  const db = readMockDb()
  const records = db[table] as EfmsRecord[]
  const index = records.findIndex((item) => !item.deleted_at && item.id === id)
  const current = assertFound(records[index], "eFMS record", id)
  const deleted = softDelete(current)

  records[index] = deleted
  writeMockDb(db)
  return withMockLatency(deleted)
}

function validateEfmsInput(table: EfmsTableName, payload: Record<string, unknown>) {
  if ("quantity" in payload) assertPositiveQuantity(payload.quantity as number)
  if ("progress" in payload || "completed_at" in payload) {
    assertProgress(payload.progress as number | undefined, payload.completed_at as string | null | undefined)
  }
  if ("unit_price" in payload && typeof payload.unit_price === "number" && payload.unit_price < 0) {
    throw new MockApiError("VALIDATION_ERROR", "unit_price must be greater than or equal to 0.", 422, {
      unit_price: payload.unit_price,
    })
  }
  if (table === "delivery_order_charges" && payload.charge_type === "SELLING" && payload.is_locked !== true) {
    throw new MockApiError("VALIDATION_ERROR", "SELLING charges must be locked.", 422, {
      charge_type: payload.charge_type,
      is_locked: payload.is_locked,
    })
  }
  if (table === "delivery_order_process_milestones" && payload.completed_at && !["COMPLETED", "OVERDUE"].includes(String(payload.milestone_status))) {
    throw new MockApiError("VALIDATION_ERROR", "completed_at requires COMPLETED or OVERDUE milestone status.", 422, {
      completed_at: payload.completed_at,
      milestone_status: payload.milestone_status,
    })
  }
}

function assertDeliveryOrderExists(deliveryOrderId: string) {
  const db = readMockDb()
  return assertFound(
    active(db.delivery_orders).find((item) => item.id === deliveryOrderId),
    "Delivery order",
    deliveryOrderId
  )
}

