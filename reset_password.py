from django.contrib.auth.models import User
from django.core.management import setup_environ
from web_nckh9 import settings

setup_environ(settings)

try:
    user = User.objects.get(username='letho')
    user.set_password('Admin@123')
    user.save()
    print("Mật khẩu đã được đặt lại thành công!")
    print("Username: letho")
    print("Password: Admin@123")
except User.DoesNotExist:
    print("Không tìm thấy user với username 'letho'")
except Exception as e:
    print(f"Lỗi: {str(e)}")