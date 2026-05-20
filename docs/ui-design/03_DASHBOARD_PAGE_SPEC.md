# Dashboard Page Specification

## 1. Purpose

Trang Dashboard là màn hình tổng quan để người dùng kiểm tra nhanh tình trạng nhập hàng.

## 2. Layout

```text
Page Header
├── Title: Import Management Dashboard
├── Search input
└── Date range filter

KPI Cards
├── Total PR
├── Approved PR
├── Active DO
├── Delayed DO
└── Pending Tasks

Content Grid
├── Urgent Purchase Requests
├── Delivery Timeline
├── Delayed Delivery Orders
└── Pending Tasks
```

## 3. KPI Cards

### Total PR

Đếm tổng Purchase Requests.

### Approved PR

Đếm PR có status `APPROVED`.

### Active DO

Đếm DO có status:

```text
PO_CREATED
IN_TRANSIT
CUSTOMS_PROCESSING
```

### Delayed DO

Đếm DO có:

```text
delay_days > 0
```

### Pending Tasks

Đếm task có:

```text
progress < 100
completed_at = null
```

## 4. Urgent Purchase Requests table

Columns:

```text
PR Code
Item
Quantity
Priority
Warehouse Deadline
Purchasing Manager
Status
```

Sort rule:

1. Priority cao trước.
2. Warehouse deadline gần trước.
3. Status chưa hoàn thành trước.

## 5. Delivery Timeline

Timeline milestones:

```text
PR Created
PO Created
Production Ready
ETD
ETA
Warehouse Entry
Completed
```

## 6. Delayed Delivery Orders

Columns:

```text
PO Number
PR Code
Item
ETA Actual
Warehouse Deadline
Delay Days
Status
```

Rule:

```text
if delay_days > 0 then show danger badge
```

## 7. Pending Tasks

Columns:

```text
Task Name
Role
Assignee
Progress
Created At
Completed At
```

## 8. Minimal wireframe

```text
┌─────────────────────────────────────────────────────────────┐
│ Import Management Dashboard                    [Search...]  │
├─────────────────────────────────────────────────────────────┤
│ [Total PR] [Approved PR] [Active DO] [Delayed DO] [Tasks]   │
├─────────────────────────────┬───────────────────────────────┤
│ Urgent Purchase Requests    │ Delivery Timeline             │
├─────────────────────────────┴───────────────────────────────┤
│ Delayed Delivery Orders                                      │
├─────────────────────────────────────────────────────────────┤
│ Pending Tasks                                                │
└─────────────────────────────────────────────────────────────┘
```
