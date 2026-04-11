from django.contrib import admin

from .models import (
    CandidateCV,
    CandidateJobApplication,
    CandidateScoreExplanation,
    CVJobMatch,
    JobPosting,
)


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "company", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "description")


@admin.register(CandidateCV)
class CandidateCVAdmin(admin.ModelAdmin):
    list_display = ("id", "recruitee", "is_active", "uploaded_at")
    list_filter = ("is_active", "uploaded_at")
    search_fields = ("recruitee__email", "checksum")


@admin.register(CandidateJobApplication)
class CandidateJobApplicationAdmin(admin.ModelAdmin):
    list_display = ("id", "recruitee", "job", "stage", "created_at")
    list_filter = ("stage", "created_at")
    search_fields = ("recruitee__email", "job__title")


@admin.register(CVJobMatch)
class CVJobMatchAdmin(admin.ModelAdmin):
    list_display = ("id", "application", "job", "score", "fit_label", "created_at")
    list_filter = ("fit_label", "created_at")
    search_fields = ("application__recruitee__email", "job__title")


@admin.register(CandidateScoreExplanation)
class CandidateScoreExplanationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "candidate",
        "overall_score",
        "cv_score",
        "assessment_score",
        "completion_score",
        "created_at",
    )
    list_filter = ("created_at",)
    search_fields = ("candidate__email", "candidate__first_name", "candidate__last_name")
