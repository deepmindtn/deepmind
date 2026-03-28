from django.urls import path

from .views import (
    CandidateCVDeleteView,
    CandidateCVListView,
    CandidateCVSetActiveView,
    CandidateCVUploadView,
    CandidateJobApplicationListCreateView,
    JobPostingCloseView,
    JobPostingDetailView,
    JobPostingListCreateView,
    RankedPipelineView,
    TalentMatchView,
)

urlpatterns = [
    path("talent-matching/jobs/", JobPostingListCreateView.as_view(), name="tm-job-list-create"),
    path("talent-matching/jobs/<int:pk>/", JobPostingDetailView.as_view(), name="tm-job-detail"),
    path("talent-matching/jobs/<int:pk>/close/", JobPostingCloseView.as_view(), name="tm-job-close"),
    path("talent-matching/cvs/upload/", CandidateCVUploadView.as_view(), name="tm-cv-upload"),
    path("talent-matching/candidates/<uuid:candidate_id>/cvs/", CandidateCVListView.as_view(), name="tm-cv-list"),
    path("talent-matching/cvs/<int:pk>/set-active/", CandidateCVSetActiveView.as_view(), name="tm-cv-set-active"),
    path("talent-matching/cvs/<int:pk>/", CandidateCVDeleteView.as_view(), name="tm-cv-delete"),
    path("talent-matching/applications/", CandidateJobApplicationListCreateView.as_view(), name="tm-app-list-create"),
    path("talent-matching/match/", TalentMatchView.as_view(), name="tm-match"),
    path("talent-matching/jobs/<int:job_id>/pipeline/", RankedPipelineView.as_view(), name="tm-ranked-pipeline"),
]
