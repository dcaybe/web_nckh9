import os
from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse, FileResponse
from django.contrib import messages
from django.contrib.auth import login, logout, authenticate, get_user_model
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.urls import reverse
from django.contrib.auth.hashers import make_password
from app_nckh9.models import *
from django.db.models.functions import Coalesce
from app_nckh9.forms import *

User = get_user_model()
import json
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import (
    ScoreSerializer, AppealSerializer, NotificationSerializer
)
from .auth_serializers import (
    CustomTokenObtainPairSerializer, UserSerializer
)
from .export_serializers import (
    ExportDataSerializer, SyncDataSerializer,
    ExportProgressSerializer, SyncProgressSerializer
)
from celery import shared_task

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_api(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Đăng xuất thành công'}, status=status.HTTP_200_OK)
    except Exception:
        return Response({'error': 'Token không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

# Authentication Views
def login_view(request):
    # Nếu user đã đăng nhập, redirect dựa vào user type
    if request.user.is_authenticated:
        if request.user.is_superuser or request.user.is_staff:
            return redirect('app_nckh9:admin_dashboard')
        try:
            if hasattr(request.user, 'email'):
                teacher = InfoTeacher.objects.get(emailCoVan=request.user.email)
                return redirect('app_nckh9:teacher_dashboard')
        except InfoTeacher.DoesNotExist:
            return redirect('app_nckh9:student_dashboard')
            
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            # Sau khi login thành công, redirect dựa vào user type
            if user.is_superuser or user.is_staff:
                return redirect('app_nckh9:admin_dashboard')
            try:
                if hasattr(user, 'email'):
                    teacher = InfoTeacher.objects.get(emailCoVan=user.email)
                    return redirect('app_nckh9:teacher_dashboard')
            except InfoTeacher.DoesNotExist:
                return redirect('app_nckh9:student_dashboard')
        else:
            messages.error(request, 'Username hoặc mật khẩu không đúng')
    
    return render(request, 'homepage/index.html')

def logout_view(request):
    logout(request)
    return redirect('app_nckh9:login')


def reset_password(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Build reset URL
            reset_url = request.build_absolute_uri(
                reverse('app_nckh9:password_reset_confirm', kwargs={
                    'uidb64': uid,
                    'token': token
                })
            )
            
            # Send email
            send_mail(
                subject='Đặt lại mật khẩu - HUMG',
                message=f'Để đặt lại mật khẩu, vui lòng truy cập liên kết sau:\n\n{reset_url}\n\n'
                       f'Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.',
                from_email='noreply@humg.edu.vn',
                recipient_list=[email],
                fail_silently=False,
            )
            
            messages.success(
                request,
                'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. '
                'Vui lòng kiểm tra hộp thư.'
            )
            
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist
            messages.success(
                request,
                'Nếu địa chỉ email này tồn tại trong hệ thống, '
                'bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.'
            )
        except Exception as e:
            messages.error(
                request,
                'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.'
            )
        
        return redirect('app_nckh9:login')
        
    return render(request, 'homepage/reset_password.html')






@login_required
def student_score_rating(request):
    user = request.user
    try:
        student = InfoStudent.objects.get(emailSV=user.email)
        
        if request.method == 'POST':
            # Lưu thông tin đánh giá
            score = SinhVienTDG (
                maSV=student.maSV,
                tenSV=student.tenSV,
                lopSV=student.lopSV,
                dob=student.dob,
                khoaSV=student.khoaSV,
                khoaHoc=student.khoaHoc,
                
                # Điểm học tập
                kqHocTap=int(request.POST.get('kqHocTap', 0)),
                diemNCKH=int(request.POST.get('diemNCKH', 0)),
                # koDungPhao=True,  
                # koDungPhao = request.POST.get('koDungPhao') == "True",
                koDungPhao='koDungPhao' in request.POST and '3' in request.POST.getlist('koDungPhao'),

                # koDiHocMuon=True, 
                # koDiHocMuon = request.POST.get('koDungPhao') == "True",
                koDiHocMuon='koDiHocMuon' in request.POST and '2' in request.POST.getlist('koDiHocMuon'),
                

                boThiOlympic='penalty' in request.POST and '-15' in request.POST.getlist('penalty'),
                tronHoc='penalty' in request.POST and '-2' in request.POST.getlist('penalty'),
                
                # Điểm nội quy
                koVPKL='koVPKL' in request.POST and '10' in request.POST.getlist('koVPKL'),
                diemCDSV=int(request.POST.get('diemCDSV', 0)),
                koThamgiaDaydu='koThamgiaDaydu' in request.POST and '-10' in request.POST.getlist('koThamgiaDaydu'),
                koDeoTheSV='koDeoTheSV' in request.POST and '-5' in request.POST.getlist('koDeoTheSV'),
                koSHL='koSHL' in request.POST and '-5' in request.POST.getlist('koSHL'),
                dongHPmuon='dongHPmuon' in request.POST and '-10' in request.POST.getlist('dongHPmuon'),
                
                # Điểm hoạt động
                thamgiaDayDu='thamgiaDayDu' in request.POST and '13' in request.POST.getlist('thamgiaDayDu'),
                thanhtichHoatDong=sum(int(x) for x in request.POST.getlist('thanhtichHoatDong', [])),
                thamgiaTVTS='thamgiaTVTS' in request.POST and '2' in request.POST.getlist('thamgiaTVTS'),
                koThamgiaDaydu2='koThamgiaDaydu2' in request.POST and '-5' in request.POST.getlist('koThamgiaDaydu2'),
                viphamVanHoaSV='viphamVanHoaSV' in request.POST and '-5' in request.POST.getlist('viphamVanHoaSV'),
                
                # Điểm công dân
                chaphanhDang='chaphanhDang' in request.POST and '10' in request.POST.getlist('chaphanhDang'),
                giupdoCongDong='giupdoCongDong' in request.POST and '5' in request.POST.getlist('giupdoCongDong'),
                gayMatDoanKet='gayMatDoanKet' in request.POST and '-5' in request.POST.getlist('gayMatDoanKet'),
                dongBHYTmuon='dongBHYTmuon' in request.POST and '-20' in request.POST.getlist('dongBHYTmuon'),
                
                # Điểm cán bộ lớp
                thanhvienBCS=sum(int(x) for x in request.POST.getlist('thanhvienBCS', [])),
                caccapKhenThuong='caccapKhenThuong' in request.POST and '3' in request.POST.getlist('caccapKhenThuong'),
                BCSvotrachnghiem='BCSvotrachnghiem' in request.POST and '-5' in request.POST.getlist('BCSvotrachnghiem'),
                
                # Minh chứng và ghi chú
                ghichu1=request.POST.get('ghichu1', ''),
                ghichu2=request.POST.get('ghichu2', ''),
                ghichu3=request.POST.get('ghichu3', ''),
                ghichu4=request.POST.get('ghichu4', ''),
                ghichu5=request.POST.get('ghichu5', ''),
                ghichu6=request.POST.get('ghichu6', ''),
                ghichu7=request.POST.get('ghichu7', ''),
                ghichu8=request.POST.get('ghichu8', ''),
            )

            # Xử lý file minh chứng
            # Xử lý file minh chứng
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
            max_size = 5 * 1024 * 1024  # 5MB

            for i in range(1, 11):
                file_key = f'anhminhchung{i}'
                if file_key in request.FILES:
                    file = request.FILES[file_key]

                    # Kiểm tra định dạng file
                    if file.content_type not in allowed_types:
                        messages.error(request, f'File {file_key} không đúng định dạng. Chỉ chấp nhận ảnh hoặc PDF.')
                        return render(request, 'students/score_rating.html', {'student': student})

                    # Kiểm tra kích thước file
                    if file.size > max_size:
                        messages.error(request, f'File {file_key} quá lớn. Kích thước tối đa là 5MB.')
                        return render(request, 'students/score_rating.html', {'student': student})

                    # Lưu file hợp lệ
                    setattr(score, file_key, file)
                    
            # Tính tổng điểm
            total = (
                int(score.kqHocTap) + int(score.diemNCKH) +
                (3 if score.koDungPhao else 0) +
                (2 if score.koDiHocMuon else 0) +
                (-15 if score.boThiOlympic else 0) +
                (-2 if score.tronHoc else 0) +
                (10 if score.koVPKL else 0) +
                int(score.diemCDSV) +
                (-10 if score.koThamgiaDaydu else 0) +
                (-5 if score.koDeoTheSV else 0) +
                (-5 if score.koSHL else 0) +
                (-10 if score.dongHPmuon else 0) +
                (13 if score.thamgiaDayDu else 0) +
                int(score.thanhtichHoatDong) +
                (2 if score.thamgiaTVTS else 0) +
                (-5 if score.koThamgiaDaydu2 else 0) +
                (-5 if score.viphamVanHoaSV else 0) +
                (10 if score.chaphanhDang else 0) +
                (5 if score.giupdoCongDong else 0) +
                (-5 if score.gayMatDoanKet else 0) +
                (-20 if score.dongBHYTmuon else 0) +
                int(score.thanhvienBCS) +
                (3 if score.caccapKhenThuong else 0) +
                (-5 if score.BCSvotrachnghiem else 0)
            )

            score.drl_tongket = max(0, min(100, total))  # Giới hạn trong khoảng 0-100
            
            # Xếp loại
            if score.drl_tongket >= 90:
                score.xepLoai = "Xuất sắc"
            elif score.drl_tongket >= 80:
                score.xepLoai = "Tốt"
            elif score.drl_tongket >= 65:
                score.xepLoai = "Khá"
            elif score.drl_tongket >= 50:
                score.xepLoai = "Trung bình"
            elif score.drl_tongket >= 35:
                score.xepLoai = "Yếu"
            else:
                score.xepLoai = "Kém"
            # lưu hoạt động
            HistoryActive.objects.create(
                maSV = student.maSV,
                time = timezone.now(),
                name = 'Chấm DRL',
                action = 'Chấm DRL',
                status = 'Chưa xem',
                description = 'Chấm điểm rèn luyện học kì 1',
                device = 'Chrome / Windows',
                ip = '192.168.1.100',
            )
            score.save()
            messages.success(request, f'Đã lưu điểm rèn luyện. Tổng điểm: {score.drl_tongket}, Xếp loại: {score.xepLoai}')
            return redirect('app_nckh9:student_dashboard')
            

        context = {
            'student': student,
            'today_date': timezone.now().strftime("%d/%m/%Y")
        }
        return render(request, 'students/score_rating.html', context)
    except InfoStudent.DoesNotExist:
        messages.error(request, 'Không tìm thấy thông tin sinh viên')
        return redirect('app_nckh9:student_dashboard')
@login_required
def view_score_rating(request):
    try:




        
        student = InfoStudent.objects.get(maSV = '2221050508')
        # Lấy tất cả điểm rèn luyện của sinh viên, sắp xếp theo thời gian tạo mới nhất
        scores = SinhVienTDG.objects.all()  # Giả sử id tăng dần theo thời gian tạo
        
        context = {
            'student': student,
            'scores': scores
        }
        return render(request, 'students/view_score_rating.html', context)
    except InfoStudent.DoesNotExist:
        messages.error(request, 'Không tìm thấy thông tin sinh viên')
        return redirect('app_nckh9:student_dashboard')

@login_required
def add_sinhvien_tdg(request):
    if request.method == 'POST':
        try:
            # Chuyển đổi dữ liệu form thành từng field riêng biệt
            ma_sv = request.POST.get('maSV')
            ten_sv = request.POST.get('tenSV')
            lop_sv = request.POST.get('lopSV')
            dob = request.POST.get('dob')
            khoa_sv = request.POST.get('khoaSV')
            khoa_hoc = int(request.POST.get('khoaHoc'))

            # Tạo instance mới của SinhVienTDG
            score = SinhVienTDG.objects.create(
                maSV=ma_sv,
                tenSV=ten_sv,
                lopSV=lop_sv,
                dob=dob,
                khoaSV=khoa_sv,
                khoaHoc=khoa_hoc,
                
                # Điểm học tập
                kqHocTap=int(request.POST.get('kqHocTap', 0)),
                diemNCKH=int(request.POST.get('diemNCKH', 0)),
                koDungPhao=request.POST.get('koDungPhao') == 'on',
                koDiHocMuon=request.POST.get('koDiHocMuon') == 'on',
                boThiOlympic=False,
                tronHoc=False,
                
                # Điểm nội quy
                koVPKL=request.POST.get('koVPKL') == 'on',
                diemCDSV=int(request.POST.get('diemCDSV', 0)),
                koThamgiaDaydu=False,
                koDeoTheSV=False,
                koSHL=False,
                dongHPmuon=False,
                
                # Điểm hoạt động
                thamgiaDayDu=request.POST.get('thamgiaDayDu') == 'on',
                thanhtichHoatDong=int(request.POST.get('thanhtichHoatDong', 0)),
                thamgiaTVTS=False,
                koThamgiaDaydu2=False,
                viphamVanHoaSV=False,
                
                # Điểm công dân
                chaphanhDang=True,
                giupdoCongDong=False,
                gayMatDoanKet=False,
                dongBHYTmuon=False,
                
                # Điểm cán bộ lớp
                thanhvienBCS=0,
                caccapKhenThuong=False,
                BCSvotrachnghiem=False,
                
                # Ghi chú
                ghichu1=request.POST.get('ghichu1', ''),
                ghichu2=request.POST.get('ghichu2', ''),
                ghichu3=request.POST.get('ghichu3', ''),
                ghichu4=request.POST.get('ghichu4', ''),
                ghichu5=request.POST.get('ghichu5', ''),
                ghichu6=request.POST.get('ghichu6', ''),
                ghichu7=request.POST.get('ghichu7', ''),
                ghichu8=request.POST.get('ghichu8', '')
            )

            # Xử lý file minh chứng
            if 'anhminhchung1' in request.FILES:
                score.anhminhchung1 = request.FILES['anhminhchung1']
            if 'anhminhchung2' in request.FILES:
                score.anhminhchung2 = request.FILES['anhminhchung2']
            if 'anhminhchung3' in request.FILES:
                score.anhminhchung3 = request.FILES['anhminhchung3']
            if 'anhminhchung4' in request.FILES:
                score.anhminhchung4 = request.FILES['anhminhchung4']
            if 'anhminhchung5' in request.FILES:
                score.anhminhchung5 = request.FILES['anhminhchung5']
            if 'anhminhchung6' in request.FILES:
                score.anhminhchung6 = request.FILES['anhminhchung6']
            if 'anhminhchung7' in request.FILES:
                score.anhminhchung7 = request.FILES['anhminhchung7']

            # Tính tổng điểm
            total = (
                int(score.kqHocTap) + int(score.diemNCKH) +
                (3 if score.koDungPhao else 0) +
                (2 if score.koDiHocMuon else 0) +
                (-15 if score.boThiOlympic else 0) +
                (-2 if score.tronHoc else 0) +
                (10 if score.koVPKL else 0) +
                int(score.diemCDSV) +
                (-10 if score.koThamgiaDaydu else 0) +
                (-5 if score.koDeoTheSV else 0) +
                (-5 if score.koSHL else 0) +
                (-10 if score.dongHPmuon else 0) +
                (13 if score.thamgiaDayDu else 0) +
                int(score.thanhtichHoatDong) +
                (2 if score.thamgiaTVTS else 0) +
                (-5 if score.koThamgiaDaydu2 else 0) +
                (-5 if score.viphamVanHoaSV else 0) +
                (10 if score.chaphanhDang else 0) +
                (5 if score.giupdoCongDong else 0) +
                (-5 if score.gayMatDoanKet else 0) +
                (-20 if score.dongBHYTmuon else 0) +
                int(score.thanhvienBCS) +
                (3 if score.caccapKhenThuong else 0) +
                (-5 if score.BCSvotrachnghiem else 0)
            )

            score.drl_tongket = max(0, min(100, total))
            
            # Xếp loại
            if score.drl_tongket >= 90:
                score.xepLoai = "Xuất sắc"
            elif score.drl_tongket >= 80:
                score.xepLoai = "Tốt"
            elif score.drl_tongket >= 65:
                score.xepLoai = "Khá"
            elif score.drl_tongket >= 50:
                score.xepLoai = "Trung bình"
            elif score.drl_tongket >= 35:
                score.xepLoai = "Yếu"
            else:
                score.xepLoai = "Kém"

            score.save()
            messages.success(request, f'Đã thêm điểm rèn luyện cho sinh viên {score.tenSV}. Tổng điểm: {score.drl_tongket}, Xếp loại: {score.xepLoai}')
            return redirect('app_nckh9:admin_dashboard')

        except Exception as e:
            messages.error(request, f'Lỗi khi thêm điểm: {str(e)}')
            return redirect('app_nckh9:add_sinhvien_tdg')

    return render(request, 'students/add_sinhvien_tdg.html')

# @login_required
# def student_historic_fix(request):
#     try:
#         student = InfoStudent.objects.get(emailSV=request.user.email)
#         history = ScoreHistory.objects.filter(student=student).order_by('-modified_date')
#         context = {
#             'student': student,
#             'history': history,
#             'today_date': timezone.now().strftime("%d/%m/%Y")
#         }
#         return render(request, 'students/historic_fix.html', context)
#     except InfoStudent.DoesNotExist:
#         messages.error(request, 'Không tìm thấy thông tin sinh viên')
#         return redirect('app_nckh9:student_dashboard')

# Teacher Views
# @login_required
# def teacher_dashboard(request):
#     try:
#         teacher = InfoTeacher.objects.get(emailGV=request.user.email)
#         context = {
#             'teacher': teacher,
#             'stats': TeacherManager.objects.first()
#         }
#         return render(request, 'teacher/dashboard.html', context)
#     except InfoTeacher.DoesNotExist:
#         messages.error(request, 'Không tìm thấy thông tin giảng viên')
#         return redirect('app_nckh9:login')

# @login_required
# def teacher_class_management(request):
#     teacher = InfoTeacher.objects.get(emailGV=request.user.email)
#     students = InfoStudent.objects.filter(lopSV__in=teacher.lopGV.split(','))
#     context = {'students': students}
#     return render(request, 'teacher/class-management.html', context)

# @login_required
# def teacher_score_management(request):
#     if request.method == 'POST':
#         student_id = request.POST.get('student_id')
#         points = request.POST.get('points')
#         student = GVCNDanhGia.objects.get(maSV=student_id)
#         student.drl_tongket = points
#         student.save()
#         return JsonResponse({'status': 'success'})
    
#     teacher = InfoTeacher.objects.get(emailGV=request.user.email)
#     students = GVCNDanhGia.objects.filter(lopSV__in=teacher.lopGV.split(','))
#     context = {'students': students}
#     return render(request, 'teacher/score-management.html', context)

# @login_required
# def teacher_analytics(request):
#     analytics = Analysts.objects.first()
#     context = {
#         'analytics': analytics,
#         'charts': json.dumps({
#             'phanboDRL': analytics.phanboDRL,
#             'xuhuongDiem': analytics.xuhuongDiem,
#             'phantichTieuchi': analytics.phantichTieuchi,
#             'compareClass': analytics.compareClass
#         })
#     }
#     return render(request, 'teacher/analytics.html', context)

# @login_required
# def teacher_activity_history(request):
#     activities = HistoryActive.objects.all().order_by('-time')
#     context = {'activities': activities}
#     return render(request, 'teacher/activity-history.html', context)

# Admin Views
@login_required
def admin_dashboard(request):
    stats = HomepageManager.objects.first()
    activities = HistoryActive.objects.all().order_by('-time')[:10]  # Lấy 10 hoạt động gần nhất
    
    context = {
        'stats': stats,
        'activities': activities,
        'user': request.user,
        'today_date': timezone.now().strftime("%d/%m/%Y")
    }
    return render(request, 'admin/dashboard.html', context)

@login_required
def admin_user_management(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        user_id = request.POST.get('user_id')
        user = AdminManage.objects.get(id=user_id)
        
        if action == 'activate':
            user.status = 'active'
        elif action == 'deactivate':
            user.status = 'inactive'
            
        user.save()
        return JsonResponse({'status': 'success'})
    
    users = AdminManage.objects.all()
    context = {'users': users}
    return render(request, 'admin/user-management.html', context)

@login_required
def admin_scoring_rules(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        Rules.objects.create(title=title, content=content)
        return JsonResponse({'status': 'success'})
    
    rules = Rules.objects.all()
    context = {'rules': rules}
    return render(request, 'admin/scoring-rules.html', context)

@login_required
def admin_backup_restore(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'backup':
            # Implement backup logic
            pass
        elif action == 'restore':
            # Implement restore logic
            pass
    return render(request, 'admin/backup-restore.html')

@login_required
def admin_statistics(request):
    context = {
        'analytics': Analysts2.objects.first()
    }
    return render(request, 'admin/statistics.html', context)

@login_required
def admin_sync(request):
    if request.method == 'POST':
        # Implement sync logic here
        return JsonResponse({'status': 'success'})
    return render(request, 'admin/sync.html')

@login_required
def admin_notifications(request):
    notifications = AdminNotification.objects.all().order_by('-created_at')
    context = {'notifications': notifications}
    return render(request, 'admin/notifications.html', context)

@login_required
def admin_batch_approval(request):
    if request.method == 'POST':
        # Implement batch approval logic here
        return JsonResponse({'status': 'success'})
    
    pending_items = BatchApprovalQueue.objects.filter(status='pending')
    context = {'pending_items': pending_items}
    return render(request, 'admin/batch-approval.html', context)

@login_required
def admin_activity_history(request):
    activities = AdminActivity.objects.all().order_by('-timestamp')
    context = {'activities': activities}
    return render(request, 'admin/activity-history.html', context)

# AI Assistant Views
@login_required
def chat_view(request):
    if not request.user.is_authenticated:
        return redirect('app_nckh9:login')
    return render(request, 'chat/index.html')

@login_required
def chat_send(request):
    if request.method == 'POST':
        try:
            message = request.POST.get('message')
            chatbot = KairaChatBot.objects.first()
            if not chatbot:
                return JsonResponse({
                    'response': 'Xin lỗi, hệ thống AI đang được bảo trì. Vui lòng thử lại sau.'
                })
            response = chatbot.get_response(message)
            return JsonResponse({'response': response})
        except Exception as e:
            return JsonResponse({
                'response': 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.'
            })
    return JsonResponse({'error': 'Invalid request'}, status=400)

# API Views
class ScoreListCreateAPIView(generics.ListCreateAPIView):
    queryset = SinhVienTDG.objects.all()
    serializer_class = ScoreSerializer

class ScoreRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SinhVienTDG.objects.all()
    serializer_class = ScoreSerializer

class AppealListCreateAPIView(generics.ListCreateAPIView):
    queryset = StudentsReport.objects.all()
    serializer_class = AppealSerializer

class AppealRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentsReport.objects.all()
    serializer_class = AppealSerializer

class NotificationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Nofitication.objects.all()
    serializer_class = NotificationSerializer

class NotificationRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Nofitication.objects.all()
    serializer_class = NotificationSerializer

@api_view(['POST'])
def mark_notification_as_read(request, pk):
    try:
        notification = Nofitication.objects.get(pk=pk)
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})
    except Nofitication.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)
    

def admin_backup_restore(request):
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'create_backup':
            # Logic tạo bản sao lưu
            return JsonResponse({'status': 'success', 'message': 'Bản sao lưu đã được tạo thành công!'})
        elif action == 'restore_backup':
            backup_id = request.POST.get('backup_id')
            # Logic khôi phục bản sao lưu
            return JsonResponse({'status': 'success', 'message': f'Khôi phục bản sao lưu {backup_id} thành công!'})
        elif action == 'delete_backup':
            backup_id = request.POST.get('backup_id')
            # Logic xóa bản sao lưu
            return JsonResponse({'status': 'success', 'message': f'Bản sao lưu {backup_id} đã bị xóa!'})
        elif action == 'save_settings':
            frequency = request.POST.get('frequency')
            time = request.POST.get('time')
            max_backups = request.POST.get('max_backups')
            # Logic lưu cài đặt sao lưu tự động
            return JsonResponse({'status': 'success', 'message': 'Cài đặt đã được lưu!'})

    # Dữ liệu giả lập để hiển thị trong giao diện
    backups = [
        {'id': '20240220_153000', 'time': '20/02/2024 15:30', 'type': 'Tự động', 'size': '500 MB', 'status': 'Hoàn thành'},
        {'id': '20240219_120000', 'time': '19/02/2024 12:00', 'type': 'Thủ công', 'size': '450 MB', 'status': 'Hoàn thành'},
    ]
    context = {
        'backups': backups,
        'last_backup': '20/02/2024 15:30',
        'used_space': '2.5 GB',
        'total_backups': len(backups),
    }
    return render(request, 'admin/backup-restore.html', context)


@login_required
def admin_batch_approval(request):
   
    return render(request, 'admin/batch-approval.html')

@login_required
def admin_notifications(request):
   
    return render(request, 'admin/notifications.html')

@login_required
def admin_ai_assistant(request):
   
    return render(request, 'admin/ai-assistant.html')

@login_required
def admin_activity_history(request):
   
    return render(request, 'admin/activity-history.html')

#student clone view




def student_show_point(request):
    sinhvien = InfoStudent.objects.filter(maSV="2221050508").first()
    if not sinhvien:
        messages.error(request, "Không tìm thấy thông tin sinh viên.")
        return redirect('app_nckh9:student_dashboard')
    
    historic_points = []
    trend_labels = []
    trend_scores = []
    
    history = HistoryPoint.objects.filter(maSV="2221050508").first()
    if history:
        for i in range(1, 21):
            score = getattr(history, f"hocky{i}", None)
            if score is not None:
                # Tạo nhãn và điểm cho biểu đồ
                semester_label = f"Học kỳ {i}"
                nam = ((i - 1) // 2) + 1  # Năm học (1-5)
                hk = 1 if i % 2 != 0 else 2  # Học kỳ lẻ (HK1), chẵn (HK2)
                trend_labels.append(f"HK{hk}-N{nam}")
                trend_scores.append(score)  

                # Tạo dữ liệu historic_points
                historic_points.append((semester_label, score))
    current_semester = historic_points[-1] if historic_points else None
        # Sau khi đã tạo historic_points
    avg_score = None
    if historic_points:
        total_score = sum(score for _, score in historic_points)
        avg_score = round(total_score / len(historic_points))  # Làm tròn 2 chữ số thập phân

    return render(request, 'students/show_point.html', {
        'sinhvien': sinhvien,
        'historic_points': historic_points,
        'trend_labels': trend_labels,
        'trend_scores': trend_scores,
        'current_semester': current_semester,
        'avg_score': avg_score
    })




def student_ai_assistant(request):
   
    return render(request, 'students/ai-assistant.html')

# def student_score_rating(request):
#     return render(request, 'students/score_rating.html')

def student_appeal(request):
   
    return render(request,'students/appeal.html')
@login_required
def student_historic_fix(request):
        user = request.user
        student = InfoStudent.objects.get(emailSV = user.email)
        historic_fixs = HistoryActive.objects.filter(maSV = student.maSV)
        context = {
            'student': student,
            'historic_fixs': historic_fixs,
        }
        return render(request,'students/historic_fix.html',context)


# def student_notifications(request):
#     sinhvien = InfoStudent.objects.filter(maSV="2221050508").first()
#     notifications = Notification.objects.all().order_by('-dob')
#     return render(request, 'students/notification.html', {'notifications': notifications, 'sinhvien': sinhvien})

def student_notifications(request):
    sinhvien = InfoStudent.objects.filter(maSV="2221050508").first()
    notifications = Nofitication.objects.all().order_by('-dob')
    return render(request, 'students/notification.html', {'notifications': notifications, 'sinhvien': sinhvien})


def student_rank(request):
    sinhvien = InfoStudent.objects.filter(maSV="2221050508").first()
    rankings = HistoryPoint.objects.filter(hocky1__isnull=False).order_by('-hocky1')
    top3 = rankings[:3]
    others = rankings[3:]
    return render(request, 'students/rank.html', {
        'top3': top3,
        'others': others,
        'sinhvien': sinhvien
    })
# def student_appeal_again(request):
   
#     return render(request,'students/appeal_again.html')
@login_required
def student_appeal_again(request):
    user = request.user
    try:
        student = InfoStudent.objects.get(emailSV=user.email)

        if request.method == 'POST':
            title = request.POST.get('title')
            content = request.POST.get('content')
            evidence = request.FILES.get('evidence')
            semester_id = request.POST.get('semester')
            semester = HocKy.objects.get(pk=semester_id)

            report = StudentsReport(
                title=title,
                content=content,
                student=student,
                semester=semester,
                evidence=evidence
            )
            report.save()
            messages.success(request, 'Đơn phúc khảo của bạn đã được gửi thành công!')
            return redirect('app_nckh9:student_dashboard')

        context = {
            'student': student,
            'semesters': HocKy.objects.all()
        }
        return render(request, 'students/appeal_again.html', context)
    except InfoStudent.DoesNotExist:
        messages.error(request, 'Không tìm thấy thông tin sinh viên')
        return redirect('app_nckh9:student_dashboard')

# teacher clone view
@login_required
def teacher_dashboard(request):
    try:
        teacher = InfoTeacher.objects.get(emailCoVan=request.user.email)
        context = {
            'teacher': teacher,
            'stats': TeacherManager.objects.first()
        }
        return render(request, 'teacher/dashboard.html', context)
    except InfoTeacher.DoesNotExist:
        messages.error(request, 'Không tìm thấy thông tin giảng viên')
        return redirect('app_nckh9:login')
        
# Export và Sync Data API Endpoints
@api_view(['POST'])
@login_required
def initiate_export(request):
    """Khởi tạo quá trình export data"""
    serializer = ExportDataSerializer(data=request.data)
    if serializer.is_valid():
        task = AsyncExportTask.objects.create(
            format=serializer.validated_data['format'],
            data_type=serializer.validated_data['data_type'],
            start_date=serializer.validated_data.get('start_date'),
            end_date=serializer.validated_data.get('end_date'),
            include_fields=serializer.validated_data.get('include_fields', [])
        )
        # Bắt đầu task export bất đồng bộ
        export_data.delay(task.id)
        return Response({
            'task_id': task.id,
            'message': 'Export đã được khởi tạo'
        }, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@login_required
def export_progress(request, task_id):
    """Kiểm tra tiến trình của export task"""
    try:
        task = AsyncExportTask.objects.get(id=task_id)
        serializer = ExportProgressSerializer(task)
        return Response(serializer.data)
    except AsyncExportTask.DoesNotExist:
        return Response({'error': 'Task không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@login_required
def download_export(request, task_id):
    """Download file đã export"""
    try:
        task = AsyncExportTask.objects.get(id=task_id)
        if task.status != 'completed':
            return Response({'error': 'Export chưa hoàn thành'}, status=status.HTTP_400_BAD_REQUEST)
            
        file_path = task.file_path
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename=export_{task_id}.{task.format}'
            return response
        return Response({'error': 'File không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
    except AsyncExportTask.DoesNotExist:
        return Response({'error': 'Task không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@login_required
def initiate_sync(request):
    """Khởi tạo quá trình sync data"""
    serializer = SyncDataSerializer(data=request.data)
    if serializer.is_valid():
        task = AsyncSyncTask.objects.create(
            sync_type=serializer.validated_data['sync_type'],
            source_system=serializer.validated_data['source_system'],
            data_type=serializer.validated_data['data_type'],
            last_sync_time=serializer.validated_data.get('last_sync_time')
        )
        # Bắt đầu task sync bất đồng bộ
        sync_data.delay(task.id)
        return Response({
            'task_id': task.id,
            'message': 'Sync đã được khởi tạo'
        }, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@login_required
def sync_progress(request, task_id):
    """Kiểm tra tiến trình của sync task"""
    try:
        task = AsyncSyncTask.objects.get(id=task_id)
        serializer = SyncProgressSerializer(task)
        return Response(serializer.data)
    except AsyncSyncTask.DoesNotExist:
        return Response({'error': 'Task không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@login_required
def sync_errors(request, task_id):
    """Lấy danh sách lỗi của sync task"""

def password_reset_confirm(request, uidb64, token):
    try:
        # Get user from uid
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)

        # Verify token
        if default_token_generator.check_token(user, token):
            if request.method == 'POST':
                # Get new password
                password = request.POST.get('password')
                confirm_password = request.POST.get('confirm_password')
                
                if password != confirm_password:
                    messages.error(request, 'Mật khẩu không khớp')
                    return render(request, 'homepage/reset_password_confirm.html')
                    
                # Update password
                user.password = make_password(password)
                user.save()
                
                messages.success(request, 'Mật khẩu đã được đặt lại thành công')
                return redirect('app_nckh9:login')
                
            return render(request, 'homepage/reset_password_confirm.html')
            
        messages.error(
            request,
            'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn'
        )
        return redirect('app_nckh9:reset_password')
        
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        messages.error(
            request,
            'Liên kết đặt lại mật khẩu không hợp lệ'
        )
        return redirect('app_nckh9:reset_password')
    try:
        task = AsyncSyncTask.objects.get(id=task_id)
        return Response({
            'errors': task.errors,
            'total_records': task.total_records,
            'failed_records': task.failed_records
        })
    except AsyncSyncTask.DoesNotExist:
        return Response({'error': 'Task không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        return render(request, 'teacher/dashboard.html', context)
    except InfoTeacher.DoesNotExist:
        messages.error(request, 'Không tìm thấy thông tin giảng viên')
        return redirect('app_nckh9:login')

def teacher_class_management(request):
   
    return render(request,'teacher/class-management.html')

def teacher_analytics(request):
   
    return render(request,'teacher/analytics.html')

def teacher_score_management(request):
   
    return render(request,'teacher/score-management.html')

def teacher_activity_history(request):
   
    return render(request,'teacher/activity-history.html')

def teacher_notifications(request):
   
    return render(request,'teacher/notifications.html')

def teacher_ai_assistant(request):
   
    return render(request,'teacher/ai-assistant.html')
from django.shortcuts import render
from .models import SinhVienTDG, Ranking, Nofitication

# @login_required
# def student_dashboard(request):

#     # Lấy danh sách sinh viên
#     user = request.user
#     students = InfoStudent.objects.get(emailSV=user.email)
#     # Lấy danh sách xếp hạng
#     rankings = Ranking.objects.all()
#     xeploai = 'Đỉnh phong'
#     # Lấy thông báo
#     notifications = Nofitication.objects.all()
    # historic_points = []
    # trend_labels = []
    # trend_scores = []
    
    # history = HistoryPoint.objects.filter(emailSV=user.email)
    # if history:
    #     for i in range(1, 21):
    #         score = getattr(history, f"hocky{i}", None)
    #         if score is not None:
    #             # Tạo nhãn và điểm cho biểu đồ
    #             semester_label = f"Học kỳ {i}"
    #             nam = ((i - 1) // 2) + 1  # Năm học (1-5)
    #             hk = 1 if i % 2 != 0 else 2  # Học kỳ lẻ (HK1), chẵn (HK2)
    #             trend_labels.append(f"HK{hk}-N{nam}")
    #             trend_scores.append(score)  

    #             # Tạo dữ liệu historic_points
    #             historic_points.append((semester_label, score))
    # current_semester = historic_points[-1] if historic_points else None
    #     # Sau khi đã tạo historic_points
    # avg_score = None
    # if historic_points:
    #     total_score = sum(score for _, score in historic_points)
    #     avg_score = round(total_score / len(historic_points))  # Làm tròn 2 chữ số thập phân
    # # Truyền dữ liệu vào context
    # if avg_score >= 90:
    #     xeploai = "Xuất sắc"
    # elif avg_score >= 80:
    #     xeploai = "Tốt"
    # elif avg_score >= 65:
    #     xeploai = "Khá"
    # elif avg_score >= 50:
    #     xeploai = "Trung bình"
    # elif avg_score >= 35:
    #     xeploai = "Yếu"
    # else:
    #     xeploai = "Kém"
#     xeploai = 'tốt'
#     context = {
#         'historic_points': historic_points,
#         'trend_labels': trend_labels,
#         'trend_scores': trend_scores,
#         'current_semester': current_semester,
#         'avg_score': avg_score,
#         'students': students,
#         'rankings': rankings,
#         'notifications': notifications,
#         'xeploai':xeploai,
#     }
    
#     return render(request, 'students/dashboard.html', context)
from django.contrib.auth.decorators import login_required


from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from .models import SinhVienTDG, InfoTeacher, Ranking, Nofitication

@login_required
def student_dashboard(request):
    user = request.user

    # Lấy thông tin sinh viên đang đăng nhập
    current_student = InfoStudent.objects.filter(emailSV = user.email).first()
    # hoc_ki = HocKy.objects.filter(sinhvien=sinhvien)
    
    # Lấy danh sách xếp hạng và thông báo
    rankings = Ranking.objects.filter(maSV=request.user.id)
    notifications = Nofitication.objects.all()
    historic_points = []
    trend_labels = []
    trend_scores = []
    
    history = HistoryPoint.objects.filter(maSV="2221050508").first()
    if history:
        for i in range(1, 21):
            score = getattr(history, f"hocky{i}", None)
            if score is not None:
                # Tạo nhãn và điểm cho biểu đồ
                semester_label = f"Học kỳ {i}"
                nam = ((i - 1) // 2) + 1  # Năm học (1-5)
                hk = 1 if i % 2 != 0 else 2  # Học kỳ lẻ (HK1), chẵn (HK2)
                trend_labels.append(f"HK{hk}-N{nam}")
                trend_scores.append(score)  

                # Tạo dữ liệu historic_points
                historic_points.append((semester_label, score))
    current_semester = historic_points[-1] if historic_points else None
        # Sau khi đã tạo historic_points
    avg_score = None
    if historic_points:
        total_score = sum(score for _, score in historic_points)
        avg_score = round(total_score / len(historic_points))  # Làm tròn 2 chữ số thập phân

    if avg_score >= 90:
        xeploai = "Xuất sắc"
    elif avg_score >= 80:
        xeploai = "Tốt"
    elif avg_score >= 65:
        xeploai = "Khá"
    elif avg_score >= 50:
        xeploai = "Trung bình"
    elif avg_score >= 35:
        xeploai = "Yếu"
    else:
        xeploai = "Kém"
    # Truyền dữ liệu vào context
    context = {
        # 'hoc_ki': hoc_ki,
        'current_student': current_student,
        'rankings': rankings,
        'notifications': notifications,
        'xeploai':xeploai,
    }
    
    return render(request, 'students/dashboard.html', context)


@login_required
@login_required

@login_required
@login_required
@login_required
def add_hoc_ky(request):
    if request.method == 'POST':
        form = HocKyForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thêm học kỳ thành công.')
            return redirect('app_nckh9:student_dashboard')
        else:
            messages.error(request, 'Vui lòng kiểm tra lại thông tin.')
    else:
        form = HocKyForm()
    return render(request, 'students/add_hoc_ky.html', {'form': form})
def add_info_student(request):
    if request.method == 'POST':
        form = InfoStudentForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thêm thông tin sinh viên thành công.')
            return redirect('app_nckh9:student_dashboard')
        else:
            messages.error(request, 'Vui lòng kiểm tra lại thông tin.')
    else:
        form = InfoStudentForm()
    return render(request, 'students/add_info_student.html', {'form': form})
def view_sinhvien(request):
    sinhvien = InfoStudent.objects.filter(maSV="2221050508").first()
    if not sinhvien:
        messages.error(request, "Không tìm thấy thông tin sinh viên.")
        return redirect('app_nckh9:student_dashboard')
    return render(request, 'students/view_sinhvien.html', {'sinhvien': sinhvien})
def add_sinhvien_tdg(request):
    if request.method == 'POST':
        form = SinhVienTDGForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Thêm thông tin sinh viên thành công.')
            return redirect('app_nckh9:student_dashboard')
        else:
            messages.error(request, 'Vui lòng kiểm tra lại thông tin.')
    else:
        form = SinhVienTDGForm()
    return render(request, 'students/add_sinhvien_tdg.html', {'form': form})

from django.shortcuts import render, redirect
from .forms import HistoryPointForm


def history_point_list(request):
    history_points = HistoryPoint.objects.all()
    return render(request, 'students/history_point.html', {'history_points': history_points})

from django.shortcuts import render, redirect
from .forms import HistoryPointForm

def add_history_point(request):
    if request.method == 'POST':
        form = HistoryPointForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('app_nckh9:student_dashboard')  # Sử dụng namespace chính xác
    else:
        form = HistoryPointForm()
    return render(request, 'students/add_history_point.html', {'form': form})



def historic_point_view(request, maSV):
    student = InfoStudent.objects.filter(maSV=maSV).first()
    if not student:
        messages.error(request, "Không tìm thấy thông tin sinh viên.")
        return redirect('app_nckh9:student_dashboard')

    historic_points = []
    history = HistoryPoint.objects.filter(maSV=maSV).first()
    if history:
        for i in range(1, 21):
            score = getattr(history, f"hocky{i}", None)
            if score is not None:
                historic_points.append((f"Học kỳ {i}", score))

    return render(request, 'students/historic_point.html', {'historic_points': historic_points})

    if not student:
        messages.error(request, "Không tìm thấy thông tin sinh viên.")
        return redirect('app_nckh9:student_dashboard')

    historic_points = []
    history = HistoryPoint.objects.filter(maSV=maSV).first()
    if history:
        for i in range(1, 21):
            score = getattr(history, f"hocky{i}", None)
            if score is not None:
                historic_points.append((f"Học kỳ {i}", score))

    return render(request, 'students/historic_point.html', {'historic_points': historic_points})

from django.shortcuts import render, redirect
from .forms import NotificationForm

def add_notification(request):
    return render(request, 'students/add_notification.html')


    if request.method == 'POST':
        form = NotificationForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('app_nckh9:student_notifications')  # Thay đổi URL nếu cần
    else:
        form = NotificationForm()
    return render(request, 'students/add_notification.html', {'form': form})

