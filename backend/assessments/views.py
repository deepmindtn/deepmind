from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Assignment
from .serializers import (
    AssignRequestSerializer,
    AssignmentListItemSerializer,
    AssignmentDetailSerializer,
    SubmitAnswersSerializer,
)


class AssignAssessmentView(generics.CreateAPIView):
    """
    HR: POST { "employee_email": "...", "template_code": "BIG_FIVE" }
    """
    serializer_class = AssignRequestSerializer
    permission_classes = [permissions.IsAuthenticated]


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


class SubmitAnswersView(generics.GenericAPIView):
    
    """
    Employee: POST /api/assessments/<id>/submit/  { "answers": {...} }
    """
    serializer_class = SubmitAnswersSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        assignment = get_object_or_404(Assignment, pk=pk, employee=request.user)
        if assignment.status == Assignment.Status.COMPLETED:
            return Response({"detail": "Already submitted."}, status=status.HTTP_400_BAD_REQUEST)
        s = self.get_serializer(data=request.data, context={"assignment": assignment})
        s.is_valid(raise_exception=True)
        a = s.save()
        return Response(AssignmentDetailSerializer(a).data, status=status.HTTP_200_OK)
# assessments/views.py
from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from .models import Assignment
from .serializers import SubmitAnswersSerializer, AssignmentDetailSerializer

class SubmitAnswersView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SubmitAnswersSerializer

    def get_serializer_context(self):
        a = get_object_or_404(Assignment, pk=self.kwargs["pk"], employee=self.request.user)
        return {"assignment": a, **super().get_serializer_context()}

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
class SubmitAnswersView(generics.CreateAPIView):
    """
    POST answers (and optional metrics/ai_report). Marks assignment as COMPLETED.
    Uses serializer validation to block double submit.
    """
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
        return ctx

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
from langchain_community.vectorstores import FAISS
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
import os
from dotenv import load_dotenv
from assessments.models import Assignment  # adjust to your app
from django.conf import settings
load_dotenv()

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

        vectorstore = FAISS.load_local(index_path, OpenAIEmbeddings(api_key="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"),allow_dangerous_deserialization=True)
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5,api_key="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")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        # Build the prompt
        prompt = f"""
        You are a senior HR consultant. Based on the psychological assessment data below, generate a comprehensive decision-support report for HR leadership.

        Objective:
        Provide strategic insights and concrete recommendations to help the HR department understand employees' psychological profiles and take action to improve well-being, engagement, and performance. (no markdown marks no * just paragraphs)

        ## Assessment Data:
        {assessment_data}

        ## Guidelines:
        1. **Summarize Key Trends**:
        - Overall mental health state of the organization.
        - Distribution across assessment types (BIG_FIVE, KARASEK, MASLACH).
        - Detect patterns like high stress, burnout, lack of motivation, etc.

        2. **Deep Analysis**:
        - Highlight at-risk individuals or groups.
        - Cross-compare assessments if possible (e.g. stress + low agreeableness).

        3. **Actionable Recommendations**:
        - Tailored advice for HR: trainings, coaching, reorganization.
        - Burnout prevention and mental wellness initiatives.
        - Cultural or leadership improvements.
        - Suggestions per department if relevant.

        4. **Reference Best Practices**:
        - Mention key psychological models from the uploaded knowledge PDFs.
        - Justify suggestions using evidence from known psychological research.

        5. **Tone**:
        - Use clear, supportive language.
        - Structure the report with headings and paragraphs.
        - Write in a way suitable to be shared directly with HR leadership.

        End the report with a **next-step checklist** for HR.(no markdown marks)
        """


        result = chain.run(prompt)
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
from django.conf import settings
from .models import Assignment
from langchain.chains import RetrievalQA
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
import os

class GenerateBigFiveReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(id=assignment_id)

            assessment_data = {
                "employee": str(assignment.employee),
                "template": assignment.template.code,
                "status": assignment.status,
                "score": assignment.metrics,
            }

            index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "bigfiveindex")
            vectorstore = FAISS.load_local(
                index_path,
                OpenAIEmbeddings(api_key="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"),
                allow_dangerous_deserialization=True
            )
            retriever = vectorstore.as_retriever()
            llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="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")
            chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

            prompt = f"""
            You are a workplace psychologist. Generate a detailed Big Five psychometric profile report for the following employee based on their score (0–100 per trait and facet).
            
            ## Data:
            {assessment_data}

            ## Instructions:
            - Start with a short summary
            - Provide deep insights per trait
            - Highlight strong/weak facets
            - List strengths and risks (as bullets)
            - End with tailored action points (habits, work style, coaching ideas)

            Use a professional and supportive tone. Format with clear paragraphs.(no markdown marks)
            """

            result = chain.run(prompt)
            print(result)
            return Response({"report": result})
        except Assignment.DoesNotExist:
            return Response({"error": "Assignment not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class GenerateKarasekReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(id=assignment_id, employee=request.user)
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": assignment.metrics,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "karasekindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="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"),
            allow_dangerous_deserialization=True
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5,api_key="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")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a senior psychologist. Based on the following Karasek assessment results, write a professional report for the employee.

        ## Assessment Data:
        {assessment_data}

        ## Guidelines:
        - Summarize the psychological demands, decision latitude, and social support.
        - Interpret the quadrant (low strain, high strain, active, passive).
        - Offer clear, concrete suggestions for the employee to improve well-being or manage stress.
        - Justify insights with reference to known psychological theories and the uploaded PDFs.
        - Use structured paragraphs, professional tone, avoid clinical jargon.

        End the report with 3 actionable suggestions.(no markdown marks)
        """

        result = chain.run(prompt)
        return Response({"report": result})

class GenerateMaslachReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(id=assignment_id, employee=request.user)
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": assignment.metrics,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "maslachindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="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"),
            allow_dangerous_deserialization=True
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5,api_key="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")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a senior psychologist. Based on the following maslach assessment results, write a professional report for the employee.

        ## Assessment Data:
        {assessment_data}

        ## Guidelines:
        - Summarize the psychological demands, decision latitude, and social support.
        - Interpret the quadrant .
        - Offer clear, concrete suggestions for the employee to improve well-being or manage stress.
        - Justify insights with reference to known psychological theories and the uploaded PDFs.
        - Use structured paragraphs, professional tone, avoid clinical jargon.

        End the report with 3 actionable suggestions.(no markdown marks)
        """

        result = chain.run(prompt)
        return Response({"report": result})
    
class GenerateDiscReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # Try to take metrics from request body first
        metrics = request.data.get("metrics")
        if not metrics:
            # fallback to assignment.metrics
            metrics = assignment.metrics

        if not metrics:
            return Response({"error": "No DISC metrics provided or stored."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "discindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(
                api_key="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"
            ),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.5,
            api_key="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",
        )
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        print("DISC assessment data:", assessment_data)

        prompt = f"""
        You are a workplace psychologist. Based on the following DISC assessment results, write a professional decision-support report for the employee.

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Begin with a short overview of the employee’s dominant DISC traits (Dominance, Influence, Steadiness, Conscientiousness).
        - Explain the implications of their profile for workplace behavior, communication, and teamwork.
        - Highlight strengths (3–4 points).
        - Highlight potential challenges or blind spots (2–3 points).
        - Provide 3–5 practical recommendations for personal development and better collaboration at work.
        - Ground insights in recognized DISC theory and the uploaded reference PDFs.
        - Use a supportive, professional, and constructive tone.
        - Do not use markdown or bullet symbols, write in structured paragraphs.
        - End the report with exactly 3 clear, actionable suggestions.
        """

        result = chain.run(prompt)
        return Response({"report": result})
    

class GenerateJssReportView(APIView):
    permission_classes = [IsAuthenticated]

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

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
        }

        # Charger l’index FAISS
        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "jssindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="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"),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="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")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are an organizational psychologist. Based on the following Job Satisfaction Survey (JSS) results, 
        write a professional report for the employee it needs to be report not letter and no markdowns .

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Explain the global score (36–216) and what it reflects about overall satisfaction.
        - Go through each of the 9 dimensions (Rémunération, Avantages sociaux, Promotion, Supervision, Conditions de travail,
          Relations avec collègues, Nature du travail, Politiques organisationnelles, Communication).
        - For each dimension, interpret the score according to the interpretation scale:
          19–24: Very high satisfaction
          14–18: Moderate satisfaction
          9–13: Low satisfaction
          4–8: Very low satisfaction
        - Highlight the strongest dimensions (strengths).
        - Highlight the weakest dimensions (areas for improvement).
        - Provide 4–5 concrete recommendations to improve satisfaction at work.
        - Keep a supportive, professional tone.
        - Do not use markdown or bullet symbols, write in clear structured paragraphs.
        - End with a concise summary of key next steps.
        """

        result = chain.run(prompt)

        # Sauvegarder dans l’assignment
        assignment.ai_report = result
        assignment.save(update_fields=["ai_report"])

        return Response({"report": result})
    
class GenerateBRSReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # take metrics/answers from body first, fallback to assignment
        metrics = request.data.get("metrics") or assignment.metrics
        answers = request.data.get("answers") or assignment.answers

        # ✅ FIX: validate on metrics, not assignment.metrics
        if not metrics or not metrics.get("average"):
            return Response({"error": "No BRS metrics found in request or assignment."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
            "answers": answers,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "brsindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="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"),  # replace with env variable ideally
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="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")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a workplace psychologist. Based on the following Brief Resilience Scale (BRS) results, 
        write a professional report for the employee it needs to be report not letter and no markdowns .    

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Summarize the resilience capacity of the employee.
        - Explain the implications for coping with stress and adaptation in the workplace.
        - Provide strengths and vulnerabilities related to resilience.
        - Provide 3–5 practical recommendations to improve resilience.
        - Use supportive and professional tone.
        - Do not use markdown or bullet symbols.
        - End the report with exactly 3 clear, actionable suggestions.
        """

        result = chain.run(prompt)
        return Response({"report": result})
class GenerateCDRISC10ReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        # Take metrics either from request or DB
        metrics = request.data.get("metrics") or assignment.metrics
        answers = request.data.get("answers") or assignment.answers

        if not metrics or "total" not in metrics:
            return Response({"error": "No CD-RISC 10 metrics found."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
            "answers": answers,
        }

        # Load the FAISS vectorstore
        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "cdriscindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="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"),
            allow_dangerous_deserialization=True,
        )

        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.5,
            api_key="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",
        )
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a workplace psychologist. Based on the following Connor-Davidson Resilience Scale (CD-RISC 10) results,
        write a professional and detailed report for the employee.

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Interpret the total resilience score (0–40) and explain its meaning.
        - Discuss the employee’s capacity to adapt to stress and adversity.
        - Highlight resilience strengths and possible areas for growth.
        - Provide 3–5 practical strategies to enhance resilience in workplace contexts.
        - Maintain a professional, clear, and supportive tone.
        - Do not use markdown symbols.
        - End the report with exactly 3 concrete, actionable suggestions.
        """

        result = chain.run(prompt)
        return Response({"report": result})
# ---------- WSES ----------
class GenerateWSESReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        answers = request.data.get("answers") or assignment.answers
        if not metrics or "average" not in metrics:
            return Response({"error": "No WSES metrics found."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
            "answers": answers,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "wsesindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="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"),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="sk-proj-...")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a workplace psychologist. Based on the following Work Self-Efficacy Scale (WSES) results,
        write a detailed professional report for the employee.

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Interpret the overall efficacy level.
        - Explain implications for confidence, problem-solving, and autonomy at work.
        - Identify strengths and development areas.
        - Provide 3–5 strategies to enhance work self-efficacy.
        - Professional, supportive tone. No markdown. End with 3 actionable suggestions.
        """
        result = chain.run(prompt)
        return Response({"report": result})


# ---------- GCOS-mini ----------
class GenerateGCOSReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        answers = request.data.get("answers") or assignment.answers
        if not metrics or "autonomous" not in metrics:
            return Response({"error": "No GCOS metrics found."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
            "answers": answers,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "gcosindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="sk-proj-..."),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="sk-proj-...")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a workplace psychologist. Based on the following General Causality Orientations Scale (GCOS-mini) results,
        write a professional motivation profile for the employee.

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Interpret the three orientations (autonomous, controlled, impersonal).
        - Discuss motivational tendencies and implications for work engagement.
        - Suggest how to leverage autonomy and manage extrinsic or amotivated aspects.
        - Provide 3–5 development actions to foster intrinsic motivation.
        - Supportive tone, structured paragraphs, no markdown.
        - End with 3 actionable suggestions.
        """
        result = chain.run(prompt)
        return Response({"report": result})


# ---------- RIBS ----------
class GenerateRIBSReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        answers = request.data.get("answers") or assignment.answers
        if not metrics or "average" not in metrics:
            return Response({"error": "No RIBS metrics found."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
            "answers": answers,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "ribsindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="sk-proj-..."),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="sk-proj-...")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a psychologist specializing in creativity and innovation.
        Based on the following Runco Ideational Behavior Scale (RIBS-SF) results,
        write a detailed professional report.

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Interpret the ideation level and creativity potential.
        - Discuss implications for innovation, problem-solving, and work adaptability.
        - Identify strengths and possible developmental opportunities.
        - Suggest 3–5 actionable strategies to enhance creative thinking at work.
        - Supportive tone, clear paragraphs, no markdown.
        - End with 3 actionable suggestions.
        """
        result = chain.run(prompt)
        return Response({"report": result})
# ---------- CAQ Report ----------
class GenerateCAQReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        answers = request.data.get("answers") or assignment.answers
        if not metrics or "total" not in metrics:
            return Response({"error": "No CAQ metrics found."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
            "answers": answers,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "caqindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="sk-proj-..."),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="sk-proj-...")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a psychologist specializing in creativity and innovation.
        Based on the following Creative Achievement Questionnaire (CAQ-SF) results,
        write a professional report.

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Summarize the overall creative achievement level.
        - Highlight the strongest creative domains (e.g., arts, science, design).
        - Discuss the implications for professional or academic creativity.
        - Provide 3–5 personalized recommendations for leveraging creative potential.
        - Maintain supportive tone. No markdown. End with 3 clear actionable suggestions.
        """
        result = chain.run(prompt)
        return Response({"report": result})


# ---------- ISE Report ----------
class GenerateISEReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.select_related("employee", "template").get(
                id=assignment_id, employee=request.user
            )
        except Assignment.DoesNotExist:
            return Response({"error": "Invalid or unauthorized assignment."}, status=404)

        metrics = request.data.get("metrics") or assignment.metrics
        answers = request.data.get("answers") or assignment.answers
        if not metrics or "average" not in metrics:
            return Response({"error": "No ISE metrics found."}, status=400)

        assessment_data = {
            "employee": str(assignment.employee),
            "template": assignment.template.code,
            "status": assignment.status,
            "score": metrics,
            "answers": answers,
        }

        index_path = os.path.join(settings.BASE_DIR, "assessments", "media", "iseindex")
        vectorstore = FAISS.load_local(
            index_path,
            OpenAIEmbeddings(api_key="sk-proj-..."),
            allow_dangerous_deserialization=True,
        )
        retriever = vectorstore.as_retriever()
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5, api_key="sk-proj-...")
        chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, chain_type="stuff")

        prompt = f"""
        You are a workplace psychologist. Based on the following Innovation Self-Efficacy Scale (ISE-SF) results,
        write a professional innovation-focused report.

        Assessment Data:
        {assessment_data}

        Guidelines:
        - Interpret the confidence level to innovate and apply creative ideas.
        - Explain implications for problem-solving, experimentation, and leadership.
        - Highlight strengths and development zones in innovation mindset.
        - Provide 3–5 practical recommendations to enhance innovation confidence.
        - Supportive, engaging tone. No markdown. End with 3 actionable suggestions.
        """
        result = chain.run(prompt)
        return Response({"report": result})
# recruitment/views.py
import os
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from PyPDF2 import PdfReader
from openai import OpenAI

client = OpenAI(api_key="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")

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
