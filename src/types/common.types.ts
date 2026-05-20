export type IsoDate = string
export type IsoDateTime = string

export type AppRole =
  | "admin"
  | "requester"
  | "purchasing_manager"
  | "sale_staff"
  | "port_officer"
  | "customs_officer"

export type PartnerType =
  | "SUPPLIER"
  | "CUSTOMER"
  | "CARRIER"
  | "AGENT"
  | "COLOADER"
  | "SHIPPER"
  | "CONSIGNEE"
  | "FORWARDER"
  | "OTHER"

export type FreightTerm = "PREPAID" | "COLLECT"
export type ShipmentType = "FREEHAND" | "NOMINATED"
export type MblType = "COPY" | "ORIGINAL" | "SEAWAY_BILL" | "SURRENDERED"
export type HblType = "COPY" | "ORIGINAL" | "SEAWAY_BILL" | "SURRENDERED"
export type CustomsChannel = "GREEN" | "YELLOW" | "RED"
export type CargoReleaseStatus = "UNKNOWN" | "NOT_RELEASED" | "RELEASED" | "TELEX_RELEASED"
export type ChargeType = "SELLING" | "BUYING" | "OBH"
export type AccountingNoteType = "DEBIT_NOTE" | "CREDIT_NOTE" | "INVOICE"
export type AccountingNoteStatus = "DRAFT" | "ISSUED" | "CANCELLED" | "PAID"
export type WorkflowMilestoneType =
  | "REQUEST_RESPONSE"
  | "QUOTATION"
  | "BOOKING"
  | "DRAFT_BL_REVIEW"
  | "FINAL_BL"
  | "CUSTOMS_DECLARATION"
  | "CUSTOMS_CLEARANCE"
  | "DELIVERY_ORDER_RELEASE"
  | "TRANSPORTATION"
  | "POD"
  | "DEBIT_NOTE_ROUND_1"
  | "DEBIT_NOTE_ROUND_2"
  | "ARCHIVING"
export type WorkflowMilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "CANCELLED"

export type AppUser = {
  id: string
  display_name: string
  email: string
  role: AppRole
  is_active: boolean
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type Partner = {
  id: string
  partner_code?: string | null
  partner_name: string
  partner_type: PartnerType
  tax_code?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  address?: string | null
  created_at: IsoDateTime
  updated_at: IsoDateTime
  deleted_at?: IsoDateTime | null
}

export type MockActor = {
  user_id?: string
  role: AppRole
}

export type MockApiErrorCode =
  | "VALIDATION_ERROR"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_RELATIONSHIP"

export type MockApiErrorPayload = {
  code: MockApiErrorCode
  message: string
  status: number
  details?: Record<string, unknown>
}

