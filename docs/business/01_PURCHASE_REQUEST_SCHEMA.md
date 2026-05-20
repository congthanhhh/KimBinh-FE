# 01. Schema Purchase Request

## 1. Mục đích

`Purchase Request` (PR) là bước đầu của quy trình, do Production tạo từ nhu cầu vật tư thực tế cho hợp đồng sản xuất. Một PR có thể được phân bổ một phần hoặc toàn bộ vào một hoặc nhiều `Purchase Order` (PO) khác nhau (**mối quan hệ n-n**).

## 2. Data dictionary

| Field | Kiểu | Mô tả |
|---|---|---|
| `requested_order_id` | string | Mã định danh duy nhất của PR |
| `item_code` | string | Mã hàng hóa trong hệ thống |
| `item_name` | string | Tên hàng hóa |
| `quantity` | number | Số lượng cần mua, lớn hơn `0` |
| `unit` | string | Đơn vị tính |
| `priority` | string | Mức ưu tiên, ví dụ `Ưu tiên 1`, `Khẩn cấp` |
| `requested_order_date` | date string | Ngày tạo yêu cầu |
| `adjusted_date` | date string/null | Ngày điều chỉnh nếu có |
| `notes` | string/null | Ghi chú |
| `purchasing_manager` | string/null | Người phụ trách mua hàng được chỉ định |
| `production_contract_number` | string/null | Số hợp đồng sản xuất để đối soát chi phí |
| `status` | enum | Trạng thái PR |
| `warehouse_deadline_date` | date string | Hạn chót hàng phải nhập kho |
| `actual_warehouse_entry_date` | date string/null | Ngày nhập kho thực tế |
| `supplier_expected_delivery_date` | date string/null | Ngày nhà cung cấp dự kiến giao |
| `expected_arrival_date` | date string/null | Ngày dự kiến hàng đến |
| `delay_days` | number | Số ngày trễ so với deadline |
| `requester` | string | Người thực hiện yêu cầu |
| `linked_po_numbers` | string[] | Danh sách các số PO liên quan (Frontend mock) |

Xem JSON mẫu đầy đủ tại `06_SAMPLE_DATA.md`.

## 3. Status

```ts
export type PurchaseRequestStatus =
  | 'NEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED';
```

## 4. Rule

- `requested_order_id` là duy nhất.
- `requested_order_date` và `warehouse_deadline_date` dùng `YYYY-MM-DD`.
- `warehouse_deadline_date` là deadline theo kế hoạch sản xuất.
- `delay_days` phản ánh số ngày trễ khi có ngày dự kiến hoặc ngày nhập kho thực tế.
- **Allocation Rule:** Một PR có thể được chia nhỏ để mua từ nhiều nhà cung cấp khác nhau thông qua nhiều PO. Trạng thái PR chuyển sang `PROCESSING` khi có ít nhất một PO được tạo.
