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
  HelpCircle
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
  primaryLight: "var(--primary-light)", // Light purple background
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  red: "var(--red)",
  green: "#10b981",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
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
  // New Styles for History Cards
  historyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
  },
  historyCard: {
    backgroundColor: "#fff",
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
    backgroundColor: "#fafafa",
  },
  badge: (type) => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    backgroundColor: type === 'manual' ? COLORS.primaryLight : "#FFF7ED",
    color: type === 'manual' ? COLORS.primary : "#C2410C",
    marginBottom: "12px"
  }),
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
    backgroundColor: "#fff",
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
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// --- Single Survey History Card ---
// --- Single Survey History Card ---
const SurveyHistoryCard = ({ survey }) => {
  const [expanded, setExpanded] = useState(false);

  // ✅ Fix: Safe Date Formatting
  const dateStr = survey.created_at 
    ? new Date(survey.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: '2-digit', minute: '2-digit'
      })
    : "Just now";

  // ✅ Fix: Use recipient_count from backend
  const userCountLabel = survey.recipient_count 
    ? `${survey.recipient_count} Recipients` 
    : "All Users";

  return (
    <div style={styles.historyCard}>
      <div style={styles.historyHeader}>
        <span style={styles.badge(survey.method)}>
          {survey.method === 'upload' ? <Upload size={10} style={{marginRight: 4}}/> : <Edit3 size={10} style={{marginRight: 4}}/>}
          {survey.method}
        </span>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "700", color: COLORS.textPrimary }}>
          {survey.title}
        </h3>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: COLORS.textSecondary }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} /> {dateStr}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Display the correct count */}
            <Users size={14} /> {userCountLabel}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px", borderTop: `1px solid ${COLORS.borderColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded ? "16px" : "0" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
            <HelpCircle size={16} color={COLORS.primary} /> 
            {survey.questions ? survey.questions.length : 0} Questions
          </div>
          <button 
            onClick={() => setExpanded(!expanded)}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', 
              color: COLORS.primary, fontWeight: '600', fontSize: '13px',
              display: 'flex', alignItems: 'center', gap: '4px'
            }}
          >
            {expanded ? "Hide" : "View"}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {expanded && (
          <div style={{ 
            backgroundColor: "#f9fafb", 
            borderRadius: "8px", 
            padding: "12px",
            display: "flex", 
            flexDirection: "column", 
            gap: "8px",
            animation: "fadeIn 0.2s"
          }}>
            {survey.questions && survey.questions.map((q, idx) => (
              <div key={idx} style={{ fontSize: "13px", color: COLORS.textSecondary, lineHeight: "1.4" }}>
                <span style={{ fontWeight: "700", marginRight: "6px", color: COLORS.textPrimary }}>{idx + 1}.</span>
                {q.text}
              </div>
            ))}
            {(!survey.questions || survey.questions.length === 0) && (
              <span style={{fontSize: "12px", color: COLORS.textMuted, fontStyle: "italic"}}>
                File upload based survey.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const CreateSurveyForm = () => {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // --- View State: 'create' or 'history' ---
  const [view, setView] = useState("create"); 
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- Create Form State ---
  const [title, setTitle] = useState("");
  const [option, setOption] = useState("manual");
  const [questions, setQuestions] = useState([{ id: Date.now(), text: "" }]);
  const [responseType, setResponseType] = useState("named");
  const [schedule, setSchedule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // --- Dynamic Audience State ---
  const [audience, setAudience] = useState({ type: "all", selected: [] });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingAudience, setLoadingAudience] = useState(true);

  // --- Auto-dismiss Toast ---
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Fetch Audience Data ---
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
            name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
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

  // --- Fetch History Data when view changes ---
  useEffect(() => {
    if (view === "history") {
      setLoadingHistory(true);
      fetch(`${API_BASE}/api/surveys/create/`, { headers: authHeader }) // GET request
        .then(res => {
            if(!res.ok) throw new Error("Failed to fetch");
            return res.json();
        })
        .then(data => setHistoryList(Array.isArray(data) ? data : []))
        .catch(e => console.error(e))
        .finally(() => setLoadingHistory(false));
    }
  }, [view]);

  // --- Question Handlers ---
  const handleAddQuestion = () =>
    setQuestions([...questions, { id: Date.now(), text: "" }]);
  const handleQuestionChange = (id, text) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  const handleRemoveQuestion = (id) =>
    setQuestions(questions.filter((q) => q.id !== id));

  // --- Submit Logic ---
  const handleSubmit = async () => {
    if (!title.trim()) {
      setToast({ message: "Please give your assessment a title.", type: "error" });
      return;
    }
    if (option === "manual" && (questions.length === 0 || !questions[0].text.trim())) {
      setToast({ message: "Please add at least one question.", type: "error" });
      return;
    }

    setIsSubmitting(true);

    const formattedQuestions = questions.map((q, index) => ({
      text: q.text,
      order: index,
    }));

    const formattedSchedule = schedule ? new Date(schedule).toISOString() : null;

    const payload = {
      title: title,
      method: option,
      response_type: responseType,
      scheduled_for: formattedSchedule,
      questions: formattedQuestions,
      audience: {
        type: audience.type,
        selected: audience.selected,
      },
    };

    try {
      const response = await fetch(`${API_BASE}/api/surveys/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setToast({ message: "Survey Created and Assigned Successfully!", type: "success" });
        setTitle("");
        setQuestions([{ id: Date.now(), text: "" }]);
        // Switch to history view to see the new survey?
        // setView("history"); 
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData);
        setToast({ message: "Failed to create survey.", type: "error" });
      }
    } catch (error) {
      console.error("Network Error:", error);
      setToast({ message: "Network error occurred.", type: "error" });
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
        {/* Header with Switcher */}
        <div className="survey-builder-header" style={{...styles.sectionHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <div
              className="survey-builder-header-title-wrapper"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                className="survey-builder-icon-box"
                style={{
                  padding: "10px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "12px",
                }}
              >
                <ClipboardList size={24} color={COLORS.primary} />
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
                {view === 'create' ? "Survey Builder" : "Survey History"}
              </h1>
            </div>
            <p style={{ color: COLORS.textSecondary, fontSize: "16px", margin: 0 }}>
              {view === 'create' 
                ? "Design your custom assessment from scratch or upload a template."
                : "View and manage all previously created assessments."}
            </p>
          </div>

          {/* Toggle View Button */}
          <button
            style={styles.btnSecondary}
            onClick={() => setView(view === 'create' ? 'history' : 'create')}
          >
            {view === 'create' ? (
                <> <List size={18} /> View History </>
            ) : (
                <> <Plus size={18} /> Create New </>
            )}
          </button>
        </div>

        {/* ================= VIEW: HISTORY ================= */}
        {view === 'history' && (
            <div>
                {loadingHistory ? (
                    <div style={{textAlign: "center", padding: "40px", color: COLORS.textMuted}}>
                        <Loader2 className="animate-spin" size={32} style={{margin: "0 auto 10px"}}/>
                        Loading Surveys...
                    </div>
                ) : historyList.length === 0 ? (
                    <div style={{textAlign: "center", padding: "60px", border: `2px dashed ${COLORS.borderColor}`, borderRadius: "16px"}}>
                        <div style={{marginBottom: "16px", color: COLORS.textMuted}}>
                            <ClipboardList size={48} style={{opacity: 0.3}} />
                        </div>
                        <h3 style={{color: COLORS.textPrimary}}>No Surveys Found</h3>
                        <p style={{color: COLORS.textSecondary}}>You haven't created any assessments yet.</p>
                    </div>
                ) : (
                    <div className="history-grid" style={styles.historyGrid}>
                        {historyList.map(survey => (
                            <SurveyHistoryCard key={survey.id} survey={survey} />
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* ================= VIEW: CREATE FORM ================= */}
        {view === 'create' && (
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
              style={styles.input}
              type="text"
              placeholder="e.g. Q1 Employee Wellness Check"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Methodology Choice */}
          <div
            className="survey-builder-choice-wrapper"
            style={{ display: "flex", gap: "20px" }}
          >
            <div
              className="survey-builder-choice-card"
              style={styles.choiceCard(option === "upload")}
              onClick={() => setOption("upload")}
            >
              <Upload
                size={28}
                color={option === "upload" ? COLORS.primary : COLORS.textMuted}
              />
              <div style={{ textAlign: "center" }}>
                <div
                  className="survey-builder-choice-title"
                  style={{
                    fontWeight: "700",
                    color:
                      option === "upload"
                        ? COLORS.primaryDark
                        : COLORS.textPrimary,
                  }}
                >
                  Upload File
                </div>
                <div
                  className="survey-builder-choice-desc"
                  style={{ fontSize: "12px", color: COLORS.textSecondary }}
                >
                  Import PDF or Excel
                </div>
              </div>
            </div>
            <div
              className="survey-builder-choice-card"
              style={styles.choiceCard(option === "manual")}
              onClick={() => setOption("manual")}
            >
              <Edit3
                size={28}
                color={option === "manual" ? COLORS.primary : COLORS.textMuted}
              />
              <div style={{ textAlign: "center" }}>
                <div
                  className="survey-builder-choice-title"
                  style={{
                    fontWeight: "700",
                    color:
                      option === "manual"
                        ? COLORS.primaryDark
                        : COLORS.textPrimary,
                  }}
                >
                  Build Manually
                </div>
                <div
                  className="survey-builder-choice-desc"
                  style={{ fontSize: "12px", color: COLORS.textSecondary }}
                >
                  Write custom questions
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="survey-builder-card" style={styles.card}>
            {option === "upload" ? (
              <div>
                <label className="survey-builder-label" style={styles.label}>
                  <FileText size={18} color={COLORS.primary} /> Document Upload
                </label>
                <div
                  className="survey-builder-upload-area"
                  style={{
                    padding: "40px",
                    border: `2px dashed ${COLORS.borderColor}`,
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <UploadSurveyFile />
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="survey-builder-question-header"
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
                  <div
                    key={q.id}
                    className="survey-builder-question-row"
                    style={styles.questionRow}
                  >
                    <div
                      className="survey-builder-question-number"
                      style={{
                        fontWeight: "700",
                        color: COLORS.textMuted,
                        width: "30px",
                      }}
                    >
                      {i + 1}.
                    </div>
                    <input
                      className="survey-builder-question-input"
                      style={{
                        ...styles.input,
                        border: "none",
                        backgroundColor: "transparent",
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
                        className="survey-builder-question-delete"
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

          {/* Settings Grid */}
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

          {/* Footer Schedule Bar */}
          <div
            className="survey-builder-card survey-builder-schedule-section"
            style={{
              ...styles.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fcfcfd",
            }}
          >
            <div
              className="survey-builder-schedule-header"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <div
                className="survey-builder-icon-box"
                style={{
                  padding: "10px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "12px",
                }}
              >
                <Calendar size={20} color={COLORS.primary} />
              </div>
              <div>
                <div
                  className="survey-builder-schedule-title"
                  style={{ fontWeight: "700", fontSize: "15px" }}
                >
                  Delivery Schedule
                </div>
                <div
                  className="survey-builder-schedule-desc"
                  style={{
                    fontSize: "13px",
                    color: COLORS.textSecondary,
                  }}
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
                className="survey-builder-schedule-inner"
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  border: `1px solid ${COLORS.borderColor}`,
                  backgroundColor: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                <ScheduleSender value={schedule} onChange={setSchedule} />
              </div>
            </div>
          </div>

          {/* Final Action */}
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