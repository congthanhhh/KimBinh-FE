# 02. Schema Delivery Order

## 1. Mục đích

`Delivery Order` (DO) quản lý từng shipment/job thực tế. Một DO có thể gom hàng từ nhiều PO khác nhau và một PO có thể được giao trong nhiều DO (**mối quan hệ n-n**). DO là thực thể trung tâm quản lý chứng từ (HBL), Container và các tiến độ Logistics/Hải quan.

## 2. Top-level keys

```text
order_info
product_details (List of items linked to PO/PR)
house_bills (List of HBLs)
containers (List of Containers)
sap_integration
logistics_shipping
warehouse_tracking
finance_tax
personnel
```

## 3. Data dictionary

### `order_info`

| Field | Kiểu | Mô tả |
|---|---|---|
| `delivery_order_number` | string | Mã Job/DO duy nhất |
| `tracking_number` | string/null | Mã tracking vận chuyển |
| `purchase_contract_number` | string/null | Số hợp đồng mua |
| `status` | enum | Trạng thái DO |
| `notes` | string/null | Ghi chú chung |
| `xnk_notes` | string/null | Ghi chú xuất nhập khẩu |
| `linked_po_numbers` | string[] | Danh sách các PO liên quan |

### `delivery_order_items` (trong `product_details`)

Mỗi item trong DO phải liên kết ngược về một PO và PR cụ thể để đối soát.

| Field | Kiểu | Mô tả |
|---|---|---|
| `purchase_order_id` | string | Liên kết PO |
| `purchase_request_id` | string | Liên kết PR |
| `item_name_requested` | string | Tên hàng hóa theo PR |
| `quantity` | number | Số lượng giao trong đợt này |
| `unit` | string | Đơn vị tính |
| `lot_number` | string/null | Số lot |
| `packaging_type` | string/null | Quy cách đóng gói |

### `house_bills` (HBL)

| Field | Kiểu | Mô tả |
|---|---|---|
| `hbl_number` | string | Số vận đơn HBL |
| `hbl_type` | enum | Loại HBL (Original, Copy, Surrendered...) |
| `sailing_date` | date string | Ngày tàu chạy |
| `customer_payer` | string | Người thanh toán phí |

### `containers`

| Field | Kiểu | Mô tả |
|---|---|---|
| `container_no` | string | Số container |
| `seal_no` | string | Số chì |
| `container_type` | string | Loại container (20DC, 40HC...) |
| `quantity` | number | Số lượng |

### `sap_integration`

| Field | Kiểu | Mô tả |
|---|---|---|
| `supplier_code` | string/null | Mã nhà cung cấp trên SAP |
| `actual_item_code` | string/null | Mã hàng nhập thực tế trên SAP |
| `po_number` | string/null | Số PO chính trên SAP |

### `logistics_shipping`

| Field | Kiểu | Mô tả |
|---|---|---|
| `shipping_line` | string/null | Hãng tàu |
| `vessel_code` | string/null | Mã tàu/chuyến |
| `port_of_departure` | string/null | Cảng đi |
| `port_of_destination` | string/null | Cảng đến |
| `etd_planned` / `etd_actual` | date string/null | ETD kế hoạch/thực tế |
| `eta_planned` / `eta_actual` | date string/null | ETA kế hoạch/thực tế |
| `mbl_number` | string/null | Số Master Bill (MBL) |

### `warehouse_tracking`

| Field | Kiểu | Mô tả |
|---|---|---|
| `warehouse_deadline` | date string/null | Hạn chót nhập kho |
| `actual_entry_date` | date string/null | Ngày nhập kho thực tế |
| `delay_days` | number | Số ngày trễ |

`personnel` dùng schema trong `03_PERSONNEL_TASKS_SCHEMA.md`. Xem JSON mẫu đầy đủ tại `06_SAMPLE_DATA.md`.

## 4. Status

```ts
export type DeliveryOrderStatus =
  | 'DRAFT'
  | 'PO_CREATED'
  | 'IN_TRANSIT'
  | 'CUSTOMS_PROCESSING'
  | 'WAREHOUSE_RECEIVED'
  | 'COMPLETED'
  | 'DELAYED';
```

## 5. Rule

- **Consolidation Rule:** Một DO có thể gom nhiều PO của cùng một nhà cung cấp (hoặc khác nhà cung cấp nếu chung Forwarder) để tối ưu vận chuyển.
- **Traceability:** Mọi item trong DO phải có thông tin `purchase_order_id` và `purchase_request_id`.
- **Completion:** DO chỉ hoàn tất khi hàng đã nhập kho và tất cả Personnel Tasks đạt 100%.
