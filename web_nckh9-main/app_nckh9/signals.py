from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import InfoStudent, InfoTeacher

# @receiver(post_save, sender=User)
# def create_user_profile(sender, instance, created, **kwargs):
#     """
#     Tạo profile cho user mới khi được tạo
#     """
#     if created:
#         if instance.email.endswith('@student.ptithcm.edu.vn'):
#             InfoStudent.objects.create(
#                 emailSV=instance.email,
#                 maSV=instance.username,
#                 tenSV=instance.get_full_name() or instance.username
#             )
#         elif instance.email.endswith('@ptithcm.edu.vn'):
#             InfoTeacher.objects.create(
#                 emailCoVan=instance.email,
#                 maGV=instance.username,
#                 tenGV=instance.get_full_name() or instance.username
#             ) 