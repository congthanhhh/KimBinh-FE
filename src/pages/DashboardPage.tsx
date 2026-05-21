import { ClipboardList, FileText, PackageCheck } from "lucide-react"
import { Link } from "react-router-dom"

import { HeaderTooltip } from "@/components/shared/HeaderTooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CodeCell, DateCell, StatusCell, TwoLineCell } from "@/components/shared/TableCells"
import { TaskStatusBadge } from "@/components/shared/TaskStatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDemoStore } from "@/store/demoStore"
import { fieldTooltips } from "@/utils/fieldTooltips"
import { formatDate, formatOptionalDate } from "@/utils/formatters"
import { getStatusLabel } from "@/utils/labels"
import { getRoleActionDetails, roleFocus } from "@/utils/permissions"

export function DashboardPage() {
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const purchaseRequests = useDemoStore((state) => state.purchaseRequests)
  const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
  const tasks = useDemoStore((state) => state.personnelTasks)
  const purchaseOrderDetailsById = useDemoStore((state) => state.purchaseOrderDetailsById)
  const efmsDetailsByDeliveryOrderId = useDemoStore((state) => state.efmsDetailsByDeliveryOrderId)
  const referenceUsers = useDemoStore((state) => state.referenceUsers)
  const purchaseOrders = Object.values(purchaseOrderDetailsById)
  const efmsDetails = Object.values(efmsDetailsByDeliveryOrderId)
  const prStatusSummary = purchaseRequests.reduce<Record<string, number>>((summary, request) => {
    summary[request.status] = (summary[request.status] ?? 0) + 1
    return summary
  }, {})
  const doStatusSummary = deliveryOrders.reduce<Record<string, number>>((summary, order) => {
    summary[order.order_info.status] = (summary[order.order_info.status] ?? 0) + 1
    return summary
  }, {})
  const activeDeliveries = deliveryOrders.filter(
    (order) => !["COMPLETED", "CANCELLED", "WAREHOUSE_RECEIVED"].includes(order.order_info.status)
  )
  const delayedDeliveries = deliveryOrders.filter((order) => order.warehouse_tracking.delay_days > 0)
  const receivedDeliveries = deliveryOrders.filter(
    (order) => order.warehouse_tracking.actual_entry_date || order.order_info.status === "WAREHOUSE_RECEIVED"
  )
  const upcomingWarehouseItems = [...deliveryOrders]
    .filter((order) => !order.warehouse_tracking.actual_entry_date && order.order_info.status !== "CANCELLED")
    .sort((a, b) => a.warehouse_tracking.warehouse_deadline.localeCompare(b.warehouse_tracking.warehouse_deadline))
    .slice(0, 4)
  const pendingTasks = tasks.filter((task) => task.progress < 100 && task.completed_at === null)
  const urgentRequests = [...purchaseRequests]
    .filter((request) => request.status !== "COMPLETED" && request.status !== "CANCELLED")
    .sort((a, b) => getPriorityRank(a.priority) - getPriorityRank(b.priority) || a.warehouse_deadline_date.localeCompare(b.warehouse_deadline_date))
    .slice(0, 4)
  const delayedDeliveriesPreview = delayedDeliveries.slice(0, 5)
  const pendingTasksPreview = pendingTasks.slice(0, 5)
  const receivedDeliveriesPreview = receivedDeliveries.slice(0, 5)
  const roleActionDetails = getRoleActionDetails(selectedRole)
  const purchaseRequestStatusOrder = ["NEW", "APPROVED", "PROCESSING", "COMPLETED", "CANCELLED"] as const
  const purchaseOrderStatusOrder = ["DRAFT", "CREATED", "CONFIRMED", "PARTIALLY_DELIVERED", "COMPLETED", "CANCELLED"] as const
  const deliveryOrderStatusOrder = [
    "DRAFT",
    "PO_CREATED",
    "IN_TRANSIT",
    "CUSTOMS_PROCESSING",
    "WAREHOUSE_RECEIVED",
    "COMPLETED",
    "DELAYED",
  ] as const
  const poStatusSummary = purchaseOrders.reduce<Record<string, number>>((summary, order) => {
    summary[order.status] = (summary[order.status] ?? 0) + 1
    return summary
  }, {})
  const supplierSummary = purchaseOrders.reduce<Record<string, number>>((summary, order) => {
    const supplier = order.supplier_name || "—"
    summary[supplier] = (summary[supplier] ?? 0) + 1
    return summary
  }, {})
  const topSuppliers = Object.entries(supplierSummary).sort(([, first], [, second]) => second - first).slice(0, 3)
  const efmsTotals = efmsDetails.reduce(
    (summary, detail) => ({
      houseBills: summary.houseBills + detail.house_bills.length,
      containers: summary.containers + detail.containers.length,
      charges: summary.charges + detail.charges.length,
      accountingNotes: summary.accountingNotes + detail.accounting_notes.length,
    }),
    { houseBills: 0, containers: 0, charges: 0, accountingNotes: 0 }
  )
  const linkedUsersCount = purchaseRequests.filter(
    (request) =>
      referenceUsers.some((user) => user.id === request.requester_user_id) ||
      referenceUsers.some((user) => user.id === request.purchasing_manager_user_id)
  ).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
      case "CONFIRMED":
      case "WAREHOUSE_RECEIVED":
        return "text-green-500"
      case "DELAYED":
      case "CANCELLED":
        return "text-red-500"
      case "PROCESSING":
      case "IN_TRANSIT":
      case "PARTIALLY_DELIVERED":
        return "text-blue-500"
      case "CUSTOMS_PROCESSING":
        return "text-amber-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tổng quan quản lý nhập hàng"
        description="Theo dõi PR, DO, vận chuyển, hạn kho, tài chính và trạng thái công việc nhân sự bằng dữ liệu demo."
      />

      <Card>
        <CardContent className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div>
            <div className="text-xs font-medium uppercase text-muted-foreground">Vai trò hiện tại</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{roleActionDetails.label}</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{roleActionDetails.description}</p>
            <div className="mt-1">
              <div className="text-xs font-medium uppercase text-muted-foreground">Có thể thực hiện</div>
              <div className="">
                {roleActionDetails.allowedActions.map((action) => (
                  <div key={action} className="text-xs text-muted-foreground">
                    {action}
                  </div>
                ))}
              </div>
            </div>
            <div>
              {roleActionDetails.limitations.map((limitation) => (
                <div key={limitation} className="text-xs text-muted-foreground">
                  {limitation}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs font-medium uppercase text-muted-foreground">Trọng tâm demo</div>
            <div className="mt-1 text-sm font-semibold">{roleFocus[selectedRole]}</div>
            <div className="mt-3 text-xs font-medium uppercase text-muted-foreground">Giới hạn trong demo</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Không có login, session, backend permission hoặc dữ liệu thật.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">PR theo trạng thái</div>
          <div className="flex flex-wrap overflow-hidden rounded-lg border bg-card shadow-sm">
            {purchaseRequestStatusOrder.map((status) => (
              <div
                key={`pr-${status}`}
                className={`flex min-w-36 flex-1 items-center justify-between gap-3 border-b border-r px-4 py-3 last:border-r-0 sm:min-w-40 xl:border-b-0 ${(prStatusSummary[status] ?? 0) === 0 ? "opacity-45" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <ClipboardList className={`size-4 shrink-0 ${getStatusColor(status)}`} />
                  <span className="truncate text-xs font-medium uppercase text-muted-foreground">{getStatusLabel(status)}</span>
                </div>
                <div className="min-w-10 shrink-0 text-right text-2xl font-bold leading-none tabular-nums text-foreground">
                  {String(prStatusSummary[status] ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">PO theo trạng thái</div>
          <div className="flex flex-wrap overflow-hidden rounded-lg border bg-card shadow-sm">
            {purchaseOrderStatusOrder.map((status) => (
              <div
                key={`po-${status}`}
                className={`flex min-w-36 flex-1 items-center justify-between gap-3 border-b border-r px-4 py-3 last:border-r-0 sm:min-w-40 2xl:border-b-0 ${(poStatusSummary[status] ?? 0) === 0 ? "opacity-45" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className={`size-4 shrink-0 ${getStatusColor(status)}`} />
                  <span className="truncate text-xs font-medium uppercase text-muted-foreground">{getStatusLabel(status)}</span>
                </div>
                <div className="min-w-10 shrink-0 text-right text-2xl font-bold leading-none tabular-nums text-foreground">
                  {String(poStatusSummary[status] ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">DO theo trạng thái</div>
          <div className="flex flex-wrap overflow-hidden rounded-lg border bg-card shadow-sm">
            {deliveryOrderStatusOrder.map((status) => (
              <div
                key={`do-${status}`}
                className={`flex min-w-36 flex-1 items-center justify-between gap-3 border-b border-r px-4 py-3 last:border-r-0 sm:min-w-40 2xl:border-b-0 ${(doStatusSummary[status] ?? 0) === 0 ? "opacity-45" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <PackageCheck className={`size-4 shrink-0 ${getStatusColor(status)}`} />
                  <span className="truncate text-xs font-medium uppercase text-muted-foreground">{getStatusLabel(status)}</span>
                </div>
                <div className="min-w-10 shrink-0 text-right text-2xl font-bold leading-none tabular-nums text-foreground">
                  {String(doStatusSummary[status] ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Tổng PO</span>
              <span className="font-semibold">{purchaseOrders.length}</span>
            </div>
            {Object.entries(poStatusSummary).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between gap-3">
                <StatusBadge value={status} />
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {purchaseOrders.length === 0 && <div className="text-sm text-gray-400">—</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nhà cung cấp nổi bật</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topSuppliers.map(([supplier, count]) => (
              <div key={supplier} className="flex items-center justify-between gap-3 text-sm">
                <span className={supplier === "—" ? "text-gray-400" : "truncate font-medium text-foreground"}>{supplier}</span>
                <span className="shrink-0 font-bold">{count} PO</span>
              </div>
            ))}
            {topSuppliers.length === 0 && <div className="text-sm text-gray-400">—</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>eFMS & người liên quan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-xs uppercase text-muted-foreground">HBL</span><div className="text-lg font-bold">{efmsTotals.houseBills}</div></div>
            <div><span className="text-xs uppercase text-muted-foreground">Container</span><div className="text-lg font-bold">{efmsTotals.containers}</div></div>
            <div><span className="text-xs uppercase text-muted-foreground">Charge</span><div className="text-lg font-bold">{efmsTotals.charges}</div></div>
            <div><span className="text-xs uppercase text-muted-foreground">Note</span><div className="text-lg font-bold">{efmsTotals.accountingNotes}</div></div>
            <div className="col-span-2 mt-2 border-t pt-2 text-xs text-muted-foreground">
              {linkedUsersCount} PR đang resolve được requester/PIC theo app_users.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu mua hàng cần chú ý</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-160 table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28"><HeaderTooltip label="Mã PR" tooltip={fieldTooltips.requested_order_id} /></TableHead>
                  <TableHead><HeaderTooltip label="Hàng hóa" tooltip={`${fieldTooltips.item_name}; ${fieldTooltips.item_code}; ${fieldTooltips.quantity}`} /></TableHead>
                  <TableHead className="w-28"><HeaderTooltip label="Hạn kho" tooltip={fieldTooltips.warehouse_deadline_date} /></TableHead>
                  <TableHead className="w-32"><HeaderTooltip label="Trạng thái" tooltip={fieldTooltips.status} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urgentRequests.map((request) => (
                  <TableRow key={request.requested_order_id}>
                    <CodeCell className="w-28 max-w-28">{request.requested_order_id}</CodeCell>
                    <TwoLineCell
                      primary={request.item_name}
                      secondary={`${request.quantity.toLocaleString()} ${request.unit} · ${request.priority}`}
                    />
                    <DateCell>{formatDate(request.warehouse_deadline_date)}</DateCell>
                    <StatusCell><StatusBadge value={request.status} /></StatusCell>
                  </TableRow>
                ))}
                {urgentRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Chưa có yêu cầu mua hàng cần chú ý.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiến độ vận chuyển</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeDeliveries.slice(0, 3).map((order) => (
              <div key={order.order_info.order_number} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{order.order_info.order_number}</div>
                    <div className="text-xs text-muted-foreground">{order.product_details.item_name_requested}</div>
                  </div>
                  <StatusBadge value={order.order_info.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>ETD {formatOptionalDate(order.logistics_shipping.etd_actual ?? order.logistics_shipping.etd_planned)}</span>
                  <span>ETA {formatOptionalDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned)}</span>
                  <span>{order.logistics_shipping.port_of_departure}</span>
                  <span>{order.logistics_shipping.port_of_destination}</span>
                </div>
              </div>
            ))}
            {activeDeliveries.length === 0 && (
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                Không có đơn nhập hàng đang chạy.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đơn nhập hàng trễ hạn</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-170 table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32"><HeaderTooltip label="Số PO" tooltip={`${fieldTooltips.po_number}; ${fieldTooltips.requested_order_id}`} /></TableHead>
                  <TableHead><HeaderTooltip label="Hàng hóa" tooltip={fieldTooltips.item_name_requested} /></TableHead>
                  <TableHead className="w-28"><HeaderTooltip label="ETA" tooltip={fieldTooltips.eta} /></TableHead>
                  <TableHead className="w-28"><HeaderTooltip label="Trễ" tooltip={fieldTooltips.delay_days} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayedDeliveriesPreview.map((order) => (
                  <TableRow key={order.order_info.order_number}>
                    <TwoLineCell
                      className="w-32"
                      primary={(
                        <Button variant="link" nativeButton={false} render={<Link to={`/delivery-orders/${order.order_info.order_number}`} />}>
                          {order.sap_integration.po_number}
                        </Button>
                      )}
                      secondary={order.order_info.request_code}
                    />
                    <TwoLineCell
                      primary={order.product_details.item_name_requested}
                      secondary={`Hạn kho ${formatDate(order.warehouse_tracking.warehouse_deadline)}`}
                    />
                    <DateCell>{formatOptionalDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned)}</DateCell>
                    <StatusCell><StatusBadge value={`${order.warehouse_tracking.delay_days} days delayed`} /></StatusCell>
                  </TableRow>
                ))}
                {delayedDeliveries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Chưa có đơn nhập hàng trễ hạn.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Công việc đang thực hiện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasksPreview.map((task) => (
              <div key={`${task.order_number}-${task.role}-${task.task_name}`} className="grid gap-2 border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{task.task_name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {task.role_label} - {task.assignee} - {task.po_number}
                    </div>
                  </div>
                  <TaskStatusBadge progress={task.progress} completedAt={task.completed_at} />
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                Không có công việc đang mở.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sắp tới hạn nhập kho</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-170 table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32"><HeaderTooltip label="Số PO" tooltip={fieldTooltips.po_number} /></TableHead>
                  <TableHead><HeaderTooltip label="Hàng hóa" tooltip={fieldTooltips.item_name_requested} /></TableHead>
                  <TableHead className="w-28"><HeaderTooltip label="Hạn / ETA" tooltip={`${fieldTooltips.warehouse_deadline_date}; ${fieldTooltips.eta}`} /></TableHead>
                  <TableHead className="w-32"><HeaderTooltip label="Trạng thái" tooltip={fieldTooltips.status} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingWarehouseItems.map((order) => (
                  <TableRow key={order.order_info.order_number}>
                    <CodeCell>
                      <Button variant="link" nativeButton={false} render={<Link to={`/delivery-orders/${order.order_info.order_number}`} />}>
                        {order.sap_integration.po_number}
                      </Button>
                    </CodeCell>
                    <TwoLineCell
                      primary={order.product_details.item_name_requested}
                      secondary={`ETA ${formatOptionalDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned)}`}
                    />
                    <DateCell>{formatDate(order.warehouse_tracking.warehouse_deadline)}</DateCell>
                    <StatusCell>
                      <StatusBadge value={order.warehouse_tracking.delay_days > 0 ? `${order.warehouse_tracking.delay_days} days delayed` : order.order_info.status} />
                    </StatusCell>
                  </TableRow>
                ))}
                {upcomingWarehouseItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Chưa có đơn nhập hàng sắp tới hạn.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hàng đã nhập kho</CardTitle>
          </CardHeader>
          <CardContent>
            <Table className="min-w-170 table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32"><HeaderTooltip label="Số PO" tooltip={`${fieldTooltips.po_number}; ${fieldTooltips.requested_order_id}`} /></TableHead>
                  <TableHead><HeaderTooltip label="Hàng hóa" tooltip={fieldTooltips.item_name_requested} /></TableHead>
                  <TableHead className="w-32"><HeaderTooltip label="Ngày nhập" tooltip={fieldTooltips.actual_entry_date} /></TableHead>
                  <TableHead className="w-32"><HeaderTooltip label="Trạng thái" tooltip={fieldTooltips.status} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivedDeliveriesPreview.map((order) => (
                  <TableRow key={order.order_info.order_number}>
                    <CodeCell>
                      <Button variant="link" nativeButton={false} render={<Link to={`/delivery-orders/${order.order_info.order_number}`} />}>
                        {order.sap_integration.po_number}
                      </Button>
                    </CodeCell>
                    <TwoLineCell
                      primary={order.product_details.item_name_requested}
                      secondary={order.order_info.request_code}
                    />
                    <DateCell>{formatDate(order.warehouse_tracking.actual_entry_date ?? order.warehouse_tracking.planned_entry_date)}</DateCell>
                    <StatusCell><StatusBadge value={order.order_info.status} /></StatusCell>
                  </TableRow>
                ))}
                {receivedDeliveries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      Chưa có hàng đã nhập kho.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getPriorityRank(priority: string) {
  if (priority === "Priority 1" || priority === "Ưu tiên 1" || priority === "Khẩn cấp") return 1
  if (priority === "Priority 2" || priority === "Ưu tiên 2") return 2
  return 3
}
