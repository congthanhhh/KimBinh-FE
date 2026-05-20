# Task Management Page Specification

## 1. Purpose

Trang này giúp theo dõi công việc của các personnel liên quan đến từng DO.

## 2. Roles

```text
PIC Manager
Sale Staff
Port Officer
Customs Officer
```

## 3. Main layout

```text
Page Header
├── Title: Task Management
├── Search task
└── Filters

Task View
├── Task Table or Kanban Board
└── Task Detail Drawer
```

## 4. Filters

```text
Role
Assignee
Progress Status
Completed Status
Created Date
DO / PO Number
```

## 5. Task status rule

```text
progress = 0      → NOT_STARTED
progress 1-99     → IN_PROGRESS
progress = 100    → COMPLETED
completed_at date → COMPLETED
completed_at null → NOT_COMPLETED
```

## 6. Task card

```text
┌────────────────────────────────────┐
│ Truyền tờ khai hải quan             │
│ Customs Officer · Lê Văn C          │
│ Progress: 20%                       │
│ Created: 2026-05-13                 │
│ Completed: —                        │
│ [Update Progress]                   │
└────────────────────────────────────┘
```

## 7. Task table columns

```text
Task Name
Role
Assignee
Related PO
Progress
Created At
Assigned At
Completed At
Status
Actions
```

## 8. Update progress behavior

When user updates progress:

```text
if progress < 100:
  completed_at = null

if progress = 100:
  completed_at = current date
```

## 9. Suggested Kanban columns

```text
Not Started
In Progress
Completed
```

## 10. Empty state

```text
No tasks found.
Try changing your filters or open a delivery order to create tasks.
```
