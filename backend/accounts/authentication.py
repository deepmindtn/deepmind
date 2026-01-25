from rest_framework import authentication
from rest_framework import exceptions
# ❌ DELETE THIS LINE: from .models import CandidateAssignment 

class CandidateTokenAuthentication(authentication.BaseAuthentication):
    """
    Authenticate candidate using X-Candidate-Token header.
    """
    def authenticate(self, request):
        token = request.headers.get("X-Candidate-Token")
        if not token:
            return None  # let other authentication methods try

        # ✅ FIX 1: Import inside the method to prevent Circular Import Crash
        # ✅ FIX 2: Import from 'assessments.models', not '.models'
        from assessments.models import CandidateAssignment

        try:
            # Check if valid UUID to prevent database crashes on bad strings
            assignment = CandidateAssignment.objects.get(token=token)
        except (CandidateAssignment.DoesNotExist, ValueError):
            raise exceptions.AuthenticationFailed("Invalid or malformed candidate token")

        # Return a tuple of (user, auth)
        # Note: We return the recruitee as the 'user'
        return (assignment.recruitee, None)