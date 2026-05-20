import type { IsoDateTime } from "@/types/common.types"
import type { DeliveryOrder } from "@/types/delivery-order.types"
import type { PurchaseRequest } from "@/types/purchase-request.types"

export type PurchaseOrderStatus =
  | "DRAFT"
  | "CREATED"
  | "CONFIRMED"
  | "PARTIALLY_DELIVERED"
  | "COMPLETED"
  | "CANCELLED"

export type PurchaseOrder = {
  id: string
  order_number: string
  purchase_contract_number?: string | null
  supplier_partner_id?: string | null
  supplier_code?: string | null
  supplier_name?: string | null
  total_value?: number | null
  status: PurchaseOrderStatus
  notes?: string | null
  created_by_user_id?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type PurchaseOrderPurchaseRequest = {
  id: string
  purchase_order_id: string
  order_number: string
  purchase_request_id: string
  requested_order_id: string
  allocated_quantity?: number | null
  unit?: string | null
  allocation_notes?: string | null
  created_by_user_id?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type PurchaseOrderDetail = PurchaseOrder & {
  purchase_requests: PurchaseRequest[]
  delivery_orders: DeliveryOrder[]
  purchase_request_links: PurchaseOrderPurchaseRequest[]
}
