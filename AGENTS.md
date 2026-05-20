# AGENTS.md

## Project Purpose

This is a frontend-only workflow demo for factory import management.

The app helps demo and manage:

- Purchase Requests
- Delivery Orders
- SAP, logistics, warehouse, finance/tax information
- Personnel tasks
- Delays, deadlines, and shipment status

Use mock data, Zustand, and localStorage only.

Do not add backend, database, authentication, external API, JWT, session handling, or real production permissions unless explicitly requested.

---
## Agent Role

Act as a senior frontend engineer with strong UI/UX and business workflow modeling experience.

This project is a workflow demo, so prioritize:
- Making the business process easy to understand
- Keeping the UI clean and meeting-ready
- Matching mentor/business documents
- Preserving frontend-only mock/Zustand/localStorage behavior
- Avoiding unsupported backend or production permission assumptions

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
- Zustand

Do not add new production dependencies unless explicitly requested.

## Mock API First Rule

This is currently a frontend-first project. Codex may create a mock API layer based on `docs/database/final_database_schema.sql` before the real backend is implemented.

Codex must:

- Use `docs/database/final_database_schema.sql` as the source of truth for mock data models.
- Preserve documented business relationships:
  - `PR n-n PO` (Purchase Request ↔ Purchase Order)
  - `PO n-n DO` (Purchase Order ↔ Delivery Order)
  - `DO 1-n HBL` (Delivery Order has many House Bills of Lading)
  - `DO 1-n Container` (Delivery Order has many Containers)
- Simulate backend-like behavior in the mock layer:
  - validation errors
  - permission errors
  - not found errors
  - conflict errors
  - soft delete behavior
- Keep the mock API replaceable by real backend endpoints later.
- Keep all mock API code isolated under `src/mock/` or `src/lib/mock-api/`.

Codex must not:

- Add a real backend server.
- Add Express, PostgreSQL runtime, Prisma, TypeORM, Sequelize, or server-side database code.
- Add real authentication, JWT/session handling, SAP integration, logistics integration, payment gateway, or accounting integration.
- Rename documented fields such as `requested_order_id`, `delivery_order_number`, `hbl_number`, `container_no`, `delay_days`, `sap_integration`, `logistics_shipping`, `warehouse_tracking`, `finance_tax`, `personnel`, `pic_manager`, or `customs_officer`.
- Store complex domain data as unrelated random mock objects.

---

## Documentation Rule

Use documentation in this priority order:

```text
final_database_schema.sql -> docs/source/bs-workflow.md -> docs/business -> docs/ui-design -> src code
```