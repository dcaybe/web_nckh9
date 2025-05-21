from celery import shared_task
from django.core.cache import cache
import logging
import json
import os
from datetime import datetime

logger = logging.getLogger(__name__)

def handle_task_failure(task_id, error_message):
    """
    Handle task failure by storing error in cache or file system
    """
    error_data = {
        'task_id': task_id,
        'error': str(error_message),
        'timestamp': datetime.now().isoformat()
    }
    
    try:
        # Try to use cache
        cache.set(f'task_error_{task_id}', error_data, timeout=86400)  # 24 hours
    except:
        # Fallback to file system
        error_file = os.path.join('task_errors', f'{task_id}.json')
        os.makedirs('task_errors', exist_ok=True)
        with open(error_file, 'w') as f:
            json.dump(error_data, f)

def update_task_progress(task_id, progress, status='processing', message=None):
    """
    Update task progress in cache or file system
    """
    progress_data = {
        'task_id': task_id,
        'progress': progress,
        'status': status,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    
    try:
        # Try to use cache
        cache.set(f'task_progress_{task_id}', progress_data, timeout=3600)  # 1 hour
    except:
        # Fallback to file system
        progress_file = os.path.join('task_progress', f'{task_id}.json')
        os.makedirs('task_progress', exist_ok=True)
        with open(progress_file, 'w') as f:
            json.dump(progress_data, f)

@shared_task(bind=True)
def example_task(self):
    """
    Example periodic task that runs every 30 minutes
    """
    try:
        logger.info(f"Running example task {self.request.id}")
        # Your task logic here
        return "Task completed successfully"
    except Exception as e:
        logger.error(f"Task failed: {str(e)}")
        handle_task_failure(self.request.id, str(e))
        raise

@shared_task(bind=True)
def export_data_task(self, format, data_type, start_date=None, end_date=None, fields=None):
    """
    Export data task that handles different formats and data types
    """
    try:
        task_id = self.request.id
        update_task_progress(task_id, 0, 'processing', 'Starting export...')

        # Your export logic here
        # ...

        update_task_progress(task_id, 100, 'completed', 'Export completed')
        return {'status': 'success', 'file_path': f'exports/{task_id}.{format}'}
    except Exception as e:
        logger.error(f"Export task failed: {str(e)}")
        handle_task_failure(task_id, str(e))
        update_task_progress(task_id, 0, 'failed', str(e))
        raise

@shared_task(bind=True)
def sync_data_task(self, sync_type, source_system, data_type, last_sync=None):
    """
    Sync data task that handles incremental and full sync
    """
    try:
        task_id = self.request.id
        update_task_progress(task_id, 0, 'processing', 'Starting sync...')

        # Your sync logic here
        # ...

        update_task_progress(task_id, 100, 'completed', 'Sync completed')
        return {
            'status': 'success',
            'records_processed': 0,
            'records_failed': 0
        }
    except Exception as e:
        logger.error(f"Sync task failed: {str(e)}")
        handle_task_failure(task_id, str(e))
        update_task_progress(task_id, 0, 'failed', str(e))
        raise

def run_task_synchronously(task_func, *args, **kwargs):
    """
    Run a task synchronously when Celery is not available
    """
    try:
        class Request:
            def __init__(self):
                self.id = f"sync_{datetime.now().strftime('%Y%m%d%H%M%S')}"

        class SyncTask:
            def __init__(self):
                self.request = Request()

        task = SyncTask()
        return task_func(task, *args, **kwargs)
    except Exception as e:
        logger.error(f"Sync execution failed: {str(e)}")
        raise

# Function to execute tasks with or without Celery
def execute_task(task_func, *args, **kwargs):
    """
    Execute a task either async with Celery or sync without it
    """
    try:
        # Try to execute as Celery task
        return task_func.delay(*args, **kwargs)
    except:
        # Fallback to synchronous execution
        logger.warning(f"Executing {task_func.__name__} synchronously")
        return run_task_synchronously(task_func, *args, **kwargs)