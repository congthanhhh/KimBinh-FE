# UI Project Overview - Import Management Admin Dashboard

## 1. Bối cảnh

Hệ thống quản lý nhập hàng nhà máy sản xuất theo dõi toàn bộ quá trình từ khi bộ phận sản xuất tạo yêu cầu mua hàng đến khi hàng được giao vào kho.

Frontend cần thể hiện rõ 3 nhóm dữ liệu chính:

1. Purchase Request - Yêu cầu mua hàng từ sản xuất.
2. Delivery Order - Đơn giao hàng / thông tin PO / logistics / SAP / kho / thuế.
3. Personnel Tasks - Nhiệm vụ của các nhân sự liên quan.

## 2. Mục tiêu UI

Dashboard cần giúp người dùng:

- Theo dõi tổng quan tình trạng nhập hàng.
- Xem danh sách yêu cầu mua hàng.
- Xem danh sách Delivery Order.
- Kiểm tra tiến độ logistics.
- Theo dõi deadline nhập kho.
- Theo dõi task theo người phụ trách.
- Phát hiện đơn hàng trễ hoặc có rủi ro.

## 3. Phạm vi MVP

MVP chỉ cần frontend:

- Mock data local.
- Không authentication.
- Không backend API thật.
- Không phân quyền phức tạp.
- Không xử lý nghiệp vụ tài chính thực tế.

## 4. Style tổng thể

Phong cách giao diện:

```text
Minimalism
Clean Admin Dashboard
Data-first
Neutral color
Low visual noise
Industrial SaaS
```

## 5. Nguyên tắc thiết kế

- Ưu tiên bảng dữ liệu rõ ràng.
- Dùng badge để hiển thị status.
- Dùng màu ít nhưng có ý nghĩa.
- Không dùng quá nhiều gradient, shadow hoặc animation.
- Mỗi trang chỉ tập trung vào một nhiệm vụ chính.
- Detail view nên dùng drawer hoặc tab để tránh overload thông tin.

## 6. User roles trong UI

Các vai trò xuất hiện trong giao diện:

| Role | Mục đích UI |
|---|---|
| Production Department | Tạo và theo dõi Purchase Request |
| Purchasing Manager | Quản lý PR, PO và DO |
| PIC Manager | Phụ trách chính đơn nhập hàng |
| Sale Staff | Cập nhật giá bán / thị trường |
| Port Officer | Theo dõi thủ tục cảng |
| Customs Officer | Xử lý khai quan và thuế |
| Warehouse Staff | Xác nhận nhập kho |

## 7. Main flow

```text
Production creates PR
→ Purchasing reviews PR
→ Purchasing creates PO / DO
→ Logistics updates shipping status
→ Personnel complete assigned tasks
→ Warehouse confirms goods received
→ DO completed
```
