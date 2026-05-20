import type { AppUser, Partner } from "@/types/common.types"
import type {
  DeliveryOrderCustomsClearance,
  DeliveryOrderDeliveryTracking,
  DeliveryOrderItem,
  DeliveryOrderProcessMilestone,
} from "@/types/delivery-order.types"
import type { EfmsDetail } from "@/types/efms.types"
import type { PurchaseOrder, PurchaseOrderDetail } from "@/types/purchase-order.types"

export type PurchaseRequestStatus =
  | "NEW"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED"

export type DeliveryOrderStatus =
  | "DRAFT"
  | "PO_CREATED"
  | "IN_TRANSIT"
  | "CUSTOMS_PROCESSING"
  | "WAREHOUSE_RECEIVED"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELLED"

export type PersonnelRole =
  | "pic_manager"
  | "sale_staff"
  | "port_officer"
  | "customs_officer"

export type PurchaseRequest = {
  id: string
  purchase_order_ids: string[]
  item_name: string
  item_code: string
  priority: string
  unit: string
  requested_order_id: string
  quantity: number
  requested_order_date: string
  adjusted_date?: string | null
  notes?: string | null
  purchasing_manager: string
  purchasing_manager_user_id?: string | null
  production_contract_number: string
  status: PurchaseRequestStatus
  warehouse_deadline_date: string
  actual_warehouse_entry_date?: string | null
  supplier_expected_delivery_date?: string | null
  expected_arrival_date?: string | null
  delay_days: number
  requester: string
  requester_user_id?: string | null
  created_by_user_id?: string | null
  created_at: string
  updated_at: string
  purchase_orders: {
    id: string
    order_number: string
    supplier_name?: string | null
    status: string
  }[]
  purchase_order?: {
    id: string
    order_number: string
    supplier_name?: string | null
    status: string
  } | null
}

export type PersonnelTask = {
  id?: string
  task_name: string
  created_by: string
  created_by_user_id?: string | null
  created_at: string
  assigned_at: string | null
  progress: number
  completed_at: string | null
  notes?: string | null
}

export type PersonnelMember = {
  assignee: string
  assignee_user_id?: string | null
  assigned_by_user_id?: string | null
  tasks: PersonnelTask[]
}

export type Personnel = Record<PersonnelRole, PersonnelMember>

export type DeliveryOrder = {
  id: string
  purchase_order_ids: string[]
  purchase_request_ids: string[]
  purchase_orders: PurchaseOrder[]
  purchase_requests: PurchaseRequest[]
  created_by_user_id?: string | null
  created_at: string
  updated_at: string
  order_info: {
    request_code: string
    request_codes: string[]
    order_number: string
    tracking_number: string
    purchase_contract_number: string
    status: DeliveryOrderStatus
    notes?: string | null
    xnk_notes?: string | null
  }
  product_details: {
    item_name_requested: string
    unit: string
    quantity: number
    lot_number: string
    lot_unit_quantity: number
    lot_unit_type: string
    packaging_type: string
    gross_weight?: number | null
    cbm?: number | null
    commodity_group?: string | null
  }
  delivery_order_items: DeliveryOrderItem[]
  sap_integration: {
    supplier_code: string
    actual_item_code: string
    raw_date: string
    po_number: string
  }
  logistics_shipping: {
    incoterms: string
    shipping_method: string
    shipping_line: string
    shipping_line_partner_id?: string | null
    coloader_name?: string | null
    coloader_partner_id?: string | null
    agent_name?: string | null
    agent_partner_id?: string | null
    vessel_code: string
    vessel_name?: string | null
    voyage_no?: string | null
    booking_number?: string | null
    service_type?: string | null
    mbl_number?: string | null
    mbl_type?: string | null
    port_of_departure: string
    port_of_loading?: string | null
    port_of_discharge?: string | null
    port_of_destination: string
    freight_term?: string | null
    shipment_type?: string | null
    person_in_charge_name?: string | null
    person_in_charge_user_id?: string | null
    commodity_group?: string | null
    documents_list: string[]
    cut_off_date: string
    etd_planned: string
    etd_actual: string | null
    etr_planned?: string | null
    eta_planned: string
    eta_actual: string | null
    atd_actual?: string | null
    ata_actual?: string | null
  }
  warehouse_tracking: {
    production_ready_date: string
    warehouse_deadline: string
    planned_entry_date: string
    actual_entry_date: string | null
    delay_days: number
  }
  finance_tax: {
    import_tax_rate: string
    tax_amount: number
    currency_code: string
    tax_payment_deadline: string
    insurance: string
  }
  personnel: Personnel
  customs_clearance: DeliveryOrderCustomsClearance | null
  delivery_tracking: DeliveryOrderDeliveryTracking | null
  process_milestones: DeliveryOrderProcessMilestone[]
}

export type ImportVolume = {
  month: string
  purchaseRequests: number
  deliveryOrders: number
}

export type TaskListItem = PersonnelTask & {
  order_number: string
  po_number: string
  role: PersonnelRole
  task_index: number
  role_label: string
  assignee: string
  assignee_user_id?: string | null
  assigned_by_user_id?: string | null
}

export type DemoReferenceData = {
  users: AppUser[]
  partners: Partner[]
}

export type PurchaseOrderDetailView = PurchaseOrderDetail

export type EfmsDetailView = EfmsDetail
