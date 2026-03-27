from collections import defaultdict

from django.utils import timezone


def _extract_numeric_metrics(metric_set, template_code):
    """
    Extract numeric values from nested metric structures based on template type.
    Recursively flattens nested dicts to capture all numeric values.
    Handles various metric formats returned by different scoring functions.
    """
    flattened = {}

    def _recursive_extract(obj, depth=0, max_depth=3):
        """Recursively extract numeric values from nested structures."""
        if depth > max_depth:
            return

        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, (int, float)):
                    flattened[k] = v
                elif isinstance(v, dict):
                    _recursive_extract(v, depth + 1)
        elif isinstance(obj, (list, tuple)) and len(obj) > 0 and isinstance(obj[0], (int, float)):
            # Handle list of numbers - take average
            avg_val = sum(obj) / len(obj)
            flattened[f"_{template_code}_avg"] = avg_val

    # Template-specific extraction logic
    if template_code == "DISC":
        # DISC: {"trait": {"D": x, "I": y, "C": z, "S": w}, "percent": {...}}
        if "trait" in metric_set and isinstance(metric_set["trait"], dict):
            flattened.update(metric_set["trait"])
        if "percent" in metric_set and isinstance(metric_set["percent"], dict):
            for k, v in metric_set["percent"].items():
                if isinstance(v, (int, float)):
                    flattened[f"{k}_pct"] = v

    elif template_code == "BIG_FIVE":
        # BIG_FIVE: {"trait": {"N": x, "E": y, "O": z, "A": w, "C": v} or direct structure
        if "trait" in metric_set and isinstance(metric_set["trait"], dict):
            flattened.update(metric_set["trait"])
        elif "facets" in metric_set and isinstance(metric_set["facets"], dict):
            _recursive_extract(metric_set["facets"], depth=0)
        else:
            # Try direct structure
            for k, v in metric_set.items():
                if k in ["N", "E", "O", "A", "C"] and isinstance(v, (int, float)):
                    flattened[k] = v

    elif template_code == "KARASEK":
        # KARASEK: {"dim": {"D": x, "C": y, "S": z}, "sub": {...}}
        if "dim" in metric_set and isinstance(metric_set["dim"], dict):
            flattened.update(metric_set["dim"])
        if "sub" in metric_set and isinstance(metric_set["sub"], dict):
            for k, v in metric_set["sub"].items():
                if isinstance(v, (int, float)) and k not in flattened:
                    flattened[f"sub_{k}"] = v
        # Also check for direct Demands/Control/Support keys
        for k in ["Demands", "Control", "Support", "D", "C", "S"]:
            if k in metric_set and isinstance(metric_set[k], (int, float)):
                flattened[k] = metric_set[k]

    elif template_code == "JSS":
        # JSS: {"subscores": {...}, "total": x, "global": y}
        if "subscores" in metric_set and isinstance(metric_set["subscores"], dict):
            flattened.update(metric_set["subscores"])
        if "total" in metric_set and isinstance(metric_set["total"], (int, float)):
            flattened["global"] = metric_set["total"]
        if "global" in metric_set and isinstance(metric_set["global"], (int, float)):
            flattened["global"] = metric_set["global"]
        # Extract any other top-level numeric values
        for k, v in metric_set.items():
            if k not in ["subscores", "total", "global"] and isinstance(v, (int, float)):
                flattened[k] = v

    elif template_code == "MASLACH":
        # MASLACH: {"scores": {"EE": x, "DP": y, "PA": z} or direct {EE, DP, PA}
        alias_map = {
            "emotional_exhaustion": "EE",
            "exhaustion": "EE",
            "depersonalization": "DP",
            "personal_accomplishment": "PA",
            "accomplishment": "PA",
        }

        if "scores" in metric_set and isinstance(metric_set["scores"], dict):
            for k, v in metric_set["scores"].items():
                if isinstance(v, (int, float)):
                    canonical_key = alias_map.get(str(k).lower(), k)
                    flattened[canonical_key] = v
        else:
            # Direct numeric keys or nested structure
            for k, v in metric_set.items():
                if isinstance(v, (int, float)):
                    canonical_key = alias_map.get(str(k).lower(), k)
                    flattened[canonical_key] = v
                elif isinstance(v, dict):
                    for sub_k, sub_v in v.items():
                        if isinstance(sub_v, (int, float)):
                            canonical_key = alias_map.get(str(sub_k).lower(), sub_k)
                            flattened[canonical_key] = sub_v

    elif template_code in ["BRS", "CDRISC", "CDRISC10"]:
        # Resilience scales: {"total": x, "average": y} or nested structure
        for k, v in metric_set.items():
            if isinstance(v, (int, float)):
                flattened[k] = v
            elif isinstance(v, dict) and k not in flattened:
                for sub_k, sub_v in v.items():
                    if isinstance(sub_v, (int, float)):
                        flattened[f"{k}_{sub_k}"] = sub_v

    elif template_code in ["CAQ", "ISE", "WSES", "GCOS", "RIBS"]:
        # Generic scales - extract all numeric values recursively
        _recursive_extract(metric_set, depth=0)

    else:
        # Fallback for unknown templates - recursive extraction
        _recursive_extract(metric_set, depth=0)

    # if nothing was extracted, try recursive extraction
    if not flattened:
        _recursive_extract(metric_set, depth=0)

    return flattened


def _get_assignment_metrics(assignment, compute_metrics_for_template=None):
    """
    Return metrics for an assignment, computing them from answers when absent.
    """
    if assignment.metrics:
        return assignment.metrics

    if assignment.status == "COMPLETED" and assignment.answers and compute_metrics_for_template:
        try:
            computed = compute_metrics_for_template(assignment.template.code, assignment.answers)
            if computed:
                return computed
        except Exception:
            print(
                f"Error computing metrics for assignment {assignment.id} "
                f"with template {assignment.template.code}"
            )

    return None


def _average_flattened_metrics(metric_set, template_code):
    """
    Flatten template metrics then compute the average numeric value.
    Returns None when no numeric values are available.
    """
    flattened = _extract_numeric_metrics(metric_set or {}, template_code)
    numeric_values = [float(v) for v in flattened.values() if isinstance(v, (int, float))]
    if not numeric_values:
        return None
    return sum(numeric_values) / len(numeric_values)


def _metric_value(metric_set, *paths, default=0.0):
    """
    Read a numeric metric from multiple candidate key paths.
    Example paths: "EE", ("burnout", "exhaustion")
    """
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
        casted = _to_float(value, default=None)
        if casted is not None:
            return casted
    return default


def build_aggregate_metrics(assignments):
    """
    Given an iterable of completed assignments, returns a dict of average metrics per test type.
    Computes metrics for assignments missing them.
    """
    from assessments.serializers import compute_metrics_for_template

    groups = defaultdict(list)
    for a in assignments:
        metric_set = _get_assignment_metrics(a, compute_metrics_for_template)
        if metric_set:
            groups[a.template.code].append(metric_set)

    averages = {}
    for code, metrics_list in groups.items():
        if not metrics_list:
            continue

        # Calculate averages for all numeric keys
        aggregated = defaultdict(float)
        counts = defaultdict(int)

        for metric_set in metrics_list:
            # Extract numeric values based on template structure
            flattened = _extract_numeric_metrics(metric_set, code)

            for k, v in flattened.items():
                if isinstance(v, (int, float)):
                    aggregated[k] += v
                    counts[k] += 1

        if aggregated:
            averages[code] = {k: round(aggregated[k] / counts[k], 2) for k in aggregated}

    return averages


def _calculate_employee_trend(user_assignments):
    """
    Dynamically calculate trend for an employee by comparing first vs last assignment metrics.
    Returns: trend string such as "📈 Improving", "📉 Declining", "➡️ Stable"
    Computes metrics for assignments missing them.
    """
    from assessments.serializers import compute_metrics_for_template

    metrics_by_template = defaultdict(list)
    for assignment in user_assignments:
        if assignment.status != "COMPLETED":
            continue
        metric_set = _get_assignment_metrics(assignment, compute_metrics_for_template)
        if metric_set:
            metrics_by_template[assignment.template.code].append((assignment, metric_set))

    template_deltas = []
    for code, records in metrics_by_template.items():
        if len(records) < 2:
            continue
        records.sort(key=lambda r: r[0].completed_at or timezone.now())
        first_avg = _average_flattened_metrics(records[0][1], code)
        last_avg = _average_flattened_metrics(records[-1][1], code)
        if first_avg is None or last_avg is None:
            continue
        template_deltas.append(last_avg - first_avg)

    if not template_deltas:
        return "➡️ No trend data"

    delta = sum(template_deltas) / len(template_deltas)
    if delta > 3:
        return "📈 Improving"
    if delta < -3:
        return "📉 Declining"
    return "➡️ Stable"


def build_employee_breakdown(assignments):
    """
    Groups assignments by employee and summarizes status/missing tests.
    Includes individual metrics, AI insights, and trend analysis.
    Computes metrics for assignments missing them.
    """
    from assessments.serializers import compute_metrics_for_template

    users = defaultdict(list)
    for a in assignments:
        users[a.employee].append(a)

    breakdown = []
    for user, user_assignments in users.items():
        # List which tests they completed vs not
        completed = sorted({a.template.code for a in user_assignments if a.status == "COMPLETED"})
        pending = sorted({a.template.code for a in user_assignments if a.status != "COMPLETED"})

        # Calculate dynamic trend based on employee's historical metrics
        trend = _calculate_employee_trend(user_assignments)

        # Calculate individual employee metrics (averaged across their completed assignments)
        personal_metrics = {}

        # Get all completed assignments and compute metrics if missing
        user_completed_with_metrics = []
        for a in user_assignments:
            if a.status == "COMPLETED":
                metric_set = _get_assignment_metrics(a, compute_metrics_for_template)
                if metric_set:
                    user_completed_with_metrics.append((a.template.code, metric_set))

        if user_completed_with_metrics:
            metrics_by_template = defaultdict(list)
            for code, metric_set in user_completed_with_metrics:
                metrics_by_template[code].append(metric_set)

            # Aggregate individual metrics
            for code, metrics_list in metrics_by_template.items():
                if metrics_list:
                    aggregated = defaultdict(float)
                    counts = defaultdict(int)

                    for metric_set in metrics_list:
                        flattened = _extract_numeric_metrics(metric_set, code)
                        for k, v in flattened.items():
                            if isinstance(v, (int, float)):
                                aggregated[k] += v
                                counts[k] += 1

                    if aggregated:
                        personal_metrics[code] = {
                            k: round(aggregated[k] / counts[k], 2) for k in aggregated
                        }

        # Generate AI insight about employee's well-being evolution
        ai_summary = _calculate_employee_insight(user_assignments)

        status_label = (
            user.get_employment_status_display()
            if hasattr(user, "get_employment_status_display")
            else user.employment_status
        )

        breakdown.append(
            {
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip() or user.email,
                "status": status_label,
                "role": user.role,
                "department": user.department,
                "completed": completed,
                "missing": pending,
                "trend": trend,
                "personal_metrics": personal_metrics,
                "ai_summary": ai_summary,
            }
        )
    return breakdown


def build_trends(assignments):
    """
    Build trend highlights by comparing key burnout/stress metrics across time periods.
    Returns dict of trend categories with type and label.
    """
    from assessments.serializers import compute_metrics_for_template

    # Group assignments by template code
    groups = defaultdict(list)
    for a in assignments:
        metric_set = _get_assignment_metrics(a, compute_metrics_for_template)
        if metric_set:
            groups[a.template.code].append((a, metric_set))

    trend_highlights = {}

    # Maslach Burnout Analysis
    if "MASLACH" in groups and len(groups["MASLACH"]) > 1:
        maslach_list = sorted(groups["MASLACH"], key=lambda x: x[0].completed_at or timezone.now())
        first_metrics = maslach_list[0][1]
        last_metrics = maslach_list[-1][1]

        first_exhaustion = _metric_value(
            first_metrics,
            "EE",
            "Emotional_Exhaustion",
            ("burnout", "exhaustion"),
        )
        last_exhaustion = _metric_value(
            last_metrics,
            "EE",
            "Emotional_Exhaustion",
            ("burnout", "exhaustion"),
        )

        delta = last_exhaustion - first_exhaustion
        relative = delta / max(abs(first_exhaustion), 1.0)
        if relative > 0.1:
            trend_highlights["Burnout"] = {"type": "danger", "label": f"📈 +{delta:.1f} pts"}
        elif relative < -0.1:
            trend_highlights["Burnout"] = {"type": "success", "label": f"📉 {delta:.1f} pts"}
        else:
            trend_highlights["Burnout"] = {"type": "warning", "label": "➡️ Stable"}

    # JSS Job Satisfaction Analysis
    if "JSS" in groups and len(groups["JSS"]) > 1:
        jss_list = sorted(groups["JSS"], key=lambda x: x[0].completed_at or timezone.now())
        first_metrics = jss_list[0][1]
        last_metrics = jss_list[-1][1]

        first_satisfaction = _metric_value(first_metrics, "global", "total", "average")
        last_satisfaction = _metric_value(last_metrics, "global", "total", "average")

        delta = last_satisfaction - first_satisfaction
        relative = delta / max(abs(first_satisfaction), 1.0)
        if relative > 0.08:
            trend_highlights["Satisfaction"] = {"type": "success", "label": f"📈 +{delta:.1f} pts"}
        elif relative < -0.08:
            trend_highlights["Satisfaction"] = {"type": "warning", "label": f"📉 {delta:.1f} pts"}
        else:
            trend_highlights["Satisfaction"] = {"type": "warning", "label": "➡️ Stable"}

    # Resilience Analysis
    if "BRS" in groups and len(groups["BRS"]) > 1:
        brs_list = sorted(groups["BRS"], key=lambda x: x[0].completed_at or timezone.now())
        first_metrics = brs_list[0][1]
        last_metrics = brs_list[-1][1]

        first_resilience = _metric_value(first_metrics, "average", "total")
        last_resilience = _metric_value(last_metrics, "average", "total")

        delta = last_resilience - first_resilience
        if delta > 0.3:
            trend_highlights["Resilience"] = {"type": "success", "label": f"💪 +{delta:.2f}"}
        elif delta < -0.3:
            trend_highlights["Resilience"] = {"type": "warning", "label": f"🔽 {delta:.2f}"}
        else:
            trend_highlights["Resilience"] = {"type": "warning", "label": "➡️ Stable"}

    return trend_highlights


def build_metric_timeseries(assignments):
    """
    Build a chronological time-series from completed assignments.
    Returns a list of periods with averaged burnout/satisfaction metrics.
    """
    from assessments.serializers import compute_metrics_for_template

    period_buckets = defaultdict(lambda: {"burnout": [], "satisfaction": []})

    for a in assignments:
        metric_set = _get_assignment_metrics(a, compute_metrics_for_template)
        if not metric_set:
            continue

        period = (a.completed_at or timezone.now()).strftime("%Y-%m")
        code = a.template.code

        if code == "MASLACH":
            burnout = _metric_value(
                metric_set,
                "EE",
                "Emotional_Exhaustion",
                ("burnout", "exhaustion"),
            )
            period_buckets[period]["burnout"].append(burnout)

        if code == "JSS":
            satisfaction = _metric_value(metric_set, "global", "total", "average")
            period_buckets[period]["satisfaction"].append(satisfaction)

    series = []
    for period in sorted(period_buckets.keys()):
        burnout_vals = period_buckets[period]["burnout"]
        satisfaction_vals = period_buckets[period]["satisfaction"]
        series.append(
            {
                "period": period,
                "exhaustion": round(sum(burnout_vals) / len(burnout_vals), 2)
                if burnout_vals
                else 0.0,
                "satisfaction": round(sum(satisfaction_vals) / len(satisfaction_vals), 2)
                if satisfaction_vals
                else 0.0,
            }
        )

    return series


def generate_dynamic_alerts(metrics, employee_breakdown):
    """
    Generate alerts dynamically based on metric thresholds and employee data.
    """
    alerts = []

    # Check burnout levels
    if "MASLACH" in metrics:
        exhaustion = _metric_value(
            metrics["MASLACH"],
            "EE",
            "Emotional_Exhaustion",
            ("burnout", "exhaustion"),
        )
        if exhaustion > 30:
            alerts.append(
                {
                    "type": "danger",
                    "message": "⚠️ High burnout detected across team. Recommend immediate wellness interventions.",
                }
            )
        elif exhaustion > 20:
            alerts.append(
                {
                    "type": "warning",
                    "message": "⚠️ Moderate burnout levels detected. Monitor employee well-being closely.",
                }
            )

    # Check for low satisfaction
    if "JSS" in metrics:
        satisfaction = _metric_value(metrics["JSS"], "global", "total", "average")
        if satisfaction < 80:
            alerts.append(
                {
                    "type": "warning",
                    "message": "📉 Job satisfaction scores below target. Consider reviewing work conditions.",
                }
            )

    # Check resilience
    if "BRS" in metrics:
        resilience = _metric_value(metrics["BRS"], "average", "total")
        if resilience < 2.5:
            alerts.append(
                {
                    "type": "warning",
                    "message": "💪 Low resilience scores. Recommend stress management programs.",
                }
            )

    # Default success message if no issues
    if not alerts:
        alerts.append(
            {
                "type": "success",
                "message": "✅ Team metrics within healthy parameters.",
            }
        )

    return alerts


def _to_float(value, default=0.0):
    """Safely convert any value to float, handling strings, ints, None, etc."""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def _calculate_employee_insight(user_assignments):
    """
    Generate a detailed AI insight about an employee's well-being evolution.
    Compares metrics across multiple test iterations to detect trends and changes.
    Returns a structured summary with current state and evolution narrative.
    """
    from .ai_report_generator import generate_employee_evolution_insight
    from assessments.serializers import compute_metrics_for_template

    completed_records = []
    for assignment in user_assignments:
        if assignment.status != "COMPLETED":
            continue
        metric_set = _get_assignment_metrics(assignment, compute_metrics_for_template)
        if metric_set:
            completed_records.append((assignment, metric_set))

    if not completed_records:
        return {
            "summary": "No assessment data available.",
            "current_state": [],
            "evolution_details": [],
            "strengths": [],
            "action_points": [],
            "profile_archetype": "N/A"
        }

    # Sort by completion date
    completed_records.sort(key=lambda r: r[0].completed_at or timezone.now())

    metrics_history = []
    for assignment, metric_set in completed_records:
        metrics_history.append({
            "assessment": assignment.template.name,
            "date": (assignment.completed_at or timezone.now()).strftime("%Y-%m-%d"),
            "metrics": metric_set
        })

    return generate_employee_evolution_insight(metrics_history)
