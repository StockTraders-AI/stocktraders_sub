# Simple Python Landing

Landing page Python/Flask + SQLite dùng giao diện trích từ file mẫu `StockTradersLanding.jsx`.

Mục tiêu:

- Giữ giao diện landing giống file mẫu.
- Không dùng React/Vite.
- Form gửi về Flask API.
- Lưu họ tên, số điện thoại, email vào SQLite `leads.db`.

## Chạy local

```bash
pip install -r requirements.txt
python app.py
```

Mở:

```txt
http://localhost:8000
```

## API

```txt
GET    /api/leads
POST   /api/leads
DELETE /api/leads/<id>
```

## Admin

Bấm dòng `© 2026 StockTraders` ở footer, nhập PIN:

```txt
9983
```

## Edit UI trực tiếp

Bấm dòng `© 2026 StockTraders` ở footer, nhập PIN `9983`.

Sau khi nhập đúng PIN:

- Thanh `Chế độ sửa UI` hiện ở cuối màn hình.
- Chỉ phần phía trên form được sửa.
- Có thể bấm trực tiếp vào chữ để đổi nội dung.
- Có thể bấm `+ Section`, `Dán HTML`, `Xoá`, `Nhân bản`, đổi thứ tự section.
- `Dán HTML` nhận cả file HTML đầy đủ; app tự lấy nội dung trong `<body>` và scope CSS trong `<style>` vào section riêng để không phá layout toàn trang.
- Bấm `Lưu UI` để người khác mở web thấy nội dung mới.
- Form đăng ký, admin lead và database lead không bị sửa bởi chế độ này.

Nội dung UI đã lưu nằm trong bảng `page_content` của cùng file SQLite.

## Database

File SQLite tự tạo khi chạy:

```txt
leads.db
```