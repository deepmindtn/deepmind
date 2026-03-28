import numpy as np
from django.conf import settings
from django.db.models import Count, Q
from openai import OpenAI
from PyPDF2 import PdfReader
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Recruitee, User
from assessments.models import CandidateAssignment

from .models import CandidateCV, CandidateJobApplication, CVJobMatch, JobPosting
from .serializers import (
    CandidateCVSerializer,
    CandidateCVUploadSerializer,
    CandidateJobApplicationSerializer,
    CVJobMatchSerializer,
    JobPostingSerializer,
    RankedPipelineItemSerializer,
    TalentMatchRequestSerializer,
)


class IsHR(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", "") == User.Roles.HR


def extract_text(file_obj):
    if file_obj.name.lower().endswith(".pdf"):
        reader = PdfReader(file_obj)
        text = "".join([page.extract_text() or "" for page in reader.pages])
    else:
        text = file_obj.read().decode("utf-8", errors="ignore")
    return text.strip()


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def fit_label_for_score(score):
    if score >= 85:
        return "Excellent match"
    if score >= 70:
        return "Strong match"
    if score >= 50:
        return "Moderate match"
    return "Low match"


class JobPostingListCreateView(generics.ListCreateAPIView):
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return JobPosting.objects.filter(company=self.request.user.company).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, created_by=self.request.user)


class JobPostingDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return JobPosting.objects.filter(company=self.request.user.company)


class JobPostingCloseView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request, pk):
        try:
            job = JobPosting.objects.get(pk=pk, company=request.user.company)
        except JobPosting.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        job.status = "closed"
        job.save(update_fields=["status", "updated_at"])
        return Response(JobPostingSerializer(job).data)


class CandidateCVListView(generics.ListAPIView):
    serializer_class = CandidateCVSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        candidate_id = self.kwargs.get("candidate_id")
        return CandidateCV.objects.filter(
            recruitee_id=candidate_id,
            recruitee__company=self.request.user.company,
        ).order_by("-uploaded_at")


class CandidateCVUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request):
        serializer = CandidateCVUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        candidate = Recruitee.objects.filter(
            id=serializer.validated_data["recruitee_id"],
            company=request.user.company,
        ).first()
        if not candidate:
            raise ValidationError({"recruitee_id": "Candidate not found in your company."})

        cv = serializer.save()
        return Response(CandidateCVSerializer(cv).data, status=status.HTTP_201_CREATED)


class CandidateCVSetActiveView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request, pk):
        try:
            cv = CandidateCV.objects.select_related("recruitee").get(
                pk=pk,
                recruitee__company=request.user.company,
            )
        except CandidateCV.DoesNotExist:
            return Response({"detail": "CV not found."}, status=status.HTTP_404_NOT_FOUND)

        CandidateCV.objects.filter(recruitee=cv.recruitee, is_active=True).update(is_active=False)
        cv.is_active = True
        cv.save(update_fields=["is_active"])
        return Response(CandidateCVSerializer(cv).data)


class CandidateCVDeleteView(generics.DestroyAPIView):
    queryset = CandidateCV.objects.select_related("recruitee")
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return self.queryset.filter(recruitee__company=self.request.user.company)


class CandidateJobApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = CandidateJobApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        qs = CandidateJobApplication.objects.select_related("job", "recruitee")
        qs = qs.filter(recruitee__company=self.request.user.company)
        job_id = self.request.query_params.get("job_id")
        if job_id:
            qs = qs.filter(job_id=job_id)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        recruitee = serializer.validated_data.get("recruitee")
        job = serializer.validated_data.get("job")

        if recruitee and recruitee.company_id != self.request.user.company_id:
            raise ValidationError({"recruitee": "Candidate not found in your company."})
        if job and job.company_id != self.request.user.company_id:
            raise ValidationError({"job": "Job not found in your company."})

        serializer.save(created_by=self.request.user)


class TalentMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request):
        serializer = TalentMatchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            job = JobPosting.objects.get(id=data["job_id"], company=request.user.company)
        except JobPosting.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)
        candidate = None
        cv = None

        if data.get("cv_id"):
            try:
                cv = CandidateCV.objects.select_related("recruitee").get(
                    id=data["cv_id"],
                    recruitee__company=request.user.company,
                )
            except CandidateCV.DoesNotExist:
                return Response({"detail": "CV not found."}, status=status.HTTP_404_NOT_FOUND)
            candidate = cv.recruitee

        if data.get("candidate_id") and not candidate:
            try:
                candidate = Recruitee.objects.get(
                    id=data["candidate_id"],
                    company=request.user.company,
                )
            except Recruitee.DoesNotExist:
                return Response({"detail": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        # support direct ad-hoc file for compatibility; persist only if candidate exists
        cv_text = ""
        upload_file = data.get("cv")
        if upload_file is not None:
            cv_text = extract_text(upload_file)
        elif cv is not None:
            cv_text = cv.extracted_text
            if not cv_text and cv.file:
                with cv.file.open("rb") as f:
                    cv_text = extract_text(f)

        jd_text = data.get("job_description") or job.description

        if not cv_text or not jd_text:
            return Response(
                {"detail": "CV text and job description are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        cv_embedding = client.embeddings.create(
            model="text-embedding-3-large", input=cv_text
        ).data[0].embedding
        jd_embedding = client.embeddings.create(
            model="text-embedding-3-large", input=jd_text
        ).data[0].embedding

        similarity = cosine_similarity(np.array(cv_embedding), np.array(jd_embedding))
        score = round(float(similarity) * 100, 2)
        fit_label = fit_label_for_score(score)

        application = None
        if candidate is not None:
            application, _ = CandidateJobApplication.objects.get_or_create(
                recruitee=candidate,
                job=job,
                defaults={"created_by": request.user},
            )

        match = None
        if application is not None and cv is not None:
            breakdown = {
                "cv_score": score,
                "completion_score": 0,
                "quality_score": 0,
                "overall_score": score,
            }
            match = CVJobMatch.objects.create(
                application=application,
                cv=cv,
                job=job,
                score=score,
                fit_label=fit_label,
                summary=f"Similarity-based AI match score: {score} ({fit_label}).",
                ranking_breakdown=breakdown,
            )

        response_payload = {
            "score": score,
            "fit": fit_label,
            "summary": f"Similarity-based AI match score: {score} ({fit_label}).",
        }
        if match is not None:
            response_payload["match"] = CVJobMatchSerializer(match).data

        return Response(response_payload)


class RankedPipelineView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request, job_id):
        try:
            job = JobPosting.objects.get(id=job_id, company=request.user.company)
        except JobPosting.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        applications = CandidateJobApplication.objects.select_related("recruitee", "job").filter(job=job)

        items = []
        for app in applications:
            latest_match = app.matches.order_by("-created_at").first()
            cv_score = latest_match.score if latest_match else 0.0

            stats = CandidateAssignment.objects.filter(recruitee=app.recruitee).aggregate(
                total=Count("id"),
                completed=Count("id", filter=Q(status="COMPLETED")),
            )
            total = stats["total"] or 0
            completed = stats["completed"] or 0
            completion_score = round((completed / total) * 100, 2) if total > 0 else 0.0

            # Simple quality proxy: completion ratio weighted by minimum completion threshold
            quality_score = round(min(completion_score, 100.0), 2)
            overall = round((0.6 * cv_score) + (0.2 * completion_score) + (0.2 * quality_score), 2)

            candidate_name = f"{app.recruitee.first_name or ''} {app.recruitee.last_name or ''}".strip()
            if not candidate_name:
                candidate_name = app.recruitee.email

            explanation = (
                f"CV fit {cv_score:.1f}, assessments completed {completed}/{total}, "
                f"quality score {quality_score:.1f}."
            )

            items.append(
                {
                    "application_id": app.id,
                    "candidate_id": app.recruitee.id,
                    "candidate_name": candidate_name,
                    "candidate_email": app.recruitee.email,
                    "stage": app.stage,
                    "cv_score": cv_score,
                    "completion_score": completion_score,
                    "quality_score": quality_score,
                    "overall_score": overall,
                    "explanation": explanation,
                }
            )

        items.sort(key=lambda x: x["overall_score"], reverse=True)
        serializer = RankedPipelineItemSerializer(items, many=True)
        return Response(serializer.data)
