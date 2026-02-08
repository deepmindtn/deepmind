import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary:"#10b981", // Indigo Hub
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  blue: "var(--blue)",
  blueLight: "var(--blue-light)",
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
  red: "var(--red)",
  success: "#10b981",
  warning: "#f59e0b",
  dark: "var(--dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  shadowHuge: "var(--shadow-huge)",
};

const styles = {
  mainWrapper: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 40px)",
    position: "relative",
  },
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primary}1A 0%, ${COLORS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroIconBox: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: `0 10px 25px -5px ${COLORS.primary}60`,
    color: "#fff",
  },
  contentBody: {
    flex: 1,
    padding: "40px",
    backgroundColor: COLORS.bgMain,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    minHeight: "200px",
  },
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    width: "100%",
    maxWidth: "600px",
    borderRadius: "20px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
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
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 20px",
    borderRadius: "12px",
    font: "700 14px 'Inter', system-ui, sans-serif",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "none",
    background: COLORS.primary,
    color: "white",
    boxShadow: `0 4px 12px ${COLORS.primary}40`,
    width: "100%",
  },
};

const animationStyles = `
  .survey-card-hover:hover {
    transform: translateY(-5px);
    border-color: ${COLORS.primary}60;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
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
  @keyframes spin { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  }
  .animate-spin { 
    animation: spin 1s linear infinite; 
  }
  @keyframes slideIn { 
    from { transform: translateY(100%); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }

  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    .hero-section-mobile {
      padding: 32px 24px !important;
      flex-direction: column;
      align-items: flex-start !important;
      gap: 20px;
    }
    .hero-icon-box-mobile {
      width: 56px !important;
      height: 56px !important;
    }
    .hero-title-mobile {
      font-size: 24px !important;
    }
    .hero-subtitle-mobile {
      font-size: 14px !important;
    }
    .content-body-mobile {
      padding: 24px 16px !important;
    }
    .grid-mobile {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .modal-content-mobile {
      margin: 16px;
      max-height: calc(100vh - 32px) !important;
    }
    .modal-header-mobile {
      padding: 16px !important;
    }
    .modal-body-mobile {
      padding: 16px !important;
    }
    .modal-footer-mobile {
      padding: 16px !important;
    }
    .card-mobile {
      padding: 20px !important;
    }
  }

  @media (max-width: 480px) {
    .hero-section-mobile {
      padding: 24px 16px !important;
    }
    .hero-title-mobile {
      font-size: 20px !important;
    }
    .card-title-mobile {
      font-size: 16px !important;
    }
  }
`;

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
        animation: "slideIn 0.3s ease-out",
        maxWidth: "400px",
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
    fetch(`${API_BASE}/api/employee/surveys/`, { headers: authHeader })
      .then((res) => res.json())
      .then((data) => setSurveys(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
            s.id === activeSurvey.assignmentId
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
    <div style={styles.mainWrapper}>
      <style>{animationStyles}</style>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hero Header */}
      <div style={styles.heroSection} className="hero-section-mobile">
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={styles.heroIconBox} className="hero-icon-box-mobile">
            <ClipboardList size={36} strokeWidth={2.5} />
          </div>
          <div>
            <h1
              className="hero-title-mobile"
              style={{
                fontSize: "32px",
                fontWeight: "800",
                color: COLORS.textPrimary,
                margin: "0 0 4px 0",
              }}
            >
              Assigned Surveys
            </h1>
            <p
              className="hero-subtitle-mobile"
              style={{
                fontSize: "16px",
                color: COLORS.textSecondary,
                margin: "0",
              }}
            >
              Pending assessments assigned by HR.
            </p>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div style={styles.contentBody} className="content-body-mobile">
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
          <div style={styles.grid} className="grid-mobile">
            {surveys.map((item) => (
              <div
                key={item.id}
                className="survey-card-hover card-mobile"
                style={styles.card}
              >
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
                      {new Date(item.assigned_at).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>

                  <h3
                    className="card-title-mobile"
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: COLORS.textPrimary,
                      margin: "0 0 12px 0",
                      lineHeight: "1.4",
                    }}
                  >
                    {item.survey_title}
                  </h3>

                  <div style={{ marginBottom: "20px" }}>
                    <span style={styles.typeBadge(item.survey_response_type)}>
                      {item.survey_response_type === "anonymous" ? (
                        <Shield size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      {item.survey_response_type === "anonymous"
                        ? "Anonymous"
                        : "Named"}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "auto" }}>
                  {item.status === "completed" ? (
                    <button
                      disabled
                      className="btn-primary"
                      style={styles.btnPrimary}
                    >
                      <CheckCircle2 size={18} /> Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartSurvey(item.id)}
                      className="btn-primary"
                      style={styles.btnPrimary}
                    >
                      <PlayCircle size={18} /> Start Survey
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
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="modal-content-mobile">
            <div
              className="modal-header-mobile"
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
              className="modal-body-mobile"
              style={{ padding: "24px", overflowY: "auto", flex: 1 }}
            >
              {activeSurvey.questions.map((q, idx) => (
                <div key={q.id} style={{ marginBottom: "24px" }}>
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
              className="modal-footer-mobile"
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
                style={styles.btnPrimary}
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
  );
};

export default EmployeeSurveys;