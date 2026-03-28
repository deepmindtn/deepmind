from django.conf import settings
from django.db import models


class DepartmentReport(models.Model):
    """
    Persisted report for a department (or subset of employees).
    """

    id = models.BigAutoField(primary_key=True)
    company = models.ForeignKey(
        "accounts.Company",
        on_delete=models.CASCADE,
        related_name="department_reports",
    )
    department = models.CharField(max_length=64, help_text="e.g. 'engineering', 'all'")

    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    status_filter = models.CharField(max_length=32, default="all")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    overview_data = models.JSONField(default=dict, blank=True)
    aggregated_metrics = models.JSONField(default=dict, blank=True)
    trends = models.JSONField(default=dict, blank=True)
    alerts = models.JSONField(default=list, blank=True)
    ai_summary = models.JSONField(default=dict, blank=True)
    employee_breakdown = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["-created_at"]
        db_table = "department_reporting_departmentreport"

    def __str__(self):
        return f"Report: {self.department} ({self.created_at.date()})"
