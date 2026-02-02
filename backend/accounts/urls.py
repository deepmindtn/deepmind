from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    SignupView, InviteCreateView, AcceptInviteView, MeView, UsersListView,
    RecruiteeListCreateView, RecruiteeDetailView, ImportEmployeesView,
    DepartmentListCreateView, DepartmentDetailView, ExportDepartmentsView,
    CreateSurveyView, SurveyDetailView, EmployeeMySurveysView, EmployeeTakeSurveyView,
    EmailTemplateViewSet ,EisenhowerTaskListCreateView, EisenhowerTaskDetailView
)

# --------------------------
# Router for ViewSets
# --------------------------
router = DefaultRouter()
router.register(r"email-templates", EmailTemplateViewSet, basename="email-template")

# --------------------------
# URL Patterns
# --------------------------
urlpatterns = [
    # Auth & profile
    path("auth/signup/", SignupView.as_view(), name="signup"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),

    # Departments
    path('departments/', DepartmentListCreateView.as_view(), name='dept-list-create'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='dept-detail'),
    path('departments/export/', ExportDepartmentsView.as_view(), name='dept-export'),

    # Invitations
    path("invites/", InviteCreateView.as_view(), name="invite-create"),
    path("invites/accept/", AcceptInviteView.as_view(), name="invite-accept"),
    path('employees/import/', ImportEmployeesView.as_view(), name='import-employees'),

    # Users
    path("users/", UsersListView.as_view(), name="users-list"),

    # Recruitment
    path("recruitment/candidates/", RecruiteeListCreateView.as_view(), name="recruitee-list-create"),
    path("recruitment/candidates/<int:pk>/", RecruiteeDetailView.as_view()),

    # Surveys
    path("surveys/create/", CreateSurveyView.as_view(), name="survey-create"),
    path("surveys/<int:pk>/", SurveyDetailView.as_view(), name="survey-detail"),

    # Employee Survey Routes
    path("employee/surveys/", EmployeeMySurveysView.as_view(), name="employee-surveys-list"),
    path("employee/surveys/<int:pk>/take/", EmployeeTakeSurveyView.as_view(), name="employee-survey-take"),

    # Eisenhower Matrix
    path('employee/matrix/', EisenhowerTaskListCreateView.as_view(), name='matrix-list-create'),
    path('employee/matrix/<int:pk>/', EisenhowerTaskDetailView.as_view(), name='matrix-delete'),

    # Include router URLs for Email Templates
    path("", include(router.urls)),
]
