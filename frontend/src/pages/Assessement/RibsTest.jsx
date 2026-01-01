import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, ArrowRight } from "lucide-react";

const SCALE = ["1. Pas du tout vrai", "2. Rarement vrai", "3. Parfois vrai", "4. Souvent vrai", "5. Tout à fait vrai"];
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

export default function RIBSTest() {
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment");
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [answers, setAnswers] = useState({});
  const [aiReport, setAiReport] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const metrics = useMemo(() => {
    const vals = Object.values(answers).map(Number);
    const avg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : 0;
    const total = vals.reduce((a, b) => a + b, 0);
    return { average: Number(avg), total };
  }, [answers]);

  async function submit() {
    if (Object.keys(answers).length !== 10) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ribs/report/${assignmentId}/`, {
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
      <h1>RIBS — Comportement Idéationnel</h1>
      {step === 0 && (
        <div className="b5-intro">
          <p>Indiquez à quel point chaque affirmation vous correspond (1–5).</p>
          <button className="b5-btn primary" onClick={() => setStep(1)}>Commencer</button>
        </div>
      )}
      {step === 1 && (
        <div>
          {QUESTIONS.map((text, i) => (
            <div key={i + 1} className="b5-card">
              <div>Q{i + 1}. {text}</div>
              {SCALE.map((label, idx) => (
                <label key={idx} style={{ display: "block" }}>
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
          <h2>Résultats RIBS</h2>
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
                a.download = `ribs-report-${assignmentId}.txt`;
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
