from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_update_email_logo_path'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='response',
            constraint=models.UniqueConstraint(
                fields=('assignment', 'question'),
                name='unique_response_per_assignment_question',
            ),
        ),
    ]
