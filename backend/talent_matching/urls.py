from django.urls import path

from .views import (
    CandidateApplicationAttachView,
    CandidateApplicationDetachView,
    CandidateCVDeleteView,
    CandidateCVListView,
    CandidateMatchHistoryView,
    CandidateCVSetActiveView,
    CandidateCVUploadView,
    CandidateJobApplicationListCreateView,
    CVJobMatchDetailView,
    JobPostingCloseView,
    JobPostingDetailView,
    JobPostingListCreateView,
    RankedPipelineView,
    GlobalRankedPipelineView,
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
    path("talent-matching/applications/attach/", CandidateApplicationAttachView.as_view(), name="tm-app-attach"),
    path("talent-matching/applications/<int:pk>/detach/", CandidateApplicationDetachView.as_view(), name="tm-app-detach"),
    path("talent-matching/match/", TalentMatchView.as_view(), name="tm-match"),
    path("talent-matching/matches/<int:pk>/", CVJobMatchDetailView.as_view(), name="tm-match-detail"),
    path(
        "talent-matching/jobs/<int:job_id>/candidates/<uuid:candidate_id>/match-history/",
        CandidateMatchHistoryView.as_view(),
        name="tm-match-history",
    ),
    path("talent-matching/jobs/<int:job_id>/pipeline/", RankedPipelineView.as_view(), name="tm-ranked-pipeline"),
    path("talent-matching/pipeline/", GlobalRankedPipelineView.as_view(), name="tm-global-pipeline"),
]
