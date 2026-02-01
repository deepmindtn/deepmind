from django.apps import AppConfig
import os

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # 👇 DEBUG PRINT 1: Check if ready() is even called
        print("🔧 Accounts Config Loaded...")

        # Check for Run Main (Django Reloader)
        if os.environ.get('RUN_MAIN'): 
            print("🚀 MAIN PROCESS DETECTED. Starting Scheduler...")
            try:
                from . import scheduler
                scheduler.start_scheduler()
            except ImportError as e:
                # 👇 NOW WE WILL SEE THE ERROR
                print(f"❌ CRITICAL ERROR: Could not import apscheduler. Did you run pip install? Details: {e}")
            except Exception as e:
                print(f"❌ SCHEDULER ERROR: {e}")
        else:
            print("ℹ️ Helper process (Reloader) detected. Skipping scheduler.")