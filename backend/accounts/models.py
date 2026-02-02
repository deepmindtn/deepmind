from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid

# --------------------------
# Company model
# --------------------------
class Company(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# --------------------------
# Custom User Manager
# --------------------------
class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self._create_user(email, password, **extra_fields)


# --------------------------
# Custom User
# --------------------------
class User(AbstractUser):
    class Roles(models.TextChoices):
        HR = "HR", "HR"
        EMPLOYEE = "EMPLOYEE", "Employee"

    class Departments(models.TextChoices):
        ENGINEERING = "engineering", "Engineering"
        MARKETING = "marketing", "Marketing"
        SALES = "sales", "Sales"
        HR = "hr", "Human Resources"
        FINANCE = "finance", "Finance"
        OPERATIONS = "operations", "Operations"
        DESIGN = "design", "Design"
        PRODUCT = "product", "Product"
        OTHER = "other", "Other"

    username = None  # remove username
    email = models.EmailField(unique=True)

    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=16, choices=Roles.choices, default=Roles.HR)

    # Department now defaults to HR if not provided
    department = models.CharField(
        max_length=32,
        choices=Departments.choices,
        default=Departments.HR,
        blank=True
    )

    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    join_date = models.DateField(auto_now_add=True)

    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, null=True, blank=True, related_name="users"
    )

    GENDERS = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
        ("prefer_not_to_say", "Prefer not to say"),
    ]
    MARITAL_STATUSES = [
        ("single", "Single"),
        ("married", "Married"),
        ("divorced", "Divorced"),
        ("widowed", "Widowed"),
        ("other", "Other"),
    ]

    gender = models.CharField(max_length=20, choices=GENDERS, default="other", blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=50, blank=True, default="Other")
    marital_status = models.CharField(max_length=10, choices=MARITAL_STATUSES, default="other", blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"


# --------------------------
# Invite model
# --------------------------
class Invite(models.Model):
    """
    HR creates an invite for an employee. Employee completes signup via token.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField()
    # Default department = HR if not specified
    department = models.CharField(
        max_length=32,
        choices=User.Departments.choices,
        default=User.Departments.HR,
        blank=True
    )
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_invites")
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="invites"
    )

    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # If no company specified, inherit inviter's company
        if not self.company and self.created_by:
            self.company = self.created_by.company
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Invite({self.email}) accepted={self.is_accepted}"

# --------------------------
# Recruitee model (for recruitment assessments)
# --------------------------
class Recruitee(models.Model):
    """
    Represents a job candidate or applicant under recruitment.
    Can be invited by HR and receive assessments.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    position = models.CharField(max_length=255, blank=True)  # e.g., "Data Scientist"
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, null=True, blank=True, related_name="recruitees"
    )

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("invited", "Invited"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("hired", "Hired"),
        ("rejected", "Rejected"),
    ]
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending"
    )

    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_recruitees"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto inherit company from HR
        if not self.company and self.created_by:
            self.company = self.created_by.company
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email}) - {self.status}"
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_active(self):
        return True


# --------------------------
# Department model
# --------------------------
class Department(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="departments")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, default="Layers", blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Survey(models.Model):
    """
    The main container for a survey (formerly Assessment).
    """
    class ResponseType(models.TextChoices):
        NAMED = 'named', 'Named'
        ANONYMOUS = 'anonymous', 'Anonymous'

    class Method(models.TextChoices):
        MANUAL = 'manual', 'Manual Builder'
        UPLOAD = 'upload', 'File Upload'

    title = models.CharField(max_length=255, default="New Survey")
    emails_sent = models.BooleanField(default=False)
    
    # Ownership
    company = models.ForeignKey(
        'Company', 
        on_delete=models.CASCADE, 
        related_name='company_surveys'
    )
    created_by = models.ForeignKey(
        'User', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_surveys'
    )
    
    # Configuration
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.MANUAL)
    response_type = models.CharField(max_length=20, choices=ResponseType.choices, default=ResponseType.NAMED)
    
    # For file uploads
    survey_file = models.FileField(upload_to='surveys/', null=True, blank=True)
    
    # Scheduling
    scheduled_for = models.DateTimeField(null=True, blank=True, help_text="If null, sent immediately")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.company.name}"


class Question(models.Model):
    # Linked to Survey instead of Assessment
    survey = models.ForeignKey(
        Survey, 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)
    question_type = models.CharField(max_length=50, default='text') 

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.order}. {self.text[:50]}..."


class Assignment(models.Model):
    """
    Connects a User (Employee) to a Survey.
    """
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        EXPIRED = 'expired', 'Expired'

    # Linked to Survey
    survey = models.ForeignKey(
        Survey, 
        on_delete=models.CASCADE, 
        related_name='assignments'
    )
    user = models.ForeignKey(
        'User', 
        on_delete=models.CASCADE, 
        related_name='survey_assignments'
    )
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    assigned_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('survey', 'user') 

    def __str__(self):
        return f"{self.user.email} -> {self.survey.title} ({self.status})"


class Response(models.Model):
    assignment = models.ForeignKey(
        Assignment, 
        on_delete=models.CASCADE, 
        related_name='responses'
    )
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE, 
        related_name='responses'
    )
    answer_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response to Q{self.question.order}"
    
# --------------------------
# Email Template model
# --------------------------
class EmailTemplate(models.Model):
    """
    Stores email templates for employees/candidates.
    Can be used for surveys, assessments, or other notifications.
    """
    class Category(models.TextChoices):
        ACCOUNT = "account", "Account"
        ASSESSMENT = "assessment", "Assessment"
        SURVEY = "survey", "Survey"

    class Audience(models.TextChoices):
        EMPLOYEE = "employee", "Employee"
        CANDIDATE = "candidate", "Candidate"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"

    name = models.CharField(max_length=255)
    subject = models.TextField()
    body = models.TextField()

    category = models.CharField(max_length=20, choices=Category.choices)
    audience_type = models.CharField(max_length=20, choices=Audience.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    variables = models.JSONField(
        default=dict, 
        help_text="Allowed placeholders like {{firstName}}, {{surveyLink}}"
    )

    is_system = models.BooleanField(default=False, help_text="System templates cannot be deleted")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="email_templates",
        help_text="Optional: Template specific to a company"
    )

    def __str__(self):
        return f"{self.name} ({self.category} - {self.audience_type})"

# --------------------------
# Eisenhower Task Model
# --------------------------
class EisenhowerTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='eisenhower_tasks')
    text = models.CharField(max_length=500)
    quadrant = models.IntegerField() 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.email} - Q{self.quadrant} - {self.text[:20]}"