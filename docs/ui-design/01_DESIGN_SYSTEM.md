# Design System - Minimal Admin Dashboard

## 1. Visual direction

Thiết kế theo phong cách tối giản, rõ ràng, ưu tiên dữ liệu.

Keywords:

```text
Clean
Calm
Readable
Structured
Compact
Operational
Data-first
```

## 2. Color palette

```text
Background:        #F8FAFC
Surface:           #FFFFFF
Border:            #E5E7EB
Text Primary:      #111827
Text Secondary:    #6B7280
Text Muted:        #94A3B8
Primary:           #2563EB
Success:           #16A34A
Warning:           #F59E0B
Danger:            #DC2626
Slate:             #475569
```

## 3. Status colors

| Status | Color | Meaning |
|---|---|---|
| NEW | Gray | Mới tạo |
| APPROVED | Blue | Đã duyệt |
| PROCESSING | Amber | Đang xử lý |
| IN_TRANSIT | Amber | Đang vận chuyển |
| CUSTOMS_PROCESSING | Amber | Đang khai quan |
| WAREHOUSE_RECEIVED | Green | Đã vào kho |
| COMPLETED | Green | Hoàn thành |
| DELAYED | Red | Trễ hạn |
| CANCELLED | Slate | Đã hủy |

## 4. Priority colors

| Priority | Color |
|---|---|
| Ưu tiên 1 | Red |
| Khẩn cấp | Red |
| Ưu tiên 2 | Amber |
| Bình thường | Gray |

## 5. Typography

```text
Font family: Inter / Geist / Roboto / IBM Plex Sans
Page title: 24px / 600
Section title: 16px / 600
Body text: 14px / 400
Table text: 13px / 400
Label: 12px / 500
Badge: 12px / 500
```

## 6. Spacing

```text
Page padding: 24px
Card padding: 16px hoặc 20px
Table row height: 48px
Sidebar width: 240px
Topbar height: 64px
Border radius: 12px
```

## 7. Component style

### Cards

- Background trắng.
- Border nhẹ.
- Shadow rất nhẹ hoặc không shadow.
- Radius 12px.

### Tables

- Header nền rất nhạt.
- Row hover nhẹ.
- Không dùng nhiều border dọc.
- Ưu tiên whitespace đều.

### Buttons

- Primary button dùng màu xanh.
- Secondary button dùng border.
- Ghost button cho action phụ.

### Badges

Badge cần nhỏ, dễ scan, không quá nổi bật.

Example:

```text
[APPROVED]
[IN_TRANSIT]
[DELAYED]
```

## 8. Empty state

Empty state cần ngắn gọn:

```text
No delivery orders found.
Try changing your filters or create a new delivery order.
```

## 9. UX constraints

- Không dùng layout quá nhiều màu.
- Không dùng chart nếu bảng hoặc card đã đủ rõ.
- Không dùng modal quá nhiều; ưu tiên drawer cho detail.
- Không hiển thị toàn bộ JSON thô trong UI chính.
