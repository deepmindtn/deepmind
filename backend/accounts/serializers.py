from uuid import UUID
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings

# Models
from .models import User, Company, Recruitee, Invite, Department, Survey, Question, Assignment,Response,EisenhowerTask

User = get_user_model()

# --------------------------
# HR Self-Signup
# --------------------------
class SignupSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "company_name"]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        company_name = validated_data.pop("company_name")
        password = validated_data.pop("password")
        company, _ = Company.objects.get_or_create(name=company_name)
        user = User(
            **validated_data,
            company=company,
            role=User.Roles.HR,
            department=User.Departments.HR,
        )
        user.set_password(password)
        user.save()
        return user

# --------------------------
# Recruitee Serializer
# --------------------------
class RecruiteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruitee
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

# --------------------------
# HR Creates Invite
# --------------------------
class InviteCreateSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    department_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Invite
        fields = ["id", "email", "department", "department_id", "first_name", "last_name", "company_name"]
        read_only_fields = ["id", "created_at", "department"] 

    def create(self, validated_data):
        user = self.context["request"].user
        dept_id = validated_data.pop("department_id", None)

        if user.role != User.Roles.HR:
            raise serializers.ValidationError("Only HR can create invites.")

        dept_name = User.Departments.HR 
        
        if dept_id:
            try:
                dept_obj = Department.objects.get(id=dept_id, company=user.company)
                dept_name = dept_obj.name 
            except Department.DoesNotExist:
                raise serializers.ValidationError({"department_id": "Invalid department selection."})
        
        validated_data["department"] = dept_name
        validated_data["company"] = user.company

        return Invite.objects.create(created_by=user, **validated_data)

# --------------------------
# Employee Accepts Invite
# --------------------------
class AcceptInviteSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    last_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    email = serializers.EmailField(read_only=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        raw = (attrs.get("token") or "").strip()
        try:
            tok = str(UUID(raw))
        except ValueError:
            raise serializers.ValidationError({"token": "Invalid token format."})
        try:
            invite = Invite.objects.get(id=tok)
        except Invite.DoesNotExist:
            raise serializers.ValidationError({"token": "Invite not found."})
        if invite.is_accepted:
            raise serializers.ValidationError({"token": "Invite already used."})
        attrs["invite"] = invite
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        invite: Invite = validated_data["invite"]
        user = User.objects.create_user(
            email=invite.email,
            password=validated_data["password"],
            first_name=validated_data.get("first_name") or invite.first_name,
            last_name=validated_data.get("last_name") or invite.last_name,
            department=invite.department,
            role=User.Roles.EMPLOYEE,
            company=invite.company,
        )
        invite.is_accepted = True
        invite.save(update_fields=["is_accepted"])
        return {"email": user.email}

# --------------------------
# Current User (Me)
# --------------------------
class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "role",
            "department", "phone", "location", "bio",
            "join_date", "gender", "date_of_birth",
            "nationality", "marital_status", "company",
        ]

# --------------------------
# User List
# --------------------------
class UserListSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="company.name", read_only=True)
    
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "department", "is_active", "company"]

# --------------------------
# Department Serializer
# --------------------------
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'icon', 'created_at']
        read_only_fields = ['id', 'created_at']

# --------------------------
# Survey & Question Serializers
# --------------------------
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'order']
        read_only_fields = ['id']


from django.db import transaction
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import Context, Template
from rest_framework import serializers

class SurveyCreateSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    audience = serializers.JSONField(write_only=True) 
    recipient_count = serializers.SerializerMethodField()

    class Meta:
        model = Survey
        fields = [
            'id', 'title', 'method', 'response_type', 
            'scheduled_for', 'survey_file', 'questions', 
            'audience', 'created_at', 'recipient_count'
        ]

    def get_recipient_count(self, obj):
        return obj.assignments.count()

    @transaction.atomic
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        audience_data = validated_data.pop('audience', {})
        request = self.context.get('request')
        user = request.user

        scheduled_time = validated_data.get('scheduled_for')
        should_send_now = scheduled_time is None
        
        survey = Survey.objects.create(
            company=user.company,
            created_by=user,
            emails_sent=should_send_now, 
            **validated_data
        )

        if questions_data:
            for index, q_data in enumerate(questions_data):
                Question.objects.create(survey=survey, text=q_data.get('text'), order=index)

        target_users = self._get_target_users(user.company, audience_data)
        assignments = [
            Assignment(survey=survey, user=target_user, status=Assignment.Status.PENDING)
            for target_user in target_users
        ]
        Assignment.objects.bulk_create(assignments, ignore_conflicts=True)

        if should_send_now:
            # Pass request to helper to get the correct Domain/Origin
            self._send_emails(survey, target_users, request)
        else:
            print(f"🕒 Survey '{survey.title}' scheduled for {scheduled_time}.")

        return survey

    def _send_emails(self, survey, users, request):
        """ Renders the HTML template and sends emails to all target users """
        origin = request.META.get('HTTP_ORIGIN') or "http://localhost:5173"
        
        try:
            # 1. Fetch the template from the database
            template_obj = EmailTemplate.objects.get(
                name="Survey Assignment",
                audience_type="employee",
                status="active"
            )
        except EmailTemplate.DoesNotExist:
            print("❌ Email template 'Survey Assignment' missing. Skipping emails.")
            return

        for employee in users:
            if not employee.email:
                continue

            try:
                # 2. Prepare dynamic context for each user
                context_data = {
                    "firstName": employee.first_name or "Employee",
                    "surveyTitle": survey.title,
                    "surveyLink": f"{origin}/surveys/{survey.id}",
                }

                # 3. Render Subject and Body
                subject = Template(template_obj.subject).render(Context(context_data))
                html_body = Template(template_obj.body).render(Context(context_data))

                # 4. Create and Send Email
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=f"New Survey Assigned: {survey.title}. Please view in HTML.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[employee.email],
                )
                email.attach_alternative(html_body, "text/html")
                email.send()
                
            except Exception as e:
                print(f"❌ Failed to send email to {employee.email}: {str(e)}")

    def _get_target_users(self, company, audience):
        # ... (Your existing filtering logic stays the same)
        audience_type = audience.get('type', 'all')
        selected_ids = audience.get('selected', []) 
        
        base_employees = User.objects.filter(
            company=company, 
            role=User.Roles.EMPLOYEE, 
            is_active=True
        )

        if audience_type == 'all':
            return base_employees
        elif audience_type == 'departments':
            return base_employees.filter(department_id__in=selected_ids)
        elif audience_type in ['specific', 'employees']:
            return base_employees.filter(id__in=selected_ids)
            
        return base_employees.none()

# ==========================================
# ✅ NEW: Survey Detail & Response Serializers
# ==========================================

class ResponseDetailSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    
    class Meta:
        model = Response
        fields = ['id', 'question_text', 'answer_text', 'created_at']

class AssignmentDetailSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField() # ✅ Changed to MethodField
    responses = ResponseDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'user_name', 'user_email', 'status', 'assigned_at', 'completed_at', 'responses']

    def get_user_name(self, obj):
        # ✅ Security: If anonymous, hide the name
        if obj.survey.response_type == 'anonymous':
            return "Anonymous User"
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email

    def get_user_email(self, obj):
        # ✅ Security: If anonymous, hide the email
        if obj.survey.response_type == 'anonymous':
            return None 
        return obj.user.email

class SurveyRetrieveSerializer(serializers.ModelSerializer):
    assignments = AssignmentDetailSerializer(many=True, read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Survey
        fields = ['id', 'title', 'method', 'created_at', 'questions', 'assignments']


class EmployeeAssignmentListSerializer(serializers.ModelSerializer):
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    survey_method = serializers.CharField(source='survey.method', read_only=True)
    # ✅ NEW: Add this field
    survey_response_type = serializers.CharField(source='survey.response_type', read_only=True)
    
    class Meta:
        model = Assignment
        # ✅ Add 'survey_response_type' to fields
        fields = ['id', 'survey_title', 'survey_method', 'survey_response_type', 'status', 'assigned_at', 'completed_at']

class EmployeeSurveyTakeSerializer(serializers.ModelSerializer):
    """ Used when an employee opens a survey to take it """
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'survey_title', 'status', 'questions']

    def get_questions(self, obj):
        # Return questions linked to the Survey of this Assignment
        questions = obj.survey.questions.all().order_by('order')
        return QuestionSerializer(questions, many=True).data
    
from rest_framework import serializers
from .models import EmailTemplate

class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = [
            "id",
            "name",
            "subject",
            "body",
            "category",
            "audience_type",
            "status",
            "variables",
            "is_system",
            "created_at",
            "updated_at",
            "company",
        ]
        read_only_fields = ["id", "updated_at"]

# --------------------------
# Eisenhower Matrix Serializer
# --------------------------
class EisenhowerTaskSerializer(serializers.ModelSerializer):
    # 👇 This block must be indented (4 spaces)
    class Meta:
        model = EisenhowerTask
        fields = ['id', 'text', 'quadrant', 'created_at']
        read_only_fields = ['id', 'created_at']