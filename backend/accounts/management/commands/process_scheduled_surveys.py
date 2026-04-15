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

        frontend_url = settings.FRONTEND_URL

        for survey in pending_surveys:
            self.stdout.write(f"🚀 Processing Survey: {survey.title}")
            
            # Get targets via assignments
            assignments = survey.assignments.all()
            
            count = 0
            failed = 0
            for assign in assignments:
                user = assign.user
                if user.email:
                    try:
                        sent_count = send_mail(
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
                            fail_silently=False
                        )
                        if sent_count > 0:
                            count += 1
                        else:
                            failed += 1
                    except Exception as e:
                        failed += 1
                        self.stdout.write(self.style.ERROR(f"Failed to send to {user.email}"))

            if failed == 0:
                # Mark sent only when every recipient email attempt succeeded.
                survey.emails_sent = True
                survey.save(update_fields=['emails_sent'])
                self.stdout.write(self.style.SUCCESS(f"✅ Sent {count} emails for survey '{survey.title}'"))
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠️ Sent {count} emails and failed {failed} for survey '{survey.title}'. emails_sent remains false for retry."
                    )
                )