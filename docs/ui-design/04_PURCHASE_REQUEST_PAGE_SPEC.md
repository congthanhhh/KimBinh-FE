# Purchase Requests Page Specification

## 1. Purpose

Trang này quản lý danh sách yêu cầu mua hàng do bộ phận sản xuất tạo.

## 2. Main layout

```text
Page Header
├── Title: Purchase Requests
├── Button: + New Request
├── Search input
└── Filters

Data Table
└── PR Detail Drawer
```

## 3. Filters

```text
Status
Priority
Purchasing Manager
Requester
Requested Date
Warehouse Deadline
```

## 4. Table columns

```text
PR Code
Item Code
Item Name
Quantity
Unit
Priority
Requester
Purchasing Manager
Warehouse Deadline
Status
Actions
```

## 5. Row actions

```text
View Detail
Create DO
Edit
Archive
```

## 6. Detail drawer content

Drawer title:

```text
PR-{code}
```

Sections:

### Request Summary

```text
Item Name
Item Code
Quantity
Unit
Priority
Status
```

### Production Information

```text
Requester
Production Contract Number
Requested Order Date
Warehouse Deadline Date
```

### Purchasing Information

```text
Purchasing Manager
Supplier Expected Delivery Date
Expected Arrival Date
Actual Warehouse Entry Date
Delay Days
```

### Notes

```text
notes
```

## 7. Form fields for New Request

```text
item_name
item_code
quantity
unit
priority
requested_order_date
warehouse_deadline_date
production_contract_number
requester
purchasing_manager
notes
```

## 8. Frontend behavior

- Khi tạo PR mới, mặc định status là `NEW`.
- Khi user chọn approve, status đổi sang `APPROVED`.
- Khi đã tạo DO từ PR, status có thể đổi thành `PROCESSING`.
- Khi hàng vào kho, status đổi thành `COMPLETED`.

## 9. Empty state

```text
No purchase requests yet.
Create your first request to start the import workflow.
```
