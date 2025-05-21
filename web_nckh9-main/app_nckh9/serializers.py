from rest_framework import serializers
from .models import (
    SinhVienTDG, StudentsReport, Nofitication, InfoStudent,
    HocKy, HistoryPoint, PendingStudents
)

class ScoreSerializer(serializers.ModelSerializer):
    """
    Serializer cho model SinhVienTDG (Sinh viên tự đánh giá)
    """
    class Meta:
        model = SinhVienTDG
        fields = '__all__'

class AppealSerializer(serializers.ModelSerializer):
    """
    Serializer cho model StudentsReport (Báo cáo/khiếu nại của sinh viên)
    """
    class Meta:
        model = StudentsReport
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer cho model Notification (Thông báo)
    """
    class Meta:
        model = Nofitication
        fields = '__all__'

class HocKySerializer(serializers.ModelSerializer):
    """
    Serializer cho model HocKy (Học kỳ)
    """
    class Meta:
        model = HocKy
        fields = '__all__'
        
    def validate(self, data):
        # Kiểm tra xem ngày bắt đầu phải trước ngày kết thúc
        if data['ngayBatDau'] >= data['ngayKetThuc']:
            raise serializers.ValidationError("Ngày bắt đầu phải trước ngày kết thúc")
            
        # Nếu là học kỳ active, kiểm tra xem có học kỳ active khác không
        if data.get('isActive'):
            active_semester = HocKy.objects.filter(isActive=True).first()
            if active_semester and active_semester.id != getattr(self.instance, 'id', None):
                raise serializers.ValidationError("Đã có học kỳ đang active")
        return data

class HistoryPointSerializer(serializers.ModelSerializer):
    """
    Serializer cho model HistoryPoint (Lịch sử điểm) với thông tin học kỳ và sinh viên
    """
    semester = HocKySerializer(read_only=True)
    student = serializers.SerializerMethodField()

    class Meta:
        model = HistoryPoint
        fields = '__all__'

    def get_student(self, obj):
        return {
            'maSV': obj.emailSV.maSV,
            'tenSV': obj.emailSV.tenSV,
            'lopSV': obj.emailSV.lopSV
        }

class PendingStudentSerializer(serializers.ModelSerializer):
    """
    Serializer cho model PendingStudents (Sinh viên chờ duyệt)
    """
    class Meta:
        model = PendingStudents
        fields = '__all__'
