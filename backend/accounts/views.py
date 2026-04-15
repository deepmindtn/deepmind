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
from django.db.models import Q, Count
from django.db import transaction

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
    EmailTemplate,
    EisenhowerTask,
    DailyChallenge
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
    SurveyRetrieveSerializer,
    EisenhowerTaskSerializer,
    DailyChallengeSerializer
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
from django.template import Template, Context
from django.core.mail import EmailMultiAlternatives
from accounts.models import EmailTemplate
from core.email_template_utils import attach_inline_logo, render_email_subject_and_body

class InviteCreateView(generics.CreateAPIView):
    serializer_class = InviteCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invite = serializer.save()

        origin = request.META.get("HTTP_ORIGIN") or settings.FRONTEND_URL
        invite_link = f"{origin}/accept-invite?token={invite.id}"

        email_sent = False
        email_error_msg = None

        try:
            # 1️⃣ Load system email template
            template = EmailTemplate.objects.get(
                name="Welcome Email",
                audience_type="employee",
                status="active"
            )

            # 2️⃣ Prepare context
            context = {
                "firstName": invite.first_name,
                "companyName": invite.company.name if invite.company else "Deep Mind",
                "inviteLink": invite_link,
            }

            # 3️⃣ Render subject & body
            subject, html_body = render_email_subject_and_body(template, context)

            # 4️⃣ Send HTML email
            email = EmailMultiAlternatives(
                subject=subject,
                body="Please view this email in HTML format.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[invite.email],
            )
            email.attach_alternative(html_body, "text/html")
            attach_inline_logo(email)
            email.send()

            email_sent = True
            print(f"✅ Invite email sent to {invite.email}")

        except EmailTemplate.DoesNotExist:
            email_error_msg = "Welcome Email template not found."
            print("❌ Email template missing")

        except Exception as e:
            email_error_msg = str(e)
            print(f"❌ Email failed: {e}")

        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data["email_sent"] = email_sent
        response_data["invite_link"] = invite_link

        if not email_sent:
            response_data["email_error"] = email_error_msg

        return APIResponse(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

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
from django.template import Template, Context
from django.core.mail import EmailMultiAlternatives
from accounts.models import EmailTemplate

class ImportEmployeesView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return APIResponse(
                {"error": "No file provided"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # Read CSV
        # -------------------------
        try:
            decoded_file = file_obj.read().decode("utf-8-sig").splitlines()
            reader = csv.DictReader(decoded_file)
            reader.fieldnames = [h.strip() for h in reader.fieldnames]
        except Exception as e:
            return APIResponse(
                {"error": f"CSV Read Error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------
        # Department mapping
        # -------------------------
        dept_map = {
            "Sales": "sales",
            "HR": "hr",
            "Finance": "finance",
            "Operations": "operations",
            "Design": "design",
            "Product": "product",
            "Other": "other",
        }

        origin = request.META.get("HTTP_ORIGIN") or settings.FRONTEND_URL
        base_url = f"{origin}/accept-invite"

        added_count = 0
        errors = []

        # -------------------------
        # Load email template ONCE
        # -------------------------
        try:
            email_template = EmailTemplate.objects.get(
                name="Welcome Email",
                audience_type="employee",
                status="active",
            )
        except EmailTemplate.DoesNotExist:
            return APIResponse(
                {"error": "Welcome Email template not found or inactive."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # -------------------------
        # Process CSV rows
        # -------------------------
        for row in reader:
            email = row.get("Email Address", "").strip()
            first_name = row.get("First Name", "").strip()
            last_name = row.get("Last Name", "").strip()
            raw_dept = row.get("Department", "").strip()

            if not email:
                continue

            if User.objects.filter(email=email).exists():
                errors.append(f"Skipped {email}: User already registered.")
                continue

            if Invite.objects.filter(email=email).exists():
                errors.append(f"Skipped {email}: Invite already sent/pending.")
                continue

            department_key = dept_map.get(raw_dept) or raw_dept.lower()

            invite_data = {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "department": department_key,
            }

            serializer = InviteCreateSerializer(
                data=invite_data,
                context={"request": request},
            )

            if not serializer.is_valid():
                err_msg = "; ".join(
                    [f"{k}: {v[0]}" for k, v in serializer.errors.items()]
                )
                errors.append(f"Skipped {email}: {err_msg}")
                continue

            # -------------------------
            # Create invite
            # -------------------------
            try:
                invite = serializer.save()
                added_count += 1

                token = str(invite.id)
                invite_link = f"{base_url}?token={token}"

                # -------------------------
                # Render email
                # -------------------------
                context = {
                    "firstName": first_name,
                    "companyName": invite.company.name
                    if invite.company
                    else "Deep Mind",
                    "inviteLink": invite_link,
                }

                subject, html_body = render_email_subject_and_body(email_template, context)

                # -------------------------
                # Send email
                # -------------------------
                try:
                    email_msg = EmailMultiAlternatives(
                        subject=subject,
                        body="Please view this email in HTML format.",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[email],
                    )
                    email_msg.attach_alternative(html_body, "text/html")
                    attach_inline_logo(email_msg)
                    email_msg.send()

                    print(f"✅ Invite email sent to {email}")

                except Exception as email_error:
                    print(f"❌ Email failed for {email}: {email_error}")
                    errors.append(
                        f"Created {email} but failed to send email."
                    )

            except Exception as e:
                errors.append(f"DB Error {email}: {str(e)}")

        return APIResponse(
            {
                "message": f"Successfully created {added_count} invites.",
                "errors": errors,
            },
            status=status.HTTP_201_CREATED,
        )

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
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        return (
            Survey.objects.filter(company=self.request.user.company)
            .annotate(assignments_count=Count('assignments'))
            .order_by('-created_at')
        )

class SurveyDetailView(RetrieveAPIView):
    serializer_class = SurveyRetrieveSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]
    queryset = Survey.objects.all()

    def get_queryset(self):
        return Survey.objects.filter(company=self.request.user.company).prefetch_related(
            'questions',
            'assignments__responses__question',
            'assignments__user',
        )

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
        ).select_related('survey').order_by('-assigned_at')

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
            with transaction.atomic():
                assignment = Assignment.objects.select_for_update().select_related('survey').get(
                    id=pk,
                    user=request.user,
                )

                if assignment.status == Assignment.Status.COMPLETED:
                    return APIResponse({"error": "You have already completed this survey."}, status=400)

                answers_data = request.data.get('answers', [])
                if not isinstance(answers_data, list) or not answers_data:
                    return APIResponse({"error": "No answers provided."}, status=400)

                survey_questions = list(assignment.survey.questions.all().order_by('order'))
                if not survey_questions:
                    return APIResponse({"error": "This survey has no questions configured."}, status=400)

                valid_question_ids = {q.id for q in survey_questions}
                normalized_answers = {}
                invalid_question_ids = set()

                for item in answers_data:
                    if not isinstance(item, dict):
                        return APIResponse({"error": "Invalid answers payload."}, status=400)

                    q_id = item.get('question_id')
                    try:
                        q_id = int(q_id)
                    except (TypeError, ValueError):
                        invalid_question_ids.add(q_id)
                        continue

                    answer_text = (item.get('text') or '').strip()
                    if not answer_text:
                        return APIResponse({"error": f"Answer text is required for question {q_id}."}, status=400)

                    if q_id not in valid_question_ids:
                        invalid_question_ids.add(q_id)
                        continue

                    normalized_answers[q_id] = answer_text

                if invalid_question_ids:
                    return APIResponse(
                        {
                            "error": "One or more questions are invalid for this survey.",
                            "invalid_question_ids": sorted([str(i) for i in invalid_question_ids]),
                        },
                        status=400,
                    )

                missing_question_ids = sorted(valid_question_ids - set(normalized_answers.keys()))
                if missing_question_ids:
                    return APIResponse(
                        {
                            "error": "All survey questions must be answered before submission.",
                            "missing_question_ids": missing_question_ids,
                        },
                        status=400,
                    )

                for question_id, answer_text in normalized_answers.items():
                    Response.objects.update_or_create(
                        assignment=assignment,
                        question_id=question_id,
                        defaults={'answer_text': answer_text},
                    )

                assignment.status = Assignment.Status.COMPLETED
                assignment.completed_at = timezone.now()
                assignment.save(update_fields=['status', 'completed_at'])

                return APIResponse({"message": "Survey submitted successfully!"}, status=200)

        except Assignment.DoesNotExist:
            return APIResponse({"error": "Survey not found."}, status=404)
        
from rest_framework import viewsets, permissions
from .models import EmailTemplate
from .serializers import EmailTemplateSerializer

class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]  

class EisenhowerTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = EisenhowerTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return tasks belonging to the logged-in user
        return EisenhowerTask.objects.filter(user=self.request.user).order_by('created_at')

    def perform_create(self, serializer):
        # Automatically link the new task to the user
        serializer.save(user=self.request.user)

class EisenhowerTaskDetailView(generics.DestroyAPIView):
    """ Allows deleting a specific task """
    serializer_class = EisenhowerTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EisenhowerTask.objects.filter(user=self.request.user)

# --------------------------
# Daily Challenges Views
# --------------------------
class DailyChallengeListCreateView(generics.ListCreateAPIView):
    serializer_class = DailyChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DailyChallenge.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DailyChallengeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ Allows deleting or toggling completion status """
    serializer_class = DailyChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DailyChallenge.objects.filter(user=self.request.user)
    
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import PermissionDenied

from .models import Company
from .serializers import CompanySerializer

class CompanyMeView(RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        user = self.request.user
        
        if not user.company:
            raise PermissionDenied("User is not linked to any company.")
        
        return user.company