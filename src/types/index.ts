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
  production_contract_number: string
  status: PurchaseRequestStatus
  warehouse_deadline_date: string
  actual_warehouse_entry_date?: string | null
  supplier_expected_delivery_date?: string | null
  expected_arrival_date?: string | null
  delay_days: number
  requester: string
}

export type PersonnelTask = {
  task_name: string
  created_by: string
  created_at: string
  assigned_at: string | null
  progress: number
  completed_at: string | null
}

export type PersonnelMember = {
  assignee: string
  tasks: PersonnelTask[]
}

export type Personnel = Record<PersonnelRole, PersonnelMember>

export type DeliveryOrder = {
  order_info: {
    request_code: string
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
  }
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
    vessel_code: string
    port_of_departure: string
    port_of_destination: string
    documents_list: string[]
    cut_off_date: string
    etd_planned: string
    etd_actual: string | null
    eta_planned: string
    eta_actual: string | null
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
    tax_payment_deadline: string
    insurance: string
  }
  personnel: Personnel
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
}
