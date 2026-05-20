import { type FormEvent, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { MultiSelectDropdown, type MultiSelectOption } from "@/components/shared/MultiSelectDropdown"
import { PageHeader } from "@/components/shared/PageHeader"
import { PermissionActionButton } from "@/components/shared/PermissionActionButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDemoStore } from "@/store/demoStore"
import { actionUnavailableReason, canPerform } from "@/utils/permissions"

type NewPurchaseRequestState = {
    purchase_order_ids: string[]
    item_name: string
    item_code: string
    quantity: string
    unit: string
    priority: string
    requested_order_date: string
    adjusted_date: string
    warehouse_deadline_date: string
    supplier_expected_delivery_date: string
    expected_arrival_date: string
    production_contract_number: string
    requester: string
    requester_user_id: string
    purchasing_manager: string
    purchasing_manager_user_id: string
    notes: string
}

const buildInitialRequest = (): NewPurchaseRequestState => ({
    purchase_order_ids: [],
    item_name: "",
    item_code: "",
    quantity: "1",
    unit: "Tấn",
    priority: "Ưu tiên 1",
    requested_order_date: new Date().toISOString().slice(0, 10),
    adjusted_date: "",
    warehouse_deadline_date: new Date().toISOString().slice(0, 10),
    supplier_expected_delivery_date: "",
    expected_arrival_date: "",
    production_contract_number: "",
    requester: "",
    requester_user_id: "",
    purchasing_manager: "",
    purchasing_manager_user_id: "",
    notes: "",
})

export function PurchaseRequestCreatePage() {
    const selectedRole = useDemoStore((state) => state.selectedRole)
    const purchaseOrderDetailsById = useDemoStore((state) => state.purchaseOrderDetailsById)
    const referenceUsers = useDemoStore((state) => state.referenceUsers)
    const createPurchaseRequest = useDemoStore((state) => state.createPurchaseRequest)
    const navigate = useNavigate()
    const [newRequest, setNewRequest] = useState(buildInitialRequest)
    const purchaseOrders = Object.values(purchaseOrderDetailsById)
    const purchaseOrderOptions = useMemo<MultiSelectOption[]>(
        () =>
            purchaseOrders.map((order) => ({
                value: order.id,
                label: `${order.order_number} - ${order.supplier_name ?? "NCC"}`,
                description: order.status,
            })),
        [purchaseOrders]
    )
    const canCreateRequest = canPerform(selectedRole, "createPurchaseRequest")
    const canAssignPurchasingManager = canPerform(selectedRole, "assignPurchasingManager")

    async function handleCreatePurchaseRequest(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!canCreateRequest) return

        await createPurchaseRequest({
            ...newRequest,
            quantity: Number(newRequest.quantity),
            purchasing_manager: canAssignPurchasingManager ? newRequest.purchasing_manager : "Chưa phân công",
            purchasing_manager_user_id: canAssignPurchasingManager ? newRequest.purchasing_manager_user_id || null : null,
            requester_user_id: newRequest.requester_user_id || null,
            adjusted_date: newRequest.adjusted_date || null,
            supplier_expected_delivery_date: newRequest.supplier_expected_delivery_date || null,
            expected_arrival_date: newRequest.expected_arrival_date || null,
            notes: newRequest.notes || null,
        })
        setNewRequest(buildInitialRequest())
        navigate("/purchase-requests")
    }

    return (
        <div className="space-y-4">
            <PageHeader
                title="Tạo yêu cầu mua hàng"
                description="Điền đầy đủ thông tin PR để bộ phận mua hàng có thể xử lý theo đúng ưu tiên và hạn kho."
                action={
                    <Button variant="outline" size="default" onClick={() => navigate("/purchase-requests")}>
                        Quay lại danh sách
                    </Button>
                }
            />
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin PR</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleCreatePurchaseRequest}>
                        <div className="space-y-2">
                            <MultiSelectDropdown
                                label="Purchase Orders"
                                options={purchaseOrderOptions}
                                value={newRequest.purchase_order_ids}
                                onChange={(value) => setNewRequest((request) => ({ ...request, purchase_order_ids: value }))}
                                placeholder="Chưa gắn PO"
                                emptyMessage="Chưa có PO để liên kết."
                            />
                            <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/purchase-orders/create" />}>
                                Create New PO
                            </Button>
                        </div>
                        <Input
                            value={newRequest.item_name}
                            onChange={(event) => setNewRequest((request) => ({ ...request, item_name: event.target.value }))}
                            placeholder="Tên hàng"
                            required
                        />
                        <Input
                            value={newRequest.item_code}
                            onChange={(event) => setNewRequest((request) => ({ ...request, item_code: event.target.value }))}
                            placeholder="Mã hàng"
                            required
                        />
                        <Input
                            value={newRequest.quantity}
                            onChange={(event) => setNewRequest((request) => ({ ...request, quantity: event.target.value }))}
                            placeholder="Số lượng"
                            type="number"
                            min="0.01"
                            step="0.01"
                            required
                        />
                        <Input
                            value={newRequest.unit}
                            onChange={(event) => setNewRequest((request) => ({ ...request, unit: event.target.value }))}
                            placeholder="Đơn vị"
                            required
                        />
                        <select
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                            value={newRequest.priority}
                            onChange={(event) => setNewRequest((request) => ({ ...request, priority: event.target.value }))}
                        >
                            <option value="Ưu tiên 1">Ưu tiên 1</option>
                            <option value="Ưu tiên 2">Ưu tiên 2</option>
                            <option value="Khẩn cấp">Khẩn cấp</option>
                            <option value="Bình thường">Bình thường</option>
                        </select>
                        <Input
                            value={newRequest.requested_order_date}
                            onChange={(event) => setNewRequest((request) => ({ ...request, requested_order_date: event.target.value }))}
                            type="date"
                            required
                        />
                        <Input
                            value={newRequest.adjusted_date}
                            onChange={(event) => setNewRequest((request) => ({ ...request, adjusted_date: event.target.value }))}
                            type="date"
                            aria-label="Ngày điều chỉnh"
                        />
                        <Input
                            value={newRequest.warehouse_deadline_date}
                            onChange={(event) => setNewRequest((request) => ({ ...request, warehouse_deadline_date: event.target.value }))}
                            type="date"
                            required
                        />
                        <Input
                            value={newRequest.supplier_expected_delivery_date}
                            onChange={(event) => setNewRequest((request) => ({ ...request, supplier_expected_delivery_date: event.target.value }))}
                            type="date"
                            aria-label="NCC dự kiến giao"
                        />
                        <Input
                            value={newRequest.expected_arrival_date}
                            onChange={(event) => setNewRequest((request) => ({ ...request, expected_arrival_date: event.target.value }))}
                            type="date"
                            aria-label="Dự kiến hàng đến"
                        />
                        <Input
                            value={newRequest.production_contract_number}
                            onChange={(event) => setNewRequest((request) => ({ ...request, production_contract_number: event.target.value }))}
                            placeholder="Hợp đồng sản xuất"
                            required
                        />
                        <Input
                            value={newRequest.requester}
                            onChange={(event) => setNewRequest((request) => ({ ...request, requester: event.target.value }))}
                            placeholder="Người yêu cầu"
                            required
                        />
                        <select
                            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                            value={newRequest.requester_user_id}
                            onChange={(event) => setNewRequest((request) => ({ ...request, requester_user_id: event.target.value }))}
                            aria-label="Requester user"
                        >
                            <option value="">Requester user ID</option>
                            {referenceUsers.map((user) => (
                                <option key={user.id} value={user.id}>{user.display_name} - {user.role}</option>
                            ))}
                        </select>
                        {canAssignPurchasingManager ? (
                            <Input
                                value={newRequest.purchasing_manager}
                                onChange={(event) =>
                                    setNewRequest((request) => ({ ...request, purchasing_manager: event.target.value }))
                                }
                                placeholder="Phụ trách mua hàng"
                                required
                            />
                        ) : (
                            <Input value="Chưa phân công" disabled aria-label="Phụ trách mua hàng" />
                        )}
                        {canAssignPurchasingManager && (
                            <select
                                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                                value={newRequest.purchasing_manager_user_id}
                                onChange={(event) =>
                                    setNewRequest((request) => ({ ...request, purchasing_manager_user_id: event.target.value }))
                                }
                                aria-label="Purchasing manager user"
                            >
                                <option value="">PIC user ID</option>
                                {referenceUsers.map((user) => (
                                    <option key={user.id} value={user.id}>{user.display_name} - {user.role}</option>
                                ))}
                            </select>
                        )}
                        <Input
                            className="md:col-span-2"
                            value={newRequest.notes}
                            onChange={(event) => setNewRequest((request) => ({ ...request, notes: event.target.value }))}
                            placeholder="Ghi chú"
                        />
                        <div className="flex gap-2 md:col-span-2 xl:col-span-4">
                            <PermissionActionButton
                                allowed={canCreateRequest}
                                disabledReason={actionUnavailableReason}
                                variant="default"
                                size="default"
                                type="submit"
                                showDisabledReason
                            >
                                Lưu PR
                            </PermissionActionButton>
                            <Button variant="outline" type="button" onClick={() => navigate("/purchase-requests")}>
                                Hủy
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
