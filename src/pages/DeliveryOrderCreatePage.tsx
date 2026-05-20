import { type Dispatch, type FormEvent, type ReactNode, type SetStateAction, useCallback, useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { MultiSelectDropdown, type MultiSelectOption } from "@/components/shared/MultiSelectDropdown"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoStore, type CreateFullDeliveryOrderInput } from "@/store/demoStore"
import type { PurchaseRequest } from "@/types"
import type { Partner } from "@/types/common.types"
import type { PurchaseOrderDetail } from "@/types/purchase-order.types"
import { displayValue, formatOptionalDate } from "@/utils/formatters"
import { actionUnavailableReason, canPerform } from "@/utils/permissions"

type SourceMode = "po" | "pr"
type PoMode = "existing" | "inline" | "later"

type DeliveryOrderFormState = {
  delivery_order_number: string
  tracking_number: string
  purchase_contract_number: string
  status: CreateFullDeliveryOrderInput["order_info"]["status"]
  notes: string
  xnk_notes: string
  item_name_requested: string
  unit: string
  quantity: string
  lot_number: string
  lot_unit_quantity: string
  lot_unit_type: string
  packaging_type: string
  gross_weight: string
  cbm: string
  commodity_group: string
  supplier_code: string
  actual_item_code: string
  raw_date: string
  po_number: string
  incoterms: string
  shipping_method: string
  shipping_line: string
  shipping_line_partner_id: string
  coloader_name: string
  coloader_partner_id: string
  agent_name: string
  agent_partner_id: string
  vessel_code: string
  vessel_name: string
  voyage_no: string
  booking_number: string
  service_type: string
  mbl_number: string
  mbl_type: "" | "COPY" | "ORIGINAL" | "SEAWAY_BILL" | "SURRENDERED"
  port_of_departure: string
  port_of_loading: string
  port_of_discharge: string
  port_of_destination: string
  freight_term: "" | "PREPAID" | "COLLECT"
  shipment_type: "" | "FREEHAND" | "NOMINATED"
  person_in_charge_name: string
  person_in_charge_user_id: string
  logistics_commodity_group: string
  documents_list: string
  cut_off_date: string
  etd_planned: string
  etd_actual: string
  etr_planned: string
  eta_planned: string
  eta_actual: string
  atd_actual: string
  ata_actual: string
  production_ready_date: string
  warehouse_deadline: string
  planned_entry_date: string
  actual_entry_date: string
  import_tax_rate: string
  tax_amount: string
  currency_code: string
  tax_payment_deadline: string
  insurance: string
}

type PurchaseOrderFormState = {
  order_number: string
  purchase_contract_number: string
  supplier_partner_id: string
  supplier_code: string
  supplier_name: string
  status: "DRAFT" | "CREATED" | "CONFIRMED" | "PARTIALLY_DELIVERED" | "COMPLETED" | "CANCELLED"
  notes: string
}

export function DeliveryOrderCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const purchaseRequests = useDemoStore((state) => state.purchaseRequests)
  const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
  const purchaseOrderDetailsById = useDemoStore((state) => state.purchaseOrderDetailsById)
  const referencePartners = useDemoStore((state) => state.referencePartners)
  const createFullDeliveryOrder = useDemoStore((state) => state.createFullDeliveryOrder)
  const canCreateDeliveryOrder = canPerform(selectedRole, "createDeliveryOrder")
  const purchaseOrders = useMemo(() => Object.values(purchaseOrderDetailsById), [purchaseOrderDetailsById])
  const [sourceMode, setSourceMode] = useState<SourceMode>(searchParams.get("pr") ? "pr" : "po")
  const [selectedPurchaseOrderIds, setSelectedPurchaseOrderIds] = useState(() => searchParams.get("po") ? [searchParams.get("po") ?? ""] : [])
  const [selectedPurchaseRequestIds, setSelectedPurchaseRequestIds] = useState(() => searchParams.get("pr") ? [searchParams.get("pr") ?? ""] : [])
  const [poMode, setPoMode] = useState<PoMode>("existing")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(() => buildInitialDeliveryOrderForm(deliveryOrders.length))
  const [inlinePurchaseOrder, setInlinePurchaseOrder] = useState(buildInitialPurchaseOrderForm)

  const selectedPurchaseOrders = useMemo(
    () => purchaseOrders.filter((order) => selectedPurchaseOrderIds.includes(order.id)),
    [purchaseOrders, selectedPurchaseOrderIds]
  )
  const aggregatedPurchaseRequests = useMemo(
    () => {
      if (selectedPurchaseOrderIds.length === 0) return []
      const requestById = new Map<string, PurchaseRequest>()
      for (const order of selectedPurchaseOrders) {
        for (const request of order.purchase_requests) {
          const storeRequest = purchaseRequests.find((item) => item.id === request.id)
          if (storeRequest) requestById.set(storeRequest.id, storeRequest)
        }
      }
      for (const request of purchaseRequests) {
        if (request.purchase_order_ids.some((id) => selectedPurchaseOrderIds.includes(id))) {
          requestById.set(request.id, request)
        }
      }
      return [...requestById.values()]
    },
    [purchaseRequests, selectedPurchaseOrderIds, selectedPurchaseOrders]
  )
  const selectedPurchaseRequests = useMemo(
    () => purchaseRequests.filter((request) => selectedPurchaseRequestIds.includes(request.id) || selectedPurchaseRequestIds.includes(request.requested_order_id)),
    [purchaseRequests, selectedPurchaseRequestIds]
  )
  const effectivePurchaseRequests = sourceMode === "po" ? aggregatedPurchaseRequests : selectedPurchaseRequests
  const selectedPurchaseRequest = effectivePurchaseRequests[0]
  const selectedPurchaseOrder =
    selectedPurchaseOrders[0] ??
    (selectedPurchaseRequest?.purchase_order_ids[0] ? purchaseOrderDetailsById[selectedPurchaseRequest.purchase_order_ids[0]] : undefined)
  const supplierPartners = referencePartners.filter((partner) => partner.partner_type === "SUPPLIER")
  const effectiveForm = mergeDefaults(form, selectedPurchaseRequest, selectedPurchaseOrder)
  const purchaseOrderOptions = useMemo<MultiSelectOption[]>(
    () =>
      purchaseOrders.map((order) => ({
        value: order.id,
        label: `${order.order_number} - ${displayValue(order.supplier_name)}`,
        description: `${order.status} | ${order.purchase_requests.length} PR`,
      })),
    [purchaseOrders]
  )
  const purchaseRequestOptions = useMemo<MultiSelectOption[]>(
    () =>
      purchaseRequests.map((request) => ({
        value: request.id,
        label: `${request.requested_order_id} - ${request.item_name}`,
        description: `${request.quantity.toLocaleString()} ${request.unit} | ${request.status}`,
      })),
    [purchaseRequests]
  )

  const handlePurchaseOrderSelection = useCallback((nextIds: string[]) => {
    const nextOrders = purchaseOrders.filter((order) => nextIds.includes(order.id))
    const nextRequestIds = uniqueDefined(nextOrders.flatMap((order) => order.purchase_requests.map((request) => request.id)))
    const firstOrder = nextOrders[0]
    const firstRequest = purchaseRequests.find((request) => nextRequestIds.includes(request.id))

    setSelectedPurchaseOrderIds(nextIds)
    setSelectedPurchaseRequestIds(nextRequestIds)
    setPoMode("existing")
    setForm((current) => mergeDefaults(current, firstRequest, firstOrder))
  }, [purchaseOrders, purchaseRequests])

  const handlePurchaseRequestSelection = useCallback((nextIds: string[]) => {
    const nextRequest = purchaseRequests.find((request) => nextIds.includes(request.id))
    const nextPurchaseOrder = nextRequest?.purchase_order_ids[0] ? purchaseOrderDetailsById[nextRequest.purchase_order_ids[0]] : selectedPurchaseOrder

    setSelectedPurchaseRequestIds(nextIds)
    if (sourceMode === "pr" && nextRequest?.purchase_order_ids[0]) {
      setSelectedPurchaseOrderIds(nextRequest.purchase_order_ids)
      setPoMode("existing")
    }
    setForm((current) => mergeDefaults(current, nextRequest, nextPurchaseOrder))
    setInlinePurchaseOrder((current) => mergeInlinePoDefaults(current, nextRequest, supplierPartners[0]))
  }, [purchaseOrderDetailsById, purchaseRequests, selectedPurchaseOrder, sourceMode, supplierPartners])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canCreateDeliveryOrder) return

    const submissionForm = mergeDefaults(form, selectedPurchaseRequest, selectedPurchaseOrder)
    const validationMessage = validateForm(submissionForm, selectedPurchaseRequest, selectedPurchaseOrder, poMode, inlinePurchaseOrder)
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setIsSubmitting(true)
    setError(null)

    const created = await createFullDeliveryOrder({
      purchase_order_ids: selectedPurchaseOrders.map((order) => order.id),
      purchase_request_ids: effectivePurchaseRequests.map((request) => request.id),
      inline_purchase_order: poMode === "inline" && selectedPurchaseOrders.length === 0 ? toPurchaseOrderInput(inlinePurchaseOrder) : null,
      order_info: {
        delivery_order_number: submissionForm.delivery_order_number.trim(),
        tracking_number: optionalString(submissionForm.tracking_number),
        purchase_contract_number: optionalString(submissionForm.purchase_contract_number),
        status: submissionForm.status,
        notes: optionalString(submissionForm.notes),
        xnk_notes: optionalString(submissionForm.xnk_notes),
      },
      product_details: {
        item_name_requested: submissionForm.item_name_requested.trim(),
        unit: submissionForm.unit.trim(),
        quantity: toNumber(submissionForm.quantity, 1),
        lot_number: optionalString(submissionForm.lot_number),
        lot_unit_quantity: optionalNumber(submissionForm.lot_unit_quantity),
        lot_unit_type: optionalString(submissionForm.lot_unit_type),
        packaging_type: optionalString(submissionForm.packaging_type),
        gross_weight: optionalNumber(submissionForm.gross_weight),
        cbm: optionalNumber(submissionForm.cbm),
        commodity_group: optionalString(submissionForm.commodity_group),
      },
      sap_integration: {
        supplier_code: optionalString(submissionForm.supplier_code),
        actual_item_code: optionalString(submissionForm.actual_item_code),
        raw_date: optionalString(submissionForm.raw_date),
        po_number: optionalString(submissionForm.po_number),
      },
      logistics_shipping: {
        incoterms: optionalString(submissionForm.incoterms),
        shipping_method: optionalString(submissionForm.shipping_method),
        shipping_line: optionalString(submissionForm.shipping_line),
        shipping_line_partner_id: optionalString(submissionForm.shipping_line_partner_id),
        coloader_name: optionalString(submissionForm.coloader_name),
        coloader_partner_id: optionalString(submissionForm.coloader_partner_id),
        agent_name: optionalString(submissionForm.agent_name),
        agent_partner_id: optionalString(submissionForm.agent_partner_id),
        vessel_code: optionalString(submissionForm.vessel_code),
        vessel_name: optionalString(submissionForm.vessel_name),
        voyage_no: optionalString(submissionForm.voyage_no),
        booking_number: optionalString(submissionForm.booking_number),
        service_type: optionalString(submissionForm.service_type),
        mbl_number: optionalString(submissionForm.mbl_number),
        mbl_type: submissionForm.mbl_type || null,
        port_of_departure: optionalString(submissionForm.port_of_departure),
        port_of_loading: optionalString(submissionForm.port_of_loading),
        port_of_discharge: optionalString(submissionForm.port_of_discharge),
        port_of_destination: optionalString(submissionForm.port_of_destination),
        freight_term: submissionForm.freight_term || null,
        shipment_type: submissionForm.shipment_type || null,
        person_in_charge_name: optionalString(submissionForm.person_in_charge_name),
        person_in_charge_user_id: optionalString(submissionForm.person_in_charge_user_id),
        commodity_group: optionalString(submissionForm.logistics_commodity_group),
        documents_list: submissionForm.documents_list.split(",").map((item) => item.trim()).filter(Boolean),
        cut_off_date: optionalString(submissionForm.cut_off_date),
        etd_planned: optionalString(submissionForm.etd_planned),
        etd_actual: optionalString(submissionForm.etd_actual),
        etr_planned: optionalString(submissionForm.etr_planned),
        eta_planned: optionalString(submissionForm.eta_planned),
        eta_actual: optionalString(submissionForm.eta_actual),
        atd_actual: optionalString(submissionForm.atd_actual),
        ata_actual: optionalString(submissionForm.ata_actual),
      },
      warehouse_tracking: {
        production_ready_date: optionalString(submissionForm.production_ready_date),
        warehouse_deadline: optionalString(submissionForm.warehouse_deadline),
        planned_entry_date: optionalString(submissionForm.planned_entry_date),
        actual_entry_date: optionalString(submissionForm.actual_entry_date),
      },
      finance_tax: {
        import_tax_rate: optionalTaxRate(submissionForm.import_tax_rate),
        tax_amount: optionalNumber(submissionForm.tax_amount),
        currency_code: submissionForm.currency_code.trim() || "VND",
        tax_payment_deadline: optionalString(submissionForm.tax_payment_deadline),
        insurance: optionalString(submissionForm.insurance),
      },
    })

    setIsSubmitting(false)
    if (created) navigate(`/delivery-orders/${created.order_info.order_number}`)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tạo Delivery Order"
        description="Tạo DO từ PO hoặc PR, tự điền thông tin liên quan và nhập các module vận chuyển, kho, tài chính theo schema mock API."
        action={<Button variant="outline" nativeButton={false} render={<Link to="/delivery-orders" />}>Quay lại danh sách</Button>}
      />

      {!canCreateDeliveryOrder && (
        <Card>
          <CardContent className="text-sm text-muted-foreground">{actionUnavailableReason}</CardContent>
        </Card>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Nguồn tạo DO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={sourceMode === "po" ? "default" : "outline"} onClick={() => setSourceMode("po")}>
                Từ PO
              </Button>
              <Button type="button" variant={sourceMode === "pr" ? "default" : "outline"} onClick={() => setSourceMode("pr")}>
                Từ PR
              </Button>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {sourceMode === "po" && (
                <MultiSelectDropdown
                  label="Purchase Orders"
                  required
                  options={purchaseOrderOptions}
                  value={selectedPurchaseOrderIds}
                  onChange={handlePurchaseOrderSelection}
                  placeholder="Chọn PO"
                  emptyMessage="Chưa có PO để tạo DO."
                />
              )}

              {sourceMode === "pr" ? (
                <MultiSelectDropdown
                  label="Purchase Requests"
                  required
                  options={purchaseRequestOptions}
                  value={selectedPurchaseRequestIds}
                  onChange={handlePurchaseRequestSelection}
                  placeholder="Chọn PR"
                  emptyMessage="Chưa có PR để tạo DO."
                />
              ) : (
                <AggregatedPurchaseRequestsTable requests={aggregatedPurchaseRequests} />
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <SummaryItem label="PO" value={selectedPurchaseOrders.map((order) => order.order_number).join(", ")} />
              <SummaryItem label="Nhà cung cấp" value={selectedPurchaseOrder?.supplier_name ?? inlinePurchaseOrder.supplier_name} />
              <SummaryItem label="PR đã chọn" value={effectivePurchaseRequests.map((request) => request.requested_order_id).join(", ")} />
              <SummaryItem label="Hàng hóa" value={selectedPurchaseRequest?.item_name} />
              <SummaryItem label="Số lượng PR" value={selectedPurchaseRequest ? `${selectedPurchaseRequest.quantity.toLocaleString()} ${selectedPurchaseRequest.unit}` : null} />
              <SummaryItem label="Hạn kho" value={formatOptionalDate(selectedPurchaseRequest?.warehouse_deadline_date)} />
            </div>

            {sourceMode === "pr" && selectedPurchaseRequest && selectedPurchaseOrders.length === 0 && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant={poMode === "inline" ? "default" : "outline"} onClick={() => setPoMode("inline")}>
                    Tạo PO nhanh
                  </Button>
                  <Button type="button" variant={poMode === "later" ? "default" : "outline"} onClick={() => setPoMode("later")}>
                    Bỏ qua để sau
                  </Button>
                </div>
                {poMode === "inline" && (
                  <PurchaseOrderInlineFields
                    value={inlinePurchaseOrder}
                    partners={supplierPartners}
                    onChange={setInlinePurchaseOrder}
                  />
                )}
                {poMode === "later" && (
                  <div className="text-sm text-muted-foreground">
                    Mock API hiện yêu cầu DO có PO trước khi lưu, nên nút lưu sẽ chờ đến khi có PO.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="core">
          <Card>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="h-auto min-w-max justify-start">
                  <TabsTrigger value="core">DO</TabsTrigger>
                  <TabsTrigger value="product">Sản phẩm</TabsTrigger>
                  <TabsTrigger value="sap">SAP</TabsTrigger>
                  <TabsTrigger value="logistics">Logistics</TabsTrigger>
                  <TabsTrigger value="warehouse">Kho</TabsTrigger>
                  <TabsTrigger value="finance">Finance/Tax</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="core">
                <SectionGrid>
                  <TextField label="Số DO" required value={effectiveForm.delivery_order_number} onChange={(value) => updateForm(setForm, "delivery_order_number", value)} />
                  <TextField label="Tracking number" value={effectiveForm.tracking_number} onChange={(value) => updateForm(setForm, "tracking_number", value)} />
                  <TextField label="Hợp đồng mua" value={effectiveForm.purchase_contract_number} onChange={(value) => updateForm(setForm, "purchase_contract_number", value)} />
                  <Field label="Trạng thái" required>
                    <select
                      className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                      value={effectiveForm.status}
                      onChange={(event) => updateForm(setForm, "status", event.target.value as DeliveryOrderFormState["status"])}
                    >
                      {["DRAFT", "PO_CREATED", "IN_TRANSIT", "CUSTOMS_PROCESSING", "WAREHOUSE_RECEIVED", "COMPLETED", "DELAYED"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </Field>
                  <TextField label="Ghi chú" value={effectiveForm.notes} onChange={(value) => updateForm(setForm, "notes", value)} />
                  <TextField label="Ghi chú XNK" value={effectiveForm.xnk_notes} onChange={(value) => updateForm(setForm, "xnk_notes", value)} />
                </SectionGrid>
              </TabsContent>

              <TabsContent value="product">
                <SectionGrid>
                  <TextField label="Tên hàng" required value={effectiveForm.item_name_requested} onChange={(value) => updateForm(setForm, "item_name_requested", value)} />
                  <TextField label="Đơn vị" required value={effectiveForm.unit} onChange={(value) => updateForm(setForm, "unit", value)} />
                  <TextField label="Số lượng" required type="number" value={effectiveForm.quantity} onChange={(value) => updateForm(setForm, "quantity", value)} />
                  <TextField label="LOT number" value={effectiveForm.lot_number} onChange={(value) => updateForm(setForm, "lot_number", value)} />
                  <TextField label="LOT quantity" type="number" value={effectiveForm.lot_unit_quantity} onChange={(value) => updateForm(setForm, "lot_unit_quantity", value)} />
                  <TextField label="LOT unit" value={effectiveForm.lot_unit_type} onChange={(value) => updateForm(setForm, "lot_unit_type", value)} />
                  <TextField label="Đóng gói" value={effectiveForm.packaging_type} onChange={(value) => updateForm(setForm, "packaging_type", value)} />
                  <TextField label="Gross weight" type="number" value={effectiveForm.gross_weight} onChange={(value) => updateForm(setForm, "gross_weight", value)} />
                  <TextField label="CBM" type="number" value={effectiveForm.cbm} onChange={(value) => updateForm(setForm, "cbm", value)} />
                  <TextField label="Commodity group" value={effectiveForm.commodity_group} onChange={(value) => updateForm(setForm, "commodity_group", value)} />
                </SectionGrid>
              </TabsContent>

              <TabsContent value="sap">
                <SectionGrid>
                  <TextField label="Supplier code" value={effectiveForm.supplier_code} onChange={(value) => updateForm(setForm, "supplier_code", value)} />
                  <TextField label="Mã hàng thực tế" value={effectiveForm.actual_item_code} onChange={(value) => updateForm(setForm, "actual_item_code", value)} />
                  <TextField label="Raw date" type="date" value={effectiveForm.raw_date} onChange={(value) => updateForm(setForm, "raw_date", value)} />
                  <TextField label="PO number" value={effectiveForm.po_number} onChange={(value) => updateForm(setForm, "po_number", value)} />
                </SectionGrid>
              </TabsContent>

              <TabsContent value="logistics">
                <SectionGrid>
                  <TextField label="Incoterms" value={effectiveForm.incoterms} onChange={(value) => updateForm(setForm, "incoterms", value)} />
                  <TextField label="Phương thức vận chuyển" value={effectiveForm.shipping_method} onChange={(value) => updateForm(setForm, "shipping_method", value)} />
                  <TextField label="Hãng tàu" value={effectiveForm.shipping_line} onChange={(value) => updateForm(setForm, "shipping_line", value)} />
                  <TextField label="Shipping line partner ID" value={effectiveForm.shipping_line_partner_id} onChange={(value) => updateForm(setForm, "shipping_line_partner_id", value)} />
                  <TextField label="Coloader" value={effectiveForm.coloader_name} onChange={(value) => updateForm(setForm, "coloader_name", value)} />
                  <TextField label="Coloader partner ID" value={effectiveForm.coloader_partner_id} onChange={(value) => updateForm(setForm, "coloader_partner_id", value)} />
                  <TextField label="Agent" value={effectiveForm.agent_name} onChange={(value) => updateForm(setForm, "agent_name", value)} />
                  <TextField label="Agent partner ID" value={effectiveForm.agent_partner_id} onChange={(value) => updateForm(setForm, "agent_partner_id", value)} />
                  <TextField label="Mã tàu" value={effectiveForm.vessel_code} onChange={(value) => updateForm(setForm, "vessel_code", value)} />
                  <TextField label="Tên tàu" value={effectiveForm.vessel_name} onChange={(value) => updateForm(setForm, "vessel_name", value)} />
                  <TextField label="Voyage" value={effectiveForm.voyage_no} onChange={(value) => updateForm(setForm, "voyage_no", value)} />
                  <TextField label="Booking" value={effectiveForm.booking_number} onChange={(value) => updateForm(setForm, "booking_number", value)} />
                  <TextField label="Service type" value={effectiveForm.service_type} onChange={(value) => updateForm(setForm, "service_type", value)} />
                  <TextField label="MBL number" value={effectiveForm.mbl_number} onChange={(value) => updateForm(setForm, "mbl_number", value)} />
                  <SelectField label="MBL type" value={effectiveForm.mbl_type} options={["", "COPY", "ORIGINAL", "SEAWAY_BILL", "SURRENDERED"]} onChange={(value) => updateForm(setForm, "mbl_type", value as DeliveryOrderFormState["mbl_type"])} />
                  <TextField label="Cảng đi" value={effectiveForm.port_of_departure} onChange={(value) => updateForm(setForm, "port_of_departure", value)} />
                  <TextField label="Port of loading" value={effectiveForm.port_of_loading} onChange={(value) => updateForm(setForm, "port_of_loading", value)} />
                  <TextField label="Port of discharge" value={effectiveForm.port_of_discharge} onChange={(value) => updateForm(setForm, "port_of_discharge", value)} />
                  <TextField label="Cảng đến" value={effectiveForm.port_of_destination} onChange={(value) => updateForm(setForm, "port_of_destination", value)} />
                  <SelectField label="Freight term" value={effectiveForm.freight_term} options={["", "PREPAID", "COLLECT"]} onChange={(value) => updateForm(setForm, "freight_term", value as DeliveryOrderFormState["freight_term"])} />
                  <SelectField label="Shipment type" value={effectiveForm.shipment_type} options={["", "FREEHAND", "NOMINATED"]} onChange={(value) => updateForm(setForm, "shipment_type", value as DeliveryOrderFormState["shipment_type"])} />
                  <TextField label="PIC logistics" value={effectiveForm.person_in_charge_name} onChange={(value) => updateForm(setForm, "person_in_charge_name", value)} />
                  <TextField label="PIC user ID" value={effectiveForm.person_in_charge_user_id} onChange={(value) => updateForm(setForm, "person_in_charge_user_id", value)} />
                  <TextField label="Commodity group" value={effectiveForm.logistics_commodity_group} onChange={(value) => updateForm(setForm, "logistics_commodity_group", value)} />
                  <TextField label="Documents list" value={effectiveForm.documents_list} onChange={(value) => updateForm(setForm, "documents_list", value)} />
                  <TextField label="Cut-off" type="date" value={effectiveForm.cut_off_date} onChange={(value) => updateForm(setForm, "cut_off_date", value)} />
                  <TextField label="ETD kế hoạch" type="date" value={effectiveForm.etd_planned} onChange={(value) => updateForm(setForm, "etd_planned", value)} />
                  <TextField label="ETD thực tế" type="date" value={effectiveForm.etd_actual} onChange={(value) => updateForm(setForm, "etd_actual", value)} />
                  <TextField label="ETR kế hoạch" type="date" value={effectiveForm.etr_planned} onChange={(value) => updateForm(setForm, "etr_planned", value)} />
                  <TextField label="ETA kế hoạch" type="date" value={effectiveForm.eta_planned} onChange={(value) => updateForm(setForm, "eta_planned", value)} />
                  <TextField label="ETA thực tế" type="date" value={effectiveForm.eta_actual} onChange={(value) => updateForm(setForm, "eta_actual", value)} />
                  <TextField label="ATD thực tế" type="date" value={effectiveForm.atd_actual} onChange={(value) => updateForm(setForm, "atd_actual", value)} />
                  <TextField label="ATA thực tế" type="date" value={effectiveForm.ata_actual} onChange={(value) => updateForm(setForm, "ata_actual", value)} />
                </SectionGrid>
              </TabsContent>

              <TabsContent value="warehouse">
                <SectionGrid>
                  <TextField label="Sản xuất sẵn sàng" type="date" value={effectiveForm.production_ready_date} onChange={(value) => updateForm(setForm, "production_ready_date", value)} />
                  <TextField label="Hạn nhập kho" type="date" value={effectiveForm.warehouse_deadline} onChange={(value) => updateForm(setForm, "warehouse_deadline", value)} />
                  <TextField label="Ngày nhập kho kế hoạch" type="date" value={effectiveForm.planned_entry_date} onChange={(value) => updateForm(setForm, "planned_entry_date", value)} />
                  <TextField label="Ngày nhập kho thực tế" type="date" value={effectiveForm.actual_entry_date} onChange={(value) => updateForm(setForm, "actual_entry_date", value)} />
                </SectionGrid>
              </TabsContent>

              <TabsContent value="finance">
                <SectionGrid>
                  <TextField label="Thuế nhập khẩu" value={effectiveForm.import_tax_rate} onChange={(value) => updateForm(setForm, "import_tax_rate", value)} />
                  <TextField label="Số tiền thuế" type="number" value={effectiveForm.tax_amount} onChange={(value) => updateForm(setForm, "tax_amount", value)} />
                  <TextField label="Tiền tệ" required value={effectiveForm.currency_code} onChange={(value) => updateForm(setForm, "currency_code", value)} />
                  <TextField label="Hạn nộp thuế" type="date" value={effectiveForm.tax_payment_deadline} onChange={(value) => updateForm(setForm, "tax_payment_deadline", value)} />
                  <TextField label="Bảo hiểm" value={effectiveForm.insurance} onChange={(value) => updateForm(setForm, "insurance", value)} />
                </SectionGrid>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="flex flex-wrap gap-2">
          {canCreateDeliveryOrder ? (
            <Button type="submit" disabled={isSubmitting || poMode === "later"}>
              {isSubmitting ? "Đang tạo..." : "Tạo DO"}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">{actionUnavailableReason}</span>
          )}
          <Button type="button" variant="outline" onClick={() => navigate("/delivery-orders")}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  )
}

function PurchaseOrderInlineFields({
  value,
  partners,
  onChange,
}: {
  value: PurchaseOrderFormState
  partners: Partner[]
  onChange: (value: PurchaseOrderFormState) => void
}) {
  return (
    <SectionGrid>
      <TextField label="Số PO" required value={value.order_number} onChange={(next) => onChange({ ...value, order_number: next })} />
      <TextField label="Hợp đồng mua" value={value.purchase_contract_number} onChange={(next) => onChange({ ...value, purchase_contract_number: next })} />
      <Field label="Nhà cung cấp">
        <select
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          value={value.supplier_partner_id}
          onChange={(event) => {
            const partner = partners.find((item) => item.id === event.target.value)
            onChange({
              ...value,
              supplier_partner_id: event.target.value,
              supplier_code: partner?.partner_code ?? value.supplier_code,
              supplier_name: partner?.partner_name ?? value.supplier_name,
            })
          }}
        >
          <option value="">Chọn NCC</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>{partner.partner_name}</option>
          ))}
        </select>
      </Field>
      <TextField label="Supplier code" value={value.supplier_code} onChange={(next) => onChange({ ...value, supplier_code: next })} />
      <TextField label="Supplier name" value={value.supplier_name} onChange={(next) => onChange({ ...value, supplier_name: next })} />
      <SelectField label="Trạng thái PO" value={value.status} options={["DRAFT", "CREATED", "CONFIRMED", "PARTIALLY_DELIVERED", "COMPLETED", "CANCELLED"]} onChange={(next) => onChange({ ...value, status: next as PurchaseOrderFormState["status"] })} />
      <TextField label="Ghi chú PO" value={value.notes} onChange={(next) => onChange({ ...value, notes: next })} />
    </SectionGrid>
  )
}

function AggregatedPurchaseRequestsTable({ requests }: { requests: PurchaseRequest[] }) {
  return (
    <section className="min-w-0 space-y-2 rounded-lg border p-3">
      <div>
        <div className="text-sm font-medium">PR tự động từ PO đã chọn</div>
        <div className="text-xs text-muted-foreground">Danh sách này chỉ đọc và được tổng hợp từ các PO đang chọn.</div>
      </div>
      <Table className="min-w-150 table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">PR</TableHead>
            <TableHead>Hàng hóa</TableHead>
            <TableHead className="w-28">Số lượng</TableHead>
            <TableHead className="w-28">Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.requested_order_id}</TableCell>
              <TableCell><div className="truncate">{request.item_name}</div></TableCell>
              <TableCell>{request.quantity.toLocaleString()} {request.unit}</TableCell>
              <TableCell>{request.status}</TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">Chọn PO để xem PR liên quan.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  )
}

function TextField({
  label,
  required,
  value,
  type = "text",
  onChange,
}: {
  label: string
  required?: boolean
  value: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label} required={required}>
      <Input
        className={required && !value ? "border-red-300" : undefined}
        value={value}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </Field>
  )
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <Field label={label}>
      <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option || "empty"} value={option}>{option || "—"}</option>
        ))}
      </select>
    </Field>
  )
}

function SectionGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{children}</div>
}

function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-medium">{value || <span className="text-gray-400">—</span>}</div>
    </div>
  )
}

function buildInitialDeliveryOrderForm(existingCount: number): DeliveryOrderFormState {
  const today = new Date().toISOString().slice(0, 10)

  return {
    delivery_order_number: `DO-DEMO-${String(existingCount + 1).padStart(4, "0")}`,
    tracking_number: `TRK-DEMO-${String(existingCount + 1).padStart(4, "0")}`,
    purchase_contract_number: "",
    status: "PO_CREATED",
    notes: "",
    xnk_notes: "",
    item_name_requested: "",
    unit: "",
    quantity: "",
    lot_number: "",
    lot_unit_quantity: "",
    lot_unit_type: "",
    packaging_type: "",
    gross_weight: "",
    cbm: "",
    commodity_group: "",
    supplier_code: "",
    actual_item_code: "",
    raw_date: today,
    po_number: "",
    incoterms: "",
    shipping_method: "",
    shipping_line: "",
    shipping_line_partner_id: "",
    coloader_name: "",
    coloader_partner_id: "",
    agent_name: "",
    agent_partner_id: "",
    vessel_code: "",
    vessel_name: "",
    voyage_no: "",
    booking_number: "",
    service_type: "",
    mbl_number: "",
    mbl_type: "",
    port_of_departure: "",
    port_of_loading: "",
    port_of_discharge: "",
    port_of_destination: "",
    freight_term: "",
    shipment_type: "",
    person_in_charge_name: "",
    person_in_charge_user_id: "",
    logistics_commodity_group: "",
    documents_list: "",
    cut_off_date: "",
    etd_planned: "",
    etd_actual: "",
    etr_planned: "",
    eta_planned: "",
    eta_actual: "",
    atd_actual: "",
    ata_actual: "",
    production_ready_date: "",
    warehouse_deadline: "",
    planned_entry_date: "",
    actual_entry_date: "",
    import_tax_rate: "",
    tax_amount: "0",
    currency_code: "VND",
    tax_payment_deadline: "",
    insurance: "",
  }
}

function buildInitialPurchaseOrderForm(): PurchaseOrderFormState {
  return {
    order_number: `PO-DEMO-${new Date().getTime().toString().slice(-5)}`,
    purchase_contract_number: "",
    supplier_partner_id: "",
    supplier_code: "",
    supplier_name: "",
    status: "CREATED",
    notes: "",
  }
}

function mergeDefaults(
  current: DeliveryOrderFormState,
  request: PurchaseRequest | undefined,
  order: PurchaseOrderDetail | undefined
): DeliveryOrderFormState {
  if (!request && !order) return current

  return {
    ...current,
    purchase_contract_number: current.purchase_contract_number || order?.purchase_contract_number || request?.production_contract_number || "",
    item_name_requested: current.item_name_requested || request?.item_name || "",
    unit: current.unit || request?.unit || "",
    quantity: current.quantity || (request ? String(request.quantity) : ""),
    lot_number: current.lot_number || (request ? `LOT-${request.item_code}` : ""),
    lot_unit_quantity: current.lot_unit_quantity || (request ? String(request.quantity) : ""),
    lot_unit_type: current.lot_unit_type || request?.unit || "",
    supplier_code: current.supplier_code || order?.supplier_code || "",
    actual_item_code: current.actual_item_code || request?.item_code || "",
    po_number: current.po_number || order?.order_number || "",
    person_in_charge_name: current.person_in_charge_name || request?.purchasing_manager || "",
    person_in_charge_user_id: current.person_in_charge_user_id || request?.purchasing_manager_user_id || "",
    cut_off_date: current.cut_off_date || request?.requested_order_date || "",
    etd_planned: current.etd_planned || request?.supplier_expected_delivery_date || "",
    eta_planned: current.eta_planned || request?.expected_arrival_date || "",
    production_ready_date: current.production_ready_date || request?.requested_order_date || "",
    warehouse_deadline: current.warehouse_deadline || request?.warehouse_deadline_date || "",
    planned_entry_date: current.planned_entry_date || request?.expected_arrival_date || request?.warehouse_deadline_date || "",
    tax_payment_deadline: current.tax_payment_deadline || request?.warehouse_deadline_date || "",
  }
}

function mergeInlinePoDefaults(
  current: PurchaseOrderFormState,
  request: PurchaseRequest | undefined,
  firstSupplier: Partner | undefined
): PurchaseOrderFormState {
  return {
    ...current,
    purchase_contract_number: current.purchase_contract_number || request?.production_contract_number || "",
    supplier_partner_id: current.supplier_partner_id || firstSupplier?.id || "",
    supplier_code: current.supplier_code || firstSupplier?.partner_code || "",
    supplier_name: current.supplier_name || firstSupplier?.partner_name || "",
  }
}

function updateForm<K extends keyof DeliveryOrderFormState>(
  setForm: Dispatch<SetStateAction<DeliveryOrderFormState>>,
  key: K,
  value: DeliveryOrderFormState[K]
) {
  setForm((current) => ({ ...current, [key]: value }))
}

function validateForm(
  form: DeliveryOrderFormState,
  request: PurchaseRequest | undefined,
  order: PurchaseOrderDetail | undefined,
  poMode: PoMode,
  inlinePo: PurchaseOrderFormState
) {
  if (!request) return "Vui lòng chọn Purchase Request."
  if (!order && poMode !== "inline") return "Vui lòng chọn PO hoặc tạo PO nhanh trước khi tạo DO."
  if (poMode === "inline" && !inlinePo.order_number.trim()) return "Số PO là bắt buộc."
  if (!form.delivery_order_number.trim()) return "Số DO là bắt buộc."
  if (!form.item_name_requested.trim()) return "Tên hàng là bắt buộc."
  if (!form.unit.trim()) return "Đơn vị là bắt buộc."
  if (toNumber(form.quantity, 0) <= 0) return "Số lượng phải lớn hơn 0."
  if (!form.currency_code.trim()) return "Tiền tệ là bắt buộc."
  return null
}

function toPurchaseOrderInput(form: PurchaseOrderFormState): CreateFullDeliveryOrderInput["inline_purchase_order"] {
  return {
    order_number: form.order_number.trim(),
    purchase_contract_number: optionalString(form.purchase_contract_number),
    supplier_partner_id: optionalString(form.supplier_partner_id),
    supplier_code: optionalString(form.supplier_code),
    supplier_name: optionalString(form.supplier_name),
    status: form.status,
    notes: optionalString(form.notes),
    created_by_user_id: null,
  }
}

function optionalString(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function optionalNumber(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function optionalTaxRate(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value.replace("%", "").trim())
  if (Number.isNaN(parsed)) return null
  return parsed > 1 ? parsed / 100 : parsed
}

function toNumber(value: string, fallback: number) {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? fallback : parsed
}

function uniqueDefined(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
}

