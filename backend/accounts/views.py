from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Recruitee  # ✅ add this import
from .serializers import (
    SignupSerializer,
    InviteCreateSerializer,
    AcceptInviteSerializer,
    UserMeSerializer,
    RecruiteeSerializer,
    UserListSerializer,
)

User = get_user_model()


# --------------------------
# HR Signup
# --------------------------
class SignupView(generics.CreateAPIView):
    """
    Public endpoint: HR self-signup (your current form).
    """
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]


# --------------------------
# Invite Employee
# --------------------------
class InviteCreateView(generics.CreateAPIView):
    """
    HR-only: create an invite for an Employee.
    """
    serializer_class = InviteCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


# --------------------------
# Accept Invite
# --------------------------
class AcceptInviteView(generics.CreateAPIView):
    """
    Public: employee completes account with token + password.
    """
    serializer_class = AcceptInviteSerializer
    permission_classes = [permissions.AllowAny]


# --------------------------
# Current User (Me)
# --------------------------
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # GET → retrieve profile
    def get(self, request):
        return Response(UserMeSerializer(request.user).data)

    # PATCH → update partial profile
    def patch(self, request):
        serializer = UserMeSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --------------------------
# HR Permission Helper
# --------------------------
class IsHR(permissions.BasePermission):
    """
    Custom permission: restrict view to HR users only.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", "") == User.Roles.HR


# --------------------------
# Recruitee Management
# --------------------------
class RecruiteeListCreateView(generics.ListCreateAPIView):
    """
    List all recruitees or create a new one.
    Only HRs can create or view recruitees within their company.
    """
    serializer_class = RecruiteeSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        user = self.request.user
        return Recruitee.objects.filter(company=user.company).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, company=self.request.user.company)


# --------------------------
# Employees List (for HR dashboard)
# --------------------------
class UsersListView(generics.ListAPIView):
    """
    HR-only: view list of all employees in their company.
    """
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return User.objects.filter(company=self.request.user.company).order_by("-date_joined")
