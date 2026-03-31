import json

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from accounts.models import Recruitee
from .models import Assignment, AssessmentTemplate ,CandidateAssignment
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser
from django.utils import timezone
import logging
from rest_framework.exceptions import APIException
from datetime import timedelta
import uuid
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from .report_schemas import (
    BigFiveReport, DiscReport, KarasekReport, MaslachReport,
    JssReport, BrsReport, CdriscReport, WsesReport, GcosReport,
    RibsReport, CaqReport, IseReport,
)
from .score_formatters import (
    format_karasek_scores, format_maslach_scores, format_disc_scores,
    format_jss_scores, format_brs_scores, format_cdrisc_scores,
    format_wses_scores, format_gcos_scores, format_ribs_scores,
    format_caq_scores, format_ise_scores,
)

from .serializers import (
    AssignRequestSerializer,
    AssignmentListItemSerializer,
    AssignmentDetailSerializer,
    SubmitAnswersSerializer,
)


User = get_user_model()

from django.template import Template, Context
from django.core.mail import EmailMultiAlternatives
from accounts.models import EmailTemplate
from django.db import transaction


class TokenExpired(APIException):
    status_code = 410
    default_detail = 'Candidate token expired.'
    default_code = 'token_expired'


class AssignAssessmentView(generics.CreateAPIView):
    """
    HR: POST { "employee_email": "...", "template_codes": ["BIG_FIVE", "DISC"] }
    """
    serializer_class = AssignRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["employee_email"]
        codes = serializer.validated_data["template_codes"]

        # 1. Check employee
        try:
            employee = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": f"Employee with email {email} not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        origin = request.META.get("HTTP_ORIGIN") or settings.FRONTEND_URL

        assigned_count = 0
        errors = []
        email_errors = []

        # 2. Load email template ONCE
        try:
            email_template = EmailTemplate.objects.get(
                name="Assessment Assignment",
                audience_type="employee",
                status="active",
            )
        except EmailTemplate.DoesNotExist:
            return Response(
                {"detail": "Assessment Assignment email template not found or inactive."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # 3. Assignment loop
        for code in codes:
            try:
                template = AssessmentTemplate.objects.get(code=code)

                if Assignment.objects.filter(
                    employee=employee,
                    template=template,
                    status="PENDING",
                ).exists():
                    continue

                assignment = Assignment.objects.create(
                    employee=employee,
                    template=template,
                    status="PENDING",
                    assigned_by=request.user,
                )
                assigned_count += 1

                # 4. Send templated email
                try:
                    assessment_link = f"{origin}/assessments/{assignment.id}"

                    context = {
                        "firstName": employee.first_name or employee.email,
                        "assessmentTitle": template.name,
                        "assessmentLink": assessment_link,
                    }

                    subject = Template(email_template.subject).render(
                        Context(context)
                    )
                    html_body = Template(email_template.body).render(
                        Context(context)
                    )

                    email_msg = EmailMultiAlternatives(
                        subject=subject,
                        body="Please view this email in HTML format.",
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        to=[employee.email],
                    )
                    email_msg.attach_alternative(html_body, "text/html")
                    email_msg.send()

                    print(
                        f"✅ Assessment email sent to {employee.email} ({template.name})"
                    )

                except Exception as email_error:
                    email_errors.append(
                        f"Failed to send email for '{template.name}': {str(email_error)}"
                    )
                    print(
                        f"❌ Email error for {employee.email}: {str(email_error)}"
                    )

            except AssessmentTemplate.DoesNotExist:
                errors.append(f"Template code '{code}' not found in database.")
            except Exception as e:
                errors.append(f"Error assigning '{code}': {str(e)}")

        response_data = {
            "message": f"Successfully assigned {assigned_count} assessments.",
            "errors": errors if errors else None,
            "email_sent": len(email_errors) == 0,
        }

        if email_errors:
            response_data["email_errors"] = email_errors

        return Response(response_data, status=status.HTTP_201_CREATED)


class MyAssignmentsView(generics.ListAPIView):
    """
    Employee: GET list of their assignments
    """
    serializer_class = AssignmentListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Assignment.objects.filter(employee=self.request.user).order_by("-assigned_at")


class AssignmentDetailView(generics.RetrieveAPIView):
    """
    Employee: GET /api/assessments/<id>/
    """
    serializer_class = AssignmentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Assignment.objects.filter(employee=self.request.user)


""" class SubmitAnswersView(generics.GenericAPIView):
    
    
    Employee: POST /api/assessments/<id>/submit/  { "answers": {...} }
    
    serializer_class = SubmitAnswersSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        assignment = get_object_or_404(Assignment, pk=pk, employee=request.user)
        if assignment.status == Assignment.Status.COMPLETED:
            return Response({"detail": "Already submitted."}, status=status.HTTP_400_BAD_REQUEST)
        s = self.get_serializer(data=request.data, context={"assignment": assignment})
        s.is_valid(raise_exception=True)
        a = s.save()
        return Response(AssignmentDetailSerializer(a).data, status=status.HTTP_200_OK) """
# assessments/views.py
""" from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from .models import Assignment
from .serializers import SubmitAnswersSerializer, AssignmentDetailSerializer

class SubmitAnswersView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubmitAnswersSerializer

    def get_serializer_context(self):
        a = get_object_or_404(Assignment, pk=self.kwargs["pk"], employee=self.request.user)
        return {"assignment": a, **super().get_serializer_context()} """

class AssignmentDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AssignmentDetailSerializer
    queryset = Assignment.objects.all()

    def get_queryset(self):
        # employee sees only their own; HR can see all
        qs = super().get_queryset()
        user = self.request.user
        if getattr(user, "role", None) == getattr(user.__class__.Roles, "HR", "HR"):
            return qs
        return qs.filter(employee=user)

class UploadReportPDFView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]
    queryset = Assignment.objects.all()
    serializer_class = AssignmentDetailSerializer

    def get_object(self):
        obj = get_object_or_404(Assignment, pk=self.kwargs["pk"], employee=self.request.user)
        return obj

    def put(self, request, *args, **kwargs):
        obj = self.get_object()
        file = request.data.get("file")
        if not file:
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"detail":"file required"}, status=status.HTTP_400_BAD_REQUEST)
        obj.report_pdf = file
        obj.save(update_fields=["report_pdf"])
        return self.retrieve(request, *args, **kwargs)
# assessments/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, NotFound
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Assignment, AssessmentTemplate
from .serializers import (
    AssignRequestSerializer,
    AssignmentListItemSerializer,
    AssignmentDetailSerializer,
    SubmitAnswersSerializer,
    AssignmentAdminListSerializer,
)
from .permissions import IsHR

# ---------- Create assignment (HR) ----------
class AssignView(generics.CreateAPIView):
    serializer_class = AssignRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

# ---------- Employee: list my assignments ----------
class MyAssignmentsView(generics.ListAPIView):
    serializer_class = AssignmentListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Adjust the FK name if your Assignment uses another field for the user
        return Assignment.objects.filter(employee=self.request.user).select_related("template").order_by("-assigned_at")

# ---------- HR: org-wide list of all assignments (for dashboard) ----------
class AdminAssignmentsListView(generics.ListAPIView):
    """
    Returns ALL assignments in org (HR-only).
    Contains metrics & ai_report for dashboard aggregation.
    """
    serializer_class = AssignmentAdminListSerializer
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def get_queryset(self):
        qs = Assignment.objects.select_related("template", "employee").order_by("-assigned_at")

        # Optional filters
        status = self.request.query_params.get("status")
        template = self.request.query_params.get("template")  # e.g. BIG_FIVE / KARASEK / MASLACH
        employee_email = self.request.query_params.get("employee_email")

        if status:
            qs = qs.filter(status=status)
        if template:
            qs = qs.filter(template__code=template)
        if employee_email:
            qs = qs.filter(employee__email=employee_email)

        return qs


# ---------- Submit answers ----------
""" class SubmitAnswersView(generics.CreateAPIView):
    
    POST answers (and optional metrics/ai_report). Marks assignment as COMPLETED.
    Uses serializer validation to block double submit.
    
    serializer_class = SubmitAnswersSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        pk = self.kwargs.get("pk")
        assignment = get_object_or_404(Assignment, pk=pk)
        # Employee can submit only own; HR could POST on behalf if you want—here we restrict to employee
        if assignment.employee != self.request.user and not IsHR().has_permission(self.request, self):
            raise ValidationError("Not allowed to submit for this assignment.")
        ctx["assignment"] = assignment
        return ctx """

# ---------- (Optional) upload PDF if you post the generated PDF back ----------
class UploadPDFView(generics.UpdateAPIView):
    """
    PUT/PATCH a 'report_pdf' path/URL (if you render and upload somewhere).
    Payload: {"report_pdf": "https://.../file.pdf"}
    """
    serializer_class = AssignmentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = get_object_or_404(Assignment, pk=self.kwargs.get("pk"))
        if obj.employee != self.request.user and not IsHR().has_permission(self.request, self):
            raise ValidationError("Not allowed.")
        return obj

    def update(self, request, *args, **kwargs):
        assignment = self.get_object()
        report_pdf = request.data.get("report_pdf")
        if not report_pdf:
            raise ValidationError({"report_pdf": "This field is required."})
        assignment.report_pdf = report_pdf
        assignment.save(update_fields=["report_pdf"])
        ser = self.get_serializer(assignment)
        return Response(ser.data)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from accounts.authentication import CandidateTokenAuthentication
from django.conf import settings
from .models import Assignment

import os

class GenerateHRReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Optionally get all assessment data from DB
        assignments = Assignment.objects.select_related("employee", "template").all()

        assessment_data = []
        for a in assignments:
            print(a)
            assessment_data.append({
                "employee": str(a.employee),
                "template": a.template.code,
                "status": a.status,
                "score": a.metrics,
            })
        print (assessment_data)
        # Load vectorstore
        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "pdf_index")

        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)

        vectorstore = FAISS.load_local(index_path, OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY), allow_dangerous_deserialization=True)
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, api_key=settings.OPENAI_API_KEY)
        docs = retriever.invoke("HR organizational assessment overview employee well-being burnout stress motivation")
        context = "\n\n".join([d.page_content for d in docs])

        prompt = f"""You are a senior HR consultant. Based on the psychological assessment data below and the reference material, generate a comprehensive decision-support report for HR leadership.

Reference Material:
{context}

Assessment Data:
{assessment_data}

Guidelines:
1. Summarize Key Trends: overall mental health state, distribution across assessment types, patterns like high stress, burnout, low motivation.
2. Deep Analysis: highlight at-risk individuals or groups, cross-compare assessments where possible.
3. Actionable Recommendations: trainings, coaching, reorganization, burnout prevention, cultural improvements, per-department suggestions if relevant.
4. Reference Best Practices: mention key psychological models from the reference material.
5. Tone: clear and supportive language, structured with headings and paragraphs suitable for HR leadership.
End with a next-step checklist for HR. Do not use markdown symbols.
"""

        from langchain_core.messages import HumanMessage
        ai_response = llm.invoke([HumanMessage(content=prompt)])
        result = ai_response.content

        print("✅ AI Report Generated Successfully")

        return Response({"report": result})
		
# ---------- Detail ----------
class AssignmentDetailView(generics.RetrieveAPIView):
    serializer_class = AssignmentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        # HR can read any; employee can read only own
        base = Assignment.objects.select_related("template", "employee")
        user = self.request.user
        if IsHR().has_permission(self.request, self):
            return base
        return base.filter(employee=user)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from accounts.authentication import CandidateTokenAuthentication
from django.conf import settings
from .models import Assignment

import os

def build_dynamic_queries(assessment_name: str, metrics: dict) -> list[str]:
    """
    Build targeted RAG retrieval queries based on specific employee scores.
    This dynamically guides the vectorstore to fetch the most relevant psychological text.
    """
    queries = []
    name = assessment_name.upper()

    if name == 'BIG_FIVE':
        if not isinstance(metrics, dict): return ["Big Five OCEAN personality trait descriptions facets behavioural interpretation workplace scores"]
        raw_traits = metrics.get("traitScores") or metrics.get("trait") or {}
        for trait, score in raw_traits.items():
            if isinstance(score, (int, float)):
                if score >= 70:
                    queries.append(f"Big Five High {trait} personality trait workplace behavior interpretation")
                elif score <= 30:
                    queries.append(f"Big Five Low {trait} personality trait workplace behavior interpretation")
        if not queries:
            queries.append("Big Five OCEAN personality trait descriptions facets behavioural interpretation workplace scores")

    elif name == 'KARASEK':
        quadrant = str(metrics.get("quadrant", "")).lower().replace("_", " ")
        
        queries.append("Karasek Job Demands Control Support JDC-S theory definition")
        
        # 2. Quadrant-specific queries
        if quadrant:
            queries.append(f"Karasek JDC-S {quadrant} job characteristics workplace implications")
            queries.append(f"{quadrant} profile action points interventions wellbeing")
        
        queries.append("Psychological Demands workload time pressure definition")
        queries.append("Decision Latitude skill discretion autonomy definition")
        queries.append("Social Support workplace buffer isolation definition")

        # 4. Keep threshold logic for extreme risks
        dim = metrics.get("dimScores") or metrics.get("dim") or {}
        D = int(dim.get("D", 50))
        C = int(dim.get("C", 50))
        S = int(dim.get("S", 50))
        
        if D >= 67 and C <= 33:
            queries.append("Karasek high psychological demands low decision latitude high strain risk")
        if S <= 33:
            queries.append("Karasek low social support risk buffering effect")

    elif name == 'MASLACH':
        sub = metrics.get("subScores") if "subScores" in metrics else metrics
        
        EE = int(sub.get("EE", 0))
        DP = int(sub.get("DP", 0))
        PA = int(sub.get("PA", 0))
        
        if EE >= 60: 
            queries.append("emotional exhaustion job demands control social support interventions")
        if DP >= 60:
            queries.append("depersonalization cynicism organizational communication climate social support")
        if PA <= 40: # PA is inversely scored
            queries.append("low personal accomplishment professional efficacy engagement vigor dedication")
            
        if not queries:
            queries.append("Maslach Burnout Inventory MBI subscales interpretation and prevention")

    elif name == 'DISC':
        scores = {k: int(metrics.get(k, 0)) for k in ('D', 'I', 'S', 'C')}
        labels = {"D": "Dominance", "I": "Influence", "S": "Steadiness", "C": "Compliance"}
        if any(scores.values()):
            # Sort scores by primary and secondary dominant traits
            sorted_traits = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            primary = labels.get(sorted_traits[0][0])
            secondary = labels.get(sorted_traits[1][0])
            
            queries.append(
                f"Workplace behaviors, strengths, communication style, and blind spots "
                f"for a High {primary} and moderate {secondary} personality style."
            )
        else:
            queries.append("Practical workplace application, behaviors, strengths, and risks of DISC profile styles")

    elif name == 'JSS':
        # Dimension mapping: → Academic terms for FAISS queries
        dimension_labels = {
            "pay": "pay",
            "benefits": "benefits",
            "promotion": "career development and promotion",
            "supervision": "supervision",
            "working_conditions": "working conditions",
            "coworkers": "social support from coworkers",
            "work_nature": "work nature and job content",
            "policies": "organizational policies",
            "communication": "communication",
        }
        
        queries = []
        global_score = int(metrics.get("global", 0))
        
        # 1. Global context query
        if global_score <= 125:
            queries.append("Job Satisfaction Survey low overall satisfaction consequences turnover interventions")
        elif global_score >= 171:
            queries.append("Job Satisfaction Survey high overall satisfaction organizational commitment retention")
        else:
            queries.append("Job Satisfaction Survey moderate satisfaction employee engagement improvement interventions")

        # 2. Analyze ALL dimensions
        dim = metrics.get("dimScores") or {}
        sorted_dims = sorted(dim.items(), key=lambda x: int(x[1]))  # Lowest → Highest
        
        if sorted_dims:
            # Get lowest 2 (weaknesses)
            lowest_dims = sorted_dims[:2]
            for dim_name, score in lowest_dims:
                academic_term = dimension_labels.get(dim_name, dim_name)
                queries.append(f"Job Satisfaction Survey low satisfaction {academic_term} workplace intervention")
            
            # Get highest 2 (strengths)
            highest_dims = sorted_dims[-2:]
            for dim_name, score in highest_dims:
                academic_term = dimension_labels.get(dim_name, dim_name)
                queries.append(f"Job Satisfaction Survey high satisfaction {academic_term} employee retention")
            
            # For moderate scores: Add exploratory queries for middle dimensions too
            if len(sorted_dims) > 4:
                middle_dims = sorted_dims[2:-2]
                for dim_name, score in middle_dims:
                    academic_term = dimension_labels.get(dim_name, dim_name)
                    queries.append(f"Job Satisfaction Survey {academic_term} satisfaction moderate score employee well-being")

    elif name == 'BRS':
        average = float(metrics.get("average", 0))
        if average < 3.00:
            queries.append("Brief Resilience Scale low score employee workplace stress management recovery")
            queries.append("improving workplace resilience occupational health organizational support for employees")
        elif average >= 4.31:
            queries.append("Brief Resilience Scale high score employee workplace performance adaptability")
            queries.append("high workplace resilience team level positive psychological capacities organizational")
        else:
            queries.append("Brief Resilience Scale interpretation employee workplace resilience occupational")
            queries.append("workplace resilience organizational response to adversity healthy workers")

    elif name == 'CD_RISC':
        total = int(metrics.get("total", 0))
        corporate_anchor = "corporate workplace employee occupational performance HR coaching"
        if total <= 19:
            queries.append(f"CD-RISC 10 low resilience {corporate_anchor} professional development coping with work challenges")
        elif total >= 30:
            queries.append(f"CD-RISC 10 high resilience {corporate_anchor} leadership potential change management strengths")
        else:
            queries.append(f"CD-RISC 10 moderate resilience {corporate_anchor} motivation daily work balance improvement")
        queries.append("actionable employee workplace strategies professional strengths career risks")

    elif name == 'WSES':
        avg = float(metrics.get("average", 0))
        if avg < 3.0:
            queries.append("low occupational self-efficacy workplace risks lack of confidence coaching strategies HR interventions support")
        elif avg >= 4.0:
            queries.append("high occupational self-efficacy behavioral strengths leadership potential overconfidence risks management strategies")
        else:
            queries.append("moderate occupational self-efficacy behavioral traits workplace risks coaching strategies interventions")

    elif name == 'GCOS':
        orientations = {
            "Autonomous": float(metrics.get("autonomous", 0) or 0),
            "Controlled": float(metrics.get("controlled", 0) or 0),
            "Impersonal": float(metrics.get("impersonal", 0) or 0)
        }
        queries.extend([
                "autonomous causality orientation intrinsic motivation",
                "controlled causality orientation external rewards deadlines",
                "impersonal causality orientation amotivation lack of intentionality"
            ])
        if any(orientations.values()):
            dominant = max(orientations, key=orientations.get)
            if dominant == "Controlled":
                queries.append("control orientation negative affect frustration burnout pressure")
            elif dominant == "Autonomous":
                queries.append("autonomy orientation psychological need satisfaction well-being positive affect")
            elif dominant == "Impersonal":
                queries.append("impersonal orientation behavioral desistence incompetence apathy")

    elif name == 'RIBS':
        avg = float(metrics.get("average", 0))

        queries.append("Runco Ideational Behavior Scale everyday creativity divergent thinking")
        
        if avg >= 3.5:
            # Profile
            queries.append("high ideation creative potential generating ideas strengths")
            # Actionable Advice
            queries.append("translating divergent thinking into creative accomplishment practical applications")
            # Risks
            queries.append("over-ideation fluency without originality negative variance risks")
            
        elif avg < 2.5:
            # Profile
            queries.append("low ideational behavior conventional thinking standard procedures")
            # Risks
            queries.append("limitations in divergent thinking barriers to originality")
            # Actionable Advice
            queries.append("interventions improving ideation developing creative potential")
            
        else:
            # Profile
            queries.append("moderate ideation balancing conventional problem solving with creativity")
            # Actionable Advice
            queries.append("enhancing everyday creativity transitioning to creative accomplishment")

    elif name == 'CAQ':
        total = int(metrics.get("total", 0))
        # Broad queries targeted at the paper's Validity / Norms sections
        if total >= 13:
            queries.append("Creative Achievement Questionnaire high score highly creative individuals validity")
        elif total <= 3:
            queries.append("Creative Achievement Questionnaire normative data low score distribution")
        else:
            queries.append("Creative Achievement Questionnaire average score norm variance")
        # Domain-specific queries targeted at the Appendix/Scoring Rubric chunks
        domains = metrics.get("domainScores") or {}
        for dom, score in domains.items():
            if int(score) > 0:
                queries.append(f"Creative Achievement Questionnaire {dom} domain scoring rubric items appendix")

    elif name == 'ISE':
        avg = float(metrics.get("average", 0))
        answers = metrics.get("answers", {})

        search_construct_map = {
            "1": "Questioning",
            "2": "Questioning",
            "3": "Associational Thinking",
            "4": "Associational Thinking",
            "5": "Observing",
            "6": "Observing",
            "7": "Networking",
            "8": "Networking",
            "9": "Experimenting",
            "10": "Experimenting"
        }
        
        # Identify the top 2 weaknesses for targeted search
        sorted_items = sorted((answers).items(), key=lambda x: int(x[1]))
        lowest_traits = list(set([search_construct_map[k] for k, v in sorted_items[:3]]))[:2]
        weakness_keywords = " and ".join(lowest_traits)
        
        queries.append(f"practical exercises, workplace activities, and behavioral strategies to improve and develop {weakness_keywords} skills for innovation")

    return queries


class GenerateBigFiveReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=404)

        try:
            #  read metrics from request body first.
            metrics = request.data.get("metrics") or assignment.metrics or {}

            # Normalise key
            raw_traits = (
                metrics.get("traitScores")
                or metrics.get("trait")
                or {}
            )

            def _level(score):
                if score >= 80: return "Very High"
                if score >= 60: return "High"
                if score >= 40: return "Moderate"
                if score >= 20: return "Low"
                return "Very Low"

            TRAIT_LABELS = {
                "E": "Extraversion",
                "A": "Agreeableness",
                "C": "Conscientiousness",
                "N": "Neuroticism",
                "O": "Openness to Experience",
            }

            if raw_traits:
                scores_text = "\n".join(
                    f"  - {TRAIT_LABELS.get(k, k)}: {v}/100 ({_level(v)})"
                    for k, v in sorted(raw_traits.items())
                )
            else:
                scores_text = "  Score data unavailable."

            employee_name = str(assignment.employee)

            index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "bigfiveindex")
            
            # Check if FAISS index exists
            if not os.path.exists(os.path.join(index_path, "index.faiss")):
                return Response({
                    "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                    "details": f"Missing index at: {index_path}"
                }, status=503)

            vectorstore = FAISS.load_local(
                index_path,
                OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
                allow_dangerous_deserialization=True
            )
            # MMR retriever — fetches 8 diverse chunks from top-30 candidates.
            # lambda_mult=0.7 balances relevance (1.0) vs diversity (0.0).
            # This avoids returning 4 near-duplicate passages about the same facet.
            retriever = vectorstore.as_retriever(
                search_type="mmr",
                search_kwargs={
                    "k": 8,           # final chunks returned to the prompt
                    "fetch_k": 30,    # candidate pool before MMR re-ranking
                    "lambda_mult": 0.7,  # 0.7 = slightly favour relevance over diversity
                    "filter": lambda meta: meta.get("section_type") != "methodology",
                },
            )
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
            structured_llm = llm.with_structured_output(BigFiveReport)

            # Targeted query focuses on trait-level interpretation content rather
            # than methodology/statistics sections of academic papers.
            dyn_queries = build_dynamic_queries("BIG_FIVE", metrics)
            combined_query = " ".join(dyn_queries)
            
            docs = retriever.invoke(combined_query)

            # ── Retrieval debug log ──────────────────────────────────────
            print(f"\n{'='*60}")
            print(f"[BigFive RAG] Retrieved {len(docs)} chunks")
            for i, doc in enumerate(docs):
                m = doc.metadata
                print(
                    f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                    f"section_title={m.get('section_title','—')!r:30s} "
                    f"source={m.get('source_pdf', m.get('source','?'))!r} "
                    f"page={m.get('page_number', m.get('page','?'))}"
                )
                print(f"       preview: {doc.page_content.replace(chr(10),' ')!r}")
            print(f"{'='*60}\n")
            # ────────────────────────────────────────────────────────────
            
            # Deduplicate
            unique_docs_map = {doc.page_content: doc for doc in docs}
            unique_docs = list(unique_docs_map.values())
            context = "\n\n".join([d.page_content for d in unique_docs])

            prompt = f"""You are a senior workplace psychologist specialising in the Big Five / OCEAN model.
Using the reference material below AND the employee's precise scores, produce a structured psychometric report.
Where the reference material is general or introductory, draw on your deep psychometric expertise to provide
specific, facet-level interpretations grounded in Big Five theory (Costa & McCrae NEO-PI-R framework).

Reference Material:
{context}

Employee: {employee_name}

OCEAN Trait Scores (0–100):
{scores_text}

Score bands: Very High (80–100), High (60–79), Moderate (40–59), Low (20–39), Very Low (0–19).

⚠️  CRITICAL SCORING RULES — read before writing any trait interpretation:
1. NEUROTICISM direction: N is scored POSITIVELY for emotional instability / negative affect.
   - N ≥ 60 (High / Very High) = prone to stress, anxiety, moodiness.
   - N 40–59 (Moderate) = AVERAGE emotional reactivity: experiences normal stress and frustration;
     NOT emotionally stable, NOT managing stress especially well — just typical.
   - N ≤ 39 (Low) = genuinely calm, emotionally resilient, rarely distressed.
   NEVER describe Moderate N as "manages stress effectively", "emotionally stable", or "resilient".
   Moderate N means ordinary / typical — acknowledge both the everyday stress and the coping capacity.
2. ALL traits: anchor every sentence to the actual numeric score and band. 50 = right in the middle.
3. Facets must match the score direction, e.g., High C → strong Self-Discipline and Dutifulness;
   Moderate E → neither highly assertive nor highly reserved.
4. For Moderate scores (40-59), do NOT list extreme facets as "strong" or "weak". Instead, populate both the `strong_facets` and `weak_facets` lists with exactly ["Balanced"] or ["Average"]. Do not invent strong/weak facets for moderate traits.

Instructions:
- summary: 3–5 sentence executive summary referencing the actual scores; do NOT speculate beyond what the scores indicate.
- traits: For each of the 5 OCEAN traits state the score, level, a 2–3 sentence workplace interpretation,
  2–3 strong facets implied by the score, and 1–2 weaker facets. Use NEO-PI-R facet names where possible. (See Rule 4 for Moderate scores).
- strengths: 3–4 key professional strengths derived from the full profile.
- risks: 2–3 potential risks or development areas.
- action_points: 4 tailored, concrete action points (title + description each).
- profile_archetype: a 2–4 word archetype label that captures the dominant personality pattern.
Use a professional, supportive tone grounded in psychometric science."""

            result = structured_llm.invoke(prompt)

            print("✅ AI Report Generated Successfully (structured JSON)")

            # Save AI report to database as JSON
            import json
            assignment.ai_report = json.dumps(result.model_dump())
            assignment.save(update_fields=["ai_report"])

            return Response({"report": result.model_dump()})
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class GenerateKarasekReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(id=assignment_id, employee=request.user)
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # read metrics from request body first (sent before submit completes).
        metrics = request.data.get("metrics") or assignment.metrics or {}
        employee_name = str(assignment.employee)
        scores_text = format_karasek_scores(metrics)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "karasekindex")

        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)

        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True
        )
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 8,
                "fetch_k": 40,
                "lambda_mult": 0.65,
                "filter": lambda meta: meta.get("section_type") not in ("methodology", "general")
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(KarasekReport)

        dyn_queries = build_dynamic_queries("KARASEK", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[KARASEK RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
        
        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a senior occupational psychologist specialising in the Job Demands-Control-Support model.
Using the reference material below AND the employee's precise JDC-S scores, produce a structured report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

CRITICAL INSTRUCTION: You MUST use the exact 'High' or 'Low' labels provided above when interpreting the dimensions in the report.
"Do NOT describe a dimension as 'Moderate'.

Instructions:
- summary: 3–4 sentence overview of the work environment based on JDC-S scores.
- quadrant: one of High Strain, Low Strain, Active, or Passive.
- quadrant_meaning: 2–3 sentences explaining what this quadrant implies for the employee.
- dimensions: interpret Psychological Demands, Decision Latitude, and Social Support with level and 1–2 sentence meaning.
- strengths: 2–3 positive aspects of the work situation.
- risks: 2–3 risk factors for stress or burnout.
- action_points: 3–4 actionable well-being improvement suggestions.
- profile_archetype: a short label, e.g. 'The Overloaded Expert'.
Professional tone, grounded in JDC-S theory."""

        result = structured_llm.invoke(prompt)

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        print("✅ AI Report Generated Successfully (structured JSON)")

        return Response({"report": result.model_dump()})


class GenerateMaslachReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(id=assignment_id, employee=request.user)
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # read metrics from request body first (sent before submit completes).
        metrics = request.data.get("metrics") or assignment.metrics or {}
        employee_name = str(assignment.employee)
        scores_text = format_maslach_scores(metrics)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "maslachindex")

        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)

        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True
        )
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 8,
                "fetch_k": 30,
                "lambda_mult": 0.7,
                "filter": lambda meta: meta.get("section_type") not in ("methodology", "general")
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(MaslachReport)

        dyn_queries = build_dynamic_queries("MASLACH", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[MASLACH RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
        
        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a senior occupational psychologist specialising in burnout and the Maslach Burnout Inventory.
Using the reference material below AND the employee's precise MBI scores, produce a structured burnout report.
IMPORTANT: Personal Accomplishment (PA) is scored INVERSELY — a LOW PA score indicates burnout risk.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

IMPORTANT: Personal Accomplishment (PA) is scored INVERSELY — a LOW PA score indicates burnout risk.

Instructions:
- summary: 3–4 sentence overall burnout profile summary.
- burnout_level: overall risk level (High Risk, Moderate Risk, or Low Risk).
- subscales: for each of the 3 MBI subscales (Emotional Exhaustion, Depersonalization, Personal Accomplishment),
  provide the score, level, and 1–2 sentence interpretation.
- strengths: 2–3 protective factors in the profile.
- risks: 2–3 burnout risk areas requiring attention.
- action_points: 3–4 recovery and prevention strategies.
- profile_archetype: short label for this burnout profile.
Maintain a compassionate, professional tone."""

        result = structured_llm.invoke(prompt)

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        print("✅ AI Report Generated Successfully (structured JSON)")

        return Response({"report": result.model_dump()})
    

import os
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404

# Imports for Auth and Models
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication
from accounts.authentication import CandidateTokenAuthentication
from accounts.models import Recruitee
from .models import Assignment, CandidateAssignment


logger = logging.getLogger(__name__)

class GenerateDiscReportView(APIView):
    # ✅ Support all authentication types: Candidates (Token), Employees (JWT), Session
    authentication_classes = [
        CandidateTokenAuthentication,  # for candidates
        JWTAuthentication,             # for employees/HR
        SessionAuthentication          # for session-based auth
    ]
    # ✅ AllowAny because we check user type manually inside
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        assignment = None
        user_name = "Unknown"

        # Resolve User & Assignment (Hybrid Logic)
        try:
            # CASE A: CANDIDATE (Authenticated via Token)
            if isinstance(request.user, Recruitee):
                assignment = CandidateAssignment.objects.get(
                    id=assignment_id, 
                    recruitee=request.user
                )
                user_name = str(assignment.recruitee)
            
            # CASE B: EMPLOYEE (Authenticated via Login/Session)
            elif request.user.is_authenticated:
                assignment = Assignment.objects.select_related("employee", "template").get(
                    id=assignment_id, 
                    employee=request.user
                )
                user_name = str(assignment.employee)
            
            # CASE C: UNAUTHORIZED
            else:
                 return Response({"error": "Authentication required."}, status=401)

        except (Assignment.DoesNotExist, CandidateAssignment.DoesNotExist):
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)
        except Exception as e:
            print(f"❌ DB/AUTH ERROR: {str(e)}")
            return Response({"error": f"Server Error during lookup: {str(e)}"}, status=500)

        # Try to take metrics from request body first (Real-time submission)
        metrics = request.data.get("metrics")
        
        # Fallback to stored metrics if not in body
        if not metrics:
            if hasattr(assignment, 'metrics'): 
                metrics = assignment.metrics
            elif hasattr(assignment, 'result_data') and assignment.result_data:
                metrics = assignment.result_data.get('metrics')

        if not metrics:
            return Response({"error": "No DISC metrics provided or stored."}, status=400)

        scores_text = format_disc_scores(metrics)

        print(f"📝 Generating Report for: {user_name}")

        try:
            index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "discindex")
            
            # Check if FAISS index exists
            if not os.path.exists(os.path.join(index_path, "index.faiss")):
                return Response({
                    "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                    "details": f"Missing index at: {index_path}"
                }, status=503)

            vectorstore = FAISS.load_local(
                index_path,
                OpenAIEmbeddings(
                    api_key=settings.OPENAI_API_KEY
                ),
                allow_dangerous_deserialization=True,
            )
            retriever = vectorstore.as_retriever(
                search_type="mmr",
                search_kwargs={
                    "k": 8,
                    "fetch_k": 40,
                    "lambda_mult": 0.6,
                    "filter": lambda meta: meta.get("section_type") not in ("methodology", "general")
                }
            )
            llm = ChatOpenAI(
                model="gpt-4o-mini",
                temperature=0.1,
                api_key=settings.OPENAI_API_KEY,
            )
            structured_llm = llm.with_structured_output(DiscReport)

            dyn_queries = build_dynamic_queries("DISC", metrics)
            combined_query = " ".join(dyn_queries)
            docs = retriever.invoke(combined_query)

            # ── Retrieval debug log ──
            print(f"\n{'='*60}")
            print(f"[DISC RAG] Retrieved {len(docs)} chunks")
            for i, doc in enumerate(docs):
                m = doc.metadata
                print(
                    f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                    f"section_title={m.get('section_title','—')!r:30s} "
                    f"source={m.get('source_pdf', m.get('source','?'))!r} "
                    f"page={m.get('page_number', m.get('page','?'))}"
                )
                print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
            print(f"{'='*60}\n")
            
            # Deduplicate identical chunks
            unique_docs_map = {doc.page_content: doc for doc in docs}
            context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

            prompt = f"""You are a workplace psychologist specialising in DISC profiling.
Using the reference material below AND the employee's precise DISC scores, produce a structured DISC report.

Reference Material:
{context}

Employee: {user_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the DISC profile.
- disc_dimensions: for each of D/I/S/C provide score, level, and a 1-sentence interpretation.
- strengths: 2–3 key workplace strengths from this DISC profile.
- risks: 2–3 potential blind spots or challenges.
- action_points: 3–5 practical development recommendations.
- profile_archetype: short label describing this DISC combination.
Supportive, professional tone.
"""

            result = structured_llm.invoke(prompt)

            print("✅ AI Report Generated Successfully")

            import json

            assignment.ai_report = json.dumps(result.model_dump())
            assignment.save(update_fields=["ai_report"])

            return Response({"report": result.model_dump()})

        except Exception as e:
            print(f"❌ AI GENERATION ERROR: {str(e)}")
            return Response({
                "report": "Unable to generate detailed AI report at this time. Please proceed with the standard results.",
                "debug_error": str(e)
            }, status=200)
    

class GenerateJssReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # Prendre metrics depuis request ou depuis l’assignment
        metrics = request.data.get("metrics") or assignment.metrics
        if not metrics:
            return Response({"error": "No JSS metrics found. Report not generated."}, status=400)

        employee_name = str(assignment.employee)
        scores_text = format_jss_scores(metrics)

        # Charger l’index FAISS
        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "jssindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 3,
                "fetch_k": 20,
                "lambda_mult": 0.65,
                "filter": lambda meta: meta.get("section_type") not in ("methodology", "general")
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(JssReport)

        #  Unbundle the queries
        dyn_queries = build_dynamic_queries("JSS", metrics)
        all_docs = []
        for query in dyn_queries:
            docs = retriever.invoke(query)
            all_docs.extend(docs)
            
        # 4. Deduplicate chunks
        unique_docs_map = {doc.page_content: doc for doc in all_docs}

        final_docs = list(unique_docs_map.values())[:8]

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[JSS RAG] Retrieved {len(final_docs)} chunks")
        for i, doc in enumerate(final_docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
                
        context = "\n\n---\n\n".join([d.page_content for d in final_docs])

        prompt = f"""You are an organisational psychologist specialising in job satisfaction measurement.
Using the reference material below AND the employee's precise JSS scores, produce a structured JSS report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the overall job satisfaction profile.
- global_score: the total JSS score (numeric).
- overall_level: Very High, Moderate, Low, or Very Low.
- dimensions: for each of the 9 JSS dimensions provide score, satisfaction_level, and 1 sentence interpretation.
  Bands per dimension: Very High (19–24), Moderate (14–18), Low (9–13), Very Low (4–8).
- strengths: 2–3 highest satisfaction dimensions.
- risks: 2–3 lowest satisfaction dimensions needing improvement.
- action_points: 4–5 concrete recommendations to improve satisfaction.
- profile_archetype: short label for the satisfaction profile.
Supportive, professional tone.

CRITICAL INSTRUCTIONS (YOU MUST FOLLOW THESE TO AVOID FAILURE):
1. NO GENERIC FLUFF: Every claim in the 'summary', 'dimensions', and 'action_points' MUST be tied directly to a specific concept found in the Reference Material (e.g., burnout, absenteeism, turnover, mobbing, feeling stuck).
2. If the text mentions "burnout", "turnover", or "absenteeism" in relation to a dimension, you must explicitly mention it.
"""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully")

        import json
        # Save to assignment
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})
    

class GenerateBRSReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # take metrics from body first, fallback to assignment
        metrics = request.data.get("metrics") or assignment.metrics

        if not metrics or not metrics.get("average"):
            return Response({"error": "No BRS metrics found in request or assignment."}, status=400)

        employee_name = str(assignment.employee)
        scores_text = format_brs_scores(metrics)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "brsindex")
        
        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)
        
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 8,
                "fetch_k": 40,
                "filter": lambda meta: meta.get("section_type") != "methodology"
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(BrsReport)

        dyn_queries = build_dynamic_queries("BRS", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)
        
        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[BRS RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
        
        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a workplace psychologist specialising in resilience and stress management.
Using the reference material below AND the employee's precise BRS scores, produce a structured BRS report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

CRITICAL:
1. The reference material contains general workplace studies and multiple frameworks (such as the ADPRI Workplace Resilience Scale). 
2. The employee DID NOT take the ADPRI scale. They took the 6-item Brief Resilience Scale (BRS) by Smith et al., which measures ONLY the speed and efficiency of bouncing back from stress.

Instructions:
- summary: 3–4 sentence overview of the employee's resilience capacity.
- average_score: the BRS average score (1.00–5.00).
- resilience_level: High Resilience (4.31–5.00), Normal Resilience (3.00–4.30), or Low Resilience (1.00–2.99).
- strengths: 2–3 strengths STRICTLY related to stress recovery/bouncing back. DO NOT invent strengths about teamwork or social support.
- risks: 2–3 resilience vulnerabilities or stress-coping challenges.
- action_points: 3–4 practical strategies to maintain or improve resilience.
- profile_archetype: short resilience profile label.
Supportive, professional tone."""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully (structured JSON)")

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})


class GenerateCDRISC10ReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # Take metrics from request or DB
        metrics = request.data.get("metrics") or assignment.metrics

        if not metrics or "total" not in metrics:
            return Response({"error": "No CD-RISC 10 metrics found."}, status=400)

        employee_name = str(assignment.employee)
        scores_text = format_cdrisc_scores(metrics)

        # Load the FAISS vectorstore
        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "cdriscindex")
        
        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)
        
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )

        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 7,
                "fetch_k": 30,
                "lambda_mult": 0.6,
                "filter": lambda meta: meta.get("section_type") not in ("methodology", "general")
            }
        )
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=settings.OPENAI_API_KEY,
        )
        structured_llm = llm.with_structured_output(CdriscReport)

        dyn_queries = build_dynamic_queries("CD_RISC", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[CD_RISC RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
        
        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a workplace psychologist specialising in resilience assessment.
Using the reference material below AND the employee's precise CD-RISC 10 scores, produce a structured report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the employee's resilience capacity.
- total_score: the CD-RISC 10 total score (0–40).
- resilience_level: High (30–40), Moderate (20–29), or Low (0–19).
- strengths: 2–3 resilience strengths based on the score (do not hallucinate strengths they scored poorly on).
- risks: 2–3 areas where resilience may be challenged.
- action_points: 3–4 actionable workplace strategies to strengthen resilience.
- profile_archetype: short resilience profile label.
Professional, clear, supportive tone.
"""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully (structured JSON)")

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})


# ---------- WSES ----------
class GenerateWSESReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        if not metrics or "average" not in metrics:
            return Response({"error": "No WSES metrics found."}, status=400)

        employee_name = str(assignment.employee)
        scores_text = format_wses_scores(metrics)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "wsesindex")
        
        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)
        
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 5,
                "fetch_k": 30,
                "lambda_mult": 0.5,
                "filter": lambda meta: meta.get("section_type") not in ("methodology")
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(WsesReport)

        dyn_queries = build_dynamic_queries("WSES", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[WSES RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
        
        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a workplace psychologist specialising in self-efficacy and professional development.
Using the reference material below AND the employee's precise WSES scores, produce a structured WSES report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the employee's work self-efficacy.
- average_score: the WSES average score.
- efficacy_level: High, Moderate, or Low.
- strengths: 2–3 self-efficacy strengths observed.
- risks: 2–3 areas where self-efficacy limits performance.
- action_points: 3–4 strategies to develop work self-efficacy.
- profile_archetype: short efficacy profile label.
Professional, supportive tone."""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully (structured JSON)")

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})


# ---------- GCOS-mini ----------
class GenerateGCOSReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        assignment = None
        user_name = "Unknown"

        # Support both candidates and employees
        try:
            # CASE A: CANDIDATE
            if isinstance(request.user, Recruitee):
                assignment = CandidateAssignment.objects.get(
                    id=assignment_id, 
                    recruitee=request.user
                )
                user_name = str(assignment.recruitee)
            
            # CASE B: EMPLOYEE
            elif request.user.is_authenticated:
                assignment = Assignment.objects.select_related("employee", "template").get(
                    id=assignment_id, 
                    employee=request.user
                )
                user_name = str(assignment.employee)
            
            # CASE C: UNAUTHORIZED
            else:
                return Response({"error": "Authentication required."}, status=401)

        except (Assignment.DoesNotExist, CandidateAssignment.DoesNotExist):
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        if not metrics or "autonomous" not in metrics:
            return Response({"error": "No GCOS metrics found."}, status=400)

        scores_text = format_gcos_scores(metrics)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "gcosindex")
        
        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)
        
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 8,
                "fetch_k": 40,
                "lambda_mult": 0.5,
                "filter": lambda meta: meta.get("section_type") not in ("methodology", "general")
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(GcosReport)

        dyn_queries = build_dynamic_queries("GCOS", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[GCOS RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
        
        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a workplace psychologist specialising in motivation and self-determination theory.
Using the reference material below AND the employee's precise GCOS scores, produce a structured GCOS motivation profile.

Reference Material:
{context}

Employee: {user_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the employee's motivational orientations.
- orientations: for each of the 3 GCOS orientations (Autonomous, Controlled, Impersonal), provide the score,
  level (Dominant/Moderate/Low), and 1–2 sentence workplace implication.
- dominant_orientation: the strongest orientation name.
- strengths: 2–3 motivational strengths observed.
- risks: 2–3 motivational risks or engagement concerns.
- action_points: 3–4 development actions to foster intrinsic motivation.
- profile_archetype: short motivational style label.
Supportive, professional tone.

IMPORTANT: Ignore any statistical variables, p-values, or study methodology mentioned in the context. 
Focus strictly on the behavioral descriptions and psychological definitions of the orientations."""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully (structured JSON)")

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})


# ---------- RIBS ----------
class GenerateRIBSReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        if not metrics or "average" not in metrics:
            return Response({"error": "No RIBS metrics found."}, status=400)

        answers = request.data.get("answers") or getattr(assignment, "answers", {})
        questions = request.data.get("questions", {})
        employee_name = str(assignment.employee)
        scores_text = format_ribs_scores(metrics, answers, questions)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "ribsindex")
        
        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)
        
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )
        # Multi-query fetching
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 6,   # Fetch top 3 PER query (not total)
                "fetch_k": 40,
                "lambda_mult": 0.6,
                "filter": lambda meta: meta.get("section_type") not in ("methodology")
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(RibsReport)

        dyn_queries = build_dynamic_queries("RIBS", metrics)
        
        # MULTI-QUERY RETRIEVAL: Execute each query separately
        all_docs = []
        for query in dyn_queries:
            raw_docs = retriever.invoke(query)
            
            for doc in raw_docs:
                m = doc.metadata
                page = m.get("page", m.get("page_number", -1))
                
                try:
                    page = int(page)
                except (ValueError, TypeError):
                    page = -1
                
                title = str(m.get("section_title", "")).lower()
                
                # No Title Pages (0) or Reference/Stat Pages
                if page == 0 or page >= 13:
                    continue
                    
                # No Statistical/Abstract sections
                bad_sections = ["methodology", "abstract", "comparison", "validating"]
                if any(bad in title for bad in bad_sections):
                    continue
                    
                all_docs.append(doc)
        
        # Deduplicate identical chunks
        seen = set()
        unique_docs = []
        for doc in all_docs:
            m = doc.metadata
            key = (
                m.get("source_pdf") or m.get("source"),
                m.get("page_number") or m.get("page"),
                m.get("section_title")
            )
            if key not in seen:
                seen.add(key)
                unique_docs.append(doc)

        # Enforce limit explicitly
        final_docs = unique_docs[:6]

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[RIBS RAG] Retrieved {len(final_docs)} chunks")
        for i, doc in enumerate(final_docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")

        context = "\n\n".join([d.page_content for d in final_docs])

        prompt = f"""You are a psychologist specialising in creativity and ideation.
Using the reference material below AND the employee's precise RIBS scores, produce a structured RIBS report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the employee's ideational creativity.
- average_score: the RIBS average score.
- ideation_level: High Ideation, Moderate Ideation, or Low Ideation.
- strengths: 2–3 creativity strengths observed.
- risks: 2–3 potential limitations in creative thinking.
- action_points: 3–4 strategies to enhance creative ideation at work.
- profile_archetype: short creativity label.
Supportive, professional tone.
"""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully (structured JSON)")

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})


# ---------- CAQ Report ----------
class GenerateCAQReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        if not metrics or "total" not in metrics:
            return Response({"error": "No CAQ metrics found."}, status=400)

        employee_name = str(assignment.employee)
        scores_text = format_caq_scores(metrics)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "caqindex")
        
        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)
        
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 6,
                "fetch_k": 25,
                "lambda_mult": 0.6
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(CaqReport)

        dyn_queries = build_dynamic_queries("CAQ", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[CAQ RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")

        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a psychologist specialising in creativity and creative achievement.
Using the reference material below AND the employee's precise CAQ scores, produce a structured CAQ report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the employee's creative achievement profile.
- total_score: the CAQ total score (integer).
- overall_level: High, Moderate, Low, or Minimal.
- creative_domains: list key creative domains with achievement level and 1 sentence note each.
- strengths: 2–3 strongest creative areas.
- risks: 2–3 underdeveloped domains or creative barriers.
- action_points: 3–4 personalised recommendations to leverage or expand creative potential.
- profile_archetype: short creative profile label.
Supportive, professional tone.
"""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully (structured JSON)")

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})


# ---------- ISE Report ----------
class GenerateISEReportView(APIView):
    authentication_classes = [
        CandidateTokenAuthentication,
        JWTAuthentication,
        SessionAuthentication
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        raw_data = request.data or assignment.metrics
        
        if not raw_data:
            return Response({"error": "No ISE data found."}, status=400)

        metrics = raw_data.get("metrics")
        if not metrics or "average" not in metrics:
            return Response({"error": "No ISE metrics found in request or assignment."}, status=400)

        employee_name = str(assignment.employee)
        scores_text = format_ise_scores(raw_data)

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "iseindex")
        
        # Check if FAISS index exists
        if not os.path.exists(os.path.join(index_path, "index.faiss")):
            return Response({
                "error": "FAISS index not found. AI report generation requires index files to be uploaded.",
                "details": f"Missing index at: {index_path}"
            }, status=503)
        
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 5,
                # "fetch_k": 20,
                # "lambda_mult": 0.65,
                "filter": lambda meta: meta.get("section_type") not in ("methodology")
            }
        )
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=settings.OPENAI_API_KEY)
        structured_llm = llm.with_structured_output(IseReport)

        dyn_queries = build_dynamic_queries("ISE", metrics)
        combined_query = " ".join(dyn_queries)
        docs = retriever.invoke(combined_query)

        # ── Retrieval debug log ──
        print(f"\n{'='*60}")
        print(f"[ISE RAG] Retrieved {len(docs)} chunks")
        for i, doc in enumerate(docs):
            m = doc.metadata
            print(
                f"  [{i+1}] section_type={m.get('section_type','—')!r:20s} "
                f"section_title={m.get('section_title','—')!r:30s} "
                f"source={m.get('source_pdf', m.get('source','?'))!r} "
                f"page={m.get('page_number', m.get('page','?'))}"
            )
            print(f"      preview: {doc.page_content.replace(chr(10), ' ')!r}")
        print(f"{'='*60}\n")
        
        # Deduplicate identical chunks
        unique_docs_map = {doc.page_content: doc for doc in docs}
        context = "\n\n".join([d.page_content for d in unique_docs_map.values()])

        prompt = f"""You are a workplace psychologist specialising in innovation and self-efficacy based on Schar et al. (2017) Innovator's DNA model.
Using the reference material below AND the employee's precise ISE scores, produce a structured ISE report.

Reference Material:
{context}

Employee: {employee_name}

{scores_text}

Instructions:
- summary: 3–4 sentence overview of the employee's innovation confidence.
- average_score: the ISE average score.
- innovation_level: High Innovation Confidence, Moderate, or Low.
- strengths: 2–3 innovation confidence strengths.
- risks: 2–3 areas where innovation confidence is limited.
- action_points: 3–4 practical recommendations to build innovation self-efficacy.
- profile_archetype: short innovation profile label.
Supportive, engaging, professional tone.

CRITICAL RULES:
1. Base 'strengths' and 'risks' ONLY on the scores provided in "EXPLICIT AI INSTRUCTIONS" above. Do NOT invent constructs or behaviors not mentioned.
2. The 'action_points' should directly target the lowest-scoring constructs with concrete practices from the reference material.
"""

        result = structured_llm.invoke(prompt)

        print("✅ AI Report Generated Successfully (structured JSON)")

        import json
        assignment.ai_report = json.dumps(result.model_dump())
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result.model_dump()})


# recruitment/views.py
import os
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from PyPDF2 import PdfReader
from openai import OpenAI

def extract_text(file):
    if file.name.endswith(".pdf"):
        reader = PdfReader(file)
        text = "".join([page.extract_text() or "" for page in reader.pages])
    else:
        text = file.read().decode("utf-8", errors="ignore")
    return text.strip()

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

class AICandidateMatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cv_file = request.FILES.get("cv")
        jd_text = request.data.get("job_description", "")

        if not cv_file or not jd_text:
            return Response({"error": "CV and job description are required."}, status=400)

        cv_text = extract_text(cv_file)
        if not cv_text:
            return Response({"error": "CV text extraction failed."}, status=400)

        # Initialize OpenAI client with API key
        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        # Generate embeddings
        cv_embedding = client.embeddings.create(
            model="text-embedding-3-large", input=cv_text
        ).data[0].embedding

        jd_embedding = client.embeddings.create(
            model="text-embedding-3-large", input=jd_text
        ).data[0].embedding

        # Calculate cosine similarity
        similarity = cosine_similarity(np.array(cv_embedding), np.array(jd_embedding))
        score = round(similarity * 100, 2)

        # Interpret the score
        if score >= 85:
            fit = "Excellent match"
        elif score >= 70:
            fit = "Strong match"
        elif score >= 50:
            fit = "Moderate match"
        else:
            fit = "Low match"

        return Response({
            "score": score,
            "fit": fit,
            "summary": f"Similarity-based AI match score: {score} ({fit})."
        })

from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, generics
from accounts.models import Recruitee
from .models import AssessmentTemplate, CandidateAssignment
from .serializers import CandidateAssignmentSerializer

# Import candidate authentication
from accounts.authentication import CandidateTokenAuthentication

from django.template import Template, Context
from django.core.mail import EmailMultiAlternatives
from accounts.models import EmailTemplate
from django.db import transaction


# --------------------------
# Assign Candidate Assessments (HR) ✅
# --------------------------
class AssignCandidateAssessmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        candidate_emails = request.data.get("candidate_emails", [])
        template_codes = request.data.get("template_codes", [])

        if not candidate_emails or not template_codes:
            return Response(
                {"detail": "Candidate emails and templates are required."},
                status=400,
            )

        if isinstance(candidate_emails, str):
            candidate_emails = [candidate_emails]

        origin = request.META.get("HTTP_ORIGIN") or settings.FRONTEND_URL
        assigned_count = 0
        errors = []

        # 1. Load email template ONCE
        try:
            email_template = EmailTemplate.objects.get(
                name="Candidate Assessment Invitation",
                audience_type="candidate",
                status="active",
            )
        except EmailTemplate.DoesNotExist:
            return Response(
                {"detail": "Candidate Assessment Invitation email template not found or inactive."},
                status=500,
            )

        with transaction.atomic():
            for email in candidate_emails:
                try:
                    recruitee = Recruitee.objects.get(email=email)
                except Recruitee.DoesNotExist:
                    errors.append(f"Skipped {email}: Recruitee not found.")
                    continue

                for code in template_codes:
                    try:
                        template = AssessmentTemplate.objects.get(code=code)

                        assignment, created = CandidateAssignment.objects.get_or_create(
                            recruitee=recruitee,
                            template=template,
                        )

                        assignment_link = f"{origin}/take-assessment/{assignment.token}"

                        # 2. Render email
                        context = {
                            "firstName": recruitee.first_name or "Candidate",
                            "templateName": template.name,
                            "assignmentLink": assignment_link,
                        }

                        subject = Template(email_template.subject).render(
                            Context(context)
                        )
                        html_body = Template(email_template.body).render(
                            Context(context)
                        )

                        # 3. Send HTML email
                        email_msg = EmailMultiAlternatives(
                            subject=subject,
                            body="Please view this email in HTML format.",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            to=[email],
                        )
                        email_msg.attach_alternative(html_body, "text/html")
                        email_msg.send()

                        assigned_count += 1
                        print(
                            f"✅ Candidate email sent to {email} ({template.name})"
                        )

                    except AssessmentTemplate.DoesNotExist:
                        errors.append(f"Template code '{code}' invalid.")
                    except Exception as e:
                        errors.append(f"Failed sending to {email}: {str(e)}")
                        print(f"❌ Email error for {email}: {str(e)}")

        return Response(
            {
                "message": f"Processed {assigned_count} assignments.",
                "errors": errors,
            }
        )


class GenerateAndLaunchAssessmentView(APIView):
    """HR endpoint: generate (AI) assessment metadata and launch to candidate or employee emails."""
    permission_classes = [permissions.IsAuthenticated, IsHR]

    def post(self, request):
        prompt = request.data.get("prompt")
        response_type = request.data.get("response_type", "multiple-choice")
        candidate_emails = request.data.get("candidate_emails", [])
        send_emails = request.data.get("send_emails", True)

        if not prompt or not candidate_emails:
            return Response({"detail": "prompt and candidate_emails are required."}, status=400)

        # Generate Assessment via AI
        import json
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage
        
        system_prompt = f"""
You are an expert HR organizational psychologist. Base on this request: "{prompt}"
Generate a high-conversion {response_type} assessment tailored to the goals.
Return ONLY valid JSON in this format:
{{
  "title": "Assessment Name",
  "questions": [
     {{ "id": "1", "text": "Question 1", "options": ["A", "B", "C", "D"] }}
  ]
}}
"""
        try:
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3, api_key=settings.OPENAI_API_KEY)
            ai_response = llm.invoke([HumanMessage(content=system_prompt)])
            # Strip potential markdown fences
            raw_content = ai_response.content.strip()
            if raw_content.startswith("```json"):
                raw_content = raw_content[7:]
            if raw_content.endswith("```"):
                raw_content = raw_content[:-3]
            
            assessment_data = json.loads(raw_content.strip())
            template_name = assessment_data.get("title", "AI Generated Assessment")
            questions = assessment_data.get("questions", [])
        except Exception as e:
            # Fallback if generation fails
            template_name = f"AI Assessment - {prompt[:30]}"
            questions = []
            print(f"❌ AI Generation Failed: {e}")

        template_code = f"AI_{uuid.uuid4().hex[:8].upper()}"

        # Create template with generated questions
        template = AssessmentTemplate.objects.create(
            code=template_code,
            name=template_name,
            questions=questions
        )

        # Load email template
        try:
            email_template = EmailTemplate.objects.get(
                name="Candidate Assessment Invitation",
                audience_type="candidate",
                status="active",
            )
        except EmailTemplate.DoesNotExist:
            return Response({"detail": "Candidate Assessment Invitation email template not found or inactive."}, status=500)

        origin = request.META.get("HTTP_ORIGIN") or settings.FRONTEND_URL
        assigned_count = 0
        errors = []

        with transaction.atomic():
            for email in candidate_emails:
                recipient_email = str(email or "").strip().lower()
                if not recipient_email:
                    continue

                # Priority 1: candidate flow (token-based)
                recruitee = Recruitee.objects.filter(email=recipient_email).first()
                if recruitee:
                    try:
                        assignment, created_assign = CandidateAssignment.objects.get_or_create(
                            recruitee=recruitee,
                            template=template,
                        )

                        # If it already existed, rotate token and reset timestamps so link is fresh
                        if not created_assign:
                            assignment.token = uuid.uuid4()
                            assignment.assigned_at = timezone.now()
                            assignment.status = "PENDING"
                            assignment.completed_at = None
                            assignment.answers = None
                            assignment.metrics = None
                            assignment.ai_report = ""
                            assignment.save(update_fields=[
                                "token", "assigned_at", "status", "completed_at", "answers", "metrics", "ai_report"
                            ])

                        if send_emails:
                            assignment_link = f"{origin}/take-assessment/{assignment.token}"
                            context = {
                                "firstName": recruitee.first_name or "Candidate",
                                "templateName": template.name,
                                "assignmentLink": assignment_link,
                            }

                            subject = Template(email_template.subject).render(Context(context))
                            html_body = Template(email_template.body).render(Context(context))

                            email_msg = EmailMultiAlternatives(
                                subject=subject,
                                body="Please view this email in HTML format.",
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                to=[recipient_email],
                            )
                            email_msg.attach_alternative(html_body, "text/html")
                            try:
                                email_msg.send()
                            except Exception as e:
                                errors.append(f"Failed sending to {recipient_email}: {str(e)}")
                                print(f"❌ Email error for {recipient_email}: {str(e)}")
                                continue

                        assigned_count += 1
                        continue
                    except Exception as e:
                        errors.append(f"Failed for {recipient_email}: {str(e)}")
                        continue

                # Priority 2: employee flow (session/JWT-based)
                try:
                    employee_qs = User.objects.filter(email=recipient_email)
                    requester_company_id = getattr(request.user, "company_id", None)
                    if requester_company_id:
                        employee_qs = employee_qs.filter(company_id=requester_company_id)

                    employee = employee_qs.first()
                    if not employee:
                        errors.append(f"Skipped {recipient_email}: not found as candidate or employee.")
                        continue

                    assignment, created_assign = Assignment.objects.get_or_create(
                        employee=employee,
                        template=template,
                        defaults={"assigned_by": str(getattr(request.user, "email", request.user))},
                    )

                    if not created_assign:
                        assignment.status = "PENDING"
                        assignment.assigned_at = timezone.now()
                        assignment.completed_at = None
                        assignment.answers = None
                        assignment.metrics = None
                        assignment.ai_report = ""
                        assignment.save(update_fields=[
                            "status", "assigned_at", "completed_at", "answers", "metrics", "ai_report"
                        ])

                    if send_emails:
                        assignment_link = f"{origin}/dynamic-test?assignment={assignment.id}"
                        context = {
                            "firstName": getattr(employee, "first_name", "") or "Employee",
                            "templateName": template.name,
                            "assignmentLink": assignment_link,
                        }

                        subject = Template(email_template.subject).render(Context(context))
                        html_body = Template(email_template.body).render(Context(context))

                        email_msg = EmailMultiAlternatives(
                            subject=subject,
                            body="Please view this email in HTML format.",
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            to=[recipient_email],
                        )
                        email_msg.attach_alternative(html_body, "text/html")
                        try:
                            email_msg.send()
                        except Exception as e:
                            errors.append(f"Failed sending to {recipient_email}: {str(e)}")
                            print(f"❌ Email error for {recipient_email}: {str(e)}")
                            continue

                    assigned_count += 1
                except Exception as e:
                    errors.append(f"Failed for {recipient_email}: {str(e)}")

        return Response({
            "message": f"Processed {assigned_count} assignments.",
            "errors": errors,
        })


from rest_framework import generics, permissions
from .models import CandidateAssignment
from .serializers import CandidateAssignmentSerializer

# CORRECT IMPORT: Import from accounts, not local .authentication
from accounts.authentication import CandidateTokenAuthentication 

class CandidateAssignmentDetailView(generics.RetrieveAPIView):
    lookup_field = 'token'
    queryset = CandidateAssignment.objects.all()
    serializer_class = CandidateAssignmentSerializer
    authentication_classes = [CandidateTokenAuthentication]
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        token_from_url = self.kwargs.get("token")
        
        # Add safety check for 'undefined' string hitting the backend
        if token_from_url == "undefined":
             raise CandidateAssignment.DoesNotExist
             
        try:
            assignment = CandidateAssignment.objects.get(token=token_from_url)
            # Enforce expiry
            expiry_hours = getattr(settings, "CANDIDATE_TOKEN_EXPIRY_HOURS", 24)
            if assignment.assigned_at and timezone.now() > assignment.assigned_at + timedelta(hours=expiry_hours):
                raise TokenExpired()
            return assignment
        except CandidateAssignment.DoesNotExist:
            raise


# assessments/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication

# ✅ Import Auth & Models
from accounts.authentication import CandidateTokenAuthentication
from accounts.models import Recruitee
from .models import Assignment, CandidateAssignment

class SubmitAnswersView(APIView):
    """
    Hybrid Submit View: 
    - Handles Employees (Session Auth -> Assignment Model)
    - Handles Candidates (Token Auth -> CandidateAssignment Model)
    - Properly saves answers, metrics, and ai_report to respective fields
    """
    authentication_classes = [
        CandidateTokenAuthentication,  # for candidates
        JWTAuthentication,             # for HR JWT tokens
        SessionAuthentication          # optional if using Django sessions
    ]
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        assignment = None
        
        # -------------------------------------------------------
        # 🔍 STEP 1: Find the Assignment (Candidate vs Employee)
        # -------------------------------------------------------
        try:
            # Case A: Candidate
            if isinstance(request.user, Recruitee):
                assignment = CandidateAssignment.objects.get(id=pk, recruitee=request.user)
            
            # Case B: Employee (HR/User)
            elif request.user.is_authenticated:
                assignment = Assignment.objects.get(id=pk, employee=request.user)
            
            # Case C: Unauthorized
            else:
                return Response({"detail": "Authentication credentials were not provided."}, status=401)
                
        except (Assignment.DoesNotExist, CandidateAssignment.DoesNotExist):
            return Response({"detail": "Assessment not found or access denied."}, status=404)

        # If candidate using token, enforce assignment expiry here as well
        try:
            from django.conf import settings as _settings
            expiry_hours = getattr(_settings, "CANDIDATE_TOKEN_EXPIRY_HOURS", 24)
            if isinstance(request.user, Recruitee) and hasattr(assignment, 'assigned_at') and assignment.assigned_at:
                if timezone.now() > assignment.assigned_at + timedelta(hours=expiry_hours):
                    return Response({"detail": "Candidate link expired."}, status=410)
        except Exception:
            # Non-fatal: if something goes wrong with expiry check, continue and let other checks handle it
            pass

        # -------------------------------------------------------
        # 💾 STEP 2: Save the Data
        # -------------------------------------------------------
        try:
            # Check if already done (optional)
            if assignment.status == "COMPLETED" and not request.data.get("overwrite"):
                return Response({"detail": "Assessment already submitted."}, status=400)

            # Extract data from request
            answers = request.data.get("answers", {})
            metrics = request.data.get("metrics")
            ai_report = request.data.get("ai_report", "")

            # If metrics not provided by frontend, compute them on backend
            if metrics is None and answers:
                from .serializers import compute_metrics_for_template
                template_code = assignment.template.code if hasattr(assignment, 'template') else None
                if template_code:
                    try:
                        metrics = compute_metrics_for_template(template_code, answers)
                    except Exception as e:
                        logger.error(f"Failed to compute metrics for {template_code}: {e}")
                        metrics = {}

            # Save to Assignment/CandidateAssignment fields
            assignment.answers = answers
            assignment.metrics = metrics or {}
            assignment.ai_report = ai_report
            assignment.status = "COMPLETED"
            assignment.completed_at = timezone.now()
            assignment.save()

            logger.info(f"✅ SUBMIT SUCCESS: Assessment {pk} for {request.user} ({assignment.template.code})")
            return Response({
                "status": "COMPLETED", 
                "detail": "Submission successful.",
                "assignment_id": assignment.id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"❌ SUBMIT ERROR for assignment {pk}: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# assessments/views.py
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from .models import CandidateAssignment
from .serializers import CandidateAssignmentSerializer

class CandidateAssignmentByTokenView(RetrieveAPIView):
    serializer_class = CandidateAssignmentSerializer
    permission_classes = [AllowAny]
    lookup_field = "token"

    def get_queryset(self):
        return CandidateAssignment.objects.select_related(
            "template",
            "recruitee"
        )
    
# assessments/views.py
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CandidateAssignment
from .serializers import CandidateAssignmentSerializer

class CandidateAssignmentByTokenView(RetrieveAPIView):
    serializer_class = CandidateAssignmentSerializer
    permission_classes = [AllowAny]
    lookup_field = "token"

    def get_queryset(self):
        return CandidateAssignment.objects.select_related(
            "template",
            "recruitee"
        )

# NEW VIEW: Get all assignments for a specific candidate
class CandidateAssignmentsListView(ListAPIView):
    serializer_class = CandidateAssignmentSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users (admins) can view
    
    def get_queryset(self):
        candidate_id = self.kwargs.get('candidate_id')
        return CandidateAssignment.objects.filter(
            recruitee_id=candidate_id
        ).select_related('template', 'recruitee').order_by('-assigned_at')
