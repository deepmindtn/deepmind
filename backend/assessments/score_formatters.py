"""
assessments/score_formatters.py

Per-assessment score-text formatters used inside AI report prompt strings.
Each function receives the metrics dict sent by the frontend and returns a
human-readable, band-labelled score summary that feeds the LLM prompt as
{scores_text}, replacing the raw Python dict repr previously used as
`assessment_data`.

BigFive scores are already formatted inline in GenerateBigFiveReportView
(scores_text / _level helpers) so no function is needed here for that view.
"""

# ──────────────────────────────────────────────────────────────────────────────
# 2. KARASEK  –  Job Demands-Control-Support (JDC-S) Model
# ──────────────────────────────────────────────────────────────────────────────

KARASEK_QUADRANT_LABELS = {
    "lowstrain":   "Low Strain (Relaxed)",
    "highstrain":  "High Strain (Stressed)",
    "active":      "Active (Motivated / High Stretch)",
    "passive":     "Passive (Disengaged / Under-stimulated)",
    "low_strain":  "Low Strain (Relaxed)",
    "high_strain": "High Strain (Stressed)",
}


def format_karasek_scores(metrics: dict) -> str:
    """Format Karasek JDC-S scores for LLM prompt."""
    dim = metrics.get("dimScores") or metrics.get("dim") or {}
    D = int(dim.get("D", 0))
    C = int(dim.get("C", 0))
    S = int(dim.get("S", 0))

    quadrant_raw = str(metrics.get("quadrant", "unknown")).lower().replace(" ", "_")
    quadrant = KARASEK_QUADRANT_LABELS.get(quadrant_raw, quadrant_raw.replace("_", " ").title())

    def band(s):
        if s >= 67: return "High"
        if s >= 34: return "Moderate"
        return "Low"

    return (
        "Karasek JDC-S Dimension Scores (0–100 normalised scale):\n"
        f"  Psychological Demands (D):      {D:>3}/100  →  {band(D)}\n"
        f"  Decision Latitude / Control (C): {C:>3}/100  →  {band(C)}\n"
        f"  Social Support (S):             {S:>3}/100  →  {band(S)}\n"
        f"JDC-S Quadrant: {quadrant}\n"
        "\n"
        "Score bands: Low 0–33 | Moderate 34–66 | High 67–100\n"
        "Quadrant logic:\n"
        "  High Strain  = High Demands + Low Control   (burnout risk)\n"
        "  Active       = High Demands + High Control  (stretch & growth)\n"
        "  Passive      = Low Demands  + Low Control   (boredom, disengagement)\n"
        "  Low Strain   = Low Demands  + High Control  (comfortable, relaxed)"
    )


# ──────────────────────────────────────────────────────────────────────────────
# 3. MASLACH  –  Burnout Inventory (MBI)
# ──────────────────────────────────────────────────────────────────────────────

def format_maslach_scores(metrics: dict) -> str:
    """Format Maslach MBI scores for LLM prompt. PA scale is INVERTED."""
    sub = metrics.get("subScores") or {}
    EE = int(sub.get("EE", 0))
    DP = int(sub.get("DP", 0))
    PA = int(sub.get("PA", 0))

    def mbi_band(s):
        if s >= 60: return "High"
        if s <= 40: return "Low"
        return "Moderate"

    return (
        "Maslach Burnout Inventory (MBI) Subscale Scores (0–100 normalised):\n"
        f"  Emotional Exhaustion (EE):    {EE:>3}/100  →  {mbi_band(EE)}\n"
        f"  Depersonalisation (DP):       {DP:>3}/100  →  {mbi_band(DP)}\n"
        f"  Personal Accomplishment (PA): {PA:>3}/100  →  {mbi_band(PA)}\n"
        "\n"
        "⚠️  CRITICAL – Direction of burnout risk:\n"
        "  EE and DP : HIGH scores = higher burnout risk.\n"
        "  PA        : LOW  scores = higher burnout risk  (PA is a PROTECTIVE factor — lower means more burned out).\n"
        "Score bands (0–100): Low ≤40 | Moderate 41–59 | High ≥60"
    )


# ──────────────────────────────────────────────────────────────────────────────
# 4. DISC  –  Behavioural Style Profile
# ──────────────────────────────────────────────────────────────────────────────

DISC_LABELS = {
    "D": "Dominance",
    "I": "Influence",
    "S": "Steadiness",
    "C": "Compliance",
}


def format_disc_scores(metrics: dict) -> str:
    """Format DISC scores. Metrics are raw counts from 15 forced-choice questions."""
    D = int(metrics.get("D", 0))
    I = int(metrics.get("I", 0))
    S = int(metrics.get("S", 0))
    C = int(metrics.get("C", 0))
    total = D + I + S + C or 15  # guard against zero

    def pct(v): return round(v / total * 100)
    def band(p):
        if p > 40: return "High presence"
        if p >= 25: return "Moderate presence"
        return "Low presence"

    scores = {"D": D, "I": I, "S": S, "C": C}
    dominant = max(scores, key=scores.get)

    lines = ["DISC Profile Scores (raw counts, 15 forced-choice questions):"]
    for key, label in DISC_LABELS.items():
        v = scores[key]
        p = pct(v)
        lines.append(f"  {label} ({key}): {v}/15  ({p}%)  →  {band(p)}")
    lines += [
        f"Dominant DISC style: {DISC_LABELS[dominant]} ({dominant})",
        "",
        "Interpretation bands: High >40% | Moderate 25–40% | Low <25%",
        "Note: DISC measures communication / behavioural style, not ability.",
    ]
    return "\n".join(lines)


# ──────────────────────────────────────────────────────────────────────────────
# 5. JSS  –  Job Satisfaction Survey
# ──────────────────────────────────────────────────────────────────────────────

JSS_DIMENSION_LABELS = {
    "remuneration": "Rémunération (Pay)",
    "avantages":    "Avantages sociaux (Benefits)",
    "promotion":    "Promotion",
    "supervision":  "Supervision",
    "conditions":   "Conditions de travail (Working Conditions)",
    "collegues":    "Relations avec collègues (Co-workers)",
    "nature":       "Nature du travail (Work Nature)",
    "politiques":   "Politiques organisationnelles (Org. Policies)",
    "communication":"Communication",
}


def format_jss_scores(metrics: dict) -> str:
    """Format JSS scores. Each dimension is raw sum of 4 items × 1-6 Likert (range 4-24)."""
    dim = metrics.get("dimScores") or {}
    global_score = int(metrics.get("global", 0))

    def dim_band(s):
        if s >= 19: return "Very High satisfaction  (19–24)"
        if s >= 14: return "Moderate satisfaction   (14–18)"
        if s >= 9:  return "Low satisfaction        (9–13)"
        return      "Very Low satisfaction   (4–8)"

    def global_band(g):
        if g >= 171: return "Very High overall satisfaction"
        if g >= 126: return "Moderate overall satisfaction"
        if g >= 81:  return "Low overall satisfaction"
        return       "Very Low overall satisfaction"

    lines = [
        "Job Satisfaction Survey (JSS) Scores:",
        "Per-dimension scale: 4–24  (4 items × 1–6 Likert):",
    ]
    for key, label in JSS_DIMENSION_LABELS.items():
        v = int(dim.get(key, 0))
        lines.append(f"  {label}: {v}/24  →  {dim_band(v)}")
    lines += [
        f"Global Total Score: {global_score}/216  →  {global_band(global_score)}",
        "",
        "Per-dimension bands: Very Low 4–8 | Low 9–13 | Moderate 14–18 | Very High 19–24",
        "Global score bands:  Very Low ≤80 | Low 81–125 | Moderate 126–170 | Very High 171–216",
    ]
    return "\n".join(lines)


# ──────────────────────────────────────────────────────────────────────────────
# 6. BRS  –  Brief Resilience Scale
# ──────────────────────────────────────────────────────────────────────────────

def format_brs_scores(metrics: dict) -> str:
    """Format BRS scores. Average is 1.00–5.00; reverse items already applied."""
    average = float(metrics.get("average", 0))
    level = str(metrics.get("level", ""))

    def band(a):
        if a >= 4.31: return "Very High Resilience (4.31–5.00)"
        if a >= 3.61: return "High Resilience (3.61–4.30)"
        if a >= 3.0:  return "Average Resilience (3.00–3.60)"
        if a >= 2.4:  return "Low Resilience (2.40–2.99)"
        return        "Very Low Resilience (1.00–2.39)"

    return (
        "Brief Resilience Scale (BRS) Scores:\n"
        "6 items, Likert 1–5 (reverse-scored items 2, 4, 6 already corrected):\n"
        f"  Average Score: {average:.2f}/5.00  →  {band(average)}\n"
        f"  Level label:   {level}\n"
        "\n"
        "Bands: Very High (4.31–5.00) | High (3.61–4.30) | Average (3.00–3.60)\n"
        "       Low (2.40–2.99) | Very Low (1.00–2.39)"
    )


# ──────────────────────────────────────────────────────────────────────────────
# 7. CD-RISC 10  –  Connor-Davidson Resilience Scale
# ──────────────────────────────────────────────────────────────────────────────

def format_cdrisc_scores(metrics: dict) -> str:
    """Format CD-RISC 10 scores. Total is 0–40 (10 items × 0–4 Likert)."""
    total = int(metrics.get("total", 0))
    average = float(metrics.get("average", 0))

    def band(t):
        if t >= 30: return "High Resilience (30–40)"
        if t >= 20: return "Moderate Resilience (20–29)"
        return      "Low Resilience (0–19)"

    return (
        "CD-RISC 10 (Connor-Davidson Resilience Scale) Scores:\n"
        "10 items, Likert 0–4 (0=Not true at all  →  4=True nearly all the time):\n"
        f"  Total Score:       {total}/40   →  {band(total)}\n"
        f"  Per-item Average:  {average:.2f}/4.00\n"
        "\n"
        "Bands: Low 0–19 | Moderate 20–29 | High 30–40"
    )


# ──────────────────────────────────────────────────────────────────────────────
# 8. WSES  –  Work Self-Efficacy Scale
# ──────────────────────────────────────────────────────────────────────────────

def format_wses_scores(metrics: dict) -> str:
    """Format WSES scores. 8 items × 1-5 Likert; average 1.00–5.00."""
    average = float(metrics.get("average", 0))
    total = int(metrics.get("total", 0))

    def band(a):
        if a >= 4.0: return "High Work Self-Efficacy (4.00–5.00)"
        if a >= 3.0: return "Moderate Work Self-Efficacy (3.00–3.99)"
        return       "Low Work Self-Efficacy (1.00–2.99)"

    return (
        "Work Self-Efficacy Scale (WSES) Scores:\n"
        "8 items, Likert 1–5 (1=Strongly Disagree  →  5=Strongly Agree):\n"
        f"  Average Score: {average:.2f}/5.00  →  {band(average)}\n"
        f"  Total Score:   {total}/40\n"
        "\n"
        "Bands: High (4.00–5.00) | Moderate (3.00–3.99) | Low (1.00–2.99)"
    )


# ──────────────────────────────────────────────────────────────────────────────
# 9. GCOS  –  General Causality Orientations Scale
# ──────────────────────────────────────────────────────────────────────────────

def format_gcos_scores(metrics: dict) -> str:
    """Format GCOS scores. Each orientation average is 1.00–5.00 (4 items each)."""
    autonomous = float(metrics.get("autonomous", 0))
    controlled = float(metrics.get("controlled", 0))
    impersonal = float(metrics.get("impersonal", 0))

    def band(a):
        if a >= 4.0: return "Dominant"
        if a >= 2.5: return "Moderate"
        return       "Low"

    orientations = {"Autonomous": autonomous, "Controlled": controlled, "Impersonal": impersonal}
    dominant = max(orientations, key=orientations.get)

    return (
        "General Causality Orientations Scale (GCOS) Scores:\n"
        "12 items (4 per orientation), Likert 1–5:\n"
        f"  Autonomous Orientation:  {autonomous:.2f}/5.00  →  {band(autonomous)}\n"
        f"  Controlled Orientation:  {controlled:.2f}/5.00  →  {band(controlled)}\n"
        f"  Impersonal Orientation:  {impersonal:.2f}/5.00  →  {band(impersonal)}\n"
        f"Dominant Orientation: {dominant}\n"
        "\n"
        "Bands: Low 1.00–2.49 | Moderate 2.50–3.99 | Dominant 4.00–5.00\n"
        "Autonomous = intrinsically motivated, self-directed, values-driven.\n"
        "Controlled = driven by rewards, deadlines, approval, or external pressure.\n"
        "Impersonal = amotivated; perceives outcomes as beyond personal control."
    )


# ──────────────────────────────────────────────────────────────────────────────
# 10. RIBS  –  Runco Ideational Behavior Scale
# ──────────────────────────────────────────────────────────────────────────────

def format_ribs_scores(metrics: dict) -> str:
    """Format RIBS scores. 10 items × 1-4 Likert; average 1.00–4.00."""
    average = float(metrics.get("average", 0))
    total = int(metrics.get("total", 0))

    def band(a):
        if a >= 3.0: return "High Ideation (3.00–4.00)"
        if a >= 2.0: return "Moderate Ideation (2.00–2.99)"
        return       "Low Ideation (1.00–1.99)"

    return (
        "Runco Ideational Behavior Scale (RIBS) Scores:\n"
        "10 items, Likert 1–4 (1=Strongly Disagree  →  4=Strongly Agree):\n"
        f"  Average Score: {average:.2f}/4.00  →  {band(average)}\n"
        f"  Total Score:   {total}/40\n"
        "\n"
        "Bands: Low 1.00–1.99 | Moderate 2.00–2.99 | High 3.00–4.00"
    )


# ──────────────────────────────────────────────────────────────────────────────
# 11. CAQ  –  Creative Achievement Questionnaire
# ──────────────────────────────────────────────────────────────────────────────

CAQ_DOMAIN_LABELS = {
    "sciences":            "Sciences",
    "ingenierie":          "Engineering / Invention",
    "ecriture":            "Writing",
    "musique":             "Music",
    "arts_visuels":        "Visual Arts",
    "cuisine":             "Culinary Arts",
    "danse":               "Dance / Performance",
    "theatre_film":        "Theatre / Film",
    "humour":              "Humour",
    "design_architecture": "Design / Architecture",
}


def format_caq_scores(metrics: dict) -> str:
    """Format CAQ scores. Binary scale: 0=no activity, 1=attempted, 2=recognised."""
    domain_scores = metrics.get("domainScores") or {}
    total = int(metrics.get("total", 0))

    def score_label(s):
        if s >= 2: return "Recognised / published achievement"
        if s >= 1: return "Some involvement / attempted"
        return     "No reported activity"

    def global_band(t):
        if t >= 17: return "Exceptional (17–20)"
        if t >= 13: return "High (13–16)"
        if t >= 8:  return "Moderate (8–12)"
        if t >= 4:  return "Low (4–7)"
        return      "Minimal (0–3)"

    lines = [
        "Creative Achievement Questionnaire (CAQ) Scores:",
        "20 items across 10 creative domains  (0–2 per domain):",
    ]
    for key, label in CAQ_DOMAIN_LABELS.items():
        v = int(domain_scores.get(key, 0))
        lines.append(f"  {label}: {v}/2  —  {score_label(v)}")
    lines += [
        f"Total Score: {total}/20  →  {global_band(total)}",
        "",
        "Domain score: 0=No activity | 1=Some involvement | 2=Recognised/published",
        "Global bands: Minimal 0–3 | Low 4–7 | Moderate 8–12 | High 13–16 | Exceptional 17–20",
    ]
    return "\n".join(lines)


# ──────────────────────────────────────────────────────────────────────────────
# 12. ISE  –  Innovation Self-Efficacy Scale
# ──────────────────────────────────────────────────────────────────────────────

def format_ise_scores(metrics: dict) -> str:
    """Format ISE scores. 6 items × 1-5 Likert; average 1.00–5.00."""
    average = float(metrics.get("average", 0))
    total = int(metrics.get("total", 0))

    def band(a):
        if a >= 4.0: return "High Innovation Confidence (4.00–5.00)"
        if a >= 3.0: return "Moderate Innovation Confidence (3.00–3.99)"
        return       "Low Innovation Confidence (1.00–2.99)"

    return (
        "Innovation Self-Efficacy Scale (ISE) Scores:\n"
        "6 items, Likert 1–5 (1=Strongly Disagree  →  5=Strongly Agree):\n"
        f"  Average Score: {average:.2f}/5.00  →  {band(average)}\n"
        f"  Total Score:   {total}/30\n"
        "\n"
        "Bands: High (4.00–5.00) | Moderate (3.00–3.99) | Low (1.00–2.99)"
    )
