# 05. API và Agent rules cho AI Code

## 1. Phạm vi

Project hiện tại là frontend-only admin dashboard dùng mock data, Zustand và localStorage.

Không triển khai:

- Backend hoặc database
- Authentication, authorization, JWT, session
- Real SAP/logistics/shipping API
- Real API persistence layer
- Production permission system

Các API notes bên dưới chỉ là future reference để giữ schema nhất quán khi sau này có backend thật.

## 2. Rule cho frontend MVP

- Đọc tài liệu theo thứ tự `docs/source -> docs/business -> docs/ui-design -> src code`.
- Dữ liệu mock phải bám mentor source và business docs.
- UI dùng tiếng Việt; TypeScript field names/schema keys giữ tiếng Anh.
- Status enum dùng uppercase.
- Không tạo business rule mới ngoài source/sample hiện có.
- Không thêm production dependency mới nếu user không yêu cầu.

## 3. Future API reference only

```http
GET /purchase-requests
GET /purchase-requests/{requested_order_id}
POST /purchase-requests
PATCH /purchase-requests/{requested_order_id}

GET /delivery-orders
GET /delivery-orders/{order_number}
POST /delivery-orders
PATCH /delivery-orders/{order_number}/order-info
PATCH /delivery-orders/{order_number}/product-details
PATCH /delivery-orders/{order_number}/sap-integration
PATCH /delivery-orders/{order_number}/logistics-shipping
PATCH /delivery-orders/{order_number}/warehouse-tracking
PATCH /delivery-orders/{order_number}/finance-tax
PATCH /delivery-orders/{order_number}/personnel

GET /delivery-orders/{order_number}/tasks
PATCH /delivery-orders/{order_number}/tasks/{task_id}
```

## 4. Agent checklist

- PR status: `NEW`, `APPROVED`, `PROCESSING`, `COMPLETED`, `CANCELLED`.
- DO status: `DRAFT`, `PO_CREATED`, `IN_TRANSIT`, `CUSTOMS_PROCESSING`, `WAREHOUSE_RECEIVED`, `COMPLETED`, `DELAYED`.
- Quan hệ dữ liệu: PR n-n PO, PO n-n DO, DO 1-n HBL, DO 1-n Container.
- DO (Job) gom hàng từ nhiều PO thông qua `linked_po_ids`.
- Personnel keys: `pic_manager`, `sale_staff`, `port_officer`, `customs_officer`.
