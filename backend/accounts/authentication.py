from rest_framework import authentication
from rest_framework import exceptions
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class CandidateTokenAuthentication(authentication.BaseAuthentication):
    """
    Authenticate candidate using X-Candidate-Token header.
    Enforces a configurable expiry window (default 24 hours).
    """
    def authenticate(self, request):
        token = request.headers.get("X-Candidate-Token")
        if not token:
            return None  # let other authentication methods try

        # Import inside the method to prevent circular import
        from assessments.models import CandidateAssignment

        try:
            # Check if valid UUID to prevent database crashes on bad strings
            assignment = CandidateAssignment.objects.get(token=token)
        except (CandidateAssignment.DoesNotExist, ValueError):
            raise exceptions.AuthenticationFailed("Invalid or malformed candidate token")

        # Enforce expiry (hours) from settings or default to 24
        expiry_hours = getattr(settings, "CANDIDATE_TOKEN_EXPIRY_HOURS", 24)
        if assignment.assigned_at and timezone.now() > assignment.assigned_at + timedelta(hours=expiry_hours):
            raise exceptions.AuthenticationFailed("Candidate token expired")

        # Return a tuple of (user, auth)
        # Note: We return the recruitee as the 'user'
        return (assignment.recruitee, None)