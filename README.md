# Hệ thống Quản lý và Đánh giá Điểm Rèn luyện

Hệ thống web được phát triển để quản lý và đánh giá điểm rèn luyện cho sinh viên, giảng viên và admin.

## Tính năng chính

### Dành cho Sinh viên
- Đánh giá điểm rèn luyện
- Xem lịch sử điểm
- Nộp đơn phúc khảo
- Xem thông báo
- Trợ lý AI hỗ trợ

### Dành cho Giảng viên
- Quản lý lớp
- Quản lý điểm số
- Xem thống kê phân tích
- Gửi thông báo
- Trợ lý AI hỗ trợ

### Dành cho Admin
- Quản lý người dùng
- Quản lý quy tắc chấm điểm
- Xét duyệt hàng loạt
- Thống kê báo cáo
- Sao lưu và khôi phục
- Đồng bộ dữ liệu
- Trợ lý AI hỗ trợ

## Công nghệ sử dụng

- Backend: Django (Python)
- Frontend: HTML, CSS, JavaScript
- Database: SQLite
- Cache: Redis
- AI Assistant: Model xử lý ngôn ngữ tự nhiên

## Cấu trúc thư mục

```
web_nckh9/
├── app_nckh9/              # Ứng dụng chính
│   ├── static/             # File tĩnh (CSS, JS)
│   ├── templates/          # Template HTML
│   ├── kaira_chatbot/      # Module trợ lý AI
│   └── management/         # Lệnh quản lý Django
├── media/                  # File người dùng tải lên
├── staticfiles/           # File tĩnh được thu thập
└── web_nckh9/             # Cấu hình dự án
```

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/dcaybe/web_nckh9.git
cd web_nckh9
```

2. Tạo và kích hoạt môi trường ảo:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Cài đặt các dependency:
```bash
pip install -r requirements.txt
```

4. Thực hiện migrate database:
```bash
python manage.py migrate
```

5. Tạo tài khoản admin:
```bash
python manage.py createsuperuser
```

6. Chạy server phát triển:
```bash
python manage.py runserver
```

Truy cập http://localhost:8000 để sử dụng hệ thống.

## Quy trình phát triển

1. Tạo nhánh mới cho tính năng:
```bash
git checkout -b feature/ten-tinh-nang
```

2. Commit và push code:
```bash
git add .
git commit -m "Mô tả thay đổi"
git push origin feature/ten-tinh-nang
```

3. Tạo Pull Request để review code

## Đóng góp

Mọi đóng góp đều được hoan nghênh. Vui lòng:

1. Fork dự án
2. Tạo nhánh tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên nhánh (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## Liên hệ
GitHub: https://github.com/dcaybe/web_nckh9