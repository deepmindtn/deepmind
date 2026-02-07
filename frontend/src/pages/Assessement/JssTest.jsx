import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./BigFiveTest.css"; // même style que Big Five / DISC
import { Download, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------- Likert ---------- */
const SCALE = [
  "1. Fortement en désaccord",
  "2. Plutôt en désaccord",
  "3. Légèrement en désaccord",
  "4. Légèrement d’accord",
  "5. Plutôt d’accord",
  "6. Fortement d’accord"
];

/* ---------- Questions JSS ---------- */
const DIMENSIONS = {
  remuneration: "Rémunération",
  avantages: "Avantages sociaux",
  promotion: "Promotion",
  supervision: "Supervision",
  conditions: "Conditions de travail",
  collegues: "Relations avec collègues",
  nature: "Nature du travail",
  politiques: "Politiques organisationnelles",
  communication: "Communication",
};

const QUESTIONS = [
  // 1. Rémunération
  { id: 1, dim: "remuneration", text: "Je suis satisfait(e) de la rémunération que je reçois." },
  { id: 2, dim: "remuneration", text: "Mon salaire est compétitif comparé à celui d’autres dans mon domaine." },
  { id: 3, dim: "remuneration", text: "Je suis satisfait(e) des augmentations que j’ai reçues." },
  { id: 4, dim: "remuneration", text: "La rémunération est équitable par rapport à mes responsabilités." },

  // 2. Avantages sociaux
  { id: 5, dim: "avantages", text: "Les avantages sociaux sont satisfaisants." },
  { id: 6, dim: "avantages", text: "Les avantages répondent à mes besoins." },
  { id: 7, dim: "avantages", text: "J’apprécie les avantages offerts par mon employeur." },
  { id: 8, dim: "avantages", text: "Les avantages sont compétitifs." },

  // 3. Promotion
  { id: 9, dim: "promotion", text: "Les opportunités de promotion dans mon organisation sont suffisantes." },
  { id: 10, dim: "promotion", text: "Je suis satisfait(e) des politiques de promotion." },
  { id: 11, dim: "promotion", text: "La promotion est basée sur le mérite." },
  { id: 12, dim: "promotion", text: "J’ai une chance équitable de promotion." },

  // 4. Supervision
  { id: 13, dim: "supervision", text: "Mon superviseur est compétent." },
  { id: 14, dim: "supervision", text: "Mon superviseur me traite avec respect." },
  { id: 15, dim: "supervision", text: "Je peux compter sur le soutien de mon superviseur." },
  { id: 16, dim: "supervision", text: "Mon superviseur communique efficacement." },

  // 5. Conditions de travail
  { id: 17, dim: "conditions", text: "Les conditions de travail sont bonnes." },
  { id: 18, dim: "conditions", text: "Je suis satisfait(e) de la sécurité au travail." },
  { id: 19, dim: "conditions", text: "Mon espace de travail est adéquat." },
  { id: 20, dim: "conditions", text: "L’environnement de travail est propice à la productivité." },

  // 6. Relations avec collègues
  { id: 21, dim: "collegues", text: "Je m’entends bien avec mes collègues." },
  { id: 22, dim: "collegues", text: "L’ambiance de travail est agréable." },
  { id: 23, dim: "collegues", text: "Je peux compter sur mes collègues." },
  { id: 24, dim: "collegues", text: "Les conflits au travail sont gérés efficacement." },

  // 7. Nature du travail
  { id: 25, dim: "nature", text: "J’aime le contenu de mon travail." },
  { id: 26, dim: "nature", text: "Mon travail est intéressant et stimulant." },
  { id: 27, dim: "nature", text: "Je trouve mon travail important et significatif." },
  { id: 28, dim: "nature", text: "Je suis satisfait(e) de la variété des tâches." },

  // 8. Politiques organisationnelles
  { id: 29, dim: "politiques", text: "Les politiques de l’organisation sont justes." },
  { id: 30, dim: "politiques", text: "L’organisation communique bien sur les politiques." },
  { id: 31, dim: "politiques", text: "Les règles sont appliquées équitablement." },
  { id: 32, dim: "politiques", text: "Les politiques soutiennent le bien-être des employés." },

  // 9. Communication
  { id: 33, dim: "communication", text: "On me tient informé(e) des décisions importantes." },
  { id: 34, dim: "communication", text: "La communication interne est efficace." },
  { id: 35, dim: "communication", text: "Je peux exprimer mes idées librement." },
  { id: 36, dim: "communication", text: "Les canaux de communication sont suffisants." },
];

/* ---------- Interpretation ---------- */
function interpretSub(score) {
  if (score >= 19) return "Très haute satisfaction";
  if (score >= 14) return "Satisfaction modérée";
  if (score >= 9) return "Faible satisfaction";
  return "Très faible satisfaction";
}

/* ---------- Scoring ---------- */
function computeScores(answers) {
  const dimScores = {};
  Object.keys(DIMENSIONS).forEach((d) => (dimScores[d] = 0));

  QUESTIONS.forEach((q) => {
    if (answers[q.id]) dimScores[q.dim] += answers[q.id];
  });

  const global = Object.values(dimScores).reduce((a, b) => a + b, 0);
  return { dimScores, global };
}

/* ---------- Component ---------- */
export default function JssTest() {
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

  const questionsPerPage = 4;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);

  const pageQuestions = QUESTIONS.slice(
    (step - 1) * questionsPerPage,
    step * questionsPerPage
  );

  const metrics = useMemo(() => computeScores(answers), [answers]);
  const overviewData = Object.entries(metrics.dimScores).map(([k, v]) => ({
    name: DIMENSIONS[k],
    value: v,
    interpretation: interpretSub(v),
  }));

async function submit() {
  if (Object.keys(answers).length !== 36) {
    alert("Veuillez répondre à toutes les questions.");
    return;
  }
  setLoading(true);

  try {
    const metrics = computeScores(answers);

    // 1) Générer le rapport IA
    const reportRes = await fetch(`${API_BASE}/api/jss/report/${assignmentId}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ answers, metrics }),
    });
    const reportData = await reportRes.json();
    if (!reportRes.ok) throw new Error(reportData?.error || "Erreur génération rapport.");
    const reportText = reportData.report || "";

    // 2) Soumettre réponses + metrics + rapport
    const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ answers, metrics, ai_report: reportText, overwrite: true }),
    });
    const submitData = await submitRes.json();
    if (!submitRes.ok) throw new Error(submitData?.error || "Erreur lors du submit.");

    // 3) Mettre à jour UI
    setAiReport(reportText);
    setStep(totalPages + 1);
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
    a.download = `jss-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="b5-page">
      <div className="b5-topbar">
        <h1 className="b5-title">Job Satisfaction Survey (JSS)</h1>
      </div>

      <div className="b5-progress">
        <div
          className="b5-progress-bar"
          style={{ width: `${(Object.keys(answers).length / 36) * 100}%` }}
        />
      </div>

      <div className="b5-container">
        {step === 0 && (
          <div className="b5-intro">
            <h2>Bienvenue</h2>
            <p>Répondez honnêtement aux 36 affirmations (1–6).</p>
            <button className="b5-btn primary" onClick={() => setStep(1)}>Commencer</button>
          </div>
        )}

        {step > 0 && step <= totalPages && (
          <div>
            {pageQuestions.map((q) => (
              <div key={q.id} className="b5-card">
                <div className="b5-card-title">Q{q.id}. {q.text}</div>
                <div className="b5-likert">
                  {SCALE.map((label, idx) => (
                    <label key={idx} className={`b5-likert-option ${answers[q.id] === idx+1 ? "is-selected" : ""}`}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === idx+1}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx+1 }))}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="b5-nav">
              <button className="b5-btn ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                <ArrowLeft size={18} /> Retour
              </button>
              {step < totalPages ? (
                <button className="b5-btn primary" onClick={() => setStep((s) => s + 1)}>Suivant <ArrowRight size={18} /></button>
              ) : (
                <button className="b5-btn primary" onClick={submit} disabled={loading}>
                  {loading ? "Génération..." : "Envoyer mes réponses"}
                </button>
              )}
            </div>
          </div>
        )}

        {step > totalPages && (
          <div id="results-root">
            <div className="b5-results-head">
              <h2>Résultats JSS</h2>
              <div className="b5-results-actions">
                <button className="b5-btn" onClick={downloadReport}>
                  <Download size={18}/> Télécharger
                </button>
                <button className="b5-btn" onClick={() => { setAnswers({}); setStep(1); setAiReport(""); }}>
                  <RotateCcw size={18}/> Recommencer
                </button>
              </div>
            </div>

            {/* Global score */}
            <div className="b5-card">
              <div className="b5-card-title">Score global</div>
              <div className="b5-card-sub">{metrics.global} / 216</div>
            </div>

            {/* Chart */}
            <div className="b5-card">
              <div className="b5-card-title">Scores par dimension</div>
              <div className="b5-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 24]} />
                    <Tooltip />
                    <Bar dataKey="value" name="Score" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul>
                {overviewData.map((d) => (
                  <li key={d.name}>{d.name}: {d.value} → {d.interpretation}</li>
                ))}
              </ul>
            </div>

            {/* AI Report */}
            {aiReport && (
              <div className="b5-card">
                <div className="b5-card-title">Rapport IA — JSS</div>
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
