from django.urls import path, include
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.views.generic import RedirectView

def home_redirect(request):
    """Redirect to login page"""
    return redirect('app_nckh9:login')

# Configure admin site
admin.site.site_header = 'Hệ thống QL Điểm RL'
admin.site.site_title = 'Quản lý Điểm'
admin.site.index_title = 'Quản trị hệ thống'

urlpatterns = [
    # Default Django admin interface moved to /django-admin
    path('django-admin/', admin.site.urls),
    
    # Root URL redirects to login
    path('', home_redirect, name='home'),
    
    # Main application URLs including custom admin interface
    path('', include('app_nckh9.urls')),
    
    # Social auth URLs
    path('auth/', include('social_django.urls', namespace='social')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

