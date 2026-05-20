# Information Architecture

## 1. Navigation

Sidebar chính:

```text
Dashboard
Purchase Requests
Delivery Orders
Tasks
Logistics
Warehouse
Reports
Settings
```

## 2. Page hierarchy

```text
AppLayout
├── Sidebar
├── Topbar
└── Main Content
    ├── Dashboard Page
    ├── Purchase Requests Page
    ├── Delivery Orders Page
    ├── Delivery Order Detail Page / Drawer
    ├── Task Management Page
    ├── Logistics Page
    ├── Warehouse Page
    └── Reports Page
```

## 3. Main entities

### Purchase Request

Thông tin chính:

```text
requested_order_id
item_code
item_name
quantity
unit
priority
requested_order_date
warehouse_deadline_date
production_contract_number
requester
purchasing_manager
status
```

### Delivery Order

Thông tin chính chia theo nhóm:

```text
order_info
product_details
sap_integration
logistics_shipping
warehouse_tracking
finance_tax
personnel
```

### Personnel Task

Thông tin chính:

```text
role
assignee
task_name
created_by
created_at
assigned_at
progress
completed_at
```

## 4. Primary user journeys

### Journey 1 - Review urgent PR

```text
Dashboard
→ Urgent Purchase Requests
→ Open PR Detail Drawer
→ Review deadline and priority
```

### Journey 2 - Track shipment

```text
Dashboard
→ Active Delivery Orders
→ Open DO Detail
→ Logistics tab
→ Check ETD / ETA / vessel / ports
```

### Journey 3 - Track task owner

```text
Tasks Page
→ Filter by role or assignee
→ Update progress
→ Mark completed
```

### Journey 4 - Confirm warehouse entry

```text
Delivery Order Detail
→ Warehouse tab
→ Update actual_entry_date
→ Calculate delay_days
→ Mark completed or delayed
```

## 5. Recommended routes

```text
/                         Dashboard
/purchase-requests        Purchase Requests
/delivery-orders          Delivery Orders
/delivery-orders/:id      Delivery Order Detail
/tasks                    Task Management
/logistics                Logistics Overview
/warehouse                Warehouse Tracking
/reports                  Reports
/settings                 Settings
```
