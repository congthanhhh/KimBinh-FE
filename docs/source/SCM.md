# Quy trình Vận hành Cung ứng (SCM)

## Tổng quan
Quy trình này tích hợp từ khâu tạo yêu cầu mua hàng (PR) đến nhập kho và đối soát, sử dụng SAP làm hệ thống xương sống. Hệ thống hỗ trợ mô hình phân bổ linh hoạt giữa PR, PO và DO.

---

## Giai đoạn 1: Procurement (PR & PO)

- **Sản xuất** tạo PR dựa trên mã hàng và số hợp đồng sản xuất.
- **Mua hàng** tổng hợp PR và tạo PO trên SAP.
- **Mối quan hệ n-n**: Một PR có thể phân bổ vào nhiều PO và một PO có thể chứa nhiều PR.

---

## Giai đoạn 2: Logistics Initiation (DO & Booking)

- **Quản lý Lệnh giao hàng (DO)**:
  - Một DO có thể gom hàng từ nhiều PO (**Consolidation**).
- **Booking & SI**: Forwarder lấy Booking và gửi Shipping Instruction.

---

## Giai đoạn 3: Documentation & Tracking

- **Kiểm tra chứng từ**: Đối soát CI, PL, B.L.
- **Quản lý HBL & Container**: Một DO có thể chứa nhiều House Bill of Lading và nhiều Container.
- **Theo dõi lộ trình**: Cập nhật ETD/ETA kế hoạch và thực tế.

---

## Giai đoạn 4: Customs & Port Execution

- **Customs Officer**:
  - Khai báo hải quan, quản lý thuế nhập khẩu.
  - Theo dõi luồng (Xanh/Vàng/Đỏ).
- **Port Officer**: Xử lý Telex Release và lấy D.O tại cảng.

---

## Giai đoạn 5: Closing & Reconciliation

- **Nhập kho**: Ghi nhận ngày nhập thực tế và hoàn tất task personnel (`progress = 100%`).
- **Phân tích KPI**: Hệ thống tự động tính `delay_days` so với deadline gốc của PR.

---

## Vai trò & Trách nhiệm

| Vai trò | Trách nhiệm chính |
|--------|-------------------|
| **Sản xuất** | Chịu trách nhiệm về số lượng, thông số kỹ thuật vật tư |
| **Purchasing / PIC** | Kết nối NCC, tạo PO, quản lý DO và công đoạn Logistics |
| **Port Officer** | Xử lý thủ tục tại cảng, lấy lệnh giao hàng |
| **Customs Officer** | Khai báo hải quan, thuế, nghĩa vụ tài chính |

---

## Các chỉ số hiệu suất chính (KPI)

- `delay_days` → Đo độ trễ nhập kho so với PR deadline.
- `progress` → % hoàn thành công việc của Personnel.
- `Lead time` → Thời gian từ lúc PR đến khi nhập kho.

---

## Ghi chú hệ thống

- Hệ thống đồng bộ dữ liệu với **SAP ERP**.
- Hỗ trợ quản lý lô hàng phức tạp (nhiều PO trong 1 DO).