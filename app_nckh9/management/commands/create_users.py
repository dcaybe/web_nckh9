from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from app_nckh9.models import InfoStudent, InfoTeacher
from datetime import date

class Command(BaseCommand):
    help = 'Tạo tài khoản mẫu cho student và teacher'

    def handle(self, *args, **kwargs):
        # Xóa tài khoản cũ nếu tồn tại
        User.objects.filter(username__in=['student', 'teacher', 'admin']).delete()
        InfoStudent.objects.filter(maSV=123456).delete()
        InfoTeacher.objects.filter(maGV=12345).delete()

        # Tạo tài khoản student
        student_user = User.objects.create_user(
            username='student',
            email='student@student.ptithcm.edu.vn',
            password='student123',
            first_name='Sinh',
            last_name='Viên'
        )
        InfoStudent.objects.create(
            emailSV='student@student.ptithcm.edu.vn',
            maSV=123456,
            tenSV='Sinh Viên',
            lopSV='CNTT1',
            khoaSV='CNTT',
            gender='Nam',
            dob=date(2000, 1, 1),
            phone=123456789,
            status='active',
            address='HCM',
            chuyenNganh='CNTT',
            nienkhoa='2020-2024',
            heDaoTao='Chính quy',
            coVanHocTap='Giảng Viên',
            tkCoVan='teacher',
            emialCoVan='teacher@ptithcm.edu.vn',
            phoneCoVan=987654321,
            boMonCoVan='CNTT',
            ketqua={},
            semester='2023-2024'
        )
        self.stdout.write(self.style.SUCCESS('Đã tạo tài khoản student'))

        # Tạo tài khoản teacher
        teacher_user = User.objects.create_user(
            username='teacher',
            email='teacher@ptithcm.edu.vn',
            password='teacher123',
            first_name='Giảng',
            last_name='Viên'
        )
        InfoTeacher.objects.create(
            emailCoVan='teacher@ptithcm.edu.vn',
            maGV=12345,
            tenGV='Giảng Viên',
            boMonCoVan='CNTT',
            gender='Nam',
            dob=date(1980, 1, 1),
            phone=987654321,
            status='active',
            address='HCM',
            hocViCoVan='Thạc sĩ'
        )
        self.stdout.write(self.style.SUCCESS('Đã tạo tài khoản teacher'))

        # Tạo tài khoản admin
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@ptithcm.edu.vn',
            password='admin123',
            first_name='Admin',
            last_name='System'
        )
        self.stdout.write(self.style.SUCCESS('Đã tạo tài khoản admin')) 