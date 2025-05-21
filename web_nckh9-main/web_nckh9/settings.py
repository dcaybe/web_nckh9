"""
Django settings for web_nckh9 project.
"""

import logging
import secrets
from pathlib import Path
from datetime import timedelta
import os

logger = logging.getLogger(__name__)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', secrets.token_urlsafe(50))

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app_nckh9',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'social_django',
    'django.contrib.sites',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.microsoft',
    'oauth2_provider',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'app_nckh9.middleware.JWTAuthenticationMiddleware',
]

ROOT_URLCONF = 'web_nckh9.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'web_nckh9.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Cache settings
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake'
    }
}

# Session settings
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_SAVE_EVERY_REQUEST = False

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'vi'
TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATICFILES_DIRS = [
    BASE_DIR / "app_nckh9/static",
]
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Social Auth
SOCIAL_AUTH_AZUREAD_OAUTH2_KEY = os.environ.get('AZURE_CLIENT_ID', '2c90bce3-1ba4-415c-842c-d02f9837df3d')
SOCIAL_AUTH_AZUREAD_OAUTH2_SECRET = os.environ.get('AZURE_CLIENT_SECRET', '2cc195ad-63bb-4b3b-aa30-0332acea3bee')
SOCIAL_AUTH_AZUREAD_OAUTH2_TENANT_ID = os.environ.get('AZURE_TENANT_ID', '2e9679da-25b8-4410-b300-8d446c926d37')

# Authentication settings
LOGIN_URL = '/login/'  # Changed from /main/login/
# Dùng login_view trong views.py để xử lý redirect dựa trên user type
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/login/'  # Changed from /main/login/

# Django Admin settings
ADMIN_SITE_HEADER = "Hệ thống Quản lý Điểm"
ADMIN_SITE_TITLE = "Hệ thống Quản lý Điểm"
ADMIN_INDEX_TITLE = "Quản lý Hệ thống"

# Site ID for django.contrib.sites
SITE_ID = 1

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# AllAuth settings
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
ACCOUNT_LOGIN_ATTEMPTS_LIMIT = 5
ACCOUNT_LOGIN_ATTEMPTS_TIMEOUT = 300

# Rest Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ] if not DEBUG else [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}

# JWT settings
SIMPLE_JWT = {
    # Token settings
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Reduced for security
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=12),   # Reduced for security
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    
    # Signing settings
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    
    # Token validation settings
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    
    # Token claims
    'USER_ID_CLAIM': 'user_id',
    'USER_ID_FIELD': 'id',
    'AUDIENCE': 'web_nckh9_client',
    'ISSUER': 'web_nckh9_server',
    
    # Additional security settings
    'AUTH_COOKIE': 'access_token',  # Cookie name for JWT
    'AUTH_COOKIE_SECURE': not DEBUG,  # Only send cookie over HTTPS in production
    'AUTH_COOKIE_HTTP_ONLY': True,   # Prevent JavaScript access to the cookie
    'AUTH_COOKIE_PATH': '/',        # Cookie path
    'AUTH_COOKIE_SAMESITE': 'Lax',  # CSRF protection
    
    # Token serializers
    'TOKEN_OBTAIN_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenObtainPairSerializer',
    'TOKEN_REFRESH_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenRefreshSerializer',
    'TOKEN_VERIFY_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenVerifySerializer',
    'TOKEN_BLACKLIST_SERIALIZER': 'rest_framework_simplejwt.serializers.TokenBlacklistSerializer',
    
    # Token verification
    'JWK_URL': None,
    'LEEWAY': 0,
    
    # Token sliding (optional)
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(hours=12)
}

# JWT Response settings
JWT_AUTH_RETURN_EXPIRATION = True
JWT_AUTH_COOKIE_USE_CSRF = True
JWT_AUTH_COOKIE_ENFORCE_CSRF_ON_UNAUTHENTICATED = True

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Security Settings
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# Celery settings
CELERY_BROKER_URL = 'sqla+sqlite:///celery.sqlite'
CELERY_RESULT_BACKEND = 'db+sqlite:///results.sqlite'
CELERY_CACHE_BACKEND = 'default'  # Use local memory cache for Celery
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Asia/Ho_Chi_Minh'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60
CELERY_WORKER_MAX_TASKS_PER_CHILD = 50
CELERY_WORKER_SEND_TASK_EVENTS = True
CELERY_TASK_SEND_SENT_EVENT = True

# Celery Beat Settings
CELERY_BEAT_SCHEDULE = {
    'example-periodic-task': {
        'task': 'app_nckh9.tasks.example_task',
        'schedule': timedelta(minutes=30),
    },
}

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # For development
EMAIL_HOST = 'smtp.gmail.com'  # For production
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'noreply@humg.edu.vn'  # Replace with actual email
EMAIL_HOST_PASSWORD = ''  # Replace with actual password

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'redis_formatter': {
            'format': '[Redis] {levelname} {asctime} {message}',
            'style': '{',
        },
        'auth_formatter': {
            'format': '[Auth] {levelname} {asctime} {message} - User: {extra[user]} IP: {extra[ip]}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'debug.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'redis_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'redis.log',
            'formatter': 'redis_formatter',
        },
        'auth_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'auth.log',
            'formatter': 'auth_formatter',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'redis': {
            'handlers': ['redis_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django_redis': {
            'handlers': ['redis_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
        'jwt_auth': {
            'handlers': ['auth_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'rest_framework_simplejwt': {
            'handlers': ['auth_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
