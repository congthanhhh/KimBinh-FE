import type { IsoDateTime } from "@/types/common.types"

export type PersonnelRoleKey = "pic_manager" | "sale_staff" | "port_officer" | "customs_officer"

export type PersonnelAssignment = {
  id: string
  delivery_order_id: string
  role_key: PersonnelRoleKey
  assignee_user_id?: string | null
  assignee_name?: string | null
  assigned_by_user_id?: string | null
  assigned_at?: IsoDateTime | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type PersonnelTaskRecord = {
  id: string
  personnel_assignment_id: string
  delivery_order_id: string
  role_key: PersonnelRoleKey
  task_name: string
  created_by_user_id?: string | null
  created_by_name?: string | null
  assigned_at?: IsoDateTime | null
  progress: number
  completed_at?: IsoDateTime | null
  notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type PersonnelTaskWithAssignment = PersonnelTaskRecord & {
  assignment: PersonnelAssignment | null
}

