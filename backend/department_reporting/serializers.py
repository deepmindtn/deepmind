from rest_framework import serializers

from .models import DepartmentReport


class DepartmentReportSerializer(serializers.ModelSerializer):
    trends = serializers.SerializerMethodField()
    trend_highlights = serializers.SerializerMethodField()
    metric_timeseries = serializers.SerializerMethodField()

    class Meta:
        model = DepartmentReport
        fields = [
            "id",
            "department",
            "date_from",
            "date_to",
            "status_filter",
            "created_by",
            "created_at",
            "overview_data",
            "aggregated_metrics",
            "trends",
            "trend_highlights",
            "metric_timeseries",
            "alerts",
            "ai_summary",
            "employee_breakdown",
        ]
        read_only_fields = fields

    def get_trends(self, obj):
        return obj.trends or {}

    def get_trend_highlights(self, obj):
        return obj.trends or {}

    def get_metric_timeseries(self, obj):
        overview = obj.overview_data or {}
        return overview.get("metric_timeseries", [])


class GenerateReportRequestSerializer(serializers.Serializer):
    department = serializers.CharField(required=True)
    status_filter = serializers.CharField(required=False, default="all")
    date_from = serializers.DateField(required=False, allow_null=True)
    date_to = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        department = str(attrs.get("department", "all") or "all").strip()
        status_filter = str(attrs.get("status_filter", "all") or "all").strip().lower()
        status_filter = status_filter.replace("-", "_").replace(" ", "_")

        status_map = {
            "all": "all",
            "active": "active",
            "inactive": "inactive",
            "on_leave": "on_leave",
        }
        normalized_status = status_map.get(status_filter)
        if normalized_status is None:
            raise serializers.ValidationError(
                {"status_filter": "Use one of: all, active, inactive, on_leave."}
            )

        date_from = attrs.get("date_from")
        date_to = attrs.get("date_to")
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError(
                {"date_to": "date_to must be greater than or equal to date_from."}
            )

        attrs["department"] = department or "all"
        attrs["status_filter"] = normalized_status
        return attrs


class DepartmentReportListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentReport
        fields = [
            "id",
            "company_id",
            "department",
            "date_from",
            "date_to",
            "status_filter",
            "created_at",
        ]
