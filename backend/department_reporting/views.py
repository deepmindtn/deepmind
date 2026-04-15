from django.db import ProgrammingError
from django.db.models import Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from assessments.models import Assignment
from core.pagination import FixedPageSizePagination

from .models import DepartmentReport
from .serializers import (
    DepartmentReportListSerializer,
    DepartmentReportSerializer,
    GenerateReportRequestSerializer,
)
from .services.ai_report_generator import generate_department_ai_summary
from .services.report_aggregation import (
    build_aggregate_metrics,
    build_employee_breakdown,
    build_metric_timeseries,
    build_trends,
    generate_dynamic_alerts,
)


class DepartmentReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = GenerateReportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        department = serializer.validated_data["department"]
        status_filter = serializer.validated_data.get("status_filter", "all")
        date_from = serializer.validated_data.get("date_from")
        date_to = serializer.validated_data.get("date_to")

        company_id = getattr(request.user, "company_id", None)
        if not company_id:
            return Response(
                {"error": "User does not belong to a company"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        users_query = User.objects.filter(company_id=company_id)
        if department.lower() != "all":
            users_query = users_query.filter(department__iexact=department)

        if status_filter != "all":
            users_query = users_query.filter(employment_status__iexact=status_filter)

        employee_ids = list(users_query.values_list("id", flat=True))

        assignments_query = Assignment.objects.filter(employee_id__in=employee_ids).select_related(
            "template", "employee"
        )

        if date_from:
            assignments_query = assignments_query.filter(
                Q(completed_at__date__gte=date_from)
                | Q(completed_at__isnull=True, assigned_at__date__gte=date_from)
            )
        if date_to:
            assignments_query = assignments_query.filter(
                Q(completed_at__date__lte=date_to)
                | Q(completed_at__isnull=True, assigned_at__date__lte=date_to)
            )

        all_assignments = list(assignments_query)
        completed_assignments = [a for a in all_assignments if a.status == "COMPLETED"]

        aggregated_metrics = build_aggregate_metrics(completed_assignments)
        employee_breakdown = build_employee_breakdown(all_assignments)
        trend_highlights = build_trends(completed_assignments)
        metric_timeseries = build_metric_timeseries(completed_assignments)

        overview_data = {
            "total_employees": len(employee_ids),
            "completion_rate": 0,
            "metric_timeseries": metric_timeseries,
        }
        if all_assignments:
            overview_data["completion_rate"] = round(
                (len(completed_assignments) / len(all_assignments)) * 100,
                1,
            )

        ai_summary = generate_department_ai_summary(
            department_name=department,
            metrics=aggregated_metrics,
            employee_count=len(employee_ids),
        )
        alerts = generate_dynamic_alerts(aggregated_metrics, employee_breakdown)

        try:
            report = DepartmentReport.objects.create(
                company_id=company_id,
                department=department,
                date_from=date_from,
                date_to=date_to,
                status_filter=status_filter,
                created_by=request.user,
                overview_data=overview_data,
                aggregated_metrics=aggregated_metrics,
                trends=trend_highlights,
                alerts=alerts,
                ai_summary=ai_summary,
                employee_breakdown=employee_breakdown,
            )
            out_serializer = DepartmentReportSerializer(report)
            return Response(out_serializer.data, status=status.HTTP_201_CREATED)
        except ProgrammingError:
            return Response(
                {"error": "Department report storage is not initialized. Run database migrations."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

    def get(self, request):
        company_id = getattr(request.user, "company_id", None)
        if not company_id:
            return Response(
                {"error": "User does not belong to a company"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reports = (
                DepartmentReport.objects.filter(company_id=company_id)
                .defer(
                    "overview_data",
                    "aggregated_metrics",
                    "trends",
                    "alerts",
                    "ai_summary",
                    "employee_breakdown",
                )
                .order_by("-created_at")
            )

            department_filter = request.query_params.get("department")
            if department_filter:
                reports = reports.filter(department__iexact=department_filter)

            # paginate reports using the same FixedPageSizePagination as talent-matching
            paginator = FixedPageSizePagination()
            page = paginator.paginate_queryset(reports, request)
            serializer = DepartmentReportListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except ProgrammingError:
            return Response(
                {"error": "Department report storage is not initialized. Run database migrations."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )


class DepartmentReportDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        company_id = getattr(request.user, "company_id", None)
        if not company_id:
            return Response(
                {"error": "User does not belong to a company"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            report = DepartmentReport.objects.get(pk=pk, company_id=company_id)
            serializer = DepartmentReportSerializer(report)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DepartmentReport.DoesNotExist:
            return Response({"error": "Report not found"}, status=status.HTTP_404_NOT_FOUND)
        except ProgrammingError:
            return Response(
                {"error": "Department report storage is not initialized. Run database migrations."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
