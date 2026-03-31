from django.conf import settings
from django.db import models


class JobPosting(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("closed", "Closed"),
    ]

    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="job_postings",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_job_postings",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    required_template_codes = models.JSONField(default=list, blank=True)
    ranking_weights = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.status})"


class CandidateCV(models.Model):
    recruitee = models.ForeignKey(
        "accounts.Recruitee",
        on_delete=models.CASCADE,
        related_name="candidate_cvs",
    )
    file = models.FileField(upload_to="candidate_cvs/%Y/%m/")
    extracted_text = models.TextField(blank=True)
    checksum = models.CharField(max_length=64, blank=True, db_index=True)
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"CV {self.id} for {self.recruitee.email}"


class CandidateJobApplication(models.Model):
    STAGE_CHOICES = [
        ("new", "New"),
        ("shortlisted", "Shortlisted"),
        ("assessment_pending", "Assessment Pending"),
        ("assessment_completed", "Assessment Completed"),
        ("interview", "Interview"),
        ("offer", "Offer"),
        ("rejected", "Rejected"),
        ("hired", "Hired"),
    ]

    recruitee = models.ForeignKey(
        "accounts.Recruitee",
        on_delete=models.CASCADE,
        related_name="job_applications",
    )
    job = models.ForeignKey(
        JobPosting,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="applications",
    )
    stage = models.CharField(max_length=32, choices=STAGE_CHOICES, default="new")
    notes = models.TextField(blank=True)
    source = models.CharField(max_length=64, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_candidate_applications",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["recruitee", "job"],
                name="uniq_candidate_job_application",
            )
        ]

    def __str__(self):
        job_title = self.job.title if self.job else "Unassigned"
        return f"{self.recruitee.email} -> {job_title}"


class CVJobMatch(models.Model):
    application = models.ForeignKey(
        CandidateJobApplication,
        on_delete=models.CASCADE,
        related_name="matches",
    )
    cv = models.ForeignKey(
        CandidateCV,
        on_delete=models.CASCADE,
        related_name="matches",
    )
    job = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name="matches",
    )
    score = models.FloatField()
    fit_label = models.CharField(max_length=32)
    summary = models.TextField(blank=True)
    ranking_breakdown = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.application.recruitee.email} - {self.job.title}: {self.score}"
