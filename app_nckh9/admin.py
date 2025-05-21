from django.contrib import admin
from django.contrib.auth.models import User
from .models import (
    InfoStudent, InfoTeacher, SinhVienTDG, GVCNDanhGia,
    HoiDongKhoaChamDiem, Nofitication, PrivateNofitication,
    StudentsReport, ComplaintHistory, Ranking, TeacherManager,
    Analysts, NofiticationManager, HomepageManager,
    PendingStudents, Analysts2, AdminManage, HistoryActive,
    Login, KairaChatBot, HistoryPoint, HocKy
)

@admin.register(InfoStudent)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('maSV', 'tenSV', 'lopSV', 'khoaSV')
    search_fields = ('maSV', 'tenSV')
    list_filter = ('khoaSV', 'lopSV')

@admin.register(InfoTeacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('maGV', 'tenGV', 'boMonCoVan')
    search_fields = ('maGV', 'tenGV')
    list_filter = ('boMonCoVan',)

@admin.register(SinhVienTDG)
class SinhVienTDGAdmin(admin.ModelAdmin):
    list_display = ('maSV', 'tenSV', 'lopSV', 'khoaSV', 'drl_tongket', 'xepLoai')
    search_fields = ('maSV', 'tenSV')
    list_filter = ('khoaSV', 'lopSV', 'xepLoai')

@admin.register(GVCNDanhGia)
class GVCNDanhGiaAdmin(admin.ModelAdmin):
    list_display = ('maSV', 'tenSV', 'lopSV', 'khoaSV', 'drl_tongket', 'xepLoai')
    search_fields = ('maSV', 'tenSV')
    list_filter = ('khoaSV', 'lopSV', 'xepLoai')

@admin.register(HoiDongKhoaChamDiem)
class HoiDongKhoaChamDiemAdmin(admin.ModelAdmin):
    list_display = ('maSV', 'tenSV', 'lopSV', 'khoaSV', 'drl_tongket', 'xepLoai')
    search_fields = ('maSV', 'tenSV')
    list_filter = ('khoaSV', 'lopSV', 'xepLoai')

@admin.register(Nofitication)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'dob', 'content')
    search_fields = ('title', 'content')
    list_filter = ('dob',)

@admin.register(PrivateNofitication)
class PrivateNotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'dob', 'content')
    search_fields = ('title', 'content')
    list_filter = ('dob',)

@admin.register(StudentsReport)
class StudentsReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'student', 'semester', 'status', 'created_at')
    search_fields = ('title', 'content')
    list_filter = ('semester', 'status')

@admin.register(ComplaintHistory)
class ComplaintHistoryAdmin(admin.ModelAdmin):
    list_display = ('time', 'name', 'status', 'device')
    search_fields = ('name', 'description')
    list_filter = ('status', 'time')

@admin.register(Ranking)
class RankingAdmin(admin.ModelAdmin):
    list_display = ('semester', 'rank_number', 'maSV', 'tenSV', 'lopSV')
    search_fields = ('maSV', 'tenSV')
    list_filter = ('semester', 'lopSV')

@admin.register(TeacherManager)
class TeacherManagerAdmin(admin.ModelAdmin):
    list_display = ('allClass', 'allStudent', 'countdown')

@admin.register(Analysts)
class AnalystsAdmin(admin.ModelAdmin):
    list_display = ('allStudent', 'diemTB', 'needImprove', 'good')

@admin.register(NofiticationManager)
class NotificationManagerAdmin(admin.ModelAdmin):
    list_display = ('allNotification', 'countdown', 'type')

@admin.register(HomepageManager)
class HomepageManagerAdmin(admin.ModelAdmin):
    list_display = ('allStudent', 'pending', 'diemTb')

@admin.register(PendingStudents)
class PendingStudentsAdmin(admin.ModelAdmin):
    list_display = ('khoa', 'lop', 'semester', 'status', 'maSV', 'tenSV')
    search_fields = ('maSV', 'tenSV')
    list_filter = ('khoa', 'lop', 'semester', 'status')

@admin.register(Analysts2)
class Analysts2Admin(admin.ModelAdmin):
    list_display = ('allStudent', 'diemTB', 'needImprove', 'good')

@admin.register(AdminManage)
class AdminManageAdmin(admin.ModelAdmin):
    list_display = ('tenSV', 'emailSV', 'position', 'khoa', 'status')
    search_fields = ('tenSV', 'emailSV')
    list_filter = ('position', 'khoa', 'status')

@admin.register(HistoryActive)
class HistoryActiveAdmin(admin.ModelAdmin):
    list_display = ('time', 'name', 'action', 'status', 'device', 'ip')
    search_fields = ('name', 'description')
    list_filter = ('action', 'status', 'time')

@admin.register(Login)
class LoginAdmin(admin.ModelAdmin):
    list_display = ('maSV', 'emailSV')
    search_fields = ('maSV', 'emailSV')

@admin.register(KairaChatBot)
class KairaChatBotAdmin(admin.ModelAdmin):
    list_display = ('question', 'answer', 'time')
    search_fields = ('question', 'answer')
    list_filter = ('time',)

@admin.register(HistoryPoint)
class HistoryPointAdmin(admin.ModelAdmin):
    list_display = ('maSV', 'tenSV', 'lopSV')
    search_fields = ('maSV', 'tenSV')
    list_filter = ('lopSV',)

@admin.register(HocKy)
class HocKyAdmin(admin.ModelAdmin):
    list_display = ('ma_hoc_ky', 'ten_hoc_ky', 'nam_hoc', 'hoc_ky', 'isActive', 'ngay_bat_dau', 'ngay_ket_thuc')
    search_fields = ('ma_hoc_ky', 'ten_hoc_ky')
    list_filter = ('nam_hoc', 'hoc_ky', 'isActive')
    ordering = ('-nam_hoc', '-hoc_ky')
