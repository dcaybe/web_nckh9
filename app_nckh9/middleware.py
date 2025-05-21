from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import re
import jwt

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Compile URL patterns once
        self.exempt_patterns = [
            re.compile(pattern)
            for pattern in [
                r'^/main/login/?$',
                r'^/main/api/token/?$',
                r'^/main/api/token/refresh/?$',
                r'^/main/api/register/?$',
                r'^/api/auth/token/?$',      # JWT token endpoint
                r'^/api/auth/token/refresh/?$',  # JWT refresh endpoint
                r'^/static/.*$',
                r'^/media/.*$',
                r'^/admin/.*$',  # Django admin URLs
                r'^/main/$',     # Homepage
                r'^/$',          # Root URL
            ]
        ]

    def __call__(self, request):
        # Skip authentication for exempt URLs
        path = request.path_info.lstrip('/')
        if any(pattern.match(request.path_info) for pattern in self.exempt_patterns):
            return self.get_response(request)

        # Check for API requests that require authentication
        if path.startswith('api/'):
            return self.authenticate_request(request)

        # For non-API requests, allow the request to continue
        return self.get_response(request)

    def authenticate_request(self, request):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header or not auth_header.startswith('Bearer '):
            return self.error_response(
                'Unauthorized',
                'Token không hợp lệ hoặc thiếu token',
                'token_not_valid',
                401
            )

        try:
            # Extract and validate token
            token = auth_header.split(' ')[1]
            access_token = AccessToken(token)
            
            # Use built-in verify method
            access_token.verify()
            
            # Get user from token payload
            User = get_user_model()
            user_id = access_token.payload.get('user_id')
            if not user_id:
                return self.error_response(
                    'Invalid Token',
                    'Token không chứa thông tin người dùng',
                    'token_invalid',
                    401
                )
                
            try:
                user = User.objects.get(id=user_id)
                if not user.is_active:
                    return self.error_response(
                        'User Inactive',
                        'Tài khoản đã bị vô hiệu hóa',
                        'user_inactive',
                        401
                    )
                request.user = user
            except User.DoesNotExist:
                return self.error_response(
                    'Invalid User',
                    'Không tìm thấy người dùng',
                    'user_not_found',
                    401
                )

            # Validate token type
            if access_token.get('token_type') != 'access':
                return self.error_response(
                    'Invalid Token Type',
                    'Loại token không hợp lệ',
                    'token_invalid_type',
                    401
                )

            # Get info from token payload
            payload = access_token.payload
            user_type = payload.get('user_type')
            user_id = payload.get('user_id')

            if not user_type or not user_id:
                return self.error_response(
                    'Invalid Token',
                    'Token không chứa đầy đủ thông tin',
                    'token_invalid',
                    401
                )

            # Get user from database
            User = get_user_model()
            try:
                user = User.objects.get(id=user_id)
                if not user.is_active:
                    return self.error_response(
                        'User Inactive',
                        'Tài khoản đã bị vô hiệu hóa',
                        'user_inactive',
                        401
                    )
                request.user = user
            except User.DoesNotExist:
                return self.error_response(
                    'Invalid User',
                    'Không tìm thấy người dùng',
                    'user_not_found',
                    401
                )

            # Add token info to request for logging
            request.token_info = {
                'user_id': str(user_id),
                'user_type': user_type,
                'exp': payload.get('exp'),
                'jti': payload.get('jti')
            }

        except InvalidToken:
            return self.error_response(
                'Invalid Token',
                'Token không hợp lệ',
                'token_not_valid',
                401
            )
            
        except TokenError as e:
            return self.error_response(
                'Token Error',
                str(e),
                'token_not_valid',
                401
            )
            
        except Exception as e:
            if settings.DEBUG:
                error_detail = str(e)
            else:
                error_detail = 'Internal server error'
            
            return self.error_response(
                'Server Error',
                error_detail,
                'server_error',
                500
            )

        return self.get_response(request)

    def error_response(self, error, message, code, status):
        return JsonResponse({
            'error': error,
            'message': message,
            'code': code,
            'status': status
        }, status=status)