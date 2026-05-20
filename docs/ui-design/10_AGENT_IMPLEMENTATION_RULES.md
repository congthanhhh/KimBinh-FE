# AI Code Implementation Rules

## 1. General rules

When generating frontend code:

- Use TypeScript.
- Use reusable components.
- Keep UI minimal.
- Keep business logic in helper functions.
- Keep mock data separate from components.
- Avoid hardcoding data directly inside page components.

## 2. Design rules

- Use neutral backgrounds.
- Use badges for statuses.
- Use tables for operational data.
- Use drawer or tabs for detail views.
- Avoid excessive colors.
- Avoid complex animations.
- Use consistent spacing.

## 3. Component rules

Every page should reuse:

```text
AppLayout
PageHeader
DataTable
StatusBadge
EmptyState
```

DO Detail should reuse:

```text
InfoGrid
ShipmentTimeline
TaskCard
ProgressBar
```

## 4. State rules

Because this is frontend-only:

- Use local React state for filters.
- Use local React state for selected row.
- Use local React state for drawer open/close.
- Do not create API calls unless explicitly requested.

## 5. Filtering rules

Filtering should work on mock data:

```text
Search by PR code, PO number, tracking number, item name.
Filter by status, priority, assignee, role, delay status.
```

## 6. Status calculation rules

### Task status

```text
progress = 0 → NOT_STARTED
progress 1-99 → IN_PROGRESS
progress = 100 → COMPLETED
```

### Delay status

```text
delay_days > 0 → DELAYED
delay_days = 0 → ON_TIME
```

### Warehouse status

```text
actual_entry_date exists → WAREHOUSE_RECEIVED
actual_entry_date null → NOT_RECEIVED
```

## 7. File structure rule

Recommended structure:

```text
src/
├── components/
├── data/
├── pages/
├── types/
├── utils/
└── App.tsx
```

## 8. Do not implement

For MVP, do not implement:

```text
Authentication
Role-based permission
Real backend API
Database connection
Payment processing
SAP real integration
Real file upload
Complex reporting engine
```

## 9. Accessibility

- Buttons must have readable labels.
- Tables must have clear headers.
- Color must not be the only status indicator.
- Use text badges together with color.

## 10. Responsive behavior

Desktop-first.

Minimum behavior:

```text
Sidebar collapses on small screens.
Tables can scroll horizontally.
Cards stack vertically on mobile.
```
