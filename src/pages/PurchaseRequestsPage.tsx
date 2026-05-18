import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react"

import { HeaderTooltip } from "@/components/shared/HeaderTooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PermissionActionButton, PermissionNote } from "@/components/shared/PermissionActionButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ActionsCell, CompositeCell, StatusCell } from "@/components/shared/TableCells"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagination } from "@/hooks/usePagination"
import { useDemoStore } from "@/store/demoStore"
import type { PurchaseRequestStatus } from "@/types"
import { displayValue, formatDate, formatOptionalDate } from "@/utils/formatters"
import { getStatusLabel } from "@/utils/labels"
import { actionUnavailableReason, adminOrPurchasingManagerReason, canPerform, roleLabels } from "@/utils/permissions"

const purchaseRequestStatuses: PurchaseRequestStatus[] = ["NEW", "APPROVED", "PROCESSING", "COMPLETED", "CANCELLED"]

export function PurchaseRequestsPage() {
  const selectedRole = useDemoStore((state) => state.selectedRole)
  const purchaseRequests = useDemoStore((state) => state.purchaseRequests)
  const createPurchaseRequest = useDemoStore((state) => state.createPurchaseRequest)
  const updatePurchaseRequest = useDemoStore((state) => state.updatePurchaseRequest)
  const createDeliveryOrder = useDemoStore((state) => state.createDeliveryOrder)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [priorityFilter, setPriorityFilter] = useState("ALL")
  const [selectedRequestId, setSelectedRequestId] = useState(purchaseRequests[0]?.requested_order_id ?? "")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [purchasingManagerDraft, setPurchasingManagerDraft] = useState(purchaseRequests[0]?.purchasing_manager ?? "")
  const [newRequest, setNewRequest] = useState({
    item_name: "",
    item_code: "",
    quantity: "1",
    unit: "Tấn",
    priority: "Ưu tiên 1",
    requested_order_date: new Date().toISOString().slice(0, 10),
    warehouse_deadline_date: new Date().toISOString().slice(0, 10),
    production_contract_number: "",
    requester: "",
    purchasing_manager: "",
    notes: "",
  })
  const data = useMemo(
    () =>
      purchaseRequests.filter((request) => {
        const matchesQuery = [
          request.requested_order_id,
          request.item_code,
          request.item_name,
          request.priority,
          request.requester,
          request.purchasing_manager,
          request.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())

        return (
          matchesQuery &&
          (statusFilter === "ALL" || request.status === statusFilter) &&
          (priorityFilter === "ALL" || request.priority === priorityFilter)
        )
      }),
    [priorityFilter, purchaseRequests, query, statusFilter]
  )
  const {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems: paginatedRequests,
    setPageSize,
    nextPage,
    previousPage,
    resetPage,
  } = usePagination(data)
  const selectedRequest = data.find((request) => request.requested_order_id === selectedRequestId) ?? data[0]
  const canCreateRequest = canPerform(selectedRole, "createPurchaseRequest")
  const canUpdateRequestCore = canPerform(selectedRole, "updatePurchaseRequestCore")
  const canUpdateRequestStatus = canPerform(selectedRole, "updatePurchaseRequestStatus")
  const canAssignPurchasingManager = canPerform(selectedRole, "assignPurchasingManager")
  const canCreateDeliveryOrder = canPerform(selectedRole, "createDeliveryOrder")

  useEffect(() => {
    resetPage()
  }, [priorityFilter, query, resetPage, statusFilter])

  function handleCreatePurchaseRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canCreateRequest) return

    createPurchaseRequest({
      ...newRequest,
      quantity: Number(newRequest.quantity),
      purchasing_manager: canAssignPurchasingManager ? newRequest.purchasing_manager : "Chưa phân công",
      notes: newRequest.notes || null,
    })
    setShowCreateForm(false)
    setNewRequest({
      item_name: "",
      item_code: "",
      quantity: "1",
      unit: "Tấn",
      priority: "Ưu tiên 1",
      requested_order_date: new Date().toISOString().slice(0, 10),
      warehouse_deadline_date: new Date().toISOString().slice(0, 10),
      production_contract_number: "",
      requester: "",
      purchasing_manager: "",
      notes: "",
    })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Yêu cầu mua hàng"
        description="Người yêu cầu tạo PR; Quản lý mua hàng / PIC điều phối trạng thái, phân công phụ trách và tạo DO từ PR phù hợp."
        action={
          <PermissionActionButton allowed={canCreateRequest} disabledReason={actionUnavailableReason} variant="default" size="default" showDisabledReason onClick={() => setShowCreateForm((open) => !open)}>
            Tạo PR
          </PermissionActionButton>
        }
      />
      <Card>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Chế độ xem: {roleLabels[selectedRole]}</div>
            <div className="text-xs text-muted-foreground">
              Requester tạo PR; Quản lý mua hàng / PIC cập nhật trạng thái, phụ trách mua hàng và tạo DO. Role khác chỉ xem bối cảnh.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={canCreateRequest || canUpdateRequestStatus || canAssignPurchasingManager ? "secondary" : "outline"}>
              {canCreateRequest || canUpdateRequestStatus || canAssignPurchasingManager ? "Có thể thao tác" : "Chỉ xem"}
            </Badge>
            {!canCreateRequest && !canUpdateRequestStatus && !canAssignPurchasingManager && (
              <span className="text-xs text-muted-foreground">{actionUnavailableReason}</span>
            )}
          </div>
        </CardContent>
      </Card>
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo PR demo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreatePurchaseRequest}>
              <Input value={newRequest.item_name} onChange={(event) => setNewRequest((request) => ({ ...request, item_name: event.target.value }))} placeholder="Tên hàng" required />
              <Input value={newRequest.item_code} onChange={(event) => setNewRequest((request) => ({ ...request, item_code: event.target.value }))} placeholder="Mã hàng" required />
              <Input value={newRequest.quantity} onChange={(event) => setNewRequest((request) => ({ ...request, quantity: event.target.value }))} placeholder="Số lượng" type="number" min="0.01" step="0.01" required />
              <Input value={newRequest.unit} onChange={(event) => setNewRequest((request) => ({ ...request, unit: event.target.value }))} placeholder="Đơn vị" required />
              <select className="h-9 rounded-lg border border-input bg-background px-3 text-sm" value={newRequest.priority} onChange={(event) => setNewRequest((request) => ({ ...request, priority: event.target.value }))}>
                <option value="Ưu tiên 1">Ưu tiên 1</option>
                <option value="Ưu tiên 2">Ưu tiên 2</option>
                <option value="Khẩn cấp">Khẩn cấp</option>
                <option value="Bình thường">Bình thường</option>
              </select>
              <Input value={newRequest.requested_order_date} onChange={(event) => setNewRequest((request) => ({ ...request, requested_order_date: event.target.value }))} type="date" required />
              <Input value={newRequest.warehouse_deadline_date} onChange={(event) => setNewRequest((request) => ({ ...request, warehouse_deadline_date: event.target.value }))} type="date" required />
              <Input value={newRequest.production_contract_number} onChange={(event) => setNewRequest((request) => ({ ...request, production_contract_number: event.target.value }))} placeholder="Hợp đồng sản xuất" required />
              <Input value={newRequest.requester} onChange={(event) => setNewRequest((request) => ({ ...request, requester: event.target.value }))} placeholder="Người yêu cầu" required />
              {canAssignPurchasingManager ? (
                <Input value={newRequest.purchasing_manager} onChange={(event) => setNewRequest((request) => ({ ...request, purchasing_manager: event.target.value }))} placeholder="Phụ trách mua hàng" required />
              ) : (
                <Input value="Chưa phân công" disabled aria-label="Phụ trách mua hàng" />
              )}
              <Input className="md:col-span-2" value={newRequest.notes} onChange={(event) => setNewRequest((request) => ({ ...request, notes: event.target.value }))} placeholder="Ghi chú" />
              <div className="flex gap-2 md:col-span-2 xl:col-span-4">
                <PermissionActionButton allowed={canCreateRequest} variant="default" size="default" type="submit">
                  Lưu PR
                </PermissionActionButton>
                <Button variant="outline" type="button" onClick={() => setShowCreateForm(false)}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã PR, tên hàng, người yêu cầu, phụ trách hoặc trạng thái"
            />
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Lọc trạng thái"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="NEW">Mới</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            <select
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Lọc mức ưu tiên"
            >
              <option value="ALL">Tất cả ưu tiên</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
              <option value="Ưu tiên 1">Ưu tiên 1</option>
              <option value="Ưu tiên 2">Ưu tiên 2</option>
              <option value="Bình thường">Bình thường</option>
            </select>
          </div>
          <Table className="min-w-[1080px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">
                  <HeaderTooltip
                    label="Yêu cầu"
                    subtitle="Mã PR / HĐ sản xuất"
                    tooltip="Request ID + Production Contract"
                  />
                </TableHead>
                <TableHead>
                  <HeaderTooltip
                    label="Hàng hóa"
                    subtitle="Tên hàng / Mã hàng"
                    tooltip="Item Name + Item Code"
                  />
                </TableHead>
                <TableHead className="w-32">
                  <HeaderTooltip
                    label="Số lượng"
                    subtitle="SL / Ngày yêu cầu"
                    tooltip="Quantity + Request Date"
                  />
                </TableHead>
                <TableHead className="w-44">
                  <HeaderTooltip
                    label="Người phụ trách"
                    subtitle="QL mua hàng / Người yêu cầu"
                    tooltip="Purchasing Manager + Requester"
                  />
                </TableHead>
                <TableHead className="w-36">
                  <HeaderTooltip
                    label="Thời hạn"
                    subtitle="Hạn kho / Dự kiến"
                    tooltip="Warehouse Deadline + Expected Arrival"
                  />
                </TableHead>
                <TableHead className="w-28"><HeaderTooltip label="Ưu tiên" subtitle="Mức độ" tooltip="Priority" /></TableHead>
                <TableHead className="w-36"><HeaderTooltip label="Trạng thái" subtitle="Tình trạng" tooltip="Status / status" /></TableHead>
                <TableHead className="w-44"><HeaderTooltip label="Thao tác" subtitle="Hành động" tooltip="Actions" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => (
                <TableRow key={request.requested_order_id}>
                  <CompositeCell
                    className="w-40"
                    lines={[
                      { label: "PR", value: request.requested_order_id, emphasis: true },
                      { label: "HĐ SX", value: request.production_contract_number },
                    ]}
                  />
                  <CompositeCell
                    lines={[
                      { label: "Tên", value: request.item_name, emphasis: true },
                      { label: "Mã", value: request.item_code },
                    ]}
                  />
                  <CompositeCell
                    className="w-32"
                    lines={[
                      { label: "SL", value: `${request.quantity.toLocaleString()} ${request.unit}`, emphasis: true },
                      { label: "YC", value: formatDate(request.requested_order_date) },
                    ]}
                  />
                  <CompositeCell
                    className="w-44"
                    lines={[
                      { label: "MH", value: request.purchasing_manager, emphasis: true },
                      { label: "YC", value: request.requester },
                    ]}
                  />
                  <CompositeCell
                    className="w-36"
                    lines={[
                      { label: "Kho", value: formatDate(request.warehouse_deadline_date), emphasis: true },
                      { label: "DK", value: formatOptionalDate(request.expected_arrival_date ?? request.supplier_expected_delivery_date) },
                    ]}
                  />
                  <StatusCell><StatusBadge value={request.priority} /></StatusCell>
                  <TableCell className="w-36 whitespace-nowrap">
                    {canUpdateRequestStatus ? (
                      <select
                        className="h-7 w-28 rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50"
                        value={request.status}
                        onChange={(event) => updatePurchaseRequest(request.requested_order_id, { status: event.target.value as PurchaseRequestStatus })}
                      >
                        {getPurchaseRequestStatusOptions(request.status, selectedRole === "admin").map((status) => (
                          <option key={status} value={status}>{getStatusLabel(status)}</option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge value={request.status} />
                    )}
                  </TableCell>
                  <ActionsCell className="w-44">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequestId(request.requested_order_id)
                        setPurchasingManagerDraft(request.purchasing_manager)
                      }}
                    >
                      Chi tiết
                    </Button>
                    <PermissionActionButton
                      allowed={canCreateDeliveryOrder && request.status === "APPROVED"}
                      disabledReason={request.status === "APPROVED" ? adminOrPurchasingManagerReason : "Chỉ tạo DO từ PR đã duyệt."}
                      onClick={() => createDeliveryOrder({ requestedOrderId: request.requested_order_id })}
                    >
                      Tạo DO
                    </PermissionActionButton>
                  </ActionsCell>
                </TableRow>
              ))}
              {data.length === 0 && (
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

      {selectedRequest && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Chi tiết PR</CardTitle>
              <PermissionNote allowed={canCreateDeliveryOrder || canUpdateRequestStatus || canAssignPurchasingManager || canUpdateRequestCore} disabledReason={actionUnavailableReason} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-2 rounded-lg border bg-muted/20 p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="purchasing-manager">
                  Phụ trách mua hàng
                </label>
                <Input
                  id="purchasing-manager"
                  className="mt-1"
                  value={purchasingManagerDraft}
                  onChange={(event) => setPurchasingManagerDraft(event.target.value)}
                  disabled={!canAssignPurchasingManager}
                />
              </div>
              <PermissionActionButton
                allowed={canAssignPurchasingManager}
                disabledReason={adminOrPurchasingManagerReason}
                onClick={() => updatePurchaseRequest(selectedRequest.requested_order_id, { purchasing_manager: purchasingManagerDraft || "Chưa phân công" })}
              >
                Lưu phụ trách
              </PermissionActionButton>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoItem label="Mã PR" value={selectedRequest.requested_order_id} />
              <InfoItem label="Mã hàng" value={selectedRequest.item_code} />
              <InfoItem label="Tên hàng" value={selectedRequest.item_name} />
              <InfoItem label="Số lượng" value={`${selectedRequest.quantity.toLocaleString()} ${selectedRequest.unit}`} />
              <InfoItem label="Ưu tiên" value={<StatusBadge value={selectedRequest.priority} />} />
              <InfoItem label="Ngày yêu cầu" value={formatDate(selectedRequest.requested_order_date)} />
              <InfoItem label="Ngày điều chỉnh" value={formatOptionalDate(selectedRequest.adjusted_date)} />
              <InfoItem label="Hạn nhập kho" value={formatDate(selectedRequest.warehouse_deadline_date)} />
              <InfoItem label="Hợp đồng sản xuất" value={selectedRequest.production_contract_number} />
              <InfoItem label="Người yêu cầu" value={selectedRequest.requester} />
              <InfoItem label="Phụ trách mua hàng" value={selectedRequest.purchasing_manager} />
              <InfoItem label="NCC dự kiến giao" value={formatOptionalDate(selectedRequest.supplier_expected_delivery_date)} />
              <InfoItem label="Dự kiến hàng đến" value={formatOptionalDate(selectedRequest.expected_arrival_date)} />
              <InfoItem label="Ngày nhập kho thực tế" value={formatOptionalDate(selectedRequest.actual_warehouse_entry_date)} />
              <InfoItem label="Số ngày trễ" value={selectedRequest.delay_days > 0 ? <StatusBadge value={`${selectedRequest.delay_days} days delayed`} /> : <StatusBadge value="ON_TIME" />} />
              <InfoItem label="Trạng thái" value={<StatusBadge value={selectedRequest.status} />} />
              <InfoItem label="Ghi chú" value={displayValue(selectedRequest.notes)} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-medium ${typeof value === "string" || typeof value === "number" ? "truncate" : ""}`}>{value}</div>
    </div>
  )
}

function getPurchaseRequestStatusOptions(currentStatus: PurchaseRequestStatus, canUseAllStatuses: boolean) {
  if (canUseAllStatuses) return purchaseRequestStatuses
  if (currentStatus === "NEW") return ["NEW", "PROCESSING"] satisfies PurchaseRequestStatus[]
  if (currentStatus === "PROCESSING") return ["PROCESSING", "COMPLETED"] satisfies PurchaseRequestStatus[]
  if (currentStatus === "APPROVED") return ["APPROVED", "PROCESSING"] satisfies PurchaseRequestStatus[]
  return [currentStatus]
}
