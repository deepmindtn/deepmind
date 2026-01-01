# assessments/urls.py
from django.urls import path
from .views import AssignAssessmentView, GenerateHRReportView, MyAssignmentsView, AssignmentDetailView, SubmitAnswersView,UploadReportPDFView,AdminAssignmentsListView,GenerateBigFiveReportView,GenerateKarasekReportView,GenerateMaslachReportView,GenerateDiscReportView,GenerateJssReportView,GenerateBRSReportView,GenerateCDRISC10ReportView,GenerateWSESReportView,GenerateGCOSReportView,GenerateRIBSReportView,GenerateCAQReportView,GenerateISEReportView,AICandidateMatchView

urlpatterns = [
    path("assessments/assign/", AssignAssessmentView.as_view(), name="assessments-assign"),
    path("assessments/my/", MyAssignmentsView.as_view(), name="assessments-my"),
    path("assessments/<int:pk>/", AssignmentDetailView.as_view(), name="assessments-detail"),
    path("assessments/<int:pk>/submit/", SubmitAnswersView.as_view(), name="assessments-submit"),
    path("assessments/<int:pk>/upload-pdf/", UploadReportPDFView.as_view(), name="assessments-upload-pdf"),
    path("assessments/admin/", AdminAssignmentsListView.as_view(), name="assessments-admin"),
    path("assessments/admin/", AdminAssignmentsListView.as_view(), name="assessments-admin"),
    path("hr/report/", GenerateHRReportView.as_view()),
    path("assessments/<int:assignment_id>/generate-report/", GenerateBigFiveReportView.as_view(), name="generate-report"),
    path("karasek/report/<int:assignment_id>/", GenerateKarasekReportView.as_view(), name="karasek-report"),
    path("maslach/report/<int:assignment_id>/", GenerateMaslachReportView.as_view(), name="maslach-report"),
    path("disc/report/<int:assignment_id>/", GenerateDiscReportView.as_view(), name="disc-report"),
    path("jss/report/<int:assignment_id>/", GenerateJssReportView.as_view(), name="jss-report"),
    path("brs/report/<int:assignment_id>/", GenerateBRSReportView.as_view(), name="brs-report"),
    path("cdrisc/report/<int:assignment_id>/", GenerateCDRISC10ReportView.as_view(), name="cdrisc-report"),
    path("wses/report/<int:assignment_id>/", GenerateWSESReportView.as_view(), name="wses-report"),
    path("gcos/report/<int:assignment_id>/", GenerateGCOSReportView.as_view(), name="gcos-report"),
    path("ribs/report/<int:assignment_id>/", GenerateRIBSReportView.as_view(), name="ribs-report"),
    path("caq/report/<int:assignment_id>/", GenerateCAQReportView.as_view(), name="caq-report"),
    path("ise/report/<int:assignment_id>/", GenerateISEReportView.as_view(), name="ise-report"),
    path("recruitment/match/", AICandidateMatchView.as_view(), name="ai-candidate-match"),



]
