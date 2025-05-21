from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Avg
from .models import (
    SinhVienTDG, StudentsReport, Nofitication, HocKy,
    HistoryPoint, PendingStudents, InfoTeacher, InfoStudent
)
from .serializers import (
    ScoreSerializer, AppealSerializer, NotificationSerializer,
    HocKySerializer, HistoryPointSerializer, PendingStudentSerializer
)
from .auth_serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class TeacherViewSet(viewsets.ModelViewSet):
    """Quản lý thông tin giáo viên và lớp phụ trách"""
    queryset = InfoTeacher.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return self.queryset
        return self.queryset.filter(emailCoVan=self.request.user.email)

class ScoreManagementViewSet(viewsets.ModelViewSet):
    """Quản lý điểm của sinh viên"""
    queryset = SinhVienTDG.objects.all()
    serializer_class = ScoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return self.queryset
        try:
            teacher = InfoTeacher.objects.get(emailCoVan=self.request.user.email)
            return self.queryset.filter(lopSV=teacher.lopCoVan)
        except:
            return self.queryset.none()

class TeacherAnalyticsViewSet(viewsets.ViewSet):
    """Phân tích dữ liệu điểm cho giáo viên"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def class_statistics(self, request):
        """Thống kê điểm theo lớp"""
        try:
            teacher = InfoTeacher.objects.get(emailCoVan=request.user.email)
            scores = SinhVienTDG.objects.filter(lopSV=teacher.lopCoVan)
            
            stats = {
                'total_students': scores.count(),
                'average_score': scores.aggregate(Avg('drl_tongket'))['drl_tongket__avg'],
                'by_grade': {
                    'Xuất sắc': scores.filter(xepLoai='Xuất sắc').count(),
                    'Tốt': scores.filter(xepLoai='Tốt').count(),
                    'Khá': scores.filter(xepLoai='Khá').count(),
                    'Trung bình': scores.filter(xepLoai='Trung bình').count(),
                    'Yếu': scores.filter(xepLoai='Yếu').count(),
                    'Kém': scores.filter(xepLoai='Kém').count(),
                }
            }
            return Response(stats)
        except InfoTeacher.DoesNotExist:
            return Response(
                {'error': 'Không tìm thấy thông tin giáo viên'}, 
                status=status.HTTP_404_NOT_FOUND
            )

class UserManagementViewSet(viewsets.ModelViewSet):
    """Quản lý người dùng hệ thống"""
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        model = self.request.query_params.get('model', 'student')
        if model == 'teacher':
            return InfoTeacher.objects.all()
        return InfoStudent.objects.all()

class ScoringRulesViewSet(viewsets.ViewSet):
    """Quản lý quy định chấm điểm"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def current_rules(self, request):
        """Lấy quy định chấm điểm hiện tại"""
        rules = {
            'academic': {
                'max_score': 30,
                'items': [
                    {'id': 'kqHocTap', 'name': 'Kết quả học tập', 'max': 20},
                    {'id': 'diemNCKH', 'name': 'Điểm NCKH', 'max': 10}
                ]
            },
            'discipline': {
                'max_score': 25,
                'items': [
                    {'id': 'koVPKL', 'name': 'Không vi phạm kỷ luật', 'score': 10},
                    {'id': 'diemCDSV', 'name': 'Điểm công dân sinh viên', 'max': 15}
                ]
            },
            # Thêm các quy định khác
        }
        return Response(rules)

class BatchApprovalViewSet(viewsets.ViewSet):
    """Xử lý phê duyệt hàng loạt"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def approve_selected(self, request):
        """Phê duyệt nhiều sinh viên cùng lúc"""
        student_ids = request.data.get('student_ids', [])
        try:
            pending = PendingStudents.objects.filter(id__in=student_ids)
            for p in pending:
                HistoryPoint.objects.create(
                    emailSV=p.sinhVien,
                    hocky=HocKy.objects.get(isActive=True),
                    drl_tongket=p.drl_tongket,
                    xepLoai=p.xepLoai
                )
            pending.delete()
            return Response({'status': f'Đã phê duyệt {len(student_ids)} sinh viên'})
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class HocKyViewSet(viewsets.ModelViewSet):
    queryset = HocKy.objects.all()
    serializer_class = HocKySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy', 'set_active']:
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def set_active(self, request, pk=None):
        """Thiết lập học kỳ làm học kỳ hiện tại"""
        hoc_ky = self.get_object()
        HocKy.objects.filter(isActive=True).update(isActive=False)
        hoc_ky.isActive = True
        hoc_ky.save()
        return Response({'status': 'Đã cập nhật học kỳ hiện tại'})

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Lấy thông tin học kỳ hiện tại"""
        hoc_ky = HocKy.objects.filter(isActive=True).first()
        if not hoc_ky:
            return Response(
                {'error': 'Không có học kỳ hiện tại'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(hoc_ky)
        return Response(serializer.data)

class HistoryPointViewSet(viewsets.ModelViewSet):
    queryset = HistoryPoint.objects.all()
    serializer_class = HistoryPointSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.is_superuser or user.is_staff:
            return queryset
            
        if hasattr(user, 'email'):
            try:
                teacher = InfoTeacher.objects.get(emailCoVan=user.email)
                return queryset.filter(student__lopSV=teacher.lopCoVan)
            except InfoTeacher.DoesNotExist:
                return queryset.filter(emailSV__emailSV=user.email)
        return queryset.none()

    @action(detail=False, methods=['get'])
    def by_semester(self, request):
        """Lấy điểm theo học kỳ"""
        semester_id = request.query_params.get('semester_id')
        if not semester_id:
            return Response(
                {'error': 'Thiếu semester_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(hocky_id=semester_id)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Thống kê điểm theo học kỳ"""
        semester_id = request.query_params.get('semester_id')
        queryset = self.get_queryset()
        
        if semester_id:
            queryset = queryset.filter(hocky_id=semester_id)
            
        stats = {
            'total': queryset.count(),
            'average': queryset.aggregate(Avg('drl_tongket'))['drl_tongket__avg'],
            'by_grade': {
                'Xuất sắc': queryset.filter(xepLoai='Xuất sắc').count(),
                'Tốt': queryset.filter(xepLoai='Tốt').count(),
                'Khá': queryset.filter(xepLoai='Khá').count(),
                'Trung bình': queryset.filter(xepLoai='Trung bình').count(),
                'Yếu': queryset.filter(xepLoai='Yếu').count(),
                'Kém': queryset.filter(xepLoai='Kém').count(),
            }
        }
        return Response(stats)

class PendingStudentViewSet(viewsets.ModelViewSet):
    queryset = PendingStudents.objects.all()
    serializer_class = PendingStudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.is_superuser or user.is_staff:
            return queryset
            
        if hasattr(user, 'email'):
            try:
                teacher = InfoTeacher.objects.get(emailCoVan=user.email)
                return queryset.filter(lopSV=teacher.lopCoVan)
            except InfoTeacher.DoesNotExist:
                return queryset.filter(emailSV=user.email)
        return queryset.none()

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Phê duyệt sinh viên chờ đánh giá"""
        pending = self.get_object()
        
        # Tạo bản ghi HistoryPoint mới
        history = HistoryPoint.objects.create(
            emailSV=pending.sinhVien,
            hocky=HocKy.objects.get(isActive=True),
            drl_tongket=pending.drl_tongket,
            xepLoai=pending.xepLoai
        )
        
        # Xóa bản ghi pending
        pending.delete()
        
        return Response({'status': 'Đã phê duyệt'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Từ chối sinh viên chờ đánh giá"""
        pending = self.get_object()
        reason = request.data.get('reason', '')
        
        # Gửi thông báo cho sinh viên
        Notification.objects.create(
            title=f'Điểm rèn luyện bị từ chối',
            content=f'Lý do: {reason}',
            dob=timezone.now(),
            student=pending.sinhVien
        )
        
        # Xóa bản ghi pending
        pending.delete()
        
        return Response({'status': 'Đã từ chối'})