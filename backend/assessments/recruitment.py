# recruitment/views.py
import os
from django.conf import settings
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

        # Initialize OpenAI client
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
