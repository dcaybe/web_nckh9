from django.apps import AppConfig


class AppNckh9Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app_nckh9'
    verbose_name = 'Hệ thống Quản lý Điểm'

    def ready(self):
        import app_nckh9.signals  # noqa
