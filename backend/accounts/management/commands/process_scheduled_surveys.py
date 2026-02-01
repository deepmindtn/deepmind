from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import Survey

class Command(BaseCommand):
    help = 'Checks for scheduled surveys and sends emails if time has arrived'

    def handle(self, *args, **options):
        now = timezone.now()
        
        # Find surveys that:
        # 1. Have a scheduled time
        # 2. That time is in the past (lte=now)
        # 3. Emails haven't been sent yet
        pending_surveys = Survey.objects.filter(
            scheduled_for__lte=now,
            emails_sent=False,
            scheduled_for__isnull=False
        )

        if not pending_surveys.exists():
            self.stdout.write("No pending surveys to process.")
            return

        frontend_url = "http://localhost:5173"

        for survey in pending_surveys:
            self.stdout.write(f"🚀 Processing Survey: {survey.title}")
            
            # Get targets via assignments
            assignments = survey.assignments.all()
            
            count = 0
            for assign in assignments:
                user = assign.user
                if user.email:
                    try:
                        send_mail(
                            subject=f"New Survey Assigned: {survey.title}",
                            message=(
                                f"Hi {user.first_name},\n\n"
                                f"You have been assigned a new survey: '{survey.title}'.\n"
                                "Please log in to your dashboard to complete the questions.\n\n"
                                f"Click here: {frontend_url}\n\n"
                                "Best regards,\nHR Team"
                            ),
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[user.email],
                            fail_silently=True 
                        )
                        count += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Failed to send to {user.email}"))

            # ✅ Mark as sent so we don't send again
            survey.emails_sent = True
            survey.save()
            
            self.stdout.write(self.style.SUCCESS(f"✅ Sent {count} emails for survey '{survey.title}'"))