import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer
} from "recharts";
import {
  Briefcase, // Icon for Work context
  Target,    // Icon for Efficacy/Goals
  ArrowRight,
  ArrowLeft,
  Download,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText
} from "lucide-react";
import "./WsesTest.css";

// -----------------------
// 1. DATA & CONFIG
// -----------------------

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
  success: "#10b981",
  blue: "#3b82f6", // Specific color for WSES
};

const SCALE = [
  { val: 1, label: "Pas du tout d’accord" },
  { val: 2, label: "Plutôt pas d’accord" },
  { val: 3, label: "Neutre" },
  { val: 4, label: "Plutôt d’accord" },
  { val: 5, label: "Tout à fait d’accord" },
];

const QUESTIONS = [
  "Je peux rester calme quand je fais face à des difficultés au travail.",
  "Quand je suis confronté à un problème au travail, je trouve plusieurs solutions.",
  "Peu importe la situation, je peux gérer efficacement mon travail.",
  "Grâce à mes compétences, je gère des tâches professionnelles inattendues.",
  "Même si une tâche est difficile, je crois que je peux l’accomplir.",
  "Je suis capable de gérer plusieurs demandes de travail à la fois.",
  "Je reste concentré sur mes objectifs malgré les distractions.",
  "Je suis confiant dans ma capacité à surmonter les obstacles professionnels.",
];

// -----------------------
// 2. LOGIC HELPERS
// -----------------------

async function downloadResultsAsPDF(filename) {
  const html2canvasMod = await import("html2canvas");
  const jspdfMod = await import("jspdf");
  const html2canvas = html2canvasMod.default || html2canvasMod;
  const jsPDFClass = jspdfMod.jsPDF || jspdfMod.default;

  const el = document.getElementById("results-root");
  if (!el) return null;

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
// 4. MAIN COMPONENT
// -----------------------

export default function WSESTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // --- Auth Logic ---
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

  // --- State ---
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");

  // --- Navigation & Metrics ---
  const perPage = 4; // Show 4 questions per slide
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  
  const pageQuestions = QUESTIONS.slice((step - 1) * perPage, step * perPage).map((text, i) => ({
    id: (step - 1) * perPage + i + 1,
    text
  }));
  
  const canNext = pageQuestions.every((q) => answers[q.id]);
  const percent = (Object.keys(answers).length / QUESTIONS.length) * 100;

  const metrics = useMemo(() => {
    const vals = Object.values(answers).map(Number);
    if (!vals.length) return { average: 0, total: 0 };
    const total = vals.reduce((a, b) => a + b, 0);
    const average = (total / vals.length).toFixed(2);
    return { average, total };
  }, [answers]);

  const chartData = [
    { name: "Score", value: parseFloat(metrics.average), fill: COLORS.primary }
  ];

  // --- Actions ---

  async function submit() {
    setLoading(true);
    const config = getFetchConfig();
    try {
      // 1. Generate Report
      const reportRes = await fetch(`${API_BASE}/api/wses/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      const reportData = await reportRes.json();
      const reportText = reportData.report || "";

      // 2. Submit Data
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ 
          answers, 
          metrics, 
          ai_report: reportText, 
          assessment_type: "WSES", 
          overwrite: true 
        }),
      });

      if (!submitRes.ok) throw new Error("Erreur lors de la soumission.");

      setAiReport(reportText);
      setStep(totalPages + 1);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    const blob = await downloadResultsAsPDF(`wses-result-${assignmentId}.pdf`);
    if(blob && assignmentId) {
      const fd = new FormData();
      fd.append("file", blob, `wses-${assignmentId}.pdf`);
      const headers = isCandidate ? { "X-Candidate-Token": candidateToken } : { "Authorization": `Bearer ${hrToken}` };
      await fetch(`${API_BASE}/api/assessments/${assignmentId}/upload-pdf/`, {
        method: "PUT",
        headers: headers,
        body: fd,
      }).catch(console.error);
    }
  }

  return (
    <div className="wses-main-wrapper">
      {/* --- HERO --- */}
      <div className="wses-hero-section">
        <div className="wses-header-row">
          <div className="wses-header-left">
            <div className="wses-hero-icon-box">
              <Briefcase size={32} />
            </div>
            <div>
              <h1 className="wses-hero-title">
                WSES
              </h1>
              <p className="wses-hero-subtitle">
                Auto-efficacité au travail
              </p>
            </div>
          </div>
          <div className="wses-header-right">
            <span className="wses-progress-label">
               {Math.round(percent)}% Complété
            </span>
          </div>
        </div>
        <div className="wses-progress-container">
          <div className="wses-progress-bar" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="wses-content-body">
        
        {/* INTRO */}
        {step === 0 && (
          <div className="animate-fade-in wses-intro-container">
            <h2 className="wses-intro-title">Bienvenue</h2>
            <div className="wses-intro-card">
              <div className="wses-intro-header">
                <Target size={24} />
                <span className="wses-intro-header-text">Évaluation des capacités professionnelles</span>
              </div>
              <p className="wses-intro-text">
                Ce questionnaire mesure votre confiance en votre capacité à gérer des situations professionnelles diverses.
              </p>
              <ul className="wses-intro-list">
                <li>8 questions</li>
                <li>Échelle de 1 à 5</li>
                <li>Durée : ~2 minutes</li>
              </ul>
            </div>
            <button 
              className="wses-btn wses-btn-primary btn-hover" 
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
              <div key={q.id} className="wses-question-card">
                <div className="wses-question-title">
                  <span className="wses-question-number">Q{q.id}.</span> 
                  {q.text}
                </div>
                
                <div className="wses-likert-grid">
                  {SCALE.map((opt) => {
                    const isSelected = answers[q.id] === opt.val;
                    return (
                      <div 
                        key={opt.val}
                        className={`wses-likert-option ${isSelected ? "wses-likert-option-selected" : ""} likert-hover`}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                      >
                        <span className={`wses-likert-value ${isSelected ? "wses-likert-value-selected" : ""}`}>
                          {opt.val}
                        </span>
                        <span className={`wses-likert-label ${isSelected ? "wses-likert-label-selected" : ""}`}>
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="wses-nav-bar">
              <button className="wses-btn wses-btn-ghost btn-ghost" onClick={() => setStep(s => Math.max(1, s-1))}>
                <ArrowLeft size={18} /> Retour
              </button>
              
              {step < totalPages ? (
                <button 
                  className={`wses-btn ${canNext ? "wses-btn-primary btn-hover" : "wses-btn-disabled"}`}
                  onClick={() => canNext && setStep(s => s+1)}
                >
                  Suivant <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  className={`wses-btn ${loading ? "wses-btn-disabled" : "wses-btn-primary"} ${!loading ? "btn-hover" : ""}`}
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
            
            {/* Header Results */}
            <div className="wses-header-row wses-results-header">
              <div>
                <h2 className="wses-results-title">
                  Résultats WSES
                </h2>
                <span className="wses-results-subtitle">Confiance & Efficacité</span>
              </div>
              <div className="wses-results-actions">
                 <button className="wses-btn wses-btn-ghost btn-ghost" onClick={() => { setAnswers({}); setStep(1); setAiReport(""); }}>
                   <RotateCcw size={18} /> Recommencer
                 </button>
                 <button className="wses-btn wses-btn-primary btn-hover" onClick={handleDownload}>
                   <Download size={18} /> PDF
                 </button>
              </div>
            </div>

            <div className="wses-results-grid">
              
              {/* Chart / Score Card */}
              <div className="wses-question-card wses-score-card">
                <h3 className="wses-score-title">Score Moyen</h3>
                
                {/* Visual Gauge */}
                <div className="wses-score-gauge">
                   <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="80%" 
                      outerRadius="100%" 
                      barSize={12} 
                      data={chartData} 
                      startAngle={180} 
                      endAngle={0}
                    >
                      <PolarAngleAxis type="number" domain={[0, 5]} angleAxisId={0} tick={false} />
                      <RadialBar
                        background
                        clockWise
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                   </ResponsiveContainer>
                   <div className="wses-score-value-container">
                     <span className="wses-score-value">{metrics.average}</span>
                     <span className="wses-score-max">/ 5</span>
                   </div>
                </div>

                <div className="wses-score-total">
                   Total brut : <strong>{metrics.total}</strong> / 40
                </div>
              </div>

              {/* AI Report Column */}
              <div className="wses-ai-report-container">
                {aiReport ? (
                  <div className="wses-question-card wses-ai-report-card">
                    <div className="wses-ai-report-header">
                      <CheckCircle2 size={20} />
                      <span className="wses-ai-report-header-text">Analyse Terminée</span>
                    </div>
                    <div className="wses-ai-report-box">
                       <div className="wses-ai-report-title">
                         <FileText size={18} /> <strong>Interprétation IA</strong>
                       </div>
                       {aiReport}
                    </div>
                  </div>
                ) : (
                  <div className="wses-question-card wses-loading-card">
                    <div className="wses-loading-content">
                        <Loader2 className="loading-spin wses-loading-spinner" size={32} />
                        <p>Génération du rapport...</p>
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