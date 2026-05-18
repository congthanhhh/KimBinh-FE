import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { HeaderTooltip } from "@/components/shared/HeaderTooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PermissionActionButton } from "@/components/shared/PermissionActionButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ActionsCell, CompositeCell, StatusCell } from "@/components/shared/TableCells"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagination } from "@/hooks/usePagination"
import { useDemoStore } from "@/store/demoStore"
import { formatDate, formatOptionalDate } from "@/utils/formatters"
import { getStatusLabel } from "@/utils/labels"
import { actionUnavailableReason, canPerform, roleLabels } from "@/utils/permissions"

export function DeliveryOrdersPage() {
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [delayFilter, setDelayFilter] = useState("ALL")
  const filteredOrders = useMemo(
    () =>
      deliveryOrders.filter((order) => {
        const matchesQuery = [
          order.order_info.order_number,
          order.order_info.request_code,
          order.order_info.tracking_number,
          order.sap_integration.po_number,
          order.sap_integration.supplier_code,
          order.product_details.item_name_requested,
          order.logistics_shipping.shipping_method,
          order.order_info.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())

        const isDelayed = order.warehouse_tracking.delay_days > 0

        return (
          matchesQuery &&
          (statusFilter === "ALL" || order.order_info.status === statusFilter) &&
          (delayFilter === "ALL" || (delayFilter === "DELAYED" ? isDelayed : !isDelayed))
        )
      }),
    [deliveryOrders, delayFilter, query, statusFilter]
  )
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems: paginatedOrders,
    setPageSize,
    nextPage,
    previousPage,
    resetPage,
  } = usePagination(filteredOrders)
  const canCreateOrder = canPerform(selectedRole, "createDeliveryOrder")
  const canUpdateOrder = canPerform(selectedRole, "updateDeliveryOrderCore")
  const canUpdateProduct = canPerform(selectedRole, "updateProductDetails")
  const canUpdateSap = canPerform(selectedRole, "updateSapIntegration")
  const canUpdateLogistics = canPerform(selectedRole, "updateLogisticsShipping")
  const canUpdateWarehouse = canPerform(selectedRole, "updateWarehouseTracking")
  const canUpdateFinanceTax = canPerform(selectedRole, "updateFinanceTax")
  const canActOnDelivery =
    canCreateOrder || canUpdateOrder || canUpdateProduct || canUpdateSap || canUpdateLogistics || canUpdateWarehouse || canUpdateFinanceTax
  const statusSummary = useMemo(() => {
    return filteredOrders.reduce<Record<string, number>>((summary, order) => {
      summary[order.order_info.status] = (summary[order.order_info.status] ?? 0) + 1

      return summary
    }, {})
  }, [filteredOrders])
  const attentionOrders = useMemo(
    () =>
      filteredOrders
        .filter((order) => order.warehouse_tracking.delay_days > 0)
        .sort((first, second) => second.warehouse_tracking.delay_days - first.warehouse_tracking.delay_days)
        .slice(0, 3),
    [filteredOrders]
  )
  const upcomingMilestones = useMemo(
    () =>
      filteredOrders
        .filter((order) => !order.warehouse_tracking.actual_entry_date)
        .map((order) => ({
          order,
          eta: order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned,
          warehouseDeadline: order.warehouse_tracking.warehouse_deadline,
        }))
        .sort((first, second) => new Date(first.eta).getTime() - new Date(second.eta).getTime())
        .slice(0, 4),
    [filteredOrders]
  )

  useEffect(() => {
    resetPage()
  }, [delayFilter, query, resetPage, statusFilter])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Đơn nhập hàng"
        description="DO, PO, SAP, vận chuyển, kho, tài chính và task được giữ đầy đủ. Tạo DO từ PR đã duyệt tại trang Yêu cầu mua hàng."
        action={
          canCreateOrder ? (
            <Button variant="default" size="default" render={<Link to="/purchase-requests" />}>
              Tạo từ PR đã duyệt
            </Button>
          ) : (
            <PermissionActionButton allowed={false} variant="default" size="default" showDisabledReason>
              Tạo từ PR đã duyệt
            </PermissionActionButton>
          )
        }
      />
      <Card>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Chế độ xem: {roleLabels[selectedRole]}</div>
            <div className="text-xs text-muted-foreground">
              Quản lý mua hàng / PIC cập nhật PO/DO, SAP, vận chuyển và kho; Nhân viên hải quan cập nhật tài chính/thuế; các role khác cập nhật task của mình.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={canActOnDelivery ? "secondary" : "outline"}>
              {canActOnDelivery ? "Có thể thao tác dữ liệu DO" : "Chỉ xem dữ liệu DO"}
            </Badge>
            {!canActOnDelivery && <span className="text-xs text-muted-foreground">{actionUnavailableReason}</span>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_180px]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm PO, DO, tracking, mã PR, tên hàng hoặc mã SAP"
            />
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Lọc trạng thái DO"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="PO_CREATED">Đã tạo PO</option>
              <option value="IN_TRANSIT">Đang vận chuyển</option>
              <option value="CUSTOMS_PROCESSING">Đang khai quan</option>
              <option value="WAREHOUSE_RECEIVED">Đã nhập kho</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="DELAYED">Trễ hạn</option>
            </select>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={delayFilter}
              onChange={(event) => setDelayFilter(event.target.value)}
              aria-label="Lọc trễ hạn"
            >
              <option value="ALL">Tất cả hạn</option>
              <option value="DELAYED">Đang trễ</option>
              <option value="ON_TIME">Đúng hạn</option>
            </select>
          </div>
          <Table className="min-w-[1080px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">
                  <HeaderTooltip label="Đơn hàng" subtitle="Mã DO / Tracking" tooltip="Order Number + Tracking Number" />
                </TableHead>
                <TableHead className="w-36">
                  <HeaderTooltip label="PO / PR" subtitle="Số PO / Mã PR" tooltip="PO Number + Request Code" />
                </TableHead>
                <TableHead>
                  <HeaderTooltip label="Hàng hóa" subtitle="Tên hàng / Số lượng" tooltip="Item Name + Quantity" />
                </TableHead>
                <TableHead className="w-44">
                  <HeaderTooltip label="Vận chuyển" subtitle="Phương thức / Hãng" tooltip="Shipping Method + Shipping Line" />
                </TableHead>
                <TableHead className="w-32">
                  <HeaderTooltip label="Thời gian" subtitle="ETD / ETA" tooltip="Estimated Time of Departure + Estimated Time of Arrival" />
                </TableHead>
                <TableHead className="w-32"><HeaderTooltip label="Trạng thái" subtitle="Tình trạng" tooltip="Status / order_info.status" /></TableHead>
                <TableHead className="w-28"><HeaderTooltip label="Trễ" subtitle="Số ngày" tooltip="Delay Days / warehouse_tracking.delay_days" /></TableHead>
                <TableHead className="w-28"><HeaderTooltip label="Thao tác" subtitle="Hành động" tooltip="Actions" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.order_info.order_number}>
                  <CompositeCell
                    className="w-40"
                    lines={[
                      { label: "DO", value: order.order_info.order_number, emphasis: true },
                      { label: "TRK", value: order.order_info.tracking_number },
                    ]}
                  />
                  <CompositeCell
                    className="w-36"
                    lines={[
                      { label: "PO", value: order.sap_integration.po_number, emphasis: true },
                      { label: "PR", value: order.order_info.request_code },
                    ]}
                  />
                  <CompositeCell
                    lines={[
                      { label: "Tên", value: order.product_details.item_name_requested, emphasis: true },
                      { label: "SL", value: `${order.product_details.quantity.toLocaleString()} ${order.product_details.unit}` },
                    ]}
                  />
                  <CompositeCell
                    className="w-44"
                    lines={[
                      { label: "PT", value: order.logistics_shipping.shipping_method, emphasis: true },
                      { label: "Hãng", value: order.logistics_shipping.shipping_line },
                    ]}
                  />
                  <CompositeCell
                    className="w-32"
                    lines={[
                      { label: "ETD", value: formatOptionalDate(order.logistics_shipping.etd_actual ?? order.logistics_shipping.etd_planned), emphasis: true },
                      { label: "ETA", value: formatOptionalDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned) },
                    ]}
                  />
                  <StatusCell><StatusBadge value={order.order_info.status} /></StatusCell>
                  <StatusCell className="w-28">
                    <StatusBadge
                      value={order.warehouse_tracking.delay_days > 0 ? `${order.warehouse_tracking.delay_days} days delayed` : "ON_TIME"}
                    />
                  </StatusCell>
                  <ActionsCell className="w-28">
                    <Button variant="outline" size="sm" render={<Link to={`/delivery-orders/${order.order_info.order_number}`} />}>
                      Chi tiết
                    </Button>
                  </ActionsCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    <div className="font-medium text-foreground">Không tìm thấy dữ liệu phù hợp.</div>
                    <div className="mt-1 text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalItems > 0 && (
            <PaginationControls
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageSizeChange={setPageSize}
              onPreviousPage={previousPage}
              onNextPage={nextPage}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card size="sm">
          <CardHeader className="border-b pb-3">
            <CardTitle>Trạng thái đơn nhập</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(statusSummary).length > 0 ? (
              Object.entries(statusSummary)
                .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 truncate">{getStatusLabel(status)}</div>
                    <Badge variant="secondary" className="shrink-0">{count} đơn</Badge>
                  </div>
                ))
            ) : (
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Chưa có dữ liệu trạng thái.</div>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="border-b pb-3">
            <CardTitle>Đơn cần chú ý</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attentionOrders.length > 0 ? (
              attentionOrders.map((order) => (
                <Link
                  key={order.order_info.order_number}
                  to={`/delivery-orders/${order.order_info.order_number}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 truncate text-sm font-medium">
                      {order.order_info.order_number}
                    </div>
                    <StatusBadge value={`${order.warehouse_tracking.delay_days} days delayed`} />
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {order.product_details.item_name_requested}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Hạn nhập kho: {formatDate(order.warehouse_tracking.warehouse_deadline)}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Không có đơn trễ hạn trong dữ liệu hiện tại.</div>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="border-b pb-3">
            <CardTitle>Mốc vận chuyển gần nhất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMilestones.length > 0 ? (
              upcomingMilestones.map(({ order, eta, warehouseDeadline }) => (
                <Link
                  key={order.order_info.order_number}
                  to={`/delivery-orders/${order.order_info.order_number}`}
                  className="block rounded-lg border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 truncate text-sm font-medium">
                      {order.order_info.order_number}
                    </div>
                    <StatusBadge value={order.order_info.status} />
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between gap-3">
                      <span>ETA</span>
                      <span className="font-medium text-foreground">{formatOptionalDate(eta)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Hạn nhập kho</span>
                      <span className="font-medium text-foreground">{formatDate(warehouseDeadline)}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">Không còn mốc vận chuyển đang mở.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
