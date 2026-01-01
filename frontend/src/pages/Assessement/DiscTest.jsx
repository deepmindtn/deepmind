import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./BigFiveTest.css"; // réutilise ton style
import { Download, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* ---------- Questions DISC ---------- */
const QUESTIONS = [
  { id: 1, q: "Concernant votre poignée de main :", opts: { a: "Elle est ferme et plutôt appuyée.", b: "Elle est rapide et plutôt chaleureuse.", c: "Elle est moyennement forte.", d: "Elle est discrète et vous n'aimez pas forcément serrer la main." }},
  { id: 2, q: "Dans votre quotidien vous aimez :", opts: { a: "Relever les challenges et être tourné vers l'action.", b: "Être compréhensif et éviter les conflits.", c: "Divertir et prendre plaisir avec les gens.", d: "Être prudent, réfléchi et ne pas donner votre confiance facilement." }},
  { id: 3, q: "Quand vous vous exprimez, vous parlez plutôt :", opts: { a: "Fort pour impacter et se faire entendre.", b: "Faible volume, lentement, discret.", c: "Variations vocales, rythme rapide.", d: "Volume modéré, calme, monocorde." }},
  { id: 4, q: "C'est samedi, qu'avez-vous prévu :", opts: { a: "Partir à l'aventure sans me préoccuper des autres.", b: "Organiser un barbecue avec des amis.", c: "Ranger et mettre de l'ordre dans mes affaires.", d: "Aider une association locale et prendre mon temps." }},
  { id: 5, q: "Quand vous échangez avec les autres :", opts: { a: "Vous parlez plus que vous n'écoutez, affirmatif.", b: "Grande capacité d'écoute, signe de respect.", c: "Adore prendre part à une conversation.", d: "Préférence pour les emails, exprime rarement ses sentiments." }},
  { id: 6, q: "Concernant le regard :", opts: { a: "Regard soutenu, évalue l'interlocuteur.", b: "Regard amical et chaleureux.", c: "Détourne facilement le regard.", d: "Évite le regard, contact rare." }},
  { id: 7, q: "Quelles sont les qualités que vous aimez :", opts: { a: "Détermination, affronter les challenges.", b: "Sens de l'humour, enthousiasme.", c: "Précision, excellence, respect des règles.", d: "Empathie, compréhension des autres." }},
  { id: 8, q: "Vos principales peurs :", opts: { a: "Qu'on profite de vous.", b: "Changements soudains, instabilité.", c: "Critique sur votre travail.", d: "Être ignoré, délaissé." }},
  { id: 9, q: "Dans une réunion vous êtes celui qui :", opts: { a: "Propose de nouvelles idées, de bonne humeur.", b: "Décide et impose ses idées.", c: "Suit scrupuleusement les procédures.", d: "Veille à la cohésion du groupe." }},
  { id: 10, q: "Au travail vous êtes :", opts: { a: "Formel, rationnel, structuré et concret.", b: "Attentionné, pratique et altruiste.", c: "Interactif, social et amical.", d: "Efficace, rapide, occupé." }},
  { id: 11, q: "Parmi les métiers suivants, lequel choisirez-vous :", opts: { a: "Avocat, comptable, informaticien.", b: "Thérapeute, infirmier ou coach.", c: "Sportif, entrepreneur, cadre dirigeant.", d: "Cadre commercial, publiciste, journaliste." }},
  { id: 12, q: "Concernant votre mode de réflexion :", opts: { a: "Réfléchit à voix haute, exprime ses ressentis.", b: "Décide vite, va à l'essentiel.", c: "Réflexion lente et profonde.", d: "Analyse en détail, parfois paralysé pour décider." }},
  { id: 13, q: "Au niveau de votre espace personnel :", opts: { a: "Gardez vos distances, même avec proches.", b: "Occupez l’espace, pénétrez l’espace privé.", c: "À l’aise uniquement après relation profonde.", d: "Tactile très rapidement, parfois trop." }},
  { id: 14, q: "La structure de vos emails :", opts: { a: "Courts, directs, sans salutations.", b: "Moyens avec smileys et anecdotes.", c: "Très longs, complets, pièces jointes.", d: "Longs, personnels, avec politesse." }},
  { id: 15, q: "Quand vous donnez votre opinion :", opts: { a: "Direct, sans filtres.", b: "Spontané, parfois trop.", c: "Réfléchi, factuel.", d: "Attention à ne pas froisser." }},
];

const OPTIONS = { a: "D", b: "I", c: "C", d: "S" };
const LABELS = { D: "Dominance", I: "Influence", S: "Stabilité", C: "Conformité" };

/* ---------- scoring helpers ---------- */
function computeScores(answers) {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  Object.entries(answers).forEach(([qid, ans]) => {
    scores[OPTIONS[ans]] += 1;
  });
  return scores;
}

/* ---------- Component ---------- */
export default function DiscTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment");

  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);

  const questionsPerPage = 3;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);

  useEffect(() => {
    if (!assignmentId) return;
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: { ...authHeader } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => {
        alert("Évaluation introuvable.");
        navigate("/my-assessments");
      });
  }, [assignmentId]);

  const pageQuestions = QUESTIONS.slice(
    (step - 1) * questionsPerPage,
    step * questionsPerPage
  );

  const canNext = step < totalPages && pageQuestions.every((q) => !!answers[q.id]);

  async function submit() {
    if (Object.keys(answers).length !== 15) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);

    try {
      const metrics = computeScores(answers);

      // 1) Générer rapport IA
      const reportRes = await fetch(`${API_BASE}/api/disc/report/${assignmentId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics }),
      });
      const reportData = await reportRes.json();
      if (!reportRes.ok) throw new Error(reportData?.error || "Erreur génération rapport.");
      const reportText = reportData.report || "";

      // 2) Soumettre au backend avec rapport IA inclus
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics, ai_report: reportText, overwrite: true }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.error || "Erreur lors du submit.");

      setAiReport(reportText);
      setStep(totalPages + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => computeScores(answers), [answers]);
  const overviewData = Object.entries(metrics).map(([k, v]) => ({
    name: LABELS[k],
    value: v,
  }));

  function downloadReport() {
    const blob = new Blob([aiReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disc-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="b5-page">
      <div className="b5-topbar">
        <div>
          <h1 className="b5-title">Test DISC — Profil comportemental</h1>
          <div className="b5-progress-label">Progression</div>
        </div>
      </div>

      <div className="b5-progress">
        <div
          className="b5-progress-bar"
          style={{ width: `${(Object.keys(answers).length / 15) * 100}%` }}
        />
      </div>

      <div className="b5-container">
        {step === 0 && (
          <div className="b5-intro">
            <h2>Bienvenue</h2>
            <p>Répondez honnêtement aux 15 questions du test DISC.</p>
            <button className="b5-btn primary" onClick={() => setStep(1)}>
              Commencer
            </button>
          </div>
        )}

        {step > 0 && step <= totalPages && (
          <div>
            {pageQuestions.map((q) => (
              <div key={q.id} className="b5-card">
                <div className="b5-card-title">Q{q.id}. {q.q}</div>
                <div className="b5-stack">
                  {Object.entries(q.opts).map(([opt, label]) => (
                    <label
                      key={opt}
                      className={`b5-option ${answers[q.id] === opt ? "is-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={answers[q.id] === opt}
                        onChange={() =>
                          setAnswers((a) => ({ ...a, [q.id]: opt }))
                        }
                      />
                      <span><b>{opt.toUpperCase()}</b> — {label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="b5-nav">
              <button
                className="b5-btn ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                <ArrowLeft size={18} /> Retour
              </button>

              {step < totalPages ? (
                <button
                  className="b5-btn primary"
                  onClick={() => canNext && setStep((s) => s + 1)}
                  disabled={!canNext}
                >
                  Suivant <ArrowRight size={18} />
                </button>
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
              <h2>Résultats DISC</h2>
              <div className="b5-results-actions">
                <button className="b5-btn" onClick={downloadReport}>
                  <Download size={18} /> Télécharger
                </button>
                <button
                  className="b5-btn"
                  onClick={() => {
                    setAnswers({});
                    setStep(1);
                    setAiReport("");
                  }}
                >
                  <RotateCcw size={18} /> Recommencer
                </button>
              </div>
            </div>

            {/* Graphique des scores */}
            <div className="b5-card">
              <div className="b5-card-title">Aperçu</div>
              <div className="b5-card-sub">Scores par dimension DISC</div>
              <div className="b5-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Score" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rapport IA */}
            {aiReport && (
              <div className="b5-card">
                <div className="b5-card-title">Rapport IA — DISC</div>
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
