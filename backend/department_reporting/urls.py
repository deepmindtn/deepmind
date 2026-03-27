from django.urls import path

from .views import DepartmentReportDetailView, DepartmentReportView


urlpatterns = [
    path("hr/department-reports/", DepartmentReportView.as_view(), name="department-reports"),
    path(
        "hr/department-reports/<int:pk>/",
        DepartmentReportDetailView.as_view(),
        name="department-reports-detail",
    ),
]
