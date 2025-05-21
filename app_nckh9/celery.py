import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'web_nckh9.settings')

try:
    # Try to create Celery app with Redis backend
    app = Celery('app_nckh9')

    # Configure Celery using Django settings
    app.config_from_object('django.conf:settings', namespace='CELERY')

    # Load task modules from all registered Django app configs
    app.autodiscover_tasks()

    @app.task(bind=True, ignore_result=True)
    def debug_task(self):
        print(f'Request: {self.request!r}')

except Exception as e:
    print(f"Warning: Celery initialization failed - {str(e)}")
    print("Running without Celery support")
    
    # Create a mock Celery app that does nothing
    class MockCelery:
        def task(self, *args, **kwargs):
            def decorator(f):
                # Run the function synchronously
                return f
            return decorator
            
        def config_from_object(self, *args, **kwargs):
            pass
            
        def autodiscover_tasks(self, *args, **kwargs):
            pass
    
    app = MockCelery()

# Export the app for use in tasks.py
default_app_config = 'app_nckh9.apps.AppNckh9Config'