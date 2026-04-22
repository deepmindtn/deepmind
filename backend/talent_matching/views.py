import json
import re
from hashlib import sha256

import numpy as np
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.db import IntegrityError
from django.db.models import Q
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
from core.pagination import FixedPageSizePagination

from .models import (
    CandidateCV,
    CandidateJobApplication,
    CandidateScoreExplanation,
    CVJobMatch,
    JobPosting,
)
from .serializers import (
    CandidateApplicationAttachSerializer,
    CandidateBulkStatusUpdateSerializer,
    CandidateCVSerializer,
    CandidateCVUploadSerializer,
    CandidateJobApplicationSerializer,
    CandidateScoreExplanationDetailSerializer,
    CandidateScoreExplanationListSerializer,
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


class RankingAssessmentInsight(BaseModel):
    template_code: str = Field(description="Assessment template code")
    template_name: str = Field(description="Assessment template name")
    score: float = Field(description="Assessment contribution score 0-100", ge=0, le=100)
    key_finding: str = Field(description="Most relevant finding from this assessment (2-3 sentences)")
    hr_implication: str = Field(description="Specific hiring implication for HR (1-2 sentences)")


class CandidateRankingExplanation(BaseModel):
    summary: str = Field(
        description="Executive summary of ranking (3-5 sentences). Explicitly mention scoring composition: CV %, Assessment %, Completion %."
    )
    candidate_profile: str = Field(
        description="Professional profile narrative. Include: background from CV, current career positioning, role fit relevance (3-4 sentences)"
    )
    candidacy_positioning: str = Field(
        description="How this candidate ranks vs. typical ideal profile for the role. Address fit signals, gaps, and relative strength (2-3 sentences)"
    )
    cv_fit_analysis: str = Field(
        description="Specific CV-to-role alignment. Include: key matching skills, relevant experience, gap areas (2-3 sentences)"
    )
    strengths: list[str] = Field(
        description="3-4 professional strengths relevant to hiring. Include both from CV and assessments with evidence."
    )
    weaknesses: list[str] = Field(
        description="2-3 meaningful development areas or risks. Be specific about what was observed."
    )
    key_findings: list[str] = Field(
        description="3-5 notable findings across CV and assessments. Include specific evidence (e.g., 'Assessment X score: 75%')"
    )
    assessment_insights: list[RankingAssessmentInsight] = Field(
        description="2-5 most relevant assessment insights with findings and hiring implications"
    )
    missing_assessments: list[str] = Field(
        description="Assigned but not completed assessments. Indicate impact on ranking clarity."
    )
    recommendations: list[str] = Field(
        description="3-4 actionable next steps for HR. Be specific: interview focus areas, reference checks, further assessments, etc."
    )
    profile_archetype: str = Field(
        description="2-4 word archetype label summarizing candidate profile, e.g. 'The Skilled Technician' or 'The Adaptable Performer'"
    )


def _safe_float(value, default=0.0):
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _clamp_score(value):
    return round(max(0.0, min(_safe_float(value, 0.0), 100.0)), 2)


def _scale_to_100(value, min_value, max_value):
    value = _safe_float(value, None)
    if value is None:
        return 0.0
    if max_value <= min_value:
        return 0.0
    normalized = ((value - min_value) / (max_value - min_value)) * 100
    return _clamp_score(normalized)


def _flatten_numeric_values(payload, depth=0, max_depth=4):
    if depth > max_depth:
        return []

    if isinstance(payload, dict):
        values = []
        for value in payload.values():
            values.extend(_flatten_numeric_values(value, depth + 1, max_depth))
        return values

    if isinstance(payload, list):
        values = []
        for value in payload:
            values.extend(_flatten_numeric_values(value, depth + 1, max_depth))
        return values

    number = _safe_float(payload, None)
    if number is None:
        return []

    if np.isnan(number) or np.isinf(number):
        return []
    return [number]


def _add_category_score(rows, label, score):
    rows.append(
        {
            "category": label,
            "score": _clamp_score(score),
        }
    )


def _to_json_compatible(payload):
    return json.loads(json.dumps(payload, cls=DjangoJSONEncoder))


def _template_category_scores(template_code, metrics):
    metrics = metrics if isinstance(metrics, dict) else {}
    code = (template_code or "").upper()
    rows = []

    if code == "BIG_FIVE":
        trait_scores = metrics.get("traitScores") or metrics.get("trait") or {}
        trait_map = {
            "N": "Neuroticism",
            "E": "Extraversion",
            "O": "Openness",
            "A": "Agreeableness",
            "C": "Conscientiousness",
        }
        for key, label in trait_map.items():
            if key in trait_scores:
                _add_category_score(rows, label, trait_scores.get(key))

    elif code == "DISC":
        percent_scores = metrics.get("percent") or {}
        trait_counts = metrics.get("trait") or {}
        trait_map = {
            "D": "Dominance",
            "I": "Influence",
            "S": "Steadiness",
            "C": "Compliance",
        }
        if percent_scores:
            for key, label in trait_map.items():
                if key in percent_scores:
                    _add_category_score(rows, label, percent_scores.get(key))
        elif trait_counts:
            total = sum(_safe_float(value, 0.0) for value in trait_counts.values())
            for key, label in trait_map.items():
                if key in trait_counts and total > 0:
                    _add_category_score(rows, label, (_safe_float(trait_counts.get(key), 0.0) / total) * 100)

    elif code == "KARASEK":
        dim_scores = metrics.get("dimScores") or metrics.get("dim") or {}
        if isinstance(dim_scores, dict):
            demands = _safe_float(dim_scores.get("D"), None)
            control = _safe_float(dim_scores.get("C"), None)
            support = _safe_float(dim_scores.get("S"), None)
            if demands is not None:
                # Mid-level demands are typically easier to sustain long term.
                _add_category_score(rows, "Demand Balance", 100 - (abs(demands - 50) * 2))
            if control is not None:
                _add_category_score(rows, "Decision Latitude", control)
            if support is not None:
                _add_category_score(rows, "Social Support", support)

    elif code == "MASLACH":
        sub_scores = metrics.get("subScores") or metrics.get("scores") or metrics
        if isinstance(sub_scores, dict):
            if "EE" in sub_scores:
                _add_category_score(rows, "Emotional Exhaustion", 100 - _safe_float(sub_scores.get("EE"), 0.0))
            if "DP" in sub_scores:
                _add_category_score(rows, "Depersonalization", 100 - _safe_float(sub_scores.get("DP"), 0.0))
            if "PA" in sub_scores:
                _add_category_score(rows, "Personal Accomplishment", sub_scores.get("PA"))

    elif code == "JSS":
        dim_scores = metrics.get("dimScores") or metrics.get("subscores") or {}
        if isinstance(dim_scores, dict):
            for key, value in dim_scores.items():
                _add_category_score(rows, str(key).replace("_", " ").title(), _scale_to_100(value, 4, 24))
        global_score = metrics.get("global") if "global" in metrics else metrics.get("total")
        if global_score is not None:
            max_value = 216 if _safe_float(global_score, 0.0) > 40 else 40
            _add_category_score(rows, "Overall Satisfaction", _scale_to_100(global_score, 0, max_value))

    elif code == "BRS":
        if "average" in metrics:
            _add_category_score(rows, "Resilience", _scale_to_100(metrics.get("average"), 1, 5))

    elif code == "CDRISC10":
        if "total" in metrics:
            _add_category_score(rows, "Resilience", _scale_to_100(metrics.get("total"), 0, 40))
        elif "average" in metrics:
            _add_category_score(rows, "Resilience", _scale_to_100(metrics.get("average"), 0, 4))

    elif code == "WSES":
        if "average" in metrics:
            _add_category_score(rows, "Work Self-Efficacy", _scale_to_100(metrics.get("average"), 1, 5))
        elif "total" in metrics:
            _add_category_score(rows, "Work Self-Efficacy", _scale_to_100(metrics.get("total"), 0, 40))

    elif code == "GCOS":
        autonomous = metrics.get("autonomous")
        controlled = metrics.get("controlled")
        impersonal = metrics.get("impersonal")
        if autonomous is not None:
            _add_category_score(rows, "Autonomous Orientation", _scale_to_100(autonomous, 1, 5))
        if controlled is not None:
            _add_category_score(rows, "Controlled Orientation", 100 - _scale_to_100(controlled, 1, 5))
        if impersonal is not None:
            _add_category_score(rows, "Impersonal Orientation", 100 - _scale_to_100(impersonal, 1, 5))

    elif code == "RIBS":
        if "average" in metrics:
            _add_category_score(rows, "Ideation", _scale_to_100(metrics.get("average"), 1, 5))
        elif "total" in metrics:
            _add_category_score(rows, "Ideation", _scale_to_100(metrics.get("total"), 0, 50))

    elif code == "CAQ":
        if "total" in metrics:
            _add_category_score(rows, "Creative Achievement", _scale_to_100(metrics.get("total"), 0, 20))
        domain_scores = metrics.get("domainScores") or {}
        if isinstance(domain_scores, dict):
            for key, value in domain_scores.items():
                _add_category_score(rows, str(key).replace("_", " ").title(), _scale_to_100(value, 0, 2))

    elif code == "ISE":
        if "average" in metrics:
            _add_category_score(rows, "Innovation Self-Efficacy", _scale_to_100(metrics.get("average"), 1, 5))
        elif "total" in metrics:
            _add_category_score(rows, "Innovation Self-Efficacy", _scale_to_100(metrics.get("total"), 0, 50))

    if rows:
        return rows

    if "score" in metrics:
        return [{"category": "Overall", "score": _clamp_score(metrics.get("score"))}]

    numeric_values = _flatten_numeric_values(metrics)
    if not numeric_values:
        return []

    max_value = max(numeric_values)
    min_value = min(numeric_values)
    if max_value <= 5:
        low_bound = 1 if min_value >= 1 else 0
        normalized = [_scale_to_100(value, low_bound, 5) for value in numeric_values]
    elif max_value <= 24:
        normalized = [_scale_to_100(value, 0, 24) for value in numeric_values]
    elif max_value <= 40:
        normalized = [_scale_to_100(value, 0, 40) for value in numeric_values]
    elif max_value <= 50:
        normalized = [_scale_to_100(value, 0, 50) for value in numeric_values]
    elif max_value <= 216:
        normalized = [_scale_to_100(value, 0, 216) for value in numeric_values]
    else:
        normalized = [_clamp_score(value) for value in numeric_values]

    return [
        {
            "category": "Composite Metrics",
            "score": round(float(np.mean(normalized)), 2),
        }
    ]


def _build_candidate_scoring_context(candidate):
    history = list(
        CVJobMatch.objects.select_related("job", "cv")
        .filter(application__recruitee=candidate)
        .order_by("-created_at")
    )
    latest_match = history[0] if history else None
    history_count = len(history)
    cv_score = round(_safe_float(latest_match.score), 2) if latest_match else 0.0

    assignments = list(
        CandidateAssignment.objects.select_related("template")
        .filter(recruitee=candidate)
        .order_by("-assigned_at")
    )
    total_assessments = len(assignments)
    completed_assignments = [
        assignment
        for assignment in assignments
        if (assignment.status or "").upper() == "COMPLETED"
    ]
    completed_assessments = len(completed_assignments)
    completion_score = (
        round((completed_assessments / total_assessments) * 100, 2)
        if total_assessments > 0
        else 0.0
    )

    assessment_breakdown = []
    assessment_base_scores = []
    assessment_inputs = []
    missing_assessment_labels = []
    for assignment in assignments:
        template_code = assignment.template.code if assignment.template_id else ""
        template_name = assignment.template.name if assignment.template_id else ""
        is_completed = (assignment.status or "").upper() == "COMPLETED"

        if not is_completed:
            missing_assessment_labels.append(template_name or template_code or f"Assessment #{assignment.id}")
            continue

        category_scores = _template_category_scores(template_code, assignment.metrics)
        base_score = round(float(np.mean([row["score"] for row in category_scores])), 2) if category_scores else 0.0
        assessment_base_scores.append(base_score)

        assessment_breakdown.append(
            {
                "assignment_id": assignment.id,
                "template_code": template_code,
                "template_name": template_name,
                "status": assignment.status,
                "completed_at": assignment.completed_at.isoformat() if assignment.completed_at else None,
                "base_score": base_score,
                "category_scores": category_scores,
                "metrics": assignment.metrics or {},
                "ai_report": assignment.ai_report or "",
            }
        )

        assessment_inputs.append(
            {
                "assignment_id": assignment.id,
                "template_code": template_code,
                "template_name": template_name,
                "completed_at": assignment.completed_at.isoformat() if assignment.completed_at else None,
                "metrics": assignment.metrics or {},
                "ai_report": assignment.ai_report or "",
            }
        )

    assessment_base_score = (
        round(float(np.mean(assessment_base_scores)), 2)
        if assessment_base_scores
        else 0.0
    )
    # Blend assessment evidence with CV fit so the assessment contribution remains tied to role-fit quality.
    assessment_score = (
        round((assessment_base_score * 0.8) + (cv_score * 0.2), 2)
        if assessment_base_scores
        else 0.0
    )
    overall_score = round(
        (cv_score * 0.55) + (assessment_score * 0.35) + (completion_score * 0.10),
        2,
    )

    structured_analysis = {}
    analysis_summary = "No CV analysis has been run yet for this candidate."
    if latest_match and latest_match.ranking_breakdown:
        structured_analysis = latest_match.ranking_breakdown.get("structured_analysis", {}) or {}
        analysis_summary = structured_analysis.get("summary") or analysis_summary

    return {
        "candidate": candidate,
        "latest_match": latest_match,
        "history_count": history_count,
        "cv_score": cv_score,
        "assessment_base_score": assessment_base_score,
        "assessment_score": assessment_score,
        "completion_score": completion_score,
        "overall_score": overall_score,
        "completed_assessments": completed_assessments,
        "total_assessments": total_assessments,
        "assessment_breakdown": assessment_breakdown,
        "assessment_inputs": assessment_inputs,
        "missing_assessments": missing_assessment_labels,
        "analysis_summary": analysis_summary,
        "structured_analysis": structured_analysis,
    }


def _build_scoring_snapshot_signature(scoring_context):
    completed_assignment_ids = sorted([
        item["assignment_id"]
        for item in scoring_context["assessment_breakdown"]
    ])
    snapshot_payload = {
        "latest_match_id": scoring_context["latest_match"].id if scoring_context["latest_match"] else None,
        "completed_assignment_ids": completed_assignment_ids,
    }
    serialized = json.dumps(snapshot_payload, sort_keys=True, default=str)
    return sha256(serialized.encode("utf-8")).hexdigest()


def _fallback_candidate_ranking_report(scoring_context):
    """Generate a fallback report when LLM is unavailable. Matches the enhanced schema."""
    candidate = scoring_context["candidate"]
    assessment_breakdown = scoring_context["assessment_breakdown"]
    
    # Sort assessments by score to identify strongest and weakest
    sorted_assessments = sorted(
        assessment_breakdown,
        key=lambda item: item.get("base_score", 0),
        reverse=True,
    )

    candidate_name = f"{candidate.first_name or ''} {candidate.last_name or ''}".strip() or candidate.email
    cv_score = scoring_context['cv_score']
    assessment_score = scoring_context['assessment_score']
    completion_score = scoring_context['completion_score']
    overall_score = scoring_context['overall_score']
    completed_assessments = scoring_context['completed_assessments']
    total_assessments = scoring_context['total_assessments']

    # Build summary with explicit scoring breakdown
    summary = (
        f"{candidate_name} has an overall ranking score of {overall_score:.1f}%. "
        f"This ranking is composed of: CV fit ({cv_score:.1f}%), "
        f"assessment contribution ({assessment_score:.1f}%), "
        f"and completion ({completion_score:.1f}%). "
        f"{completed_assessments} of {total_assessments} assigned assessments have been completed."
    )

    # Build strengths from top assessments and CV
    strengths = []
    for item in sorted_assessments[:2]:
        template_name = item.get("template_name") or item.get("template_code") or "Assessment"
        score = item.get("base_score", 0)
        strengths.append(f"{template_name}: Strong performance at {score:.1f}%, indicating reliable capability in this area.")
    
    if cv_score >= 70:
        strengths.append(f"Strong CV alignment with job requirements ({cv_score:.1f}% match), demonstrating relevant experience and skills.")
    
    if len(strengths) == 0:
        strengths = ["Profile available for interview-based assessment."]

    # Build weaknesses from lower assessments or missing data
    weaknesses = []
    if sorted_assessments:
        weakest = sorted_assessments[-1] if len(sorted_assessments) > 0 else None
        if weakest and weakest.get("base_score", 0) < 50:
            template_name = weakest.get("template_name") or weakest.get("template_code") or "Assessment"
            score = weakest.get("base_score", 0)
            weaknesses.append(f"{template_name}: Lower performance at {score:.1f}% suggests development opportunity in this competency.")
    
    if scoring_context['missing_assessments']:
        weaknesses.append(f"Pending assessments ({len(scoring_context['missing_assessments'])}): Cannot fully evaluate certain competencies until completion.")
    elif cv_score < 60:
        weaknesses.append(f"CV fit score is moderate at {cv_score:.1f}%, indicating some experience gaps vs. role requirements.")

    if len(weaknesses) == 0:
        weaknesses = ["No significant concerns identified from available data."]

    # Build key findings
    key_findings = [
        f"Completed {completed_assessments} of {total_assessments} assessments ({completion_score:.1f}% completion).",
    ]
    if sorted_assessments:
        top_template = sorted_assessments[0].get("template_name") or sorted_assessments[0].get("template_code") or "Top Assessment"
        top_score = sorted_assessments[0].get("base_score", 0)
        key_findings.append(f"Highest assessment performance: {top_template} at {top_score:.1f}%.")
    if cv_score > 0:
        key_findings.append(f"CV match analysis shows {cv_score:.1f}% alignment with job requirements.")

    # Build assessment insights from completed assessments
    assessment_insights = []
    for item in sorted_assessments[:4]:
        template_name = item.get("template_name") or item.get("template_code") or "Assessment"
        template_code = item.get("template_code") or ""
        score = item.get("base_score", 0)
        
        # Determine HR implication based on score
        if score >= 75:
            hr_implication = f"Strong signal in this area. Validate through interviews and use as strengths in role discussions."
        elif score >= 50:
            hr_implication = f"Moderate performance. Explore during interviews to understand context and development trajectory."
        else:
            hr_implication = f"Consider as development area or potential concern during interviewing. May require follow-up assessment."
        
        assessment_insights.append({
            "template_code": template_code,
            "template_name": template_name,
            "score": _clamp_score(score),
            "key_finding": f"{template_name} score: {score:.1f}%. This reflects the candidate's capability in this competency area.",
            "hr_implication": hr_implication,
        })

    # Build recommendations
    recommendations = []
    if completed_assessments < total_assessments:
        recommendations.append(f"Complete remaining {total_assessments - completed_assessments} pending assessment(s) before final decision.")
    
    recommendations.append("Conduct behavioral interview with focus on top assessment signals and CV role-fit areas.")
    
    if cv_score < 65:
        recommendations.append("Request detailed work history references to clarify any experience gaps noted in CV analysis.")
    
    recommendations.append("Review assessment results with hiring manager to align on role requirements vs. candidate profile.")

    # Determine profile archetype
    if overall_score >= 80:
        archetype = "Strong Fit"
    elif overall_score >= 65:
        archetype = "Solid Candidate"
    elif overall_score >= 50:
        archetype = "Emerging Prospect"
    else:
        archetype = "Development Needed"

    return {
        "summary": summary,
        "candidate_profile": f"{candidate_name} presents a professional background with {completed_assessments} completed psychometric assessments. Profile is based on CV analysis and available assessment evidence.",
        "candidacy_positioning": f"Based on overall score of {overall_score:.1f}%, candidate shows {'strong' if overall_score >= 75 else 'moderate' if overall_score >= 50 else 'developing'} fit for the role. Primary strength is in {'assessments' if assessment_score > cv_score else 'CV alignment'}.",
        "cv_fit_analysis": f"CV analysis indicates {cv_score:.1f}% match to job requirements, suggesting {'strong' if cv_score >= 75 else 'moderate' if cv_score >= 50 else 'developing'} alignment with role expectations.",
        "strengths": strengths,
        "weaknesses": weaknesses,
        "key_findings": key_findings,
        "assessment_insights": assessment_insights,
        "missing_assessments": scoring_context['missing_assessments'],
        "recommendations": recommendations,
        "profile_archetype": archetype,
    }


def _generate_candidate_ranking_report(scoring_context):
    candidate = scoring_context["candidate"]
    latest_match = scoring_context["latest_match"]
    candidate_name = f"{candidate.first_name or ''} {candidate.last_name or ''}".strip() or candidate.email

    if not settings.OPENAI_API_KEY:
        return _fallback_candidate_ranking_report(scoring_context)

    assessment_payload = json.dumps(scoring_context["assessment_inputs"], ensure_ascii=True, default=str)
    structured_payload = json.dumps(scoring_context["structured_analysis"], ensure_ascii=True, default=str)
    assessment_breakdown = json.dumps(
        [{
            "template_name": item.get("template_name"),
            "template_code": item.get("template_code"),
            "base_score": item.get("base_score"),
            "category_scores": item.get("category_scores"),
        } for item in scoring_context["assessment_breakdown"]],
        ensure_ascii=True, default=str
    )

    prompt = f"""You are an expert HR talent analyst and organizational psychologist with deep experience in hiring decisions and candidate evaluation.

Create a professional, evidence-based ranking explanation for this candidate.

**CANDIDATE INFORMATION:**
- Name: {candidate_name}
- Email: {candidate.email}
- Applied Position: {candidate.position or 'Not specified'}

**SCORING COMPOSITION (Explicit Breakdown - all percentages):**
- CV Job Match Score: {scoring_context['cv_score']:.1f}% (relevance and fit based on CV analysis)
- Assessment Base Score: {scoring_context['assessment_base_score']:.1f}% (raw average of all assessment results)
- Assessment Composite Score (blended with CV): {scoring_context['assessment_score']:.1f}% (weighted by CV fit quality)
- Assessment Completion Score: {scoring_context['completion_score']:.1f}% (progress: {scoring_context['completed_assessments']}/{scoring_context['total_assessments']} completed)
- **OVERALL RANKING SCORE: {scoring_context['overall_score']:.1f}%** (calculated as: 55% CV + 35% Assessment Composite + 10% Completion)

**CV MATCH DATA:**
Latest Match ID: {latest_match.id if latest_match else 'None'}
Job Title: {latest_match.job.title if latest_match and latest_match.job else 'Not specified'}
CV Match Summary: {scoring_context['analysis_summary']}
Structured CV Analysis: {structured_payload}

**DETAILED ASSESSMENT RESULTS:**
All completed assessments with breakdown:
{assessment_breakdown}

Full assessment metrics and AI reports:
{assessment_payload}

**MISSING/PENDING ASSESSMENTS:**
{json.dumps(scoring_context['missing_assessments'], ensure_ascii=True)}

**REQUIRED OUTPUT STRUCTURE:**

1. EXECUTIVE SUMMARY (3-5 sentences):
   - Lead with the overall ranking score and its composition (CV + Assessment + Completion percentages)
   - State the primary candidacy positioning: strong fit, moderate fit, or development needed
   - Highlight the primary driver of the score (CV strength vs. assessment strength vs. incomplete assessments)

2. CANDIDATE PROFILE (3-4 sentences):
   - Describe the candidate's professional background, experience level, and career trajectory from CV
   - Include relevant skills, domain expertise, or notable achievements
   - Position them relative to typical candidates for this role

3. CV FIT ANALYSIS (2-3 sentences):
   - Specific CV-to-role alignment: which skills match the job requirements
   - Your analysis of gaps: what relevant experience or skills may be missing
   - Overall fit assessment based on CV evidence alone

4. CANDIDACY POSITIONING (2-3 sentences):
   - How does this candidate rank among typical candidates for this role?
   - What makes them stand out (or raises concerns)?
   - Is this a strong, moderate, or borderline fit?

5. STRENGTHS (3-4 bullet points):
   - Draw from BOTH CV analysis and assessment results
   - Be specific: include evidence like "BigFive Conscientiousness high (82%)" or "CV shows 6+ years in relevant domain"
   - Frame as professional strengths relevant to hiring decisions

6. WEAKNESSES (2-3 bullet points):
   - Identify real gaps or concerns: missing skills, low assessment scores, incomplete assessments, or role misalignment
   - Include specific evidence: "DISC Dominance low (4/15)" or "Gap in leadership experience"
   - Be fair but direct about potential risks

7. KEY FINDINGS (3-5 bullet points):
   - Notable patterns or insights across CV and assessments
   - Include specific metrics with context: "Completed 4 of 5 assessments; 1 pending critical role-fit assessment"
   - Highlight trends: "Assessment performance strong across technical domains (avg 78%)"

8. ASSESSMENT INSIGHTS (2-5 insights):
   For each insight, provide:
   - Assessment name and code
   - Score and what it means for the role
   - Key finding: most relevant insight from this specific assessment
   - HR implication: what does this mean for hiring? (interview focus, reference checks, concerns, etc.)
   Format: "BigFive (BFS): 71% - High Conscientiousness indicates reliability and attention to detail. Focus interviews on stress management and adaptability."

9. MISSING ASSESSMENTS IMPACT:
   - List any incomplete assessments and their impact on evaluation clarity
   - Example: "Pending leadership assessment (Critical) - cannot fully evaluate management capability"

10. RECOMMENDATIONS (3-4 bullet points):
    - Actionable next steps for HR
    - Be specific about interview focus areas, reference check topics, or additional assessments
    - Example: "Schedule behavioral interview on conflict resolution (DISC Steadiness middle-range)"
    - Example: "Request references from technical leads (CV shows 3 technical roles)"
    - Example: "Complete stress management assessment before final offer"

11. PROFILE ARCHETYPE (2-4 words):
    - A memorable label summarizing this candidate's profile
    - Examples: "The Technical Expert", "The Adaptable Leader", "The Emerging Performer", "The Solid Contributor"
    - Must reflect the overall impression from CV + assessments + scores

**QUALITY REQUIREMENTS:**
- Use ONLY evidence from the provided CV analysis, assessment results, and metrics. Do NOT fabricate facts.
- Include specific numbers and metrics in all descriptions (scores, percentages, counts)
- Make each point actionable and relevant to hiring decisions
- Avoid generic statements; be specific about role-fit implications
- Professional, authoritative tone suitable for HR decision-making
- Ensure the summary and overall recommendation are clear and defensible
"""

    try:
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(CandidateRankingExplanation)
        report = structured_llm.invoke(prompt)
        payload = report.model_dump()
        # Ensure assessment_insights is properly capped
        payload["assessment_insights"] = (payload.get("assessment_insights") or [])[:5]
        return payload
    except Exception:
        return _fallback_candidate_ranking_report(scoring_context)


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
    pagination_class = FixedPageSizePagination

    def get_queryset(self):
        qs = JobPosting.objects.filter(company=self.request.user.company).order_by("-created_at")

        query = self.request.query_params.get("q", "").strip()
        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(description__icontains=query))

        status_filter = self.request.query_params.get("status", "").strip().lower()
        if status_filter in {choice[0] for choice in JobPosting.STATUS_CHOICES}:
            qs = qs.filter(status=status_filter)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        include_all = request.query_params.get("all", "").strip().lower() in {"1", "true", "yes"}
        if include_all:
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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
        recruitee_id = request.data.get("recruitee_id")
        if not recruitee_id:
            raise ValidationError(
                {
                    "recruitee_id": (
                        "CV upload requires an existing registered candidate. "
                        "Select a candidate before uploading."
                    )
                }
            )

        job_id = request.data.get("job_id")
        job = None

        candidate = Recruitee.objects.filter(
            id=recruitee_id,
            company=request.user.company,
        ).first()
        if candidate is None:
            raise ValidationError(
                {
                    "recruitee_id": (
                        "The uploaded CV does not belong to a registered candidate in your company."
                    )
                }
            )

        if job_id:
            try:
                job = JobPosting.objects.get(id=job_id, company=request.user.company)
            except JobPosting.DoesNotExist:
                job = None

        files = request.FILES.getlist("files")
        if not files:
            single_file = request.FILES.get("file")
            if single_file is not None:
                files = [single_file]

        if not files:
            raise ValidationError({"file": "Provide at least one file."})

        if job is not None:
            CandidateJobApplication.objects.get_or_create(
                recruitee=candidate,
                job=job,
                defaults={"created_by": request.user, "stage": "pending"},
            )

        raw_is_active = request.data.get("is_active", True)
        if isinstance(raw_is_active, str):
            default_is_active = raw_is_active.strip().lower() in {"1", "true", "yes", "on"}
        else:
            default_is_active = bool(raw_is_active)

        uploaded = []
        is_bulk = len(files) > 1
        for index, upload_file in enumerate(files):
            serializer = CandidateCVUploadSerializer(
                data={
                    "recruitee_id": str(candidate.id),
                    "file": upload_file,
                    "is_active": default_is_active and (not is_bulk or index == len(files) - 1),
                }
            )
            serializer.is_valid(raise_exception=True)
            uploaded.append(CandidateCVSerializer(serializer.save()).data)

        if len(uploaded) == 1:
            return Response(uploaded[0], status=status.HTTP_201_CREATED)

        return Response(
            {
                "count": len(uploaded),
                "uploaded": uploaded,
            },
            status=status.HTTP_201_CREATED,
        )


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

    def perform_destroy(self, instance):
        # Delete stored media file first to avoid orphaned files in storage.
        if instance.file:
            instance.file.delete(save=False)
        instance.delete()


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
        stage = serializer.validated_data.get("stage")

        if recruitee and recruitee.company_id != self.request.user.company_id:
            raise ValidationError({"recruitee": "Candidate not found in your company."})
        if job and job.company_id != self.request.user.company_id:
            raise ValidationError({"job": "Job not found in your company."})

        default_stage = recruitee.status if recruitee else "pending"
        if default_stage == "pending_cv_match":
            default_stage = "pending"
        final_stage = stage if stage else default_stage
        serializer.save(created_by=self.request.user, stage=final_stage)


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
                "stage": "pending" if candidate.status == "pending_cv_match" else candidate.status,
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


class CandidateBulkStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request):
        serializer = CandidateBulkStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        candidate_ids = serializer.validated_data["candidate_ids"]
        next_status = serializer.validated_data["status"]

        qs = Recruitee.objects.filter(company=request.user.company, id__in=candidate_ids)
        found_ids = {str(item.id) for item in qs.only("id")}
        missing_ids = [str(candidate_id) for candidate_id in candidate_ids if str(candidate_id) not in found_ids]
        if missing_ids:
            raise ValidationError({"candidate_ids": f"Some candidates were not found: {', '.join(missing_ids)}"})

        updated_count = qs.update(status=next_status)

        CandidateJobApplication.objects.filter(recruitee__in=qs).update(stage=next_status)

        return Response(
            {
                "updated_count": updated_count,
                "status": next_status,
            }
        )


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
            if candidate.status == "pending_cv_match":
                candidate.status = "pending"
                candidate.save(update_fields=["status", "updated_at"])
            if application.stage == "pending_cv_match":
                application.stage = "pending"
                application.save(update_fields=["stage", "updated_at"])

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


class CandidateGlobalMatchHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request, candidate_id):
        candidate = Recruitee.objects.filter(
            id=candidate_id,
            company=request.user.company,
        ).first()
        if not candidate:
            return Response({"detail": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        matches = (
            CVJobMatch.objects.select_related("cv", "application", "job")
            .filter(
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
                    "job_id": match.job_id,
                    "job_title": match.job.title if match.job_id else "",
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
                "candidate_id": candidate_id,
                "count": len(history),
                "latest_match_id": latest.get("id") if latest else None,
                "history": history,
            }
        )


class CandidateArchiveSnapshotView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]
    pagination_class = FixedPageSizePagination

    def get(self, request):
        status_filter = request.query_params.get("status", "").strip()
        requested_statuses = [
            item.strip().lower()
            for item in status_filter.split(",")
            if item.strip()
        ]
        if not requested_statuses:
            requested_statuses = ["hired", "rejected"]

        allowed_statuses = {choice[0] for choice in Recruitee.STATUS_CHOICES}
        statuses = [value for value in requested_statuses if value in allowed_statuses]
        if not statuses:
            statuses = ["hired", "rejected"]

        candidates = Recruitee.objects.filter(
            company=request.user.company,
            status__in=statuses,
        ).order_by("-updated_at", "-created_at")

        query = request.query_params.get("q", "").strip()
        if query:
            candidates = candidates.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(email__icontains=query)
                | Q(position__icontains=query)
            )

        pagination = self.pagination_class()
        page_candidates = pagination.paginate_queryset(candidates, request, view=self)

        snapshots = []
        for candidate in page_candidates:
            applications = list(
                CandidateJobApplication.objects.select_related("job")
                .filter(recruitee=candidate)
                .order_by("-updated_at", "-created_at")
            )
            assignments = list(
                CandidateAssignment.objects.select_related("template")
                .filter(recruitee=candidate)
                .order_by("-assigned_at")
            )
            matches = list(
                CVJobMatch.objects.select_related("job", "cv", "application")
                .filter(application__recruitee=candidate)
                .order_by("-created_at")
            )

            timeline = [
                {
                    "type": "candidate_created",
                    "occurred_at": candidate.created_at,
                    "title": "Candidate profile created",
                    "details": {
                        "status": candidate.status,
                        "position": candidate.position,
                    },
                }
            ]

            application_rows = []
            for app in applications:
                stage = app.stage or "pending"
                application_rows.append(
                    {
                        "id": app.id,
                        "job_id": app.job_id,
                        "job_title": app.job.title if app.job_id else "",
                        "stage": stage,
                        "source": app.source,
                        "notes": app.notes,
                        "created_at": app.created_at,
                        "updated_at": app.updated_at,
                    }
                )
                timeline.append(
                    {
                        "type": "application_stage",
                        "occurred_at": app.updated_at or app.created_at,
                        "title": f"Application stage: {stage}",
                        "details": {
                            "application_id": app.id,
                            "job_title": app.job.title if app.job_id else "",
                            "source": app.source,
                        },
                    }
                )

            assessment_rows = []
            for assignment in assignments:
                assessment_rows.append(
                    {
                        "id": assignment.id,
                        "template_code": assignment.template.code if assignment.template_id else "",
                        "template_name": assignment.template.name if assignment.template_id else "",
                        "status": assignment.status,
                        "assigned_at": assignment.assigned_at,
                        "completed_at": assignment.completed_at,
                        "metrics": assignment.metrics,
                        "ai_report": assignment.ai_report,
                    }
                )
                timeline.append(
                    {
                        "type": "assessment",
                        "occurred_at": assignment.completed_at or assignment.assigned_at,
                        "title": (
                            f"Assessment {assignment.template.code if assignment.template_id else assignment.id}: "
                            f"{assignment.status}"
                        ),
                        "details": {
                            "assignment_id": assignment.id,
                            "template_name": assignment.template.name if assignment.template_id else "",
                        },
                    }
                )

            match_rows = []
            for match in matches:
                match_rows.append(
                    {
                        "id": match.id,
                        "job_id": match.job_id,
                        "job_title": match.job.title if match.job_id else "",
                        "application_id": match.application_id,
                        "cv_id": match.cv_id,
                        "score": match.score,
                        "fit_label": match.fit_label,
                        "summary": match.summary,
                        "created_at": match.created_at,
                    }
                )
                timeline.append(
                    {
                        "type": "cv_match",
                        "occurred_at": match.created_at,
                        "title": f"CV match generated ({match.score:.1f}%)",
                        "details": {
                            "match_id": match.id,
                            "job_title": match.job.title if match.job_id else "",
                            "fit_label": match.fit_label,
                        },
                    }
                )

            timeline.sort(
                key=lambda item: item.get("occurred_at") or candidate.created_at,
                reverse=True,
            )

            latest_match = match_rows[0] if match_rows else None
            snapshots.append(
                {
                    "candidate_id": str(candidate.id),
                    "candidate_name": f"{candidate.first_name or ''} {candidate.last_name or ''}".strip() or candidate.email,
                    "candidate_email": candidate.email,
                    "position": candidate.position,
                    "status": candidate.status,
                    "created_at": candidate.created_at,
                    "updated_at": candidate.updated_at,
                    "latest_overall_score": latest_match.get("score") if latest_match else None,
                    "applications": application_rows,
                    "assessments": assessment_rows,
                    "matches": match_rows,
                    "timeline": timeline,
                }
            )

        return pagination.get_paginated_response(
            snapshots,
            extra={
                "statuses": statuses,
                "applied_filters": {
                    "q": query,
                    "status": status_filter,
                },
            },
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


class CandidateScoreExplanationGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request, candidate_id):
        candidate = Recruitee.objects.filter(
            id=candidate_id,
            company=request.user.company,
        ).first()
        if not candidate:
            return Response({"detail": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        scoring_context = _build_candidate_scoring_context(candidate)
        if not scoring_context["latest_match"]:
            return Response(
                {"detail": "Run at least one CV match before generating a score explanation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check cache FIRST. Only generate if not found.
        snapshot_signature = _build_scoring_snapshot_signature(scoring_context)
        
        # Try to fetch existing report with this signature
        existing_report = CandidateScoreExplanation.objects.filter(
            candidate=candidate,
            snapshot_signature=snapshot_signature,
        ).first()
        
        if existing_report:
            # Cache hit: use existing report, don't regenerate
            report = existing_report
            created = False
        else:
            # Cache miss: generate new report and store
            report_payload = _to_json_compatible(_generate_candidate_ranking_report(scoring_context))
            defaults = {
                "company": request.user.company,
                "latest_match": scoring_context["latest_match"],
                "created_by": request.user,
                "cv_score": scoring_context["cv_score"],
                "assessment_score": scoring_context["assessment_score"],
                "completion_score": scoring_context["completion_score"],
                "overall_score": scoring_context["overall_score"],
                "completed_assessments": scoring_context["completed_assessments"],
                "total_assessments": scoring_context["total_assessments"],
                "assessment_breakdown": _to_json_compatible(scoring_context["assessment_breakdown"]),
                "report_payload": report_payload,
            }

            try:
                report, created = CandidateScoreExplanation.objects.get_or_create(
                    candidate=candidate,
                    snapshot_signature=snapshot_signature,
                    defaults=defaults,
                )
            except IntegrityError:
                report = CandidateScoreExplanation.objects.get(
                    candidate=candidate,
                    snapshot_signature=snapshot_signature,
                )
                created = False

        history_qs = CandidateScoreExplanation.objects.filter(candidate=candidate).order_by("-created_at")
        history_data = CandidateScoreExplanationListSerializer(history_qs[:12], many=True).data
        report_data = CandidateScoreExplanationDetailSerializer(report).data

        return Response(
            {
                "cached": not created,
                "report": report_data,
                "history": history_data,
            },
            status=status.HTTP_200_OK,
        )


class CandidateScoreExplanationHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request, candidate_id):
        candidate = Recruitee.objects.filter(
            id=candidate_id,
            company=request.user.company,
        ).first()
        if not candidate:
            return Response({"detail": "Candidate not found."}, status=status.HTTP_404_NOT_FOUND)

        history_qs = CandidateScoreExplanation.objects.filter(candidate=candidate).order_by("-created_at")
        paginator = FixedPageSizePagination()
        page = paginator.paginate_queryset(history_qs, request)
        serializer = CandidateScoreExplanationListSerializer(page, many=True)
        paged = paginator.get_paginated_response(serializer.data)
        # attach candidate_id for client convenience
        payload = paged.data if hasattr(paged, 'data') else paged
        payload.update({"candidate_id": str(candidate_id)})
        return paged


class CandidateScoreExplanationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request, pk):
        report = (
            CandidateScoreExplanation.objects.select_related("candidate", "company")
            .filter(pk=pk, company=request.user.company)
            .first()
        )
        if not report:
            return Response({"detail": "Score explanation not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CandidateScoreExplanationDetailSerializer(report)
        return Response(serializer.data)


class RankedPipelineView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]
    pagination_class = FixedPageSizePagination

    def get(self, request, job_id):
        try:
            job = JobPosting.objects.get(id=job_id, company=request.user.company)
        except JobPosting.DoesNotExist:
            return Response({"detail": "Job not found."}, status=status.HTTP_404_NOT_FOUND)

        recruitees = Recruitee.objects.filter(
            company=request.user.company,
            job_applications__job=job,
        ).exclude(status="pending_cv_match").distinct()

        query = request.query_params.get("q", "").strip()
        if query:
            recruitees = recruitees.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(email__icontains=query)
                | Q(position__icontains=query)
            )

        status_filter = request.query_params.get("status", "").strip().lower()
        if status_filter in {choice[0] for choice in Recruitee.STATUS_CHOICES}:
            recruitees = recruitees.filter(status=status_filter)

        items = _build_pipeline_items(recruitees)
        items.sort(key=lambda x: x["overall_score"], reverse=True)
        pagination = self.pagination_class()
        page_items = pagination.paginate_queryset(items, request, view=self)
        serializer = RankedPipelineItemSerializer(page_items, many=True)
        return pagination.get_paginated_response(serializer.data)


class GlobalRankedPipelineView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]
    pagination_class = FixedPageSizePagination

    def get(self, request):
        recruitees = Recruitee.objects.filter(company=request.user.company).exclude(status="pending_cv_match")

        query = request.query_params.get("q", "").strip()
        if query:
            recruitees = recruitees.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(email__icontains=query)
                | Q(position__icontains=query)
            )

        status_filter = request.query_params.get("status", "").strip().lower()
        if status_filter in {choice[0] for choice in Recruitee.STATUS_CHOICES}:
            recruitees = recruitees.filter(status=status_filter)

        job_id = request.query_params.get("job_id", "").strip()
        if job_id:
            recruitees = recruitees.filter(job_applications__job_id=job_id).distinct()

        items = _build_pipeline_items(recruitees)
        items.sort(key=lambda x: x["overall_score"], reverse=True)
        pagination = self.pagination_class()
        page_items = pagination.paginate_queryset(items, request, view=self)
        serializer = RankedPipelineItemSerializer(page_items, many=True)
        return pagination.get_paginated_response(serializer.data)

def _build_pipeline_items(recruitees):
    items = []

    for candidate in recruitees:
        scoring_context = _build_candidate_scoring_context(candidate)
        latest_match = scoring_context["latest_match"]
        history_count = scoring_context["history_count"]
        cv_score = scoring_context["cv_score"]
        completion_score = scoring_context["completion_score"]
        assessment_score = scoring_context["assessment_score"]
        overall = scoring_context["overall_score"]
        completed = scoring_context["completed_assessments"]
        total = scoring_context["total_assessments"]

        candidate_name = f"{candidate.first_name or ''} {candidate.last_name or ''}".strip()
        if not candidate_name:
            candidate_name = candidate.email

        analysis_summary = scoring_context["analysis_summary"]

        explanation_parts = [
            f"CV fit {cv_score:.1f}, assessments completed {completed}/{total}, assessment score {assessment_score:.1f}.",
            f"Match Summary: {analysis_summary}"
        ]

        latest_explanation = (
            CandidateScoreExplanation.objects.filter(candidate=candidate)
            .order_by("-created_at")
            .first()
        )
        explanation_count = CandidateScoreExplanation.objects.filter(candidate=candidate).count()

        explanation = " ".join(explanation_parts)

        items.append(
            {
                "candidate_id": candidate.id,
                "candidate_name": candidate_name,
                "candidate_email": candidate.email,
                "position": candidate.position,
                "stage": candidate.status,
                "cv_score": cv_score,
                "completion_score": completion_score,
                "assessment_score": assessment_score,
                "overall_score": overall,
                "explanation": explanation,
                "history_count": history_count,
                "has_history": history_count > 0,
                "latest_match_id": latest_match.id if latest_match else None,
                "latest_fit_label": latest_match.fit_label if latest_match else "",
                "latest_summary": latest_match.summary if latest_match else "",
                "latest_matched_at": latest_match.created_at if latest_match else None,
                "completed_assessments": completed,
                "total_assessments": total,
                "latest_explanation_id": latest_explanation.id if latest_explanation else None,
                "explanation_count": explanation_count,
            }
        )
    return items

