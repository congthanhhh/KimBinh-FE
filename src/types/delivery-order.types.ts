import type {
  AppRole,
  CargoReleaseStatus,
  CustomsChannel,
  FreightTerm,
  IsoDate,
  IsoDateTime,
  MblType,
  ShipmentType,
  WorkflowMilestoneStatus,
  WorkflowMilestoneType,
} from "@/types/common.types"
import type { EfmsContainer, EfmsHouseBill } from "@/types/efms.types"
import type { PersonnelAssignment, PersonnelTaskRecord } from "@/types/personnel-task.types"
import type { PurchaseOrder, PurchaseOrderPurchaseRequest } from "@/types/purchase-order.types"
import type { PurchaseRequest } from "@/types/purchase-request.types"

export type DeliveryOrderStatus =
  | "DRAFT"
  | "PO_CREATED"
  | "IN_TRANSIT"
  | "CUSTOMS_PROCESSING"
  | "WAREHOUSE_RECEIVED"
  | "COMPLETED"
  | "DELAYED"

export type DeliveryOrder = {
  id: string
  delivery_order_number: string
  tracking_number?: string | null
  purchase_contract_number?: string | null
  status: DeliveryOrderStatus
  notes?: string | null
  xnk_notes?: string | null
  created_by_user_id?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderPurchaseOrder = {
  id: string
  delivery_order_id: string
  purchase_order_id: string
  order_number: string
  notes?: string | null
  created_by_user_id?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderItem = {
  id: string
  delivery_order_id: string
  delivery_order_purchase_order_id: string
  purchase_order_id: string
  order_number: string
  purchase_order_purchase_request_id: string
  purchase_request_id: string
  requested_order_id: string
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
  created_by_user_id?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderProductDetails = DeliveryOrderItem

export type DeliveryOrderSapIntegration = {
  delivery_order_id: string
  supplier_code?: string | null
  actual_item_code?: string | null
  raw_date?: IsoDate | null
  po_number?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderLogisticsShipping = {
  delivery_order_id: string
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
  mbl_type?: MblType | null
  port_of_departure?: string | null
  port_of_loading?: string | null
  port_of_discharge?: string | null
  port_of_destination?: string | null
  freight_term?: FreightTerm | null
  shipment_type?: ShipmentType | null
  person_in_charge_name?: string | null
  person_in_charge_user_id?: string | null
  commodity_group?: string | null
  documents_list: string[]
  cut_off_date?: IsoDate | null
  etd_planned?: IsoDate | null
  etd_actual?: IsoDate | null
  etr_planned?: IsoDate | null
  eta_planned?: IsoDate | null
  eta_actual?: IsoDate | null
  atd_actual?: IsoDate | null
  ata_actual?: IsoDate | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderWarehouseTracking = {
  delivery_order_id: string
  production_ready_date?: IsoDate | null
  warehouse_deadline?: IsoDate | null
  planned_entry_date?: IsoDate | null
  actual_entry_date?: IsoDate | null
  delay_days: number
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderFinanceTax = {
  delivery_order_id: string
  import_tax_rate?: number | null
  tax_amount?: number | null
  currency_code: string
  tax_payment_deadline?: IsoDate | null
  insurance?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderCustomsClearance = {
  delivery_order_id: string
  arrival_notice_received_at?: IsoDateTime | null
  draft_declaration_sent_at?: IsoDateTime | null
  customs_declaration_no?: string | null
  customs_channel?: CustomsChannel | null
  declared_at?: IsoDateTime | null
  cleared_at?: IsoDateTime | null
  inspection_required: boolean
  violation_found: boolean
  violation_notes?: string | null
  handled_by_user_id?: string | null
  handled_by_name?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderDeliveryTracking = {
  delivery_order_id: string
  cargo_release_status: CargoReleaseStatus
  cargo_status_notes?: string | null
  delivery_order_released_at?: IsoDateTime | null
  delivery_schedule_sent_at?: IsoDateTime | null
  delivery_schedule_confirmed_at?: IsoDateTime | null
  transported_at?: IsoDateTime | null
  pod_number?: string | null
  pod_received_at?: IsoDateTime | null
  pod_notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderProcessMilestone = {
  id: string
  delivery_order_id: string
  milestone_type: WorkflowMilestoneType
  milestone_status: WorkflowMilestoneStatus
  responsible_role?: AppRole | null
  responsible_user_id?: string | null
  due_at?: IsoDateTime | null
  started_at?: IsoDateTime | null
  completed_at?: IsoDateTime | null
  sla_hours?: number | null
  notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type DeliveryOrderDetail = DeliveryOrder & {
  purchase_orders: PurchaseOrder[]
  purchase_requests: PurchaseRequest[]
  purchase_order_links: DeliveryOrderPurchaseOrder[]
  purchase_request_links: PurchaseOrderPurchaseRequest[]
  items: DeliveryOrderItem[]
  product_details: DeliveryOrderItem | null
  house_bills: EfmsHouseBill[]
  containers: EfmsContainer[]
  sap_integration: DeliveryOrderSapIntegration | null
  logistics_shipping: DeliveryOrderLogisticsShipping | null
  warehouse_tracking: DeliveryOrderWarehouseTracking | null
  finance_tax: DeliveryOrderFinanceTax | null
  customs_clearance: DeliveryOrderCustomsClearance | null
  delivery_tracking: DeliveryOrderDeliveryTracking | null
  personnel_assignments: PersonnelAssignment[]
  personnel_tasks: PersonnelTaskRecord[]
  process_milestones: DeliveryOrderProcessMilestone[]
}
