import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import StructuredReport from "./StructuredReport";
import {
  Activity,
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
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
  success: "#10b981",
  danger: "#ef4444",
};

// Scale: 1 to 4
const LIKERT_VALUES = [
  { val: 1, label: "Pas du tout d'accord" },
  { val: 2, label: "Plutôt pas d'accord" },
  { val: 3, label: "Plutôt d'accord" },
  { val: 4, label: "Tout à fait d'accord" }
];

// Mapping for charts
const CHART_COLORS = {
  D: COLORS.primary, // Demands
  C: COLORS.purple,  // Control
  S: COLORS.orange   // Support
};

// Static Labels
const TEXTS = {
  title: "Questionnaire Karasek",
  subtitle: "Modèle Demande–Contrôle–Soutien",
  instructions: "Répondez aux 27 affirmations concernant votre travail actuel.",
  warning: "Cet outil est indicatif et ne constitue pas un diagnostic clinique.",
  dims: { D: "Demandes Psychologiques", C: "Contrôle Décisionnel", S: "Soutien Social" },
  subs: { DA: "Autorité décisionnelle", SD: "Utilisation des compétences", SS: "Soutien hiérarchique", SC: "Soutien collègues" },
  quadrants: {
    lowStrain: "Détendu (Faible contrainte)",
    highStrain: "Tendu (Forte contrainte)",
    active: "Actif (Motivé)",
    passive: "Passif (Ennuyeux)"
  }
};

const QUESTIONS = [
  // DEMANDS (D)
  { id: 1, sub: "D", rev: false, text: "Mon travail exige de travailler très vite." },
  { id: 2, sub: "D", rev: false, text: "Mon travail exige de travailler très dur." },
  { id: 3, sub: "D", rev: false, text: "Je manque de temps pour accomplir mes tâches." },
  { id: 4, sub: "D", rev: false, text: "Mon travail comporte des contraintes contradictoires." },
  { id: 5, sub: "D", rev: false, text: "Je dois accomplir une grande quantité de travail." },
  { id: 6, sub: "D", rev: false, text: "Je dois travailler intensément sans pause suffisante." },
  { id: 7, sub: "D", rev: false, text: "Les délais au travail sont serrés." },
  { id: 8, sub: "D", rev: true,  text: "Mon travail est généralement calme et détendu." },
  { id: 9, sub: "D", rev: false, text: "Je dois gérer plusieurs choses à la fois." },
  // CONTROL (DA)
  { id: 10, sub: "DA", rev: false, text: "J’ai beaucoup à dire sur la manière d’effectuer mon travail." },
  { id: 11, sub: "DA", rev: false, text: "Je peux prendre des décisions importantes dans mon travail." },
  { id: 12, sub: "DA", rev: true,  text: "On me dit exactement comment faire mon travail." },
  { id: 13, sub: "DA", rev: false, text: "Je peux influencer les décisions qui touchent mon travail." },
  { id: 14, sub: "DA", rev: false, text: "Je peux organiser mon travail comme je le souhaite." },
  { id: 15, sub: "DA", rev: true,  text: "On contrôle fortement ma manière de travailler." },
  // CONTROL (SD)
  { id: 16, sub: "SD", rev: false, text: "Mon travail requiert d’apprendre de nouvelles choses." },
  { id: 17, sub: "SD", rev: false, text: "Mon travail nécessite des compétences variées." },
  { id: 18, sub: "SD", rev: false, text: "Je peux développer ma créativité dans mon travail." },
  { id: 19, sub: "SD", rev: true,  text: "Mon travail est monotone." },
  { id: 20, sub: "SD", rev: false, text: "Je peux utiliser pleinement mes compétences." },
  { id: 21, sub: "SD", rev: false, text: "J’ai des possibilités d’évolution/apprentissage." },
  // SUPPORT (SS)
  { id: 22, sub: "SS", rev: false, text: "Mon supérieur est compréhensif." },
  { id: 23, sub: "SS", rev: false, text: "Je peux compter sur mon supérieur en cas de besoin." },
  { id: 24, sub: "SS", rev: true,  text: "Je me sens critiqué par mon supérieur." },
  // SUPPORT (SC)
  { id: 25, sub: "SC", rev: false, text: "Mes collègues sont amicaux." },
  { id: 26, sub: "SC", rev: false, text: "Je reçois de l’aide de mes collègues." },
  { id: 27, sub: "SC", rev: true,  text: "Mes collègues me mettent des bâtons dans les roues." },
];

// -----------------------
// 2. LOGIC HELPERS
// -----------------------

function normalizeTo100(value, min, max) {
  return Math.round(((value - min) / (max - min)) * 100);
}

function computeScores(answers) {
  const sums = { D: 0, DA: 0, SD: 0, SS: 0, SC: 0 };
  const counts = { D: 0, DA: 0, SD: 0, SS: 0, SC: 0 };

  for (const q of QUESTIONS) {
    const raw = answers[q.id];
    if (!raw) continue;
    const score = q.rev ? 5 - raw : raw; 
    sums[q.sub] += score;
    counts[q.sub] += 1;
  }

  const subScores = {};
  for (const k of Object.keys(sums)) {
    const min = 1 * counts[k];
    const max = 4 * counts[k];
    subScores[k] = counts[k] ? normalizeTo100(sums[k], min, max) : 0;
  }

  const Demands = subScores.D;
  const Control = Math.round((subScores.DA + subScores.SD) / 2);
  const Support = Math.round((subScores.SS + subScores.SC) / 2);

  const demandHigh = Demands >= 60;
  const controlHigh = Control >= 60;
  let quadrant;
  if (demandHigh && controlHigh) quadrant = "active";
  else if (demandHigh && !controlHigh) quadrant = "highStrain";
  else if (!demandHigh && !controlHigh) quadrant = "passive";
  else quadrant = "lowStrain";

  return { subScores, dimScores: { D: Demands, C: Control, S: Support }, quadrant };
}

/* PDF Generator */
async function downloadResultsAsPDF(filename) {
  const html2canvasMod = await import("html2canvas");
  const jspdfMod = await import("jspdf");
  const html2canvas = html2canvasMod.default || html2canvasMod;
  const jsPDFClass = jspdfMod.jsPDF || jspdfMod.default;

  const el = document.getElementById("results-root");
  if (!el) return null;

  // Add white bg for capture
  const originalBg = el.style.backgroundColor;
  el.style.backgroundColor = "#ffffff";
  el.style.padding = "20px";
  
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  el.style.backgroundColor = originalBg; 
  el.style.padding = "";

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDFClass({ unit: "pt", format: "a4", orientation: "portrait" });
  
  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
  return pdf.output("blob");
}

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
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: `0 8px 16px -4px rgba(0,0,0,0.1)`, 
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
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  likertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
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
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: isSelected ? `${COLORS.primary}10` : COLORS.cardBg,
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
  }
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .likert-hover:hover { border-color: ${COLORS.primary}; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: rgba(0,0,0,0.05); color: ${COLORS.primary}; }
`;

// -----------------------
// 4. MAIN COMPONENT
// -----------------------

export default function KarasekTest() {
  const [params] = useSearchParams();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // Auth Logic
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");

  const getFetchConfig = () => {
    if (isCandidate) {
      return { headers: { "Content-Type": "application/json", "X-Candidate-Token": candidateToken } };
    } else {
      return { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hrToken}` } };
    }
  };

  // State
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [fetching, setFetching] = useState(true);
  
  // Navigation constants - must be defined before useEffect
  const perPage = 3; 
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  
  // Metrics - must be defined before useEffect  
  const metrics = useMemo(() => computeScores(answers), [answers]);
  
  // Fetch assignment on mount - check if already completed
  useEffect(() => {
    if (!assignmentId) {
      setFetching(false);
      return;
    }
    
    const config = getFetchConfig();
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, config)
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) {
          if (r.status === 401) throw new Error("Unauthorized: Invalid Token");
          throw new Error(data?.detail || "Fetch failed");
        }
        // If already completed, restore previous answers and go to results
        if (data.status === 'COMPLETED') {
          if (data.answers) setAnswers(data.answers);
          if (data.ai_report) { try { setAiReport(JSON.parse(data.ai_report)); } catch { setAiReport(data.ai_report); } }
          setStep(totalPages + 1);
        }
        return data;
      })
      .catch((err) => {
        console.error("❌ Assessment fetch error:", err);
      })
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, candidateToken, isCandidate]);

  if (fetching) {
    return (
      <div style={{ ...styles.mainWrapper, alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="loading-spin" size={40} color={COLORS.primary} />
        <p style={{ marginTop: 16, color: COLORS.textSecondary }}>Chargement de l'évaluation...</p>
      </div>
    );
  }
  
  // Navigation
  const pageQuestions = QUESTIONS.slice((step - 1) * perPage, step * perPage);
  const canNext = pageQuestions.every((q) => answers[q.id] !== undefined);
  const totalAnswered = Object.keys(answers).length;
  const percent = step === 0 ? 0 : (totalAnswered / QUESTIONS.length) * 100;
  

  const overviewData = [
    { name: TEXTS.dims.D, short: "Demandes", value: metrics.dimScores.D, color: CHART_COLORS.D },
    { name: TEXTS.dims.C, short: "Contrôle", value: metrics.dimScores.C, color: CHART_COLORS.C },
    { name: TEXTS.dims.S, short: "Soutien", value: metrics.dimScores.S, color: CHART_COLORS.S },
  ];

  const subData = [
    { name: TEXTS.subs.DA, value: metrics.subScores.DA, color: CHART_COLORS.C },
    { name: TEXTS.subs.SD, value: metrics.subScores.SD, color: CHART_COLORS.C },
    { name: TEXTS.subs.SS, value: metrics.subScores.SS, color: CHART_COLORS.S },
    { name: TEXTS.subs.SC, value: metrics.subScores.SC, color: CHART_COLORS.S },
  ];

  // Submit Handler
  async function submit() {
    setLoading(true);
    const config = getFetchConfig();
    try {
      // 1. Generate Report
      const reportRes = await fetch(`${API_BASE}/api/karasek/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      const reportData = await reportRes.json();
      const reportObj = reportData.report || null;

      // 2. Submit Data
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ 
          answers, 
          metrics, 
          ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : (reportObj || ""), 
          assessment_type: "KARASEK", 
          overwrite: true 
        }),
      });

      if (!submitRes.ok) throw new Error("Erreur soumission");
      
      setAiReport(reportObj);
      setStep(totalPages + 1);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Upload PDF Handler
  async function handleDownload() {
    const blob = await downloadResultsAsPDF(`karasek-report-${assignmentId}.pdf`);
    if(blob && assignmentId) {
      const fd = new FormData();
      fd.append("file", blob, `karasek-${assignmentId}.pdf`);
      // Re-use auth headers minus Content-Type for FormData
      const headers = isCandidate ? { "X-Candidate-Token": candidateToken } : { "Authorization": `Bearer ${hrToken}` };
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
              <Activity size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                {TEXTS.title}
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                {TEXTS.subtitle}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: COLORS.primary }}>
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
          <div className="animate-fade-in" style={{ textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
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
              <Activity size={34} color={COLORS.primary} />
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>Bienvenue au test Karasek</h2>
            <div style={{ 
              backgroundColor: COLORS.cardBg, 
              padding: "24px", 
              borderRadius: "16px", 
              border: `1px solid ${COLORS.borderColor}`,
              textAlign: "left",
              marginBottom: "32px"
            }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", color: COLORS.orange }}>
                <AlertTriangle size={24} />
                <span style={{ fontWeight: "600" }}>{TEXTS.warning}</span>
              </div>
              <p style={{ color: COLORS.textSecondary, lineHeight: "1.6" }}>{TEXTS.instructions}</p>
              <ul style={{ color: COLORS.textSecondary, marginTop: "8px", paddingLeft: "20px" }}>
                <li>Durée estimée : 5 minutes</li>
                <li>Échelle de 1 à 4</li>
                <li>Réponses confidentielles</li>
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
                <div style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                  <span style={{ color: COLORS.primary, marginRight: "8px" }}>Q{q.id}.</span> 
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
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                      >
                        <span style={{ fontSize: "20px", fontWeight: "700", color: isSelected ? COLORS.primary : COLORS.textMuted, marginBottom: "4px" }}>
                          {opt.val}
                        </span>
                        <span style={{ fontSize: "12px", color: isSelected ? COLORS.primary : COLORS.textSecondary }}>
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
              <button style={styles.btn("ghost")} className="btn-ghost" onClick={() => setStep(s => Math.max(1, s-1))}>
                <ArrowLeft size={18} /> Retour
              </button>
              
              {step < totalPages ? (
                <button 
                  style={styles.btn(canNext ? "primary" : "disabled")} 
                  className={canNext ? "btn-hover" : ""} 
                  onClick={() => canNext && setStep(s => s+1)}
                >
                  Suivant <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  style={styles.btn(loading ? "disabled" : "primary")} 
                  className={!loading ? "btn-hover" : ""} 
                  onClick={submit}
                >
                   {loading ? <Loader2 className="loading-spin" size={18} /> : <>Envoyer <ArrowRight size={18} /></>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step > totalPages && (
          <div className="animate-fade-in" id="results-root">
            
            {/* Results Header */}
            <div style={{ ...styles.headerRow, marginBottom: "32px" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>
                  {TEXTS.quadrants[metrics.quadrant]}
                </h2>
                <span style={{ color: COLORS.textSecondary }}>Résultat Global</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                 <button style={styles.btn("ghost")} className="btn-ghost" onClick={() => { setAnswers({}); setStep(1); setAiReport(""); }}>
                   <RotateCcw size={18} /> Recommencer
                 </button>
                 <button style={styles.btn("primary")} className="btn-hover" onClick={handleDownload}>
                   <Download size={18} /> PDF
                 </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              
              {/* CHARTS COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Main Dimensions */}
                <div style={{ ...styles.questionCard, minHeight: "300px", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Dimensions Principales</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="short" type="category" width={80} tick={{ fill: COLORS.textSecondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border:'none', boxShadow: COLORS.shadowHuge}} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {overviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Subscales */}
                <div style={{ ...styles.questionCard, minHeight: "300px", display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Sous-échelles</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.textSecondary }} interval={0} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {subData.map((entry, index) => (
                           <Cell key={`sub-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>

              {/* TEXT COLUMN */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Metric Summary */}
                <div style={{ ...styles.questionCard, padding: "24px" }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: `1px solid ${COLORS.borderColor}`, paddingBottom: "8px" }}>
                     <span>{TEXTS.dims.D}</span>
                     <strong style={{ color: COLORS.primary }}>{metrics.dimScores.D} / 100</strong>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: `1px solid ${COLORS.borderColor}`, paddingBottom: "8px" }}>
                     <span>{TEXTS.dims.C}</span>
                     <strong style={{ color: COLORS.purple }}>{metrics.dimScores.C} / 100</strong>
                   </div>
                   <div style={{ display: "flex", justifyContent: "space-between" }}>
                     <span>{TEXTS.dims.S}</span>
                     <strong style={{ color: COLORS.orange }}>{metrics.dimScores.S} / 100</strong>
                   </div>
                </div>

                {/* AI Report */}
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
                         <strong style={{ display: "block", marginBottom: "4px" }}>Analyse IA</strong>
                         <span style={{ fontSize: "14px" }}>Interprétation personnalisée de votre profil.</span>
                       </div>
                     </div>
                     <div style={styles.aiReportBox}>
                       <StructuredReport report={aiReport} />
                     </div>
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