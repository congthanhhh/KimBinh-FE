# 03. Schema personnel và task

## 1. Mục đích

`personnel` mô tả các role tham gia xử lý DO. Người phụ trách cập nhật `progress` từ `0` đến `100` và `completed_at` khi hoàn thành task.

## 2. Personnel roles

| Key | Role | Mô tả |
|---|---|---|
| `pic_manager` | PIC Manager | Nhân viên thu mua phụ trách chính |
| `sale_staff` | Sale Staff | Nhân viên kinh doanh, cập nhật giá/thị trường |
| `port_officer` | Port Officer | Nhân viên hiện trường tại cảng, xử lý thủ tục lấy hàng |
| `customs_officer` | Customs Officer | Nhân viên khai báo hải quan và thuế |

## 3. Task fields

| Field | Kiểu | Mô tả |
|---|---|---|
| `task_name` | string | Tên công việc |
| `created_at` | date string/null | Ngày tạo task nếu có |
| `progress` | number | Tiến độ từ `0` đến `100` |
| `completed_at` | date string/null | Ngày hoàn thành |

Xem JSON mẫu đầy đủ tại `06_SAMPLE_DATA.md`.

## 4. Rule

- `progress` nằm trong khoảng `0 <= progress <= 100`.
- Khi task hoàn thành, cập nhật `completed_at`; nếu `completed_at` có dữ liệu thì `progress` nên là `100`.
- Personnel cập nhật task cho đến khi phần việc liên quan đến DO hoàn tất.

## 5. TypeScript type gợi ý

```ts
export interface PersonnelTask {
  task_name: string;
  created_at?: string | null;
  progress: number;
  completed_at: string | null;
}

export interface PersonnelRole {
  assignee: string | null;
  tasks: PersonnelTask[];
}

export interface Personnel {
  pic_manager: PersonnelRole;
  sale_staff: PersonnelRole;
  port_officer: PersonnelRole;
  customs_officer: PersonnelRole;
}
```
