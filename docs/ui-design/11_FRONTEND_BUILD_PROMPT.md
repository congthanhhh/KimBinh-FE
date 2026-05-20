# Frontend Build Prompt for AI Coding Agent

Use this prompt to generate the frontend project.

```text
You are an expert frontend engineer and UI designer.

Build a frontend-only admin dashboard for factory import management.

Tech stack:
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

Design style:
- Minimalism
- Clean SaaS admin dashboard
- Neutral colors
- Data-first layout
- Industrial operation dashboard
- Desktop-first responsive UI

Business flow:
Purchase Request ↔ Purchase Order ↔ Delivery Order (Job) → Personnel Tasks → Warehouse Entry

Main pages:
1. Dashboard
2. Purchase Requests
3. Purchase Orders
4. Delivery Orders
5. Delivery Order Detail
6. Task Management

Main data entities (Many-to-Many):
1. Purchase Request
2. Purchase Order
3. Delivery Order (Contains HBLs and Containers)
4. Personnel Task

Dashboard requirements:
- KPI cards: Total PR, Approved PR, Active DO, Delayed DO, Pending Tasks
- Urgent Purchase Requests table
- Delivery Timeline
- Delayed Delivery Orders table
- Pending Tasks section

Purchase Requests page:
- Table with PR code, item, quantity, priority, requester, manager, deadline, status
- Search and filters
- Detail drawer
- New request mock form

Delivery Orders page:
- Table with PO number, PR code, tracking number, item, supplier, shipping method, ETD, ETA, status, delay
- Search and filters
- Detail page or drawer with tabs:
  - Overview
  - Product
  - SAP
  - Logistics
  - Warehouse
  - Finance & Tax
  - Tasks

Task Management page:
- Filter by role, assignee, progress, completed status
- Task cards or task table
- Progress bar
- Update progress in local state

Components to create:
- AppLayout
- Sidebar
- Topbar
- PageHeader
- KpiCard
- StatusBadge
- PriorityBadge
- ProgressBar
- DataTable
- FilterBar
- DetailDrawer
- InfoGrid
- ShipmentTimeline
- TaskCard
- EmptyState

Use mock data only. No backend. No authentication. No database.

Keep code clean, typed, reusable and easy to extend.
```
