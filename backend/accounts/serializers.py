from uuid import UUID
from .models import User, Company, Recruitee, Invite
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers


User = get_user_model()


# ---------- HR self-signup ----------
class SignupSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "company_name"]

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

class RecruiteeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recruitee
        fields = "__all__"
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

# ---------- HR creates invite ----------
class InviteCreateSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Invite
        fields = ["id", "email", "department", "first_name", "last_name", "company_name"]

    def create(self, validated_data):
        user = self.context["request"].user
        if user.role != User.Roles.HR:
            raise serializers.ValidationError("Only HR can create invites.")

        # Ensure department defaults to HR if not provided
        if "department" not in validated_data or not validated_data["department"]:
            validated_data["department"] = User.Departments.HR

        # Explicitly assign HR's company
        validated_data["company"] = user.company

        return Invite.objects.create(created_by=user, **validated_data)

# ---------- Employee accepts invite ----------
class AcceptInviteSerializer(serializers.Serializer):
    # Inputs (write-only)
    token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    last_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    Company_name = serializers.CharField(required=False, allow_blank=True, write_only=True)

    # Output
    email = serializers.EmailField(read_only=True)

    def validate_password(self, value):
        # Apply Django password validators
        validate_password(value)
        return value

    def validate(self, attrs):
        raw = (attrs.get("token") or "").strip()

        # Ensure UUID format
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


# ---------- Current user ----------
class UserMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
                    "id",
                    "email",
                    "first_name",
                    "last_name",
                    "role",
                    "department",
                    "phone",
                    "location",
                    "bio",
                    "join_date",
                    "gender",
                    "date_of_birth",
                    "nationality",
                    "marital_status",
                    "company",
                ]
from assessments.models import Assignment
class UserListSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="company.name", read_only=True)
    last_assessment = serializers.SerializerMethodField()
    latest_risk = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "role",
            "department",
            "is_active",
            "last_assessment",
            "latest_risk",
            "company",
        ]

    def get_last_assessment(self, obj):
        qs = getattr(obj, "assignments", None)
        if not qs:
            return None
        latest = qs.filter(status=Assignment.Status.COMPLETED).order_by("-completed_at").first()
        return latest.completed_at.isoformat() if (latest and latest.completed_at) else None

    def get_latest_risk(self, obj):
        qs = getattr(obj, "assignments", None)
        if not qs:
            return 0

        # Prefer the most recently COMPLETED assignment
        a = qs.filter(status=Assignment.Status.COMPLETED).order_by("-completed_at").first() or \
            qs.order_by("-assigned_at").first()
        if not a:
            return 0

        metrics = getattr(a, "metrics", None)
        if isinstance(metrics, dict):
            # 1) explicit numeric risk if provided
            risk = metrics.get("risk", None)
            if isinstance(risk, (int, float)):
                return int(risk)

            # 2) derive a coarse risk from Karasek quadrant if present
            quadrant = metrics.get("quadrant")
            if isinstance(quadrant, str):
                mapping = {
                    "highStrain": 80,
                    "active": 50,
                    "passive": 40,
                    "lowStrain": 20,
                }
                return int(mapping.get(quadrant, 0))

            # 3) optional: simple heuristics from dims (D/C)
            dims = metrics.get("dim")
            if isinstance(dims, dict):
                d = dims.get("D", 0)
                c = dims.get("C", 0)
                # high demand + low control → higher risk
                if d >= 60 and c < 60:
                    return 70
                if d >= 60 and c >= 60:
                    return 50
                if d < 60 and c < 60:
                    return 40
                return 25

            # 4) optional: Maslach-like stub (exhaustion drives risk)
            burnout = metrics.get("burnout")
            if isinstance(burnout, dict):
                exh = burnout.get("exhaustion", 0)
                return int(exh) if isinstance(exh, (int, float)) else 0

        return 0
