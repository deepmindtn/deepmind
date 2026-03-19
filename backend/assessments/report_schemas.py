"""
Pydantic schemas for structured LLM report output.
Every Generate*ReportView returns a JSON matching one of these models.
All schemas share the base fields: summary, strengths, risks, action_points,
profile_archetype. Assessment-specific fields extend the base.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


# ---------------------------------------------------------------------------
# Shared sub-models
# ---------------------------------------------------------------------------

class ActionPoint(BaseModel):
    title: str = Field(description="Short title for the action point (5–8 words)")
    description: str = Field(description="Detailed explanation of what the employee should do (2–4 sentences)")


# ---------------------------------------------------------------------------
# BigFive / OCEAN
# ---------------------------------------------------------------------------

class TraitInsight(BaseModel):
    name: str = Field(description="Full trait name, e.g. 'Extraversion'")
    score: int = Field(description="Numeric score 0–100")
    level: str = Field(description="One of: Very High, High, Moderate, Low, Very Low")
    insight: str = Field(description="2–3 sentence workplace interpretation of this score")
    strong_facets: List[str] = Field(description="2–3 strongest facets implied by the score")
    weak_facets: List[str] = Field(description="1–2 weaker facets implied by the score")


class BigFiveReport(BaseModel):
    summary: str = Field(description="Executive summary of the overall OCEAN profile (3–5 sentences)")
    traits: List[TraitInsight] = Field(description="Insight for each of the 5 OCEAN traits")
    strengths: List[str] = Field(description="3–4 key professional strengths derived from the profile")
    risks: List[str] = Field(description="2–3 potential risks or development areas")
    action_points: List[ActionPoint] = Field(description="4 tailored action points for professional growth")
    profile_archetype: str = Field(description="A 2–4 word archetype label, e.g. 'The Conscientious Leader'")


# ---------------------------------------------------------------------------
# DISC
# ---------------------------------------------------------------------------

class DiscDimension(BaseModel):
    name: str = Field(description="Dimension name: Dominance, Influence, Steadiness, or Conscientiousness")
    percentage: int = Field(description="Percentage score for this dimension (0–100)")
    description: str = Field(description="1–2 sentence description of this dimension in the employee's profile")


class DiscReport(BaseModel):
    summary: str = Field(description="Overview of the dominant DISC traits and overall behavioural profile (3–4 sentences)")
    disc_dimensions: List[DiscDimension] = Field(description="All 4 DISC dimensions with their scores and meanings")
    strengths: List[str] = Field(description="3–4 professional strengths based on the DISC profile")
    risks: List[str] = Field(description="2–3 challenges or blind spots to be aware of")
    action_points: List[ActionPoint] = Field(description="3–5 practical recommendations for collaboration and development")
    profile_archetype: str = Field(description="Dominant DISC style label, e.g. 'The Decisive Driver' or 'The Analytical Thinker'")


# ---------------------------------------------------------------------------
# Karasek (Job Demands-Control-Support)
# ---------------------------------------------------------------------------

class KarasekDimension(BaseModel):
    name: str = Field(description="Dimension name: Psychological Demands, Decision Latitude, or Social Support")
    level: str = Field(description="One of: High, Moderate, Low")
    interpretation: str = Field(description="1–2 sentence workplace meaning of this dimension score")


class KarasekReport(BaseModel):
    summary: str = Field(description="Overview of the work environment based on JDC-S model (3–4 sentences)")
    quadrant: str = Field(description="One of: High Strain, Low Strain, Active, Passive")
    quadrant_meaning: str = Field(description="2–3 sentence explanation of what this quadrant means for the employee")
    dimensions: List[KarasekDimension] = Field(description="The 3 Karasek dimensions with levels and interpretations")
    strengths: List[str] = Field(description="2–3 positive aspects of the work situation")
    risks: List[str] = Field(description="2–3 risk factors related to stress or burnout")
    action_points: List[ActionPoint] = Field(description="3–4 actionable suggestions to improve well-being")
    profile_archetype: str = Field(description="A short label summarising the work profile, e.g. 'The Overloaded Expert'")


# ---------------------------------------------------------------------------
# Maslach Burnout Inventory
# ---------------------------------------------------------------------------

class MaslachSubscale(BaseModel):
    name: str = Field(description="Subscale name: Emotional Exhaustion, Depersonalization, or Personal Accomplishment")
    score: float = Field(description="Numeric score for this subscale")
    level: str = Field(description="One of: High, Moderate, Low")
    interpretation: str = Field(description="1–2 sentence burnout-relevant interpretation")


class MaslachReport(BaseModel):
    summary: str = Field(description="Overall burnout profile summary (3–4 sentences)")
    burnout_level: str = Field(description="Overall burnout risk level: High Risk, Moderate Risk, or Low Risk")
    subscales: List[MaslachSubscale] = Field(description="All 3 MBI subscales with scores and interpretations")
    strengths: List[str] = Field(description="2–3 protective factors observed in the profile")
    risks: List[str] = Field(description="2–3 burnout risk areas that need attention")
    action_points: List[ActionPoint] = Field(description="3–4 recovery and prevention strategies")
    profile_archetype: str = Field(description="Short label for the burnout profile, e.g. 'The Depleted Helper'")


# ---------------------------------------------------------------------------
# JSS (Job Satisfaction Survey)
# ---------------------------------------------------------------------------

class JssDimension(BaseModel):
    name: str = Field(description="Dimension name, e.g. Pay, Promotion, Supervision, etc.")
    score: float = Field(description="Numeric score for this dimension")
    satisfaction_level: str = Field(description="One of: Very High, Moderate, Low, Very Low")
    interpretation: str = Field(description="1 sentence interpretation of this satisfaction dimension")


class JssReport(BaseModel):
    summary: str = Field(description="Summary of overall job satisfaction profile (3–4 sentences)")
    global_score: float = Field(description="Overall JSS total score")
    overall_level: str = Field(description="Overall satisfaction level: Very High, Moderate, Low, or Very Low")
    dimensions: List[JssDimension] = Field(description="All 9 JSS dimensions with scores and interpretations")
    strengths: List[str] = Field(description="2–3 highest satisfaction areas (strengths)")
    risks: List[str] = Field(description="2–3 lowest satisfaction areas (improvement needed)")
    action_points: List[ActionPoint] = Field(description="4–5 concrete recommendations to improve satisfaction")
    profile_archetype: str = Field(description="Short label for the satisfaction profile, e.g. 'The Disengaged Performer'")


# ---------------------------------------------------------------------------
# BRS (Brief Resilience Scale)
# ---------------------------------------------------------------------------

class BrsReport(BaseModel):
    summary: str = Field(description="Overview of the employee's resilience capacity (3–4 sentences)")
    average_score: float = Field(description="BRS average score (1.00–5.00)")
    resilience_level: str = Field(description="One of: High Resilience, Normal Resilience, Low Resilience")
    strengths: List[str] = Field(description="2–3 resilience strengths observed")
    risks: List[str] = Field(description="2–3 resilience vulnerabilities or stress-coping challenges")
    action_points: List[ActionPoint] = Field(description="3–4 practical strategies to maintain or improve resilience")
    profile_archetype: str = Field(description="Short resilience profile label, e.g. 'The Robust Bouncer'")


# ---------------------------------------------------------------------------
# CD-RISC 10 (Connor-Davidson Resilience Scale)
# ---------------------------------------------------------------------------

class CdriscReport(BaseModel):
    summary: str = Field(description="Overview of the employee's resilience capacity based on CD-RISC 10 (3–4 sentences)")
    total_score: int = Field(description="Total CD-RISC 10 score (0–40)")
    resilience_level: str = Field(description="One of: High (30–40), Moderate (20–29), Low (0–19)")
    strengths: List[str] = Field(description="2–3 resilience strengths based on the score")
    risks: List[str] = Field(description="2–3 areas where resilience may be challenged")
    action_points: List[ActionPoint] = Field(description="3–4 strategies to strengthen resilience")
    profile_archetype: str = Field(description="Short label for the resilience profile, e.g. 'The Steady Adapter'")


# ---------------------------------------------------------------------------
# WSES (Work Self-Efficacy Scale)
# ---------------------------------------------------------------------------

class WsesReport(BaseModel):
    summary: str = Field(description="Overview of the employee's work self-efficacy (3–4 sentences)")
    average_score: float = Field(description="WSES average score")
    efficacy_level: str = Field(description="One of: High, Moderate, Low")
    strengths: List[str] = Field(description="2–3 self-efficacy strengths observed")
    risks: List[str] = Field(description="2–3 areas where self-efficacy may limit performance")
    action_points: List[ActionPoint] = Field(description="3–4 strategies to develop work self-efficacy")
    profile_archetype: str = Field(description="Short label for the efficacy profile, e.g. 'The Confident Problem Solver'")


# ---------------------------------------------------------------------------
# GCOS-mini (General Causality Orientations Scale)
# ---------------------------------------------------------------------------

class GcosOrientation(BaseModel):
    name: str = Field(description="Orientation name: Autonomous, Controlled, or Impersonal")
    score: float = Field(description="Numeric score for this orientation")
    level: str = Field(description="One of: Dominant, Moderate, Low")
    interpretation: str = Field(description="1–2 sentence workplace implication of this orientation score")


class GcosReport(BaseModel):
    summary: str = Field(description="Overview of the employee's motivational orientations (3–4 sentences)")
    orientations: List[GcosOrientation] = Field(description="All 3 GCOS orientations with scores and interpretations")
    dominant_orientation: str = Field(description="The dominant motivation style, e.g. 'Autonomous'")
    strengths: List[str] = Field(description="2–3 motivational strengths observed")
    risks: List[str] = Field(description="2–3 motivational risks or engagement concerns")
    action_points: List[ActionPoint] = Field(description="3–4 development actions to foster intrinsic motivation")
    profile_archetype: str = Field(description="Short motivational style label, e.g. 'The Self-Directed Innovator'")


# ---------------------------------------------------------------------------
# RIBS-SF (Runco Ideational Behavior Scale)
# ---------------------------------------------------------------------------

class RibsReport(BaseModel):
    summary: str = Field(description="Overview of the employee's ideational creativity (3–4 sentences)")
    average_score: float = Field(description="RIBS average score")
    ideation_level: str = Field(description="One of: High Ideation, Moderate Ideation, Low Ideation")
    strengths: List[str] = Field(description="2–3 creativity strengths observed")
    risks: List[str] = Field(description="2–3 potential limitations in creative thinking")
    action_points: List[ActionPoint] = Field(description="3–4 strategies to enhance creative ideation at work")
    profile_archetype: str = Field(description="Short creativity label, e.g. 'The Divergent Thinker'")


# ---------------------------------------------------------------------------
# CAQ-SF (Creative Achievement Questionnaire)
# ---------------------------------------------------------------------------

class CreativeDomain(BaseModel):
    domain: str = Field(description="Creative domain name, e.g. Visual Arts, Music, Science, Writing, etc.")
    level: str = Field(description="Achievement level in this domain: High, Moderate, Low, or None")
    note: str = Field(description="1 sentence remark on this domain's contribution to the overall profile")


class CaqReport(BaseModel):
    summary: str = Field(description="Summary of the employee's creative achievement profile (3–4 sentences)")
    total_score: int = Field(description="Total CAQ score")
    overall_level: str = Field(description="Overall creative achievement: High, Moderate, Low, or Minimal")
    creative_domains: List[CreativeDomain] = Field(description="Key creative domains with achievement levels")
    strengths: List[str] = Field(description="2–3 strongest creative areas")
    risks: List[str] = Field(description="2–3 underdeveloped domains or creative barriers")
    action_points: List[ActionPoint] = Field(description="3–4 personalised recommendations to leverage or expand creative potential")
    profile_archetype: str = Field(description="Short creative profile label, e.g. 'The Multidisciplinary Creator'")


# ---------------------------------------------------------------------------
# ISE-SF (Innovation Self-Efficacy Scale)
# ---------------------------------------------------------------------------

class IseReport(BaseModel):
    summary: str = Field(description="Summary of the employee's innovation confidence (3–4 sentences)")
    average_score: float = Field(description="ISE average score")
    innovation_level: str = Field(description="One of: High Innovation Confidence, Moderate, Low")
    strengths: List[str] = Field(description="2–3 innovation confidence strengths")
    risks: List[str] = Field(description="2–3 areas where innovation confidence is limited")
    action_points: List[ActionPoint] = Field(description="3–4 practical recommendations to build innovation self-efficacy")
    profile_archetype: str = Field(description="Short innovation profile label, e.g. 'The Cautious Experimenter'")


# ---------------------------------------------------------------------------
# Registry: map assessment template code → Pydantic schema
# ---------------------------------------------------------------------------

REPORT_SCHEMA_REGISTRY = {
    "BIG_FIVE":   BigFiveReport,
    "DISC":       DiscReport,
    "KARASEK":    KarasekReport,
    "MASLACH":    MaslachReport,
    "JSS":        JssReport,
    "BRS":        BrsReport,
    "CDRISC10":   CdriscReport,
    "WSES":       WsesReport,
    "GCOS":       GcosReport,
    "RIBS":       RibsReport,
    "CAQ":        CaqReport,
    "ISE":        IseReport,
}
