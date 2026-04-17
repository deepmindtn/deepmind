import React, { useEffect, useState } from "react";
import {
  Sparkles,
  Calendar,
  Send,
  Wand2,
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

const responsiveStyles = `
  @media (max-width: 1024px) {
    .ai-form-main-wrapper {
      padding: 32px 24px !important;
    }
    .ai-form-settings-grid {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    .ai-form-schedule-section {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 20px !important;
    }
    .ai-form-schedule-container {
      width: 100% !important;
    }
  }

  @media (max-width: 768px) {
    .ai-form-container {
      padding: 5px 10px !important;
    }
    .ai-form-main-wrapper {
      padding: 24px 16px !important;
      border-radius: 20px !important;
    }
    .ai-form-header {
      margin-bottom: 32px !important;
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .ai-form-header h1 {
      font-size: 28px !important;
    }
    .ai-form-header p {
      font-size: 15px !important;
    }
    .ai-form-card {
      padding: 20px !important;
    }
    .ai-form-content-wrapper {
      gap: 24px !important;
    }
    .ai-form-action-section {
      margin-top: 12px !important;
      padding-top: 24px !important;
    }
    .ai-form-btn-primary {
      width: 100% !important;
      padding: 12px 24px !important;
      font-size: 15px !important;
    }
  }

  @media (max-width: 480px) {
    .ai-form-container {
      padding: 5px 8px !important;
    }
    .ai-form-main-wrapper {
      padding: 20px 12px !important;
      border-radius: 16px !important;
    }
    .ai-form-header {
      margin-bottom: 24px !important;
    }
    .ai-form-header-title-wrapper {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .ai-form-header h1 {
      font-size: 24px !important;
    }
    .ai-form-header p {
      font-size: 14px !important;
    }
    .ai-form-icon-box {
      padding: 8px !important;
    }
    .ai-form-icon-box svg {
      width: 20px !important;
      height: 20px !important;
    }
    .ai-form-card {
      padding: 16px !important;
    }
    .ai-form-content-wrapper {
      gap: 20px !important;
    }
    .ai-form-label {
      font-size: 13px !important;
      margin-bottom: 8px !important;
    }
    .ai-form-label svg {
      width: 16px !important;
      height: 16px !important;
    }
    .ai-form-textarea {
      min-height: 120px !important;
      font-size: 15px !important;
      padding: 10px 14px !important;
    }
    .ai-form-suggestion-chip {
      font-size: 11px !important;
      padding: 3px 8px !important;
    }
    .ai-form-card-description {
      font-size: 12px !important;
      margin-bottom: 12px !important;
    }
    .ai-form-schedule-header {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .ai-form-schedule-title {
      font-size: 14px !important;
    }
    .ai-form-schedule-desc {
      font-size: 12px !important;
    }
    .ai-form-schedule-inner {
      padding: 12px 14px !important;
    }
    .ai-form-action-section {
      padding-top: 20px !important;
    }
    .ai-form-btn-primary {
      padding: 10px 20px !important;
      font-size: 14px !important;
    }
    .ai-form-btn-primary svg {
      width: 18px !important;
      height: 18px !important;
    }
  }

  .spin { 
    animation: spin 1s linear infinite; 
  } 
  @keyframes spin { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  } 
  textarea:focus { 
    border-color: ${COLORS.primary} !important; 
    box-shadow: 0 0 0 4px ${COLORS.primaryLight}; 
  }
`;

const GenerateWithAIForm = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingAudience, setIsLoadingAudience] = useState(true);
  const [audienceLoadError, setAudienceLoadError] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // Mock states for external components
  const [responseType, setResponseType] = useState("named");
  const [audience, setAudience] = useState({ type: "all", selected: [] });
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const fetchAudienceData = async () => {
      setIsLoadingAudience(true);
      setAudienceLoadError(false);

      try {
        const audienceHeaders = access ? { Authorization: `Bearer ${access}` } : {};
        const [depRes, empRes] = await Promise.all([
          fetch(`${API_BASE}/api/departments/`, { headers: audienceHeaders }),
          fetch(`${API_BASE}/api/users/?all=true`, { headers: audienceHeaders }),
        ]);

        if (!depRes.ok || !empRes.ok) {
          throw new Error("Could not load departments/employees.");
        }

        const depData = await depRes.json();
        setDepartments(Array.isArray(depData) ? depData : []);

        const empData = await empRes.json();
        const empList = Array.isArray(empData)
          ? empData
          : Array.isArray(empData?.results)
            ? empData.results
            : [];

        const formattedEmployees = empList.map((u) => ({
          id: u.id,
          name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
          department: u.department || "No Department",
          email: u.email,
        }));
        setEmployees(formattedEmployees);
      } catch (e) {
        console.error("Failed to load audience data", e);
        setAudienceLoadError(true);
      } finally {
        setIsLoadingAudience(false);
      }
    };

    fetchAudienceData();
  }, [API_BASE, access]);

  const handleSubmit = () => {
    const run = async () => {
      const trimmedPrompt = String(prompt || "").trim();
      if (!trimmedPrompt) {
        alert("Please provide an AI prompt.");
        return;
      }

      if (audienceLoadError) {
        alert("Audience data failed to load. Refresh and try again.");
        return;
      }

      if (schedule) {
        alert("Scheduled delivery is not supported yet for AI-generated surveys. Please use Send Now.");
        return;
      }

      if ((audience.type === "departments" || audience.type === "employees") && (!Array.isArray(audience.selected) || audience.selected.length === 0)) {
        alert("Please select at least one audience option.");
        return;
      }

      setIsGenerating(true);
      try {
        const templateName = (trimmedPrompt || "AI Survey").slice(0, 100) || "AI Survey";

        const resp = await fetch(`${API_BASE}/api/assessments/generate-and-launch/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeader,
          },
          body: JSON.stringify({
            template_name: templateName,
            prompt: trimmedPrompt,
            response_type: responseType || "named",
            audience: {
              type: audience?.type || "all",
              selected: Array.isArray(audience?.selected) ? audience.selected : [],
            },
            send_emails: true,
          }),
        });

        let data = {};
        try {
          data = await resp.json();
        } catch {
          data = {};
        }

        if (!resp.ok) {
          console.error("AI generate error", data);
          alert(data.detail || data.error || "Failed to generate and launch assessment.");
        } else {
          console.log("AI generate success", data);
          const assignedCount = Number(data.assigned_count || 0);
          const errors = Array.isArray(data.errors) ? data.errors : [];

          if (errors.length) {
            alert(`Survey created. Assigned to ${assignedCount} recipients with ${errors.length} warning(s). Check console for details.`);
            console.warn("AI generate launch warnings", errors);
          } else {
            alert(`AI Survey generated and launched for ${assignedCount} recipient(s).`);
          }
        }
      } catch (err) {
        console.error(err);
        alert("Network error while calling AI generate endpoint.");
      } finally {
        setIsGenerating(false);
      }
    };
    run();
  };

  return (
    <div className="ai-form-container" style={styles.container}>
      <style>{responsiveStyles}</style>

      <div className="ai-form-main-wrapper" style={styles.mainWrapperCard}>
        {/* Header Section */}
        <div className="ai-form-header" style={styles.sectionHeader}>
          <div>
            <div
              className="ai-form-header-title-wrapper"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div className="ai-form-icon-box" style={styles.iconBox}>
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

        <div className="ai-form-content-wrapper" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Main Prompt Area - Full Width */}
          <div className="ai-form-card" style={styles.card}>
            <label className="ai-form-label" style={styles.label}>
              <Wand2 size={18} color={COLORS.primary} />
              The AI Prompt
            </label>
            <textarea
              className="ai-form-textarea"
              style={{
                ...styles.input,
                minHeight: "140px",
                resize: "none",
                fontSize: "16px",
                lineHeight: "1.6",
                backgroundColor: COLORS.cardBg, 
                color: COLORS.textPrimary,
              }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a professional survey for high-level executives regarding digital transformation challenges in 2026..."
            />
            <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span
                className="ai-form-suggestion-chip"
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
                className="ai-form-suggestion-chip"
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
            className="ai-form-settings-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
            }}
          >
            {/* Response Configuration */}
            <div className="ai-form-card" style={styles.card}>
              <label className="ai-form-label" style={styles.label}>
                <Layout size={18} color={COLORS.primary} />
                Response Format
              </label>
              <div
                className="ai-form-card-description"
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
            <div className="ai-form-card" style={styles.card}>
              <label className="ai-form-label" style={styles.label}>
                <Target size={18} color={COLORS.primary} />
                Target Audience
              </label>
              <div
                className="ai-form-card-description"
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
                <AudienceSelector
                  value={audience}
                  onChange={setAudience}
                  departments={departments}
                  employees={employees}
                  loading={isLoadingAudience}
                />
              </div>
              {audienceLoadError && (
                <div
                  style={{
                    marginTop: "10px",
                    color: COLORS.red,
                    fontSize: "12px",
                    textAlign: "left",
                  }}
                >
                  Could not load employees/departments. Refresh before generating.
                </div>
              )}
            </div>
          </div>

          {/* Schedule Section */}
          <div
            className="ai-form-card ai-form-schedule-section"
            style={{
              ...styles.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: COLORS.cardBg,
            }}
          >
            <div className="ai-form-schedule-header" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                className="ai-form-icon-box"
                style={{
                  ...styles.iconBox,
                  backgroundColor: COLORS.primaryLight,
                }}
              >
                <Calendar size={20} color={COLORS.primary} />
              </div>
              <div>
                <div className="ai-form-schedule-title" style={{ fontWeight: "700", fontSize: "15px" }}>
                  Delivery Schedule
                </div>
                <div
                  className="ai-form-schedule-desc"
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
            <div className="ai-form-schedule-container" style={{ width: "65%" }}>
              <div
                className="ai-form-schedule-inner"
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  border: `1px solid ${COLORS.borderColor}`,
                  backgroundColor: COLORS.cardBg,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              >
                <ScheduleSender value={schedule} onChange={setSchedule} />
              </div>
            </div>
          </div>

          {/* Form Action */}
          <div
            className="ai-form-action-section"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
              borderTop: `1px solid ${COLORS.borderColor}`,
              paddingTop: "32px",
            }}
          >
            <button
              className="ai-form-btn-primary"
              style={{
                ...styles.btnPrimary,
                opacity: isGenerating || isLoadingAudience ? 0.7 : 1,
                cursor: isGenerating || isLoadingAudience ? "not-allowed" : "pointer",
              }}
              onClick={handleSubmit}
              disabled={isGenerating || isLoadingAudience}
            >
              {isGenerating ? (
                <Loader2 size={20} className="spin" />
              ) : (
                <Send size={20} />
              )}
              {isGenerating
                ? "Processing Architect..."
                : isLoadingAudience
                  ? "Loading Audience..."
                : "Generate & Launch Survey"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateWithAIForm;