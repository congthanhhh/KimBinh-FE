# 06. Dữ liệu mẫu

## 1. Purchase Request mẫu

```json
{
  "id": "pr-uuid-001",
  "requested_order_id": "PR-2026-0056",
  "item_code": "RAW-STEEL-001",
  "item_name": "Thép cuộn cán nguội 1.2mm",
  "quantity": 15.5,
  "unit": "Tấn",
  "priority": "Ưu tiên 1",
  "requested_order_date": "2026-05-15",
  "adjusted_date": "2026-05-15",
  "notes": "Hàng phục vụ dự án VinFast Q3",
  "purchasing_manager": "Nguyễn Văn A",
  "production_contract_number": "HD-SX-2026-01",
  "status": "PROCESSING",
  "warehouse_deadline_date": "2026-06-15",
  "actual_warehouse_entry_date": null,
  "supplier_expected_delivery_date": "2026-06-10",
  "expected_arrival_date": "2026-06-12",
  "delay_days": 0,
  "requester": "Trần Thị B (Xưởng 1)",
  "linked_po_numbers": ["PO-FDS-9921"]
}
```

## 2. Purchase Order mẫu

```json
{
  "id": "po-uuid-001",
  "order_number": "PO-FDS-9921",
  "purchase_contract_number": "PUR-CONT-2026-V1",
  "supplier_name": "Steel Corp Korea",
  "supplier_code": "SAP-VND-0092",
  "status": "CONFIRMED",
  "notes": "Hàng đặt theo PR-2026-0056",
  "linked_pr_ids": ["pr-uuid-001"],
  "linked_do_ids": ["do-uuid-001"]
}
```

## 3. Delivery Order mẫu (Job)

```json
{
  "id": "do-uuid-001",
  "delivery_order_number": "JOB-2026-0088",
  "tracking_number": "TRK8827110",
  "purchase_contract_number": "PUR-CONT-2026-V1",
  "status": "IN_TRANSIT",
  "notes": "Hàng đóng container 20ft",
  "xnk_notes": "Cần kiểm dịch thực vật",
  "linked_po_ids": ["po-uuid-001"],
  "items": [
    {
      "id": "doi-001",
      "purchase_order_id": "po-uuid-001",
      "purchase_request_id": "pr-uuid-001",
      "item_name_requested": "Thép cuộn cán nguội 1.2mm",
      "unit": "Tấn",
      "quantity": 15.5,
      "lot_number": "LOT-STEEL-26-001",
      "packaging_type": "Pallet gỗ"
    }
  ],
  "house_bills": [
    {
      "id": "hbl-001",
      "hbl_number": "HBL-S001928",
      "hbl_type": "ORIGINAL",
      "sailing_date": "2026-05-22",
      "customer_payer": "Steel Corp Korea"
    }
  ],
  "containers": [
    {
      "id": "cont-001",
      "container_no": "MSKU1234567",
      "seal_no": "SL998877",
      "container_type": "20DC",
      "quantity": 1
    }
  ],
  "sap_integration": {
    "supplier_code": "SAP-VND-0092",
    "actual_item_code": "SAP-ITEM-8812",
    "po_number": "4500001234"
  },
  "logistics_shipping": {
    "shipping_line": "Maersk Line",
    "vessel_code": "MAERSK-OSLO-22",
    "port_of_departure": "Busan, Korea",
    "port_of_destination": "Hai Phong, Vietnam",
    "documents_list": [
      "Invoice",
      "Packing List",
      "B/L",
      "C/O"
    ],
    "mbl_number": "MBL-MAERSK-9900",
    "etd_planned": "2026-05-22",
    "etd_actual": "2026-05-22",
    "eta_planned": "2026-06-05",
    "eta_actual": "2026-06-06"
  },
  "warehouse_tracking": {
    "warehouse_deadline": "2026-06-15",
    "actual_entry_date": null,
    "delay_days": 0
  },
  "finance_tax": {
    "import_tax_rate": 0.05,
    "tax_amount": 12500000,
    "tax_payment_deadline": "2026-06-05",
    "insurance": "Bảo Việt"
  },
  "personnel": {
    "pic_manager": {
      "assignee": "Nguyễn Văn A",
      "tasks": [
        {
          "task_name": "Xác nhận lịch trình thanh toán",
          "progress": 100,
          "completed_at": "2026-05-12"
        }
      ]
    },
    "sale_staff": {
      "assignee": null,
      "tasks": []
    },
    "port_officer": {
      "assignee": null,
      "tasks": []
    },
    "customs_officer": {
      "assignee": "Lê Văn C",
      "tasks": [
        {
          "task_name": "Truyền tờ khai hải quan",
          "created_at": "2026-05-13",
          "progress": 20,
          "completed_at": null
        }
      ]
    }
  }
}
```
