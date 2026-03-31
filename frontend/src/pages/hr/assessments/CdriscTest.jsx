import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Download, ArrowRight, RotateCcw } from "lucide-react";
import StructuredReport from "./StructuredReport";

const SCALE = [
  "0. Pas du tout vrai",
  "1. Rarement vrai",
  "2. Parfois vrai",
  "3. Souvent vrai",
  "4. Presque toujours vrai",
];

const QUESTIONS = [
  "Je suis capable de m’adapter quand des changements surviennent.",
  "Je peux gérer peu importe ce qui arrive.",
  "J’essaie de voir le côté positif des choses quand je fais face à des problèmes.",
  "Faire face au stress me renforce.",
  "J’ai tendance à rebondir après des difficultés.",
  "Je peux atteindre mes objectifs même en cas d’obstacles.",
  "Sous pression, je me concentre et je pense clairement.",
  "Je ne me laisse pas décourager par l’échec.",
  "Je peux gérer des sentiments désagréables ou douloureux.",
  "Je tiens face aux épreuves car j’ai déjà vécu des difficultés.",
];

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
        "Authorization": `Bearer ${hrToken}`,
      },
    };
  };

  const [answers, setAnswers] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const metrics = useMemo(() => {
    const total = Object.values(answers).reduce((a, b) => a + Number(b), 0);
    return { total, average: (total / 10).toFixed(2) };
  }, [answers]);

  // Check if assignment is already completed and restore results
  useEffect(() => {
    if (!assignmentId) return;
    const config = getFetchConfig();
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: config.headers })
      .then((r) => {
        if (!r.ok) {
          alert("Invalid or inaccessible assignment. Please start from My Assessments.");
          navigate("/my-assessments");
          return Promise.reject();
        }
        return r.json();
      })
      .then((data) => {
        // If already completed, restore previous answers and show results
        if (data && data.status === 'COMPLETED') {
          if (data.answers) setAnswers(data.answers);
          if (data.ai_report) { try { setAiReport(JSON.parse(data.ai_report)); } catch { setAiReport(data.ai_report); } }
          setStep(2); // Show results page (step 2)
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
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const config = getFetchConfig();
      // 1. Report
      const res = await fetch(`${API_BASE}/api/cdrisc/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur génération rapport.");
      const reportObj = data.report || null;
      
      // 2. Submit 
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({
          answers,
          metrics,
          ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : (reportObj || ""),
          assessment_type: "CDRISC10",
          overwrite: true
        }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.detail || submitData?.error || "Erreur lors du submit.");

      setAiReport(reportObj);
      setStep(2);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="b5-page">
      <h1>CD-RISC-10 — Résilience</h1>

      {step === 0 && (
        <div className="b5-intro">
          <p>Indiquez à quel point chaque affirmation est vraie pour vous (0–4).</p>
          <button className="b5-btn primary" onClick={() => setStep(1)}>Commencer</button>
        </div>
      )}

      {step === 1 && (
        <div>
          {QUESTIONS.map((text, i) => (
            <div key={i + 1} className="b5-card">
              <div>Q{i + 1}. {text}</div>
              {SCALE.map((label, idx) => (
                <label key={idx}>
                  <input
                    type="radio"
                    name={`q-${i + 1}`}
                    checked={answers[i + 1] === idx}
                    onChange={() => setAnswers((a) => ({ ...a, [i + 1]: idx }))}
                  />
                  {label}
                </label>
              ))}
            </div>
          ))}
          <button className="b5-btn primary" onClick={submit} disabled={loading}>
            {loading ? "Analyse..." : "Envoyer"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Résultats CD-RISC</h2>
          <div className="b5-card">Score total : {metrics.total} / 40 — Moyenne {metrics.average}</div>
          {aiReport && (
            <div className="b5-card">
              <h3>Rapport IA</h3>
              <StructuredReport report={aiReport} />
              <button className="b5-btn" onClick={() => {
                const _reportStr = typeof aiReport === "object" && aiReport !== null ? JSON.stringify(aiReport, null, 2) : (aiReport || "");
        const blob = new Blob([_reportStr], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `cdrisc-report-${assignmentId}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download size={18}/> Télécharger
              </button>
              <button 
                className="b5-btn b5-btn-outline" 
                onClick={() => {
                  setAnswers({});
                  setAiReport(null);
                  setStep(1);
                }}
                style={{ marginLeft: '10px' }}
              >
                <RotateCcw size={18}/> Recommencer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
