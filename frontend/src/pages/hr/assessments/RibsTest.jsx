import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  PolarAngleAxis,
} from "recharts";
import {
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Download,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import "./RibsTest.css";

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
  const pdf = new jsPDFClass({
    unit: "pt",
    format: "a4",
    orientation: "portrait",
  });

  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
  return pdf.output("blob");
}


// -----------------------
// 4. MAIN COMPONENT
// -----------------------

export default function RIBSTest() {
  const navigate = useNavigate();
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
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Token": candidateToken,
        },
      };
    } else {
      return {
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
  const [aiReport, setAiReport] = useState("");

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
      const reportRes = await fetch(
        `${API_BASE}/api/ribs/report/${assignmentId}/`,
        {
          method: "POST",
          headers: config.headers,
          body: JSON.stringify({ answers, metrics }),
        }
      );
      const reportData = await reportRes.json();
      const reportText = reportData.report || "";

      // 2. Submit Data
      const submitRes = await fetch(
        `${API_BASE}/api/assessments/${assignmentId}/submit/`,
        {
          method: "POST",
          headers: config.headers,
          body: JSON.stringify({
            answers,
            metrics,
            ai_report: reportText,
            assessment_type: "RIBS",
            overwrite: true,
          }),
        }
      );

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
    const blob = await downloadResultsAsPDF(`ribs-result-${assignmentId}.pdf`);
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
    <div className="ribs-main-wrapper">
      {/* --- HERO --- */}
      <div className="ribs-hero-section">
        <div className="ribs-header-row">
          <div className="ribs-header-left">
            <div className="ribs-hero-icon-box">
              <Lightbulb size={32} />
            </div>
            <div>
              <h1 className="ribs-hero-title">
                RIBS
              </h1>
              <p className="ribs-hero-subtitle">
                Runco Ideational Behavior Scale
              </p>
            </div>
          </div>
          <div className="ribs-header-right">
            <span className="ribs-progress-label">
              {Math.round(percent)}% Complété
            </span>
          </div>
        </div>
        <div className="ribs-progress-container">
          <div className="ribs-progress-bar" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="ribs-content-body">
        {/* INTRO */}
        {step === 0 && (
          <div className="animate-fade-in ribs-intro-container">
            <h2 className="ribs-intro-title">
              Bienvenue
            </h2>
            <div className="ribs-intro-card">
              <div className="ribs-intro-header">
                <AlertTriangle size={24} />
                <span className="ribs-intro-header-text">
                  Auto-évaluation de la créativité
                </span>
              </div>
              <p className="ribs-intro-text">
                Ce questionnaire évalue la fréquence de vos comportements liés à
                la génération d'idées. Il n'y a pas de bonnes ou mauvaises
                réponses. Répondez spontanément.
              </p>
              <ul className="ribs-intro-list">
                <li>10 affirmations</li>
                <li>Échelle de 1 à 5</li>
                <li>Durée : ~2 minutes</li>
              </ul>
            </div>
            <button
              className="ribs-btn ribs-btn-primary btn-hover"
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
              <div key={q.id} className="ribs-question-card">
                <div className="ribs-question-title">
                  <span className="ribs-question-number">
                    Q{q.id}.
                  </span>
                  {q.text}
                </div>

                <div className="ribs-likert-grid">
                  {LIKERT_VALUES.map((opt) => {
                    const isSelected = answers[q.id] === opt.val;
                    return (
                      <div
                        key={opt.val}
                        className={`ribs-likert-option ${isSelected ? "ribs-likert-option-selected" : ""} likert-hover`}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.id]: opt.val }))
                        }
                      >
                        <span className={`ribs-likert-value ${isSelected ? "ribs-likert-value-selected" : ""}`}>
                          {opt.val}
                        </span>
                        <span className={`ribs-likert-label ${isSelected ? "ribs-likert-label-selected" : ""}`}>
                          {opt.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="ribs-nav-bar">
              <button
                className="ribs-btn ribs-btn-ghost btn-ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
              >
                <ArrowLeft size={18} /> Retour
              </button>

              {step < totalPages ? (
                <button
                  className={`ribs-btn ${canNext ? "ribs-btn-primary btn-hover" : "ribs-btn-disabled"}`}
                  onClick={() => canNext && setStep((s) => s + 1)}
                >
                  Suivant <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  className={`ribs-btn ${loading ? "ribs-btn-disabled" : "ribs-btn-primary"} ${!loading ? "btn-hover" : ""}`}
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
            <div className="ribs-header-row ribs-results-header">
              <div>
                <h2 className="ribs-results-title">
                  Résultat RIBS
                </h2>
                <span className="ribs-results-subtitle">
                  Comportement Idéationnel
                </span>
              </div>
              <div className="ribs-results-actions">
                <button
                  className="ribs-btn ribs-btn-ghost btn-ghost"
                  onClick={() => {
                    setAnswers({});
                    setStep(1);
                    setAiReport("");
                  }}
                >
                  <RotateCcw size={18} /> Recommencer
                </button>
                <button
                  className="ribs-btn ribs-btn-primary btn-hover"
                  onClick={handleDownload}
                >
                  <Download size={18} /> PDF
                </button>
              </div>
            </div>

            <div className="ribs-results-grid">
              {/* Chart / Score Card */}
              <div className="ribs-question-card ribs-score-card">
                <h3 className="ribs-score-title">
                  Score Moyen
                </h3>

                {/* Visual Gauge */}
                <div className="ribs-score-gauge">
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
                  <div className="ribs-score-value-container">
                    <span className="ribs-score-value">
                      {metrics.average}
                    </span>
                    <span className="ribs-score-max">
                      / 5
                    </span>
                  </div>
                </div>

                <div className="ribs-score-total">
                  Total brut : <strong>{metrics.total}</strong> / 50
                </div>
              </div>

              {/* AI Report Column */}
              <div className="ribs-ai-report-container">
                {aiReport ? (
                  <div className="ribs-question-card ribs-ai-report-card">
                    <div className="ribs-ai-report-header">
                      <CheckCircle2 size={20} />
                      <span className="ribs-ai-report-header-text">
                        Analyse Terminée
                      </span>
                    </div>
                    <div className="ribs-ai-report-box">
                      <div className="ribs-ai-report-title">
                        <FileText size={18} />{" "}
                        <strong>Interprétation IA</strong>
                      </div>
                      {aiReport}
                    </div>
                  </div>
                ) : (
                  <div className="ribs-question-card ribs-loading-card">
                    <p className="ribs-loading-text">
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
