# Import Management Admin Dashboard - UI Markdown Pack

Bộ tài liệu này dùng cho AI Code khi xây dựng giao diện frontend-only cho hệ thống quản lý nhập hàng nhà máy sản xuất.

## Mục tiêu

Thiết kế một Admin Dashboard tối giản để theo dõi quy trình:

```text
Purchase Request → Delivery Order / PO → Personnel Tasks → Warehouse Entry
```

## Phạm vi

- Chỉ frontend.
- Không cần backend phức tạp.
- Dữ liệu dùng mock JSON hoặc local state.
- Giao diện theo phong cách Minimalism.
- Ưu tiên khả năng đọc dữ liệu, lọc nhanh, xem trạng thái và theo dõi tiến độ.

## Danh sách file

| File | Nội dung |
|---|---|
| `00_UI_PROJECT_OVERVIEW.md` | Tổng quan sản phẩm UI |
| `01_DESIGN_SYSTEM.md` | Design system tối giản |
| `02_INFORMATION_ARCHITECTURE.md` | Kiến trúc thông tin và navigation |
| `03_DASHBOARD_PAGE_SPEC.md` | Đặc tả trang Dashboard |
| `04_PURCHASE_REQUEST_PAGE_SPEC.md` | Đặc tả trang Purchase Requests |
| `05_DELIVERY_ORDER_PAGE_SPEC.md` | Đặc tả trang Delivery Orders |
| `06_TASK_MANAGEMENT_PAGE_SPEC.md` | Đặc tả trang Task Management |
| `07_COMPONENT_SPEC.md` | Danh sách component cần xây dựng |
| `08_FRONTEND_DATA_MODEL.md` | TypeScript data model đề xuất |
| `09_MOCK_DATA_RULES.md` | Quy tắc mock data frontend |
| `10_AGENT_IMPLEMENTATION_RULES.md` | Rule cho AI Code khi generate UI |
| `11_FRONTEND_BUILD_PROMPT.md` | Prompt tổng hợp để đưa cho AI coding agent |

## Tech stack khuyến nghị

```text
Vite + React + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons
```

## UX ưu tiên

Người dùng cần trả lời nhanh các câu hỏi:

```text
Yêu cầu mua hàng nào đang cần xử lý?
DO nào đang vận chuyển?
DO nào đang trễ?
Ai đang phụ trách task nào?
Task nào chưa hoàn thành?
Hàng nào đã nhập kho?
```
