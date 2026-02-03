import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  PlayCircle,
  Loader2,
  AlertCircle,
  X,
  Shield,
  User,
} from "lucide-react";

const COLORS = {
  primary: "var(--primary)",
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
  container: {
    padding: "30px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
    marginTop: "30px",
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  btnPrimary: {
    padding: "10px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
  },
  statusBadge: (status) => ({
    display: "inline-flex",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    backgroundColor: status === "completed" ? "#D1FAE5" : "#FEF3C7",
    color: status === "completed" ? "#065F46" : "#92400E",
    alignSelf: "flex-start",
  }),
  // Badge for Anonymity
  typeBadge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: type === "anonymous" ? "#7c3aed" : COLORS.textSecondary,
    backgroundColor: type === "anonymous" ? "#f5f3ff" : "#f3f4f6",
    padding: "4px 10px",
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
      <style>{`@keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};

const EmployeeSurveys = () => {
  const API_BASE = "http://localhost:8080";
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
        setToast({ message: "Submitted Successfully!", type: "success" }); // ✅ New Toast
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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Loader2 className="animate-spin" /> Loading...
      </div>
    );

  return (
    <div style={styles.container}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: COLORS.textPrimary,
          }}
        >
          Assigned Surveys
        </h1>
        <p style={{ color: COLORS.textSecondary }}>
          Pending assessments assigned by HR.
        </p>
      </div>

      <div style={styles.grid}>
        {surveys.length === 0 ? (
          <p>No surveys assigned.</p>
        ) : (
          surveys.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={styles.statusBadge(item.status)}>
                  {item.status}
                </span>
                <span style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                  {new Date(item.assigned_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {item.survey_title}
                </h3>
                {/* ✅ New Logic: Show Anonymous or Named */}
                <div style={{ marginTop: "8px" }}>
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
                    style={{
                      ...styles.btnPrimary,
                      backgroundColor: "#f3f4f6",
                      color: "#9ca3af",
                      cursor: "default",
                    }}
                  >
                    <CheckCircle2 size={18} /> Completed
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartSurvey(item.id)}
                    style={styles.btnPrimary}
                  >
                    <PlayCircle size={18} /> Start Survey
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {activeSurvey && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div
              style={{
                padding: "20px",
                borderBottom: `1px solid ${COLORS.borderColor}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ fontSize: "20px", margin: 0 }}>
                {activeSurvey.survey_title}
              </h2>
              <button
                onClick={() => setActiveSurvey(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "24px", overflowY: "auto" }}>
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
              style={{
                padding: "20px",
                borderTop: `1px solid ${COLORS.borderColor}`,
                backgroundColor: COLORS.cardBg,
              }}
            >
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={styles.btnPrimary}
              >
                {submitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit Assessment"
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
