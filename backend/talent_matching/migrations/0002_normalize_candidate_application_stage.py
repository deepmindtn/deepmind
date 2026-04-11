from django.db import migrations, models


LEGACY_STAGE_MAP = {
    "new": "pending",
    "shortlisted": "invited",
    "assessment_pending": "invited",
    "assessment_completed": "completed",
    "interview": "in_progress",
    "offer": "in_progress",
}


def normalize_candidate_application_stage(apps, schema_editor):
    CandidateJobApplication = apps.get_model("talent_matching", "CandidateJobApplication")

    for legacy_value, normalized_value in LEGACY_STAGE_MAP.items():
        CandidateJobApplication.objects.filter(stage=legacy_value).update(stage=normalized_value)

    allowed_values = {"pending", "invited", "in_progress", "completed", "hired", "rejected"}
    CandidateJobApplication.objects.exclude(stage__in=allowed_values).update(stage="pending")


class Migration(migrations.Migration):

    dependencies = [
        ("talent_matching", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(normalize_candidate_application_stage, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="candidatejobapplication",
            name="stage",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("invited", "Invited"),
                    ("in_progress", "In Progress"),
                    ("completed", "Completed"),
                    ("hired", "Hired"),
                    ("rejected", "Rejected"),
                ],
                default="pending",
                max_length=32,
            ),
        ),
    ]
