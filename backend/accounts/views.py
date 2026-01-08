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

import csv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status, permissions
from .serializers import InviteCreateSerializer 

class ImportEmployeesView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Read CSV
        try:
            decoded_file = file_obj.read().decode('utf-8-sig').splitlines()
            reader = csv.DictReader(decoded_file)
            reader.fieldnames = [h.strip() for h in reader.fieldnames] # Clean headers
        except Exception as e:
            return Response({"error": f"CSV Read Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        dept_map = {
            "Sales": "sales",
            "HR": "hr",
            "Finance": "finance",
            "Operations": "operations",
            "Design": "design",
            "Product": "product",
            "Other": "other"
        }

        added_count = 0
        errors = []

        for row in reader:
            email = row.get('Email Address', '').strip()
            first_name = row.get('First Name', '').strip()
            last_name = row.get('Last Name', '').strip()
            raw_dept = row.get('Department', '').strip()

            if not email:
                continue

            department_key = dept_map.get(raw_dept)
            
            if not department_key:
                department_key = raw_dept.lower() 

            invite_data = {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "department": department_key, # Use the mapped key
            }

            serializer = InviteCreateSerializer(data=invite_data, context={'request': request})

            if serializer.is_valid():
                try:
                    serializer.save()
                    added_count += 1
                except Exception as e:
                    errors.append(f"DB Error {email}: {str(e)}")
            else:
                # Log the specific error for debugging
                err_msg = str(serializer.errors)
                errors.append(f"Skipped {email}: {err_msg}")

        return Response({
            "message": f"Successfully created {added_count} invites.",
            "errors": errors
        }, status=status.HTTP_201_CREATED)