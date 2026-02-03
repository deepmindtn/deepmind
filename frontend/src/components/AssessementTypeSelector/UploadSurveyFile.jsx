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
};

const UploadSurveyFile = ({ onQuestionsImported }) => {
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;

      try {
        let questions = [];

        if (file.name.toLowerCase().endsWith(".json")) {
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed))
            throw new Error("JSON must be an array of questions.");

          questions = parsed.map((q, i) => ({
            id: Date.now() + i,
            text: typeof q === "string" ? q : q.text || q.question || "",
          }));
        } else if (file.name.toLowerCase().endsWith(".csv")) {
          const lines = content
            .split(/\r\n|\n|\r/)
            .filter((line) => line.trim() !== "");
          if (lines.length < 2)
            throw new Error("CSV file is empty or missing headers.");

          const firstLine = lines[0];
          const delimiter = firstLine.includes(";") ? ";" : ",";
          const headers = firstLine
            .toLowerCase()
            .split(delimiter)
            .map((h) => h.trim());

          let questionColIndex = headers.findIndex(
            (h) => h.includes("question") || h.includes("text")
          );
          if (questionColIndex === -1) {
            questionColIndex = headers.length > 1 ? 1 : 0;
          }

          questions = lines.slice(1).map((line, i) => {
            const cols = line.split(delimiter);
            let text = cols[questionColIndex] || cols[0] || "";
            text = text.replace(/^"|"$/g, "").trim();
            return { id: Date.now() + i, text: text };
          });
        } else {
          throw new Error("Unsupported file type. Please upload .csv or .json");
        }

        const validQuestions = questions.filter(
          (q) => q.text && q.text.length > 0
        );
        if (validQuestions.length === 0)
          throw new Error("No valid questions found in file.");

        if (onQuestionsImported) onQuestionsImported(validQuestions);
      } catch (err) {
        setError(err.message || "Failed to parse file.");
        setFileName(null);
        if (onQuestionsImported) onQuestionsImported([]);
      } finally {
        e.target.value = null;
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={styles.container}>
      {!fileName ? (
        <label style={styles.dropZone}>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <Upload
            size={32}
            color={COLORS.textMuted}
            style={{ marginBottom: "12px" }}
          />
          <div style={{ color: COLORS.textPrimary, fontWeight: "600" }}>
            Click to Upload
          </div>
          <div
            style={{
              fontSize: "12px",
              color: COLORS.textMuted,
              marginTop: "4px",
            }}
          >
            CSV or JSON (Column: "Questions" or "Text")
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
              if (onQuestionsImported) onQuestionsImported([]);
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

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
};

export default UploadSurveyFile;
