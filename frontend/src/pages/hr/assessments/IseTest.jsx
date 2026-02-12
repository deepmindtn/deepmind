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
import "./IseTest.css";

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

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
      <div className="ise-main-wrapper ise-main-wrapper-loading">
        <Loader2 className="loading-spin" size={40} color={COLORS.primary} />
        <p className="ise-loading-text">Chargement du test ISE...</p>
      </div>
    );
  }

  return (
    <div className="ise-main-wrapper">
      {/* --- HERO SECTION --- */}
      <div className="ise-hero-section">
        <div className="ise-header-row">
          <div className="ise-header-left">
            <div className="ise-hero-icon-box">
              <Lightbulb size={32} />
            </div>
            <div>
              <h1 className="ise-hero-title">
                Test ISE
              </h1>
              <p className="ise-hero-subtitle">
                Auto-efficacité en Innovation
              </p>
            </div>
          </div>
          
          <div className="ise-header-right">
            <span className="ise-progress-label">
               {Math.round(progressPct)}% Complété
            </span>
          </div>
        </div>
        
        <div className="ise-progress-container">
          <div className="ise-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="ise-content-body">

        {/* STEP 0: INTRO */}
        {step === 0 && (
          <div className="animate-fade-in ise-intro-container">
            <div className="ise-intro-content">
              <h2 className="ise-intro-title">
                Bienvenue
              </h2>
              <p className="ise-intro-text">
                Ce questionnaire évalue votre confiance en vos capacités d'innovation.
                Indiquez votre niveau d’accord pour chaque affirmation sur une échelle de 1 à 5.
              </p>
              
              <button 
                className="ise-btn ise-btn-primary btn-hover"
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
              <div key={q.id} className="ise-question-card">
                <div className="ise-question-title">
                  <span className="ise-question-number">Q{q.id}.</span>
                  {q.text}
                </div>
                
                <div className="ise-option-grid">
                  {SCALE.map((opt) => {
                    const isSelected = answers[q.id] === opt.val;
                    return (
                      <label 
                        key={opt.val} 
                        className={`ise-option-label ${isSelected ? "ise-option-label-selected" : ""} option-hover`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          className="ise-hidden-input"
                          checked={isSelected}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.val }))}
                        />
                        <div className={`ise-option-value ${isSelected ? "ise-option-value-selected" : ""}`}>
                          {opt.val}
                        </div>
                        <span className={`ise-option-text ${isSelected ? "ise-option-text-selected" : ""}`}>
                           {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* NAVIGATION FOOTER */}
            <div className="ise-nav-bar">
              <button
                className={`ise-btn ${step === 1 ? "ise-btn-disabled" : "ise-btn-ghost"} btn-ghost`}
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ChevronLeft size={18} /> Précédent
              </button>

              {step < totalPages ? (
                <button
                  className={`ise-btn ${canNext ? "ise-btn-primary btn-hover" : "ise-btn-disabled"}`}
                  onClick={() => canNext && setStep((s) => s + 1)}
                >
                  Suivant <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  className={`ise-btn ${loading ? "ise-btn-disabled" : "ise-btn-primary"} ${!loading ? "btn-hover" : ""}`}
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
          <div className="animate-fade-in ise-results-container">
            <div className="ise-header-row ise-results-header">
              <h2 className="ise-results-title">
                Résultats ISE
              </h2>
              <div className="ise-results-actions">
                <button className="ise-btn ise-btn-ghost btn-ghost" onClick={() => {
                   setAnswers({});
                   setStep(1);
                   setAiReport("");
                }}>
                  <RotateCcw size={16} /> Recommencer
                </button>
                <button className="ise-btn ise-btn-primary btn-hover" onClick={downloadReport}>
                  <Download size={16} /> Télécharger
                </button>
              </div>
            </div>

            <div className="ise-results-grid">
              
              {/* LEFT: SCORE CHART */}
              <div className="ise-question-card ise-score-card">
                <div className="ise-score-header">
                   <Activity size={20} color={COLORS.primary} />
                   <h3 className="ise-score-title">Score Moyen</h3>
                </div>
                
                <div className="ise-score-chart-container">
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
                   <div className="ise-score-value-container">
                      <span className="ise-score-value">
                        {metrics.average}
                      </span>
                      <span className="ise-score-max"> / 5</span>
                   </div>
                </div>
              </div>

              {/* RIGHT: AI REPORT */}
              {aiReport && (
                 <div className="ise-ai-report-container">
                    <div className="ise-ai-report-header">
                      <BrainCircuit size={24} />
                      <div>
                        <strong className="ise-ai-report-header-title">Analyse IA Générée</strong>
                        <span className="ise-ai-report-header-subtitle">Interprétation du score d'auto-efficacité.</span>
                      </div>
                    </div>
                    
                    <div className="ise-ai-report-box">
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