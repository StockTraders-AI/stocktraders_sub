# Edit Landing Multi Page

Một source Flask dùng chung cho 5 landing tạm thời:

```txt
/1/
/2/
/3/
/4/
/5/
```

Mỗi landing dùng database riêng trong thư mục `data/`:

```txt
data/1.db
data/2.db
data/3.db
data/4.db
data/5.db
```

Mỗi DB có bảng `leads` và `page_content`, nên nội dung edit UI và danh sách đăng ký của từng landing tách riêng.

## Chạy local

```bash
pip install -r requirements.txt
python app.py
```

Mở:

```txt
http://localhost:8000/1/
http://localhost:8000/2/
http://localhost:8000/3/
http://localhost:8000/4/
http://localhost:8000/5/
```

## API theo từng landing

Ví dụ với landing `/1/`:

```txt
GET    /1/api/page-content
POST   /1/api/page-content
DELETE /1/api/page-content

GET    /1/api/leads
POST   /1/api/leads
DELETE /1/api/leads/<id>
```

Landing `/2/` dùng `/2/api/...`, tương tự đến `/5/`.

## Admin và Edit UI

Bấm dòng bản quyền ở footer, nhập PIN:

```txt
9983
```

Sau khi nhập đúng PIN:

- Xem danh sách đăng ký của đúng landing hiện tại.
- Bật chế độ sửa UI cho đúng landing hiện tại.
- Bấm `Lưu UI` để lưu nội dung vào DB riêng của landing đó.