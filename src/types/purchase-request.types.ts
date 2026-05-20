import type { IsoDate, IsoDateTime } from "@/types/common.types"

export type PurchaseRequestStatus = "NEW" | "APPROVED" | "PROCESSING" | "COMPLETED" | "CANCELLED"

export type PurchaseRequest = {
  id: string
  requested_order_id: string
  item_code: string
  item_name: string
  quantity: number
  unit: string
  priority: string
  requested_order_date: IsoDate
  adjusted_date?: IsoDate | null
  notes?: string | null
  requester: string
  requester_user_id?: string | null
  purchasing_manager?: string | null
  purchasing_manager_user_id?: string | null
  production_contract_number?: string | null
  status: PurchaseRequestStatus
  warehouse_deadline_date: IsoDate
  actual_warehouse_entry_date?: IsoDate | null
  supplier_expected_delivery_date?: IsoDate | null
  expected_arrival_date?: IsoDate | null
  delay_days: number
  created_by_user_id?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type PurchaseRequestWithPoSummary = PurchaseRequest & {
  purchase_orders: {
    id: string
    order_number: string
    supplier_name?: string | null
    status: string
  }[]
}
