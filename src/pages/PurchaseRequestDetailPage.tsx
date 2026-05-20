import { type ReactNode, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { PageHeader } from "@/components/shared/PageHeader"
import { PermissionActionButton, PermissionNote } from "@/components/shared/PermissionActionButton"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDemoStore } from "@/store/demoStore"
import type { AppUser } from "@/types/common.types"
import { displayValue, formatDate, formatOptionalDate, isEmptyDisplayValue } from "@/utils/formatters"
import { adminOrPurchasingManagerReason, canPerform } from "@/utils/permissions"

type InfoItemProps = {
    label: string
    value: ReactNode
}

export function PurchaseRequestDetailPage() {
    const { id } = useParams()
    const selectedRole = useDemoStore((state) => state.selectedRole)
    const purchaseRequests = useDemoStore((state) => state.purchaseRequests)
    const deliveryOrders = useDemoStore((state) => state.deliveryOrders)
    const purchaseOrderDetailsById = useDemoStore((state) => state.purchaseOrderDetailsById)
    const referenceUsers = useDemoStore((state) => state.referenceUsers)
    const referencePartners = useDemoStore((state) => state.referencePartners)
    const updatePurchaseRequest = useDemoStore((state) => state.updatePurchaseRequest)
    const [managerDrafts, setManagerDrafts] = useState<Record<string, string>>({})
    const request = purchaseRequests.find((item) => item.requested_order_id === id)
    const requestId = request?.requested_order_id ?? ""

    if (!request) {
        return (
            <div className="space-y-4">
                <PageHeader title="Không tìm thấy yêu cầu mua hàng" description="PR trong dữ liệu demo không tồn tại." />
                <Button variant="outline" nativeButton={false} render={<Link to="/purchase-requests" />}>Quay lại danh sách</Button>
            </div>
        )
    }

    const canAssignPurchasingManager = canPerform(selectedRole, "assignPurchasingManager")
    const canCreateDeliveryOrder = canPerform(selectedRole, "createDeliveryOrder")
    const purchasingManagerDraft = managerDrafts[requestId] ?? request.purchasing_manager ?? ""
    const purchaseOrders = request.purchase_order_ids.map((poId) => purchaseOrderDetailsById[poId]).filter((order) => Boolean(order))
    const purchaseOrder = purchaseOrders[0] ?? null
    const supplierPartner = purchaseOrder?.supplier_partner_id
        ? referencePartners.find((partner) => partner.id === purchaseOrder.supplier_partner_id)
        : null
    const relatedDeliveryOrders = deliveryOrders.filter((order) => order.purchase_request_ids.includes(request.id))

    return (
        <div className="space-y-4">
            <PageHeader
                title={request.requested_order_id}
                description={`${request.item_name} · hạn nhập kho ${formatDate(request.warehouse_deadline_date)}`}
                action={
                    <div className="flex flex-wrap gap-2">
                        {canCreateDeliveryOrder && (
                            <Button nativeButton={false} render={<Link to={`/delivery-orders/create?pr=${request.id}`} />}>Tạo DO</Button>
                        )}
                        <Button variant="outline" nativeButton={false} render={<Link to="/purchase-requests" />}>Quay lại</Button>
                    </div>
                }
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin yêu cầu</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            <InfoItem label="Mã PR" value={request.requested_order_id} />
                            <InfoItem label="Hợp đồng sản xuất" value={request.production_contract_number} />
                            <InfoItem label="Ngày yêu cầu" value={formatDate(request.requested_order_date)} />
                            <InfoItem label="Ngày điều chỉnh" value={formatOptionalDate(request.adjusted_date)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Purchase Order liên quan</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            <InfoItem label="Số PO" value={purchaseOrders.map((order) => order.order_number).join(", ") || request.purchase_orders.map((order) => order.order_number).join(", ")} />
                            <InfoItem label="Hợp đồng mua" value={purchaseOrder?.purchase_contract_number} />
                            <InfoItem label="Mã nhà cung cấp" value={purchaseOrder?.supplier_code ?? supplierPartner?.partner_code} />
                            <InfoItem label="Nhà cung cấp" value={purchaseOrder?.supplier_name ?? supplierPartner?.partner_name ?? request.purchase_order?.supplier_name} />
                            <InfoItem label="Supplier partner ID" value={purchaseOrder?.supplier_partner_id} />
                            <InfoItem label="Trạng thái PO" value={purchaseOrders.length > 0 ? purchaseOrders.map((order) => order.status).join(", ") : request.purchase_order?.status} />
                            <InfoItem label="Người tạo PO" value={resolveUserLabel(referenceUsers, purchaseOrder?.created_by_user_id)} />
                            <InfoItem label="Ngày tạo PO" value={formatOptionalDate(purchaseOrder?.created_at)} />
                            <InfoItem label="Cập nhật PO" value={formatOptionalDate(purchaseOrder?.updated_at)} />
                            <InfoItem label="Ghi chú PO" value={purchaseOrder?.notes} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Orders từ PR này</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {relatedDeliveryOrders.map((order) => (
                                <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                                    <div>
                                        <Button variant="link" nativeButton={false} render={<Link to={`/delivery-orders/${order.order_info.order_number}`} />}>
                                            {order.order_info.order_number}
                                        </Button>
                                        <div className="text-xs text-muted-foreground">
                                            {order.product_details.item_name_requested} · {formatOptionalDate(order.logistics_shipping.eta_actual ?? order.logistics_shipping.eta_planned)}
                                        </div>
                                    </div>
                                    <StatusBadge value={order.order_info.status} />
                                </div>
                            ))}
                            {relatedDeliveryOrders.length === 0 && <div className="text-sm text-gray-400">—</div>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Vật tư</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            <InfoItem label="Tên hàng" value={request.item_name} />
                            <InfoItem label="Mã hàng" value={request.item_code} />
                            <InfoItem label="Số lượng" value={request.quantity.toLocaleString()} />
                            <InfoItem label="Đơn vị" value={request.unit} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Deadline và kế hoạch nhập kho</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            <InfoItem label="Hạn nhập kho" value={formatDate(request.warehouse_deadline_date)} />
                            <InfoItem label="NCC dự kiến giao" value={formatOptionalDate(request.supplier_expected_delivery_date)} />
                            <InfoItem label="Dự kiến hàng đến" value={formatOptionalDate(request.expected_arrival_date)} />
                            <InfoItem label="Ngày nhập kho thực tế" value={formatOptionalDate(request.actual_warehouse_entry_date)} />
                            <InfoItem
                                label="Số ngày trễ"
                                value={request.delay_days > 0 ? <StatusBadge value={`${request.delay_days} days delayed`} /> : <StatusBadge value="ON_TIME" />}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <CardTitle>Người phụ trách</CardTitle>
                                <PermissionNote allowed={canAssignPurchasingManager} disabledReason={adminOrPurchasingManagerReason} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <div className="min-w-0 flex-1">
                                    <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="purchasing-manager">
                                        Phụ trách mua hàng
                                    </label>
                                    <Input
                                        id="purchasing-manager"
                                        className="mt-1"
                                        value={purchasingManagerDraft}
                                        onChange={(event) =>
                                            setManagerDrafts((drafts) => ({
                                                ...drafts,
                                                [requestId]: event.target.value,
                                            }))
                                        }
                                        disabled={!canAssignPurchasingManager}
                                    />
                                </div>
                                <PermissionActionButton
                                    allowed={canAssignPurchasingManager}
                                    disabledReason={adminOrPurchasingManagerReason}
                                    onClick={() => updatePurchaseRequest(request.requested_order_id, { purchasing_manager: purchasingManagerDraft || "Chưa phân công" })}
                                >
                                    Lưu phụ trách
                                </PermissionActionButton>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <InfoItem label="Người yêu cầu" value={request.requester} />
                                <InfoItem label="Requester user" value={resolveUserLabel(referenceUsers, request.requester_user_id)} />
                                <InfoItem label="Phụ trách hiện tại" value={request.purchasing_manager} />
                                <InfoItem label="PIC user" value={resolveUserLabel(referenceUsers, request.purchasing_manager_user_id)} />
                                <InfoItem label="Người tạo PR" value={resolveUserLabel(referenceUsers, request.created_by_user_id)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Trạng thái và ghi chú</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <InfoItem label="Trạng thái" value={<StatusBadge value={request.status} />} />
                                <InfoItem label="Ưu tiên" value={<StatusBadge value={request.priority} />} />
                            </div>
                            <div>
                                <div className="text-xs font-medium uppercase text-muted-foreground">Ghi chú</div>
                                <div className="mt-1 text-sm font-medium">{displayValue(request.notes)}</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function InfoItem({ label, value }: InfoItemProps) {
    const renderedValue =
        typeof value === "string" || typeof value === "number" || value === null || value === undefined
            ? displayValue(value)
            : value

    return (
        <div className="min-w-0">
            <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
            <div
                className={`mt-1 text-sm font-medium ${isEmptyDisplayValue(value) ? "text-gray-400" : ""} ${typeof renderedValue === "string" || typeof renderedValue === "number" ? "truncate" : ""
                    }`}
            >
                {renderedValue}
            </div>
        </div>
    )
}

function resolveUserLabel(users: AppUser[], userId?: string | null) {
    if (!userId) return null
    const user = users.find((item) => item.id === userId)
    return user ? `${user.display_name} (${user.role})` : userId
}
