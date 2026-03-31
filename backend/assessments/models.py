import uuid  # <--- Make sure this is imported
from django.db import models
from django.conf import settings
from accounts.models import Recruitee

User = settings.AUTH_USER_MODEL

class AssessmentTemplate(models.Model):
    code = models.CharField(max_length=32, unique=True)  # BIG_FIVE, KARASEK, MASLACH
    name = models.CharField(max_length=128)
    questions = models.JSONField(null=True, blank=True)  # For AI-generated or dynamic assessments

    def __str__(self):
        return self.name

class Assignment(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING"
        COMPLETED = "COMPLETED"

    employee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="assignments")
    template = models.ForeignKey("AssessmentTemplate", on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # NEW fields
    answers = models.JSONField(null=True, blank=True)     # raw answers as sent
    metrics = models.JSONField(null=True, blank=True)     # normalized scores you chart
    ai_report = models.TextField(null=True, blank=True)
    assigned_by = models.TextField(null=True, blank=True)    # LLM narrative
    report_pdf = models.FileField(upload_to="reports/", null=True, blank=True)  # optional


# ✅ MOVED OUTSIDE (Not indented inside Assignment)
class CandidateAssignment(models.Model):
    """
    Links a Candidate (Recruitee) to an Assessment Template.
    """
    id = models.BigAutoField(primary_key=True)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    recruitee = models.ForeignKey(Recruitee, on_delete=models.CASCADE, related_name="assessments")
    template = models.ForeignKey("AssessmentTemplate", on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, default="PENDING") # PENDING, COMPLETED
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Store results
    answers = models.JSONField(null=True, blank=True)
    metrics = models.JSONField(null=True, blank=True)
    ai_report = models.TextField(null=True, blank=True)

    class Meta:
        # Optional: Prevent assigning the same test twice to the same candidate
        unique_together = ('recruitee', 'template')

    def __str__(self):
        return f"{self.recruitee.email} - {self.template.code}"
