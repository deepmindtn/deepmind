from uuid import UUID
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

# Models
from .models import User, Company, Recruitee, Invite, Department, Survey, Question, Assignment

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

# accounts/serializers.py

class SurveyCreateSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False)
    audience = serializers.JSONField(write_only=True)
    
    # ✅ NEW: Calculate how many people received it
    recipient_count = serializers.SerializerMethodField()

    class Meta:
        model = Survey
        # ✅ ADD 'created_at' and 'recipient_count' here
        fields = [
            'id', 'title', 'method', 'response_type', 
            'scheduled_for', 'survey_file', 'questions', 
            'audience', 'created_at', 'recipient_count'
        ]

    def get_recipient_count(self, obj):
        # Counts how many assignments exist for this survey
        return obj.assignments.count()

    @transaction.atomic
    def create(self, validated_data):
        # ... (Keep your existing create logic exactly as it is) ...
        questions_data = validated_data.pop('questions', [])
        audience_data = validated_data.pop('audience', {})
        user = self.context['request'].user

        survey = Survey.objects.create(
            company=user.company,
            created_by=user,
            **validated_data
        )

        if survey.method == 'manual':
            for index, q_data in enumerate(questions_data):
                Question.objects.create(
                    survey=survey,
                    text=q_data.get('text'),
                    order=index
                )

        target_users = self._get_target_users(user.company, audience_data)
        
        assignments = []
        for target_user in target_users:
            assignments.append(Assignment(
                survey=survey,
                user=target_user,
                status=Assignment.Status.PENDING
            ))
        
        Assignment.objects.bulk_create(assignments, ignore_conflicts=True)

        return survey

    def _get_target_users(self, company, audience):
        # ... (Keep your existing logic) ...
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
            dept_names = Department.objects.filter(
                id__in=selected_ids, 
                company=company
            ).values_list('name', flat=True)
            return base_employees.filter(department__in=dept_names)
        elif audience_type == 'specific' or audience_type == 'employees':
            return base_employees.filter(id__in=selected_ids)
            
        return base_employees.none()