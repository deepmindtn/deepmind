import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  Download,
  RotateCcw,
  Send,
  Loader2,
  Activity,
  Target, // Replaced User with Target for GCOS context
  Info,
} from "lucide-react";

// -----------------------
// 1. DATA & CONSTANTS
// -----------------------

// Scale: 1 (Not true at all) to 5 (Very true)
const SCALE_LABELS = {
  1: "Pas du tout vrai",
  2: "Rarement vrai",
  3: "Parfois vrai",
  4: "Souvent vrai",
  5: "Tout à fait vrai",
};

const ORIENTS = { 
  auto: "Autonomie", 
  ctrl: "Contrôle", 
  impers: "Impersonnel" 
};

// Colors for the Chart (Green for Autonomy, Orange for Control, Gray/Blue for Impersonal)
const CHART_COLORS = { 
  auto: "#10b981",  // Emerald
  ctrl: "#f59e0b",  // Amber
  impers: "#64748b" // Slate
};

const QUESTIONS = [
  { id: 1, dim: "auto", text: "J’aime relever de nouveaux défis." },
  { id: 2, dim: "auto", text: "J’ai tendance à choisir des activités qui m’intéressent." },
  { id: 3, dim: "auto", text: "J’apprécie de prendre mes propres décisions." },
  { id: 4, dim: "auto", text: "Je préfère essayer quelque chose de nouveau même si je peux échouer." },
  { id: 5, dim: "ctrl", text: "Je fais les choses pour obtenir des récompenses ou éviter des sanctions." },
  { id: 6, dim: "ctrl", text: "J’agis souvent pour plaire aux autres." },
  { id: 7, dim: "ctrl", text: "Je travaille mieux quand quelqu’un évalue ma performance." },
  { id: 8, dim: "ctrl", text: "J’ai besoin d’encouragements ou de récompenses pour rester motivé." },
  { id: 9, dim: "impers", text: "Souvent, ce que je fais n’a pas d’impact." },
  { id: 10, dim: "impers", text: "Même en m’appliquant, j’ai l’impression que mes efforts ne servent à rien." },
  { id: 11, dim: "impers", text: "Je crois que mes réussites dépendent de la chance." },
  { id: 12, dim: "impers", text: "Face aux difficultés, je me sens souvent impuissant." },
];


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
  success: "#10b981",
};

// -----------------------
// 2. STYLES (CSS-in-JS)
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
  },
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primary}1A 0%, ${COLORS.cardBg} 100%)`,
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
    boxShadow: `0 8px 16px -4px ${COLORS.primary}60`,
    marginRight: "20px",
  },
  progressContainer: {
    height: "8px",
    backgroundColor: `${COLORS.primary}20`,
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
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  questionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: "24px",
    display: "flex",
    gap: "12px",
  },
  scaleGrid: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  scaleOption: (isSelected) => ({
    flex: 1,
    minWidth: "60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 8px",
    borderRadius: "12px",
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: isSelected ? `${COLORS.primary}08` : COLORS.cardBg,
    cursor: "pointer",
    transition: "all 0.2s ease",
  }),
  scaleNumber: (isSelected) => ({
    fontSize: "20px",
    fontWeight: "800",
    color: isSelected ? COLORS.primary : COLORS.textSecondary,
    marginBottom: "8px",
  }),
  scaleText: (isSelected) => ({
    fontSize: "12px",
    textAlign: "center",
    color: isSelected ? COLORS.primary : COLORS.textSecondary,
    fontWeight: isSelected ? "600" : "400",
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
    color: variant === "primary" ? "#fff" : COLORS.textPrimary,
    transition: "all 0.2s",
    opacity: variant === "disabled" ? 0.5 : 1,
    pointerEvents: variant === "disabled" ? "none" : "auto",
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
  },
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .scale-hover:hover { border-color: ${COLORS.primary}80; transform: translateY(-2px); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: ${COLORS.primary}10; color: ${COLORS.primary}; border-color: ${COLORS.primary}; }
  .loading-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

// -----------------------
// 3. MAIN COMPONENT
// -----------------------
export default function GCOSTest() {
  const [params] = useSearchParams();
  const API_BASE = "http://localhost:8080";

  // 1. Auth & Context Logic
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");

  // Helper to get correct headers/url
  const getFetchConfig = () => {
    if (isCandidate) {
      return {
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Token": candidateToken
        }
      };
    } else {
      return {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hrToken}`
        }
      };
    }
  };

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Pagination config
  const questionsPerPage = 4;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);

  // 2. Initial Data Fetch (Optional check to see if assignment is valid)
  useEffect(() => {
    if ((isCandidate && !candidateToken) || (!isCandidate && !assignmentId)) {
       console.warn("❌ Missing credentials or ID");
       setFetching(false);
       return;
    }
    // Simulate fetch delay or validate token here if needed
    setTimeout(() => setFetching(false), 500);
  }, [assignmentId, candidateToken, isCandidate]);

  // 3. Computed Data
  const pageQuestions = QUESTIONS.slice(
    (step - 1) * questionsPerPage,
    step * questionsPerPage
  );

  const canNext = step < totalPages && pageQuestions.every((q) => answers[q.id] > 0);
  const progressPct = (Object.keys(answers).length / QUESTIONS.length) * 100;

  // Calculate Metrics (Averages per dimension)
  const metrics = useMemo(() => {
    const sums = { auto: 0, ctrl: 0, impers: 0 };
    const counts = { auto: 0, ctrl: 0, impers: 0 };
    
    QUESTIONS.forEach((q) => {
      const val = Number(answers[q.id]);
      if (!val) return;
      sums[q.dim] += val;
      counts[q.dim]++;
    });

    const averages = {};
    Object.keys(sums).forEach((k) => {
      averages[k] = counts[k] ? parseFloat((sums[k] / counts[k]).toFixed(2)) : 0;
    });
    
    return { averages };
  }, [answers]);

  // Chart Data preparation
  const chartData = Object.entries(metrics.averages).map(([key, value]) => ({
    name: ORIENTS[key],
    key: key,
    value: value,
  }));

  // 4. Submit Handler
  async function submit() {
    if (Object.keys(answers).length !== QUESTIONS.length) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    const config = getFetchConfig();

    try {
      // A) Generate Report
      const reportRes = await fetch(`${API_BASE}/api/gcos/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      const reportData = await reportRes.json();
      const reportText = reportData.report || "";

      // B) Submit Final Status
      // Note: Adjust URL if your backend uses a generic submit endpoint or specific GCOS one
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ 
            answers, 
            metrics, 
            ai_report: reportText,
            assessment_type: "GCOS" // explicit type often helps backend
        }),
      });

      if (!submitRes.ok) throw new Error("Erreur lors de la soumission.");

      setAiReport(reportText);
      setStep(totalPages + 1); // Move to results
    } catch (e) {
      console.error(e);
      alert("Erreur: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    const blob = new Blob([aiReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gcos-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (fetching) {
    return (
      <div style={{ ...styles.mainWrapper, alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="loading-spin" size={40} color={COLORS.primary} />
        <p style={{ marginTop: 16, color: COLORS.textSecondary }}>Chargement du test...</p>
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
              <Target size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: 0 }}>
                GCOS (Mini)
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                Échelle d'Orientations Motivationnelles
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
                Instructions
              </h2>
              <div style={{ 
                backgroundColor: "#fff", 
                padding: "24px", 
                borderRadius: "16px", 
                border: `1px solid ${COLORS.borderColor}`,
                marginBottom: "32px",
                textAlign: "left"
              }}>
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <Info className="flex-shrink-0" color={COLORS.primary} />
                  <p style={{ margin: 0, color: COLORS.textSecondary, lineHeight: "1.6" }}>
                    Ce questionnaire évalue vos orientations générales envers l'autonomie, le contrôle ou l'impersonnel.
                  </p>
                </div>
                <ul style={{ color: COLORS.textSecondary, lineHeight: "1.8", paddingLeft: "20px" }}>
                   <li>Indiquez votre degré d'accord pour chaque affirmation.</li>
                   <li>Échelle de <b>1 (Pas du tout vrai)</b> à <b>5 (Tout à fait vrai)</b>.</li>
                   <li>Répondez honnêtement, il n'y a pas de mauvaises réponses.</li>
                </ul>
              </div>
              
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
                  <span style={{ color: COLORS.primary, opacity: 0.8 }}>Q{q.id}.</span>
                  {q.text}
                </div>
                
                <div style={styles.scaleGrid}>
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = answers[q.id] === val;
                    return (
                      <div 
                        key={val}
                        style={styles.scaleOption(isSelected)}
                        className="scale-hover"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                      >
                        <span style={styles.scaleNumber(isSelected)}>{val}</span>
                        <span style={styles.scaleText(isSelected)}>{SCALE_LABELS[val]}</span>
                      </div>
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
                      Terminer & Envoyer <Send size={18} />
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
                Profil GCOS
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
                  <Download size={16} /> Rapport
                </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              
              {/* LEFT: CHART */}
              <div style={{ 
                ...styles.questionCard, 
                marginBottom: 0, 
                display: "flex", 
                flexDirection: "column"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                   <Activity size={20} color={COLORS.primary} />
                   <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Scores par Orientation</h3>
                </div>
                
                <div style={{ flex: 1, minHeight: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: COLORS.textSecondary }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5]} tick={{ fill: COLORS.textSecondary }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.key]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RIGHT: AI REPORT */}
              {aiReport && (
                 <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ 
                      backgroundColor: `${COLORS.primary}10`, 
                      padding: "16px", 
                      borderRadius: "12px", 
                      display: "flex", 
                      gap: "12px",
                      color: COLORS.primary 
                    }}>
                      <BrainCircuit size={24} />
                      <div>
                        <strong style={{ display: "block", marginBottom: "4px" }}>Analyse Psychométrique</strong>
                        <span style={{ fontSize: "14px" }}>Interprétation des scores d'autonomie et de contrôle.</span>
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