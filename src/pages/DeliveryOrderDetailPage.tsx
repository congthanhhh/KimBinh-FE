import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"

import { PageHeader } from "@/components/shared/PageHeader"
import { PermissionActionButton } from "@/components/shared/PermissionActionButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { TaskStatusBadge } from "@/components/shared/TaskStatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoStore } from "@/store/demoStore"
import type { DeliveryOrder, PersonnelRole } from "@/types"
import { displayValue, formatCurrency, formatDate, formatOptionalDate } from "@/utils/formatters"
import { actionUnavailableReason, canPerform, canUpdateTask, getTaskDisabledReason, personnelRoleLabels, roleLabels } from "@/utils/permissions"
import { getTaskStatus } from "@/utils/task-status"

type InfoItem = {
  label: string
  value: ReactNode
}

export function DeliveryOrderDetailPage() {
  const { id } = useParams()
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
  const updateDeliveryOrder = useDemoStore((state) => state.updateDeliveryOrder)
  const startTask = useDemoStore((state) => state.startTask)
  const completeTask = useDemoStore((state) => state.completeTask)
  const confirmWarehouseEntry = useDemoStore((state) => state.confirmWarehouseEntry)
  const order = deliveryOrders.find((item) => item.order_info.order_number === id)

  if (!order) {
    return (
      <div className="space-y-4">
        <PageHeader title="Không tìm thấy DO" description="DO trong dữ liệu demo không tồn tại." />
        <Button variant="outline" render={<Link to="/delivery-orders" />}>Quay lại danh sách</Button>
      </div>
    )
  }

  const taskStats = getTaskStats(order)
  const canUpdateOrder = canPerform(selectedRole, "updateDeliveryOrderCore")
  const canUpdateProduct = canPerform(selectedRole, "updateProductDetails")
  const canUpdateSap = canPerform(selectedRole, "updateSapIntegration")
  const canUpdateLogistics = canPerform(selectedRole, "updateLogisticsShipping")
  const canUpdateWarehouse = canPerform(selectedRole, "updateWarehouseTracking")
  const canUpdateFinanceTax = canPerform(selectedRole, "updateFinanceTax")

  return (
    <div className="space-y-4">
      <PageHeader
        title={order.order_info.order_number}
        description={`${order.order_info.request_code} -> PO ${order.sap_integration.po_number} -> hạn nhập kho ${formatDate(order.warehouse_tracking.warehouse_deadline)}`}
        action={<Button variant="outline" render={<Link to="/delivery-orders" />}>Quay lại</Button>}
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
                    { label: "Số PO", value: order.sap_integration.po_number },
                    { label: "Mã tracking", value: order.order_info.tracking_number },
                    { label: "Hợp đồng mua", value: order.order_info.purchase_contract_number },
                    { label: "Trạng thái", value: <StatusBadge value={order.order_info.status} /> },
                    { label: "Ghi chú", value: displayValue(order.order_info.notes) },
                    { label: "Ghi chú XNK", value: displayValue(order.order_info.xnk_notes) },
                  ]}
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
                    { label: "Mã tàu", value: order.logistics_shipping.vessel_code },
                    { label: "Cảng đi", value: order.logistics_shipping.port_of_departure },
                    { label: "Cảng đến", value: order.logistics_shipping.port_of_destination },
                    { label: "Cut-off", value: formatOptionalDate(order.logistics_shipping.cut_off_date) },
                    { label: "ETD kế hoạch", value: formatOptionalDate(order.logistics_shipping.etd_planned) },
                    { label: "ETD thực tế", value: formatOptionalDate(order.logistics_shipping.etd_actual) },
                    { label: "ETA kế hoạch", value: formatOptionalDate(order.logistics_shipping.eta_planned) },
                    { label: "ETA thực tế", value: formatOptionalDate(order.logistics_shipping.eta_actual) },
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
                    { label: "Hạn nộp thuế", value: formatDate(order.finance_tax.tax_payment_deadline) },
                    { label: "Bảo hiểm", value: order.finance_tax.insurance },
                  ]}
                />
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
    <div className={`mt-1 text-sm font-medium ${typeof renderedValue === "string" || typeof renderedValue === "number" ? "truncate" : ""}`}>
      {renderedValue}
    </div>
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
                        <span>Ngày tạo: <span className="font-medium text-foreground">{formatDate(task.created_at)}</span></span>
                        <span>Ngày giao: <span className="font-medium text-foreground">{formatOptionalDate(task.assigned_at)}</span></span>
                        <span>Ngày hoàn thành: <span className="font-medium text-foreground">{task.completed_at ? formatDate(task.completed_at) : "Chưa hoàn thành"}</span></span>
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
