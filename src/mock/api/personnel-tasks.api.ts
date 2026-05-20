import {
  active,
  assertFound,
  assertPermission,
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
import type { PersonnelAssignment, PersonnelRoleKey, PersonnelTaskRecord } from "@/types/personnel-task.types"

export type CreatePersonnelAssignmentInput = Omit<PersonnelAssignment, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdatePersonnelAssignmentInput = Partial<Omit<PersonnelAssignment, "id" | "delivery_order_id" | "role_key" | "created_at" | "updated_at" | "deleted_at">>
export type CreatePersonnelTaskInput = Omit<PersonnelTaskRecord, "id" | "created_at" | "updated_at" | "deleted_at">
export type UpdatePersonnelTaskInput = Partial<Omit<PersonnelTaskRecord, "id" | "personnel_assignment_id" | "delivery_order_id" | "role_key" | "created_at" | "updated_at" | "deleted_at">>

export async function listPersonnelTasks(actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  return withMockLatency(active(readMockDb().personnel_tasks))
}

export async function getTasksByRole(role_key: PersonnelRoleKey, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "view")
  const db = readMockDb()
  return withMockLatency(active(db.personnel_tasks).filter((item) => item.role_key === role_key))
}

export async function createPersonnelAssignment(input: CreatePersonnelAssignmentInput, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "manage_do")
  const db = readMockDb()
  assertFound(
    active(db.delivery_orders).find((item) => item.id === input.delivery_order_id),
    "Delivery order",
    input.delivery_order_id
  )

  const duplicate = active(db.personnel_assignments).find(
    (item) => item.delivery_order_id === input.delivery_order_id && item.role_key === input.role_key
  )
  if (duplicate) {
    throw new MockApiError("CONFLICT", "Only one personnel assignment is allowed per DO and role.", 409, {
      delivery_order_id: input.delivery_order_id,
      role_key: input.role_key,
    })
  }

  const timestamp = nowIso()
  const assignment: PersonnelAssignment = {
    ...input,
    id: createMockId("assign", db.personnel_assignments.length),
    assigned_by_user_id: input.assigned_by_user_id ?? actor.user_id ?? null,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  }

  db.personnel_assignments.push(assignment)
  writeMockDb(db)
  return withMockLatency(assignment)
}

export async function updatePersonnelAssignment(
  id: string,
  patch: UpdatePersonnelAssignmentInput,
  actor: MockActor = defaultMockActor
) {
  assertPermission(actor, "manage_do")
  const db = readMockDb()
  const index = db.personnel_assignments.findIndex((item) => !item.deleted_at && item.id === id)
  const current = assertFound(db.personnel_assignments[index], "Personnel assignment", id)
  const updated = touch({ ...current, ...patch })
  db.personnel_assignments[index] = updated
  writeMockDb(db)
  return withMockLatency(updated)
}

export async function createPersonnelTask(input: CreatePersonnelTaskInput, actor: MockActor = defaultMockActor) {
  assertPermission(actor, "manage_task", input.role_key)
  assertProgress(input.progress, input.completed_at)
  const db = readMockDb()
  const assignment = assertFound(
    active(db.personnel_assignments).find(
      (item) =>
        item.id === input.personnel_assignment_id &&
        item.delivery_order_id === input.delivery_order_id &&
        item.role_key === input.role_key
    ),
    "Personnel assignment",
    input.personnel_assignment_id
  )

  const timestamp = nowIso()
  const task: PersonnelTaskRecord = {
    ...input,
    personnel_assignment_id: assignment.id,
    id: createMockId("task", db.personnel_tasks.length),
    created_by_user_id: input.created_by_user_id ?? actor.user_id ?? null,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  }

  db.personnel_tasks.push(task)
  writeMockDb(db)
  return withMockLatency(task)
}

export async function updatePersonnelTask(id: string, patch: UpdatePersonnelTaskInput, actor: MockActor = defaultMockActor) {
  const db = readMockDb()
  const index = db.personnel_tasks.findIndex((item) => !item.deleted_at && item.id === id)
  const current = assertFound(db.personnel_tasks[index], "Personnel task", id)
  const nextProgress = patch.progress ?? current.progress
  const nextCompletedAt = patch.completed_at === undefined ? current.completed_at : patch.completed_at

  assertPermission(actor, "manage_task", current.role_key)
  assertProgress(nextProgress, nextCompletedAt)

  const updated = touch({ ...current, ...patch, progress: nextProgress, completed_at: nextCompletedAt })
  db.personnel_tasks[index] = updated
  writeMockDb(db)
  return withMockLatency(updated)
}

export async function deletePersonnelTask(id: string, actor: MockActor = defaultMockActor) {
  const db = readMockDb()
  const index = db.personnel_tasks.findIndex((item) => !item.deleted_at && item.id === id)
  const current = assertFound(db.personnel_tasks[index], "Personnel task", id)

  assertPermission(actor, "manage_task", current.role_key)

  const deleted = softDelete(current)
  db.personnel_tasks[index] = deleted
  writeMockDb(db)
  return withMockLatency(deleted)
}

export const personnelTasksApi = {
  list: listPersonnelTasks,
  getByRole: getTasksByRole,
  createAssignment: createPersonnelAssignment,
  updateAssignment: updatePersonnelAssignment,
  createTask: createPersonnelTask,
  updateTask: updatePersonnelTask,
  deleteTask: deletePersonnelTask,
}

