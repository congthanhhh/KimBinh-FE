import type {
  EfmsAccountingNote,
  EfmsAccountingNoteCharge,
  EfmsAssignment,
  EfmsAttachment,
  EfmsCharge,
  EfmsContainer,
  EfmsHouseBill,
  EfmsManifest,
  EfmsManifestHouseBill,
  EfmsShippingInstruction,
} from "@/types/efms.types"

const now = "2026-05-20T09:00:00.000Z"

export const efmsManifestsMock: EfmsManifest[] = [
  {
    id: "MF0001",
    delivery_order_id: "DO0001",
    reference_no: "MF-STEEL-001",
    supplier_partner_id: "PT0001",
    supplier_name: "Korea Steel Materials Co.",
    vessel: "Maersk Oslo",
    manifest_date: "2026-05-22",
    port_of_loading: "Busan",
    port_of_discharge: "Hai Phong",
    freight_charge: "PREPAID",
    assembling_agent_partner_id: "PT0004",
    assembling_agent_name: "Hai Phong Marine Agency",
    notes: "Manifest aligned with steel shipment booking.",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

export const efmsShippingInstructionsMock: EfmsShippingInstruction[] = [
  {
    id: "SI0001",
    delivery_order_id: "DO0001",
    booking_number: "BKG-STEEL-001",
    issued_by_user_id: "US0003",
    issued_by_name: "Nguyen Van A",
    supplier_partner_id: "PT0001",
    supplier_name: "Korea Steel Materials Co.",
    shipper_partner_id: "PT0001",
    shipper_name: "Korea Steel Materials Co.",
    consignee_partner_id: "PT0005",
    consignee_name: "KBI Factory",
    payment_type: "PREPAID",
    vessel_name: "Maersk Oslo",
    voyage_no: "OSL226",
    loading_date: "2026-05-22",
    gross_weight: 10.4,
    cbm: 8.2,
    notes: "SI confirmed by supplier before cut-off.",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

export const efmsHouseBillsMock: EfmsHouseBill[] = [
  {
    id: "HB0001",
    delivery_order_id: "DO0001",
    customer_payer_partner_id: "PT0005",
    customer_payer_name: "KBI Factory",
    hbl_number: "HBL-STEEL-001",
    hbl_type: "SEAWAY_BILL",
    feeder_vessel: "Maersk Feeder 12",
    mother_vessel: "Maersk Oslo",
    point_of_origin: "Busan",
    country_of_origin: "Korea",
    place_of_delivery: "Binh Duong Factory",
    final_destination: "Binh Duong Factory",
    freight_payment: "PREPAID",
    freight_payable_at: "Ho Chi Minh City",
    sailing_date: "2026-05-22",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

export const efmsManifestHouseBillsMock: EfmsManifestHouseBill[] = [
  {
    id: "MH0001",
    manifest_id: "MF0001",
    house_bill_id: "HB0001",
    created_at: now,
  },
]

export const efmsContainersMock: EfmsContainer[] = [
  {
    id: "CT0001",
    delivery_order_id: "DO0001",
    house_bill_id: "HB0001",
    container_type: "20GP",
    quantity: 1,
    container_no: "MSKU1234567",
    seal_no: "SL998811",
    vehicle_type: null,
    vehicle_no: null,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

export const efmsChargesMock: EfmsCharge[] = [
  {
    id: "CH0001",
    delivery_order_id: "DO0001",
    house_bill_id: "HB0001",
    charge_type: "SELLING",
    charge_code: "OF",
    charge_name: "Ocean freight",
    partner_id: "PT0005",
    partner_name: "KBI Factory",
    quantity: 1,
    unit: "shipment",
    unit_price: 14500000,
    currency_code: "VND",
    vat_rate: 0.08,
    exchange_date: "2026-05-22",
    final_exchange_rate: 1,
    is_locked: true,
    notes: "Round 1 debit note charge.",
    created_by_user_id: "US0003",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
  {
    id: "CH0002",
    delivery_order_id: "DO0001",
    house_bill_id: "HB0001",
    charge_type: "BUYING",
    charge_code: "THC",
    charge_name: "Terminal handling charge",
    partner_id: "PT0003",
    partner_name: "Maersk Line",
    quantity: 1,
    unit: "container",
    unit_price: 2200000,
    currency_code: "VND",
    vat_rate: 0.08,
    exchange_date: "2026-05-22",
    final_exchange_rate: 1,
    is_locked: false,
    notes: null,
    created_by_user_id: "US0003",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

export const efmsAccountingNotesMock: EfmsAccountingNote[] = [
  {
    id: "AN0001",
    delivery_order_id: "DO0001",
    note_type: "DEBIT_NOTE",
    note_status: "ISSUED",
    note_code: "DN-STEEL-001-R1",
    subject_partner_id: "PT0005",
    subject_partner_name: "KBI Factory",
    note_date: "2026-05-23",
    currency_code: "VND",
    total_amount: 14500000,
    created_by_user_id: "US0003",
    issued_at: "2026-05-23T05:00:00.000Z",
    paid_at: null,
    notes: "Freight charge debit note round 1.",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

export const efmsAccountingNoteChargesMock: EfmsAccountingNoteCharge[] = [
  {
    id: "AC0001",
    delivery_order_id: "DO0001",
    accounting_note_id: "AN0001",
    charge_id: "CH0001",
    created_at: now,
  },
]

export const efmsAssignmentsMock: EfmsAssignment[] = [
  {
    id: "EA0001",
    delivery_order_id: "DO0001",
    house_bill_id: "HB0001",
    stage_content: "Review draft B/L against CI and PL",
    assign_to_user_id: "US0006",
    assign_to_name: "Le Van C",
    personnel_task_id: "TS0004",
    progress: 80,
    completed_at: null,
    notes: "Follow SOP document review stage.",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

export const efmsAttachmentsMock: EfmsAttachment[] = [
  {
    id: "AT0001",
    delivery_order_id: "DO0001",
    house_bill_id: "HB0001",
    document_type: "Commercial Invoice",
    alias_name: "CI steel lot A",
    original_file_name: "ci-steel-001.pdf",
    file_url: "/mock-files/ci-steel-001.pdf",
    file_mime_type: "application/pdf",
    file_size_bytes: 188000,
    uploaded_by_user_id: "US0003",
    uploaded_at: "2026-05-22T09:00:00.000Z",
    notes: "Mock document URL only.",
    created_at: now,
    updated_at: now,
    deleted_at: null,
  },
]

