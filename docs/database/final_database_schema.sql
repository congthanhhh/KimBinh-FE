-- PostgreSQL 15+ final schema for factory import workflow.
-- Relationship standard:
--   PR n-n PO via purchase_order_purchase_requests
--   PO n-n DO via delivery_order_purchase_orders
--   DO 1-n HBL via delivery_order_house_bills
--   DO 1-n Container via delivery_order_containers
--   DO line items reference PO-PR allocations through delivery_order_items

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- ENUM TYPES
-- =========================================================

CREATE TYPE app_role AS ENUM (
  'admin',
  'requester',
  'purchasing_manager',
  'sale_staff',
  'port_officer',
  'customs_officer',
  'accounting'
);

CREATE TYPE purchase_request_status AS ENUM (
  'NEW',
  'APPROVED',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE purchase_order_status AS ENUM (
  'DRAFT',
  'CREATED',
  'CONFIRMED',
  'PARTIALLY_DELIVERED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE delivery_order_status AS ENUM (
  'DRAFT',
  'PO_CREATED',
  'IN_TRANSIT',
  'CUSTOMS_PROCESSING',
  'WAREHOUSE_RECEIVED',
  'COMPLETED',
  'DELAYED'
);

CREATE TYPE personnel_role_key AS ENUM (
  'pic_manager',
  'sale_staff',
  'port_officer',
  'customs_officer'
);

CREATE TYPE partner_type AS ENUM (
  'SUPPLIER',
  'CUSTOMER',
  'CARRIER',
  'AGENT',
  'COLOADER',
  'SHIPPER',
  'CONSIGNEE',
  'FORWARDER',
  'OTHER'
);

CREATE TYPE freight_term AS ENUM (
  'PREPAID',
  'COLLECT'
);

CREATE TYPE shipment_type AS ENUM (
  'FREEHAND',
  'NOMINATED'
);

CREATE TYPE mbl_type AS ENUM (
  'COPY',
  'ORIGINAL',
  'SEAWAY_BILL',
  'SURRENDERED'
);

CREATE TYPE hbl_type AS ENUM (
  'COPY',
  'ORIGINAL',
  'SEAWAY_BILL',
  'SURRENDERED'
);

CREATE TYPE customs_channel AS ENUM (
  'GREEN',
  'YELLOW',
  'RED'
);

CREATE TYPE cargo_release_status AS ENUM (
  'UNKNOWN',
  'NOT_RELEASED',
  'RELEASED',
  'TELEX_RELEASED'
);

CREATE TYPE charge_type AS ENUM (
  'SELLING',
  'BUYING',
  'OBH'
);

CREATE TYPE accounting_note_type AS ENUM (
  'DEBIT_NOTE',
  'CREDIT_NOTE',
  'INVOICE'
);

CREATE TYPE accounting_note_status AS ENUM (
  'DRAFT',
  'ISSUED',
  'CANCELLED',
  'PAID'
);

CREATE TYPE workflow_milestone_type AS ENUM (
  'REQUEST_RESPONSE',
  'QUOTATION',
  'BOOKING',
  'DRAFT_BL_REVIEW',
  'FINAL_BL',
  'CUSTOMS_DECLARATION',
  'CUSTOMS_CLEARANCE',
  'DELIVERY_ORDER_RELEASE',
  'TRANSPORTATION',
  'POD',
  'DEBIT_NOTE_ROUND_1',
  'DEBIT_NOTE_ROUND_2',
  'ARCHIVING'
);

CREATE TYPE workflow_milestone_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'OVERDUE',
  'CANCELLED'
);

-- =========================================================
-- COMMON UPDATED_AT TRIGGER FUNCTION
-- =========================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- USERS AND PARTNERS
-- =========================================================

CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  display_name varchar(255) NOT NULL,
  email varchar(320) NOT NULL,
  role app_role NOT NULL,
  is_active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT app_users_display_name_not_blank CHECK (length(trim(display_name)) > 0),
  CONSTRAINT app_users_email_not_blank CHECK (length(trim(email)) > 0)
);

CREATE UNIQUE INDEX idx_app_users_email_unique_active
ON app_users (lower(email))
WHERE deleted_at IS NULL;

CREATE INDEX idx_app_users_role_active
ON app_users (role)
WHERE deleted_at IS NULL;

CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  partner_code varchar(80),
  partner_name varchar(255) NOT NULL,
  partner_type partner_type NOT NULL DEFAULT 'OTHER',

  tax_code varchar(80),
  contact_name varchar(255),
  contact_email varchar(320),
  contact_phone varchar(80),
  address text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT partners_partner_name_not_blank CHECK (length(trim(partner_name)) > 0)
);

CREATE UNIQUE INDEX idx_partners_code_unique_active
ON partners (partner_code)
WHERE partner_code IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX idx_partners_type_active
ON partners (partner_type)
WHERE deleted_at IS NULL;

CREATE INDEX idx_partners_name_active
ON partners (partner_name)
WHERE deleted_at IS NULL;

-- =========================================================
-- PURCHASE REQUESTS
-- PR is independent from PO. A PR can be split into many POs.
-- =========================================================

CREATE TABLE purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  requested_order_id varchar(80) NOT NULL,

  item_code varchar(80) NOT NULL,
  item_name varchar(255) NOT NULL,
  quantity numeric(18,3) NOT NULL,
  unit varchar(50) NOT NULL,
  priority varchar(80) NOT NULL,

  requested_order_date date NOT NULL,
  adjusted_date date,
  notes text,

  requester varchar(255) NOT NULL,
  requester_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  purchasing_manager varchar(255),
  purchasing_manager_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  production_contract_number varchar(120),
  status purchase_request_status NOT NULL DEFAULT 'NEW',

  warehouse_deadline_date date NOT NULL,
  actual_warehouse_entry_date date,
  supplier_expected_delivery_date date,
  expected_arrival_date date,

  delay_days integer GENERATED ALWAYS AS (
    CASE
      WHEN actual_warehouse_entry_date IS NOT NULL
        THEN GREATEST(0, actual_warehouse_entry_date - warehouse_deadline_date)
      WHEN expected_arrival_date IS NOT NULL
        THEN GREATEST(0, expected_arrival_date - warehouse_deadline_date)
      WHEN supplier_expected_delivery_date IS NOT NULL
        THEN GREATEST(0, supplier_expected_delivery_date - warehouse_deadline_date)
      ELSE 0
    END
  ) STORED,

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT purchase_requests_requested_order_id_unique UNIQUE (requested_order_id),
  CONSTRAINT purchase_requests_id_requested_order_id_unique UNIQUE (id, requested_order_id),
  CONSTRAINT purchase_requests_item_code_not_blank CHECK (length(trim(item_code)) > 0),
  CONSTRAINT purchase_requests_item_name_not_blank CHECK (length(trim(item_name)) > 0),
  CONSTRAINT purchase_requests_quantity_positive CHECK (quantity > 0),
  CONSTRAINT purchase_requests_unit_not_blank CHECK (length(trim(unit)) > 0),
  CONSTRAINT purchase_requests_requester_not_blank CHECK (length(trim(requester)) > 0),
  CONSTRAINT purchase_requests_delay_days_non_negative CHECK (delay_days >= 0)
);

CREATE INDEX idx_purchase_requests_status_active
ON purchase_requests (status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_requests_item_code_active
ON purchase_requests (item_code)
WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_requests_requested_order_date_active
ON purchase_requests (requested_order_date)
WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_requests_warehouse_deadline_active
ON purchase_requests (warehouse_deadline_date)
WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_requests_contract_active
ON purchase_requests (production_contract_number)
WHERE deleted_at IS NULL;

-- =========================================================
-- PURCHASE ORDERS
-- A PO can include many PR allocations.
-- A PR can be split into many POs by supplier / sourcing decision.
-- =========================================================

CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  order_number varchar(80) NOT NULL,
  purchase_contract_number varchar(120),

  supplier_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  supplier_code varchar(80),
  supplier_name varchar(255),

  status purchase_order_status NOT NULL DEFAULT 'DRAFT',
  notes text,

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT purchase_orders_order_number_unique UNIQUE (order_number),
  CONSTRAINT purchase_orders_id_order_number_unique UNIQUE (id, order_number),
  CONSTRAINT purchase_orders_order_number_not_blank CHECK (length(trim(order_number)) > 0)
);

CREATE INDEX idx_purchase_orders_status_active
ON purchase_orders (status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_orders_supplier_partner_active
ON purchase_orders (supplier_partner_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_purchase_orders_supplier_code_active
ON purchase_orders (supplier_code)
WHERE deleted_at IS NULL;

-- PR n-n PO bridge. This is the sourcing/allocation layer.
CREATE TABLE purchase_order_purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  purchase_order_id uuid NOT NULL,
  order_number varchar(80) NOT NULL,

  purchase_request_id uuid NOT NULL,
  requested_order_id varchar(80) NOT NULL,

  allocated_quantity numeric(18,3),
  unit varchar(50),
  allocation_notes text,

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT popr_po_order_number_fk
    FOREIGN KEY (purchase_order_id, order_number)
    REFERENCES purchase_orders(id, order_number)
    ON DELETE RESTRICT,

  CONSTRAINT popr_pr_requested_order_id_fk
    FOREIGN KEY (purchase_request_id, requested_order_id)
    REFERENCES purchase_requests(id, requested_order_id)
    ON DELETE RESTRICT,

  CONSTRAINT popr_unique_po_pr UNIQUE (purchase_order_id, purchase_request_id),

  CONSTRAINT popr_id_po_pr_request_unique
    UNIQUE (id, purchase_order_id, order_number, purchase_request_id, requested_order_id),

  CONSTRAINT popr_allocated_quantity_positive
    CHECK (allocated_quantity IS NULL OR allocated_quantity > 0),

  CONSTRAINT popr_unit_not_blank
    CHECK (unit IS NULL OR length(trim(unit)) > 0)
);

CREATE INDEX idx_popr_po_active
ON purchase_order_purchase_requests (purchase_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_popr_pr_active
ON purchase_order_purchase_requests (purchase_request_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_popr_order_number_active
ON purchase_order_purchase_requests (order_number)
WHERE deleted_at IS NULL;

CREATE INDEX idx_popr_requested_order_id_active
ON purchase_order_purchase_requests (requested_order_id)
WHERE deleted_at IS NULL;

-- =========================================================
-- DELIVERY ORDERS
-- DO is a shipment/job. It can consolidate multiple POs.
-- Product lines are represented by delivery_order_items.
-- =========================================================

CREATE TABLE delivery_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_number varchar(80) NOT NULL,

  tracking_number varchar(120),
  purchase_contract_number varchar(120),

  status delivery_order_status NOT NULL DEFAULT 'DRAFT',

  notes text,
  xnk_notes text,

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT delivery_orders_delivery_order_number_unique UNIQUE (delivery_order_number),
  CONSTRAINT delivery_orders_delivery_order_number_not_blank CHECK (length(trim(delivery_order_number)) > 0)
);

CREATE INDEX idx_delivery_orders_status_active
ON delivery_orders (status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_delivery_orders_tracking_number_active
ON delivery_orders (tracking_number)
WHERE deleted_at IS NULL;

-- PO n-n DO bridge. This is the partial-delivery / container-consolidation layer.
CREATE TABLE delivery_order_purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,

  purchase_order_id uuid NOT NULL,
  order_number varchar(80) NOT NULL,

  notes text,
  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT dopo_po_order_number_fk
    FOREIGN KEY (purchase_order_id, order_number)
    REFERENCES purchase_orders(id, order_number)
    ON DELETE RESTRICT,

  CONSTRAINT dopo_unique_do_po UNIQUE (delivery_order_id, purchase_order_id),
  CONSTRAINT dopo_id_do_po_unique UNIQUE (id, delivery_order_id, purchase_order_id)
);

CREATE INDEX idx_dopo_do_active
ON delivery_order_purchase_orders (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_dopo_po_active
ON delivery_order_purchase_orders (purchase_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_dopo_order_number_active
ON delivery_order_purchase_orders (order_number)
WHERE deleted_at IS NULL;

-- DO line items connect a DO to a specific PO-PR allocation.
-- This preserves PR n-n PO and PO n-n DO while keeping item-level traceability.
CREATE TABLE delivery_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL,

  delivery_order_purchase_order_id uuid NOT NULL,
  purchase_order_id uuid NOT NULL,
  order_number varchar(80) NOT NULL,

  purchase_order_purchase_request_id uuid NOT NULL,
  purchase_request_id uuid NOT NULL,
  requested_order_id varchar(80) NOT NULL,

  item_name_requested varchar(255) NOT NULL,
  unit varchar(50) NOT NULL,
  quantity numeric(18,3) NOT NULL,

  lot_number varchar(120),
  lot_unit_quantity numeric(18,3),
  lot_unit_type varchar(80),
  packaging_type varchar(120),

  gross_weight numeric(18,3),
  cbm numeric(18,3),
  commodity_group varchar(120),

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_items_dopo_fk
    FOREIGN KEY (delivery_order_purchase_order_id, delivery_order_id, purchase_order_id)
    REFERENCES delivery_order_purchase_orders(id, delivery_order_id, purchase_order_id)
    ON DELETE RESTRICT,

  CONSTRAINT do_items_popr_fk
    FOREIGN KEY (
      purchase_order_purchase_request_id,
      purchase_order_id,
      order_number,
      purchase_request_id,
      requested_order_id
    )
    REFERENCES purchase_order_purchase_requests(
      id,
      purchase_order_id,
      order_number,
      purchase_request_id,
      requested_order_id
    )
    ON DELETE RESTRICT,

  CONSTRAINT do_items_id_do_unique UNIQUE (id, delivery_order_id),
  CONSTRAINT do_items_item_name_not_blank CHECK (length(trim(item_name_requested)) > 0),
  CONSTRAINT do_items_unit_not_blank CHECK (length(trim(unit)) > 0),
  CONSTRAINT do_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT do_items_lot_unit_quantity_positive CHECK (lot_unit_quantity IS NULL OR lot_unit_quantity > 0),
  CONSTRAINT do_items_gross_weight_positive CHECK (gross_weight IS NULL OR gross_weight > 0),
  CONSTRAINT do_items_cbm_positive CHECK (cbm IS NULL OR cbm > 0)
);

CREATE INDEX idx_do_items_do_active
ON delivery_order_items (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_items_dopo_active
ON delivery_order_items (delivery_order_purchase_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_items_po_active
ON delivery_order_items (purchase_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_items_pr_active
ON delivery_order_items (purchase_request_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_items_requested_order_id_active
ON delivery_order_items (requested_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_items_lot_number_active
ON delivery_order_items (lot_number)
WHERE deleted_at IS NULL;

-- =========================================================
-- SAP INTEGRATION
-- Multiple SAP references can exist because one DO can consolidate many POs.
-- =========================================================

CREATE TABLE delivery_order_sap_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  purchase_order_id uuid REFERENCES purchase_orders(id) ON DELETE SET NULL,
  delivery_order_item_id uuid,

  supplier_code varchar(80),
  actual_item_code varchar(80),
  raw_date date,
  po_number varchar(80),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_sap_item_same_do_fk
    FOREIGN KEY (delivery_order_item_id, delivery_order_id)
    REFERENCES delivery_order_items(id, delivery_order_id)
    ON DELETE SET NULL (delivery_order_item_id)
);

CREATE INDEX idx_do_sap_do_active
ON delivery_order_sap_integrations (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_sap_po_active
ON delivery_order_sap_integrations (purchase_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_sap_supplier_code_active
ON delivery_order_sap_integrations (supplier_code)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_sap_actual_item_code_active
ON delivery_order_sap_integrations (actual_item_code)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_sap_po_number_active
ON delivery_order_sap_integrations (po_number)
WHERE deleted_at IS NULL;

-- =========================================================
-- LOGISTICS SHIPPING + eFMS GENERAL INFO / JOB MANAGEMENT
-- DO-level because it describes the shipment/job.
-- =========================================================

CREATE TABLE delivery_order_logistics_shipping (
  delivery_order_id uuid PRIMARY KEY REFERENCES delivery_orders(id) ON DELETE CASCADE,

  incoterms varchar(120),
  shipping_method varchar(120),

  shipping_line varchar(120),
  shipping_line_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,

  coloader_name varchar(255),
  coloader_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,

  agent_name varchar(255),
  agent_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,

  vessel_code varchar(120),
  vessel_name varchar(120),
  voyage_no varchar(120),

  booking_number varchar(120),
  service_type varchar(120),

  mbl_number varchar(120),
  mbl_type mbl_type,

  port_of_departure varchar(255),
  port_of_loading varchar(255),
  port_of_discharge varchar(255),
  port_of_destination varchar(255),

  freight_term freight_term,
  shipment_type shipment_type,

  person_in_charge_name varchar(255),
  person_in_charge_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  commodity_group varchar(120),

  documents_list text[] NOT NULL DEFAULT ARRAY[]::text[],

  cut_off_date date,

  etd_planned date,
  etd_actual date,

  etr_planned date,
  eta_planned date,
  eta_actual date,

  atd_actual date,
  ata_actual date,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_do_logistics_shipping_method_active
ON delivery_order_logistics_shipping (shipping_method)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_logistics_shipping_line_active
ON delivery_order_logistics_shipping (shipping_line)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_logistics_booking_number_active
ON delivery_order_logistics_shipping (booking_number)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_logistics_mbl_number_active
ON delivery_order_logistics_shipping (mbl_number)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_logistics_vessel_code_active
ON delivery_order_logistics_shipping (vessel_code)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_logistics_eta_active
ON delivery_order_logistics_shipping (eta_planned, eta_actual)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_logistics_documents_list_gin
ON delivery_order_logistics_shipping
USING gin (documents_list);

-- =========================================================
-- WAREHOUSE TRACKING
-- =========================================================

CREATE TABLE delivery_order_warehouse_tracking (
  delivery_order_id uuid PRIMARY KEY REFERENCES delivery_orders(id) ON DELETE CASCADE,

  production_ready_date date,
  warehouse_deadline date,
  planned_entry_date date,
  actual_entry_date date,

  delay_days integer GENERATED ALWAYS AS (
    CASE
      WHEN warehouse_deadline IS NULL THEN 0
      WHEN actual_entry_date IS NOT NULL
        THEN GREATEST(0, actual_entry_date - warehouse_deadline)
      WHEN planned_entry_date IS NOT NULL
        THEN GREATEST(0, planned_entry_date - warehouse_deadline)
      ELSE 0
    END
  ) STORED,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_warehouse_delay_days_non_negative CHECK (delay_days >= 0)
);

CREATE INDEX idx_do_warehouse_deadline_active
ON delivery_order_warehouse_tracking (warehouse_deadline)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_warehouse_actual_entry_active
ON delivery_order_warehouse_tracking (actual_entry_date)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_warehouse_delay_days_active
ON delivery_order_warehouse_tracking (delay_days)
WHERE deleted_at IS NULL;

-- =========================================================
-- FINANCE TAX
-- =========================================================

CREATE TABLE delivery_order_finance_tax (
  delivery_order_id uuid PRIMARY KEY REFERENCES delivery_orders(id) ON DELETE CASCADE,

  import_tax_rate numeric(7,4),
  tax_amount numeric(18,2),
  currency_code char(3) NOT NULL DEFAULT 'VND',

  tax_payment_deadline date,
  insurance text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_finance_import_tax_rate_non_negative CHECK (import_tax_rate IS NULL OR import_tax_rate >= 0),
  CONSTRAINT do_finance_tax_amount_non_negative CHECK (tax_amount IS NULL OR tax_amount >= 0),
  CONSTRAINT do_finance_currency_uppercase CHECK (currency_code = upper(currency_code))
);

CREATE INDEX idx_do_finance_tax_payment_deadline_active
ON delivery_order_finance_tax (tax_payment_deadline)
WHERE deleted_at IS NULL;

-- =========================================================
-- CUSTOMS CLEARANCE
-- =========================================================

CREATE TABLE delivery_order_customs_clearance (
  delivery_order_id uuid PRIMARY KEY REFERENCES delivery_orders(id) ON DELETE CASCADE,

  arrival_notice_received_at timestamptz,
  draft_declaration_sent_at timestamptz,

  customs_declaration_no varchar(120),
  customs_channel customs_channel,

  declared_at timestamptz,
  cleared_at timestamptz,

  inspection_required boolean NOT NULL DEFAULT false,
  violation_found boolean NOT NULL DEFAULT false,
  violation_notes text,

  handled_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  handled_by_name varchar(255),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_do_customs_declaration_no_active
ON delivery_order_customs_clearance (customs_declaration_no)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_customs_channel_active
ON delivery_order_customs_clearance (customs_channel)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_customs_cleared_at_active
ON delivery_order_customs_clearance (cleared_at)
WHERE deleted_at IS NULL;

-- =========================================================
-- DELIVERY / POD TRACKING
-- =========================================================

CREATE TABLE delivery_order_delivery_tracking (
  delivery_order_id uuid PRIMARY KEY REFERENCES delivery_orders(id) ON DELETE CASCADE,

  cargo_release_status cargo_release_status NOT NULL DEFAULT 'UNKNOWN',

  cargo_status_notes text,
  delivery_order_released_at timestamptz,

  delivery_schedule_sent_at timestamptz,
  delivery_schedule_confirmed_at timestamptz,

  transported_at timestamptz,

  pod_number varchar(120),
  pod_received_at timestamptz,
  pod_notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_do_delivery_release_status_active
ON delivery_order_delivery_tracking (cargo_release_status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_delivery_pod_number_active
ON delivery_order_delivery_tracking (pod_number)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_delivery_pod_received_at_active
ON delivery_order_delivery_tracking (pod_received_at)
WHERE deleted_at IS NULL;

-- =========================================================
-- PERSONNEL ASSIGNMENTS AND TASKS
-- =========================================================

CREATE TABLE personnel_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  role_key personnel_role_key NOT NULL,

  assignee_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  assignee_name varchar(255),

  assigned_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  assigned_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT personnel_assignments_unique_role_per_do UNIQUE (delivery_order_id, role_key),
  CONSTRAINT personnel_assignments_id_do_role_unique UNIQUE (id, delivery_order_id, role_key)
);

CREATE INDEX idx_personnel_assignments_do_active
ON personnel_assignments (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_personnel_assignments_role_key_active
ON personnel_assignments (role_key)
WHERE deleted_at IS NULL;

CREATE INDEX idx_personnel_assignments_assignee_user_active
ON personnel_assignments (assignee_user_id)
WHERE deleted_at IS NULL;

CREATE TABLE personnel_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  personnel_assignment_id uuid NOT NULL,
  delivery_order_id uuid NOT NULL,
  role_key personnel_role_key NOT NULL,

  task_name varchar(255) NOT NULL,

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_by_name varchar(255),

  assigned_at timestamptz,

  progress smallint NOT NULL DEFAULT 0,
  completed_at timestamptz,

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT personnel_tasks_assignment_fk
    FOREIGN KEY (personnel_assignment_id, delivery_order_id, role_key)
    REFERENCES personnel_assignments(id, delivery_order_id, role_key)
    ON DELETE CASCADE,

  CONSTRAINT personnel_tasks_task_name_not_blank CHECK (length(trim(task_name)) > 0),
  CONSTRAINT personnel_tasks_progress_range CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT personnel_tasks_completed_requires_100 CHECK (completed_at IS NULL OR progress = 100)
);

CREATE INDEX idx_personnel_tasks_do_active
ON personnel_tasks (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_personnel_tasks_role_key_active
ON personnel_tasks (role_key)
WHERE deleted_at IS NULL;

CREATE INDEX idx_personnel_tasks_progress_active
ON personnel_tasks (progress)
WHERE deleted_at IS NULL;

CREATE INDEX idx_personnel_tasks_completed_at_active
ON personnel_tasks (completed_at)
WHERE deleted_at IS NULL;

-- =========================================================
-- eFMS MANIFEST
-- =========================================================

CREATE TABLE delivery_order_manifests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,

  reference_no varchar(120),
  supplier_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  supplier_name varchar(255),

  vessel varchar(120),
  manifest_date date,

  port_of_loading varchar(255),
  port_of_discharge varchar(255),

  freight_charge freight_term,
  assembling_agent_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  assembling_agent_name varchar(255),

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_manifests_id_do_unique UNIQUE (id, delivery_order_id)
);

CREATE INDEX idx_do_manifests_do_active
ON delivery_order_manifests (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_manifests_reference_no_active
ON delivery_order_manifests (reference_no)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_manifests_manifest_date_active
ON delivery_order_manifests (manifest_date)
WHERE deleted_at IS NULL;

-- =========================================================
-- eFMS SHIPPING INSTRUCTION
-- =========================================================

CREATE TABLE delivery_order_shipping_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,

  booking_number varchar(120),
  issued_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  issued_by_name varchar(255),

  supplier_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  supplier_name varchar(255),

  shipper_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  shipper_name varchar(255),

  consignee_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  consignee_name varchar(255),

  payment_type freight_term,

  vessel_name varchar(120),
  voyage_no varchar(120),
  loading_date date,

  gross_weight numeric(18,3),
  cbm numeric(18,3),

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_shipping_instruction_gross_weight_positive CHECK (gross_weight IS NULL OR gross_weight > 0),
  CONSTRAINT do_shipping_instruction_cbm_positive CHECK (cbm IS NULL OR cbm > 0)
);

CREATE INDEX idx_do_shipping_instructions_do_active
ON delivery_order_shipping_instructions (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_shipping_instructions_booking_active
ON delivery_order_shipping_instructions (booking_number)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_shipping_instructions_loading_date_active
ON delivery_order_shipping_instructions (loading_date)
WHERE deleted_at IS NULL;

-- =========================================================
-- eFMS HOUSE BILL
-- DO 1-n HBL.
-- =========================================================

CREATE TABLE delivery_order_house_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,

  customer_payer_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  customer_payer_name varchar(255),

  hbl_number varchar(120) NOT NULL,
  hbl_type hbl_type,

  feeder_vessel varchar(120),
  mother_vessel varchar(120),

  point_of_origin varchar(255),
  country_of_origin varchar(120),

  place_of_delivery varchar(255),
  final_destination varchar(255),

  freight_payment freight_term,
  freight_payable_at varchar(255),

  sailing_date date,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_house_bills_hbl_number_unique UNIQUE (hbl_number),
  CONSTRAINT do_house_bills_id_do_unique UNIQUE (id, delivery_order_id),
  CONSTRAINT do_house_bills_hbl_number_not_blank CHECK (length(trim(hbl_number)) > 0)
);

CREATE INDEX idx_do_house_bills_do_active
ON delivery_order_house_bills (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_house_bills_sailing_date_active
ON delivery_order_house_bills (sailing_date)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_house_bills_customer_payer_active
ON delivery_order_house_bills (customer_payer_partner_id)
WHERE deleted_at IS NULL;

CREATE TABLE delivery_order_manifest_house_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL,
  manifest_id uuid NOT NULL,
  house_bill_id uuid NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_manifest_hbl_manifest_same_do_fk
    FOREIGN KEY (manifest_id, delivery_order_id)
    REFERENCES delivery_order_manifests(id, delivery_order_id)
    ON DELETE CASCADE,

  CONSTRAINT do_manifest_hbl_house_bill_same_do_fk
    FOREIGN KEY (house_bill_id, delivery_order_id)
    REFERENCES delivery_order_house_bills(id, delivery_order_id)
    ON DELETE CASCADE,

  CONSTRAINT do_manifest_house_bill_unique UNIQUE (manifest_id, house_bill_id)
);

CREATE INDEX idx_do_manifest_hbl_do_active
ON delivery_order_manifest_house_bills (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_manifest_hbl_manifest_active
ON delivery_order_manifest_house_bills (manifest_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_manifest_hbl_house_bill_active
ON delivery_order_manifest_house_bills (house_bill_id)
WHERE deleted_at IS NULL;

-- =========================================================
-- eFMS CONTAINER LIST
-- DO 1-n Container. A container may optionally attach to HBL and/or DO items.
-- =========================================================

CREATE TABLE delivery_order_containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  house_bill_id uuid,

  container_type varchar(80),
  quantity integer NOT NULL DEFAULT 1,

  container_no varchar(120),
  seal_no varchar(120),

  vehicle_type varchar(120),
  vehicle_no varchar(120),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_containers_house_bill_same_do_fk
    FOREIGN KEY (house_bill_id, delivery_order_id)
    REFERENCES delivery_order_house_bills(id, delivery_order_id)
    ON DELETE SET NULL (house_bill_id),

  CONSTRAINT do_containers_id_do_unique UNIQUE (id, delivery_order_id),
  CONSTRAINT do_containers_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_do_containers_do_active
ON delivery_order_containers (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_containers_house_bill_active
ON delivery_order_containers (house_bill_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_containers_container_no_active
ON delivery_order_containers (container_no)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_containers_seal_no_active
ON delivery_order_containers (seal_no)
WHERE deleted_at IS NULL;

-- Optional line-level container contents.
CREATE TABLE delivery_order_container_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL,
  container_id uuid NOT NULL,
  delivery_order_item_id uuid NOT NULL,

  quantity numeric(18,3),
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_container_items_container_same_do_fk
    FOREIGN KEY (container_id, delivery_order_id)
    REFERENCES delivery_order_containers(id, delivery_order_id)
    ON DELETE CASCADE,

  CONSTRAINT do_container_items_item_same_do_fk
    FOREIGN KEY (delivery_order_item_id, delivery_order_id)
    REFERENCES delivery_order_items(id, delivery_order_id)
    ON DELETE CASCADE,

  CONSTRAINT do_container_items_unique UNIQUE (container_id, delivery_order_item_id),
  CONSTRAINT do_container_items_quantity_positive CHECK (quantity IS NULL OR quantity > 0)
);

CREATE INDEX idx_do_container_items_do_active
ON delivery_order_container_items (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_container_items_container_active
ON delivery_order_container_items (container_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_container_items_item_active
ON delivery_order_container_items (delivery_order_item_id)
WHERE deleted_at IS NULL;

-- =========================================================
-- eFMS CHARGES
-- =========================================================

CREATE TABLE delivery_order_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  house_bill_id uuid,
  delivery_order_item_id uuid,

  charge_type charge_type NOT NULL,

  charge_code varchar(80),
  charge_name varchar(255) NOT NULL,

  partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  partner_name varchar(255),

  quantity numeric(18,3) NOT NULL DEFAULT 1,
  unit varchar(50),
  unit_price numeric(18,2) NOT NULL DEFAULT 0,

  currency_code char(3) NOT NULL DEFAULT 'VND',
  vat_rate numeric(7,4),

  exchange_date date,
  final_exchange_rate numeric(18,6),

  is_locked boolean NOT NULL DEFAULT false,

  notes text,

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_charges_house_bill_same_do_fk
    FOREIGN KEY (house_bill_id, delivery_order_id)
    REFERENCES delivery_order_house_bills(id, delivery_order_id)
    ON DELETE SET NULL (house_bill_id),

  CONSTRAINT do_charges_item_same_do_fk
    FOREIGN KEY (delivery_order_item_id, delivery_order_id)
    REFERENCES delivery_order_items(id, delivery_order_id)
    ON DELETE SET NULL (delivery_order_item_id),

  CONSTRAINT do_charges_id_do_unique UNIQUE (id, delivery_order_id),
  CONSTRAINT do_charges_charge_name_not_blank CHECK (length(trim(charge_name)) > 0),
  CONSTRAINT do_charges_quantity_positive CHECK (quantity > 0),
  CONSTRAINT do_charges_unit_price_non_negative CHECK (unit_price >= 0),
  CONSTRAINT do_charges_vat_rate_non_negative CHECK (vat_rate IS NULL OR vat_rate >= 0),
  CONSTRAINT do_charges_final_exchange_rate_positive CHECK (final_exchange_rate IS NULL OR final_exchange_rate > 0),
  CONSTRAINT do_charges_currency_uppercase CHECK (currency_code = upper(currency_code)),
  CONSTRAINT do_charges_selling_locked CHECK (charge_type <> 'SELLING' OR is_locked = true)
);

CREATE INDEX idx_do_charges_do_active
ON delivery_order_charges (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_charges_house_bill_active
ON delivery_order_charges (house_bill_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_charges_item_active
ON delivery_order_charges (delivery_order_item_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_charges_type_active
ON delivery_order_charges (charge_type)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_charges_partner_active
ON delivery_order_charges (partner_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_charges_charge_code_active
ON delivery_order_charges (charge_code)
WHERE deleted_at IS NULL;

-- =========================================================
-- eFMS CREDIT NOTE / DEBIT NOTE / INVOICE
-- =========================================================

CREATE TABLE delivery_order_accounting_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,

  note_type accounting_note_type NOT NULL,
  note_status accounting_note_status NOT NULL DEFAULT 'DRAFT',

  note_code varchar(80) NOT NULL,

  subject_partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  subject_partner_name varchar(255),

  note_date date,
  currency_code char(3) NOT NULL DEFAULT 'VND',

  total_amount numeric(18,2) NOT NULL DEFAULT 0,

  created_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  issued_at timestamptz,
  paid_at timestamptz,

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_accounting_notes_note_code_unique UNIQUE (note_code),
  CONSTRAINT do_accounting_notes_id_do_unique UNIQUE (id, delivery_order_id),
  CONSTRAINT do_accounting_notes_note_code_not_blank CHECK (length(trim(note_code)) > 0),
  CONSTRAINT do_accounting_notes_total_amount_non_negative CHECK (total_amount >= 0),
  CONSTRAINT do_accounting_notes_currency_uppercase CHECK (currency_code = upper(currency_code))
);

CREATE INDEX idx_do_accounting_notes_do_active
ON delivery_order_accounting_notes (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_accounting_notes_type_status_active
ON delivery_order_accounting_notes (note_type, note_status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_accounting_notes_subject_partner_active
ON delivery_order_accounting_notes (subject_partner_id)
WHERE deleted_at IS NULL;

CREATE TABLE delivery_order_accounting_note_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL,

  accounting_note_id uuid NOT NULL,
  charge_id uuid NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_accounting_note_charges_note_same_do_fk
    FOREIGN KEY (accounting_note_id, delivery_order_id)
    REFERENCES delivery_order_accounting_notes(id, delivery_order_id)
    ON DELETE CASCADE,

  CONSTRAINT do_accounting_note_charges_charge_same_do_fk
    FOREIGN KEY (charge_id, delivery_order_id)
    REFERENCES delivery_order_charges(id, delivery_order_id)
    ON DELETE RESTRICT,

  CONSTRAINT do_accounting_note_charge_unique UNIQUE (accounting_note_id, charge_id)
);

CREATE INDEX idx_do_accounting_note_charges_do_active
ON delivery_order_accounting_note_charges (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_accounting_note_charges_note_active
ON delivery_order_accounting_note_charges (accounting_note_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_accounting_note_charges_charge_active
ON delivery_order_accounting_note_charges (charge_id)
WHERE deleted_at IS NULL;

-- =========================================================
-- eFMS ASSIGNMENT
-- Separate from personnel_tasks because eFMS assignment can target House Bill.
-- =========================================================

CREATE TABLE delivery_order_efms_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  house_bill_id uuid,

  stage_content text NOT NULL,

  assign_to_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  assign_to_name varchar(255),

  personnel_task_id uuid REFERENCES personnel_tasks(id) ON DELETE SET NULL,

  progress smallint NOT NULL DEFAULT 0,
  completed_at timestamptz,

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_efms_assignments_house_bill_same_do_fk
    FOREIGN KEY (house_bill_id, delivery_order_id)
    REFERENCES delivery_order_house_bills(id, delivery_order_id)
    ON DELETE SET NULL (house_bill_id),

  CONSTRAINT do_efms_assignments_stage_content_not_blank CHECK (length(trim(stage_content)) > 0),
  CONSTRAINT do_efms_assignments_progress_range CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT do_efms_assignments_completed_requires_100 CHECK (completed_at IS NULL OR progress = 100)
);

CREATE INDEX idx_do_efms_assignments_do_active
ON delivery_order_efms_assignments (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_efms_assignments_house_bill_active
ON delivery_order_efms_assignments (house_bill_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_efms_assignments_user_active
ON delivery_order_efms_assignments (assign_to_user_id)
WHERE deleted_at IS NULL;

-- =========================================================
-- DOCUMENTS / ATTACHMENTS
-- =========================================================

CREATE TABLE delivery_order_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  house_bill_id uuid,
  container_id uuid,

  document_type varchar(120) NOT NULL,
  alias_name varchar(255),
  original_file_name varchar(255),

  file_url text,
  file_mime_type varchar(120),
  file_size_bytes bigint,

  uploaded_by_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  uploaded_at timestamptz NOT NULL DEFAULT now(),

  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_attachments_house_bill_same_do_fk
    FOREIGN KEY (house_bill_id, delivery_order_id)
    REFERENCES delivery_order_house_bills(id, delivery_order_id)
    ON DELETE SET NULL (house_bill_id),

  CONSTRAINT do_attachments_container_same_do_fk
    FOREIGN KEY (container_id, delivery_order_id)
    REFERENCES delivery_order_containers(id, delivery_order_id)
    ON DELETE SET NULL (container_id),

  CONSTRAINT do_attachments_document_type_not_blank CHECK (length(trim(document_type)) > 0),
  CONSTRAINT do_attachments_file_size_non_negative CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0)
);

CREATE INDEX idx_do_attachments_do_active
ON delivery_order_attachments (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_attachments_house_bill_active
ON delivery_order_attachments (house_bill_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_attachments_container_active
ON delivery_order_attachments (container_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_attachments_document_type_active
ON delivery_order_attachments (document_type)
WHERE deleted_at IS NULL;

-- =========================================================
-- SOP / WORKFLOW MILESTONES
-- =========================================================

CREATE TABLE delivery_order_process_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  delivery_order_id uuid NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,

  milestone_type workflow_milestone_type NOT NULL,
  milestone_status workflow_milestone_status NOT NULL DEFAULT 'PENDING',

  responsible_role app_role,
  responsible_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,

  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,

  sla_hours numeric(8,2),
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,

  CONSTRAINT do_process_milestones_sla_hours_positive CHECK (sla_hours IS NULL OR sla_hours > 0),
  CONSTRAINT do_process_milestones_completed_status CHECK (completed_at IS NULL OR milestone_status IN ('COMPLETED', 'OVERDUE'))
);

CREATE INDEX idx_do_process_milestones_do_active
ON delivery_order_process_milestones (delivery_order_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_process_milestones_type_status_active
ON delivery_order_process_milestones (milestone_type, milestone_status)
WHERE deleted_at IS NULL;

CREATE INDEX idx_do_process_milestones_due_at_active
ON delivery_order_process_milestones (due_at)
WHERE deleted_at IS NULL;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'app_users',
    'partners',
    'purchase_requests',
    'purchase_orders',
    'purchase_order_purchase_requests',
    'delivery_orders',
    'delivery_order_purchase_orders',
    'delivery_order_items',
    'delivery_order_sap_integrations',
    'delivery_order_logistics_shipping',
    'delivery_order_warehouse_tracking',
    'delivery_order_finance_tax',
    'delivery_order_customs_clearance',
    'delivery_order_delivery_tracking',
    'personnel_assignments',
    'personnel_tasks',
    'delivery_order_manifests',
    'delivery_order_shipping_instructions',
    'delivery_order_house_bills',
    'delivery_order_manifest_house_bills',
    'delivery_order_containers',
    'delivery_order_container_items',
    'delivery_order_charges',
    'delivery_order_accounting_notes',
    'delivery_order_accounting_note_charges',
    'delivery_order_efms_assignments',
    'delivery_order_attachments',
    'delivery_order_process_milestones'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      t,
      t
    );
  END LOOP;
END $$;

-- =========================================================
-- OPTIONAL READ MODEL VIEW
-- Helps UI/mock API display DO with linked PO numbers and PR request codes.
-- =========================================================

CREATE VIEW v_delivery_order_summary AS
SELECT
  doo.id,
  doo.delivery_order_number,
  doo.tracking_number,
  doo.purchase_contract_number,
  doo.status,
  doo.notes,
  doo.xnk_notes,
  array_remove(array_agg(DISTINCT dpo.order_number), NULL) AS order_numbers,
  array_remove(array_agg(DISTINCT doi.requested_order_id), NULL) AS request_codes,
  count(DISTINCT doi.id) AS item_count,
  doo.created_at,
  doo.updated_at,
  doo.deleted_at
FROM delivery_orders doo
LEFT JOIN delivery_order_purchase_orders dpo
  ON dpo.delivery_order_id = doo.id
  AND dpo.deleted_at IS NULL
LEFT JOIN delivery_order_items doi
  ON doi.delivery_order_id = doo.id
  AND doi.deleted_at IS NULL
GROUP BY doo.id;
