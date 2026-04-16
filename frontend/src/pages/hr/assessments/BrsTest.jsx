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
  ShieldCheck,
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Download,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import StructuredReport from "./StructuredReport";

const QUESTIONS = [
  { id: 1, text: "Je tends à rebondir rapidement après des difficultés." },
  { id: 2, text: "J'ai du mal à retrouver mon équilibre après le stress. (inversé)" },
  { id: 3, text: "Je suis capable de récupérer rapidement quand les choses tournent mal." },
  { id: 4, text: "Il m'est difficile de faire face aux événements stressants. (inversé)" },
  { id: 5, text: "Je récupère rapidement de moments difficiles." },
  { id: 6, text: "Il me faut du temps pour m'en remettre des problèmes ou du stress. (inversé)" },
];

const SCALE = [
  "1. Fortement en désaccord",
  "2. En désaccord",
  "3. Neutre",
  "4. D'accord",
  "5. Fortement d'accord",
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

function computeMetrics(answers) {
  const reverse = [2, 4, 6];
  const scores = QUESTIONS.map((q) => {
    let v = answers[q.id] || 0;
    if (reverse.includes(q.id) && v > 0) v = 6 - v;
    return v;
  }).filter((v) => v > 0);

  if (scores.length < 6) return null;

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return { average: avg.toFixed(2), scores };
}

export default function BrsTest() {
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
  const [step, setStep] = useState(0);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const perPage = 3;
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  const pageQuestions = QUESTIONS.slice((step - 1) * perPage, step * perPage);
  const canNext = pageQuestions.every((q) => answers[q.id] !== undefined);
  const percent = Math.round((Math.min(QUESTIONS.length, Object.keys(answers).length) / QUESTIONS.length) * 100);

  const metrics = useMemo(() => computeMetrics(answers), [answers]);

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
    if (Object.keys(answers).length !== 6) {
      alert("Veuillez repondre a toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const config = getFetchConfig();
      const localMetrics = computeMetrics(answers);

      const reportRes = await fetch(`${API_BASE}/api/brs/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics: localMetrics }),
      });
      const reportData = await reportRes.json();
      if (!reportRes.ok) throw new Error(reportData?.error || "Erreur generation rapport.");
      const reportObj = reportData.report || null;

      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
          answers,
          metrics: localMetrics,
          ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : reportObj || "",
          overwrite: true,
        }),
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
    const reportStr = typeof aiReport === "object" && aiReport !== null ? JSON.stringify(aiReport, null, 2) : aiReport || "";
    const blob = new Blob([reportStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brs-report-${assignmentId}.txt`;
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
              <ShieldCheck size={30} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: 0 }}>
                Brief Resilience Scale (BRS)
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                Capacité à rebondir face au stress
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
                <ShieldCheck size={40} color={COLORS.primary} />
              </div>

              <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "14px", color: COLORS.textPrimary }}>
                Bienvenue au test BRS
              </h2>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, lineHeight: "1.6", marginBottom: "26px" }}>
                Répondez aux 6 affirmations de 1 à 5 pour évaluer votre résilience psychologique.
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
                  Outil indicatif et non clinique. Répondez spontanément et honnêtement.
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
            {pageQuestions.map((q) => (
              <div key={q.id} style={styles.questionCard}>
                <div style={styles.questionTitle}>
                  <span style={{ color: COLORS.primary, opacity: 0.8, flexShrink: 0 }}>Q{q.id}.</span>
                  <span>{q.text}</span>
                </div>

                <div style={styles.likertGrid}>
                  {SCALE.map((label, idx) => {
                    const value = idx + 1;
                    const isSelected = answers[q.id] === value;
                    const scaleText = label.split(". ")[1] || label;
                    return (
                      <div
                        key={value}
                        style={styles.likertOption(isSelected)}
                        className="likert-hover"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: value }))}
                      >
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: isSelected ? COLORS.primary : COLORS.textMuted,
                            marginBottom: "4px",
                          }}
                        >
                          {value}
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
            ))}

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
                  {loading ? "Analyse..." : "Voir mes résultats"}
                </button>
              )}
            </div>
          </div>
        )}

        {step > totalPages && (
          <div className="animate-fade-in" id="results-root">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "28px", color: COLORS.textPrimary }}>Résultats BRS</h2>
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

            {metrics && (
              <div style={styles.questionCard}>
                <div style={{ fontSize: "18px", fontWeight: "700", color: COLORS.textPrimary }}>Score moyen</div>
                <div style={{ marginTop: "8px", fontSize: "28px", fontWeight: "800", color: COLORS.primary }}>
                  {metrics.average} / 5
                </div>
              </div>
            )}

            {metrics && (
              <div style={styles.questionCard}>
                <h3 style={{ marginTop: 0, color: COLORS.textPrimary }}>Reponses individuelles</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.scores.map((v, i) => ({ q: `Q${i + 1}`, value: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderColor} />
                    <XAxis dataKey="q" stroke={COLORS.textMuted} />
                    <YAxis domain={[1, 5]} stroke={COLORS.textMuted} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {metrics.scores.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

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
        )}
      </div>
    </div>
  );
}
