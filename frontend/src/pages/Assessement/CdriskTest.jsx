import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, ArrowRight, RotateCcw } from "lucide-react";

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
    const total = Object.values(answers).reduce((a, b) => a + Number(b), 0);
    return { total, average: (total / 10).toFixed(2) };
  }, [answers]);

  async function submit() {
    if (Object.keys(answers).length !== 10) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/cdrisc/report/${assignmentId}/`, {
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
              <pre style={{ whiteSpace: "pre-wrap" }}>{aiReport}</pre>
              <button className="b5-btn" onClick={() => {
                const blob = new Blob([aiReport], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `cdrisc-report-${assignmentId}.txt`;
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
