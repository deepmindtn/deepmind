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
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email

# ✅ RENAMED IMPORT TO AVOID CONFLICT
from rest_framework.response import Response as APIResponse 
from core.pagination import FixedPageSizePagination

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
    pagination_class = FixedPageSizePagination

    def paginate_queryset(self, queryset):
        all_records = (self.request.query_params.get("all") or "").strip().lower()
        if all_records in {"1", "true", "yes"}:
            return None
        return super().paginate_queryset(queryset)

    def get_queryset(self):
        queryset = User.objects.filter(company=self.request.user.company).order_by("-date_joined")

        q = (self.request.query_params.get("q") or "").strip()
        if q:
            queryset = queryset.filter(
                Q(first_name__icontains=q)
                | Q(last_name__icontains=q)
                | Q(email__icontains=q)
                | Q(role__icontains=q)
            )

        department = (self.request.query_params.get("department") or "").strip()
        if department and department.lower() != "all":
            queryset = queryset.filter(department__iexact=department)

        status_filter = (self.request.query_params.get("status") or "").strip().lower()
        status_filter = status_filter.replace("-", "_").replace(" ", "_")
        if status_filter and status_filter != "all":
            if status_filter == "active":
                queryset = queryset.filter(
                    Q(employment_status__iexact="active")
                    | Q(employment_status__isnull=True, is_active=True)
                )
            elif status_filter == "inactive":
                queryset = queryset.filter(
                    Q(employment_status__iexact="inactive")
                    | Q(employment_status__isnull=True, is_active=False)
                )
            elif status_filter == "on_leave":
                queryset = queryset.filter(employment_status__iexact="on_leave")

        return queryset

# --------------------------
# CSV Import View
# --------------------------
from django.template import Template, Context
from django.core.mail import EmailMultiAlternatives
from accounts.models import EmailTemplate

class ImportEmployeesView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated, IsHR]

    HEADER_ALIASES = {
        "email": {"email", "email address", "email_address"},
        "first_name": {"first name", "first_name", "firstname"},
        "last_name": {"last name", "last_name", "lastname"},
        "department": {"department", "dept", "team"},
    }

    def _normalize_header(self, value):
        return " ".join((value or "").strip().lower().replace("_", " ").split())

    def _resolve_headers(self, reader):
        fieldnames = reader.fieldnames or []
        resolved = {}
        normalized = {self._normalize_header(name): name for name in fieldnames}

        for logical_name, aliases in self.HEADER_ALIASES.items():
            for alias in aliases:
                original = normalized.get(self._normalize_header(alias))
                if original:
                    resolved[logical_name] = original
                    break
        return resolved

    def _resolve_department_id(self, company, raw_department):
        if not raw_department:
            return None

        normalized = str(raw_department).strip().lower()
        if not normalized:
            return None

        choice_to_label = {
            choice: label.lower() for choice, label in User.Departments.choices
        }
        label_to_choice = {
            label.lower(): choice for choice, label in User.Departments.choices
        }

        choice_value = None
        if normalized in choice_to_label:
            choice_value = normalized
        elif normalized in label_to_choice:
            choice_value = label_to_choice[normalized]

        department_obj = None
        if choice_value:
            department_obj = Department.objects.filter(
                company=company,
                name__iexact=choice_to_label[choice_value],
            ).first()

        if department_obj:
            return department_obj.id

        department_obj = Department.objects.filter(company=company, name__iexact=str(raw_department).strip()).first()
        if department_obj:
            return department_obj.id

        return None

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
            if not decoded_file:
                return APIResponse(
                    {"error": "CSV file is empty."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reader = csv.DictReader(decoded_file)
            if not reader.fieldnames:
                return APIResponse(
                    {"error": "CSV is missing header row."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reader.fieldnames = [(h or "").strip() for h in reader.fieldnames]
            resolved_headers = self._resolve_headers(reader)
        except Exception as e:
            return APIResponse(
                {"error": f"CSV Read Error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "email" not in resolved_headers:
            return APIResponse(
                {
                    "error": "CSV must include an email column (accepted headers: Email Address, Email)."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        origin = request.META.get("HTTP_ORIGIN") or settings.FRONTEND_URL
        base_url = f"{origin}/accept-invite"

        added_count = 0
        email_sent_count = 0
        errors = []
        warnings = []
        processed_rows = 0

        # -------------------------
        # Load email template ONCE
        # -------------------------
        email_template = None
        try:
            email_template = EmailTemplate.objects.get(
                name="Welcome Email",
                audience_type="employee",
                status="active",
            )
        except EmailTemplate.DoesNotExist:
            warnings.append("Welcome Email template not found or inactive. Invites were created without sending emails.")

        # -------------------------
        # Process CSV rows
        # -------------------------
        for index, row in enumerate(reader, start=2):
            processed_rows += 1
            email = str(row.get(resolved_headers.get("email", ""), "") or "").strip().lower()
            first_name = str(row.get(resolved_headers.get("first_name", ""), "") or "").strip()
            last_name = str(row.get(resolved_headers.get("last_name", ""), "") or "").strip()
            raw_dept = str(row.get(resolved_headers.get("department", ""), "") or "").strip()

            if not email:
                errors.append(f"Row {index}: Missing email.")
                continue

            try:
                validate_email(email)
            except DjangoValidationError:
                errors.append(f"Row {index}: Invalid email '{email}'.")
                continue

            if User.objects.filter(email__iexact=email).exists():
                errors.append(f"Row {index}: Skipped {email} (user already registered).")
                continue

            if Invite.objects.filter(email__iexact=email, company=request.user.company, is_accepted=False).exists():
                errors.append(f"Row {index}: Skipped {email} (invite already pending).")
                continue

            department_id = self._resolve_department_id(request.user.company, raw_dept)
            if raw_dept and not department_id:
                errors.append(
                    f"Row {index}: Unknown department '{raw_dept}' for {email}. Create that department first or leave department blank."
                )
                continue

            invite_data = {
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
            }
            if department_id:
                invite_data["department_id"] = department_id

            serializer = InviteCreateSerializer(
                data=invite_data,
                context={"request": request},
            )

            if not serializer.is_valid():
                err_msg = "; ".join(
                    [f"{k}: {v[0]}" for k, v in serializer.errors.items()]
                )
                errors.append(f"Row {index}: Skipped {email} ({err_msg})")
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

                if email_template:
                    subject, html_body = render_email_subject_and_body(email_template, context)

                # -------------------------
                # Send email
                # -------------------------
                if email_template:
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
                        email_sent_count += 1
                    except Exception as email_error:
                        errors.append(
                            f"Row {index}: Created invite for {email} but failed to send email ({email_error})."
                        )
                else:
                    warnings.append(f"Invite created for {email}, but no welcome email template is active.")

            except Exception as e:
                errors.append(f"Row {index}: DB error for {email} ({str(e)})")

        if processed_rows == 0:
            return APIResponse(
                {"error": "CSV does not contain any data rows."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return APIResponse(
            {
                "message": f"Successfully created {added_count} invites.",
                "processed_rows": processed_rows,
                "emails_sent": email_sent_count,
                "errors": errors,
                "warnings": warnings,
            },
            status=status.HTTP_201_CREATED if added_count > 0 else status.HTTP_400_BAD_REQUEST,
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


class SurveyQuestionExtractionView(APIView):
    """Extract survey questions from uploaded files for manual survey creation."""
    permission_classes = [permissions.IsAuthenticated, IsHR]
    parser_classes = [MultiPartParser, FormParser]

    MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB

    @staticmethod
    def _clean_question_text(value):
        import re

        text = str(value or "").strip()
        if not text:
            return ""

        text = re.sub(r"^\s*(?:q(?:uestion)?\s*)?\d+[\.)\-:]\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"^\s*[\-*•]\s*", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @classmethod
    def _extract_questions_from_text(cls, text):
        import re

        normalized = (text or "").replace("\r\n", "\n").replace("\r", "\n")
        if not normalized.strip():
            return [], ["No readable text content was detected in the uploaded file."]

        numbered_pattern = re.compile(r"^\s*(?:q(?:uestion)?\s*)?(?:\d+|[a-zA-Z])[\.)\-:]\s+(.+)\s*$", re.IGNORECASE)
        inline_number_marker = re.compile(
            r"(?i)(?<!\w)(?:q(?:uestion)?\s*)?(?:\d{1,3}|[a-zA-Z])[\.)\-:]\s+"
        )
        question_word_pattern = re.compile(r"^\s*q(?:uestion)?\s*\d*\s*[:\-]?\s*(.+)$", re.IGNORECASE)

        questions = []
        seen = set()
        current_parts = []
        found_numbered = False

        def explode_inline_numbered(content):
            chunks = []
            for raw_line in content.split("\n"):
                line = (raw_line or "").strip()
                if not line:
                    chunks.append(("", False))
                    continue

                markers = list(inline_number_marker.finditer(line))
                if not markers:
                    chunks.append((line, False))
                    continue

                # If numbering appears inline in one line (common in some PDFs), split by markers.
                if len(markers) > 1 or markers[0].start() == 0:
                    prefix = line[:markers[0].start()].strip()
                    if prefix:
                        chunks.append((prefix, False))

                    for idx, marker in enumerate(markers):
                        start = marker.end()
                        end = markers[idx + 1].start() if idx + 1 < len(markers) else len(line)
                        candidate = line[start:end].strip()
                        if candidate:
                            chunks.append((candidate, True))
                    continue

                chunks.append((line, False))

            return chunks

        def push_current():
            if not current_parts:
                return
            candidate = cls._clean_question_text(" ".join(current_parts))
            current_parts.clear()
            if len(candidate) < 5:
                return
            lowered = candidate.lower()
            if lowered in seen:
                return
            seen.add(lowered)
            questions.append(candidate)

        for line, is_explicit_numbered in explode_inline_numbered(normalized):

            if not line:
                push_current()
                continue

            if is_explicit_numbered:
                found_numbered = True
                push_current()
                current_parts.append(line)
                continue

            numbered_match = numbered_pattern.match(line)
            if numbered_match:
                found_numbered = True
                push_current()
                current_parts.append(numbered_match.group(1).strip())
                continue

            question_match = question_word_pattern.match(line)
            if question_match and question_match.group(1).strip():
                push_current()
                current_parts.append(question_match.group(1).strip())
                continue

            if current_parts:
                current_parts.append(line)
            else:
                # Fallback: treat likely full-sentence prompts as standalone candidates.
                if line.endswith("?") or len(line.split()) >= 7:
                    current_parts.append(line)

        push_current()

        if len(questions) < 2:
            # Fallback: break compact one-line question lists by '?' boundaries.
            compact_sentences = [
                s.strip()
                for s in re.split(r"(?<=[\?])\s+", re.sub(r"\s+", " ", normalized).strip())
                if s.strip()
            ]
            for sentence in compact_sentences:
                if "?" not in sentence:
                    continue
                candidate = cls._clean_question_text(sentence)
                lowered = candidate.lower()
                if len(candidate) >= 5 and lowered not in seen:
                    seen.add(lowered)
                    questions.append(candidate)

        if len(questions) < 2:
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", normalized) if p.strip()]
            for p in paragraphs:
                candidate = cls._clean_question_text(p)
                lowered = candidate.lower()
                if len(candidate) >= 5 and lowered not in seen:
                    seen.add(lowered)
                    questions.append(candidate)

        # Normalize merged entries like "Q1? Q2? Q3?" into separate questions.
        normalized_questions = []
        normalized_seen = set()
        for item in questions:
            candidate = cls._clean_question_text(item)
            fragments = [candidate]
            if candidate.count("?") > 1:
                fragments = [
                    cls._clean_question_text(fragment)
                    for fragment in re.split(r"(?<=[\?])\s+", candidate)
                    if fragment.strip()
                ]

            for fragment in fragments:
                if len(fragment) < 5:
                    continue
                lowered = fragment.lower()
                if lowered in normalized_seen:
                    continue
                normalized_seen.add(lowered)
                normalized_questions.append(fragment)

        questions = normalized_questions

        warnings = []
        if not found_numbered:
            warnings.append(
                "Numbered markers were not consistently detected. For best accuracy use 1., 1) or 1- and leave a blank line between questions."
            )

        if len(questions) == 0:
            warnings.append(
                "No questions could be detected automatically. Try a cleaner text-based file with one question per line/paragraph."
            )

        return questions[:250], warnings

    @classmethod
    def _extract_text_payload(cls, file_name, file_bytes):
        import csv as csv_module
        import io
        import json
        import re
        import xml.etree.ElementTree as ET
        import zipfile

        warnings = []
        extension = (file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "")

        def collect_question_strings(payload, bucket):
            if isinstance(payload, str):
                candidate = payload.strip()
                if candidate:
                    bucket.append(candidate)
                return

            if isinstance(payload, dict):
                preferred_keys = (
                    "question",
                    "question_text",
                    "text",
                    "prompt",
                    "title",
                    "content",
                )
                captured = False
                for key in preferred_keys:
                    value = payload.get(key)
                    if isinstance(value, str) and value.strip():
                        bucket.append(value.strip())
                        captured = True

                if captured:
                    return

                for value in payload.values():
                    collect_question_strings(value, bucket)
                return

            if isinstance(payload, list):
                for item in payload:
                    collect_question_strings(item, bucket)

        def decode_text(raw_bytes):
            for encoding in ("utf-8", "utf-8-sig", "latin-1"):
                try:
                    return raw_bytes.decode(encoding)
                except Exception:
                    continue
            return raw_bytes.decode("utf-8", errors="ignore")

        if extension == "json":
            text = decode_text(file_bytes)
            data = json.loads(text)
            rows = []
            collect_question_strings(data, rows)

            payload = "\n\n".join([str(r).strip() for r in rows if str(r).strip()])
            return payload, warnings

        if extension in {"jsonl", "ndjson"}:
            text = decode_text(file_bytes)
            rows = []
            for line in text.splitlines():
                candidate = (line or "").strip()
                if not candidate:
                    continue
                try:
                    data = json.loads(candidate)
                    collect_question_strings(data, rows)
                except Exception:
                    # Some JSONL files may be plain text lines instead of JSON objects.
                    rows.append(candidate)

            payload = "\n\n".join([str(r).strip() for r in rows if str(r).strip()])
            return payload, warnings

        if extension in {"csv", "tsv"}:
            text = decode_text(file_bytes)
            stream = io.StringIO(text)
            sample = text[:2048]
            if extension == "tsv":
                delimiter = "\t"
            else:
                try:
                    dialect = csv_module.Sniffer().sniff(sample)
                    delimiter = dialect.delimiter
                except Exception:
                    delimiter = ","

            reader = csv_module.reader(stream, delimiter=delimiter)
            rows = list(reader)
            if not rows:
                return "", ["CSV appears empty."]

            headers = [str(h or "").strip().lower() for h in rows[0]]
            question_idx = next(
                (
                    idx
                    for idx, h in enumerate(headers)
                    if any(keyword in h for keyword in ("question", "text", "prompt", "title", "content"))
                ),
                0,
            )

            extracted = []
            for row in rows[1:]:
                if not row:
                    continue
                value = row[question_idx] if question_idx < len(row) else row[0]
                value = str(value or "").strip().strip('"')
                if value:
                    extracted.append(value)

            return "\n\n".join(extracted), warnings

        if extension == "docx":
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as zf:
                if "word/document.xml" not in zf.namelist():
                    return "", ["DOCX structure is invalid (word/document.xml missing)."]
                xml_bytes = zf.read("word/document.xml")

            root = ET.fromstring(xml_bytes)
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            paragraphs = []
            for para in root.findall(".//w:body/w:p", ns):
                tokens = []
                for node in para.findall(".//w:t", ns):
                    if node.text:
                        tokens.append(node.text)
                paragraph_text = "".join(tokens).strip()
                if paragraph_text:
                    paragraphs.append(paragraph_text)

            if not paragraphs:
                warnings.append("No readable text found in DOCX paragraphs.")
            return "\n".join(paragraphs), warnings

        if extension == "pdf":
            from pypdf import PdfReader

            reader = PdfReader(io.BytesIO(file_bytes))
            pages = []
            for page in reader.pages:
                page_text = (page.extract_text() or "").strip()
                if page_text:
                    pages.append(page_text)

            payload = "\n\n".join(pages)
            # Reduce hard wraps introduced by PDF extraction while preserving paragraph breaks.
            payload = re.sub(r"(?<=\w)-\n(?=\w)", "", payload)
            payload = re.sub(r"(?<![\.!\?:])\n(?!\n)", " ", payload)
            payload = re.sub(r"\n{3,}", "\n\n", payload)
            readable_chars = len(re.sub(r"\s+", "", payload))
            if readable_chars < 60:
                warnings.append(
                    "PDF text seems hard to extract (possibly scanned/handwritten). For best results use a selectable digital text PDF."
                )
            return payload, warnings

        # Generic fallback for txt/md/unknown extensions.
        text = decode_text(file_bytes)
        printable = sum(1 for c in text if c.isprintable() or c.isspace())
        if text and printable / max(len(text), 1) < 0.65:
            warnings.append(
                "File appears mostly binary. Question extraction may be unreliable for this format."
            )
        return text, warnings

    def post(self, request):
        upload = request.FILES.get("file")
        if not upload:
            return APIResponse({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        if upload.size and upload.size > self.MAX_UPLOAD_SIZE:
            return APIResponse(
                {"detail": "File is too large. Maximum supported size is 10MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_name = str(getattr(upload, "name", "survey-upload")).strip() or "survey-upload"

        try:
            file_bytes = upload.read()
        except Exception:
            return APIResponse(
                {"detail": "Unable to read uploaded file."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not file_bytes:
            return APIResponse(
                {"detail": "Uploaded file is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            raw_text, source_warnings = self._extract_text_payload(file_name, file_bytes)
        except Exception as exc:
            return APIResponse(
                {"detail": f"Could not parse this file: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        questions, parse_warnings = self._extract_questions_from_text(raw_text)
        warnings = [*source_warnings, *parse_warnings]

        preferred_format_tips = [
            "Use a text-based file format when possible (.docx with typed text or a selectable-text PDF).",
            "Write each question as 1., 1) or 1- for best detection accuracy.",
            "Insert a blank line between questions.",
            "Avoid handwritten/scanned PDF documents unless OCR has already been applied.",
        ]

        if not questions:
            return APIResponse(
                {
                    "detail": "No questions could be extracted automatically.",
                    "questions": [],
                    "warnings": warnings,
                    "preferred_format_tips": preferred_format_tips,
                    "review_message": "Please review the questions before submission and edit them as needed.",
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return APIResponse(
            {
                "questions": [
                    {"id": idx + 1, "text": text}
                    for idx, text in enumerate(questions)
                ],
                "warnings": warnings,
                "preferred_format_tips": preferred_format_tips,
                "review_message": "Please review the questions before submission and edit them as needed.",
            },
            status=status.HTTP_200_OK,
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