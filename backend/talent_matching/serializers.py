import hashlib

from django.db import transaction
from rest_framework import serializers

from accounts.models import Recruitee

from .models import CandidateCV, CandidateJobApplication, CVJobMatch, JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPosting
        fields = [
            "id",
            "company",
            "created_by",
            "title",
            "description",
            "status",
            "required_template_codes",
            "ranking_weights",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "company", "created_by", "created_at", "updated_at"]


class CandidateCVSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateCV
        fields = [
            "id",
            "recruitee",
            "file",
            "extracted_text",
            "checksum",
            "is_active",
            "uploaded_at",
        ]
        read_only_fields = ["id", "checksum", "extracted_text", "uploaded_at"]


class CandidateJobApplicationSerializer(serializers.ModelSerializer):
    recruitee_email = serializers.EmailField(source="recruitee.email", read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)

    class Meta:
        model = CandidateJobApplication
        fields = [
            "id",
            "recruitee",
            "recruitee_email",
            "job",
            "job_title",
            "stage",
            "notes",
            "source",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class CVJobMatchSerializer(serializers.ModelSerializer):
    candidate_id = serializers.UUIDField(source="application.recruitee.id", read_only=True)
    candidate_name = serializers.SerializerMethodField()

    class Meta:
        model = CVJobMatch
        fields = [
            "id",
            "application",
            "cv",
            "job",
            "score",
            "fit_label",
            "summary",
            "ranking_breakdown",
            "created_at",
            "candidate_id",
            "candidate_name",
        ]

    def get_candidate_name(self, obj):
        first = obj.application.recruitee.first_name or ""
        last = obj.application.recruitee.last_name or ""
        full_name = f"{first} {last}".strip()
        return full_name or obj.application.recruitee.email


class CandidateCVUploadSerializer(serializers.Serializer):
    recruitee_id = serializers.UUIDField()
    file = serializers.FileField()
    is_active = serializers.BooleanField(default=True)

    def validate_recruitee_id(self, value):
        if not Recruitee.objects.filter(id=value).exists():
            raise serializers.ValidationError("Candidate not found.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        recruitee = Recruitee.objects.get(id=validated_data["recruitee_id"])
        upload_file = validated_data["file"]
        content = upload_file.read()
        upload_file.seek(0)

        checksum = hashlib.sha256(content).hexdigest()
        extracted_text = ""
        if upload_file.name.lower().endswith(".txt"):
            extracted_text = content.decode("utf-8", errors="ignore")

        if validated_data.get("is_active", True):
            CandidateCV.objects.filter(recruitee=recruitee, is_active=True).update(is_active=False)

        return CandidateCV.objects.create(
            recruitee=recruitee,
            file=upload_file,
            extracted_text=extracted_text,
            checksum=checksum,
            is_active=validated_data.get("is_active", True),
        )


class TalentMatchRequestSerializer(serializers.Serializer):
    job_id = serializers.IntegerField()
    candidate_id = serializers.UUIDField(required=False)
    cv_id = serializers.IntegerField(required=False)
    job_description = serializers.CharField(required=False, allow_blank=True)
    cv = serializers.FileField(required=False)

    def validate(self, attrs):
        job_id = attrs.get("job_id")
        if not JobPosting.objects.filter(id=job_id).exists():
            raise serializers.ValidationError({"job_id": "Job not found."})

        candidate_id = attrs.get("candidate_id")
        cv_id = attrs.get("cv_id")
        cv_file = attrs.get("cv")

        if cv_file is None and not (candidate_id and cv_id):
            raise serializers.ValidationError(
                "Provide either direct cv file, or both candidate_id and cv_id."
            )

        if cv_id and not CandidateCV.objects.filter(id=cv_id).exists():
            raise serializers.ValidationError({"cv_id": "CV not found."})

        if candidate_id and not Recruitee.objects.filter(id=candidate_id).exists():
            raise serializers.ValidationError({"candidate_id": "Candidate not found."})

        return attrs


class RankedPipelineItemSerializer(serializers.Serializer):
    application_id = serializers.IntegerField()
    candidate_id = serializers.UUIDField()
    candidate_name = serializers.CharField()
    candidate_email = serializers.EmailField()
    stage = serializers.CharField()
    cv_score = serializers.FloatField()
    completion_score = serializers.FloatField()
    quality_score = serializers.FloatField()
    overall_score = serializers.FloatField()
    explanation = serializers.CharField()
    history_count = serializers.IntegerField()
    has_history = serializers.BooleanField()
    latest_match_id = serializers.IntegerField(allow_null=True)
    latest_fit_label = serializers.CharField(allow_blank=True)
    latest_summary = serializers.CharField(allow_blank=True)
    latest_matched_at = serializers.DateTimeField(allow_null=True)


class CandidateApplicationAttachSerializer(serializers.Serializer):
    candidate_id = serializers.UUIDField()
    job_id = serializers.IntegerField()
    source = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
