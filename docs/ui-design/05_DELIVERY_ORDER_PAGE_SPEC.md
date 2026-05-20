# Delivery Orders Page Specification

## 1. Purpose

Trang Delivery Orders quản lý PO / DO, logistics, SAP, thuế, kho và task liên quan.

## 2. Main layout

```text
Page Header
├── Title: Delivery Orders
├── Button: + New Delivery Order
├── Search by PO / Tracking / PR Code
└── Filters

Data Table
└── Detail Page or Detail Drawer
```

## 3. Filters

```text
Status
Shipping Method
Supplier Code
ETA Range
Delay Status
Warehouse Deadline
```

## 4. Table columns

```text
PO Number
PR Code
Tracking Number
Item
Quantity
Supplier Code
Shipping Method
ETD
ETA
Status
Delay
Actions
```

## 5. Detail layout

DO Detail nên dùng tab layout:

```text
Overview
Product
SAP
Logistics
Warehouse
Finance & Tax
Tasks
```

## 6. Tab: Overview

Fields:

```text
delivery_order_number
tracking_number
purchase_contract_number
status
notes
xnk_notes
linked_po_ids
```

## 7. Tab: Product Items

Show data table of items:

```text
purchase_order_id
purchase_request_id
item_name_requested
unit
quantity
lot_number
packaging_type
```

## 7.1 Tab/Section: House Bills & Containers

House Bills table:
```text
hbl_number
hbl_type
sailing_date
customer_payer
```

Containers table:
```text
container_no
seal_no
container_type
quantity
```

## 8. Tab: SAP

Fields:

```text
supplier_code
actual_item_code
raw_date
po_number
```

## 9. Tab: Logistics

Fields:

```text
incoterms
shipping_method
shipping_line
vessel_code
port_of_departure
port_of_destination
documents_list
cut_off_date
etd_planned
etd_actual
eta_planned
eta_actual
```

Recommended UI:

```text
Info Grid + Shipment Timeline
```

Timeline:

```text
Cut-off Date → ETD Planned → ETD Actual → ETA Planned → ETA Actual
```

## 10. Tab: Warehouse

Fields:

```text
production_ready_date
warehouse_deadline
planned_entry_date
actual_entry_date
delay_days
```

Rules:

```text
actual_entry_date exists → Warehouse Received
delay_days > 0 → Delayed
delay_days = 0 → On time
```

## 11. Tab: Finance & Tax

Fields:

```text
import_tax_rate
tax_amount
tax_payment_deadline
insurance
```

## 12. Tab: Tasks

Show task list grouped by role:

```text
PIC Manager
Sale Staff
Port Officer
Customs Officer
```

Each task card should show:

```text
task_name
created_by
created_at
assigned_at
progress
completed_at
```
