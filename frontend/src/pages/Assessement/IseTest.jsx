import React, { useMemo, useState, useEffect } from "react";
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
  Lightbulb, // Icon for Innovation
  ChevronRight,
  ChevronLeft,
  Download,
  RotateCcw,
  Send,
  Loader2,
  Activity,
  BrainCircuit,
} from "lucide-react";

// -----------------------
// 1. DATA & CONSTANTS
// -----------------------
const SCALE = [
  { val: 1, label: "Pas du tout d’accord" },
  { val: 2, label: "Plutôt pas d’accord" },
  { val: 3, label: "Neutre" },
  { val: 4, label: "Plutôt d’accord" },
  { val: 5, label: "Tout à fait d’accord" },
];

const QUESTIONS = [
  { id: 1, text: "Je suis confiant(e) dans ma capacité à proposer de nouvelles idées au travail." },
  { id: 2, text: "Je crois que je peux développer des solutions originales aux problèmes professionnels." },
  { id: 3, text: "Je suis capable d’améliorer des processus ou méthodes existants." },
  { id: 4, text: "Même face à des obstacles, je peux persévérer pour concrétiser mes idées." },
  { id: 5, text: "Je peux convaincre les autres de la valeur de mes idées." },
  { id: 6, text: "Je suis capable de mettre en œuvre des idées innovantes efficacement." },
];

// Theme Colors mapped from CSS Variables
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
  blue: "var(--blue)",
};

// -----------------------
// 2. STYLES (CSS-in-JS using CSS Vars)
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
  // Cards
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
    marginBottom: "20px",
    display: "flex",
    gap: "12px",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", // Adaptive grid for Likert
    gap: "12px",
  },
  optionLabel: (isSelected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    borderRadius: "12px",
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: isSelected ? COLORS.primaryLight : COLORS.cardBg,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    height: "100%",
  }),
  // Buttons
  navBar: {
    display: "flex",
    justifyContent: "space-between",
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
  // Results
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
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
    boxShadow: COLORS.shadowMd,
  },
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .option-hover:hover { border-color: var(--primary); transform: translateY(-2px); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: var(--primary-light); color: var(--primary); border-color: var(--primary); }
  .loading-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

function computeMetrics(answers) {
  const vals = Object.values(answers).map((v) => Number(v));
  const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
  const total = vals.reduce((a, b) => a + b, 0);
  return { average: Number(avg), total };
}

// -----------------------
// 3. MAIN COMPONENT
// -----------------------
export default function ISETest() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const API_BASE = "http://localhost:8080";

  // 1. Auth & Context Logic
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");

  // 2. Fetch Configuration
  const getFetchConfig = () => {
    if (isCandidate) {
      return {
        url: `${API_BASE}/api/assessments/candidate/${candidateToken}/`,
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Token": candidateToken
        }
      };
    } else {
      return {
        url: `${API_BASE}/api/assessments/${assignmentId}/`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hrToken}`
        }
      };
    }
  };

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0); // 0=Intro, 1..N=Questions, N+1=Results
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Pagination Logic
  const questionsPerPage = 3; 
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);

  // 3. Load Assessment Data (Check if valid)
  useEffect(() => {
    const config = getFetchConfig();
    
    if ((isCandidate && !candidateToken) || (!isCandidate && !assignmentId)) {
       console.warn("❌ Missing credentials or ID");
       setFetching(false);
       return;
    }

    fetch(config.url, { headers: config.headers })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) {
           if(r.status === 401) throw new Error("Unauthorized: Invalid Token");
           throw new Error(data?.detail || "Fetch failed");
        }
        return data;
      })
      .catch((err) => {
        console.error("❌ Assessment fetch error:", err);
      })
      .finally(() => setFetching(false));
  }, [assignmentId, candidateToken, isCandidate]);

  // Derived State
  const pageQuestions = QUESTIONS.slice(
    (step - 1) * questionsPerPage,
    step * questionsPerPage
  );
  
  const canNext = step < totalPages && pageQuestions.every((q) => !!answers[q.id]);
  const progressPct = (Object.keys(answers).length / QUESTIONS.length) * 100;

  // 4. Submit Logic
  async function submit() {
    if (Object.keys(answers).length !== QUESTIONS.length) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    const config = getFetchConfig();

    try {
      const metrics = computeMetrics(answers);

      // Submit to ISE specific endpoint
      const res = await fetch(`${API_BASE}/api/ise/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur génération rapport.");

      setAiReport(data.report || "");
      setStep(totalPages + 1); // Move to results
    } catch (err) {
      console.error(err);
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => computeMetrics(answers), [answers]);
  
  // Data for Chart (Single Bar for Score)
  const chartData = [
    { name: "Mon Score", value: metrics.average, full: 5 }
  ];

  function downloadReport() {
    const blob = new Blob([aiReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ise-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (fetching) {
    return (
      <div style={{ ...styles.mainWrapper, alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="loading-spin" size={40} color={COLORS.primary} />
        <p style={{ marginTop: 16, color: COLORS.textSecondary }}>Chargement du test ISE...</p>
      </div>
    );
  }

  return (
    <div style={styles.mainWrapper}>
      <style>{animationStyles}</style>

      {/* --- HERO SECTION --- */}
      <div style={styles.heroSection}>
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.heroIconBox}>
              <Lightbulb size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: 0 }}>
                Test ISE
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                Auto-efficacité en Innovation
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: COLORS.primary }}>
               {Math.round(progressPct)}% Complété
            </span>
          </div>
        </div>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(progressPct)} />
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div style={styles.contentBody}>

        {/* STEP 0: INTRO */}
        {step === 0 && (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px", color: COLORS.textPrimary }}>
                Bienvenue
              </h2>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, lineHeight: "1.6", marginBottom: "32px" }}>
                Ce questionnaire évalue votre confiance en vos capacités d'innovation.
                Indiquez votre niveau d’accord pour chaque affirmation sur une échelle de 1 à 5.
              </p>
              
              <button 
                style={styles.btn("primary")} 
                className="btn-hover"
                onClick={() => setStep(1)}
              >
                Commencer le test <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP > 0: QUESTIONS */}
        {step > 0 && step <= totalPages && (
          <div className="animate-fade-in">
            {pageQuestions.map((q) => (
              <div key={q.id} style={styles.questionCard}>
                <div style={styles.questionTitle}>
                  <span style={{ color: COLORS.primary, opacity: 0.8, marginRight: "8px" }}>Q{q.id}.</span>
                  {q.text}
                </div>
                
                <div style={styles.optionGrid}>
                  {SCALE.map((opt) => {
                    const isSelected = answers[q.id] === opt.val;
                    return (
                      <label 
                        key={opt.val} 
                        style={styles.optionLabel(isSelected)}
                        className="option-hover"
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          style={{ display: "none" }}
                          checked={isSelected}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.val }))}
                        />
                        <div style={{ 
                          fontSize: "18px", 
                          fontWeight: "700", 
                          color: isSelected ? COLORS.primary : COLORS.textMuted,
                          marginBottom: "4px"
                        }}>
                          {opt.val}
                        </div>
                        <span style={{ fontSize: "13px", color: isSelected ? COLORS.primary : COLORS.textSecondary, fontWeight: isSelected ? "600" : "400" }}>
                           {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* NAVIGATION FOOTER */}
            <div style={styles.navBar}>
              <button
                style={styles.btn(step === 1 ? "disabled" : "ghost")}
                className="btn-ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ChevronLeft size={18} /> Précédent
              </button>

              {step < totalPages ? (
                <button
                  style={styles.btn(canNext ? "primary" : "disabled")}
                  className={canNext ? "btn-hover" : ""}
                  onClick={() => canNext && setStep((s) => s + 1)}
                >
                  Suivant <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  style={styles.btn(loading ? "disabled" : "primary")}
                  className={!loading ? "btn-hover" : ""}
                  onClick={submit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="loading-spin" size={18} /> Analyse...
                    </>
                  ) : (
                    <>
                      Voir mes résultats <Send size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP END: RESULTS */}
        {step > totalPages && (
          <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
            <div style={styles.headerRow}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: COLORS.textPrimary }}>
                Résultats ISE
              </h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={styles.btn("ghost")} className="btn-ghost" onClick={() => {
                   setAnswers({});
                   setStep(1);
                   setAiReport("");
                }}>
                  <RotateCcw size={16} /> Recommencer
                </button>
                <button style={styles.btn("primary")} className="btn-hover" onClick={downloadReport}>
                  <Download size={16} /> Télécharger
                </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              
              {/* LEFT: SCORE CHART */}
              <div style={{ 
                ...styles.questionCard, 
                marginBottom: 0, 
                display: "flex", 
                flexDirection: "column"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                   <Activity size={20} color={COLORS.primary} />
                   <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: COLORS.textPrimary }}>Score Moyen</h3>
                </div>
                
                <div style={{ flex: 1, minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                   <ResponsiveContainer width="100%" height={250}>
                     <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.borderColor} />
                       <XAxis type="number" domain={[0, 5]} hide />
                       <YAxis type="category" dataKey="name" hide />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.borderColor, color: COLORS.textPrimary }} />
                       <Bar dataKey="value" barSize={40} radius={[0, 10, 10, 0]}>
                          <Cell fill={COLORS.primary} />
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                   <div style={{ textAlign: "center", marginTop: "-40px" }}>
                      <span style={{ fontSize: "48px", fontWeight: "800", color: COLORS.primary }}>
                        {metrics.average}
                      </span>
                      <span style={{ fontSize: "20px", color: COLORS.textSecondary }}> / 5</span>
                   </div>
                </div>
              </div>

              {/* RIGHT: AI REPORT */}
              {aiReport && (
                 <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ 
                      backgroundColor: COLORS.primaryLight, 
                      padding: "16px", 
                      borderRadius: "12px", 
                      display: "flex", 
                      gap: "12px",
                      color: COLORS.primary 
                    }}>
                      <BrainCircuit size={24} />
                      <div>
                        <strong style={{ display: "block", marginBottom: "4px" }}>Analyse IA Générée</strong>
                        <span style={{ fontSize: "14px" }}>Interprétation du score d'auto-efficacité.</span>
                      </div>
                    </div>
                    
                    <div style={styles.aiReportBox}>
                      {aiReport}
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