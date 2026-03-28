import json
import re
from hashlib import sha256

import numpy as np
from django.conf import settings
from django.db.models import Count, Q
from langchain_openai import ChatOpenAI
from openai import OpenAI
from pydantic import BaseModel, Field
from PyPDF2 import PdfReader
from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Recruitee, User
from assessments.models import CandidateAssignment

from .models import CandidateCV, CandidateJobApplication, CVJobMatch, JobPosting
from .serializers import (
    CandidateApplicationAttachSerializer,
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


STOPWORDS = {
    "the", "and", "for", "with", "that", "this", "from", "your", "our", "you",
    "are", "was", "were", "will", "can", "must", "have", "has", "had", "but",
    "not", "into", "their", "about", "over", "under", "than", "then", "also",
    "any", "all", "such", "job", "role", "work", "team", "years", "year", "etc",
}


class MatchDimension(BaseModel):
    name: str = Field(description="Comparison axis name")
    score: float = Field(description="Axis score 0-100", ge=0, le=100)
    rationale: str = Field(description="2-3 sentence rationale")


class TalentMatchAnalysis(BaseModel):
    summary: str = Field(description="3-5 sentence summary of alignment")
    strengths: list[str] = Field(description="Top matching strengths")
    gaps: list[str] = Field(description="Main missing requirements")
    recommendations: list[str] = Field(description="Actionable next steps for HR")
    dimensions: list[MatchDimension] = Field(
        description="At least 4 dimensions: skills, experience, domain, communication"
    )
    must_have_coverage: float = Field(description="Coverage of mandatory requirements", ge=0, le=100)
    nice_to_have_coverage: float = Field(description="Coverage of optional requirements", ge=0, le=100)
    confidence: str = Field(description="Low, Medium, or High confidence")


def _tokenize_for_keywords(text):
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+.#-]{2,}", (text or "").lower())
    return [w for w in words if w not in STOPWORDS]


def _keyword_overlap_metrics(job_text, cv_text):
    job_tokens = _tokenize_for_keywords(job_text)
    cv_tokens = set(_tokenize_for_keywords(cv_text))

    frequency = {}
    for token in job_tokens:
        frequency[token] = frequency.get(token, 0) + 1

    required_keywords = [
        k for k, _v in sorted(frequency.items(), key=lambda x: x[1], reverse=True)[:40]
    ]
    required_set = set(required_keywords)
    overlap = sorted(required_set.intersection(cv_tokens))
    missing = sorted(required_set.difference(cv_tokens))

    score = round((len(overlap) / max(len(required_set), 1)) * 100, 2)
    return {
        "required_keywords": required_keywords,
        "overlap_keywords": overlap,
        "missing_keywords": missing,
        "keyword_overlap_score": score,
    }


def _run_structured_match_analysis(job_text, cv_text):
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
    structured_llm = llm.with_structured_output(TalentMatchAnalysis)

    prompt = f"""You are a senior technical recruiter and talent intelligence analyst.
Compare this job description against the resume and return a strict structured analysis.

JOB DESCRIPTION:
{job_text}

RESUME:
{cv_text}

Rules:
1) Score each dimension from 0 to 100 with evidence-based rationale only.
2) Be explicit about missing mandatory requirements in gaps.
3) Recommendations must be practical hiring actions (interview focus, screening follow-up, etc).
4) Confidence should reflect clarity/completeness of resume evidence.
5) Keep summary concise but specific.
"""

    return structured_llm.invoke(prompt)


def _build_match_response_payload(match):
    breakdown = match.ranking_breakdown or {}
    return {
        "score": match.score,
        "fit": match.fit_label,
        "summary": match.summary,
        "comparison_metrics": breakdown.get("comparison_metrics", {}),
        "structured_analysis": breakdown.get("structured_analysis", {}),
        "scoring_components": {
            "embedding_score": breakdown.get("embedding_score"),
            "keyword_overlap_score": breakdown.get("keyword_overlap_score"),
            "llm_structured_score": breakdown.get("llm_structured_score"),
        },
        "match": CVJobMatchSerializer(match).data,
    }


class JobPostingListCreateView(generics.ListCreateAPIView):
    serializer_class = JobPostingSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return JobPosting.objects.filter(company=self.request.user.company).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company, created_by=self.request.user)


class JobPostingDetailView(generics.RetrieveUpdateDestroyAPIView):
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


class CandidateApplicationAttachView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request):
        serializer = CandidateApplicationAttachSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            candidate = Recruitee.objects.get(
                id=data["candidate_id"],
                company=request.user.company,
            )
        except Recruitee.DoesNotExist:
            return Response({"detail": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            job = JobPosting.objects.get(id=data["job_id"], company=request.user.company)
        except JobPosting.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        application, created = CandidateJobApplication.objects.get_or_create(
            recruitee=candidate,
            job=job,
            defaults={
                "created_by": request.user,
                "source": data.get("source", ""),
                "notes": data.get("notes", ""),
            },
        )

        if not created:
            if "source" in data:
                application.source = data.get("source", application.source)
            if "notes" in data:
                application.notes = data.get("notes", application.notes)
            application.save(update_fields=["source", "notes", "updated_at"])

        return Response(CandidateJobApplicationSerializer(application).data)


class CandidateApplicationDetachView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request, pk):
        try:
            application = CandidateJobApplication.objects.select_related("recruitee").get(
                pk=pk,
                recruitee__company=request.user.company,
            )
        except CandidateJobApplication.DoesNotExist:
            return Response({"detail": "Application not found."}, status=status.HTTP_404_NOT_FOUND)

        application.job = None
        application.save(update_fields=["job", "updated_at"])
        return Response(CandidateJobApplicationSerializer(application).data)


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

        # support direct ad-hoc file and candidate-linked CV matching
        cv_text = ""
        cv_file_bytes = None
        upload_file = data.get("cv")
        if upload_file is not None:
            cv_file_bytes = upload_file.read()
            upload_file.seek(0)
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
        embedding_score = round(float(similarity) * 100, 2)

        keyword_metrics = _keyword_overlap_metrics(jd_text, cv_text)
        keyword_score = keyword_metrics["keyword_overlap_score"]

        try:
            structured_analysis = _run_structured_match_analysis(jd_text, cv_text)
            dimensions = structured_analysis.dimensions or []
            dimension_avg = round(
                float(np.mean([d.score for d in dimensions])) if dimensions else 0.0,
                2,
            )
            coverage_score = round(
                (structured_analysis.must_have_coverage * 0.7)
                + (structured_analysis.nice_to_have_coverage * 0.3),
                2,
            )
            llm_score = round((dimension_avg * 0.6) + (coverage_score * 0.4), 2)
            structured_dump = structured_analysis.model_dump()
        except Exception:
            structured_dump = {
                "summary": "LLM analysis fallback: semantic and keyword scoring used.",
                "strengths": [],
                "gaps": [],
                "recommendations": [],
                "dimensions": [],
                "must_have_coverage": 0,
                "nice_to_have_coverage": 0,
                "confidence": "Low",
            }
            llm_score = 0.0

        score = round((embedding_score * 0.45) + (keyword_score * 0.2) + (llm_score * 0.35), 2)
        fit_label = fit_label_for_score(score)

        application = None
        if candidate is not None:
            application, _ = CandidateJobApplication.objects.get_or_create(
                recruitee=candidate,
                job=job,
                defaults={"created_by": request.user},
            )

        if upload_file is not None and candidate is not None and cv is None:
            checksum = sha256(cv_file_bytes or b"").hexdigest() if cv_file_bytes else ""
            CandidateCV.objects.filter(recruitee=candidate, is_active=True).update(is_active=False)
            upload_file.seek(0)
            cv = CandidateCV.objects.create(
                recruitee=candidate,
                file=upload_file,
                extracted_text=cv_text,
                checksum=checksum,
                is_active=True,
            )

        match = None
        if application is not None and cv is not None:
            breakdown = {
                "embedding_score": embedding_score,
                "keyword_overlap_score": keyword_score,
                "llm_structured_score": llm_score,
                "cv_score": score,
                "completion_score": 0,
                "quality_score": 0,
                "overall_score": score,
                "comparison_metrics": keyword_metrics,
                "structured_analysis": structured_dump,
            }
            match = CVJobMatch.objects.create(
                application=application,
                cv=cv,
                job=job,
                score=score,
                fit_label=fit_label,
                summary=structured_dump.get("summary")
                or f"Composite AI fit score: {score} ({fit_label}).",
                ranking_breakdown=breakdown,
            )

        response_payload = {
            "score": score,
            "fit": fit_label,
            "summary": structured_dump.get("summary")
            or f"Composite AI fit score: {score} ({fit_label}).",
            "comparison_metrics": keyword_metrics,
            "structured_analysis": structured_dump,
            "scoring_components": {
                "embedding_score": embedding_score,
                "keyword_overlap_score": keyword_score,
                "llm_structured_score": llm_score,
            },
        }
        if match is not None:
            response_payload = _build_match_response_payload(match)

        return Response(response_payload)


class CandidateMatchHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request, job_id, candidate_id):
        try:
            JobPosting.objects.get(id=job_id, company=request.user.company)
        except JobPosting.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        candidate_exists = Recruitee.objects.filter(
            id=candidate_id,
            company=request.user.company,
        ).exists()
        if not candidate_exists:
            return Response({"detail": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        matches = (
            CVJobMatch.objects.select_related("cv", "application")
            .filter(
                job_id=job_id,
                application__recruitee_id=candidate_id,
                application__recruitee__company=request.user.company,
            )
            .order_by("-created_at")
        )

        history = []
        for match in matches:
            breakdown = match.ranking_breakdown or {}
            history.append(
                {
                    "id": match.id,
                    "score": match.score,
                    "fit_label": match.fit_label,
                    "summary": match.summary,
                    "created_at": match.created_at,
                    "cv_id": match.cv_id,
                    "cv_uploaded_at": match.cv.uploaded_at if match.cv_id else None,
                    "scoring_components": {
                        "embedding_score": breakdown.get("embedding_score"),
                        "keyword_overlap_score": breakdown.get("keyword_overlap_score"),
                        "llm_structured_score": breakdown.get("llm_structured_score"),
                    },
                }
            )

        latest = history[0] if history else None
        return Response(
            {
                "job_id": job_id,
                "candidate_id": candidate_id,
                "count": len(history),
                "latest_match_id": latest.get("id") if latest else None,
                "history": history,
            }
        )


class CVJobMatchDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request, pk):
        try:
            match = CVJobMatch.objects.select_related(
                "cv",
                "job",
                "application",
                "application__recruitee",
            ).get(
                pk=pk,
                application__recruitee__company=request.user.company,
                job__company=request.user.company,
            )
        except CVJobMatch.DoesNotExist:
            return Response({"detail": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(_build_match_response_payload(match))


class RankedPipelineView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request, job_id):
        try:
            job = JobPosting.objects.get(id=job_id, company=request.user.company)
        except JobPosting.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        applications = (
            CandidateJobApplication.objects.select_related("recruitee", "job")
            .prefetch_related("matches")
            .filter(job=job)
        )

        items = []
        for app in applications:
            history = list(app.matches.all())
            latest_match = history[0] if history else None
            history_count = len(history)
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

            if latest_match and latest_match.ranking_breakdown:
                analysis_summary = latest_match.ranking_breakdown.get("structured_analysis", {}).get("summary", "")
            else:
                analysis_summary = "No CV analysis has been run yet for this job/candidate pair."

            explanation = (
                f"CV fit {cv_score:.1f}, assessments completed {completed}/{total}, "
                f"quality score {quality_score:.1f}. {analysis_summary}"
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
                    "history_count": history_count,
                    "has_history": history_count > 0,
                    "latest_match_id": latest_match.id if latest_match else None,
                    "latest_fit_label": latest_match.fit_label if latest_match else "",
                    "latest_summary": latest_match.summary if latest_match else "",
                    "latest_matched_at": latest_match.created_at if latest_match else None,
                }
            )

        items.sort(key=lambda x: x["overall_score"], reverse=True)
        serializer = RankedPipelineItemSerializer(items, many=True)
        return Response(serializer.data)
