import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    width: "100%",
  },
  dropZone: {
    border: `2px dashed ${COLORS.borderColor}`,
    borderRadius: "12px",
    padding: "32px",
    width: "100%",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: COLORS.cardBg, // Changed from #f8fafc
    transition: "all 0.2s",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: COLORS.primaryLight, // Changed from #eff6ff
    borderRadius: "8px",
    width: "100%",
    border: `1px solid ${COLORS.primary}`, // Changed from #dbeafe
  },
  fileName: {
    fontSize: "14px",
    fontWeight: "500",
    color: COLORS.textPrimary, // Changed from #1e40af
    flex: 1,
    textAlign: "left",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#fef2f2", // Keeping red-ish for error visibility
    color: COLORS.red,
    borderRadius: "8px",
    fontSize: "13px",
    width: "100%",
    border: `1px solid ${COLORS.red}`,
  },
  infoBox: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    backgroundColor: COLORS.primaryLight,
    border: `1px solid ${COLORS.primary}`,
    color: COLORS.textPrimary,
    fontSize: "13px",
  },
  successBox: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "8px",
    backgroundColor: "#ecfdf3",
    border: "1px solid #86efac",
    color: "#166534",
    fontSize: "13px",
    fontWeight: "600",
  },
};

const UploadSurveyFile = ({ apiBase, authHeader, onQuestionsImported }) => {
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [reviewMessage, setReviewMessage] = useState("");

  const normalizeImportedQuestions = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((q, i) => {
        const text = typeof q === "string" ? q : q?.text || q?.question || "";
        return {
          id: Date.now() + i,
          text: String(text || "").trim(),
        };
      })
      .filter((q) => q.text.length > 0);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setWarnings([]);
    setReviewMessage("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiBase}/api/surveys/extract-questions/`, {
        method: "POST",
        headers: {
          ...(authHeader || {}),
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      const extracted = normalizeImportedQuestions(data?.questions);
      setWarnings(Array.isArray(data?.warnings) ? data.warnings : []);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          data?.error ||
          "Failed to process this file. Try using clearer numbering and spacing between questions."
        );
      }

      if (!extracted.length) {
        throw new Error("No questions detected in this file.");
      }

      setFileName(file.name);
      setReviewMessage(
        data?.review_message || "Please review the questions before submission and edit them as needed."
      );

      if (onQuestionsImported) {
        onQuestionsImported(extracted, {
          warnings: Array.isArray(data?.warnings) ? data.warnings : [],
          reviewMessage: data?.review_message,
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to parse file.");
      setFileName(null);
      if (onQuestionsImported) {
        onQuestionsImported([], { error: true });
      }
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.infoBox}>
        <div style={{ fontWeight: "700", marginBottom: "6px" }}>Preferred source format tips</div>
        <div>1. Use numbering like 1. or 1) or 1- at the beginning of each question.</div>
        <div>2. Keep a blank line between questions for better detection.</div>
        <div>3. For PDF, use selectable typed text (not handwritten/scanned images).</div>
      </div>

      {!fileName ? (
        <label style={styles.dropZone}>
          <input
            type="file"
            accept=".csv,.json,.txt,.md,.docx,.pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={isUploading}
          />
          <Upload
            size={32}
            color={COLORS.textMuted}
            style={{ marginBottom: "12px" }}
          />
          <div style={{ color: COLORS.textPrimary, fontWeight: "600" }}>
            {isUploading ? "Processing file..." : "Click to Upload"}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: COLORS.textMuted,
              marginTop: "4px",
            }}
          >
            Supported: DOCX, PDF, TXT, MD, CSV, JSON
          </div>
        </label>
      ) : (
        <div style={styles.fileInfo}>
          <FileText size={20} color={COLORS.primary} />
          <span style={styles.fileName}>{fileName}</span>
          <CheckCircle2 size={20} color={COLORS.primary} />
          <button
            onClick={() => {
              setFileName(null);
              setWarnings([]);
              setReviewMessage("");
              if (onQuestionsImported) onQuestionsImported([], { cleared: true });
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={18} color={COLORS.textMuted} />
          </button>
        </div>
      )}

      {reviewMessage && (
        <div style={styles.successBox}>{reviewMessage}</div>
      )}

      {warnings.length > 0 && (
        <div style={styles.infoBox}>
          <div style={{ fontWeight: "700", marginBottom: "6px" }}>File-specific warnings</div>
          {warnings.map((warning, idx) => (
            <div key={idx}>{warning}</div>
          ))}
        </div>
      )}

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
};

export default UploadSurveyFile;
