from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import SignupView, InviteCreateView, AcceptInviteView, MeView, UsersListView,  RecruiteeListCreateView,ImportEmployeesView

urlpatterns = [
    # Auth & profile
    path("auth/signup/", SignupView.as_view(), name="signup"),  # HR self-signup
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),

    # Invitations (HR creates, Employee accepts)
    path("invites/", InviteCreateView.as_view(), name="invite-create"),
    path('employees/import/', ImportEmployeesView.as_view(), name='import-employees'),
    path("invites/accept/", AcceptInviteView.as_view(), name="invite-accept"),
     path("users/", UsersListView.as_view(), name="users-list"),

    path("recruitment/candidates/", RecruiteeListCreateView.as_view(), name="recruitee-list-create"),

]
