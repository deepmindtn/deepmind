import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Shield,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import StructuredReport from "./StructuredReport";

const SCALE = [
  "0. Pas du tout vrai",
  "1. Rarement vrai",
  "2. Parfois vrai",
  "3. Souvent vrai",
  "4. Presque toujours vrai",
];

const QUESTIONS = [
  "Je suis capable de m'adapter quand des changements surviennent.",
  "Je peux gérer peu importe ce qui arrive.",
  "J'essaie de voir le côté positif des choses quand je fais face à des problèmes.",
  "Faire face au stress me renforce.",
  "J'ai tendance à rebondir après des difficultés.",
  "Je peux atteindre mes objectifs même en cas d'obstacles.",
  "Sous pression, je me concentre et je pense clairement.",
  "Je ne me laisse pas décourager par l'échec.",
  "Je peux gérer des sentiments désagréables ou douloureux.",
  "Je tiens face aux épreuves car j'ai déjà vécu des difficultés.",
];

const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  shadowMd: "var(--shadow-md)",
};

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
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
  },
  likertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(105px, 1fr))",
    gap: "12px",
    marginTop: "8px",
  },
  likertOption: (isSelected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 8px",
    borderRadius: "12px",
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: isSelected ? `${COLORS.primary}10` : COLORS.cardBg,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    height: "100%",
  }),
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "32px",
  },
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
    color: variant === "primary" ? "#ffffff" : COLORS.textPrimary,
    transition: "all 0.2s",
    opacity: variant === "disabled" ? 0.5 : 1,
    pointerEvents: variant === "disabled" ? "none" : "auto",
    boxShadow: variant === "primary" ? COLORS.shadowMd : "none",
  }),
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "24px",
  },
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .likert-hover:hover { border-color: var(--primary) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: var(--primary-light); color: var(--primary); border-color: var(--primary); }
  .loading-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

function getScoreColor(total) {
  if (total >= 30) return "#22c55e";
  if (total >= 20) return "#eab308";
  return "#ef4444";
}

export default function CDRISCTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const hrToken = localStorage.getItem("access");

  const getFetchConfig = () => {
    if (isCandidate) {
      return {
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Token": candidateToken,
        },
      };
    }
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hrToken}`,
      },
    };
  };

  const [answers, setAnswers] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const perPage = 5;
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  const pageQuestions = QUESTIONS.slice((step - 1) * perPage, step * perPage);
  const canNext = pageQuestions.every((_, index) => {
    const qid = (step - 1) * perPage + index + 1;
    return answers[qid] !== undefined;
  });

  const percent = Math.round((Math.min(QUESTIONS.length, Object.keys(answers).length) / QUESTIONS.length) * 100);

  const metrics = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + Number(b), 0);
    return { total, average: (total / 10).toFixed(2) };
  }, [answers]);

  useEffect(() => {
    if (!assignmentId) return;
    const config = getFetchConfig();
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: config.headers })
      .then((r) => {
        if (!r.ok) {
          alert("Invalid or inaccessible assignment. Please start from My Assessments.");
          navigate("/my-assessments");
          return Promise.reject(new Error("Invalid assignment"));
        }
        return r.json();
      })
      .then((data) => {
        if (data && data.status === "COMPLETED") {
          if (data.answers) setAnswers(data.answers);
          if (data.ai_report) {
            try {
              setAiReport(JSON.parse(data.ai_report));
            } catch {
              setAiReport(data.ai_report);
            }
          }
          setStep(totalPages + 1);
        }
      })
      .catch(() => {
        alert("Invalid or inaccessible assignment. Please start from My Assessments.");
        navigate("/my-assessments");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  async function submit() {
    if (Object.keys(answers).length !== 10) {
      alert("Veuillez repondre a toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const config = getFetchConfig();
      const res = await fetch(`${API_BASE}/api/cdrisc/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur generation rapport.");
      const reportObj = data.report || null;

      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
          answers,
          metrics,
          ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : reportObj || "",
          assessment_type: "CDRISC10",
          overwrite: true,
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.detail || submitData?.error || "Erreur lors du submit.");

      setAiReport(reportObj);
      setStep(totalPages + 1);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    const reportStr = typeof aiReport === "object" && aiReport !== null ? JSON.stringify(aiReport, null, 2) : aiReport || "";
    const blob = new Blob([reportStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cdrisc-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.mainWrapper}>
      <style>{animationStyles}</style>

      <div style={styles.heroSection}>
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.heroIconBox}>
              <Shield size={30} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: 0 }}>
                CD-RISC-10
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                Évaluation de la résilience psychologique
              </p>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: COLORS.primary }}>
              {step > totalPages ? "Terminé" : `${step === 0 ? 0 : percent}% complété`}
            </span>
          </div>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar(step === 0 ? 0 : percent)} />
        </div>
      </div>

      <div style={styles.contentBody}>
        {step === 0 && (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "60px 40px" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "20px",
                  backgroundColor: COLORS.primaryLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 28px",
                  boxShadow: COLORS.shadowMd,
                }}
              >
                <Shield size={40} color={COLORS.primary} />
              </div>

              <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "14px", color: COLORS.textPrimary }}>
                Bienvenue au test CD-RISC-10
              </h2>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, lineHeight: "1.6", marginBottom: "26px" }}>
                Indiquez à quel point chaque affirmation est vraie pour vous sur une échelle de 0 à 4.
              </p>

              <div
                style={{
                  backgroundColor: COLORS.primaryLight,
                  padding: "16px",
                  borderRadius: "12px",
                  display: "flex",
                  gap: "12px",
                  marginBottom: "30px",
                  color: COLORS.primary,
                  alignItems: "flex-start",
                  textAlign: "left",
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "14px", lineHeight: "1.5" }}>
                  Outil indicatif et non clinique. Répondez en pensant à votre fonctionnement habituel.
                </span>
              </div>

              <button
                style={{ ...styles.btn("primary"), margin: "0 auto", width: "fit-content" }}
                className="btn-hover"
                onClick={() => setStep(1)}
              >
                Commencer le test <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step > 0 && step <= totalPages && (
          <div className="animate-fade-in">
            {pageQuestions.map((questionText, localIndex) => {
              const qid = (step - 1) * perPage + localIndex + 1;
              return (
                <div key={qid} style={styles.questionCard}>
                  <div style={styles.questionTitle}>
                    <span style={{ color: COLORS.primary, opacity: 0.8, flexShrink: 0 }}>Q{qid}.</span>
                    <span>{questionText}</span>
                  </div>

                  <div style={styles.likertGrid}>
                    {SCALE.map((label, idx) => {
                      const isSelected = answers[qid] === idx;
                      const scaleText = label.split(". ")[1] || label;
                      return (
                        <div
                          key={idx}
                          style={styles.likertOption(isSelected)}
                          className="likert-hover"
                          onClick={() => setAnswers((a) => ({ ...a, [qid]: idx }))}
                        >
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: "700",
                              color: isSelected ? COLORS.primary : COLORS.textMuted,
                              marginBottom: "4px",
                            }}
                          >
                            {idx}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: isSelected ? COLORS.primary : COLORS.textSecondary,
                              lineHeight: "1.2",
                            }}
                          >
                            {scaleText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={styles.navBar}>
              <button
                style={styles.btn(step === 1 ? "disabled" : "ghost")}
                className="btn-ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                <ChevronLeft size={18} /> Retour
              </button>

              {step < totalPages ? (
                <button
                  style={styles.btn(canNext ? "primary" : "disabled")}
                  className="btn-hover"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext}
                >
                  Suivant <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  style={styles.btn(canNext ? "primary" : "disabled")}
                  className="btn-hover"
                  onClick={submit}
                  disabled={!canNext || loading}
                >
                  {loading ? <Loader2 size={18} className="loading-spin" /> : null}
                  {loading ? "Analyse..." : "Voir mes resultats"}
                </button>
              )}
            </div>
          </div>
        )}

        {step > totalPages && (
          <div className="animate-fade-in" id="results-root">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "28px", color: COLORS.textPrimary }}>Résultats CD-RISC-10</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button style={styles.btn("ghost")} className="btn-ghost" onClick={downloadReport}>
                  <Download size={18} /> Télécharger
                </button>
                <button
                  style={styles.btn("ghost")}
                  className="btn-ghost"
                  onClick={() => {
                    setAnswers({});
                    setAiReport(null);
                    setStep(1);
                  }}
                >
                  <RotateCcw size={18} /> Recommencer
                </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              <div style={styles.questionCard}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: COLORS.textPrimary, marginBottom: "14px" }}>
                  Score global de résilience
                </div>
                <div style={{ minHeight: "220px" }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[{ label: "Résilience", value: metrics.total }]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.borderColor} />
                      <XAxis type="number" domain={[0, 40]} stroke={COLORS.textMuted} />
                      <YAxis type="category" dataKey="label" width={90} stroke={COLORS.textMuted} />
                      <Tooltip formatter={(value) => [`${value} / 40`, "Score"]} />
                      <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={36}>
                        <Cell fill={getScoreColor(metrics.total)} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: "8px", fontSize: "18px", color: COLORS.textSecondary }}>
                  Score total : <b style={{ color: getScoreColor(metrics.total) }}>{metrics.total}</b> / 40
                </div>
                <div style={{ marginTop: "4px", fontSize: "18px", color: COLORS.textSecondary }}>
                  Moyenne : <b>{metrics.average}</b>
                </div>
              </div>

              {aiReport && (
                <div style={styles.questionCard}>
                  <div
                    style={{
                      backgroundColor: COLORS.primaryLight,
                      padding: "16px",
                      borderRadius: "12px",
                      display: "flex",
                      gap: "12px",
                      color: COLORS.primary,
                      marginBottom: "16px",
                    }}
                  >
                    <BrainCircuit size={24} />
                    <div>
                      <strong style={{ display: "block", marginBottom: "4px" }}>Analyse IA</strong>
                      <span style={{ fontSize: "14px" }}>Interprétation personnalisée de votre profil.</span>
                    </div>
                  </div>
                  <div style={{ color: COLORS.textSecondary, lineHeight: "1.7" }}>
                    <StructuredReport report={aiReport} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
