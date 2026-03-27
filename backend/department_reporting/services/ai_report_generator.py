import json
import logging

from django.conf import settings
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field


logger = logging.getLogger(__name__)


def _to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _metric_value(metric_set, *paths, default=0.0):
    metrics = metric_set or {}
    for path in paths:
        value = metrics
        keys = path if isinstance(path, (list, tuple)) else [path]
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                value = None
                break
        if value is not None:
            return _to_float(value, default)
    return default


class DepartmentAISummary(BaseModel):
    executive_summary: str = Field(..., description="A 2-3 sentence overview.")
    strengths: list[str] = Field(..., description="List of strengths based on metrics")
    risks: list[str] = Field(..., description="List of risks based on metrics")
    recommendations: list[str] = Field(..., description="List of recommendations based on metrics")

class EmployeeEvolutionSummary(BaseModel):
    summary: str = Field(..., description="Executive summary of the employee's well-being and performance evolution.")
    current_state: list[str] = Field(..., description="2-3 bullet points describing their current metric profile strengths/states.")
    evolution_details: list[str] = Field(..., description="2-3 bullet points identifying significant changes or trends over time.")
    strengths: list[str] = Field(..., description="List of professional strengths or protective factors.")
    action_points: list[str] = Field(..., description="Tailored development or well-being action points.")
    profile_archetype: str = Field(..., description="A short label summarizing the profile, e.g. 'The Adapting Performer'")

def generate_department_ai_summary(department_name, metrics, employee_count):
    """
    Calls an LLM with structured outputs to return the department insights.
    Returns a dict conforming to the expected JSON schema.
    """
    if not settings.OPENAI_API_KEY:
        return _generate_fallback_summary(department_name, metrics, employee_count)

    model_name = (
        getattr(settings, "OPENAI_MODEL", None)
        or getattr(settings, "OPENAI_CHAT_MODEL", None)
        or "gpt-4o-mini"
    )
    llm = ChatOpenAI(model=model_name, temperature=0.2, api_key=settings.OPENAI_API_KEY)
    structured_llm = llm.with_structured_output(DepartmentAISummary)

    prompt_template = PromptTemplate.from_template(
        """
        You are an expert organizational psychologist and workplace wellness consultant.
        Analyze the following aggregated psychometric group metrics for the {department_name} department.
        There are {employee_count} employees included in this dataset.

        Aggregated Metrics:
        {metrics}

        Based on these metrics, provide a comprehensive structured analysis:

        1. EXECUTIVE SUMMARY (2-3 sentences):
        Write a clear overview of the department's well-being and performance characteristics. Be specific about what the metrics indicate.

        2. STRENGTHS (2-3 bullet points):
        List specific strengths supported by metric values (e.g., "High job satisfaction (Score: 145/216)")

        3. RISKS OR CONCERNS (2-3 bullet points):
        Identify specific risks with metric evidence (e.g., "Elevated emotional exhaustion (Score: 28/54)")

        4. ACTIONABLE RECOMMENDATIONS (3-4 bullet points):
        Suggest specific, implementable interventions

        Format each section clearly with headers. Be precise with numbers. Use professional language.
        """
    )

    prompt = prompt_template.format(
        department_name=department_name,
        employee_count=employee_count,
        metrics=json.dumps(metrics, indent=2),
    )

    try:
        response = structured_llm.invoke(prompt)
        return response.model_dump()
    except Exception as exc:
        logger.error("Failed to generate AI summary: %s", exc)
        return _generate_fallback_summary(department_name, metrics, employee_count)

def generate_employee_evolution_insight(metrics_history):
    """
    Calls an LLM with structured outputs to return the employee insights based on historical metrics.
    """
    if not settings.OPENAI_API_KEY:
        return {
            "summary": "Employee evaluation timeline.",
            "current_state": ["Metrics available for review."],
            "evolution_details": ["Stable performance."],
            "strengths": ["Consistent."],
            "action_points": ["Continue monitoring."],
            "profile_archetype": "The Steady Contributor"
        }

    model_name = getattr(settings, "OPENAI_MODEL", None) or getattr(settings, "OPENAI_CHAT_MODEL", None) or "gpt-4o-mini"
    llm = ChatOpenAI(model=model_name, temperature=0.0, api_key=settings.OPENAI_API_KEY)
    structured_llm = llm.with_structured_output(EmployeeEvolutionSummary)
    
    prompt_template = PromptTemplate.from_template(
        "You are an expert organizational psychologist. Analyze the following psychometric assessment history for an individual employee.\n\n"
        "Metrics History (Chronological):\n{metrics}\n\n"
        "INSTRUCTIONS (must follow exactly):\n"
        "- Use ONLY the numeric data present in 'Metrics History' to support any claim. Do NOT hallucinate or invent facts.\n"
        "- For each descriptive bullet, include the exact numeric evidence (value and date) and any computed delta you use to justify a claim (e.g., 'Emotional Exhaustion: 34/54 on 2026-03-01 (change +6)').\n"
        "- If a metric is absent, say 'No data available' for that metric rather than inferring.\n"
        "- Produce a JSON-compatible structured response matching the EmployeeEvolutionSummary schema: 'summary' (1-2 sentences), 'current_state' (2-4 bullets with evidence), 'evolution_details' (2-4 bullets with computed deltas and evidence), 'strengths' (1-3 bullets), 'action_points' (1-4 bullets), 'profile_archetype' (short label).\n"
        "- Keep language concise and professional. Include no additional fields.\n\n"
        "Provide the structured analysis now."
    )
    prompt = prompt_template.format(metrics=json.dumps(metrics_history, indent=2))
    try:
        return structured_llm.invoke(prompt).model_dump()
    except Exception as exc:
        logger.error("Failed to generate employee AI insight: %s", exc)
        return {
            "summary": "Data available for review.", "current_state": [], 
            "evolution_details": [], "strengths": [], "action_points": [], "profile_archetype": "Employee"
        }


def _generate_fallback_summary(department_name, metrics, employee_count):
    """Generate a summary based on the metrics data when LLM is unavailable."""
    strengths = []
    risks = []
    recommendations = []

    if metrics.get("DISC"):
        disc = metrics["DISC"]
        d_score = _metric_value(disc, "D", ("trait", "D"))
        c_score = _metric_value(disc, "C", ("trait", "C"))
        i_score = _metric_value(disc, "I", ("trait", "I"))
        if d_score > 30:
            strengths.append("Strong leadership and decisiveness (Dominance >30)")
        if c_score > 30:
            strengths.append("Detail-oriented and process-focused team (Conformity >30)")
        if i_score < 20:
            risks.append("Limited interpersonal networking (Influence <20)")

    if metrics.get("MASLACH"):
        maslach = metrics["MASLACH"]
        ee = _metric_value(maslach, "EE", "Emotional_Exhaustion", ("burnout", "exhaustion"))
        if ee > 30:
            risks.append(
                f"Critical emotional exhaustion levels ({ee:.1f}/54) - immediate intervention needed"
            )
            recommendations.append(
                "Implement immediate stress reduction programs and workload rebalancing"
            )
        elif ee > 20:
            risks.append(f"Moderate emotional exhaustion ({ee:.1f}/54) - requires monitoring")
            recommendations.append("Provide targeted stress management and wellness resources")
        else:
            strengths.append(f"Well-managed emotional exhaustion levels ({ee:.1f}/54)")

    if metrics.get("JSS"):
        jss = metrics["JSS"]
        global_score = _metric_value(jss, "global", "total", "average")
        if global_score > 150:
            strengths.append(f"Exceptional job satisfaction (Score: {global_score}/216)")
        elif global_score > 120:
            strengths.append(f"Strong job satisfaction (Score: {global_score}/216)")
        elif global_score < 80:
            risks.append(f"Low job satisfaction (Score: {global_score}/216) - high turnover risk")
            recommendations.append("Conduct stay interviews to understand dissatisfaction drivers")
        else:
            strengths.append(f"Moderate job satisfaction (Score: {global_score}/216)")

    if metrics.get("BRS"):
        brs = metrics["BRS"]
        brs_avg = _metric_value(brs, "average", "total")
        if brs_avg > 4.0:
            strengths.append("Strong work resilience and adaptive capacity")
        else:
            recommendations.append("Build resilience through team cohesion and skill development")

    if not strengths:
        strengths = ["Active participation in wellness initiatives", "Completed comprehensive assessments"]
    if not risks:
        risks = ["Continue baseline monitoring of stress indicators"]
    if not recommendations:
        recommendations = ["Schedule regular wellness check-ins", "Provide continuous professional development"]

    executive_summary = (
        f"The {department_name} department ({employee_count} employees) demonstrates "
        f"{'strong' if len(strengths) > len(risks) else 'mixed'} well-being metrics with key "
        f"{'opportunities for optimization' if len(risks) > 0 else 'areas of strength'}. "
        "Targeted interventions can enhance employee engagement and retention."
    )

    return {
        "executive_summary": executive_summary,
        "strengths": strengths[:3],
        "risks": risks[:3],
        "recommendations": recommendations[:4],
    }
