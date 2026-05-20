import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { HeaderTooltip } from "@/components/shared/HeaderTooltip"
import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { PermissionActionButton } from "@/components/shared/PermissionActionButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { ActionsCell } from "@/components/shared/TableCells"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagination } from "@/hooks/usePagination"
import { useDemoStore } from "@/store/demoStore"
import type { AppUser } from "@/types/common.types"
import type { PurchaseRequestStatus } from "@/types"
import { fieldTooltips } from "@/utils/fieldTooltips"
import { getStatusLabel } from "@/utils/labels"
import { actionUnavailableReason, canPerform, roleLabels } from "@/utils/permissions"

const purchaseRequestStatuses: PurchaseRequestStatus[] = ["NEW", "APPROVED", "PROCESSING", "COMPLETED", "CANCELLED"]

export function PurchaseRequestsPage() {
    const selectedRole = useDemoStore((state) => state.selectedRole)
    const purchaseRequests = useDemoStore((state) => state.purchaseRequests)
    const referenceUsers = useDemoStore((state) => state.referenceUsers)
    const updatePurchaseRequest = useDemoStore((state) => state.updatePurchaseRequest)
    const navigate = useNavigate()
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [priorityFilter, setPriorityFilter] = useState("ALL")
    const data = useMemo(
        () =>
            purchaseRequests.filter((request) => {
                const matchesQuery = [
                    request.requested_order_id,
                    request.item_code,
                    request.item_name,
                    request.quantity,
                    request.unit,
                    request.requester,
                    request.requester_user_id,
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
    const canCreateRequest = canPerform(selectedRole, "createPurchaseRequest")
    const canUpdateRequestStatus = canPerform(selectedRole, "updatePurchaseRequestStatus")
    const canAssignPurchasingManager = canPerform(selectedRole, "assignPurchasingManager")
    const canCreateDeliveryOrder = canPerform(selectedRole, "createDeliveryOrder")

    useEffect(() => {
        resetPage()
    }, [priorityFilter, query, resetPage, statusFilter])

    return (
        <div className="space-y-4">
            <PageHeader
                title="Yêu cầu mua hàng"
                description="Người yêu cầu tạo PR; Quản lý mua hàng / PIC điều phối trạng thái, phân công phụ trách và tạo DO từ PR phù hợp."
                action={
                    <PermissionActionButton
                        allowed={canCreateRequest}
                        disabledReason={actionUnavailableReason}
                        variant="default"
                        size="default"
                        showDisabledReason
                        onClick={() => navigate("/purchase-requests/new")}
                    >
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
            <Card>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Tìm mã PR, mã hàng, tên hàng, người yêu cầu hoặc trạng thái"
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
                    <Table className="min-w-260 table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-36"><HeaderTooltip label="Mã hàng" tooltip={fieldTooltips.item_code} /></TableHead>
                                <TableHead><HeaderTooltip label="Tên hàng" tooltip={fieldTooltips.item_name} /></TableHead>
                                <TableHead className="w-32"><HeaderTooltip label="Số lượng" tooltip={`${fieldTooltips.quantity}; ${fieldTooltips.unit}`} /></TableHead>
                                <TableHead className="w-40"><HeaderTooltip label="Người yêu cầu" tooltip={fieldTooltips.requester} /></TableHead>
                                <TableHead className="w-48">PO liên quan</TableHead>
                                <TableHead className="w-32"><HeaderTooltip label="Trạng thái" tooltip={fieldTooltips.status} /></TableHead>
                                <TableHead className="w-44"><HeaderTooltip label="Thao tác" tooltip={fieldTooltips.actions} /></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRequests.map((request) => (
                                <TableRow key={request.requested_order_id}>
                                    <TableCell className="w-36 font-medium">{request.item_code}</TableCell>
                                    <TableCell className="min-w-0">
                                        <div className="truncate font-medium">{request.item_name}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">PR {request.requested_order_id}</div>
                                    </TableCell>
                                    <TableCell className="w-32">{request.quantity.toLocaleString()} {request.unit}</TableCell>
                                    <TableCell className="w-40">
                                        <div className="truncate font-medium">{request.requester}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">{resolveUserLabel(referenceUsers, request.requester_user_id)}</div>
                                    </TableCell>
                                    <TableCell className="w-48">
                                        <div className="flex flex-wrap gap-1">
                                            {request.purchase_orders.map((order) => (
                                                <Badge key={order.id} variant="outline">{order.order_number}</Badge>
                                            ))}
                                            {request.purchase_orders.length === 0 && (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-32">
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
                                            nativeButton={false}
                                            render={<Link to={`/purchase-requests/${request.requested_order_id}`} />}
                                        >
                                            Chi tiết
                                        </Button>
                                        {canCreateDeliveryOrder && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/delivery-orders/create?pr=${request.id}`)}
                                            >
                                                Tạo DO
                                            </Button>
                                        )}
                                    </ActionsCell>
                                </TableRow>
                            ))}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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

function resolveUserLabel(users: AppUser[], userId?: string | null) {
    if (!userId) return null
    const user = users.find((item) => item.id === userId)
    return user ? `${user.display_name} (${user.role})` : userId
}
