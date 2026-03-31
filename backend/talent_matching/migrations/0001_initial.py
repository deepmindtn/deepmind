# Generated manually for talent_matching initial schema.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("accounts", "0018_user_employment_status"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="JobPosting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField()),
                (
                    "status",
                    models.CharField(
                        choices=[("draft", "Draft"), ("active", "Active"), ("closed", "Closed")],
                        default="draft",
                        max_length=20,
                    ),
                ),
                ("required_template_codes", models.JSONField(blank=True, default=list)),
                ("ranking_weights", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="job_postings",
                        to="accounts.company",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="created_job_postings",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="CandidateCV",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(upload_to="candidate_cvs/%Y/%m/")),
                ("extracted_text", models.TextField(blank=True)),
                ("checksum", models.CharField(blank=True, db_index=True, max_length=64)),
                ("is_active", models.BooleanField(default=True)),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                (
                    "recruitee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="candidate_cvs",
                        to="accounts.recruitee",
                    ),
                ),
            ],
            options={"ordering": ["-uploaded_at"]},
        ),
        migrations.CreateModel(
            name="CandidateJobApplication",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "stage",
                    models.CharField(
                        choices=[
                            ("new", "New"),
                            ("shortlisted", "Shortlisted"),
                            ("assessment_pending", "Assessment Pending"),
                            ("assessment_completed", "Assessment Completed"),
                            ("interview", "Interview"),
                            ("offer", "Offer"),
                            ("rejected", "Rejected"),
                            ("hired", "Hired"),
                        ],
                        default="new",
                        max_length=32,
                    ),
                ),
                ("notes", models.TextField(blank=True)),
                ("source", models.CharField(blank=True, max_length=64)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="created_candidate_applications",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "job",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="applications",
                        to="talent_matching.jobposting",
                    ),
                ),
                (
                    "recruitee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="job_applications",
                        to="accounts.recruitee",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="candidatejobapplication",
            constraint=models.UniqueConstraint(fields=("recruitee", "job"), name="uniq_candidate_job_application"),
        ),
        migrations.CreateModel(
            name="CVJobMatch",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.FloatField()),
                ("fit_label", models.CharField(max_length=32)),
                ("summary", models.TextField(blank=True)),
                ("ranking_breakdown", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "application",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="matches",
                        to="talent_matching.candidatejobapplication",
                    ),
                ),
                (
                    "cv",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="matches",
                        to="talent_matching.candidatecv",
                    ),
                ),
                (
                    "job",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="matches",
                        to="talent_matching.jobposting",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
