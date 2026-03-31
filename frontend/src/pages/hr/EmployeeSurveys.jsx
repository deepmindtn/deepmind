import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  PlayCircle,
  Loader2,
  AlertCircle,
  X,
  Shield,
  User,
  ClipboardList,
  Inbox,
  Calendar,
  Brain,
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#10b981", // Indigo Hub Green
  success: "#10b981",
  warning: "#f59e0b",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
};

/* -----------------------
   CSS & Responsive Styles
----------------------- */
const responsiveStyles = `
  /* --- Desktop / Default Styles --- */
  .es-container {
    padding: 5px 14px;
    background-color: ${COLORS.bgMain};
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .main-wrapper {
    background-color: ${COLORS.cardBg};
    border-radius: 24px;
    border: 1px solid ${COLORS.borderColor};
    box-shadow: ${COLORS.shadowHuge};
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 40px);
    position: relative;
  }

  .hero-section {
    background: linear-gradient(135deg, ${COLORS.primary}1A 0%, ${COLORS.cardBg} 100%);
    padding: 48px;
    border-bottom: 1px solid ${COLORS.borderColor};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hero-content {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .hero-icon-box {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background-color: ${COLORS.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 10px 25px -5px ${COLORS.primary}60;
    color: #fff;
  }

  .content-body {
    flex: 1;
    padding: 40px;
    background-color: ${COLORS.bgMain};
  }

  .survey-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .survey-card {
    background-color: ${COLORS.cardBg};
    border-radius: 20px;
    padding: 24px;
    border: 1px solid ${COLORS.borderColor};
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    min-height: 200px;
  }

  .survey-card:hover {
    transform: translateY(-5px);
    border-color: ${COLORS.primary}60;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }

  /* --- Buttons --- */
  .btn-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    background: ${COLORS.primary};
    color: white;
    box-shadow: 0 4px 12px ${COLORS.primary}40;
    width: 100%;
  }

  .btn-primary:hover:not(:disabled) {
    transform: scale(1.02);
    opacity: 0.9;
  }

  .btn-primary:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* --- Modal Styles --- */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 50;
    padding: 20px;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background-color: ${COLORS.cardBg};
    width: 100%;
    max-width: 600px;
    border-radius: 20px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: slideIn 0.3s ease-out;
  }

  /* Animations */
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
  
  @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes toastSlide { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* --- Mobile / Responsive Overrides --- */
  @media (max-width: 768px) {
    .es-container {
      padding: 10px; /* Crucial for visible border radius */
    }

    .main-wrapper {
      border-radius: 24px;
      min-height: calc(100vh - 20px);
      border: 1px solid ${COLORS.borderColor};
    }

    .hero-section {
      flex-direction: column;
      align-items: flex-start;
      padding: 32px 24px;
      gap: 20px;
    }

    .hero-content {
      flex-direction: column;
      align-items: center; /* Center align on mobile */
      text-align: center;
      width: 100%;
    }

    .hero-icon-box {
      margin-bottom: 8px;
    }

    .content-body {
      padding: 24px 16px;
    }

    .survey-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .survey-card {
      padding: 20px;
    }

    /* Modal Mobile */
    .modal-overlay {
      padding: 10px;
    }
    .modal-content {
      max-height: calc(100vh - 20px);
    }
  }
`;

const styles = {
  statusBadge: (status) => ({
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor:
      status === "pending" ? `${COLORS.warning}15` : `${COLORS.success}15`,
    color: status === "pending" ? COLORS.warning : COLORS.success,
    border: `1px solid ${
      status === "pending" ? COLORS.warning : COLORS.success
    }30`,
  }),
  sourceBadge: (source) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: source === "assessment" ? "#1d4ed8" : "#065f46",
    backgroundColor: source === "assessment" ? "#dbeafe" : "#d1fae5",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "700",
  }),
  typeBadge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: type === "anonymous" ? "#7c3aed" : COLORS.textSecondary,
    backgroundColor: type === "anonymous" ? "#f5f3ff" : "#f3f4f6",
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "600",
  }),
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.borderColor}`,
    fontSize: "14px",
    marginTop: "8px",
    minHeight: "80px",
    outline: "none",
    backgroundColor: COLORS.cardBg,
    color: COLORS.textPrimary,
    fontFamily: "'Inter', system-ui, sans-serif",
    resize: "vertical",
  },
};

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
  const isError = type === "error";
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        backgroundColor: isError ? "#FEF2F2" : "#ECFDF5",
        border: `1px solid ${isError ? "#FECACA" : "#A7F3D0"}`,
        color: isError ? "#991B1B" : "#065F46",
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 9999,
        animation: "toastSlide 0.3s ease-out",
        maxWidth: "90%",
      }}
    >
      {isError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
      <span style={{ fontWeight: "500", fontSize: "14px" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginLeft: "auto",
          color: "inherit",
          opacity: 0.7,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const EmployeeSurveys = () => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast State
  const [toast, setToast] = useState(null);

  // Taking Survey State
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    (async () => {
      try {
        const [surveysRes, assessmentsRes] = await Promise.all([
          fetch(`${API_BASE}/api/employee/surveys/`, { headers: authHeader }),
          fetch(`${API_BASE}/api/assessments/my/`, { headers: authHeader }),
        ]);

        const surveysData = surveysRes.ok ? await surveysRes.json() : [];
        const assessmentsData = assessmentsRes.ok ? await assessmentsRes.json() : [];

        const manualSurveyItems = (Array.isArray(surveysData) ? surveysData : []).map((item) => ({
          id: `survey-${item.id}`,
          source: "survey",
          assignmentId: item.id,
          status: String(item.status || "pending").toLowerCase(),
          assigned_at: item.assigned_at,
          title: item.survey_title,
          response_type: item.survey_response_type,
        }));

        const assessmentItems = (Array.isArray(assessmentsData) ? assessmentsData : []).map((item) => ({
          id: `assessment-${item.id}`,
          source: "assessment",
          assignmentId: item.id,
          status: String(item.status || "PENDING").toLowerCase(),
          assigned_at: item.assigned_at,
          title: item.template_name || item.template_code || "Assessment",
          template_code: item.template_code,
        }));

        const combined = [...manualSurveyItems, ...assessmentItems].sort((a, b) => {
          const aTs = a.assigned_at ? new Date(a.assigned_at).getTime() : 0;
          const bTs = b.assigned_at ? new Date(b.assigned_at).getTime() : 0;
          return bTs - aTs;
        });

        setSurveys(combined);
      } catch (e) {
        console.error(e);
        setToast({ message: "Could not load assigned items.", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getAssessmentRoute = (templateCode) => {
    const code = String(templateCode || "").toUpperCase();
    const pathMap = {
      BIG_FIVE: "/big-five",
      KARASEK: "/karasek",
      MASLACH: "/maslach",
      DISC: "/disc",
      JSS: "/jss",
      BRS: "/brs",
      CDRISC10: "/cdrisc",
      WSES: "/wses",
      GCOS: "/gcos",
      RIBS: "/ribs",
      CAQ: "/caq",
      ISE: "/ise",
    };

    if (pathMap[code]) {
      return pathMap[code];
    }

    if (String(templateCode || "").startsWith("AI_")) {
      return "/dynamic-test";
    }

    return null;
  };

  const handleStartSurvey = async (assignmentId) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/employee/surveys/${assignmentId}/take/`,
        { headers: authHeader }
      );
      if (res.ok) {
        const data = await res.json();
        setActiveSurvey({ ...data, assignmentId });
        setAnswers({});
      } else {
        setToast({ message: "Could not load survey.", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Could not load survey.", type: "error" });
    }
  };

  const handleStartAssessment = (item) => {
    const route = getAssessmentRoute(item.template_code);
    if (!route) {
      setToast({ message: `Unknown assessment type: ${item.template_code || "N/A"}`, type: "error" });
      return;
    }

    navigate(`${route}?assignment=${item.assignmentId}`);
  };

  const handleStartItem = (item) => {
    if (item.source === "survey") {
      handleStartSurvey(item.assignmentId);
      return;
    }
    handleStartAssessment(item);
  };

  const handleSubmit = async () => {
    if (!activeSurvey) return;
    setSubmitting(true);

    const payload = {
      answers: Object.keys(answers).map((qId) => ({
        question_id: qId,
        text: answers[qId],
      })),
    };

    try {
      const res = await fetch(
        `${API_BASE}/api/employee/surveys/${activeSurvey.assignmentId}/take/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setToast({ message: "Submitted Successfully!", type: "success" });
        setActiveSurvey(null);
        setSurveys((prev) =>
          prev.map((s) =>
            s.source === "survey" && s.assignmentId === activeSurvey.assignmentId
              ? { ...s, status: "completed" }
              : s
          )
        );
      } else {
        setToast({ message: "Submission failed.", type: "error" });
      }
    } catch (e) {
      console.error(e);
      setToast({ message: "Submission failed.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="es-container">
      <style>{responsiveStyles}</style>

      <div className="main-wrapper">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Hero Header */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-icon-box">
              <ClipboardList size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: COLORS.textPrimary,
                  margin: "0 0 4px 0",
                  lineHeight: "1.2",
                }}
              >
                Assigned Surveys & Assessments
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  color: COLORS.textSecondary,
                  margin: "0",
                }}
              >
                Start manual surveys and psychometric assessments from one place.
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="content-body">
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "100px 0",
                color: COLORS.textMuted,
              }}
            >
              <Loader2
                className="animate-spin"
                size={40}
                style={{ marginBottom: "16px", color: COLORS.primary }}
              />
              <p style={{ fontWeight: "600" }}>Loading your surveys...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "100px 0",
                color: COLORS.textMuted,
              }}
            >
              <div
                style={{
                  background: `${COLORS.primary}08`,
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Inbox size={40} opacity={0.3} />
              </div>
              <h3
                style={{
                  color: COLORS.textPrimary,
                  marginBottom: "8px",
                  fontSize: "20px",
                }}
              >
                No Surveys Found
              </h3>
              <p>You don't have any assigned surveys at the moment.</p>
            </div>
          ) : (
            <div className="survey-grid">
              {surveys.map((item) => (
                <div key={item.id} className="survey-card">
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <span style={styles.statusBadge(item.status)}>
                        {item.status === "pending" ? (
                          <PlayCircle size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {item.status}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          color: COLORS.textMuted,
                        }}
                      >
                        <Calendar size={14} />
                        {item.assigned_at
                          ? new Date(item.assigned_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "-"}
                      </div>
                    </div>

                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: COLORS.textPrimary,
                        margin: "0 0 12px 0",
                        lineHeight: "1.4",
                      }}
                    >
                      {item.title}
                    </h3>

                    <div style={{ marginBottom: "20px" }}>
                      <span style={styles.sourceBadge(item.source)}>
                        {item.source === "assessment" ? (
                          <Brain size={14} />
                        ) : (
                          <ClipboardList size={14} />
                        )}
                        {item.source === "assessment" ? "Assessment" : "Survey"}
                      </span>
                      {item.source === "survey" && (
                        <span style={{ ...styles.typeBadge(item.response_type), marginLeft: "8px" }}>
                          {item.response_type === "anonymous" ? <Shield size={14} /> : <User size={14} />}
                          {item.response_type === "anonymous" ? "Anonymous" : "Named"}
                        </span>
                      )}
                      {item.source === "assessment" && item.template_code && (
                        <span style={{ ...styles.typeBadge("named"), marginLeft: "8px" }}>
                          {item.template_code}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    {item.status === "completed" ? (
                      <button disabled className="btn-primary">
                        <CheckCircle2 size={18} /> Completed
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartItem(item)}
                        className="btn-primary"
                      >
                        <PlayCircle size={18} /> Start
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal for Taking Survey */}
        {activeSurvey && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div
                style={{
                  padding: "20px",
                  borderBottom: `1px solid ${COLORS.borderColor}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h2 style={{ fontSize: "20px", margin: 0, fontWeight: "700" }}>
                  {activeSurvey.survey_title}
                </h2>
                <button
                  onClick={() => setActiveSurvey(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    color: COLORS.textMuted,
                    padding: "0",
                    lineHeight: "1",
                  }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  padding: "24px",
                  overflowY: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {activeSurvey.questions.map((q, idx) => (
                  <div key={q.id}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: COLORS.textPrimary,
                        marginBottom: "8px",
                      }}
                    >
                      {idx + 1}. {q.text}
                    </label>
                    <textarea
                      style={styles.textarea}
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [q.id]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: "20px",
                  borderTop: `1px solid ${COLORS.borderColor}`,
                  backgroundColor: COLORS.cardBg,
                }}
              >
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Assessment</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSurveys;