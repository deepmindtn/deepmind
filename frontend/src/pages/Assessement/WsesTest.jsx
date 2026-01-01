import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, ArrowRight } from "lucide-react";

const SCALE = [
  "1. Pas du tout d’accord",
  "2. Plutôt pas d’accord",
  "3. Neutre",
  "4. Plutôt d’accord",
  "5. Tout à fait d’accord",
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

export default function WSESTest() {
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment");
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [answers, setAnswers] = useState({});
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const metrics = useMemo(() => {
    const vals = Object.values(answers).map(Number);
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
    const total = vals.reduce((a, b) => a + b, 0);
    return { average: Number(avg), total };
  }, [answers]);

  async function submit() {
    if (Object.keys(answers).length !== 8) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/wses/report/${assignmentId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur génération rapport.");
      setAiReport(data.report || "");
      setStep(2);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="b5-page">
      <h1>WSES — Auto-efficacité au travail</h1>

      {step === 0 && (
        <div className="b5-intro">
          <p>Indiquez votre niveau d’accord pour chaque affirmation (1–5).</p>
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
                    checked={answers[i + 1] === idx + 1}
                    onChange={() => setAnswers((a) => ({ ...a, [i + 1]: idx + 1 }))}
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
          <h2>Résultats WSES</h2>
          <div className="b5-card">Score moyen : {metrics.average} / 5</div>
          {aiReport && (
            <div className="b5-card">
              <h3>Rapport IA</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{aiReport}</pre>
              <button className="b5-btn" onClick={() => {
                const blob = new Blob([aiReport], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `wses-report-${assignmentId}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download size={18}/> Télécharger
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
