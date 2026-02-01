import csv
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse
from rest_framework.generics import ListCreateAPIView, RetrieveAPIView 
from django.utils import timezone 
from django.db.models import Q

# ✅ RENAMED IMPORT TO AVOID CONFLICT
from rest_framework.response import Response as APIResponse 

# Models
from .models import (
    Recruitee, 
    Invite, 
    Department, 
    Survey, 
    Response, 
    Question, 
    Assignment, 
    EmailTemplate 
)
from .serializers import (
    SignupSerializer,
    InviteCreateSerializer,
    AcceptInviteSerializer,
    UserMeSerializer,
    RecruiteeSerializer,
    UserListSerializer,
    DepartmentSerializer,
    SurveyCreateSerializer,
    EmployeeAssignmentListSerializer,
    EmployeeSurveyTakeSerializer,
    SurveyRetrieveSerializer
)

User = get_user_model()

# --------------------------
# Permissions
# --------------------------
class IsHR(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, "role", "") == User.Roles.HR

# --------------------------
# HR Signup
# --------------------------
class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer
    permission_classes = [permissions.AllowAny]

# --------------------------
# Recruitee Management
# --------------------------
class RecruiteeListCreateView(generics.ListCreateAPIView):
    serializer_class = RecruiteeSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return Recruitee.objects.filter(company=self.request.user.company).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, company=self.request.user.company)

class RecruiteeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecruiteeSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return Recruitee.objects.filter(company=self.request.user.company)

# --------------------------
# Invite Employee
# --------------------------
class InviteCreateView(generics.CreateAPIView):
    serializer_class = InviteCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invite = serializer.save()

        origin = request.META.get('HTTP_ORIGIN') or "http://localhost:5173"
        invite_link = f"{origin}/accept-invite?token={invite.id}" 
        
        email_sent = False
        email_error_msg = None

        try:
            print(f"Sending single invite to {invite.email}...")
            send_mail(
                subject="You're invited to join DeepMind HR!",
                message=f"Hi {invite.first_name},\n\nYou have been invited to join. Click here:\n\n{invite_link}\n\nBest regards,",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[invite.email],
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            print(f"Email failed: {e}")
            email_error_msg = str(e)

        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['email_sent'] = email_sent
        response_data['invite_link'] = invite_link
        
        if not email_sent:
            response_data['email_error'] = email_error_msg

        return APIResponse(response_data, status=status.HTTP_201_CREATED, headers=headers)

# --------------------------
# Accept Invite
# --------------------------
class AcceptInviteView(generics.CreateAPIView):
    serializer_class = AcceptInviteSerializer
    permission_classes = [permissions.AllowAny]

# --------------------------
# Current User (Me)
# --------------------------
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return APIResponse(UserMeSerializer(request.user).data)

    def patch(self, request):
        serializer = UserMeSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return APIResponse(serializer.data)
        return APIResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --------------------------
# Employees List
# --------------------------
class UsersListView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return User.objects.filter(company=self.request.user.company).order_by("-date_joined")

# --------------------------
# CSV Import View
# --------------------------
class ImportEmployeesView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return APIResponse({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = file_obj.read().decode('utf-8-sig').splitlines()
            reader = csv.DictReader(decoded_file)
            reader.fieldnames = [h.strip() for h in reader.fieldnames] 
        except Exception as e:
            return APIResponse({"error": f"CSV Read Error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        dept_map = {
            "Sales": "sales", "HR": "hr", "Finance": "finance",
            "Operations": "operations", "Design": "design",
            "Product": "product", "Other": "other"
        }

        origin = request.META.get('HTTP_ORIGIN') or "http://localhost:5173"
        base_url = f"{origin}/accept-invite"

        added_count = 0
        errors = []

        for row in reader:
            email = row.get('Email Address', '').strip()
            first_name = row.get('First Name', '').strip()
            last_name = row.get('Last Name', '').strip()
            raw_dept = row.get('Department', '').strip()

            if not email: continue

            if User.objects.filter(email=email).exists():
                errors.append(f"Skipped {email}: User already registered.")
                continue

            if Invite.objects.filter(email=email).exists():
                errors.append(f"Skipped {email}: Invite already sent/pending.")
                continue
            
            department_key = dept_map.get(raw_dept)
            if not department_key: department_key = raw_dept.lower() 

            invite_data = {
                "email": email, "first_name": first_name,
                "last_name": last_name, "department": department_key,
            }

            serializer = InviteCreateSerializer(data=invite_data, context={'request': request})

            if serializer.is_valid():
                try:
                    invite_instance = serializer.save()
                    added_count += 1
                    
                    token = str(invite_instance.id) 
                    invite_link = f"{base_url}?token={token}"
                    
                    try:
                        print(f"Sending invite to {email}")
                        send_mail(
                            subject="You're invited to join DeepMind HR!",
                            message=f"Hi {first_name},\n\nYou have been invited to join. Link: {invite_link}",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[email],
                            fail_silently=False,
                        )
                    except Exception as email_error:
                        print(f"Email failed: {email_error}")
                        errors.append(f"Created {email} but failed to send email. Check SMTP settings.")

                except Exception as e:
                    errors.append(f"DB Error {email}: {str(e)}")
            else:
                err_msg = "; ".join([f"{k}: {v[0]}" for k, v in serializer.errors.items()])
                errors.append(f"Skipped {email}: {err_msg}")

        return APIResponse({
            "message": f"Successfully created {added_count} invites.",
            "errors": errors
        }, status=status.HTTP_201_CREATED)

# --------------------------
# Department Views
# --------------------------
class DepartmentListCreateView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return Department.objects.filter(company=self.request.user.company).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return Department.objects.filter(company=self.request.user.company)

# --------------------------
# Export Departments
# --------------------------
class ExportDepartmentsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="departments.csv"'

        writer = csv.writer(response)
        writer.writerow(['ID', 'Name', 'Description', 'Icon', 'Created At'])

        departments = Department.objects.filter(company=request.user.company).order_by('-created_at')
        for dept in departments:
            writer.writerow([
                dept.id, 
                dept.name, 
                dept.description or "", 
                dept.icon, 
                dept.created_at.strftime("%Y-%m-%d %H:%M:%S")
            ])

        return response

# --------------------------
# Survey Views
# --------------------------
class CreateSurveyView(ListCreateAPIView):
    serializer_class = SurveyCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Survey.objects.filter(company=self.request.user.company).order_by('-created_at')

class SurveyDetailView(RetrieveAPIView):
    serializer_class = SurveyRetrieveSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Survey.objects.all()

    def get_queryset(self):
        return Survey.objects.filter(company=self.request.user.company)

# ==========================================
# Employee Survey Views
# ==========================================

class EmployeeMySurveysView(generics.ListAPIView):
    serializer_class = EmployeeAssignmentListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        now = timezone.now()
        
        # ✅ Filter Logic:
        # 1. Assignment belongs to user
        # 2. AND (Survey is not scheduled OR Schedule time has passed)
        return Assignment.objects.filter(
            user=self.request.user
        ).filter(
            Q(survey__scheduled_for__isnull=True) | 
            Q(survey__scheduled_for__lte=now)
        ).order_by('-assigned_at')

class EmployeeTakeSurveyView(APIView):
    """ GET questions & POST answers """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            assignment = Assignment.objects.get(id=pk, user=request.user)
            serializer = EmployeeSurveyTakeSerializer(assignment)
            return APIResponse(serializer.data) # ✅ Used APIResponse
        except Assignment.DoesNotExist:
            return APIResponse({"error": "Survey not found or access denied."}, status=404)

    def post(self, request, pk):
        try:
            assignment = Assignment.objects.get(id=pk, user=request.user)
            
            if assignment.status == Assignment.Status.COMPLETED:
                return APIResponse({"error": "You have already completed this survey."}, status=400)

            answers_data = request.data.get('answers', [])
            
            if not answers_data:
                return APIResponse({"error": "No answers provided."}, status=400)

            # Save Responses
            for item in answers_data:
                q_id = item.get('question_id')
                text = item.get('text')
                
                try:
                    question = Question.objects.get(id=q_id, survey=assignment.survey)
                    # ✅ This now uses the correctly imported Response model
                    Response.objects.create(
                        assignment=assignment,
                        question=question,
                        answer_text=text
                    )
                except Question.DoesNotExist:
                    continue 

            # Mark Assignment as Completed
            assignment.status = Assignment.Status.COMPLETED
            assignment.completed_at = timezone.now() # ✅ Now timezone is defined
            assignment.save()

            return APIResponse({"message": "Survey submitted successfully!"}, status=200)

        except Assignment.DoesNotExist:
            return APIResponse({"error": "Survey not found."}, status=404)
        
from rest_framework import viewsets, permissions
from .models import EmailTemplate
from .serializers import EmailTemplateSerializer

class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]  # Adjust if needed