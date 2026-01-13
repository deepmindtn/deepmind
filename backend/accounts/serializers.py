from uuid import UUID
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

# Models
from .models import User, Company, Recruitee, Invite, Department

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

        # create or reuse company
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
# HR Creates Invite (✅ UPDATED)
# --------------------------
class InviteCreateSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    
    # We accept the ID from the frontend grid selector
    department_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Invite
        # Added department_id to fields
        fields = ["id", "email", "department", "department_id", "first_name", "last_name", "company_name"]
        read_only_fields = ["id", "created_at", "department"] 

    def create(self, validated_data):
        user = self.context["request"].user
        dept_id = validated_data.pop("department_id", None)

        if user.role != User.Roles.HR:
            raise serializers.ValidationError("Only HR can create invites.")

        # Logic: Look up the department Name based on the ID provided
        dept_name = User.Departments.HR # Default fallback
        
        if dept_id:
            try:
                dept_obj = Department.objects.get(id=dept_id, company=user.company)
                dept_name = dept_obj.name # We save the Name string to the Invite
            except Department.DoesNotExist:
                raise serializers.ValidationError({"department_id": "Invalid department selection."})
        
        # Explicitly assign fields
        validated_data["department"] = dept_name
        validated_data["company"] = user.company

        return Invite.objects.create(created_by=user, **validated_data)


# --------------------------
# Employee Accepts Invite
# --------------------------
class AcceptInviteSerializer(serializers.Serializer):
    # Inputs (write-only)
    token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    last_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    # Output
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
    last_assessment = serializers.SerializerMethodField()
    latest_risk = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name", "role",
            "department", "is_active", "last_assessment",
            "latest_risk", "company",
        ]

    def get_last_assessment(self, obj):
        from assessments.models import Assignment
        qs = getattr(obj, "assignments", None)
        if not qs: return None
        latest = qs.filter(status=Assignment.Status.COMPLETED).order_by("-completed_at").first()
        return latest.completed_at.isoformat() if (latest and latest.completed_at) else None

    def get_latest_risk(self, obj):
        from assessments.models import Assignment
        qs = getattr(obj, "assignments", None)
        if not qs: return 0
        a = qs.filter(status=Assignment.Status.COMPLETED).order_by("-completed_at").first() or \
            qs.order_by("-assigned_at").first()
        if not a: return 0

        metrics = getattr(a, "metrics", None)
        if isinstance(metrics, dict):
            risk = metrics.get("risk", None)
            if isinstance(risk, (int, float)): return int(risk)
            
            quadrant = metrics.get("quadrant")
            if isinstance(quadrant, str):
                mapping = { "highStrain": 80, "active": 50, "passive": 40, "lowStrain": 20 }
                return int(mapping.get(quadrant, 0))
            
            dims = metrics.get("dim")
            if isinstance(dims, dict):
                d = dims.get("D", 0); c = dims.get("C", 0)
                if d >= 60 and c < 60: return 70
                if d >= 60 and c >= 60: return 50
                if d < 60 and c < 60: return 40
                return 25
            
            burnout = metrics.get("burnout")
            if isinstance(burnout, dict):
                exh = burnout.get("exhaustion", 0)
                return int(exh) if isinstance(exh, (int, float)) else 0
        return 0


# --------------------------
# Department Serializer (✅ Added Icon)
# --------------------------
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'icon', 'created_at']
        read_only_fields = ['id', 'created_at']