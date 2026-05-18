# AGENTS.md

## Project Purpose

This project is a frontend-only admin dashboard for managing the factory import workflow.

The dashboard helps users track:

- Purchase Requests from the production department
- Delivery Orders created by the purchasing/logistics team
- SAP, logistics, warehouse, finance, and tax information
- Personnel task assignment and progress
- Delays, warehouse deadlines, and shipment status

This is not a backend system. It is a frontend MVP using mock data only.

---

## Tech Stack

Use the existing stack:

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router DOM
- TanStack Table
- Recharts
- date-fns
- Lucide React

Do not add new production dependencies unless the user explicitly asks for them.

---

## Documentation Hierarchy

Before implementing or changing features, read the documentation in this order:

```text
docs/source -> docs/business -> docs/ui-design -> src code
```

## Language Rule

From now on, the user-facing UI must be Vietnamese-first.

- Use Vietnamese for page titles, navigation, buttons, table headers, filters, empty states, badges, and section headings.
- Keep TypeScript identifiers, route paths, and documented data field names in English.
- Do not rename schema fields from the documentation.
- Technical abbreviations such as PO, SAP, ETD, ETA, DO, PR may remain if they are standard business terms.

## Role and Permission Rule

The current project does not implement production-grade permissions.

Use roles as workflow simulation only.

The role demo keeps only:

- Admin
- Requester
- Purchasing Manager / PIC Manager
- Sale Staff
- Port Officer
- Customs Officer

Admin is a demo/system role added for management and demonstration. Admin is not defined by the mentor task document, but can view and perform all demo actions.

The personnel task groups are explicitly defined by the mentor task document. They can view PR/DO/SAP/logistics/warehouse/finance-tax data for context and update only their assigned task group:

- Purchasing Manager / PIC Manager updates `personnel.pic_manager` tasks.
- Sale Staff updates `personnel.sale_staff` tasks.
- Port Officer updates `personnel.port_officer` tasks.
- Customs Officer updates `personnel.customs_officer` tasks.

Requester is the demo role for creating Purchase Requests from production material demand. Do not use Production Department, Purchasing Department, Warehouse Staff, Sản xuất, Mua hàng, or Kho hàng as role-demo permissions.

Admin can perform all demo actions. Requester can create PRs and view workflow context. Purchasing Manager / PIC Manager can coordinate PR status/assignment, create DO from suitable PRs, and update product/SAP/logistics/warehouse data. Customs Officer can update finance/tax data. Port Officer and Sale Staff remain task-focused unless existing schema fields explicitly support their business updates.

Do not add authentication or real access control unless explicitly requested.
Do not invent final permissions. Mark unclear permissions as provisional.

## Role Demo Rule

The project supports frontend-only role-based workflow simulation.

This is not production authentication or authorization.

Roles:

- Admin
- Requester
- Purchasing Manager / PIC Manager
- Sale Staff
- Port Officer
- Customs Officer

Admin can view and perform all demo actions.

Requester creates PRs. Purchasing Manager / PIC Manager updates PR coordination, DO product/SAP/logistics/warehouse fields, and its own PIC tasks. Customs Officer updates finance/tax fields and its own customs tasks. Sale Staff and Port Officer update only their own assigned personnel tasks unless mentor later defines explicit fields. Unclear actions are Admin-only in the demo.

Unavailable actions should be disabled with a Vietnamese explanation, not hidden aggressively.

Do not add login, backend permissions, JWT, session handling, database users, or API guards unless explicitly requested.

## Current Task Prompt Rule

When the user asks to implement the current task, read:

1. `AGENTS.md`
2. `docs/prompts/current-task.md`

The file `docs/prompts/current-task.md` contains the active implementation request.

Follow it exactly unless it conflicts with `AGENTS.md` or the business/UI documentation.

Do not modify `docs/prompts/current-task.md` unless explicitly requested.
