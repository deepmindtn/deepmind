import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Brain,
  AlertCircle
} from "lucide-react";

// Minimal styling for simple standalone execution
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "'Inter', sans-serif"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    padding: "2rem"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
    borderBottom: "2px solid #f3f4f6",
    paddingBottom: "1rem"
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#111827",
    margin: 0
  },
  progressContainer: {
    marginBottom: "2rem"
  },
  progressBar: {
    height: "0.5rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "1rem",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366f1",
    transition: "width 0.3s ease"
  },
  progressText: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "0.5rem",
    textAlign: "right"
  },
  question: {
    fontSize: "1.25rem",
    color: "#1f2937",
    marginBottom: "1.5rem",
    fontWeight: "500"
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginBottom: "2rem"
  },
  optionBtn: (selected) => ({
    padding: "1rem 1.5rem",
    textAlign: "left",
    backgroundColor: selected ? "#e0e7ff" : "#f9fafb",
    border: `2px solid ${selected ? "#6366f1" : "transparent"}`,
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "1rem",
    color: selected ? "#3730a3" : "#4b5563",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }),
  navButtons: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "2rem",
    paddingTop: "1rem",
    borderTop: "1px solid #f3f4f6"
  },
  btnPrimary: {
    backgroundColor: "#6366f1",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  btnSecondary: {
    backgroundColor: "white",
    color: "#4b5563",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    border: "1px solid #d1d5db",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: "not-allowed"
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
    gap: "1rem"
  }
};

const DynamicTest = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignment, setAssignment] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getFetchConfig = useCallback(() => {
    if (isCandidate) {
      return {
        url: `${API_BASE}/api/assessments/candidate/${candidateToken}/`,
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Token": candidateToken
        }
      };
    } else {
      return {
        url: `${API_BASE}/api/assessments/${assignmentId}/`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hrToken}`
        }
      };
    }
  }, [API_BASE, candidateToken, hrToken, isCandidate, assignmentId]);

  const fetchAssignment = useCallback(async () => {
    try {
      if (!assignmentId) {
        throw new Error("Missing assignment context.");
      }
      setLoading(true);
      const config = getFetchConfig();
      const response = await fetch(config.url, { headers: config.headers });
      
      if (!response.ok) {
        if (response.status === 410) {
           throw new Error("This assessment link has expired.");
        }
        throw new Error("Failed to load assessment.");
      }
      
      const data = await response.json();
      setAssignment(data);

      // Parse questions from template
      const questionPayload = data?.template?.questions ?? data?.template_questions ?? data?.questions;
      if (questionPayload) {
        let qList = questionPayload;
        if (typeof qList === "string") {
            try { qList = JSON.parse(qList); } catch (e) { console.error(e); }
        }

        // Structure check: If questions is object with multiple arrays, take first matching
        if (!Array.isArray(qList) && qList?.questions) {
            qList = qList.questions;
        }

        setQuestions(Array.isArray(qList) ? qList : []);
      }
      
      if (data?.answers) {
         setAnswers(data.answers);
      }

      if (String(data?.status || "").toLowerCase() === "completed") {
         setIsSubmitted(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId, getFetchConfig]);

  useEffect(() => {
    fetchAssignment();
  }, [fetchAssignment]);

  const handleSelectOption = (value) => {
    setAnswers({
      ...answers,
      [currentIdx]: value
    });
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (!assignmentId) {
        throw new Error("Missing assignment id.");
      }
      const config = getFetchConfig();

      const metrics = { completed_questions: Object.keys(answers).length, total_questions: questions.length };

      // Attempt to generate report if HR is reviewing or bypass
      let reportObj = { summary: "Dynamic Test completed." };

      try {
          const reportRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/generate-report/`, {
            method: "POST",
            headers: config.headers,
            body: JSON.stringify({ answers, metrics }),
          });
          if (reportRes.ok) {
              reportObj = await reportRes.json();
          }
      } catch (err) {
          console.warn("Failed generating report inline", err);
      }

      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
           answers,
           metrics,
           ai_report: JSON.stringify(reportObj),
           overwrite: true
        }),
      });

      if (submitRes.status === 410 || submitRes.status === 403 || submitRes.status === 401) {
          throw new Error("Cannot submit. Your 24-hour limit has expired or is invalid.");
      }

      if (!submitRes.ok) {
          throw new Error("Failed to submit assessment.");
      }

      setIsSubmitted(true);
    } catch (err) {
      alert(err.message || "Error submitting test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-gray-500">Loading Assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centered}>
        <AlertCircle className="text-red-500" size={48} />
        <h2 className="text-xl font-bold">Error Loading Test</h2>
        <p className="text-gray-500">{error}</p>
        <button onClick={() => navigate(-1)} style={styles.btnSecondary} className="mt-4">
          Go Back
        </button>
      </div>
    );
  }
  
  if (isSubmitted) {
      return (
        <div style={styles.centered}>
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <CheckCircle2 className="text-green-600" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Assessment Complete!</h2>
          <p className="text-gray-500 text-center max-w-md">
            Thank you for completing the {assignment?.template?.name || "Dynamic Assessment"}. 
            Your responses have been successfully recorded. You may now close this window.
          </p>
        </div>
      );
  }

  if (questions.length === 0) {
      return (
        <div style={styles.centered}>
          <AlertCircle className="text-yellow-500" size={48} />
          <h2 className="text-xl font-bold">No Questions Found</h2>
          <p className="text-gray-500">The template is valid but content is currently empty.</p>
        </div>
      );
  }

  const currentQ = questions[currentIdx];
  const qOptions = Array.isArray(currentQ?.options) ? currentQ.options : [];
  const selectedAnswer = answers[currentIdx];
  const progressPercent = ((currentIdx) / questions.length) * 100;
  const isLast = currentIdx === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Brain size={32} color="#6366f1" />
          <div>
            <h1 style={styles.title}>{assignment?.template?.name || "Skill Assessment"}</h1>
            <p className="text-gray-500 text-sm m-0">Question {currentIdx + 1} of {questions.length}</p>
          </div>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${progressPercent}%`}}></div>
          </div>
          <p style={styles.progressText}>{Math.round(progressPercent)}% completed</p>
        </div>

        <div>
          <h2 style={styles.question}>{currentQ?.text || currentQ?.question || "Question Text Missing"}</h2>

          <div style={styles.optionsList}>
            {qOptions.length > 0 ? (
              qOptions.map((opt, i) => {
                const optVal = typeof opt === "object" ? (opt?.id || opt?.value || opt?.text) : opt;
                const optDisplay = typeof opt === "object" ? (opt?.text || opt?.label || optVal) : opt;
                const isSelected = selectedAnswer === optVal;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(optVal)}
                    style={styles.optionBtn(isSelected)}
                  >
                    <span>{optDisplay}</span>
                    {isSelected && <CheckCircle2 size={20} color="#6366f1" />}
                  </button>
                );
              })
            ) : (
              <textarea
                value={selectedAnswer || ""}
                onChange={(e) => handleSelectOption(e.target.value)}
                placeholder="Type your answer here..."
                style={{
                  width: "100%",
                  minHeight: "140px",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  resize: "vertical"
                }}
              />
            )}
          </div>
        </div>

        <div style={styles.navButtons}>
          <button 
            style={{...styles.btnSecondary, ...(currentIdx === 0 ? styles.disabledBtn : {})}}
            onClick={handlePrev}
            disabled={currentIdx === 0}
          >
            <ArrowLeft size={18} /> Previous
          </button>
          
          {!isLast ? (
            <button
              style={{...styles.btnPrimary, ...(!selectedAnswer ? styles.disabledBtn : {})}}
              onClick={handleNext}
              disabled={!selectedAnswer}
            >
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button
              style={{...styles.btnPrimary, ...((!allAnswered || isSubmitting) ? styles.disabledBtn : {backgroundColor: "#10b981"})}}
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin"/> Submitting...</>
              ) : (
                <><CheckCircle2 size={18} /> Submit Assessment</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicTest;
