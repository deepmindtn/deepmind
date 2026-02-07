import React, { useState, useEffect } from "react";
import {
  FileText,
  Edit3,
  Plus,
  Trash2,
  ClipboardList,
  Upload,
  Target,
  Layout,
  Calendar,
  CheckCircle2,
  Loader2,
  X,
  AlertCircle,
  List,
  ChevronDown,
  ChevronUp,
  Users,
  HelpCircle,
  Eye,
  ArrowLeft,
  Shield,
} from "lucide-react";
import AudienceSelector from "./AudienceSelector";
import ScheduleSender from "./ScheduleSender";
import ResponseOptions from "./ResponseOptions";
import UploadSurveyFile from "./UploadSurveyFile";

// -----------------------
// Theme Constants
// -----------------------
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
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    position: "relative",
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: "48px",
    minHeight: "80vh",
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "24px",
    overflow: "hidden",
  },
  sectionHeader: { marginBottom: "40px" },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    fontSize: "14px",
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderColor}`,
    fontSize: "14px",
    width: "100%",
    outline: "none",
    backgroundColor: "#fcfcfd",
    transition: "all 0.2s",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "14px 28px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    backgroundColor: "transparent",
    color: COLORS.primary,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  historyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "0",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex",
    flexDirection: "column",
  },
  historyHeader: {
    padding: "20px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    backgroundColor: COLORS.cardBg,
  },
  badge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    backgroundColor: type === "manual" ? COLORS.primaryLight : "#FFF7ED",
    color: type === "manual" ? COLORS.primary : "#C2410C",
    marginBottom: "12px",
  }),
  typeBadge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    backgroundColor: type === "anonymous" ? "#F3E8FF" : "#EFF6FF",
    color: type === "anonymous" ? "#7E22CE" : "#1D4ED8",
    marginBottom: "12px",
    marginLeft: "8px",
  }),
  statusBadge: (status) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: status === "completed" ? "#D1FAE5" : "#FEF3C7",
    color: status === "completed" ? "#065F46" : "#92400E",
  }),
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    borderBottom: `2px solid ${COLORS.borderColor}`,
    color: COLORS.textMuted,
    fontSize: "13px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  td: {
    padding: "16px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    fontSize: "14px",
    color: COLORS.textPrimary,
  },
  choiceCard: (active) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "24px",
    borderRadius: "16px",
    cursor: "pointer",
    border: `2px solid ${active ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: active ? COLORS.primaryLight : "#fff",
    transition: "all 0.2s ease",
  }),
  questionRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "16px",
    backgroundColor: COLORS.cardBg,
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: "12px",
    marginBottom: "12px",
  },
};

const responsiveStyles = `
  @media (max-width: 1024px) {
    .survey-builder-main-wrapper { padding: 32px 24px !important; }
    .survey-builder-settings-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
    .survey-builder-schedule-section { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
    .survey-builder-schedule-container { width: 100% !important; }
  }
  @media (max-width: 768px) {
    .survey-builder-container { padding: 5px 10px !important; }
    .survey-builder-main-wrapper { padding: 24px 16px !important; border-radius: 20px !important; }
    .survey-builder-header h1 { font-size: 28px !important; }
    .survey-builder-choice-wrapper { flex-direction: column !important; gap: 16px !important; }
    .survey-builder-btn-primary { width: 100% !important; }
    .history-grid { grid-template-columns: 1fr !important; }
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
      <style>{`@keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};

// --- View Answers Modal ---
const ResponsesModal = ({ assignment, onClose }) => {
  if (!assignment) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: COLORS.shadowHuge,
        }}
      >
        <div
          style={{
            padding: "24px",
            borderBottom: `1px solid ${COLORS.borderColor}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{ margin: 0, fontSize: "18px", color: COLORS.textPrimary }}
            >
              Responses
            </h3>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "14px",
                color: COLORS.textSecondary,
              }}
            >
              Employee: <strong>{assignment.user_name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <X size={24} color={COLORS.textMuted} />
          </button>
        </div>

        <div style={{ padding: "24px", overflowY: "auto" }}>
          {assignment.responses && assignment.responses.length > 0 ? (
            assignment.responses.map((resp, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "24px",
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: COLORS.textPrimary,
                    marginBottom: "8px",
                  }}
                >
                  Q{idx + 1}: {resp.question_text}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: COLORS.textSecondary,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {resp.answer_text}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                color: COLORS.textMuted,
                padding: "20px",
              }}
            >
              No responses found.
            </div>
          )}
        </div>

        <div
          style={{
            padding: "20px",
            borderTop: `1px solid ${COLORS.borderColor}`,
            textAlign: "right",
          }}
        >
          <button onClick={onClose} style={styles.btnSecondary}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Single Survey History Card ---
const SurveyHistoryCard = ({ survey, onViewDetails }) => {
  const dateStr = survey.created_at
    ? new Date(survey.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Just now";

  const userCountLabel = survey.recipient_count
    ? `${survey.recipient_count} Recipients`
    : "All Users";
  const isAnonymous = survey.response_type === "anonymous";

  return (
    <div style={styles.historyCard}>
      <div style={styles.historyHeader}>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <span style={styles.badge(survey.method)}>
            {survey.method === "upload" ? (
              <Upload size={10} style={{ marginRight: 4 }} />
            ) : (
              <Edit3 size={10} style={{ marginRight: 4 }} />
            )}
            {survey.method}
          </span>
          <span style={styles.typeBadge(survey.response_type)}>
            {isAnonymous ? <Shield size={10} /> : <Users size={10} />}
            {isAnonymous ? "Anonymous" : "Named"}
          </span>
        </div>
        <h3
          style={{
            margin: "8px 0",
            fontSize: "18px",
            fontWeight: "700",
            color: COLORS.textPrimary,
          }}
        >
          {survey.title}
        </h3>
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "13px",
            color: COLORS.textSecondary,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Calendar size={14} /> {dateStr}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={14} /> {userCountLabel}
          </div>
        </div>
      </div>
      <div
        style={{
          padding: "20px",
          borderTop: `1px solid ${COLORS.borderColor}`,
        }}
      >
        <button
          onClick={() => onViewDetails(survey.id)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: COLORS.primary,
            color: "white",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Eye size={16} /> View Recipients & Answers
        </button>
      </div>
    </div>
  );
};

// --- Details View (Table) ---
const SurveyDetailsView = ({ surveyId, onBack, API_BASE, authHeader }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/surveys/${surveyId}/`, { headers: authHeader })
      .then((res) => res.json())
      .then((data) => setDetails(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [surveyId]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Loader2 className="animate-spin" /> Loading...
      </div>
    );
  if (!details) return <div>Error loading details.</div>;

  // ✅ Logic: Is this anonymous?
  const isAnonymous = details.response_type === "anonymous";

  return (
    <div>
      {/* Modal */}
      {selectedAssignment && (
        <ResponsesModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}

      <button
        onClick={onBack}
        style={{
          ...styles.btnSecondary,
          marginBottom: "20px",
          border: "none",
          paddingLeft: 0,
        }}
      >
        <ArrowLeft size={18} /> Back to History
      </button>

      <div style={{ marginBottom: "30px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "800",
            color: COLORS.textPrimary,
            marginBottom: "8px",
          }}
        >
          {details.title}
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            color: COLORS.textSecondary,
          }}
        >
          {/* ✅ Badges with spacing */}
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={styles.badge(details.method)}>{details.method}</span>
            <span style={styles.typeBadge(details.response_type)}>
              {isAnonymous ? "Anonymous" : "Named"}
            </span>
          </div>
          <span>•</span>
          <span>
            Date:{" "}
            <strong>{new Date(details.created_at).toLocaleDateString()}</strong>
          </span>
        </div>
      </div>

      <div style={{ ...styles.card, overflowX: "auto" }}>
        <h3
          style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}
        >
          Recipients Status
        </h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Employee</th>
              {/* ✅ CONDITIONALLY RENDER EMAIL HEADER */}
              {!isAnonymous && <th style={styles.th}>Email</th>}
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {details.assignments.map((assign, index) => (
              <tr key={assign.id}>
                <td style={styles.td}>
                  <strong>
                    {/* Display generic name if anonymous */}
                    {isAnonymous ? (
                      <span
                        style={{
                          color: COLORS.textSecondary,
                          fontStyle: "italic",
                        }}
                      >
                        Employee #{index + 1}
                      </span>
                    ) : (
                      assign.user_name
                    )}
                  </strong>
                </td>

                {/* ✅ CONDITIONALLY RENDER EMAIL CELL */}
                {!isAnonymous && <td style={styles.td}>{assign.user_email}</td>}

                <td style={styles.td}>
                  <span style={styles.statusBadge(assign.status)}>
                    {assign.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {assign.status === "completed" ? (
                    <button
                      onClick={() =>
                        setSelectedAssignment({
                          ...assign,
                          // Override name for the modal title too
                          user_name: isAnonymous
                            ? `Employee #${index + 1}`
                            : assign.user_name,
                        })
                      }
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: `1px solid ${COLORS.primary}`,
                        color: COLORS.primary,
                        background: "transparent",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Eye size={14} /> View Answers
                    </button>
                  ) : (
                    <span
                      style={{
                        color: COLORS.textMuted,
                        fontSize: "12px",
                        fontStyle: "italic",
                      }}
                    >
                      No answers yet
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {details.assignments.length === 0 && (
              <tr>
                <td
                  colSpan={isAnonymous ? "3" : "4"}
                  style={{ ...styles.td, textAlign: "center" }}
                >
                  No recipients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Component ---
const CreateSurveyForm = () => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [view, setView] = useState("create");
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [title, setTitle] = useState("");
  const [option, setOption] = useState("manual");
  const [questions, setQuestions] = useState([{ id: Date.now(), text: "" }]);
  const [responseType, setResponseType] = useState("named");
  const [schedule, setSchedule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const [audience, setAudience] = useState({ type: "all", selected: [] });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingAudience, setLoadingAudience] = useState(true);

  // Auto-dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch Audience Data
  useEffect(() => {
    async function fetchAudienceData() {
      setLoadingAudience(true);
      try {
        const [depRes, empRes] = await Promise.all([
          fetch(`${API_BASE}/api/departments/`, { headers: authHeader }),
          fetch(`${API_BASE}/api/users/`, { headers: authHeader }),
        ]);
        const depData = depRes.ok ? await depRes.json() : [];
        setDepartments(Array.isArray(depData) ? depData : []);
        const empData = empRes.ok ? await empRes.json() : [];
        if (Array.isArray(empData)) {
          const formattedEmployees = empData.map((u) => ({
            id: u.id,
            name:
              `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
            department: u.department || "No Department",
            email: u.email,
          }));
          setEmployees(formattedEmployees);
        }
      } catch (e) {
        console.error("Failed to load audience data", e);
      } finally {
        setLoadingAudience(false);
      }
    }
    fetchAudienceData();
  }, []);

  // Fetch History
  useEffect(() => {
    if (view === "history") {
      setLoadingHistory(true);
      fetch(`${API_BASE}/api/surveys/create/`, { headers: authHeader })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setHistoryList(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    }
  }, [view]);

  // Handlers
  const handleAddQuestion = () =>
    setQuestions([...questions, { id: Date.now(), text: "" }]);
  const handleQuestionChange = (id, text) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  const handleRemoveQuestion = (id) =>
    setQuestions(questions.filter((q) => q.id !== id));

  const handleViewDetails = (id) => {
    setSelectedSurveyId(id);
    setView("details");
  };

  const handleSubmit = async () => {
    if (!title.trim())
      return setToast({ message: "Title is required.", type: "error" });

    // ✅ NEW CHECK: Must have at least one question (either manually added or imported)
    // We check if questions list has data AND if the text is not empty
    const validQuestions = questions.filter(
      (q) => q.text && q.text.trim() !== ""
    );

    if (validQuestions.length === 0) {
      return setToast({
        message: "Please add or import at least one question.",
        type: "error",
      });
    }

    setIsSubmitting(true);
    const payload = {
      title,
      method: option,
      response_type: responseType,
      scheduled_for: schedule ? new Date(schedule).toISOString() : null,
      questions: validQuestions.map((q, i) => ({ text: q.text, order: i })), // ✅ Send validated questions
      audience: { type: audience.type, selected: audience.selected },
    };

    try {
      const response = await fetch(`${API_BASE}/api/surveys/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setToast({ message: "Survey Created Successfully!", type: "success" });
        setTitle("");
        setQuestions([{ id: Date.now(), text: "" }]);
      } else {
        setToast({ message: "Failed to create survey.", type: "error" });
      }
    } catch {
      setToast({ message: "Network error.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="survey-builder-container" style={styles.container}>
      <style>{responsiveStyles}</style>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div
        className="survey-builder-main-wrapper"
        style={styles.mainWrapperCard}
      >
        {/* HEADER */}
        {view !== "details" && (
          <div
            className="survey-builder-header"
            style={{
              ...styles.sectionHeader,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: COLORS.primaryLight,
                    borderRadius: "12px",
                  }}
                >
                  <ClipboardList size={24} color={COLORS.primary} />
                </div>
                <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
                  {view === "create" ? "Survey Builder" : "Survey History"}
                </h1>
              </div>
              <p
                style={{
                  color: COLORS.textSecondary,
                  fontSize: "16px",
                  margin: 0,
                }}
              >
                {view === "create"
                  ? "Design custom assessments & notify employees."
                  : "Track status and view employee responses."}
              </p>
            </div>
            <button
              style={styles.btnSecondary}
              onClick={() => setView(view === "create" ? "history" : "create")}
            >
              {view === "create" ? (
                <>
                  <List size={18} /> View History
                </>
              ) : (
                <>
                  <Plus size={18} /> Create New
                </>
              )}
            </button>
          </div>
        )}

        {/* === VIEW: DETAILS === */}
        {view === "details" && (
          <SurveyDetailsView
            surveyId={selectedSurveyId}
            onBack={() => setView("history")}
            API_BASE={API_BASE}
            authHeader={authHeader}
          />
        )}

        {/* === VIEW: HISTORY === */}
        {view === "history" && (
          <div>
            {loadingHistory ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Loader2 className="animate-spin" /> Loading...
              </div>
            ) : historyList.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  border: `2px dashed ${COLORS.borderColor}`,
                  borderRadius: "16px",
                }}
              >
                <h3 style={{ color: COLORS.textPrimary }}>No Surveys Found</h3>
              </div>
            ) : (
              <div className="history-grid" style={styles.historyGrid}>
                {historyList.map((survey) => (
                  <SurveyHistoryCard
                    key={survey.id}
                    survey={survey}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* === VIEW: CREATE === */}
        {view === "create" && (
          <div
            className="survey-builder-content-wrapper"
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Title Input */}
            <div className="survey-builder-card" style={styles.card}>
              <label className="survey-builder-label" style={styles.label}>
                <Edit3 size={18} color={COLORS.primary} /> Assessment Title
              </label>
              <input
                style={{
                  ...styles.input,
                  color: COLORS.textPrimary,
                  backgroundColor: COLORS.cardBg,
                }}
                type="text"
                placeholder="e.g. Q1 Employee Wellness Check"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Methodology */}
            <div
              className="survey-builder-choice-wrapper"
              style={{ display: "flex", gap: "20px" }}
            >
              {/* Upload Option */}
              <div
                className="survey-builder-choice-card"
                style={{
                  ...styles.choiceCard(option === "upload"),
                  backgroundColor:
                    option === "upload" ? COLORS.primary : COLORS.cardBg, // ✅ selected bg
                  cursor: "pointer",
                }}
                onClick={() => setOption("upload")}
              >
                <Upload
                  size={28}
                  color={option === "upload" ? "#fff" : COLORS.textMuted} // Icon white on selected
                />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontWeight: "700",
                      color: option === "upload" ? "#fff" : COLORS.textPrimary, // Text white on selected
                    }}
                  >
                    Upload File
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        option === "upload"
                          ? "rgba(255,255,255,0.8)"
                          : COLORS.textSecondary,
                    }}
                  >
                    Import PDF or Excel
                  </div>
                </div>
              </div>

              {/* Manual Option */}
              <div
                className="survey-builder-choice-card"
                style={{
                  ...styles.choiceCard(option === "manual"),
                  backgroundColor:
                    option === "manual" ? COLORS.primary : COLORS.cardBg, // ✅ selected bg
                  cursor: "pointer",
                }}
                onClick={() => setOption("manual")}
              >
                <Edit3
                  size={28}
                  color={option === "manual" ? "#fff" : COLORS.textMuted} // Icon white on selected
                />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontWeight: "700",
                      color: option === "manual" ? "#fff" : COLORS.textPrimary, // Text white on selected
                    }}
                  >
                    Build Manually
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color:
                        option === "manual"
                          ? "rgba(255,255,255,0.8)"
                          : COLORS.textSecondary,
                    }}
                  >
                    Write custom questions
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Section (Handles BOTH Upload & Manual) */}
            <div className="survey-builder-card" style={styles.card}>
              {option === "upload" ? (
                <div>
                  <label className="survey-builder-label" style={styles.label}>
                    <FileText size={18} color={COLORS.primary} /> Document
                    Upload
                  </label>
                  <div
                    style={{
                      padding: "40px",
                      border: `2px dashed ${COLORS.borderColor}`,
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <UploadSurveyFile
                      onQuestionsImported={(importedQuestions) => {
                        setQuestions(importedQuestions); // ✅ Populate questions state from file
                        setToast({
                          message: `Imported ${importedQuestions.length} questions!`,
                          type: "success",
                        });
                      }}
                    />
                  </div>

                  {/* ✅ Optional: Preview Imported Questions */}
                  {questions.length > 0 && questions[0].text !== "" && (
                    <div
                      style={{
                        marginTop: "20px",
                        textAlign: "left",
                        maxHeight: "200px",
                        overflowY: "auto",
                        background: "#f8fafc",
                        padding: "10px",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: COLORS.textSecondary,
                          marginBottom: "8px",
                        }}
                      >
                        Preview Imported Questions:
                      </div>
                      {questions.map((q, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: "13px",
                            padding: "4px 0",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          {i + 1}. {q.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <label
                      className="survey-builder-label"
                      style={{ ...styles.label, marginBottom: 0 }}
                    >
                      <Edit3 size={18} color={COLORS.primary} /> Question List
                    </label>
                    <button
                      className="survey-builder-btn-secondary"
                      style={styles.btnSecondary}
                      onClick={handleAddQuestion}
                    >
                      <Plus size={16} /> Add Question
                    </button>
                  </div>
                  {questions.map((q, i) => (
                    <div key={q.id} style={styles.questionRow}>
                      <div
                        style={{
                          fontWeight: "700",
                          color: COLORS.textMuted,
                          width: "30px",
                          backgroundColor: COLORS.cardBg,
                        }}
                      >
                        {i + 1}.
                      </div>
                      <input
                        style={{
                          ...styles.input,
                          border: "none",
                          backgroundColor: COLORS.cardBg,
                          color: COLORS.textPrimary,
                          fontSize: "15px",
                          fontWeight: "500",
                        }}
                        type="text"
                        placeholder="Enter your question here..."
                        value={q.text}
                        onChange={(e) =>
                          handleQuestionChange(q.id, e.target.value)
                        }
                      />
                      {questions.length > 1 && (
                        <button
                          onClick={() => handleRemoveQuestion(q.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: COLORS.red,
                            padding: "8px",
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div
              className="survey-builder-settings-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div className="survey-builder-card" style={styles.card}>
                <label className="survey-builder-label" style={styles.label}>
                  <Layout size={18} color={COLORS.primary} /> Response Setup
                </label>
                <ResponseOptions
                  value={responseType}
                  onChange={setResponseType}
                />
              </div>
              <div className="survey-builder-card" style={styles.card}>
                <label className="survey-builder-label" style={styles.label}>
                  <Target size={18} color={COLORS.primary} /> Recipients
                </label>
                <AudienceSelector
                  value={audience}
                  onChange={setAudience}
                  departments={departments}
                  employees={employees}
                  loading={loadingAudience}
                />
              </div>
            </div>

            {/* Schedule */}
            <div
              className="survey-builder-card survey-builder-schedule-section"
              style={{
                ...styles.card,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: COLORS.cardBg,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: COLORS.primaryLight,
                    borderRadius: "12px",
                  }}
                >
                  <Calendar size={20} color={COLORS.primary} />
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "15px" }}>
                    Delivery Schedule
                  </div>
                  <div
                    style={{ fontSize: "13px", color: COLORS.textSecondary }}
                  >
                    Set a time or send immediately.
                  </div>
                </div>
              </div>
              <div
                className="survey-builder-schedule-container"
                style={{ width: "65%" }}
              >
                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    border: `1px solid ${COLORS.borderColor}`,
                    backgroundColor: COLORS.cardBg,
                    boxSizing: "border-box",
                  }}
                >
                  <ScheduleSender value={schedule} onChange={setSchedule} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              className="survey-builder-btn-primary"
              style={{
                ...styles.btnPrimary,
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Sending...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} /> Launch Custom Survey
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateSurveyForm;
