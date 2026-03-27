# assessments/urls.py
from django.urls import path
from django.http import JsonResponse
from .views import (
    AssignAssessmentView, 
    GenerateHRReportView, 
    MyAssignmentsView, 
    AssignmentDetailView, 
    SubmitAnswersView,
    UploadReportPDFView,
    AdminAssignmentsListView,
    GenerateBigFiveReportView,
    GenerateKarasekReportView,
    GenerateMaslachReportView,
    GenerateDiscReportView,
    GenerateJssReportView,
    GenerateBRSReportView,
    GenerateCDRISC10ReportView,
    GenerateWSESReportView,
    GenerateGCOSReportView,
    GenerateRIBSReportView,
    GenerateCAQReportView,
    GenerateISEReportView,
    AICandidateMatchView,
    AssignCandidateAssessmentView, 
    CandidateAssignmentDetailView,
    CandidateAssignmentByTokenView,
    CandidateAssignmentsListView,
)

# Simple debug view for testing tokens
def test_candidate_view(request, token):
    return JsonResponse({
        "message": "Token received!",
        "token": str(token),
        "type": type(token).__name__
    })

urlpatterns = [
    # ---------------------------------------------------------
    # 1. CORE ASSESSMENT ACTIONS (Employees & Hybrid)
    # ---------------------------------------------------------
    path("assessments/assign/", AssignAssessmentView.as_view(), name="assessments-assign"),
    path("assessments/my/", MyAssignmentsView.as_view(), name="assessments-my"),
    path("assessments/<int:pk>/", AssignmentDetailView.as_view(), name="assessments-detail"),
    
    # ✅ This URL now handles BOTH Employees and Candidates
    path("assessments/<int:pk>/submit/", SubmitAnswersView.as_view(), name="assessments-submit"),
    
    path("assessments/<int:pk>/upload-pdf/", UploadReportPDFView.as_view(), name="assessments-upload-pdf"),

    # ---------------------------------------------------------
    # 2. CANDIDATE SPECIFIC ROUTES
    # ---------------------------------------------------------
    path("assessments/assign-candidate/", AssignCandidateAssessmentView.as_view(), name="assign-candidate"),
    path("assessments/candidate/test/<uuid:token>/", test_candidate_view, name="test-candidate"),
    
    # URL to load assessment via UUID Token
    path("assessments/candidate/<uuid:token>/", CandidateAssignmentDetailView.as_view(), name="candidate-assignment-detail"),

    # ---------------------------------------------------------
    # 3. REPORT GENERATION (AI)
    # ---------------------------------------------------------
    path("hr/report/", GenerateHRReportView.as_view()),
    path("assessments/<int:assignment_id>/generate-report/", GenerateBigFiveReportView.as_view(), name="generate-report"),
    path("disc/report/<int:assignment_id>/", GenerateDiscReportView.as_view(), name="disc-report"),
    
    # Other Specific Reports
    path("karasek/report/<int:assignment_id>/", GenerateKarasekReportView.as_view(), name="karasek-report"),
    path("maslach/report/<int:assignment_id>/", GenerateMaslachReportView.as_view(), name="maslach-report"),
    path("jss/report/<int:assignment_id>/", GenerateJssReportView.as_view(), name="jss-report"),
    path("brs/report/<int:assignment_id>/", GenerateBRSReportView.as_view(), name="brs-report"),
    path("cdrisc/report/<int:assignment_id>/", GenerateCDRISC10ReportView.as_view(), name="cdrisc-report"),
    path("wses/report/<int:assignment_id>/", GenerateWSESReportView.as_view(), name="wses-report"),
    path("gcos/report/<int:assignment_id>/", GenerateGCOSReportView.as_view(), name="gcos-report"),
    path("ribs/report/<int:assignment_id>/", GenerateRIBSReportView.as_view(), name="ribs-report"),
    path("caq/report/<int:assignment_id>/", GenerateCAQReportView.as_view(), name="caq-report"),
    path("ise/report/<int:assignment_id>/", GenerateISEReportView.as_view(), name="ise-report"),

    # ---------------------------------------------------------
    # 4. ADMIN & RECRUITMENT TOOLS
    # ---------------------------------------------------------
    path("assessments/admin/", AdminAssignmentsListView.as_view(), name="assessments-admin"),
    path("recruitment/match/", AICandidateMatchView.as_view(), name="ai-candidate-match"),

    path("candidate-assignments/<uuid:token>/", CandidateAssignmentByTokenView.as_view(), name="candidate-assignment-by-token"),
    path("candidates/<uuid:candidate_id>/assignments/", CandidateAssignmentsListView.as_view(), name="candidate-assignments-list"),
]
