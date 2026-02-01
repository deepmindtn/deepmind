from apscheduler.schedulers.background import BackgroundScheduler
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

def start_scheduler():
    scheduler = BackgroundScheduler()
    
    # ✅ This defines the schedule (Like Laravel's ->everyMinute())
    scheduler.add_job(run_survey_job, 'interval', minutes=1)
    
    scheduler.start()
    print("⏰ Scheduler started: Checking for surveys every minute...")

def run_survey_job():
    """ This function triggers your management command """
    try:
        # This is equivalent to running 'python manage.py process_scheduled_surveys'
        call_command('process_scheduled_surveys')
    except Exception as e:
        print(f"❌ Scheduler Error: {e}")