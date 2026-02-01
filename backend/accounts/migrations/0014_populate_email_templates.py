from django.db import migrations

def create_email_templates(apps, schema_editor):
    EmailTemplate = apps.get_model('accounts', 'EmailTemplate')

    templates = [
        {
            "name": "Welcome Email",
            "subject": "Welcome to {{companyName}}!",
            "body": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to {{companyName}}</title>
</head>
<body style="margin:0; padding:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f8fafc;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc; padding:40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:40px 40px 20px 40px; text-align:center; background-color:#ffffff;">
                            <img src='/favicon_deepmind.png' alt='Logo' width='150' style='display:block; margin:0 auto; border:0;'>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px 40px 40px; color:#1f2937; line-height:1.6; font-size:16px;">
                            <h1 style="margin:0 0 20px 0; font-size:24px; font-weight:800; color:#10b981;">Hello {{firstName}},</h1>
                            <p style="margin:0 0 20px 0; color:#475569;">
                                Welcome to {{companyName}}! We're thrilled to have you on board and excited to start this journey together.
                            </p>
                            <p style="margin:20px 0 0 0; font-size:14px; color:#9ca3af;">
                                Best regards,<br>
                                <strong>The Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#ecfdf5; padding:30px 40px; text-align:center; border-top:1px solid #e5e7eb;">
                            <p style="margin:0 0 10px 0; font-size:12px; color:#9ca3af;">
                                © 2026 Deep Mind. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            """,
            "category": "account",
            "audience_type": "employee",
            "is_system": True
        },
        {
            "name": "Survey Invitation",
            "subject": "You have a new survey: {{surveyTitle}}",
            "body": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Survey Invitation</title>
</head>
<body style="margin:0; padding:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f8fafc;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc; padding:40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:40px 40px 20px 40px; text-align:center; background-color:#ffffff;">
                            <img src='/favicon_deepmind.png' alt='Logo' width='150' style='display:block; margin:0 auto; border:0;'>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px 40px 40px; color:#1f2937; line-height:1.6; font-size:16px;">
                            <h1 style="margin:0 0 20px 0; font-size:24px; font-weight:800; color:#10b981;">Hi {{firstName}},</h1>
                            <p style="margin:0 0 20px 0; color:#475569;">
                                You have been invited to complete the survey: <strong>{{surveyTitle}}</strong>.
                            </p>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:30px auto;">
                                <tr>
                                    <td align="center" style="border-radius:8px; background-color:#10b981;">
                                        <a href="{{surveyLink}}" target="_blank" style="display:inline-block; padding:14px 32px; font-family:Arial, sans-serif; font-size:16px; color:#ffffff; text-decoration:none; font-weight:bold; border-radius:8px; border:1px solid #10b981;">
                                            Go to Survey
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 20px 0; color:#6b7280;">
                                If you did not expect this email, please contact support immediately.
                            </p>
                            <p style="margin:20px 0 0 0; font-size:14px; color:#9ca3af;">
                                Best regards,<br>
                                <strong>The Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#ecfdf5; padding:30px 40px; text-align:center; border-top:1px solid #e5e7eb;">
                            <p style="margin:0 0 10px 0; font-size:12px; color:#9ca3af;">
                                © 2026 Deep Mind. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            """,
            "category": "survey",
            "audience_type": "employee",
            "is_system": True
        },
        {
            "name": "Candidate Assessment Invitation",
            "subject": "Assessment Invitation: {{templateName}}",
            "body": """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Assessment Invitation</title>
</head>
<body style="margin:0; padding:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; background-color:#f8fafc;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc; padding:40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding:40px 40px 20px 40px; text-align:center; background-color:#ffffff;">
                            <img src='/favicon_deepmind.png' alt='Logo' width='150' style='display:block; margin:0 auto; border:0;'>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 40px 40px 40px; color:#1f2937; line-height:1.6; font-size:16px;">
                            <h1 style="margin:0 0 20px 0; font-size:24px; font-weight:800; color:#10b981;">Hello {{firstName}},</h1>
                            <p style="margin:0 0 20px 0; color:#475569;">
                                You have been invited to complete an <strong>assessment</strong> as part of your application process. Completing this assessment will help us better understand your skills and fit for the opportunity.
                            </p>
                            <p style="margin:0 0 20px 0; color:#475569;">
                                Assessment: <strong>{{templateName}}</strong>
                            </p>
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:30px auto;">
                                <tr>
                                    <td align="center" style="border-radius:8px; background-color:#10b981;">
                                        <a href="{{assignmentLink}}" target="_blank" style="display:inline-block; padding:14px 32px; font-family:Arial, sans-serif; font-size:16px; color:#ffffff; text-decoration:none; font-weight:bold; border-radius:8px; border:1px solid #10b981;">
                                            Start Assessment
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 20px 0; color:#6b7280;">
                                Please complete the assessment by the assigned deadline. If you encounter any issues or did not expect this email, contact our support team immediately.
                            </p>
                            <p style="margin:20px 0 0 0; font-size:14px; color:#9ca3af;">
                                Good luck!<br>
                                <strong>The Recruitment Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color:#ecfdf5; padding:30px 40px; text-align:center; border-top:1px solid #e5e7eb;">
                            <p style="margin:0 0 10px 0; font-size:12px; color:#9ca3af;">
                                © 2026 Deep Mind. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            """,
            "category": "assessment",
            "audience_type": "candidate",
            "is_system": True
        },
    ]

    for tmpl in templates:
        EmailTemplate.objects.update_or_create(name=tmpl["name"], defaults=tmpl)

def reverse_create_email_templates(apps, schema_editor):
    EmailTemplate = apps.get_model('accounts', 'EmailTemplate')
    EmailTemplate.objects.filter(name__in=[
        "Welcome Email",
        "Survey Invitation",
        "Candidate Assessment Invitation",
    ]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0013_emailtemplate'),
    ]

    operations = [
        migrations.RunPython(create_email_templates, reverse_create_email_templates)
    ]
