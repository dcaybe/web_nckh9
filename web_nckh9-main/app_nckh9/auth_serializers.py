from rest_framework import serializers
from django.contrib.auth.models import User
from .models import InfoTeacher, InfoStudent
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer that includes additional user information
    in both the token and response data
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Basic user info
        token['username'] = user.username
        token['email'] = user.email
        token['full_name'] = f"{user.first_name} {user.last_name}"
        
        # Roles and permissions
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        
        # User type (admin/teacher/student)
        if user.is_superuser or user.is_staff:
            token['user_type'] = 'admin'
        else:
            try:
                InfoTeacher.objects.get(emailCoVan=user.email)
                token['user_type'] = 'teacher'
            except InfoTeacher.DoesNotExist:
                try:
                    student = InfoStudent.objects.get(emailSV=user.email)
                    token['user_type'] = 'student'
                    token['student_class'] = student.lopSV
                except InfoStudent.DoesNotExist:
                    token['user_type'] = 'user'

        # Permissions
        token['permissions'] = list(user.get_all_permissions())
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add extra response data
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['full_name'] = f"{self.user.first_name} {self.user.last_name}"
        data['is_staff'] = self.user.is_staff
        data['is_superuser'] = self.user.is_superuser
        
        # Add user type
        if self.user.is_superuser or self.user.is_staff:
            data['user_type'] = 'admin'
        else:
            try:
                InfoTeacher.objects.get(emailCoVan=self.user.email)
                data['user_type'] = 'teacher'
            except InfoTeacher.DoesNotExist:
                try:
                    student = InfoStudent.objects.get(emailSV=self.user.email)
                    data['user_type'] = 'student'
                    data['student_class'] = student.lopSV
                except InfoStudent.DoesNotExist:
                    data['user_type'] = 'user'
        
        return data

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with password confirmation
    """
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'confirm_password',
                 'first_name', 'last_name', 'is_staff')
        read_only_fields = ('is_staff',)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Mật khẩu không khớp")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user