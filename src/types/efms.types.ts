import type {
  AccountingNoteStatus,
  AccountingNoteType,
  ChargeType,
  FreightTerm,
  HblType,
  IsoDate,
  IsoDateTime,
} from "@/types/common.types"

export type EfmsManifest = {
  id: string
  delivery_order_id: string
  reference_no?: string | null
  supplier_partner_id?: string | null
  supplier_name?: string | null
  vessel?: string | null
  manifest_date?: IsoDate | null
  port_of_loading?: string | null
  port_of_discharge?: string | null
  freight_charge?: FreightTerm | null
  assembling_agent_partner_id?: string | null
  assembling_agent_name?: string | null
  notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsShippingInstruction = {
  id: string
  delivery_order_id: string
  booking_number?: string | null
  issued_by_user_id?: string | null
  issued_by_name?: string | null
  supplier_partner_id?: string | null
  supplier_name?: string | null
  shipper_partner_id?: string | null
  shipper_name?: string | null
  consignee_partner_id?: string | null
  consignee_name?: string | null
  payment_type?: FreightTerm | null
  vessel_name?: string | null
  voyage_no?: string | null
  loading_date?: IsoDate | null
  gross_weight?: number | null
  cbm?: number | null
  notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsHouseBill = {
  id: string
  delivery_order_id: string
  customer_payer_partner_id?: string | null
  customer_payer_name?: string | null
  hbl_number: string
  hbl_type?: HblType | null
  feeder_vessel?: string | null
  mother_vessel?: string | null
  point_of_origin?: string | null
  country_of_origin?: string | null
  place_of_delivery?: string | null
  final_destination?: string | null
  freight_payment?: FreightTerm | null
  freight_payable_at?: string | null
  sailing_date?: IsoDate | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsManifestHouseBill = {
  id: string
  manifest_id: string
  house_bill_id: string
  created_at: IsoDateTime
}

export type EfmsContainer = {
  id: string
  delivery_order_id: string
  house_bill_id?: string | null
  container_type?: string | null
  quantity: number
  container_no?: string | null
  seal_no?: string | null
  vehicle_type?: string | null
  vehicle_no?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsCharge = {
  id: string
  delivery_order_id: string
  house_bill_id?: string | null
  charge_type: ChargeType
  charge_code?: string | null
  charge_name: string
  partner_id?: string | null
  partner_name?: string | null
  quantity: number
  unit?: string | null
  unit_price: number
  currency_code: string
  vat_rate?: number | null
  exchange_date?: IsoDate | null
  final_exchange_rate?: number | null
  is_locked: boolean
  notes?: string | null
  created_by_user_id?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsAccountingNote = {
  id: string
  delivery_order_id: string
  note_type: AccountingNoteType
  note_status: AccountingNoteStatus
  note_code: string
  subject_partner_id?: string | null
  subject_partner_name?: string | null
  note_date?: IsoDate | null
  currency_code: string
  total_amount: number
  created_by_user_id?: string | null
  issued_at?: IsoDateTime | null
  paid_at?: IsoDateTime | null
  notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsAccountingNoteCharge = {
  id: string
  delivery_order_id: string
  accounting_note_id: string
  charge_id: string
  created_at: IsoDateTime
}

export type EfmsAssignment = {
  id: string
  delivery_order_id: string
  house_bill_id?: string | null
  stage_content: string
  assign_to_user_id?: string | null
  assign_to_name?: string | null
  personnel_task_id?: string | null
  progress: number
  completed_at?: IsoDateTime | null
  notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsAttachment = {
  id: string
  delivery_order_id: string
  house_bill_id?: string | null
  document_type: string
  alias_name?: string | null
  original_file_name?: string | null
  file_url?: string | null
  file_mime_type?: string | null
  file_size_bytes?: number | null
  uploaded_by_user_id?: string | null
  uploaded_at: IsoDateTime
  notes?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type EfmsDetail = {
  manifests: EfmsManifest[]
  shipping_instructions: EfmsShippingInstruction[]
  house_bills: EfmsHouseBill[]
  manifest_house_bills: EfmsManifestHouseBill[]
  containers: EfmsContainer[]
  charges: EfmsCharge[]
  accounting_notes: EfmsAccountingNote[]
  accounting_note_charges: EfmsAccountingNoteCharge[]
  assignments: EfmsAssignment[]
  attachments: EfmsAttachment[]
}

