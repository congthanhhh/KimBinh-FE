import { type FormEvent, useMemo, useState, type ReactNode } from "react"
import { Link, useParams } from "react-router-dom"

import { PageHeader } from "@/components/shared/PageHeader"
import { PermissionActionButton } from "@/components/shared/PermissionActionButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TaskStatusBadge } from "@/components/shared/TaskStatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoStore } from "@/store/demoStore"
import type { AppUser, Partner } from "@/types/common.types"
import type { EfmsContainer, EfmsDetail, EfmsHouseBill } from "@/types/efms.types"
import type { DeliveryOrder, PersonnelRole } from "@/types"
import { displayValue, formatCurrency, formatDate, formatOptionalDate, isEmptyDisplayValue } from "@/utils/formatters"
import { actionUnavailableReason, canPerform, canUpdateTask, getTaskDisabledReason, personnelRoleLabels, roleLabels } from "@/utils/permissions"
import { getTaskStatus } from "@/utils/task-status"

type InfoItem = {
  label: string
  value: ReactNode
}

type HouseBillFormState = {
  hbl_number: string
  hbl_type: "" | "COPY" | "ORIGINAL" | "SEAWAY_BILL" | "SURRENDERED"
  customer_payer_name: string
  feeder_vessel: string
  mother_vessel: string
  point_of_origin: string
  country_of_origin: string
  place_of_delivery: string
  final_destination: string
  freight_payment: "" | "PREPAID" | "COLLECT"
  freight_payable_at: string
  sailing_date: string
}

type ContainerFormState = {
  house_bill_id: string
  container_type: string
  quantity: string
  container_no: string
  seal_no: string
  vehicle_type: string
  vehicle_no: string
}

export function DeliveryOrderDetailPage() {
  const { id } = useParams()
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
  const purchaseOrderDetailsById = useDemoStore((state) => state.purchaseOrderDetailsById)
  const efmsDetailsByDeliveryOrderId = useDemoStore((state) => state.efmsDetailsByDeliveryOrderId)
  const referenceUsers = useDemoStore((state) => state.referenceUsers)
  const referencePartners = useDemoStore((state) => state.referencePartners)
  const updateDeliveryOrder = useDemoStore((state) => state.updateDeliveryOrder)
  const startTask = useDemoStore((state) => state.startTask)
  const completeTask = useDemoStore((state) => state.completeTask)
  const confirmWarehouseEntry = useDemoStore((state) => state.confirmWarehouseEntry)
  const createHouseBill = useDemoStore((state) => state.createHouseBill)
  const updateHouseBill = useDemoStore((state) => state.updateHouseBill)
  const deleteHouseBill = useDemoStore((state) => state.deleteHouseBill)
  const createContainer = useDemoStore((state) => state.createContainer)
  const updateContainer = useDemoStore((state) => state.updateContainer)
  const deleteContainer = useDemoStore((state) => state.deleteContainer)
  const order = deliveryOrders.find((item) => item.order_info.order_number === id)

  const taskStats = order ? getTaskStats(order) : { total: 0, completed: 0, inProgress: 0, notStarted: 0 }
  const orderId = order?.id ?? ""
  const canUpdateOrder = canPerform(selectedRole, "updateDeliveryOrderCore")
  const canUpdateProduct = canPerform(selectedRole, "updateProductDetails")
  const canUpdateSap = canPerform(selectedRole, "updateSapIntegration")
  const canUpdateLogistics = canPerform(selectedRole, "updateLogisticsShipping")
  const canUpdateWarehouse = canPerform(selectedRole, "updateWarehouseTracking")
  const canUpdateFinanceTax = canPerform(selectedRole, "updateFinanceTax")
  const purchaseOrder = order
    ? order.purchase_order_ids[0] ? purchaseOrderDetailsById[order.purchase_order_ids[0]] ?? order.purchase_orders[0] ?? null : order.purchase_orders[0] ?? null
    : null
  const efmsDetail = order ? efmsDetailsByDeliveryOrderId[order.id] ?? null : null
  const [isHblModalOpen, setIsHblModalOpen] = useState(false)
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false)
  const [editingHouseBillId, setEditingHouseBillId] = useState<string | null>(null)
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null)
  const [houseBillForm, setHouseBillForm] = useState(buildInitialHouseBillForm)
  const [containerForm, setContainerForm] = useState(buildInitialContainerForm)
  const [houseBillFilter, setHouseBillFilter] = useState("ALL")
  const houseBills = useMemo(() => efmsDetail?.house_bills ?? [], [efmsDetail])
  const filteredContainers = useMemo(
    () => {
      const containers = efmsDetail?.containers ?? []
      return houseBillFilter === "ALL"
        ? containers
        : containers.filter((container) => container.house_bill_id === houseBillFilter)
    },
    [efmsDetail, houseBillFilter]
  )
  const supplierPartner = purchaseOrder?.supplier_partner_id
    ? referencePartners.find((partner) => partner.id === purchaseOrder.supplier_partner_id)
    : null
  const canManageEfms = selectedRole === "admin" || selectedRole === "purchasing_manager"

  function openHouseBillForm(bill?: EfmsHouseBill) {
    setEditingHouseBillId(bill?.id ?? null)
    setHouseBillForm(bill ? houseBillToForm(bill) : buildInitialHouseBillForm())
    setIsHblModalOpen(true)
  }

  function openContainerForm(container?: EfmsContainer) {
    setEditingContainerId(container?.id ?? null)
    setContainerForm(container ? containerToForm(container) : buildInitialContainerForm(houseBillFilter === "ALL" ? "" : houseBillFilter))
    setIsContainerModalOpen(true)
  }

  async function handleHouseBillSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!order) return
    const payload = houseBillFormToInput(houseBillForm)
    if (editingHouseBillId) {
      await updateHouseBill(orderId, editingHouseBillId, payload)
    } else {
      await createHouseBill(orderId, payload)
    }
    setIsHblModalOpen(false)
    setEditingHouseBillId(null)
    setHouseBillForm(buildInitialHouseBillForm())
  }

  async function handleContainerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!order) return
    const payload = containerFormToInput(containerForm)
    if (editingContainerId) {
      await updateContainer(orderId, editingContainerId, payload)
    } else {
      await createContainer(orderId, payload)
    }
    setIsContainerModalOpen(false)
    setEditingContainerId(null)
    setContainerForm(buildInitialContainerForm())
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <PageHeader title="Không tìm thấy DO" description="DO trong dữ liệu demo không tồn tại." />
        <Button variant="outline" nativeButton={false} render={<Link to="/delivery-orders" />}>Quay lại danh sách</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={order.order_info.order_number}
        description={`${order.order_info.request_code} -> PO ${order.sap_integration.po_number} -> hạn nhập kho ${formatDate(order.warehouse_tracking.warehouse_deadline)}`}
        action={<Button variant="outline" nativeButton={false} render={<Link to="/delivery-orders" />}>Quay lại</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryCard title="Trạng thái" value={<StatusBadge value={order.order_info.status} />} />
        <SummaryCard title="Mã tracking" value={order.order_info.tracking_number} />
        <SummaryCard title="ETA" value={formatDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned)} />
        <SummaryCard title="Số ngày trễ" value={<StatusBadge value={order.warehouse_tracking.delay_days > 0 ? `${order.warehouse_tracking.delay_days} days delayed` : "ON_TIME"} />} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Chế độ xem: {roleLabels[selectedRole]}</span>
              <Badge variant="outline">Mô phỏng role</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Quản lý mua hàng / PIC cập nhật PO/DO, SAP, vận chuyển và nhập kho; Nhân viên hải quan cập nhật tài chính/thuế; task chỉ mở theo đúng nhóm phụ trách.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <PermissionActionButton allowed={canUpdateOrder} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { order_info: { notes: `Đã cập nhật thông tin đơn lúc ${new Date().toLocaleDateString("vi-VN")}.` } })}>Cập nhật DO</PermissionActionButton>
            <PermissionActionButton allowed={canUpdateSap} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { sap_integration: { supplier_code: order.sap_integration.supplier_code === "Đang cập nhật" ? "SAP-DEMO-0001" : order.sap_integration.supplier_code, raw_date: new Date().toISOString().slice(0, 10) } })}>Cập nhật SAP</PermissionActionButton>
            <PermissionActionButton allowed={canUpdateLogistics} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { logistics_shipping: { eta_actual: new Date().toISOString().slice(0, 10) } })}>Cập nhật vận chuyển</PermissionActionButton>
            <PermissionActionButton allowed={canUpdateWarehouse} disabledReason={actionUnavailableReason} onClick={() => confirmWarehouseEntry(order.order_info.order_number)}>Xác nhận nhập kho</PermissionActionButton>
          </div>
        </CardContent>
      </Card>

      <WorkflowFlowCard order={order} />

      <Card size="sm">
        <CardContent>
          <DetailCard
            title="PO & Nhà cung cấp"
            items={[
              { label: "Số PO", value: purchaseOrder?.order_number ?? order.sap_integration.po_number },
              { label: "Hợp đồng mua", value: purchaseOrder?.purchase_contract_number ?? order.order_info.purchase_contract_number },
              { label: "Trạng thái PO", value: purchaseOrder ? <StatusBadge value={purchaseOrder.status} /> : null },
              { label: "Mã nhà cung cấp", value: purchaseOrder?.supplier_code ?? supplierPartner?.partner_code ?? order.sap_integration.supplier_code },
              { label: "Nhà cung cấp", value: purchaseOrder?.supplier_name ?? supplierPartner?.partner_name },
              { label: "Supplier partner ID", value: purchaseOrder?.supplier_partner_id },
              { label: "Người tạo PO", value: resolveUserLabel(referenceUsers, purchaseOrder?.created_by_user_id) },
              { label: "Ghi chú PO", value: purchaseOrder?.notes },
              { label: "PR trong PO", value: purchaseOrderDetailsById[purchaseOrder?.id ?? ""]?.purchase_requests.length },
              { label: "DO trong PO", value: purchaseOrderDetailsById[purchaseOrder?.id ?? ""]?.delivery_orders.length },
            ]}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Tabs defaultValue="overview" className="min-w-0">
          <Card size="sm" className="min-w-0">
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <TabsList className="h-auto w-full min-w-max justify-start rounded-md bg-muted/70 p-1">
                  <TabsTrigger className="h-8 flex-none px-3" value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="product">Sản phẩm</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="sap">SAP</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="logistics">Vận chuyển</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="warehouse">Kho hàng</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="finance">Tài chính & Thuế</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="customs">Hải quan</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="delivery">Giao hàng</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="milestones">Milestones</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="hbl">HBL</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="container">Container</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="efms">eFMS</TabsTrigger>
                  <TabsTrigger className="h-8 flex-none px-3" value="tasks">Công việc</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent className="mt-0" value="overview">
                <DetailCard
                  title="Thông tin đơn hàng"
                  action={<PermissionActionButton allowed={canUpdateOrder} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { order_info: { notes: `Đã cập nhật thông tin đơn lúc ${new Date().toLocaleDateString("vi-VN")}.` } })}>Cập nhật DO</PermissionActionButton>}
                  items={[
                    { label: "Mã PR", value: order.order_info.request_code },
                    { label: "Mã DO", value: order.order_info.order_number },
                    { label: "DO ID", value: order.id },
                    { label: "PO IDs", value: order.purchase_order_ids.join(", ") },
                    { label: "PR IDs", value: order.purchase_request_ids.join(", ") },
                    { label: "Số PO", value: order.sap_integration.po_number },
                    { label: "Mã tracking", value: order.order_info.tracking_number },
                    { label: "Hợp đồng mua", value: order.order_info.purchase_contract_number },
                    { label: "Trạng thái", value: <StatusBadge value={order.order_info.status} /> },
                    { label: "Người tạo", value: resolveUserLabel(referenceUsers, order.created_by_user_id) },
                    { label: "Ngày tạo", value: formatOptionalDate(order.created_at) },
                    { label: "Cập nhật", value: formatOptionalDate(order.updated_at) },
                    { label: "Ghi chú", value: displayValue(order.order_info.notes) },
                    { label: "Ghi chú XNK", value: displayValue(order.order_info.xnk_notes) },
                  ]}
                />
                <EfmsTable
                  title="Linked Purchase Orders"
                  headers={["PO", "Supplier", "Status", "Contract"]}
                  rows={order.purchase_orders.map((po) => [po.order_number, po.supplier_name, po.status, po.purchase_contract_number])}
                />
                <EfmsTable
                  title="Linked Purchase Requests"
                  headers={["PR", "Item", "Quantity", "Status"]}
                  rows={order.purchase_requests.map((request) => [
                    request.requested_order_id,
                    request.item_name,
                    `${request.quantity.toLocaleString()} ${request.unit}`,
                    request.status,
                  ])}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="product">
                <DetailCard
                  title="Sản phẩm"
                  action={<PermissionActionButton allowed={canUpdateProduct} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { product_details: { packaging_type: order.product_details.packaging_type === "Đang cập nhật" ? "Pallet tiêu chuẩn" : order.product_details.packaging_type } })}>Cập nhật sản phẩm</PermissionActionButton>}
                  items={[
                    { label: "Tên hàng", value: order.product_details.item_name_requested },
                    { label: "Số lượng", value: `${order.product_details.quantity.toLocaleString()} ${order.product_details.unit}` },
                    { label: "Số LOT", value: order.product_details.lot_number },
                    { label: "Số lượng LOT", value: `${order.product_details.lot_unit_quantity} ${order.product_details.lot_unit_type}` },
                    { label: "Đóng gói", value: order.product_details.packaging_type },
                    { label: "Gross weight", value: order.product_details.gross_weight },
                    { label: "CBM", value: order.product_details.cbm },
                    { label: "Commodity group", value: order.product_details.commodity_group },
                  ]}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="sap">
                <DetailCard
                  title="Tích hợp SAP"
                  action={<PermissionActionButton allowed={canUpdateSap} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { sap_integration: { supplier_code: order.sap_integration.supplier_code === "Đang cập nhật" ? "SAP-DEMO-0001" : order.sap_integration.supplier_code, raw_date: new Date().toISOString().slice(0, 10) } })}>Cập nhật SAP</PermissionActionButton>}
                  items={[
                    { label: "Mã nhà cung cấp", value: order.sap_integration.supplier_code },
                    { label: "Mã hàng thực tế", value: order.sap_integration.actual_item_code },
                    { label: "Ngày dữ liệu gốc", value: formatDate(order.sap_integration.raw_date) },
                    { label: "Số PO", value: order.sap_integration.po_number },
                  ]}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="logistics">
                <DetailCard
                  title="Thông tin vận chuyển"
                  action={<PermissionActionButton allowed={canUpdateLogistics} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { logistics_shipping: { eta_actual: new Date().toISOString().slice(0, 10) } })}>Cập nhật vận chuyển</PermissionActionButton>}
                  items={[
                    { label: "Incoterms", value: order.logistics_shipping.incoterms },
                    { label: "Phương thức vận chuyển", value: order.logistics_shipping.shipping_method },
                    { label: "Hãng tàu", value: order.logistics_shipping.shipping_line },
                    { label: "Shipping line partner ID", value: order.logistics_shipping.shipping_line_partner_id },
                    { label: "Coloader", value: order.logistics_shipping.coloader_name },
                    { label: "Coloader partner ID", value: order.logistics_shipping.coloader_partner_id },
                    { label: "Agent", value: order.logistics_shipping.agent_name },
                    { label: "Agent partner ID", value: order.logistics_shipping.agent_partner_id },
                    { label: "Mã tàu", value: order.logistics_shipping.vessel_code },
                    { label: "Tên tàu", value: order.logistics_shipping.vessel_name },
                    { label: "Voyage", value: order.logistics_shipping.voyage_no },
                    { label: "Booking", value: order.logistics_shipping.booking_number },
                    { label: "Service type", value: order.logistics_shipping.service_type },
                    { label: "MBL", value: order.logistics_shipping.mbl_number },
                    { label: "MBL type", value: order.logistics_shipping.mbl_type },
                    { label: "Cảng đi", value: order.logistics_shipping.port_of_departure },
                    { label: "Port of loading", value: order.logistics_shipping.port_of_loading },
                    { label: "Port of discharge", value: order.logistics_shipping.port_of_discharge },
                    { label: "Cảng đến", value: order.logistics_shipping.port_of_destination },
                    { label: "Freight term", value: order.logistics_shipping.freight_term },
                    { label: "Shipment type", value: order.logistics_shipping.shipment_type },
                    { label: "PIC logistics", value: order.logistics_shipping.person_in_charge_name },
                    { label: "PIC user ID", value: resolveUserLabel(referenceUsers, order.logistics_shipping.person_in_charge_user_id) },
                    { label: "Commodity group", value: order.logistics_shipping.commodity_group },
                    { label: "Cut-off", value: formatOptionalDate(order.logistics_shipping.cut_off_date) },
                    { label: "ETD kế hoạch", value: formatOptionalDate(order.logistics_shipping.etd_planned) },
                    { label: "ETD thực tế", value: formatOptionalDate(order.logistics_shipping.etd_actual) },
                    { label: "ETR kế hoạch", value: formatOptionalDate(order.logistics_shipping.etr_planned) },
                    { label: "ETA kế hoạch", value: formatOptionalDate(order.logistics_shipping.eta_planned) },
                    { label: "ETA thực tế", value: formatOptionalDate(order.logistics_shipping.eta_actual) },
                    { label: "ATD thực tế", value: formatOptionalDate(order.logistics_shipping.atd_actual) },
                    { label: "ATA thực tế", value: formatOptionalDate(order.logistics_shipping.ata_actual) },
                    { label: "Chứng từ", value: displayValue(order.logistics_shipping.documents_list.join(", ")) },
                  ]}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="warehouse">
                <DetailCard
                  title="Theo dõi kho hàng"
                  action={<PermissionActionButton allowed={canUpdateWarehouse} disabledReason={actionUnavailableReason} onClick={() => confirmWarehouseEntry(order.order_info.order_number)}>Xác nhận nhập kho</PermissionActionButton>}
                  items={[
                    { label: "Sản xuất sẵn sàng", value: formatDate(order.warehouse_tracking.production_ready_date) },
                    { label: "Hạn nhập kho", value: formatDate(order.warehouse_tracking.warehouse_deadline) },
                    { label: "Ngày nhập kho kế hoạch", value: formatDate(order.warehouse_tracking.planned_entry_date) },
                    { label: "Ngày nhập kho thực tế", value: formatOptionalDate(order.warehouse_tracking.actual_entry_date) },
                    { label: "Số ngày trễ", value: <StatusBadge value={order.warehouse_tracking.delay_days > 0 ? `${order.warehouse_tracking.delay_days} days delayed` : "ON_TIME"} /> },
                    { label: "Công việc hoàn thành", value: <TaskCompletionSummary stats={taskStats} /> },
                  ]}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="finance">
                <DetailCard
                  title="Tài chính & Thuế"
                  action={<PermissionActionButton allowed={canUpdateFinanceTax} disabledReason={actionUnavailableReason} onClick={() => updateDeliveryOrder(order.order_info.order_number, { finance_tax: { tax_payment_deadline: new Date().toISOString().slice(0, 10), insurance: order.finance_tax.insurance === "Đang cập nhật" ? "Đã cập nhật hồ sơ bảo hiểm" : order.finance_tax.insurance } })}>Cập nhật tài chính/thuế</PermissionActionButton>}
                  items={[
                    { label: "Thuế nhập khẩu", value: order.finance_tax.import_tax_rate },
                    { label: "Số tiền thuế", value: formatCurrency(order.finance_tax.tax_amount) },
                    { label: "Tiền tệ", value: order.finance_tax.currency_code },
                    { label: "Hạn nộp thuế", value: formatDate(order.finance_tax.tax_payment_deadline) },
                    { label: "Bảo hiểm", value: order.finance_tax.insurance },
                  ]}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="customs">
                <DetailCard
                  title="Hải quan"
                  items={[
                    { label: "Arrival notice", value: formatOptionalDate(order.customs_clearance?.arrival_notice_received_at) },
                    { label: "Gửi draft declaration", value: formatOptionalDate(order.customs_clearance?.draft_declaration_sent_at) },
                    { label: "Số tờ khai", value: order.customs_clearance?.customs_declaration_no },
                    { label: "Luồng hải quan", value: order.customs_clearance?.customs_channel },
                    { label: "Ngày khai", value: formatOptionalDate(order.customs_clearance?.declared_at) },
                    { label: "Ngày thông quan", value: formatOptionalDate(order.customs_clearance?.cleared_at) },
                    { label: "Kiểm hóa", value: order.customs_clearance ? yesNo(order.customs_clearance.inspection_required) : null },
                    { label: "Có vi phạm", value: order.customs_clearance ? yesNo(order.customs_clearance.violation_found) : null },
                    { label: "Ghi chú vi phạm", value: order.customs_clearance?.violation_notes },
                    { label: "Người xử lý", value: order.customs_clearance?.handled_by_name ?? resolveUserLabel(referenceUsers, order.customs_clearance?.handled_by_user_id) },
                  ]}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="delivery">
                <DetailCard
                  title="Theo dõi giao hàng"
                  items={[
                    { label: "Cargo release", value: order.delivery_tracking?.cargo_release_status },
                    { label: "Ghi chú hàng", value: order.delivery_tracking?.cargo_status_notes },
                    { label: "Released at", value: formatOptionalDate(order.delivery_tracking?.delivery_order_released_at) },
                    { label: "Gửi lịch giao", value: formatOptionalDate(order.delivery_tracking?.delivery_schedule_sent_at) },
                    { label: "Xác nhận lịch", value: formatOptionalDate(order.delivery_tracking?.delivery_schedule_confirmed_at) },
                    { label: "Đã vận chuyển", value: formatOptionalDate(order.delivery_tracking?.transported_at) },
                    { label: "POD number", value: order.delivery_tracking?.pod_number },
                    { label: "Nhận POD", value: formatOptionalDate(order.delivery_tracking?.pod_received_at) },
                    { label: "Ghi chú POD", value: order.delivery_tracking?.pod_notes },
                  ]}
                />
              </TabsContent>

              <TabsContent className="mt-0" value="milestones">
                <MilestonesSection order={order} referenceUsers={referenceUsers} />
              </TabsContent>

              <TabsContent className="mt-0" value="hbl">
                <section className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <CardTitle>House Bills</CardTitle>
                    <Button size="sm" onClick={() => openHouseBillForm()} disabled={!canManageEfms}>Thêm HBL</Button>
                  </div>
                  <Table className="min-w-225 table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">HBL</TableHead>
                        <TableHead className="w-40">Tàu</TableHead>
                        <TableHead className="w-28">ETD</TableHead>
                        <TableHead className="w-28">ETA</TableHead>
                        <TableHead className="w-44">Cảng đi</TableHead>
                        <TableHead className="w-44">Cảng đến</TableHead>
                        <TableHead className="w-36 text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {houseBills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{bill.hbl_number}</TableCell>
                          <TableCell>{displayValue(order.logistics_shipping.vessel_name)}</TableCell>
                          <TableCell>{formatOptionalDate(order.logistics_shipping.etd_actual ?? order.logistics_shipping.etd_planned)}</TableCell>
                          <TableCell>{formatOptionalDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned)}</TableCell>
                          <TableCell>{displayValue(order.logistics_shipping.port_of_loading)}</TableCell>
                          <TableCell>{displayValue(order.logistics_shipping.port_of_discharge)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button size="xs" variant="outline" onClick={() => openHouseBillForm(bill)} disabled={!canManageEfms}>Sửa</Button>
                              <Button size="xs" variant="destructive" onClick={() => deleteHouseBill(order.id, bill.id)} disabled={!canManageEfms}>Xóa</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {houseBills.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-20 text-center text-gray-400">Chưa có HBL trong lô hàng này.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </section>

                <Sheet open={isHblModalOpen} onOpenChange={(open) => {
                  setIsHblModalOpen(open)
                  if (!open) {
                    setEditingHouseBillId(null)
                    setHouseBillForm(buildInitialHouseBillForm())
                  }
                }}>
                  <SheetContent side="right" className="sm:max-w-lg">
                    <SheetHeader>
                      <SheetTitle>{editingHouseBillId ? "Sửa HBL" : "Thêm HBL"}</SheetTitle>
                      <SheetDescription>Quản lý House Bill trong mock eFMS, lưu bằng localStorage.</SheetDescription>
                    </SheetHeader>
                    <form className="space-y-3 px-4 pb-4" onSubmit={handleHouseBillSubmit}>
                      <FormText label="HBL number" required value={houseBillForm.hbl_number} onChange={(value) => setHouseBillForm((current) => ({ ...current, hbl_number: value }))} />
                      <FormSelect label="HBL type" value={houseBillForm.hbl_type} options={["", "COPY", "ORIGINAL", "SEAWAY_BILL", "SURRENDERED"]} onChange={(value) => setHouseBillForm((current) => ({ ...current, hbl_type: value as HouseBillFormState["hbl_type"] }))} />
                      <FormText label="Customer payer" value={houseBillForm.customer_payer_name} onChange={(value) => setHouseBillForm((current) => ({ ...current, customer_payer_name: value }))} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormText label="Feeder vessel" value={houseBillForm.feeder_vessel} onChange={(value) => setHouseBillForm((current) => ({ ...current, feeder_vessel: value }))} />
                        <FormText label="Mother vessel" value={houseBillForm.mother_vessel} onChange={(value) => setHouseBillForm((current) => ({ ...current, mother_vessel: value }))} />
                        <FormText label="Origin" value={houseBillForm.point_of_origin} onChange={(value) => setHouseBillForm((current) => ({ ...current, point_of_origin: value }))} />
                        <FormText label="Country" value={houseBillForm.country_of_origin} onChange={(value) => setHouseBillForm((current) => ({ ...current, country_of_origin: value }))} />
                        <FormText label="Place of delivery" value={houseBillForm.place_of_delivery} onChange={(value) => setHouseBillForm((current) => ({ ...current, place_of_delivery: value }))} />
                        <FormText label="Final destination" value={houseBillForm.final_destination} onChange={(value) => setHouseBillForm((current) => ({ ...current, final_destination: value }))} />
                        <FormSelect label="Freight payment" value={houseBillForm.freight_payment} options={["", "PREPAID", "COLLECT"]} onChange={(value) => setHouseBillForm((current) => ({ ...current, freight_payment: value as HouseBillFormState["freight_payment"] }))} />
                        <FormText label="Freight payable at" value={houseBillForm.freight_payable_at} onChange={(value) => setHouseBillForm((current) => ({ ...current, freight_payable_at: value }))} />
                        <FormText label="Sailing date" type="date" value={houseBillForm.sailing_date} onChange={(value) => setHouseBillForm((current) => ({ ...current, sailing_date: value }))} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsHblModalOpen(false)}>Đóng</Button>
                        <Button type="submit" disabled={!canManageEfms}>Lưu</Button>
                      </div>
                    </form>
                  </SheetContent>
                </Sheet>
              </TabsContent>

              <TabsContent className="mt-0" value="container">
                <section className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <div>
                      <CardTitle>Container</CardTitle>
                      <div className="text-xs text-muted-foreground">Lọc theo HBL và quản lý container theo lô.</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        className="h-8 rounded-lg border border-input bg-background px-3 text-xs"
                        value={houseBillFilter}
                        onChange={(event) => setHouseBillFilter(event.target.value)}
                        aria-label="Lọc theo HBL"
                      >
                        <option value="ALL">Tất cả HBL</option>
                        {houseBills.map((bill) => (
                          <option key={bill.id} value={bill.id}>{bill.hbl_number}</option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => openContainerForm()} disabled={!canManageEfms}>Thêm Container</Button>
                    </div>
                  </div>
                  <Table className="min-w-225 table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Số container</TableHead>
                        <TableHead className="w-32">Kích cỡ</TableHead>
                        <TableHead className="w-32">Seal</TableHead>
                        <TableHead className="w-24">Số lượng</TableHead>
                        <TableHead className="w-40">HBL</TableHead>
                        <TableHead className="w-36 text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContainers.map((container) => (
                        <TableRow key={container.id}>
                          <TableCell className="font-medium">{displayValue(container.container_no)}</TableCell>
                          <TableCell>{displayValue(container.container_type)}</TableCell>
                          <TableCell>{displayValue(container.seal_no)}</TableCell>
                          <TableCell>{container.quantity.toLocaleString()}</TableCell>
                          <TableCell>{resolveHouseBillLabelFromList(houseBills, container.house_bill_id)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button size="xs" variant="outline" onClick={() => openContainerForm(container)} disabled={!canManageEfms}>Sửa</Button>
                              <Button size="xs" variant="destructive" onClick={() => deleteContainer(order.id, container.id)} disabled={!canManageEfms}>Xóa</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredContainers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-20 text-center text-gray-400">Chưa có container phù hợp.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </section>

                <Sheet open={isContainerModalOpen} onOpenChange={(open) => {
                  setIsContainerModalOpen(open)
                  if (!open) {
                    setEditingContainerId(null)
                    setContainerForm(buildInitialContainerForm())
                  }
                }}>
                  <SheetContent side="right" className="sm:max-w-lg">
                    <SheetHeader>
                      <SheetTitle>{editingContainerId ? "Sửa Container" : "Thêm Container"}</SheetTitle>
                      <SheetDescription>Container có thể được lọc theo HBL đang chọn.</SheetDescription>
                    </SheetHeader>
                    <form className="space-y-3 px-4 pb-4" onSubmit={handleContainerSubmit}>
                      <FormSelect
                        label="House Bill"
                        value={containerForm.house_bill_id}
                        options={["", ...houseBills.map((bill) => bill.id)]}
                        getLabel={(value) => value ? resolveHouseBillLabelFromList(houseBills, value) ?? value : "Không gắn HBL"}
                        onChange={(value) => setContainerForm((current) => ({ ...current, house_bill_id: value }))}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormText label="Container no" value={containerForm.container_no} onChange={(value) => setContainerForm((current) => ({ ...current, container_no: value }))} />
                        <FormText label="Container type" value={containerForm.container_type} onChange={(value) => setContainerForm((current) => ({ ...current, container_type: value }))} />
                        <FormText label="Seal no" value={containerForm.seal_no} onChange={(value) => setContainerForm((current) => ({ ...current, seal_no: value }))} />
                        <FormText label="Quantity" required type="number" value={containerForm.quantity} onChange={(value) => setContainerForm((current) => ({ ...current, quantity: value }))} />
                        <FormText label="Vehicle type" value={containerForm.vehicle_type} onChange={(value) => setContainerForm((current) => ({ ...current, vehicle_type: value }))} />
                        <FormText label="Vehicle no" value={containerForm.vehicle_no} onChange={(value) => setContainerForm((current) => ({ ...current, vehicle_no: value }))} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsContainerModalOpen(false)}>Đóng</Button>
                        <Button type="submit" disabled={!canManageEfms}>Lưu</Button>
                      </div>
                    </form>
                  </SheetContent>
                </Sheet>
              </TabsContent>

              <TabsContent className="mt-0" value="efms">
                <EfmsSection detail={efmsDetail} referenceUsers={referenceUsers} referencePartners={referencePartners} />
              </TabsContent>

              <TabsContent className="mt-0" value="tasks">
                <TaskDetailSection
                  order={order}
                  selectedRole={selectedRole}
                  startTask={startTask}
                  completeTask={completeTask}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>

        <SideSummaryCard order={order} taskStats={taskStats} />
      </div>
    </div>
  )
}

function FormText({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <Input
        value={value}
        type={type}
        min={type === "number" ? "0.01" : undefined}
        step={type === "number" ? "0.01" : undefined}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  )
}

function FormSelect({
  label,
  value,
  options,
  onChange,
  getLabel = (option) => option || "-",
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
  getLabel?: (value: string) => ReactNode
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option || "empty"} value={option}>{getLabel(option)}</option>
        ))}
      </select>
    </label>
  )
}

function buildInitialHouseBillForm(): HouseBillFormState {
  return {
    hbl_number: "",
    hbl_type: "",
    customer_payer_name: "",
    feeder_vessel: "",
    mother_vessel: "",
    point_of_origin: "",
    country_of_origin: "",
    place_of_delivery: "",
    final_destination: "",
    freight_payment: "",
    freight_payable_at: "",
    sailing_date: "",
  }
}

function buildInitialContainerForm(houseBillId = ""): ContainerFormState {
  return {
    house_bill_id: houseBillId,
    container_type: "",
    quantity: "1",
    container_no: "",
    seal_no: "",
    vehicle_type: "",
    vehicle_no: "",
  }
}

function houseBillToForm(bill: EfmsHouseBill): HouseBillFormState {
  return {
    hbl_number: bill.hbl_number,
    hbl_type: bill.hbl_type ?? "",
    customer_payer_name: bill.customer_payer_name ?? "",
    feeder_vessel: bill.feeder_vessel ?? "",
    mother_vessel: bill.mother_vessel ?? "",
    point_of_origin: bill.point_of_origin ?? "",
    country_of_origin: bill.country_of_origin ?? "",
    place_of_delivery: bill.place_of_delivery ?? "",
    final_destination: bill.final_destination ?? "",
    freight_payment: bill.freight_payment ?? "",
    freight_payable_at: bill.freight_payable_at ?? "",
    sailing_date: bill.sailing_date ?? "",
  }
}

function containerToForm(container: EfmsContainer): ContainerFormState {
  return {
    house_bill_id: container.house_bill_id ?? "",
    container_type: container.container_type ?? "",
    quantity: String(container.quantity),
    container_no: container.container_no ?? "",
    seal_no: container.seal_no ?? "",
    vehicle_type: container.vehicle_type ?? "",
    vehicle_no: container.vehicle_no ?? "",
  }
}

function houseBillFormToInput(form: HouseBillFormState) {
  return {
    hbl_number: form.hbl_number.trim(),
    hbl_type: form.hbl_type || null,
    customer_payer_partner_id: null,
    customer_payer_name: optionalString(form.customer_payer_name),
    feeder_vessel: optionalString(form.feeder_vessel),
    mother_vessel: optionalString(form.mother_vessel),
    point_of_origin: optionalString(form.point_of_origin),
    country_of_origin: optionalString(form.country_of_origin),
    place_of_delivery: optionalString(form.place_of_delivery),
    final_destination: optionalString(form.final_destination),
    freight_payment: form.freight_payment || null,
    freight_payable_at: optionalString(form.freight_payable_at),
    sailing_date: optionalString(form.sailing_date),
  }
}

function containerFormToInput(form: ContainerFormState) {
  return {
    house_bill_id: optionalString(form.house_bill_id),
    container_type: optionalString(form.container_type),
    quantity: Math.max(0.01, Number(form.quantity) || 1),
    container_no: optionalString(form.container_no),
    seal_no: optionalString(form.seal_no),
    vehicle_type: optionalString(form.vehicle_type),
    vehicle_no: optionalString(form.vehicle_no),
  }
}

function optionalString(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function SummaryCard({ title, value }: { title: string; value: ReactNode }) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="text-xs font-medium uppercase text-muted-foreground">{title}</div>
        <div className={`mt-2 text-sm font-semibold ${typeof value === "string" || typeof value === "number" ? "truncate" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  )
}

function DetailCard({ title, items, action }: { title: string; items: InfoItem[]; action?: ReactNode }) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{title}</CardTitle>
        {action}
      </div>
      <div className="grid gap-x-5 gap-y-3 md:grid-cols-2 2xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <div className="text-xs font-medium uppercase text-muted-foreground">{item.label}</div>
            <InfoValue value={item.value} />
          </div>
        ))}
      </div>
    </section>
  )
}

function InfoValue({ value }: { value: ReactNode }) {
  const renderedValue = typeof value === "string" || typeof value === "number" || value === null || value === undefined
    ? displayValue(value)
    : value

  return (
    <div
      className={`mt-1 text-sm font-medium ${isEmptyDisplayValue(value) ? "text-gray-400" : ""} ${typeof renderedValue === "string" || typeof renderedValue === "number" ? "truncate" : ""}`}
    >
      {renderedValue}
    </div>
  )
}

function MilestonesSection({ order, referenceUsers }: { order: DeliveryOrder; referenceUsers: AppUser[] }) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="border-b pb-3">
        <CardTitle>Workflow milestones</CardTitle>
      </div>
      <Table className="min-w-225 table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-44">Milestone</TableHead>
            <TableHead className="w-32">Trạng thái</TableHead>
            <TableHead className="w-36">Vai trò</TableHead>
            <TableHead className="w-48">Người phụ trách</TableHead>
            <TableHead className="w-36">Due</TableHead>
            <TableHead className="w-36">Completed</TableHead>
            <TableHead>Ghi chú</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.process_milestones.map((milestone) => (
            <TableRow key={milestone.id}>
              <TableCell className="font-medium">{milestone.milestone_type}</TableCell>
              <TableCell><StatusBadge value={milestone.milestone_status} /></TableCell>
              <ValueCell value={milestone.responsible_role} />
              <ValueCell value={resolveUserLabel(referenceUsers, milestone.responsible_user_id)} />
              <ValueCell value={formatOptionalDate(milestone.due_at)} />
              <ValueCell value={formatOptionalDate(milestone.completed_at)} />
              <ValueCell value={milestone.notes} />
            </TableRow>
          ))}
          {order.process_milestones.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-20 text-center text-gray-400">—</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  )
}

function EfmsSection({
  detail,
  referenceUsers,
  referencePartners,
}: {
  detail: EfmsDetail | null
  referenceUsers: AppUser[]
  referencePartners: Partner[]
}) {
  if (!detail) {
    return <div className="rounded-lg bg-muted/40 p-3 text-sm text-gray-400">—</div>
  }

  const sellingTotal = detail.charges
    .filter((charge) => charge.charge_type === "SELLING")
    .reduce((sum, charge) => sum + charge.quantity * charge.unit_price, 0)
  const buyingTotal = detail.charges
    .filter((charge) => charge.charge_type === "BUYING")
    .reduce((sum, charge) => sum + charge.quantity * charge.unit_price, 0)
  const unpaidNotes = detail.accounting_notes.filter((note) => note.note_status !== "PAID").length

  return (
    <section className="min-w-0 space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard title="Manifest" value={String(detail.manifests.length)} />
        <SummaryCard title="HBL / Container" value={`${detail.house_bills.length} / ${detail.containers.length}`} />
        <SummaryCard title="Selling / Buying" value={`${formatCurrency(sellingTotal)} / ${formatCurrency(buyingTotal)}`} />
        <SummaryCard title="Note chưa paid" value={String(unpaidNotes)} />
      </div>

      <EfmsTable
        title="Manifest & Shipping Instruction"
        headers={["Loại", "Reference/Booking", "Supplier", "Vessel/Voyage", "POL/POD", "Ngày", "Ghi chú"]}
        rows={[
          ...detail.manifests.map((manifest) => [
            "Manifest",
            manifest.reference_no,
            manifest.supplier_name ?? resolvePartnerLabel(referencePartners, manifest.supplier_partner_id),
            manifest.vessel,
            `${displayValue(manifest.port_of_loading)} → ${displayValue(manifest.port_of_discharge)}`,
            formatOptionalDate(manifest.manifest_date),
            manifest.notes,
          ]),
          ...detail.shipping_instructions.map((instruction) => [
            "SI",
            instruction.booking_number,
            instruction.supplier_name ?? resolvePartnerLabel(referencePartners, instruction.supplier_partner_id),
            `${displayValue(instruction.vessel_name)} / ${displayValue(instruction.voyage_no)}`,
            `${displayValue(instruction.shipper_name)} → ${displayValue(instruction.consignee_name)}`,
            formatOptionalDate(instruction.loading_date),
            instruction.notes,
          ]),
        ]}
      />

      <EfmsTable
        title="House Bills"
        headers={["HBL", "Type", "Payer", "Vessel", "Origin", "Destination", "Freight"]}
        rows={detail.house_bills.map((bill) => [
          bill.hbl_number,
          bill.hbl_type,
          bill.customer_payer_name ?? resolvePartnerLabel(referencePartners, bill.customer_payer_partner_id),
          `${displayValue(bill.feeder_vessel)} / ${displayValue(bill.mother_vessel)}`,
          `${displayValue(bill.point_of_origin)} / ${displayValue(bill.country_of_origin)}`,
          bill.final_destination ?? bill.place_of_delivery,
          bill.freight_payment,
        ])}
      />

      <EfmsTable
        title="Containers"
        headers={["Container", "Seal", "Loại", "Số lượng", "Vehicle", "House bill"]}
        rows={detail.containers.map((container) => [
          container.container_no,
          container.seal_no,
          container.container_type,
          container.quantity,
          `${displayValue(container.vehicle_type)} / ${displayValue(container.vehicle_no)}`,
          resolveHouseBillLabel(detail, container.house_bill_id),
        ])}
      />

      <EfmsTable
        title="Charges"
        headers={["Type", "Code", "Name", "Partner", "Qty", "Unit price", "Locked"]}
        rows={detail.charges.map((charge) => [
          charge.charge_type,
          charge.charge_code,
          charge.charge_name,
          charge.partner_name ?? resolvePartnerLabel(referencePartners, charge.partner_id),
          `${charge.quantity} ${displayValue(charge.unit)}`,
          `${formatCurrency(charge.unit_price)} ${charge.currency_code}`,
          yesNo(charge.is_locked),
        ])}
      />

      <EfmsTable
        title="Accounting Notes"
        headers={["Code", "Type", "Status", "Subject", "Date", "Total", "Paid"]}
        rows={detail.accounting_notes.map((note) => [
          note.note_code,
          note.note_type,
          note.note_status,
          note.subject_partner_name ?? resolvePartnerLabel(referencePartners, note.subject_partner_id),
          formatOptionalDate(note.note_date),
          `${formatCurrency(note.total_amount)} ${note.currency_code}`,
          formatOptionalDate(note.paid_at),
        ])}
      />

      <EfmsTable
        title="Assignments & Attachments"
        headers={["Loại", "Nội dung", "Người phụ trách", "Tiến độ", "Hoàn thành", "Ghi chú/File"]}
        rows={[
          ...detail.assignments.map((assignment) => [
            "Assignment",
            assignment.stage_content,
            assignment.assign_to_name ?? resolveUserLabel(referenceUsers, assignment.assign_to_user_id),
            `${assignment.progress}%`,
            formatOptionalDate(assignment.completed_at),
            assignment.notes,
          ]),
          ...detail.attachments.map((attachment) => [
            "Attachment",
            attachment.document_type,
            resolveUserLabel(referenceUsers, attachment.uploaded_by_user_id),
            attachment.file_mime_type,
            formatOptionalDate(attachment.uploaded_at),
            attachment.alias_name ?? attachment.original_file_name,
          ]),
        ]}
      />
    </section>
  )
}

function EfmsTable({ title, headers, rows }: { title: string; headers: string[]; rows: ReactNode[][] }) {
  return (
    <section className="min-w-0 space-y-2">
      <CardTitle className="text-base">{title}</CardTitle>
      <Table className="min-w-225 table-fixed">
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={`${title}-${rowIndex}`}>
              {row.map((value, cellIndex) => (
                <ValueCell key={`${title}-${rowIndex}-${cellIndex}`} value={value} />
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={headers.length} className="h-16 text-center text-gray-400">—</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </section>
  )
}

function ValueCell({ value }: { value: ReactNode }) {
  const renderedValue = typeof value === "string" || typeof value === "number" || value === null || value === undefined
    ? displayValue(value)
    : value

  return (
    <TableCell className={isEmptyDisplayValue(value) ? "text-gray-400" : undefined}>
      <div className="truncate">{renderedValue}</div>
    </TableCell>
  )
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-0 last:pb-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{value}</span>
    </div>
  )
}

function getTaskStats(order: DeliveryOrder) {
  const tasks = Object.values(order.personnel).flatMap((member) => member.tasks)
  const completed = tasks.filter((task) => task.completed_at || task.progress >= 100).length
  const inProgress = tasks.filter((task) => task.progress > 0 && task.progress < 100 && task.completed_at === null).length
  const notStarted = tasks.filter((task) => task.progress === 0 && task.completed_at === null).length

  return {
    total: tasks.length,
    completed,
    inProgress,
    notStarted,
  }
}

function SideSummaryCard({ order, taskStats }: { order: DeliveryOrder; taskStats: ReturnType<typeof getTaskStats> }) {
  return (
    <Card size="sm" className="h-fit">
      <CardHeader className="border-b pb-3">
        <CardTitle>Tóm tắt công việc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Trạng thái DO</span>
            <StatusBadge value={order.order_info.status} />
          </div>
          <TaskCompletionSummary stats={taskStats} />
        </div>

        <div className="space-y-3">
          <div className="text-xs font-medium uppercase text-muted-foreground">Mốc vận chuyển</div>
          <TimelineItem label="Cut-off" value={formatDate(order.logistics_shipping.cut_off_date)} />
          <TimelineItem label="ETD kế hoạch" value={formatDate(order.logistics_shipping.etd_planned)} />
          <TimelineItem label="ETD thực tế" value={formatOptionalDate(order.logistics_shipping.etd_actual)} />
          <TimelineItem label="ETA kế hoạch" value={formatDate(order.logistics_shipping.eta_planned)} />
          <TimelineItem label="ETA thực tế" value={formatOptionalDate(order.logistics_shipping.eta_actual)} />
          <TimelineItem label="Hạn nhập kho" value={formatDate(order.warehouse_tracking.warehouse_deadline)} />
          <TimelineItem label="Nhập kho" value={formatOptionalDate(order.warehouse_tracking.actual_entry_date)} />
        </div>
      </CardContent>
    </Card>
  )
}

function TaskDetailSection({
  order,
  selectedRole,
  startTask,
  completeTask,
}: {
  order: DeliveryOrder
  selectedRole: Parameters<typeof canPerform>[0]
  startTask: (role: PersonnelRole, taskName: string, deliveryOrderId: string, taskIndex?: number) => void
  completeTask: (role: PersonnelRole, taskName: string, deliveryOrderId: string, taskIndex?: number) => void
}) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="border-b pb-3">
        <CardTitle>Công việc nhân sự</CardTitle>
      </div>
      <div className="grid gap-3 2xl:grid-cols-2">
        {(Object.entries(order.personnel) as Array<[PersonnelRole, DeliveryOrder["personnel"][PersonnelRole]]>).map(([role, member]) => {
          const canUpdateRoleTasks = canUpdateTask(selectedRole, { role })

          return (
            <div key={role} className="min-w-0 rounded-lg border p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{personnelRoleLabels[role]}</div>
                  <div className="truncate text-xs text-muted-foreground">Người phụ trách: {member.assignee}</div>
                </div>
                <StatusBadge value={getRoleStatus(member.tasks)} />
              </div>
              <div className="space-y-3">
                {member.tasks.map((task, taskIndex) => (
                  <div key={`${role}-${task.task_name}`} className="rounded-lg bg-muted/40 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 truncate font-medium">{task.task_name}</div>
                      <TaskStatusBadge progress={task.progress} completedAt={task.completed_at} />
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <span className="truncate">Người tạo: <span className="font-medium text-foreground">{task.created_by}</span></span>
                        <span className="truncate">Created by ID: <span className="font-medium text-foreground">{displayValue(task.created_by_user_id)}</span></span>
                        <span className="truncate">Assignee ID: <span className="font-medium text-foreground">{displayValue(member.assignee_user_id)}</span></span>
                        <span className="truncate">Assigned by ID: <span className="font-medium text-foreground">{displayValue(member.assigned_by_user_id)}</span></span>
                        <span>Ngày tạo: <span className="font-medium text-foreground">{formatDate(task.created_at)}</span></span>
                        <span>Ngày giao: <span className="font-medium text-foreground">{formatOptionalDate(task.assigned_at)}</span></span>
                        <span>Ngày hoàn thành: <span className="font-medium text-foreground">{task.completed_at ? formatDate(task.completed_at) : "Chưa hoàn thành"}</span></span>
                        <span className="truncate">Ghi chú: <span className="font-medium text-foreground">{displayValue(task.notes)}</span></span>
                      </div>
                      {!canUpdateRoleTasks && (
                        <div className="text-xs text-muted-foreground">{getTaskDisabledReason(selectedRole, role)}</div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getTaskStatus(task.progress, task.completed_at) === "COMPLETED" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Đã hoàn thành</Badge>
                        ) : (
                          <>
                            <PermissionActionButton
                              allowed={canUpdateRoleTasks}
                              disabledReason={getTaskDisabledReason(selectedRole, role)}
                              onClick={() => startTask(role, task.task_name, order.order_info.order_number, taskIndex)}
                            >
                              Bắt đầu
                            </PermissionActionButton>
                            <PermissionActionButton
                              allowed={canUpdateRoleTasks}
                              disabledReason={getTaskDisabledReason(selectedRole, role)}
                              onClick={() => completeTask(role, task.task_name, order.order_info.order_number, taskIndex)}
                            >
                              Hoàn thành
                            </PermissionActionButton>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {member.tasks.length === 0 && (
                  <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Chưa có công việc trong nhóm này.</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function WorkflowFlowCard({ order }: { order: DeliveryOrder }) {
  const steps = [
    {
      title: "PR",
      value: order.order_info.request_code,
      detail: "Yêu cầu mua hàng",
    },
    {
      title: "PO/DO",
      value: order.sap_integration.po_number,
      detail: order.order_info.order_number,
    },
    {
      title: "Vận chuyển",
      value: formatDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned),
      detail: "ETA dự kiến/thực tế",
    },
    {
      title: "Nhập kho",
      value: formatOptionalDate(order.warehouse_tracking.actual_entry_date),
      detail: `Hạn ${formatDate(order.warehouse_tracking.warehouse_deadline)}`,
    },
  ]

  return (
    <Card size="sm">
      <CardContent>
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="min-w-0 rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-medium uppercase text-muted-foreground">Bước {index + 1}</div>
                <Badge variant="outline">{step.title}</Badge>
              </div>
              <div className="mt-2 truncate text-sm font-semibold">{step.value}</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">{step.detail}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TaskCompletionSummary({ stats }: { stats: ReturnType<typeof getTaskStats> }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">{stats.completed}/{stats.total} hoàn thành</Badge>
      {stats.inProgress > 0 && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{stats.inProgress} đang làm</Badge>}
      {stats.notStarted > 0 && <Badge variant="outline" className="bg-muted/60 text-muted-foreground">{stats.notStarted} chưa bắt đầu</Badge>}
    </div>
  )
}

function getRoleStatus(tasks: DeliveryOrder["personnel"][PersonnelRole]["tasks"]) {
  if (tasks.length === 0) return "NOT_STARTED"
  if (tasks.every((task) => task.completed_at || task.progress >= 100)) return "COMPLETED"
  if (tasks.some((task) => task.progress > 0)) return "IN_PROGRESS"
  return "NOT_STARTED"
}

function yesNo(value: boolean) {
  return value ? "Có" : "Không"
}

function resolveUserLabel(users: AppUser[], userId?: string | null) {
  if (!userId) return null
  const user = users.find((item) => item.id === userId)
  return user ? `${user.display_name} (${user.role})` : userId
}

function resolvePartnerLabel(partners: Partner[], partnerId?: string | null) {
  if (!partnerId) return null
  const partner = partners.find((item) => item.id === partnerId)
  return partner ? `${partner.partner_name} (${partner.partner_type})` : partnerId
}

function resolveHouseBillLabel(detail: EfmsDetail, houseBillId?: string | null) {
  if (!houseBillId) return null
  const houseBill = detail.house_bills.find((item) => item.id === houseBillId)
  return houseBill?.hbl_number ?? houseBillId
}

function resolveHouseBillLabelFromList(houseBills: EfmsHouseBill[], houseBillId?: string | null) {
  if (!houseBillId) return null
  const houseBill = houseBills.find((item) => item.id === houseBillId)
  return houseBill?.hbl_number ?? houseBillId
}
