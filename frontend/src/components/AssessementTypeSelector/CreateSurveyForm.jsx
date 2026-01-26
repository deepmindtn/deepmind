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
  Send,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import AudienceSelector from "./AudienceSelector";
import ScheduleSender from "./ScheduleSender";
import ResponseOptions from "./ResponseOptions";
import UploadSurveyFile from "./UploadSurveyFile";

// -----------------------
// Theme Constants (Synchronized across all dashboards)
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
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: "48px",
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
    .survey-builder-main-wrapper {
      padding: 32px 24px !important;
    }
    .survey-builder-settings-grid {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    .survey-builder-schedule-section {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 20px !important;
    }
    .survey-builder-schedule-container {
      width: 100% !important;
    }
  }

  @media (max-width: 768px) {
    .survey-builder-container {
      padding: 5px 10px !important;
    }
    .survey-builder-main-wrapper {
      padding: 24px 16px !important;
      border-radius: 20px !important;
    }
    .survey-builder-header {
      margin-bottom: 32px !important;
    }
    .survey-builder-header h1 {
      font-size: 28px !important;
    }
    .survey-builder-header p {
      font-size: 15px !important;
    }
    .survey-builder-choice-wrapper {
      flex-direction: column !important;
      gap: 16px !important;
    }
    .survey-builder-card {
      padding: 20px !important;
    }
    .survey-builder-content-wrapper {
      gap: 20px !important;
    }
    .survey-builder-btn-primary {
      width: 100% !important;
      padding: 12px 24px !important;
      font-size: 15px !important;
    }
  }

  @media (max-width: 480px) {
    .survey-builder-container {
      padding: 5px 8px !important;
    }
    .survey-builder-main-wrapper {
      padding: 20px 12px !important;
      border-radius: 16px !important;
    }
    .survey-builder-header {
      margin-bottom: 24px !important;
    }
    .survey-builder-header-title-wrapper {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .survey-builder-header h1 {
      font-size: 24px !important;
    }
    .survey-builder-header p {
      font-size: 14px !important;
    }
    .survey-builder-icon-box {
      padding: 8px !important;
    }
    .survey-builder-icon-box svg {
      width: 20px !important;
      height: 20px !important;
    }
    .survey-builder-choice-wrapper {
      gap: 12px !important;
    }
    .survey-builder-choice-card {
      padding: 20px !important;
    }
    .survey-builder-choice-card svg {
      width: 24px !important;
      height: 24px !important;
    }
    .survey-builder-choice-title {
      font-size: 14px !important;
    }
    .survey-builder-choice-desc {
      font-size: 11px !important;
    }
    .survey-builder-card {
      padding: 16px !important;
    }
    .survey-builder-content-wrapper {
      gap: 16px !important;
    }
    .survey-builder-label {
      font-size: 13px !important;
      margin-bottom: 10px !important;
    }
    .survey-builder-label svg {
      width: 16px !important;
      height: 16px !important;
    }
    .survey-builder-question-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 12px !important;
      margin-bottom: 16px !important;
    }
    .survey-builder-btn-secondary {
      padding: 8px 14px !important;
      font-size: 13px !important;
      width: 100%;
    }
    .survey-builder-btn-secondary svg {
      width: 14px !important;
      height: 14px !important;
    }
    .survey-builder-question-row {
      padding: 12px !important;
      gap: 8px !important;
      margin-bottom: 10px !important;
    }
    .survey-builder-question-number {
      font-size: 13px !important;
      width: 25px !important;
    }
    .survey-builder-question-input {
      font-size: 14px !important;
      padding: 8px 12px !important;
    }
    .survey-builder-question-delete svg {
      width: 16px !important;
      height: 16px !important;
    }
    .survey-builder-upload-area {
      padding: 30px 20px !important;
    }
    .survey-builder-schedule-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .survey-builder-schedule-title {
      font-size: 14px !important;
    }
    .survey-builder-schedule-desc {
      font-size: 12px !important;
    }
    .survey-builder-schedule-inner {
      padding: 12px 14px !important;
    }
    .survey-builder-btn-primary {
      padding: 10px 20px !important;
      font-size: 14px !important;
    }
    .survey-builder-btn-primary svg {
      width: 18px !important;
      height: 18px !important;
    }
  }
`;

const CreateSurveyForm = () => {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [option, setOption] = useState("manual"); // 'upload' | 'manual'
  const [questions, setQuestions] = useState([{ id: Date.now(), text: "" }]);
  const [responseType, setResponseType] = useState("named");
  const [schedule, setSchedule] = useState(null);

  // --- Dynamic Audience State ---
  const [audience, setAudience] = useState({ type: "all", selected: [] });
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingAudience, setLoadingAudience] = useState(true);

  // --- Fetch Departments and Employees ---
  useEffect(() => {
    async function fetchAudienceData() {
      setLoadingAudience(true);
      try {
        const [depRes, empRes] = await Promise.all([
          fetch(`${API_BASE}/api/departments/`, { headers: authHeader }),
          fetch(`${API_BASE}/api/users/`, { headers: authHeader }),
        ]);

        // Process Departments
        const depData = depRes.ok ? await depRes.json() : [];
        setDepartments(Array.isArray(depData) ? depData : []);

        // Process Employees (Map to friendly format)
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

  // --- Question Handlers ---
  const handleAddQuestion = () =>
    setQuestions([...questions, { id: Date.now(), text: "" }]);
  const handleQuestionChange = (id, text) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  const handleRemoveQuestion = (id) =>
    setQuestions(questions.filter((q) => q.id !== id));

  // --- Submit ---
  const handleSubmit = () => {
    console.log({ option, responseType, audience, schedule, questions });
    alert("Survey Built & Dispatched Successfully!");
  };

  return (
    <div className="survey-builder-container" style={styles.container}>
      <style>{responsiveStyles}</style>

      <div
        className="survey-builder-main-wrapper"
        style={styles.mainWrapperCard}
      >
        {/* Header */}
        <div className="survey-builder-header" style={styles.sectionHeader}>
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
              Survey Builder
            </h1>
          </div>
          <p
            style={{ color: COLORS.textSecondary, fontSize: "16px", margin: 0 }}
          >
            Design your custom assessment from scratch or upload a template.
          </p>
        </div>

        <div
          className="survey-builder-content-wrapper"
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
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
            style={styles.btnPrimary}
            onClick={handleSubmit}
          >
            <CheckCircle2 size={20} />
            Launch Custom Survey
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSurveyForm;
