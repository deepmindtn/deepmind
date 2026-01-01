import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";

const SCALE = ["1. Pas du tout vrai", "2. Rarement vrai", "3. Parfois vrai", "4. Souvent vrai", "5. Tout à fait vrai"];
const ORIENTS = { auto: "Autonome", ctrl: "Contrôlée", impers: "Impersonnelle" };

const QUESTIONS = [
  { id: 1, dim: "auto", text: "J’aime relever de nouveaux défis." },
  { id: 2, dim: "auto", text: "J’ai tendance à choisir des activités qui m’intéressent." },
  { id: 3, dim: "auto", text: "J’apprécie de prendre mes propres décisions." },
  { id: 4, dim: "auto", text: "Je préfère essayer quelque chose de nouveau même si je peux échouer." },
  { id: 5, dim: "ctrl", text: "Je fais les choses pour obtenir des récompenses ou éviter des sanctions." },
  { id: 6, dim: "ctrl", text: "J’agis souvent pour plaire aux autres." },
  { id: 7, dim: "ctrl", text: "Je travaille mieux quand quelqu’un évalue ma performance." },
  { id: 8, dim: "ctrl", text: "J’ai besoin d’encouragements ou de récompenses pour rester motivé." },
  { id: 9, dim: "impers", text: "Souvent, ce que je fais n’a pas d’impact." },
  { id: 10, dim: "impers", text: "Même en m’appliquant, j’ai l’impression que mes efforts ne servent à rien." },
  { id: 11, dim: "impers", text: "Je crois que mes réussites dépendent de la chance." },
  { id: 12, dim: "impers", text: "Face aux difficultés, je me sens souvent impuissant." },
];

export default function GCOSTest() {
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
    const sums = { auto: 0, ctrl: 0, impers: 0 };
    const counts = { auto: 0, ctrl: 0, impers: 0 };
    QUESTIONS.forEach((q) => {
      const val = Number(answers[q.id]);
      if (!val) return;
      sums[q.dim] += val;
      counts[q.dim]++;
    });
    const avgs = Object.fromEntries(Object.keys(sums).map((k) => [k, counts[k] ? (sums[k] / counts[k]).toFixed(2) : 0]));
    return { averages: avgs };
  }, [answers]);

  async function submit() {
    if (Object.keys(answers).length !== 12) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/gcos/report/${assignmentId}/`, {
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
      <h1>GCOS-mini — Orientations Motivationnelles</h1>
      {step === 0 && (
        <div className="b5-intro">
          <p>Indiquez votre accord (1–5) pour chaque affirmation.</p>
          <button className="b5-btn primary" onClick={() => setStep(1)}>Commencer</button>
        </div>
      )}
      {step === 1 && (
        <div>
          {QUESTIONS.map((q) => (
            <div key={q.id} className="b5-card">
              <div>Q{q.id}. {q.text}</div>
              {SCALE.map((label, idx) => (
                <label key={idx}>
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
            {loading ? "Analyse..." : "Envoyer"}
          </button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Résultats GCOS</h2>
          <div className="b5-card">
            {Object.entries(metrics.averages).map(([k, v]) => (
              <div key={k}><b>{ORIENTS[k]}:</b> {v}</div>
            ))}
          </div>
          {aiReport && (
            <div className="b5-card">
              <h3>Rapport IA</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{aiReport}</pre>
              <button className="b5-btn" onClick={() => {
                const blob = new Blob([aiReport], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `gcos-report-${assignmentId}.txt`;
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
