import { useEffect, useMemo, useState } from "react"

import { PageHeader } from "@/components/shared/PageHeader"
import { PaginationControls } from "@/components/shared/PaginationControls"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePagination } from "@/hooks/usePagination"
import { useDemoStore } from "@/store/demoStore"
import type { PurchaseOrderStatus } from "@/types/purchase-order.types"
import { displayValue, formatCurrency, formatDate } from "@/utils/formatters"
import { getStatusLabel } from "@/utils/labels"

const purchaseOrderStatuses: PurchaseOrderStatus[] = [
    "DRAFT",
    "CREATED",
    "CONFIRMED",
    "PARTIALLY_DELIVERED",
    "COMPLETED",
    "CANCELLED",
]

export function PurchaseOrdersPage() {
    const purchaseOrderDetailsById = useDemoStore((state) => state.purchaseOrderDetailsById)
    const [query, setQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const purchaseOrders = useMemo(() => Object.values(purchaseOrderDetailsById), [purchaseOrderDetailsById])
    const filteredOrders = useMemo(
        () =>
            purchaseOrders.filter((order) => {
                const matchesQuery = [
                    order.order_number,
                    order.supplier_code,
                    order.supplier_name,
                    order.status,
                    order.purchase_requests.map((request) => request.requested_order_id).join(" "),
                    order.delivery_orders.map((deliveryOrder) => deliveryOrder.delivery_order_number).join(" "),
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(query.toLowerCase())

                return matchesQuery && (statusFilter === "ALL" || order.status === statusFilter)
            }),
        [purchaseOrders, query, statusFilter]
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

    useEffect(() => {
        resetPage()
    }, [query, resetPage, statusFilter])

    return (
        <div className="space-y-4">
            <PageHeader
                title="Đơn mua hàng"
                description="Theo dõi PO, nhà cung cấp và các PR/DO liên kết trong dữ liệu demo."
            />
            <Card>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]">
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Tìm số PO, nhà cung cấp hoặc PR/DO liên quan"
                        />
                        <select
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            aria-label="Lọc trạng thái PO"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            {purchaseOrderStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {getStatusLabel(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Table className="min-w-280 table-fixed">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-36">Số PO</TableHead>
                                <TableHead className="w-32">Mã NCC</TableHead>
                                <TableHead>Nhà cung cấp</TableHead>
                                <TableHead className="w-32">Ngày PO</TableHead>
                                <TableHead className="w-32">Trạng thái</TableHead>
                                <TableHead className="w-32">Tổng giá trị</TableHead>
                                <TableHead className="w-44">PR liên quan</TableHead>
                                <TableHead className="w-44">DO liên quan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="w-36 font-medium">{order.order_number}</TableCell>
                                    <TableCell className="w-32">{displayValue(order.supplier_code)}</TableCell>
                                    <TableCell className="min-w-0">
                                        <div className="truncate font-medium">{displayValue(order.supplier_name)}</div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">{displayValue(order.purchase_contract_number)}</div>
                                    </TableCell>
                                    <TableCell className="w-32">{formatDate(order.created_at)}</TableCell>
                                    <TableCell className="w-32"><StatusBadge value={order.status} /></TableCell>
                                    <TableCell className="w-32">
                                        {order.total_value !== null && order.total_value !== undefined
                                            ? formatCurrency(order.total_value)
                                            : displayValue(null)}
                                    </TableCell>
                                    <TableCell className="w-44">
                                        <div className="flex flex-wrap gap-1">
                                            {order.purchase_requests.map((request) => (
                                                <Badge key={request.id} variant="outline">{request.requested_order_id}</Badge>
                                            ))}
                                            {order.purchase_requests.length === 0 && (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-44">
                                        <div className="flex flex-wrap gap-1">
                                            {order.delivery_orders.map((deliveryOrder) => (
                                                <Badge key={deliveryOrder.id} variant="outline">{deliveryOrder.delivery_order_number}</Badge>
                                            ))}
                                            {order.delivery_orders.length === 0 && (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        <div className="font-medium text-foreground">Chưa có dữ liệu PO phù hợp.</div>
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
