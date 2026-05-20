# Mock Data Rules

## 1. Purpose

Dữ liệu mock dùng để dựng frontend demo mà không cần backend. Hỗ trợ mô hình dữ liệu phức tạp (**Many-to-Many**) giữa PR, PO và DO.

## 2. Data files

Recommended structure:

```text
src/mock/data/purchase-requests.mock.ts
src/mock/data/purchase-orders.mock.ts
src/mock/data/delivery-orders.mock.ts
src/mock/data/users-partners.mock.ts
```

## 3. Purchase Request & Purchase Order mock rule

Mỗi PR có thể liên kết với nhiều PO qua danh sách `linked_po_numbers`.
Mỗi PO có thể liên kết với nhiều PR qua danh sách `linked_pr_ids`.

## 4. Delivery Order (Job) mock rule

Mỗi DO (Job) đại diện cho một lô hàng.
- **Consolidation:** Mỗi DO có thể gom hàng từ nhiều PO (`linked_po_ids`).
- **Traceability:** Mỗi item trong `items` của DO phải trỏ về cặp `(purchase_order_id, purchase_request_id)` tương ứng.
- **Sub-entities:** Mỗi DO nên có ít nhất 1-2 `house_bills` và 1-2 `containers` để demo giao diện danh sách.

## 5. Personnel task mock rule

Mỗi role nên có ít nhất 1 task để UI có dữ liệu hiển thị.
Tasks được nhóm theo Personnel Roles: `pic_manager`, `sale_staff`, `port_officer`, `customs_officer`.

## 6. Status distribution

Mock data nên bao quát toàn bộ vòng đời:
- PR: `NEW`, `APPROVED`, `PROCESSING`, `COMPLETED`.
- PO: `DRAFT`, `CREATED`, `CONFIRMED`.
- DO: `IN_TRANSIT`, `CUSTOMS_PROCESSING`, `WAREHOUSE_RECEIVED`, `COMPLETED`, `DELAYED`.

## 7. Delay scenario

Tạo ít nhất 1 DO có `delay_days > 0` và status `DELAYED`.

## 8. Multi-HBL/Container scenario

Tạo ít nhất 1 DO có >= 2 HBLs và >= 2 Containers để test UI table/list trong trang chi tiết DO.

## 9. Date format

Tất cả ngày dùng ISO string: `YYYY-MM-DD`.

## 10. ID Generation

Sử dụng chuỗi ngẫu nhiên hoặc UUID để đảm bảo tính duy nhất của `id` giữa các thực thể.
