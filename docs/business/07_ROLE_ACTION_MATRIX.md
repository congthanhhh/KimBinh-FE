# 07. Ma trận vai trò và hành động demo

## 1. Phạm vi

File này chỉ mô tả role-action cho frontend MVP bằng mock data. Đây không phải authentication, authorization, access control, API guard hoặc production permission system.

## 2. Role demo

| Role kỹ thuật | Nhãn UI | Ý nghĩa |
|---|---|---|
| `admin` | Quản trị viên | Xem và thao tác toàn bộ workflow demo |
| `requester` | Người yêu cầu | Tạo PR từ nhu cầu vật tư của Production |
| `purchasing_manager` | Quản lý mua hàng / PIC | Điều phối PR, PO/DO, SAP, logistics, warehouse |
| `sale_staff` | Nhân viên kinh doanh | Cập nhật task kinh doanh, giá/thị trường nếu schema hỗ trợ |
| `port_officer` | Nhân viên cảng vụ | Cập nhật task hiện trường tại cảng |
| `customs_officer` | Nhân viên hải quan | Cập nhật finance/tax và task khai báo hải quan |

Task trong `personnel` vẫn dùng bốn key mentor: `pic_manager`, `sale_staff`, `port_officer`, `customs_officer`.

Không dùng các role cũ/khác trong role selector: Sản xuất, Mua hàng, Kho hàng, Warehouse Staff, Production Department, Purchasing Department, hoặc `PIC Manager` như role tách khỏi `purchasing_manager`.

## 3. Quyền theo role

| Action | Admin | Requester | Purchasing / PIC | Sale | Port | Customs |
|---|---|---|---|---|---|---|
| View dashboard/PR/DO/tasks | Có | Có | Có | Có | Có | Có |
| Create purchase request | Có | Có | Không | Không | Không | Không |
| Update PR request-origin fields | Có | Có khi UI hỗ trợ | Không | Không | Không | Không |
| Update PR status / assign PIC | Có | Không | Có | Không | Không | Không |
| Create delivery order | Có | Không | Có | Không | Không | Không |
| Update DO core/product/SAP/logistics/warehouse | Có | Không | Có | Không | Không | Không |
| Update finance/tax | Có | Không | Không | Không | Không | Có |
| Update `personnel.pic_manager` task | Có | Không | Có | Không | Không | Không |
| Update `personnel.sale_staff` task | Có | Không | Không | Có | Không | Không |
| Update `personnel.port_officer` task | Có | Không | Không | Không | Có | Không |
| Update `personnel.customs_officer` task | Có | Không | Không | Không | Không | Có |
| Reset demo data | Có | Không | Không | Không | Không | Không |

## 4. UI rule

- UI Vietnamese-first.
- Non-admin roles vẫn thấy PR/DO/SAP/logistics/warehouse/finance để nắm bối cảnh.
- Action không khả dụng nên disabled kèm helper text tiếng Việt, không ẩn quá mạnh.
- Task pages và DO task tabs hiển thị đủ bốn personnel groups; chỉ Admin hoặc matching role được cập nhật group tương ứng.
- Persisted role cũ cần normalize an toàn:
  - `pic_manager`, purchasing-like values -> `purchasing_manager`
  - production/requester-like values -> `requester`
  - warehouse-like hoặc unknown values -> `admin`
- Task updates target theo DO `order_number`, personnel key và task index/name.
