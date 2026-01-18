from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils import timezone

from .models import AssessmentTemplate, Assignment

User = get_user_model()


# ---------- HR creates an assignment ----------
class AssignRequestSerializer(serializers.Serializer):    
    employee_email = serializers.EmailField()
    template_codes = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=False
    )

    # outgoing (read-only from created Assignment)
    id            = serializers.IntegerField(read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)
    status        = serializers.CharField(read_only=True)
    assigned_at   = serializers.DateTimeField(read_only=True)

    class Meta:
        model  = Assignment
        fields = [
            "id",
            "employee_email",   # in
            "template_code",    # in
            "template_name",    # out
            "status",           # out
            "assigned_at",      # out
        ]

    def create(self, validated_data):
        hr = self.context["request"].user
        # If you have roles on the user, keep this check
        if hasattr(User, "Roles") and getattr(hr, "role", None) != getattr(User.Roles, "HR", None):
            raise serializers.ValidationError("Only HR can assign assessments.")

        employee_email = validated_data.pop("employee_email")
        template_code  = validated_data.pop("template_code")

        try:
            employee = User.objects.get(email=employee_email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"employee_email": "Employee not found."})

        try:
            template = AssessmentTemplate.objects.get(code=template_code)
        except AssessmentTemplate.DoesNotExist:
            raise serializers.ValidationError({"template_code": "Template not found. Seed templates first."})

        return Assignment.objects.create(
            employee=employee,      # adjust to your FK name (employee/assignee/user)
            template=template,
            assigned_by=hr,         # adjust if your model uses another field name
        )


# ---------- Lists shown to the employee ----------
class AssignmentListItemSerializer(serializers.ModelSerializer):
    template_code = serializers.CharField(source="template.code", read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)

    class Meta:
        model  = Assignment
        fields = ["id", "template_code", "template_name", "status", "assigned_at", "completed_at",            "metrics",      # ✅ include scores for Big Five / Karasek / Maslach
            "ai_report",   ]


# ---------- Detail / after submit ----------
class AssignmentDetailSerializer(serializers.ModelSerializer):
    template_code = serializers.CharField(source="template.code", read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)

    class Meta:
        model  = Assignment
        # No 'score' here (it crashed). Prefer 'metrics'.
        fields = [
            "id", "template_code", "template_name",
            "status", "assigned_at", "completed_at",
            "answers", "metrics", "ai_report", "report_pdf",
        ]


# ---------- Employee submits answers ----------
# assessments/serializers.py
from rest_framework import serializers
from django.utils import timezone
from .models import Assignment


class SubmitAnswersSerializer(serializers.Serializer):
    answers    = serializers.JSONField()
    metrics    = serializers.JSONField(required=False)
    ai_report  = serializers.CharField(required=False, allow_blank=True)
    overwrite  = serializers.BooleanField(required=False, default=False)  # <-- NEW
    def validate(self, attrs):
        assignment: Assignment = self.context["assignment"]
        if assignment.status == Assignment.Status.COMPLETED and not attrs.get("overwrite", False):
            raise serializers.ValidationError("Assignment already completed.")
        return attrs

    def create(self, validated_data):
        print("aaaa")
        assignment: Assignment = self.context["assignment"]

        # Upsert fields
        assignment.answers = validated_data.get("answers", {}) or {}
        metrics = validated_data.get("metrics")
        if metrics is None:
            metrics = compute_metrics_for_template(assignment.template.code, assignment.answers)
        assignment.metrics = metrics

        if "ai_report" in validated_data:
            assignment.ai_report = validated_data.get("ai_report") or ""

        # Mark completed (again is fine if overwrite=True)
        from django.utils import timezone
        assignment.status = Assignment.Status.COMPLETED
        assignment.completed_at = timezone.now()
        assignment.save()
        return assignment


def _normalize(value, lo, hi):
    if hi == lo:
        return 0
    return round((value - lo) * 100 / (hi - lo))

def _disc_metrics(answers: dict) -> dict:
    print("aaa")
    scores = {"D": 0, "I": 0, "C": 0, "S": 0}
    mapping = {"a": "D", "b": "I", "c": "C", "d": "S"}

    for qid, val in answers.items():
        if not val:  # sécurité
            continue
        t = mapping.get(str(val).lower())
        if t:
            scores[t] += 1

    total = sum(scores.values())
    if total == 0:
        return {}

    percentages = {k: round(v * 100 / total) for k, v in scores.items()}
    print("DISC metrics computed:", scores, percentages)  # debug

    return {"trait": scores, "percent": percentages}


def _jss_metrics(answers: dict) -> dict:
    """
    Compute JSS scores.
    - 9 subscales (4 items each).
    - Each subscale ranges 4–24.
    - Global score ranges 36–216.
    Interpretation thresholds:
      19–24: very high satisfaction
      14–18: moderate satisfaction
      9–13: low satisfaction
      4–8: very low satisfaction
    """
    # mapping subscale -> item ids
    SUBSCALES = {
        "remuneration": [1, 2, 3, 4],
        "avantages": [5, 6, 7, 8],
        "promotion": [9, 10, 11, 12],
        "supervision": [13, 14, 15, 16],
        "conditions": [17, 18, 19, 20],
        "relations": [21, 22, 23, 24],
        "nature": [25, 26, 27, 28],
        "politiques": [29, 30, 31, 32],
        "communication": [33, 34, 35, 36],
    }

    subscores = {}
    total_score = 0

    for sub, ids in SUBSCALES.items():
        values = []
        for qid in ids:
            v = answers.get(str(qid), answers.get(qid))  # accept str/int keys
            if v is not None:
                try:
                    v = int(v)
                except Exception:
                    continue
                values.append(v)
        sub_total = sum(values)
        subscores[sub] = sub_total
        total_score += sub_total

    interpretation = {}
    for sub, val in subscores.items():
        if val >= 19:
            interpretation[sub] = "Très haute satisfaction"
        elif val >= 14:
            interpretation[sub] = "Satisfaction modérée"
        elif val >= 9:
            interpretation[sub] = "Faible satisfaction"
        elif val >= 4:
            interpretation[sub] = "Très faible satisfaction"
        else:
            interpretation[sub] = "Non répondu"

    return {
        "subscores": subscores,
        "total": total_score,
        "interpretation": interpretation,
    }


def _big_five_metrics(answers: dict) -> dict:
    """
    answers example: { "1": 1..5, 2: 1..5, ... }
    Produces a minimal, stable shape: {"trait": {"N":..,"E":..,"O":..,"A":..,"C":..}}
    """
    # map id->(trait, reverse)
    QUESTIONS = {
        1:("E",False), 2:("C",False), 3:("N",False), 4:("A",False), 5:("O",False),
        6:("E",False), 7:("C",False), 8:("N",False), 9:("A",False), 10:("O",False),
        11:("E",False), 12:("C",False), 13:("N",False), 14:("A",False), 15:("E",True),
        16:("C",False), 17:("N",False), 18:("A",False), 19:("O",False), 20:("E",False),
    }
    totals = {"N":0,"E":0,"O":0,"A":0,"C":0}
    counts = {"N":0,"E":0,"O":0,"A":0,"C":0}

    for qid, (t, rev) in QUESTIONS.items():
        v = answers.get(str(qid), answers.get(qid))
        if v is None:
            continue
        v = int(v)
        score = (6 - v) if rev else v
        totals[t] += score
        counts[t] += 1

    trait = {
        k: _normalize(totals[k], 1*counts[k], 5*counts[k]) if counts[k] else 0
        for k in totals
    }
    return {"trait": trait}


def _karasek_metrics(answers: dict) -> dict:
    """
    Minimal metrics for Karasek: D/C/S (0..100) and a quadrant label.
    Expect 1..4 Likert values, with 'rev' reverse-coded in client or we can repeat here.
    """
    # id -> (sub, rev)
    MAP = {
        # D
        1:("D",False), 2:("D",False), 3:("D",False), 4:("D",False), 5:("D",False),
        6:("D",False), 7:("D",False), 8:("D",True),  9:("D",False),
        # DA
        10:("DA",False), 11:("DA",False), 12:("DA",True), 13:("DA",False),
        14:("DA",False), 15:("DA",True),
        # SD
        16:("SD",False), 17:("SD",False), 18:("SD",False), 19:("SD",True),
        20:("SD",False), 21:("SD",False),
        # SS
        22:("SS",False), 23:("SS",False), 24:("SS",True),
        # SC
        25:("SC",False), 26:("SC",False), 27:("SC",True),
    }
    sums   = {"D":0, "DA":0, "SD":0, "SS":0, "SC":0}
    counts = {"D":0, "DA":0, "SD":0, "SS":0, "SC":0}

    for qid, (sub, rev) in MAP.items():
        v = answers.get(str(qid), answers.get(qid))
        if v is None:
            continue
        v = int(v)
        score = (5 - v) if rev else v  # 1..4 scale
        sums[sub] += score
        counts[sub] += 1

    sub = {
        k: _normalize(sums[k], 1*counts[k], 4*counts[k]) if counts[k] else 0
        for k in sums
    }
    demands = sub["D"]
    control = round((sub["DA"] + sub["SD"]) / 2) if (sub["DA"] or sub["SD"]) else 0
    support = round((sub["SS"] + sub["SC"]) / 2) if (sub["SS"] or sub["SC"]) else 0

    demandHigh  = demands >= 60
    controlHigh = control >= 60
    if demandHigh and controlHigh:
        quadrant = "active"
    elif demandHigh and not controlHigh:
        quadrant = "highStrain"
    elif not demandHigh and not controlHigh:
        quadrant = "passive"
    else:
        quadrant = "lowStrain"

    return {"dim": {"D": demands, "C": control, "S": support}, "sub": sub, "quadrant": quadrant}

def _brs_metrics(answers: dict) -> dict:
    """
    Brief Resilience Scale (BRS).
    Items 2, 4, 6 sont inversés : 1->5, 2->4, 3->3, 4->2, 5->1
    """
    if not answers:
        return {}

    reverse_items = {"2", "4", "6"}
    scores = []

    for qid, val in answers.items():
        try:
            val = int(val)
        except (TypeError, ValueError):
            continue
        if str(qid) in reverse_items:
            val = 6 - val  # inversion
        scores.append(val)

    if not scores:
        return {}

    avg = round(sum(scores) / len(scores), 2)

    # Interprétation
    if avg >= 4.31:
        level = "Très haute résilience"
    elif avg >= 3.61:
        level = "Haute résilience"
    elif avg >= 3.00:
        level = "Résilience moyenne"
    elif avg >= 2.40:
        level = "Faible résilience"
    else:
        level = "Très faible résilience"

    return {"average": avg, "level": level, "scores": scores}

def _maslach_metrics(answers: dict) -> dict:
    """
    Placeholder: return minimal structure. Replace with your proper MBI scoring.
    """
    # Example minimal stub to avoid breakage
    return {
        "burnout": {
            "exhaustion": 0,
            "depersonalization": 0,
            "accomplishment": 0,
        }
    }
def _cdrisc10_metrics(answers: dict) -> dict:
    """
    Compute CD-RISC 10 total and level.
    answers = { "1": 0..4, "2": 0..4, ..., "10": 0..4 }
    """
    if not answers:
        return {}

    total = 0
    for qid, val in answers.items():
        try:
            total += int(val)
        except Exception:
            continue

    # Level interpretation
    if total <= 20:
        level = "Résilience faible"
    elif total <= 30:
        level = "Résilience modérée"
    else:
        level = "Haute résilience"

    return {
        "total": total,
        "level": level,
        "range": "0–40",
    }
def _wses_metrics(answers: dict) -> dict:
    """Compute Work Self-Efficacy Scale metrics (1–5 Likert)."""
    if not answers:
        return {}

    total = 0
    count = 0
    for _, val in answers.items():
        try:
            total += int(val)
            count += 1
        except Exception:
            continue

    avg = round(total / count, 2) if count else 0

    if avg <= 2.5:
        level = "Faible auto-efficacité"
    elif avg <= 3.5:
        level = "Auto-efficacité moyenne"
    else:
        level = "Forte auto-efficacité"

    return {"average": avg, "total": total, "range": "1–5", "level": level}


def _gcos_metrics(answers: dict) -> dict:
    """
    Compute GCOS-mini 12-item metrics.
    Each group of 4 items => orientation moyenne.
    """
    if not answers:
        return {}

    def mean(ids):
        vals = [int(answers.get(str(i), 0)) for i in ids]
        vals = [v for v in vals if v]
        return round(sum(vals) / len(vals), 2) if vals else 0

    autonomous = mean([1, 2, 3, 4])
    controlled = mean([5, 6, 7, 8])
    impersonal = mean([9, 10, 11, 12])

    return {
        "autonomous": autonomous,
        "controlled": controlled,
        "impersonal": impersonal,
        "dominant": max(
            {"autonomous": autonomous, "controlled": controlled, "impersonal": impersonal},
            key=lambda k: {"autonomous": autonomous, "controlled": controlled, "impersonal": impersonal}[k],
        ),
        "range": "1–5",
    }


def _ribs_metrics(answers: dict) -> dict:
    """Compute Runco Ideational Behavior Scale (short form)."""
    if not answers:
        return {}

    total = 0
    count = 0
    for _, val in answers.items():
        try:
            total += int(val)
            count += 1
        except Exception:
            continue

    avg = round(total / count, 2) if count else 0
    if avg <= 2.5:
        level = "Faible idéation"
    elif avg <= 3.5:
        level = "Idéation moyenne"
    else:
        level = "Forte idéation"

    return {"average": avg, "total": total, "range": "1–5", "level": level}
def _caq_metrics(answers: dict) -> dict:
    """
    Compute Creative Achievement Questionnaire (Short Form).
    Each checked item = 1 point.
    Group scores by domain + total.
    """
    if not answers:
        return {}

    DOMAINS = {
        "sciences": [1, 2],
        "ingenierie": [3, 4],
        "ecriture": [5, 6],
        "musique": [7, 8],
        "arts_visuels": [9, 10],
        "cuisine": [11, 12],
        "danse": [13, 14],
        "theatre_film": [15, 16],
        "humour": [17, 18],
        "design_architecture": [19, 20],
    }

    domain_scores = {}
    total = 0
    for domain, ids in DOMAINS.items():
        score = sum(1 for i in ids if answers.get(str(i)))
        domain_scores[domain] = score
        total += score

    level = (
        "Faible réalisations créatives"
        if total <= 6
        else "Modérées"
        if total <= 14
        else "Élevées"
    )

    return {
        "domains": domain_scores,
        "total": total,
        "level": level,
        "range": "0–20",
    }


def _ise_metrics(answers: dict) -> dict:
    """
    Compute Innovation Self-Efficacy (short version, 6 items, Likert 1–5).
    """
    if not answers:
        return {}

    vals = []
    for _, val in answers.items():
        try:
            vals.append(int(val))
        except Exception:
            continue

    if not vals:
        return {}

    avg = round(sum(vals) / len(vals), 2)
    total = sum(vals)

    if avg <= 2.5:
        level = "Faible auto-efficacité en innovation"
    elif avg <= 3.5:
        level = "Auto-efficacité modérée"
    else:
        level = "Forte auto-efficacité en innovation"

    return {
        "average": avg,
        "total": total,
        "range": "1–5",
        "level": level,
        
    }


TEMPLATE_METRIC_FUN = {
    "BIG_FIVE": _big_five_metrics,
    "KARASEK":  _karasek_metrics,
    "MASLACH":  _maslach_metrics,
    "DISC": _disc_metrics,  
    "JSS": _jss_metrics,
    "BRS": _brs_metrics,   
    "WSES": _wses_metrics,
    "GCOS": _gcos_metrics,
    "RIBS": _ribs_metrics,
    "CAQ": _caq_metrics,
    "ISE": _ise_metrics,


}
TEMPLATE_METRIC_FUN["CDRISC10"] = _cdrisc10_metrics


def compute_metrics_for_template(code: str, answers: dict) -> dict:
    fn = TEMPLATE_METRIC_FUN.get(code)
    return fn(answers or {}) if fn else {}
# assessments/serializers.py
from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Assignment, AssessmentTemplate

User = get_user_model()

# ---------- (kept) AssignRequestSerializer / AssignmentListItemSerializer / AssignmentDetailSerializer / SubmitAnswersSerializer ----------
# Use your current versions. Below is ONLY the **new** admin list serializer.

class EmployeeMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "department"]

class AssignmentAdminListSerializer(serializers.ModelSerializer):
    template_code = serializers.CharField(source="template.code", read_only=True)
    template_name = serializers.CharField(source="template.name", read_only=True)
    employee = EmployeeMiniSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "template_code", "template_name",
            "status", "assigned_at", "completed_at",
            "employee",
            "answers",       # keep if you want to view raw (optional)
            "metrics",       # <-- used by the dashboard aggregations
            "ai_report",     # <-- optional narrative (if provided)
            "report_pdf",    # <-- optional file path/url if you store PDFs
        ]
