import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, RotateCcw, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const DOMAINS = {
  sciences: "Sciences",
  ingenierie: "Ingénierie / Invention",
  ecriture: "Écriture",
  musique: "Musique",
  arts_visuels: "Arts visuels",
  cuisine: "Cuisine",
  danse: "Danse / Performance",
  theatre_film: "Théâtre / Film",
  humour: "Humour",
  design_architecture: "Design / Architecture",
};

const QUESTIONS = [
  { id: 1, dim: "sciences", text: "J’ai participé à une foire scientifique ou un concours d’innovation." },
  { id: 2, dim: "sciences", text: "J’ai reçu un prix ou une reconnaissance pour un projet scientifique." },
  { id: 3, dim: "ingenierie", text: "J’ai inventé un dispositif ou procédé original." },
  { id: 4, dim: "ingenierie", text: "J’ai déposé un brevet ou participé à un projet d’ingénierie innovant." },
  { id: 5, dim: "ecriture", text: "J’ai écrit une histoire, un essai ou un article." },
  { id: 6, dim: "ecriture", text: "J’ai publié un texte dans une revue ou un journal." },
  { id: 7, dim: "musique", text: "J’ai appris à jouer d’un instrument de musique." },
  { id: 8, dim: "musique", text: "J’ai composé ou enregistré une œuvre musicale originale." },
  { id: 9, dim: "arts_visuels", text: "J’ai produit un dessin, une peinture ou une photographie." },
  { id: 10, dim: "arts_visuels", text: "J’ai exposé mes œuvres dans un lieu public." },
  { id: 11, dim: "cuisine", text: "J’ai créé une recette originale." },
  { id: 12, dim: "cuisine", text: "Ma création culinaire a été reconnue ou publiée." },
  { id: 13, dim: "danse", text: "J’ai participé à un spectacle de danse, théâtre ou performance." },
  { id: 14, dim: "danse", text: "J’ai reçu une reconnaissance ou un prix pour une performance." },
  { id: 15, dim: "theatre_film", text: "J’ai écrit ou participé à une pièce, un court-métrage ou un film." },
  { id: 16, dim: "theatre_film", text: "J’ai eu un rôle principal ou une reconnaissance officielle dans ce domaine." },
  { id: 17, dim: "humour", text: "J’ai écrit ou raconté des blagues originales bien reçues." },
  { id: 18, dim: "humour", text: "J’ai produit du contenu humoristique diffusé publiquement." },
  { id: 19, dim: "design_architecture", text: "J’ai conçu un objet, un logo ou un projet de design." },
  { id: 20, dim: "design_architecture", text: "Mon travail en design/architecture a été exposé, publié ou utilisé." },
];

export default function CAQTest() {
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
    const scores = {};
    Object.keys(DOMAINS).forEach((d) => (scores[d] = 0));
    QUESTIONS.forEach((q) => {
      if (answers[q.id]) scores[q.dim] += 1;
    });
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    return { domainScores: scores, total };
  }, [answers]);

  const overviewData = Object.entries(metrics.domainScores).map(([k, v]) => ({
    name: DOMAINS[k],
    value: v,
  }));

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/caq/report/${assignmentId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur génération rapport.");
      setAiReport(data.report || "");
      setStep(2);
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
    a.download = `caq-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="b5-page">
      <h1>CAQ — Réalisations Créatives</h1>

      {step === 0 && (
        <div className="b5-intro">
          <p>Cochez les réalisations qui s’appliquent à vous.</p>
          <button className="b5-btn primary" onClick={() => setStep(1)}>Commencer</button>
        </div>
      )}

      {step === 1 && (
        <div>
          {QUESTIONS.map((q) => (
            <label key={q.id} className="b5-card" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={answers[q.id] || false}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.checked }))}
              />
              <span>{q.text}</span>
            </label>
          ))}
          <button className="b5-btn primary" onClick={submit} disabled={loading}>
            {loading ? "Analyse..." : "Envoyer"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Résultats CAQ</h2>
          <div className="b5-card">Score total : {metrics.total} / 20</div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 2]} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          {aiReport && (
            <div className="b5-card">
              <h3>Rapport IA</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{aiReport}</pre>
              <button className="b5-btn" onClick={downloadReport}>
                <Download size={18}/> Télécharger
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
