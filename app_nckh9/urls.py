from django.urls import path, include
from django.contrib import admin
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .api_views import (
    CustomTokenObtainPairView,
    TeacherViewSet,
    ScoreManagementViewSet,
    TeacherAnalyticsViewSet,
    UserManagementViewSet,
    ScoringRulesViewSet,
    BatchApprovalViewSet,
    HocKyViewSet,
    HistoryPointViewSet,
    PendingStudentViewSet
)
from . import views

app_name = 'app_nckh9'

# Configure admin site
admin.site.site_header = 'Hệ thống QL Điểm RL'
admin.site.site_title = 'Quản lý Điểm'
admin.site.index_title = 'Quản trị hệ thống'

# API Router configuration
router = DefaultRouter(trailing_slash=False)

# Teacher API endpoints
router.register(r'teacher/classes', TeacherViewSet)
router.register(r'teacher/scores', ScoreManagementViewSet)
router.register(r'teacher/analytics', TeacherAnalyticsViewSet, basename='teacher-analytics')

# Admin API endpoints
router.register(r'admin/users', UserManagementViewSet, basename='admin-users')
router.register(r'admin/rules', ScoringRulesViewSet, basename='admin-rules')
router.register(r'admin/approvals', BatchApprovalViewSet, basename='admin-approvals')

# New API endpoints
router.register(r'scoring-rules', ScoringRulesViewSet, basename='scoring-rules')
router.register(r'semesters', HocKyViewSet)
router.register(r'history', HistoryPointViewSet)
router.register(r'pending', PendingStudentViewSet)

# API URL patterns
api_urlpatterns = [
    # JWT Authentication endpoints
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]

# View URL patterns
view_urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('reset-password/<uidb64>/<token>/', views.password_reset_confirm, name='password_reset_confirm'),
    
    # Student views
    path('student/', views.student_dashboard, name='student_dashboard'),
    path('student/show-point/', views.student_show_point, name='student_show_point'),
    path('student/rank/', views.student_rank, name='student_rank'),
    path('student/appeal/', views.student_appeal, name='student_appeal'),
    path('student/notifications/', views.student_notifications, name='student_notifications'),
    path('student/view-score-rating/', views.view_score_rating, name='view_score_rating'),
    path('student/score-rating/', views.student_score_rating, name='student_score_rating'),
    path('student/add-sinhvien-tdg/', views.add_sinhvien_tdg, name='add_sinhvien_tdg'),
    path('student/view-sinhvien/', views.view_sinhvien, name='view_sinhvien'),
    path('student/add-info-student/', views.add_info_student, name='add_info_student'),
    path('student/add-hoc-ky/', views.add_hoc_ky, name='add_hoc_ky'),
    path('student/historic-fix/', views.student_historic_fix, name='student_historic_fix'),
    path('student/ai-assistant/', views.student_ai_assistant, name='student_ai_assistant'),
    path('student/appeal-again/', views.student_appeal_again, name='student_appeal_again'),

    # Teacher views
    path('teacher/', views.teacher_dashboard, name='teacher_dashboard'),
    path('teacher/class-management/', views.teacher_class_management, name='teacher_class_management'),
    path('teacher/score-management/', views.teacher_score_management, name='teacher_score_management'),
    path('teacher/analytics/', views.teacher_analytics, name='teacher_analytics'),
    path('teacher/activity-history/', views.teacher_activity_history, name='teacher_activity_history'),
    path('teacher/ai-assistant/', views.chat_view, name='teacher_ai_assistant'),
    path('teacher/notifications/', views.teacher_notifications, name='teacher_notifications'),

    # Admin views
    path('admin/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/user-management/', views.admin_user_management, name='admin_user_management'),
    path('admin/scoring-rules/', views.admin_scoring_rules, name='admin_scoring_rules'),
    path('admin/backup-restore/', views.admin_backup_restore, name='admin_backup_restore'),
    path('admin/statistics/', views.admin_statistics, name='admin_statistics'),
    path('admin/sync/', views.admin_sync, name='admin_sync'),
    path('admin/notifications/', views.admin_notifications, name='admin_notifications'),
    path('admin/batch-approval/', views.admin_batch_approval, name='admin_batch_approval'),
    path('admin/activity-history/', views.admin_activity_history, name='admin_activity_history'),
    path('admin/ai-assistant/', views.admin_ai_assistant, name='admin_ai_assistant'),
]

# Combine all URL patterns
urlpatterns = [
    path('api/', include(api_urlpatterns)),  # API routes
    path('', include(view_urlpatterns)),     # View routes
]

# Additional routes
urlpatterns += [
    path('add-historic/', views.add_history_point, name='add_historic'),
    path('add-notification/', views.add_notification, name='add_notification')
]
