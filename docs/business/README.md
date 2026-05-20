# Bộ tài liệu business - Quản lý nhập hàng nhà máy

Tài liệu này chuẩn hóa nghiệp vụ từ các quy trình vận hành thực tế cho frontend MVP quản lý nhập hàng nhà máy. App dùng mock data, Zustand và localStorage; hỗ trợ mô hình quan hệ phức tạp (n-n).

## Thứ tự ưu tiên

```text
final_database_schema.sql -> bs-workflow.md -> docs/business -> docs/ui-design -> src code
```

## Source of truth

| Source file | Nội dung |
|---|---|
| `docs/database/final_database_schema.sql` | Cấu trúc dữ liệu chuẩn (PR n-n PO, PO n-n DO, DO 1-n HBL/Container) |
| `docs/source/bs-workflow.md` | Quy trình 5 giai đoạn cốt lõi và các mốc SLA |
| `docs/source/SCM.md` | Quy trình vận hành cung ứng tổng thể |
| `docs/source/SOP.md` | Chi tiết quy trình tiêu chuẩn vận hành và chứng từ |

## File business

| File | Trách nhiệm |
|---|---|
| `00_PROJECT_OVERVIEW.md` | Domain, thực thể và quan hệ dữ liệu n-n |
| `01_PURCHASE_REQUEST_SCHEMA.md` | Schema và rule của Purchase Request |
| `02_DELIVERY_ORDER_SCHEMA.md` | Schema và rule của Delivery Order, HBL, Container |
| `03_PERSONNEL_TASKS_SCHEMA.md` | Personnel roles, task fields và progress rule |
| `04_WORKFLOW_RULES.md` | Luồng nghiệp vụ 5 giai đoạn, trạng thái và delay rule |
| `05_API_AND_AGENT_RULES.md` | Rào chắn frontend-only và rule cho coding agent |
| `06_SAMPLE_DATA.md` | Dữ liệu mẫu đầy đủ để đối chiếu |
| `07_ROLE_ACTION_MATRIX.md` | Role-action demo, không phải permission thật |

## Nguyên tắc chung

- `docs/business` chỉ chuẩn hóa từ `docs/source`, không tạo workflow mới.
- UI hiển thị tiếng Việt; schema keys, field names và route paths giữ tiếng Anh.
- Status enum dùng uppercase.
- Không triển khai backend, database, authentication, SAP API thật, logistics API thật hoặc production permission system.
