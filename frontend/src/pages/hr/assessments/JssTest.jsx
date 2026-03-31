import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, RotateCcw, ArrowRight, ArrowLeft, Briefcase } from "lucide-react";
import StructuredReport from "./StructuredReport";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar, PolarAngleAxis, Cell
} from "recharts";

/* ---------- Theme Colors ---------- */
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  shadowMd: "var(--shadow-md)",
  green: "#22c55e",
  blue: "#3b82f6",
  orange: "#f59e0b",
};

/* ---------- Likert Scale ---------- */
const SCALE = [
  "1. Fortement en désaccord",
  "2. Plutôt en désaccord",
  "3. Légèrement en désaccord",
  "4. Légèrement d’accord",
  "5. Plutôt d’accord",
  "6. Fortement d’accord"
];

/* ---------- Styles ---------- */
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
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "32px 48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  heroIconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: COLORS.shadowMd,
    marginRight: "20px",
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    margin: "0 0 4px 0",
  },
  heroSubtitle: {
    fontSize: "14px",
    color: COLORS.textSecondary,
    margin: "0",
  },
  progressContainer: {
    height: "8px",
    backgroundColor: COLORS.primaryLight,
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressBar: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    backgroundColor: COLORS.primary,
    transition: "width 0.4s ease-in-out",
  }),
  contentBody: {
    flex: 1,
    padding: "40px 48px",
    backgroundColor: COLORS.bgMain,
  },
  introBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "48px",
    border: `1px solid ${COLORS.borderColor}`,
    textAlign: "center",
    boxShadow: COLORS.shadowMd,
  },
  introTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: "16px",
  },
  introText: {
    fontSize: "16px",
    color: COLORS.textSecondary,
    marginBottom: "32px",
    lineHeight: "1.6",
  },
  questionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "32px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "24px",
    boxShadow: COLORS.shadowMd,
  },
  questionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: "24px",
  },
  optionGrid: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
  },
  optionLabel: (isSelected) => ({
    flex: 1,
    minWidth: "65px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 8px",
    borderRadius: "12px",
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: isSelected ? `${COLORS.primary}08` : COLORS.cardBg,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  }),
  optionNumber: (isSelected) => ({
    fontSize: "16px",
    fontWeight: "800",
    color: isSelected ? COLORS.primary : COLORS.textSecondary,
    marginBottom: "6px",
  }),
  optionText: (isSelected) => ({
    fontSize: "11px",
    lineHeight: "1.2",
    color: isSelected ? COLORS.primary : COLORS.textSecondary,
    fontWeight: isSelected ? "600" : "400",
  }),
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "32px",
  },
  btn: (variant = "primary") => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    border: variant === "primary" ? "none" : `1px solid ${COLORS.borderColor}`,
    backgroundColor: variant === "primary" ? COLORS.primary : "transparent",
    color: variant === "primary" ? "#ffffff" : COLORS.textPrimary,
    transition: "all 0.2s",
    opacity: variant === "disabled" ? 0.5 : 1,
    pointerEvents: variant === "disabled" ? "none" : "auto",
    boxShadow: variant === "primary" ? COLORS.shadowMd : "none",
  }),
  resultsGrid: {
    display: "grid",
  },
  chartCard: {
    gridColumn: "1 / -1",
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "20px 20px 8px 20px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowMd,
    marginBottom: "20px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "20px",
    marginBottom: "24px",
  },
  dimensionsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "20px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowMd,
  },
  gaugeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "28px 20px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowMd,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  resultCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowMd,
  },
  resultTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: "10px",
  },
  resultValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: "8px",
  },
  resultSubtext: {
    fontSize: "14px",
    color: COLORS.textSecondary,
  },
  chartContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowMd,
  },
  dimensionList: {
    marginTop: "4px",
    listStyle: "none",
    padding: "0",
  },
  dimensionItem: {
    padding: "8px 0",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    fontSize: "12px",
    color: COLORS.textSecondary,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },
  satisfactionBadge: (level) => {
    let bgColor = "#f3f4f6";
    let textColor = COLORS.textSecondary;
    if (level.includes("élevée")) {
      bgColor = "#dcfce7";
      textColor = "#15803d";
    } else if (level.includes("très bonne")) {
      bgColor = "#dcfce7";
      textColor = "#15803d";
    } else if (level.includes("Bonne") || level.includes("bonne")) {
      bgColor = "#fef3c7";
      textColor = "#92400e";
    } else if (level.includes("odérée")) {
      bgColor = "#fed7aa";
      textColor = "#b45309";
    } else if (level.includes("aible")) {
      bgColor = "#fecaca";
      textColor = "#b91c1c";
    }
    return {
      display: "inline-block",
      backgroundColor: bgColor,
      color: textColor,
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      whiteSpace: "nowrap",
    };
  },
  reportCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowMd,
    marginTop: "20px",
  },
  reportTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: "16px",
  },
  reportContent: {
    fontSize: "13px",
    lineHeight: "1.7",
    color: COLORS.textSecondary,
    whiteSpace: "pre-wrap",
    fontFamily: "inherit",
    maxHeight: "600px",
    overflowY: "auto",
  },
  resultsHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
  },
  resultsTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  resultsActions: {
    display: "flex",
    gap: "12px",
  },
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .jss-option-hover:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .jss-btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .jss-loading-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

/* Short, clear dimension labels */
const DIMENSIONS = {
  pay: "Rémunération",
  benefits: "Avantages",
  promotion: "Promotion",
  supervision: "Supervision",
  working_conditions: "Conditions",
  coworkers: "Collègues",
  work_nature: "Nature",
  policies: "Politiques",
  communication: "Communication",
};

/* Get color based on score (0-24 range) */
function getScoreColor(score) {
  if (score <= 8) return "#ef4444";   // Red: Very low
  if (score <= 12) return "#f97316";  // Orange: Low
  if (score <= 16) return "#eab308";  // Yellow: Moderate
  if (score <= 20) return "#84cc16";  // Lime: High
  return "#22c55e";                   // Green: Very high
}

const QUESTIONS = [
  // 1. Pay
  { id: 1, dim: "pay", text: "Je suis satisfait(e) de la rémunération que je reçois." },
  { id: 2, dim: "pay", text: "Mon salaire est compétitif comparé à celui d'autres dans mon domaine." },
  { id: 3, dim: "pay", text: "Je suis satisfait(e) des augmentations que j'ai reçues." },
  { id: 4, dim: "pay", text: "La rémunération est équitable par rapport à mes responsabilités." },

  // 2. Benefits
  { id: 5, dim: "benefits", text: "Les avantages sociaux sont satisfaisants." },
  { id: 6, dim: "benefits", text: "Les avantages répondent à mes besoins." },
  { id: 7, dim: "benefits", text: "J'apprécie les avantages offerts par mon employeur." },
  { id: 8, dim: "benefits", text: "Les avantages sont compétitifs." },

  // 3. Promotion
  { id: 9, dim: "promotion", text: "Les opportunités de promotion dans mon organisation sont suffisantes." },
  { id: 10, dim: "promotion", text: "Je suis satisfait(e) des politiques de promotion." },
  { id: 11, dim: "promotion", text: "La promotion est basée sur le mérite." },
  { id: 12, dim: "promotion", text: "J’ai une chance équitable de promotion." },

  // 4. Supervision
  { id: 13, dim: "supervision", text: "Mon superviseur est compétent." },
  { id: 14, dim: "supervision", text: "Mon superviseur me traite avec respect." },
  { id: 15, dim: "supervision", text: "Je peux compter sur le soutien de mon superviseur." },
  { id: 16, dim: "supervision", text: "Mon superviseur communique efficacement." },

  // 5. Working Conditions
  { id: 17, dim: "working_conditions", text: "Les conditions de travail sont bonnes." },
  { id: 18, dim: "working_conditions", text: "Je suis satisfait(e) de la sécurité au travail." },
  { id: 19, dim: "working_conditions", text: "Mon espace de travail est adéquat." },
  { id: 20, dim: "working_conditions", text: "L'environnement de travail est propice à la productivité." },

  // 6. Coworkers
  { id: 21, dim: "coworkers", text: "Je m'entends bien avec mes collègues." },
  { id: 22, dim: "coworkers", text: "L'ambiance de travail est agréable." },
  { id: 23, dim: "coworkers", text: "Je peux compter sur mes collègues." },
  { id: 24, dim: "coworkers", text: "Les conflits au travail sont gérés efficacement." },

  // 7. Work Nature
  { id: 25, dim: "work_nature", text: "J'aime le contenu de mon travail." },
  { id: 26, dim: "work_nature", text: "Mon travail est intéressant et stimulant." },
  { id: 27, dim: "work_nature", text: "Je trouve mon travail important et significatif." },
  { id: 28, dim: "work_nature", text: "Je suis satisfait(e) de la variété des tâches." },

  // 8. Policies
  { id: 29, dim: "policies", text: "Les politiques de l'organisation sont justes." },
  { id: 30, dim: "policies", text: "L'organisation communique bien sur les politiques." },
  { id: 31, dim: "policies", text: "Les règles sont appliquées équitablement." },
  { id: 32, dim: "policies", text: "Les politiques soutiennent le bien-être des employés." },

  // 9. Communication
  { id: 33, dim: "communication", text: "On me tient informé(e) des décisions importantes." },
  { id: 34, dim: "communication", text: "La communication interne est efficace." },
  { id: 35, dim: "communication", text: "Je peux exprimer mes idées librement." },
  { id: 36, dim: "communication", text: "Les canaux de communication sont suffisants." },
];

/* ---------- Interpretation ---------- */
function interpretSub(score) {
  if (score >= 19) return "Très haute satisfaction";
  if (score >= 14) return "Satisfaction modérée";
  if (score >= 9) return "Faible satisfaction";
  return "Très faible satisfaction";
}

/* ---------- Scoring ---------- */
function computeScores(answers) {
  const dimScores = {};
  Object.keys(DIMENSIONS).forEach((d) => (dimScores[d] = 0));

  QUESTIONS.forEach((q) => {
    if (answers[q.id]) dimScores[q.dim] += answers[q.id];
  });

  const global = Object.values(dimScores).reduce((a, b) => a + b, 0);
  return { dimScores, global };
}

/* ---------- Component ---------- */
export default function JssTest() {
  const [params] = useSearchParams();

  // Auth Logic
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const getFetchConfig = useCallback(() => {
    if (isCandidate) {
      return {
        url: `${API_BASE}/api/assessments/candidate/${candidateToken}/`,
        headers: { "Content-Type": "application/json", "X-Candidate-Token": candidateToken }
      };
    } else {
      return {
        url: `${API_BASE}/api/assessments/${assignmentId}/`,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hrToken}` }
      };
    }
  }, [API_BASE, assignmentId, candidateToken, hrToken, isCandidate]);

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const questionsPerPage = 4;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);
  const percent = Math.round((Object.keys(answers).length / 36) * 100);

  // Load Assessment Data (Check if valid and if already completed)
  useEffect(() => {
    if (!assignmentId) return;
    const config = getFetchConfig();

    fetch(config.url, { headers: config.headers })
      .then((r) => {
        if (!r.ok) return Promise.reject();
        return r.json();
      })
      .then((data) => {
        if (data && data.status === 'COMPLETED') {
          if (data.answers) setAnswers(data.answers);
          if (data.ai_report) { try { setAiReport(JSON.parse(data.ai_report)); } catch { setAiReport(data.ai_report); } }
          setStep(totalPages + 1);
        }
      })
      .catch(() => {});
  }, [assignmentId, getFetchConfig, totalPages]);

  const pageQuestions = QUESTIONS.slice(
    (step - 1) * questionsPerPage,
    step * questionsPerPage
  );

  const metrics = useMemo(() => computeScores(answers), [answers]);
  const overviewData = Object.entries(metrics.dimScores).map(([k, v]) => ({
    name: DIMENSIONS[k],
    value: v,
    interpretation: interpretSub(v),
  }));

  async function submit() {
    if (Object.keys(answers).length !== 36) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    const config = getFetchConfig();

    try {
      const reportRes = await fetch(`${API_BASE}/api/jss/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      const reportData = await reportRes.json();
      if (!reportRes.ok) throw new Error(reportData?.error || "Erreur génération rapport.");
      const reportObj = reportData.report || null;

      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics, ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : (reportObj || ""), overwrite: true }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.error || "Erreur lors du submit.");

      setAiReport(reportObj);
      setStep(totalPages + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    const _reportStr = typeof aiReport === "object" && aiReport !== null ? JSON.stringify(aiReport, null, 2) : (aiReport || "");
    const blob = new Blob([_reportStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jss-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <style>{animationStyles}</style>
      <div style={styles.mainWrapper}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.headerRow}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={styles.heroIconBox}>
                <Briefcase size={28} />
              </div>
              <div style={styles.heroText}>
                <h1 style={styles.heroTitle}>Job Satisfaction Survey (JSS)</h1>
                <p style={styles.heroSubtitle}>Évaluation de la satisfaction au travail</p>
              </div>
            </div>
          </div>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar(percent)} />
          </div>
          <div style={{ fontSize: "12px", color: COLORS.textSecondary, marginTop: "8px" }}>
            {percent}% — {Object.keys(answers).length} / 36 réponses
          </div>
        </div>

        {/* Content */}
        <div style={styles.contentBody}>
          {step === 0 && (
            <div style={styles.introBox} className="animate-fade-in">
              <h2 style={styles.introTitle}>Bienvenue</h2>
              <p style={styles.introText}>
                Répondez honnêtement aux 36 affirmations sur votre satisfaction au travail.
                <br/>
                Vos réponses sont confidentielles et utilisées uniquement pour cette évaluation.
              </p>
              <button style={styles.btn("primary")} className="jss-btn-hover" onClick={() => setStep(1)}>
                Commencer <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step > 0 && step <= totalPages && (
            <div>

              {/* Questions */}
              {pageQuestions.map((q) => (
                <div key={q.id} style={styles.questionCard} className="animate-fade-in">
                  <div style={styles.questionTitle}>Q{q.id}. {q.text}</div>
                  <div style={styles.optionGrid}>
                    {SCALE.map((label, idx) => {
                      const isSelected = answers[q.id] === idx + 1;
                      const scaleText = label.split(". ")[1] || label;
                      return (
                        <div
                          key={idx}
                          style={styles.optionLabel(isSelected)}
                          className="jss-option-hover"
                          onClick={() => setAnswers((a) => ({ ...a, [q.id]: idx + 1 }))}
                        >
                          <span style={styles.optionNumber(isSelected)}>{idx + 1}</span>
                          <span style={styles.optionText(isSelected)}>{scaleText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div style={styles.navBar}>
                <button
                  style={styles.btn(step === 1 ? "disabled" : "ghost")}
                  className="jss-btn-hover"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                >
                  <ArrowLeft size={18} /> Retour
                </button>
                {step < totalPages ? (
                  <button
                    style={styles.btn("primary")}
                    className="jss-btn-hover"
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Suivant <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    style={styles.btn(loading ? "disabled" : "primary")}
                    className="jss-btn-hover"
                    onClick={submit}
                    disabled={loading}
                  >
                    {loading ? "Génération..." : "Envoyer mes réponses"}
                  </button>
                )}
              </div>
            </div>
          )}

          {step > totalPages && (
            <div>
              <div style={styles.resultsHead}>
                <h2 style={styles.resultsTitle}>Résultats JSS</h2>
                <div style={styles.resultsActions}>
                  <button
                    style={styles.btn("primary")}
                    className="jss-btn-hover"
                    onClick={downloadReport}
                  >
                    <Download size={18} /> Télécharger
                  </button>
                  <button
                    style={styles.btn("primary")}
                    className="jss-btn-hover"
                    onClick={() => {
                      setAnswers({});
                      setStep(1);
                      setAiReport("");
                    }}
                  >
                    <RotateCcw size={18} /> Recommencer
                  </button>
                </div>
              </div>

              {/* Full-Width Chart */}
              <div style={styles.chartCard} className="animate-fade-in">
                <div style={styles.resultTitle}>Scores par Dimension</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={overviewData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" height={52} fontSize={13} fontWeight={500} interval={0} tickMargin={6} />
                    <YAxis domain={[0, 24]} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {overviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.value)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Two-Column: Details Left, Gauge Right */}
              <div style={styles.summaryGrid}>
                {/* Dimension Details - Left Column */}
                <div style={styles.dimensionsCard} className="animate-fade-in">
                  <div style={styles.resultTitle}>Détails par Dimension</div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginTop: "8px",
                  }}>
                    {overviewData.map((d) => {
                      const color = getScoreColor(d.value);
                      return (
                        <div key={d.name} style={{
                          backgroundColor: COLORS.bgMain,
                          borderRadius: "12px",
                          padding: "12px 14px",
                          border: `1px solid ${COLORS.borderColor}`,
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: COLORS.textPrimary }}>{d.name}</span>
                            <span style={{ fontSize: "15px", fontWeight: "800", color }}>{d.value}<span style={{ fontSize: "11px", fontWeight: "500", color: COLORS.textMuted }}>/24</span></span>
                          </div>
                          <div style={{ height: "4px", borderRadius: "2px", backgroundColor: COLORS.borderColor, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${(d.value / 24) * 100}%`, backgroundColor: color, borderRadius: "2px" }} />
                          </div>
                          <span style={{ fontSize: "11px", color: COLORS.textSecondary, marginTop: "2px" }}>{d.interpretation}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Global Score Gauge - Right Column */}
                <div style={styles.gaugeCard} className="animate-fade-in">
                  <div style={{ ...styles.resultTitle, marginBottom: 0 }}>Score Global</div>
                  <div style={{ width: "100%", maxWidth: "280px", height: "155px", position: "relative" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={12}
                        data={[{ name: "Score", value: (metrics.global / 216) * 100, fill: getScoreColor(metrics.global / 9) }]}
                        startAngle={180}
                        endAngle={0}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={6} background />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div style={{
                      position: "absolute",
                      top: "62%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "46px", fontWeight: "800", color: getScoreColor(metrics.global / 9), lineHeight: 1 }}>
                        {metrics.global}
                      </div>
                      <div style={{ fontSize: "13px", color: COLORS.textSecondary, marginTop: "4px" }}>/ 216</div>
                    </div>
                  </div>
                  <span style={{ ...styles.satisfactionBadge(metrics.global <= 72 ? "Insatisfaction élevée" : metrics.global <= 108 ? "Modérée" : metrics.global <= 144 ? "Bonne" : "Très bonne satisfaction"), fontSize: "14px", padding: "6px 18px" }}>
                    {metrics.global <= 72 ? "Élevée" : metrics.global <= 108 ? "Modérée" : metrics.global <= 144 ? "Bonne" : "Très bonne"}
                  </span>
                </div>
              </div>

              {/* AI Report */}
              {aiReport && (
                <div style={styles.reportCard} className="animate-fade-in">
                  <div style={styles.reportTitle}>Rapport IA — Analyse JSS</div>
                  <div style={styles.reportContent}>
                    <StructuredReport report={aiReport} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
