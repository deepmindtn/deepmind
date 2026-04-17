import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  PolarAngleAxis,
} from "recharts";
import StructuredReport from "./StructuredReport";
import { exportAssessmentResultsPdf } from "../../../utils/exportAssessmentPdf";
import { buildAssessmentPdfMetadata } from "../../../utils/assessmentPdfMeta";
import {
  Lightbulb,
  BrainCircuit,
  ArrowRight,
  ArrowLeft,
  Download,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from "lucide-react";

// -----------------------
// 1. DATA & CONFIG
// -----------------------

const COLORS = {
  primary: "var(--primary)", // Main Blue
  primaryLight: "var(--primary-light)",
  bgMain: "var(--bg-main)", // Light Grey bg
  cardBg: "var(--card-bg)", // White
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  success: "#10b981",
  gold: "#f59e0b", // Creativity/Idea color
};

// RIBS 5-Point Scale
const LIKERT_VALUES = [
  { val: 1, label: "Pas du tout vrai" },
  { val: 2, label: "Rarement vrai" },
  { val: 3, label: "Parfois vrai" },
  { val: 4, label: "Souvent vrai" },
  { val: 5, label: "Tout à fait vrai" },
];

const QUESTIONS = [
  "J’ai souvent beaucoup d’idées.",
  "J’ai des idées originales.",
  "J’ai plus d’idées que la plupart des gens.",
  "Je trouve fréquemment de nouvelles façons de faire les choses.",
  "Je suis une personne imaginative.",
  "J’ai des idées créatives.",
  "J’ai beaucoup d’idées différentes.",
  "Je trouve souvent des solutions alternatives à un problème.",
  "J’ai des idées intéressantes.",
  "J’ai souvent des idées que les autres trouvent inhabituelles.",
];

// -----------------------
// 2. LOGIC HELPERS
// -----------------------

// -----------------------
// 3. STYLES (CSS-in-JS)
// -----------------------

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
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.gold,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: `0 8px 16px -4px rgba(245, 158, 11, 0.3)`,
    marginRight: "20px",
  },
  progressContainer: {
    height: "8px",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressBar: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    backgroundColor: COLORS.gold,
    transition: "width 0.4s ease-in-out",
  }),
  contentBody: {
    flex: 1,
    padding: "40px 48px",
    backgroundColor: COLORS.bgMain,
  },
  questionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "32px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  likertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px",
    marginTop: "24px",
  },
  likertOption: (isSelected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 8px",
    borderRadius: "12px",
    border: `2px solid ${isSelected ? COLORS.gold : COLORS.borderColor}`,
    backgroundColor: isSelected ? `${COLORS.gold}10` : COLORS.cardBg,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  }),
  btn: (variant) => ({
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
    color: variant === "primary" ? "#fff" : COLORS.textPrimary,
    transition: "all 0.2s",
    opacity: variant === "disabled" ? 0.5 : 1,
    pointerEvents: variant === "disabled" ? "none" : "auto",
  }),
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
  },
  aiReportBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "24px",
    whiteSpace: "pre-wrap",
    lineHeight: "1.6",
    color: COLORS.textSecondary,
    fontSize: "15px",
    maxHeight: "500px",
    overflowY: "auto",
  },
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .likert-hover:hover { border-color: ${COLORS.gold}; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: rgba(0,0,0,0.05); color: ${COLORS.primary}; }
`;

// -----------------------
// 4. MAIN COMPONENT
// -----------------------

export default function RIBSTest() {
  const [params] = useSearchParams();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // --- Auth Logic ---
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate
    ? sessionStorage.getItem("candidateAssignmentId")
    : params.get("assignment");

  const getFetchConfig = () => {
    if (isCandidate) {
      return {
        url: `${API_BASE}/api/assessments/candidate/${candidateToken}/`,
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Token": candidateToken,
        },
      };
    } else {
      return {
        url: `${API_BASE}/api/assessments/${assignmentId}/`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hrToken}`,
        },
      };
    }
  };

  // --- State ---
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [assignmentInfo, setAssignmentInfo] = useState(null);

  // --- Load Existing Results ---
  useEffect(() => {
    if (!assignmentId) return;
    const config = getFetchConfig();

    fetch(config.url, { headers: config.headers })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setAssignmentInfo(data || null);
        if (data && data.status === 'COMPLETED') {
          if (data.answers) setAnswers(data.answers);
          if (data.ai_report) { try { setAiReport(JSON.parse(data.ai_report)); } catch { setAiReport(data.ai_report); } }
          setStep(totalPages + 1);
        }
      })
      .catch(() => {});
  }, [assignmentId]);

  // --- Navigation & Metrics ---
  const perPage = 5;
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  const pageQuestions = QUESTIONS.slice(
    (step - 1) * perPage,
    step * perPage
  ).map((text, i) => ({
    id: (step - 1) * perPage + i + 1,
    text,
  }));

  const canNext = pageQuestions.every((q) => answers[q.id]);
  const percent = (Object.keys(answers).length / QUESTIONS.length) * 100;

  const metrics = useMemo(() => {
    const vals = Object.values(answers).map(Number);
    if (!vals.length) return { average: 0, total: 0 };
    const total = vals.reduce((a, b) => a + b, 0);
    const average = (total / vals.length).toFixed(1);
    return { average, total };
  }, [answers]);

  const chartData = [
    { name: "Score", value: parseFloat(metrics.average), fill: COLORS.gold },
  ];

  // --- Actions ---

  async function submit() {
    setLoading(true);
    const config = getFetchConfig();
    try {
      // 1. Generate Report
      const questionsDict = Object.fromEntries(
        QUESTIONS.map((text, i) => [String(i + 1), text])
      );
      const reportRes = await fetch(
        `${API_BASE}/api/ribs/report/${assignmentId}/`,
        {
          method: "POST",
          headers: config.headers,
          body: JSON.stringify({ answers, metrics, questions: questionsDict }),
        }
      );
      const reportData = await reportRes.json();
      const reportObj = reportData.report || null;

      // 2. Submit Data
      const submitRes = await fetch(
        `${API_BASE}/api/assessments/${assignmentId}/submit/`,
        {
          method: "POST",
          headers: config.headers,
          body: JSON.stringify({
            answers,
            metrics,
            ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : (reportObj || ""),
            assessment_type: "RIBS",
            overwrite: true,
          }),
        }
      );

      if (!submitRes.ok) throw new Error("Erreur lors de la soumission.");

      setAiReport(reportObj);
      setStep(totalPages + 1);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    const metadata = buildAssessmentPdfMetadata({
      assignment: assignmentInfo,
      testName: "RIBS",
    });
    const blob = await exportAssessmentResultsPdf({
      rootId: "results-root",
      fileName: `ribs-result-${assignmentId}.pdf`,
      metadata,
    });
    if (blob && assignmentId) {
      const fd = new FormData();
      fd.append("file", blob, `ribs-${assignmentId}.pdf`);
      const headers = isCandidate
        ? { "X-Candidate-Token": candidateToken }
        : { Authorization: `Bearer ${hrToken}` };
      await fetch(`${API_BASE}/api/assessments/${assignmentId}/upload-pdf/`, {
        method: "PUT",
        headers: headers,
        body: fd,
      }).catch(console.error);
    }
  }

  return (
    <div style={styles.mainWrapper}>
      <style>{animationStyles}</style>

      {/* --- HERO --- */}
      <div style={styles.heroSection}>
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.heroIconBox}>
              <Lightbulb size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                RIBS
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                Runco Ideational Behavior Scale
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: COLORS.gold,
              }}
            >
              {Math.round(percent)}% Complété
            </span>
          </div>
        </div>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(percent)} />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div style={styles.contentBody}>
        {/* INTRO */}
        {step === 0 && (
          <div
            className="animate-fade-in"
            style={{
              textAlign: "center",
              maxWidth: "600px",
              margin: "40px auto",
            }}
          >
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "20px",
                backgroundColor: COLORS.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: COLORS.shadowHuge,
              }}
            >
              <Lightbulb size={34} color={COLORS.gold} />
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "24px",
              }}
            >
              Bienvenue au test RIBS
            </h2>
            <div
              style={{
                backgroundColor: COLORS.cardBg,
                padding: "24px",
                borderRadius: "16px",
                border: `1px solid ${COLORS.borderColor}`,
                textAlign: "left",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "16px",
                  color: COLORS.gold,
                }}
              >
                <AlertTriangle size={24} />
                <span style={{ fontWeight: "600" }}>
                  Auto-évaluation de la créativité
                </span>
              </div>
              <p style={{ color: COLORS.textSecondary, lineHeight: "1.6" }}>
                Ce questionnaire évalue la fréquence de vos comportements liés à
                la génération d'idées. Il n'y a pas de bonnes ou mauvaises
                réponses. Répondez spontanément.
              </p>
              <ul
                style={{
                  color: COLORS.textSecondary,
                  marginTop: "8px",
                  paddingLeft: "20px",
                }}
              >
                <li>10 affirmations</li>
                <li>Échelle de 1 à 5</li>
                <li>Durée : ~2 minutes</li>
              </ul>
            </div>
            <button
              style={{ ...styles.btn("primary"), margin: "0 auto", width: "fit-content" }}
              className="btn-hover"
              onClick={() => setStep(1)}
            >
              Commencer <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* QUESTIONS */}
        {step > 0 && step <= totalPages && (
          <div className="animate-fade-in">
            {pageQuestions.map((q) => (
              <div key={q.id} style={styles.questionCard}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ color: COLORS.gold, marginRight: "8px" }}>
                    Q{q.id}.
                  </span>
                  {q.text}
                </div>

                <div style={styles.likertGrid}>
                  {LIKERT_VALUES.map((opt) => {
                    const isSelected = answers[q.id] === opt.val;
                    return (
                      <div
                        key={opt.val}
                        style={styles.likertOption(isSelected)}
                        className="likert-hover"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.val }))
                        }
                      >
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: isSelected ? COLORS.gold : COLORS.textMuted,
                            marginBottom: "4px",
                          }}
                        >
                          {opt.val}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            color: isSelected
                              ? COLORS.gold
                              : COLORS.textSecondary,
                          }}
                        >
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "32px",
              }}
            >
              <button
                style={styles.btn("ghost")}
                className="btn-ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ArrowLeft size={18} /> Retour
              </button>

              {step < totalPages ? (
                <button
                  style={styles.btn(canNext ? "primary" : "disabled")}
                  className={canNext ? "btn-hover" : ""}
                  onClick={() => canNext && setStep((s) => s + 1)}
                >
                  Suivant <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  style={styles.btn(loading ? "disabled" : "primary")}
                  className={!loading ? "btn-hover" : ""}
                  onClick={submit}
                >
                  {loading ? (
                    <Loader2 className="loading-spin" size={18} />
                  ) : (
                    <>
                      Envoyer <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step > totalPages && (
          <div className="animate-fade-in" id="results-root">
            {/* Header Results */}
            <div style={{ ...styles.headerRow, marginBottom: "32px" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
                  Résultat RIBS
                </h2>
                <span style={{ color: COLORS.textSecondary }}>
                  Comportement Idéationnel
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px" }} data-pdf-exclude="true">
                <button
                  style={styles.btn("ghost")}
                  className="btn-ghost"
                  onClick={() => {
                    setAnswers({});
                    setStep(1);
                    setAiReport(null);
                  }}
                >
                  <RotateCcw size={18} /> Recommencer
                </button>
                <button
                  style={styles.btn("primary")}
                  className="btn-hover"
                  onClick={handleDownload}
                >
                  <Download size={18} /> PDF
                </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              {/* Chart / Score Card */}
              <div
                style={{
                  ...styles.questionCard,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "8px",
                    color: COLORS.textSecondary,
                  }}
                >
                  Score Moyen
                </h3>

                {/* Visual Gauge */}
                <div
                  style={{
                    width: "200px",
                    height: "200px",
                    position: "relative",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="80%"
                      outerRadius="100%"
                      barSize={10}
                      data={chartData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 5]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background
                        clockWise
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -10%)",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "42px",
                        fontWeight: "800",
                        color: COLORS.gold,
                        display: "block",
                      }}
                    >
                      {metrics.average}
                    </span>
                    <span style={{ fontSize: "14px", color: COLORS.textMuted }}>
                      / 5
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    textAlign: "center",
                    color: COLORS.textSecondary,
                  }}
                >
                  Total brut : <strong>{metrics.total}</strong> / 50
                </div>
              </div>

              {/* AI Report Column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {aiReport ? (
                  <div style={{ ...styles.questionCard, padding: "24px" }}>
                    <div style={{ 
                      backgroundColor: COLORS.primaryLight, 
                      padding: "16px", 
                      borderRadius: "12px", 
                      display: "flex", 
                      gap: "12px",
                      color: COLORS.primary,
                      marginBottom: "16px"
                    }}>
                      <BrainCircuit size={24} />
                      <div>
                        <strong style={{ display: "block", marginBottom: "4px" }}>Analyse IA</strong>
                        <span style={{ fontSize: "14px" }}>Interprétation personnalisée de votre profil.</span>
                      </div>
                    </div>
                    <div style={styles.aiReportBox}>
                      <StructuredReport report={aiReport} />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      ...styles.questionCard,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px",
                    }}
                  >
                    <p style={{ color: COLORS.textMuted }}>
                      Génération du rapport...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
