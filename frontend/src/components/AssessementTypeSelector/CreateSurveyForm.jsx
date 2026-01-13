import React, { useState } from "react";
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
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",
  blue: "#3b82f6",
  blueLight: "#eff6ff",
  purple: "#8b5cf6",
  red: "#ef4444",
  redLight: "#fef2f2",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  shadowHuge:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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

const CreateSurveyForm = () => {
  const [option, setOption] = useState("manual"); // 'upload' | 'manual'
  const [questions, setQuestions] = useState([{ id: Date.now(), text: "" }]);
  const [responseType, setResponseType] = useState("named");
  const [schedule, setSchedule] = useState(null);
  const [audience, setAudience] = useState({ type: "all", selected: [] });

  const handleAddQuestion = () =>
    setQuestions([...questions, { id: Date.now(), text: "" }]);
  const handleQuestionChange = (id, text) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  const handleRemoveQuestion = (id) =>
    setQuestions(questions.filter((q) => q.id !== id));

  const handleSubmit = () => {
    console.log({ option, responseType, audience, schedule, questions });
    alert("Survey Built & Dispatched Successfully!");
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainWrapperCard}>
        {/* Header */}
        <div style={styles.sectionHeader}>
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
              Survey Builder
            </h1>
          </div>
          <p
            style={{ color: COLORS.textSecondary, fontSize: "16px", margin: 0 }}
          >
            Design your custom assessment from scratch or upload a template.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Methodology Choice */}
          <div style={{ display: "flex", gap: "20px" }}>
            <div
              style={styles.choiceCard(option === "upload")}
              onClick={() => setOption("upload")}
            >
              <Upload
                size={28}
                color={option === "upload" ? COLORS.primary : COLORS.textMuted}
              />
              <div style={{ textAlign: "center" }}>
                <div
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
                <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                  Import PDF or Excel
                </div>
              </div>
            </div>
            <div
              style={styles.choiceCard(option === "manual")}
              onClick={() => setOption("manual")}
            >
              <Edit3
                size={28}
                color={option === "manual" ? COLORS.primary : COLORS.textMuted}
              />
              <div style={{ textAlign: "center" }}>
                <div
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
                <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>
                  Write custom questions
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div style={styles.card}>
            {option === "upload" ? (
              <div>
                <label style={styles.label}>
                  <FileText size={18} color={COLORS.primary} /> Document Upload
                </label>
                <div
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
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <label style={{ ...styles.label, marginBottom: 0 }}>
                    <Edit3 size={18} color={COLORS.primary} /> Question List
                  </label>
                  <button
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
                      }}
                    >
                      {i + 1}.
                    </div>
                    <input
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
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            <div style={styles.card}>
              <label style={styles.label}>
                <Layout size={18} color={COLORS.primary} /> Response Setup
              </label>
              <ResponseOptions
                value={responseType}
                onChange={setResponseType}
              />
            </div>
            <div style={styles.card}>
              <label style={styles.label}>
                <Target size={18} color={COLORS.primary} /> Recipients
              </label>
              <AudienceSelector value={audience} onChange={setAudience} />
            </div>
          </div>

          {/* Footer Schedule Bar */}
          <div
            style={{
              ...styles.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fcfcfd",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  ...styles.iconBox,
                  backgroundColor: COLORS.primaryLight,
                }}
              >
                <Calendar size={20} color={COLORS.primary} />
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "15px" }}>
                  Delivery Schedule
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: COLORS.textSecondary,
                  }}
                >
                  Set a time or send immediately.
                </div>
              </div>
            </div>

            {/* Wider container */}
            <div style={{ width: "65%" }}>
              <div
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
          <button style={styles.btnPrimary} onClick={handleSubmit}>
            <CheckCircle2 size={20} />
            Launch Custom Survey
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSurveyForm;
