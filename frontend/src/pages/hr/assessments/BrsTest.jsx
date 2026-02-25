import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./BigFiveTest.css"; // réutilise ton CSS existant
import { Download, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------- Questions BRS ---------- */
const QUESTIONS = [
  { id: 1, text: "Je tends à rebondir rapidement après des difficultés." },
  { id: 2, text: "J’ai du mal à retrouver mon équilibre après le stress. (inversé)" },
  { id: 3, text: "Je suis capable de récupérer rapidement quand les choses tournent mal." },
  { id: 4, text: "Il m’est difficile de faire face aux événements stressants. (inversé)" },
  { id: 5, text: "Je récupère rapidement de moments difficiles." },
  { id: 6, text: "Il me faut du temps pour m’en remettre des problèmes ou du stress. (inversé)" },
];

const SCALE = [
  "1. Fortement en désaccord",
  "2. En désaccord",
  "3. Neutre",
  "4. D’accord",
  "5. Fortement d’accord",
];

/* ---------- Helpers ---------- */
function computeMetrics(answers) {
  const reverse = [2, 4, 6];
  const scores = QUESTIONS.map((q) => {
    let v = answers[q.id] || 0;
    if (reverse.includes(q.id) && v > 0) v = 6 - v;
    return v;
  }).filter((v) => v > 0);

  if (scores.length < 6) return null;

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  let level = "";
  if (avg >= 4.31) level = "Très haute résilience";
  else if (avg >= 3.61) level = "Haute résilience";
  else if (avg >= 3.0) level = "Résilience moyenne";
  else if (avg >= 2.4) level = "Faible résilience";
  else level = "Très faible résilience";

  return { average: avg.toFixed(2), level, scores };
}

/* ---------- Component ---------- */
export default function BrsTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);

  const metrics = useMemo(() => computeMetrics(answers), [answers]);

  // Check if assignment is already completed and restore results
  useEffect(() => {
    if (!assignmentId) return;
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: authHeader })
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
          if (data.ai_report) setAiReport(data.ai_report);
          setStep(QUESTIONS.length + 1); // Show results page
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
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const localMetrics = computeMetrics(answers);
      console.log(localMetrics)
      // 1) Générer rapport IA
      const reportRes = await fetch(`${API_BASE}/api/brs/report/${assignmentId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics: localMetrics }),
      });
      const reportData = await reportRes.json();
      if (!reportRes.ok) throw new Error(reportData?.error || "Erreur génération rapport.");
      const reportText = reportData.report || "";

      // 2) Soumettre réponses + metrics + rapport
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics: localMetrics, ai_report: reportText, overwrite: true }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.error || "Erreur lors du submit.");

      // 3) Afficher résultats
      setAiReport(reportText);
      setStep(QUESTIONS.length + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  function downloadReport() {
    const blob = new Blob([aiReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brs-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="b5-page">
      <div className="b5-topbar">
        <h1 className="b5-title">Brief Resilience Scale (BRS)</h1>
      </div>

      <div className="b5-progress">
        <div
          className="b5-progress-bar"
          style={{ width: `${(Object.keys(answers).length / 6) * 100}%` }}
        />
      </div>

      <div className="b5-container">
        {step === 0 && (
          <div className="b5-intro">
            <h2>Bienvenue</h2>
            <p>Répondez honnêtement aux 6 affirmations (1–5).</p>
            <button className="b5-btn primary" onClick={() => setStep(1)}>Commencer</button>
          </div>
        )}

        {step > 0 && step <= QUESTIONS.length && (
          <div>
            <div className="b5-card">
              <div className="b5-card-title">Q{step}. {QUESTIONS[step - 1].text}</div>
              <div className="b5-likert">
                {SCALE.map((label, idx) => (
                  <label
                    key={idx}
                    className={`b5-likert-option ${answers[step] === idx + 1 ? "is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${step}`}
                      checked={answers[step] === idx + 1}
                      onChange={() => setAnswers((a) => ({ ...a, [step]: idx + 1 }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="b5-nav">
              <button className="b5-btn ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                <ArrowLeft size={18}/> Retour
              </button>
              {step < QUESTIONS.length ? (
                <button className="b5-btn primary" onClick={() => setStep((s) => s + 1)}>
                  Suivant <ArrowRight size={18}/>
                </button>
              ) : (
                <button className="b5-btn primary" onClick={submit} disabled={loading}>
                  {loading ? "Génération..." : "Envoyer mes réponses"}
                </button>
              )}
            </div>
          </div>
        )}

        {step > QUESTIONS.length && (
          <div id="results-root">
            <div className="b5-results-head">
              <h2>Résultats BRS</h2>
              <div className="b5-results-actions">
                <button className="b5-btn" onClick={downloadReport}>
                  <Download size={18}/> Télécharger
                </button>
                <button className="b5-btn" onClick={() => { setAnswers({}); setStep(1); setAiReport(""); }}>
                  <RotateCcw size={18}/> Recommencer
                </button>
              </div>
            </div>

            {/* Résumé score */}
            {metrics && (
              <div className="b5-card">
                <div className="b5-card-title">Score moyen</div>
                <div className="b5-card-sub">{metrics.average} / 5 → {metrics.level}</div>
              </div>
            )}

            {/* Graphique */}
            {metrics && (
              <div className="b5-card">
                <div className="b5-card-title">Réponses individuelles</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.scores.map((v, i) => ({ q: `Q${i + 1}`, value: v }))}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="q"/>
                    <YAxis domain={[1, 5]}/>
                    <Tooltip/>
                    <Legend/>
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Rapport IA */}
            {aiReport && (
              <div className="b5-card">
                <div className="b5-card-title">Rapport IA — BRS</div>
                <div className="b5-report">
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                    {aiReport}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
