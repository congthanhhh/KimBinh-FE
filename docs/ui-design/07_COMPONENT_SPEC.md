# Component Specification

## 1. Layout components

### AppLayout

Responsibilities:

- Render Sidebar.
- Render Topbar.
- Render main page content.

Props:

```ts
children: React.ReactNode
```

### Sidebar

Menu items:

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

### Topbar

Contains:

```text
Global Search
Date Range Filter
User Menu Placeholder
```

## 2. Dashboard components

### KpiCard

Props:

```ts
title: string
value: string | number
description?: string
trend?: string
status?: "neutral" | "success" | "warning" | "danger"
```

### DeliveryTimeline

Props:

```ts
items: TimelineItem[]
```

### StatusOverview

Shows grouped status count.

## 3. Data components

### DataTable

Generic table component.

Required features:

- Columns.
- Rows.
- Empty state.
- Row action.
- Optional sorting.

### FilterBar

Contains search and select filters.

### DetailDrawer

Used for PR detail and DO quick view.

## 4. Shared components

### StatusBadge

Input:

```ts
status: string
```

Behavior:

- Map status to color.
- Render uppercase label.

### PriorityBadge

Input:

```ts
priority: string
```

### ProgressBar

Input:

```ts
value: number
```

Rule:

```text
0 → gray
1-49 → warning
50-99 → primary
100 → success
```

### InfoGrid

Used in detail tabs.

Props:

```ts
items: Array<{ label: string; value: React.ReactNode }>
```

### EmptyState

Props:

```ts
title: string
description?: string
action?: React.ReactNode
```

## 5. Task components

### TaskCard

Props:

```ts
task: PersonnelTask
role: PersonnelRole
assignee: string
```

### TaskBoard

Columns:

```text
Not Started
In Progress
Completed
```

## 6. Logistics components

### ShipmentTimeline

Milestones:

```text
Cut-off
ETD Planned
ETD Actual
ETA Planned
ETA Actual
Warehouse Entry
```

### DocumentList

Displays documents:

```text
Invoice
Packing List
B/L
C/O
```
