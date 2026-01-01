# assessments/permissions.py
from rest_framework.permissions import BasePermission
from django.contrib.auth import get_user_model

User = get_user_model()

class IsHR(BasePermission):
    """
    Allow only HR users.
    """
    def has_permission(self, request, view):
        # If your User model has User.Roles.HR
        if hasattr(User, "Roles"):
            return getattr(request.user, "role", None) == getattr(User.Roles, "HR", None)
        # Fallback: superusers are treated as HR
        return bool(request.user and request.user.is_staff)
