from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0018_user_employment_status"),
        ("talent_matching", "0002_normalize_candidate_application_stage"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CandidateScoreExplanation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("snapshot_signature", models.CharField(db_index=True, max_length=64)),
                ("cv_score", models.FloatField(default=0)),
                ("assessment_score", models.FloatField(default=0)),
                ("completion_score", models.FloatField(default=0)),
                ("overall_score", models.FloatField(default=0)),
                ("completed_assessments", models.PositiveIntegerField(default=0)),
                ("total_assessments", models.PositiveIntegerField(default=0)),
                ("assessment_breakdown", models.JSONField(blank=True, default=list)),
                ("report_payload", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "candidate",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="score_explanations",
                        to="accounts.recruitee",
                    ),
                ),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="candidate_score_explanations",
                        to="accounts.company",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_candidate_score_explanations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "latest_match",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="score_explanations",
                        to="talent_matching.cvjobmatch",
                    ),
                ),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="candidatescoreexplanation",
            constraint=models.UniqueConstraint(
                fields=("candidate", "snapshot_signature"),
                name="uniq_candidate_score_explanation_signature",
            ),
        ),
        migrations.AddIndex(
            model_name="candidatescoreexplanation",
            index=models.Index(fields=["candidate", "created_at"], name="talent_matc_candida_f3ee01_idx"),
        ),
    ]
