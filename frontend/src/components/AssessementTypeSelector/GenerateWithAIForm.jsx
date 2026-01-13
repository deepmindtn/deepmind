import React, { useState } from "react";
import {
  Sparkles,
  MessageSquare,
  Users,
  Calendar,
  Send,
  Wand2,
  ChevronRight,
  Layout,
  Target,
  Loader2,
} from "lucide-react";
import ScheduleSender from "./ScheduleSender";
import AudienceSelector from "./AudienceSelector";
import ResponseOptions from "./ResponseOptions";

// -----------------------
// Theme Constants (Matched exactly to RecruitmentMatch)
// -----------------------
const COLORS = {
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",
  secondary: "#14b8a6",
  blue: "#3b82f6",
  blueLight: "#eff6ff",
  purple: "#8b5cf6",
  orange: "#f59e0b",
  red: "#ef4444",
  dark: "#475569",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  shadowHuge:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: COLORS.textPrimary,
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
    boxShadow: COLORS.shadowSm,
    overflow: "hidden",
    padding: "24px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
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
    transition: "all 0.2s",
    backgroundColor: "#fcfcfd",
    fontFamily: "inherit",
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
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
  },
  iconBox: {
    padding: "10px",
    backgroundColor: COLORS.primaryLight,
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const GenerateWithAIForm = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock states for external components
  const [responseType, setResponseType] = useState("");
  const [audience, setAudience] = useState({ type: "", selected: [] });
  const [schedule, setSchedule] = useState(null);

  const handleSubmit = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      console.log({ prompt, responseType, audience, schedule });
      setIsGenerating(false);
      alert("AI Survey Architecture Initialized!");
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } textarea:focus { border-color: ${COLORS.primary} !important; box-shadow: 0 0 0 4px ${COLORS.primaryLight}; }`}</style>

      <div style={styles.mainWrapperCard}>
        {/* Header Section */}
        <div style={styles.sectionHeader}>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div style={styles.iconBox}>
                <Sparkles size={24} color={COLORS.primary} />
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
                AI Survey Architect
              </h1>
            </div>
            <p
              style={{
                color: COLORS.textSecondary,
                margin: 0,
                fontSize: "16px",
              }}
            >
              Describe your goals and let our AI build the perfect assessment.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Main Prompt Area - Full Width */}
          <div style={styles.card}>
            <label style={styles.label}>
              <Wand2 size={18} color={COLORS.primary} />
              The AI Prompt
            </label>
            <textarea
              style={{
                ...styles.input,
                minHeight: "140px",
                resize: "none",
                fontSize: "16px",
                lineHeight: "1.6",
              }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a professional survey for high-level executives regarding digital transformation challenges in 2026..."
            />
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <span
                style={{
                  fontSize: "12px",
                  color: COLORS.textMuted,
                  backgroundColor: COLORS.bgMain,
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                Suggested: Employee Engagement
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: COLORS.textMuted,
                  backgroundColor: COLORS.bgMain,
                  padding: "4px 10px",
                  borderRadius: "6px",
                }}
              >
                Suggested: Customer Feedback
              </span>
            </div>
          </div>

          {/* Settings Grid - 2 Columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {/* Response Configuration */}
            <div style={styles.card}>
              <label style={styles.label}>
                <Layout size={18} color={COLORS.primary} />
                Response Format
              </label>
              <div
                style={{
                  color: COLORS.textSecondary,
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                Choose how participants will interact.
              </div>
              {/* This is where your ResponseOptions component goes */}
              <div
                style={{
                  border: `1px dashed ${COLORS.borderColor}`,
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                  color: COLORS.textMuted,
                  fontSize: "14px",
                }}
              >
                <ResponseOptions
                  value={responseType}
                  onChange={setResponseType}
                />
              </div>
            </div>

            {/* Target Audience */}
            <div style={styles.card}>
              <label style={styles.label}>
                <Target size={18} color={COLORS.primary} />
                Target Audience
              </label>
              <div
                style={{
                  color: COLORS.textSecondary,
                  fontSize: "13px",
                  marginBottom: "16px",
                }}
              >
                Select segments or specific groups.
              </div>
              {/* This is where your AudienceSelector component goes */}
              <div
                style={{
                  border: `1px dashed ${COLORS.borderColor}`,
                  padding: "20px",
                  borderRadius: "10px",
                  textAlign: "center",
                  color: COLORS.textMuted,
                  fontSize: "14px",
                }}
              >
                <AudienceSelector value={audience} onChange={setAudience} />
              </div>
            </div>
          </div>

          {/* Schedule Section */}
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

          {/* Form Action */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
              borderTop: `1px solid ${COLORS.borderColor}`,
              paddingTop: "32px",
            }}
          >
            <button
              style={{
                ...styles.btnPrimary,
                opacity: isGenerating ? 0.7 : 1,
                cursor: isGenerating ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 size={20} className="spin" />
              ) : (
                <Send size={20} />
              )}
              {isGenerating
                ? "Processing Architect..."
                : "Generate & Launch Survey"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateWithAIForm;
