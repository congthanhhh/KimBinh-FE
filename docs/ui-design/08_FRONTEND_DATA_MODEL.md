# Frontend Data Model

## 1. Purchase Request

```ts
export type PurchaseRequestStatus =
  | "NEW"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED";

export type PurchaseRequest = {
  id: string; // UUID
  requested_order_id: string; // Business ID (e.g., PR-2026-0001)
  item_name: string;
  item_code: string;
  priority: string;
  unit: string;
  quantity: number;
  requested_order_date: string;
  adjusted_date?: string | null;
  notes?: string | null;
  purchasing_manager: string;
  production_contract_number: string;
  status: PurchaseRequestStatus;
  warehouse_deadline_date: string;
  actual_warehouse_entry_date?: string | null;
  supplier_expected_delivery_date?: string | null;
  expected_arrival_date?: string | null;
  delay_days: number;
  requester: string;
  linked_po_numbers: string[]; // Many-to-Many via allocation
};
```

## 2. Purchase Order (New)

```ts
export type PurchaseOrderStatus =
  | "DRAFT"
  | "CREATED"
  | "CONFIRMED"
  | "PARTIALLY_DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export type PurchaseOrder = {
  id: string;
  order_number: string;
  purchase_contract_number: string;
  supplier_name: string;
  supplier_code: string;
  status: PurchaseOrderStatus;
  notes?: string | null;
  linked_pr_ids: string[];
  linked_do_ids: string[];
};
```

## 3. Delivery Order (Job)

```ts
export type DeliveryOrderStatus =
  | "DRAFT"
  | "PO_CREATED"
  | "IN_TRANSIT"
  | "CUSTOMS_PROCESSING"
  | "WAREHOUSE_RECEIVED"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELLED";

export type DeliveryOrderItem = {
  id: string;
  purchase_order_id: string;
  purchase_request_id: string;
  item_name_requested: string;
  unit: string;
  quantity: number;
  lot_number?: string | null;
  packaging_type?: string | null;
};

export type HouseBillOfLading = {
  id: string;
  hbl_number: string;
  hbl_type: "COPY" | "ORIGINAL" | "SEAWAY_BILL" | "SURRENDERED";
  sailing_date: string;
  customer_payer: string;
};

export type Container = {
  id: string;
  container_no: string;
  seal_no: string;
  container_type: string;
  quantity: number;
};

export type DeliveryOrder = {
  id: string;
  delivery_order_number: string; // Job ID
  tracking_number?: string | null;
  purchase_contract_number?: string | null;
  status: DeliveryOrderStatus;
  notes?: string | null;
  xnk_notes?: string | null;
  
  // Consolidation n-n
  linked_po_ids: string[];
  
  // Items details
  items: DeliveryOrderItem[];
  
  // Multi-sub entities
  house_bills: HouseBillOfLading[];
  containers: Container[];

  sap_integration: {
    supplier_code: string;
    actual_item_code: string;
    po_number: string;
  };
  logistics_shipping: {
    shipping_line: string;
    vessel_code: string;
    port_of_departure: string;
    port_of_destination: string;
    documents_list: string[];
    mbl_number?: string | null;
    etd_planned: string;
    etd_actual?: string | null;
    eta_planned: string;
    eta_actual?: string | null;
  };
  warehouse_tracking: {
    warehouse_deadline: string;
    actual_entry_date?: string | null;
    delay_days: number;
  };
  finance_tax: {
    import_tax_rate: number;
    tax_amount: number;
    tax_payment_deadline: string;
    insurance: string;
  };
  personnel: Personnel;
};
```

## 4. Personnel and Tasks
...

```ts
export type PersonnelRole =
  | "pic_manager"
  | "sale_staff"
  | "port_officer"
  | "customs_officer";

export type PersonnelTask = {
  task_name: string;
  created_by?: string | null;
  created_at?: string | null;
  assigned_at?: string | null;
  progress: number;
  completed_at?: string | null;
};

export type PersonnelMember = {
  assignee: string;
  tasks: PersonnelTask[];
};

export type Personnel = {
  pic_manager?: PersonnelMember;
  sale_staff?: PersonnelMember;
  port_officer?: PersonnelMember;
  customs_officer?: PersonnelMember;
};
```

## 4. Derived UI models

```ts
export type TaskUIStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export type DelayStatus = "ON_TIME" | "DELAYED" | "UNKNOWN";
```

## 5. Helper function rules

```ts
export function getTaskStatus(progress: number): TaskUIStatus {
  if (progress >= 100) return "COMPLETED";
  if (progress > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

export function getDelayStatus(delayDays?: number): DelayStatus {
  if (delayDays === undefined || delayDays === null) return "UNKNOWN";
  if (delayDays > 0) return "DELAYED";
  return "ON_TIME";
}
```
