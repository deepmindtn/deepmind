import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, RotateCcw, ArrowRight } from "lucide-react";

const SCALE = ["1. Pas du tout d’accord", "2. Plutôt pas d’accord", "3. Neutre", "4. Plutôt d’accord", "5. Tout à fait d’accord"];
const QUESTIONS = [
  { id: 1, text: "Je suis confiant(e) dans ma capacité à proposer de nouvelles idées au travail." },
  { id: 2, text: "Je crois que je peux développer des solutions originales aux problèmes professionnels." },
  { id: 3, text: "Je suis capable d’améliorer des processus ou méthodes existants." },
  { id: 4, text: "Même face à des obstacles, je peux persévérer pour concrétiser mes idées." },
  { id: 5, text: "Je peux convaincre les autres de la valeur de mes idées." },
  { id: 6, text: "Je suis capable de mettre en œuvre des idées innovantes efficacement." },
];

export default function ISETest() {
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
    const vals = Object.values(answers).map((v) => Number(v));
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
    const total = vals.reduce((a, b) => a + b, 0);
    return { average: Number(avg), total };
  }, [answers]);

  async function submit() {
    if (Object.keys(answers).length !== 6) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ise/report/${assignmentId}/`, {
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
      <h1>ISE — Auto-efficacité en Innovation</h1>
      {step === 0 && (
        <div className="b5-intro">
          <p>Indiquez votre niveau d’accord pour chaque affirmation (1–5).</p>
          <button className="b5-btn primary" onClick={() => setStep(1)}>Commencer</button>
        </div>
      )}
      {step === 1 && (
        <div>
          {QUESTIONS.map((q) => (
            <div key={q.id} className="b5-card">
              <div>{q.text}</div>
              {SCALE.map((label, idx) => (
                <label key={idx} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={answers[q.id] === idx + 1}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx + 1 }))}
                  />
                  {label}
                </label>
              ))}
            </div>
          ))}
          <button className="b5-btn primary" onClick={submit} disabled={loading}>
            {loading ? "Analyse..." : "Envoyer mes réponses"}
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Résultats ISE</h2>
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
                a.download = `ise-report-${assignmentId}.txt`;
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
