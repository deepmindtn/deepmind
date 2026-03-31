from django.db import migrations


def update_email_logo_path(apps, schema_editor):
    EmailTemplate = apps.get_model("accounts", "EmailTemplate")

    legacy_single = "src='/favicon_deepmind.png'"
    legacy_double = 'src="/favicon_deepmind.png"'
    placeholder_single = "src='{{logoUrl}}'"
    placeholder_double = 'src="{{logoUrl}}"'
    cid_logo = "src='cid:deepmind-logo'"

    for template in EmailTemplate.objects.all():
        body = template.body or ""
        updated = (
            body.replace(legacy_single, cid_logo)
            .replace(legacy_double, cid_logo)
            .replace(placeholder_single, cid_logo)
            .replace(placeholder_double, cid_logo)
        )
        if updated != body:
            template.body = updated
            template.save(update_fields=["body"])


def revert_email_logo_path(apps, schema_editor):
    EmailTemplate = apps.get_model("accounts", "EmailTemplate")

    cid_logo_single = "src='cid:deepmind-logo'"
    cid_logo_double = 'src="cid:deepmind-logo"'
    legacy = "src='/favicon_deepmind.png'"

    for template in EmailTemplate.objects.all():
        body = template.body or ""
        updated = body.replace(cid_logo_single, legacy).replace(cid_logo_double, legacy)
        if updated != body:
            template.body = updated
            template.save(update_fields=["body"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0018_user_employment_status"),
    ]

    operations = [
        migrations.RunPython(update_email_logo_path, revert_email_logo_path),
    ]
