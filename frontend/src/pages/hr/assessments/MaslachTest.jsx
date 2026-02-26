import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./BigFiveTest.css";
import { Download, RotateCcw, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/** Dev-only: pull your key from env if you insist on client-side AI (not for prod). */
const OPENAI_KEY ="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";

/** Likert 0..6 (frequency scale) */
const LIKERT = [0, 1, 2, 3, 4, 5, 6];

const i18n = {
  fr: {
    appTitle: "Questionnaire d'épuisement (style Maslach)",
    start: "Commencer",
    next: "Suivant",
    back: "Retour",
    submit: "Voir mes résultats",
    restart: "Recommencer",
    download: "Télécharger le PDF",
    progress: "Progression",
    resultTitle: "Résultats Burnout (Maslach)",
    overview: "Aperçu des dimensions",
    dims: { EE: "Épuisement émotionnel (EE)", DP: "Dépersonnalisation (DP)", PA: "Accomplissement personnel (PA)" },
    scale: [
      "Jamais (0)","Quelques fois/an (1)","Mensuel (2)","Quelques fois/mois (3)",
      "Hebdomadaire (4)","Quelques fois/semaine (5)","Quotidien (6)",
    ],
    legendHint: "Plus EE/DP sont élevés, plus le risque augmente. Pour PA, un score plus bas indique un risque plus élevé.",
    nonClinical: "Outil indicatif non clinique.",
    aiTitle: "Rapport IA — Burnout (Maslach)",
    aiGenerating: "Génération du rapport…",
  },
  en: {
    appTitle: "Burnout Questionnaire (Maslach-style)",
    start: "Start",
    next: "Next",
    back: "Back",
    submit: "See my results",
    restart: "Retake",
    download: "Download PDF",
    progress: "Progress",
    resultTitle: "Burnout Results (Maslach)",
    overview: "Dimension Overview",
    dims: { EE: "Emotional Exhaustion (EE)", DP: "Depersonalization (DP)", PA: "Personal Accomplishment (PA)" },
    scale: [
      "Never (0)","A few times/year (1)","Monthly (2)","A few times/month (3)",
      "Weekly (4)","A few times/week (5)","Daily (6)",
    ],
    legendHint: "Higher EE/DP means more risk; lower PA suggests greater risk.",
    nonClinical: "Indicative, non-clinical tool.",
    aiTitle: "AI Report — Burnout (Maslach)",
    aiGenerating: "Generating report…",
  },
};

/** 22 items: EE(9), DP(5), PA(8). Sample wording (not MBI text). */
const QUESTIONS = [
  // EE
  { id: 1, sub: "EE", fr: "Je termine ma journée vidé(e) d'énergie.", en: "I finish the day drained of energy." },
  { id: 2, sub: "EE", fr: "Je me sens dépassé(e) par la charge émotionnelle du travail.", en: "I feel overwhelmed by the emotional load of my work." },
  { id: 3, sub: "EE", fr: "J’ai du mal à récupérer entre deux journées de travail.", en: "I struggle to recover between workdays." },
  { id: 4, sub: "EE", fr: "Je me sens épuisé(e) quand je pense au travail.", en: "I feel exhausted when I think about work." },
  { id: 5, sub: "EE", fr: "Il m’est difficile de soutenir le rythme sur la semaine.", en: "It’s hard to sustain the pace through the week." },
  { id: 6, sub: "EE", fr: "Je manque d’énergie pour mes tâches habituelles.", en: "I lack energy for my usual tasks." },
  { id: 7, sub: "EE", fr: "Je me lève fatigué(e) à l’idée du travail.", en: "I wake up feeling tired at the thought of work." },
  { id: 8, sub: "EE", fr: "Je me sens émotionnellement à bout au travail.", en: "I feel emotionally spent at work." },
  { id: 9, sub: "EE", fr: "Je ressens une fatigue persistante liée au travail.", en: "I feel a lingering work-related fatigue." },
  // DP
  { id:10, sub: "DP", fr: "Je deviens plus détaché(e) envers les personnes avec qui je travaille.", en: "I find myself more detached from the people I work with." },
  { id:11, sub: "DP", fr: "J’adopte parfois un ton cynique face aux demandes des autres.", en: "I sometimes take a cynical tone toward others’ requests." },
  { id:12, sub: "DP", fr: "Je me surprends à traiter les situations avec froideur.", en: "I catch myself handling situations more coldly." },
  { id:13, sub: "DP", fr: "Je me sens indifférent(e) aux problèmes des autres au travail.", en: "I feel indifferent to others’ problems at work." },
  { id:14, sub: "DP", fr: "Je garde mes distances émotionnelles pour “tenir”.", en: "I keep emotional distance in order to get by." },
  // PA
  { id:15, sub: "PA", fr: "Je sens que mon travail aide vraiment les autres.", en: "I feel my work genuinely helps others." },
  { id:16, sub: "PA", fr: "Je me sens compétent(e) face aux défis du travail.", en: "I feel competent when facing work challenges." },
  { id:17, sub: "PA", fr: "Je suis fier/fière de ce que j’accomplis au travail.", en: "I’m proud of what I accomplish at work." },
  { id:18, sub: "PA", fr: "Je me sens efficace et utile dans mon rôle.", en: "I feel effective and useful in my role." },
  { id:19, sub: "PA", fr: "Je vois clairement l’impact positif de mon travail.", en: "I clearly see the positive impact of my work." },
  { id:20, sub: "PA", fr: "Je progresse et j’apprends dans mon activité.", en: "I’m growing and learning in my job." },
  { id:21, sub: "PA", fr: "Je trouve du sens dans mes responsabilités.", en: "I find meaning in my responsibilities." },
  { id:22, sub: "PA", fr: "Je me sens capable d’atteindre des objectifs exigeants.", en: "I feel capable of achieving demanding goals." },
];

/* ---------- PDF helper ---------- */
async function downloadResultsAsPDF() {
  const html2canvasMod = await import("html2canvas");
  const jspdfMod = await import("jspdf");
  const html2canvas = html2canvasMod.default || html2canvasMod;
  const jsPDFClass = jspdfMod.jsPDF || jspdfMod.default;

  const el = document.getElementById("results-root");
  if (!el) return;
  el.classList.add("b5-pdf-bg");

  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: el.scrollWidth });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDFClass({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= pageHeight;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;
  }
  pdf.save(`maslach-results-${new Date().toISOString().slice(0, 10)}.pdf`);
  el.classList.remove("b5-pdf-bg");
}

/* ---------- scoring ---------- */
function normalizeTo100(value, min, max) {
  if (max === min) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
}
function computeScores(answers) {
  const sums = { EE: 0, DP: 0, PA: 0 };
  const counts = { EE: 0, DP: 0, PA: 0 };
  for (const q of QUESTIONS) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null) continue; // 0..6 valid
    sums[q.sub] += raw;
    counts[q.sub] += 1;
  }
  const subScores = {};
  (["EE","DP","PA"]).forEach((k) => {
    const max = 6 * (counts[k] || 1);
    subScores[k] = counts[k] ? normalizeTo100(sums[k], 0, max) : 0;
  });
  const labels = {
    EE: subScores.EE >= 60 ? "high" : subScores.EE <= 40 ? "low" : "moderate",
    DP: subScores.DP >= 60 ? "high" : subScores.DP <= 40 ? "low" : "moderate",
    PA: subScores.PA <= 40 ? "low" : subScores.PA >= 60 ? "high" : "moderate", // PA lower = higher risk
  };
  return { subScores, raw: sums, labels, counts };
}

/* ---------- UI atoms ---------- */
function LikertRow({ q, value, onChange, lang }) {
  const labels = i18n[lang].scale;
  return (
    <div className="b5-card">
      <div className="b5-card-title">{q[lang]}</div>
      <div className="b5-card-sub">{q.sub}</div>
      <div className="b5-likert">
        {LIKERT.map((n, idx) => (
          <label key={idx} className={`b5-likert-option ${value === n ? "is-selected" : ""}`}>
            <input type="radio" name={`q-${q.id}`} checked={value === n} onChange={() => onChange(n)} />
            <span>{labels[idx]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function MaslachTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment"); // REQUIRED: /maslach?assignment=ID

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [lang, setLang] = useState("fr");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReport, setAiReport] = useState("");

  const perPage = 5;
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  const currentPage = Math.min(step, totalPages);
  const percent = Math.round((Math.min(QUESTIONS.length, Object.keys(answers).length) / QUESTIONS.length) * 100);
  const pageQuestions = QUESTIONS.slice((currentPage - 1) * perPage, currentPage * perPage);
  const canNext = pageQuestions.every((q) => answers[q.id] !== undefined);
  const scores = useMemo(() => computeScores(answers), [answers]);
  const t = i18n[lang];

  // Verify assignment belongs to user and restore results if already completed
  useEffect(() => {
    if (!assignmentId) return;
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: { ...authHeader } })
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
          setStep(totalPages + 1); // Show results page
        }
      })
      .catch(() => {
        alert("Invalid or inaccessible assignment. Please start from My Assessments.");
        navigate("/my-assessments");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  // Submit answers + metrics to backend
  async function submitToBackend() {
    if (!assignmentId) {
      alert("Missing assignment id. Open this test from My Assessments.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          answers,
          metrics: { EE: scores.subScores.EE, DP: scores.subScores.DP, PA: scores.subScores.PA },
          ai_report: aiReport || "", // may be empty now; we’ll update after AI generation too
          overwrite: true,           // allow resubmission if needed
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.non_field_errors?.[0] || "Failed to submit.");
      }
      setStep(totalPages + 1); // show local results
    } catch (e) {
      alert(e.message);
    }
  }

  // Optional: client-side AI narrative (dev only) then persist to backend (overwrite)
  async function generateAIReport() {
    if (!assignmentId) return;
    setAiLoading(true);
    setAiError("");
    setAiReport("");

    try {
      const res = await fetch(`${API_BASE}/api/maslach/report/${assignmentId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Échec de la génération du rapport.");
      }

      const data = await res.json();
      if (data.report) {
        setAiReport(data.report);
      } else {
        throw new Error("Aucun rapport reçu.");
      }
    } catch (err) {
      setAiError(err.message || "Erreur lors de la génération du rapport.");
    } finally {
      setAiLoading(false);
    }
  }

  // Auto-generate report after completion if not already loaded
  useEffect(() => {
    const isFinished = step > totalPages;
    const isComplete = Object.keys(answers).length === QUESTIONS.length;

    if (assignmentId && isFinished && isComplete && !aiReport && !aiLoading) {
      generateAIReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, totalPages, answers, aiReport]);


  if (!assignmentId) {
    return (
      <div className="b5-page" style={{ padding: 16 }}>
        <h2>Maslach</h2>
        <p>Please start this test from <b>My Assessments</b> so it’s linked to your assignment.</p>
      </div>
    );
  }

  const overviewData = [
    { name: t.dims.EE, value: scores.subScores.EE || 0 },
    { name: t.dims.DP, value: scores.subScores.DP || 0 },
    { name: t.dims.PA, value: scores.subScores.PA || 0 },
  ];

  return (
    <div className="b5-page">
      {/* Top Bar */}
      <div className="b5-topbar">
        <div>
          <h1 className="b5-title">{t.appTitle}</h1>
          <div className="b5-progress-label">{t.progress}</div>
        </div>
        <div className="b5-actions">
          <select className="b5-select" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Langue">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="b5-progress">
        <div className="b5-progress-bar" style={{ width: `${step === 0 ? 0 : percent}%` }} />
      </div>

      <div className="b5-container">
        {/* Intro */}
        {step === 0 && (
          <div className="b5-intro">
            <h2>{t.appTitle}</h2>
            <p>
              {lang === "fr"
                ? "Répondez à 22 affirmations (fréquence 0–6). Dimensions : Épuisement émotionnel (EE), Dépersonnalisation (DP), Accomplissement personnel (PA)."
                : "Answer 22 statements (frequency 0–6). Dimensions: Emotional Exhaustion (EE), Depersonalization (DP), Personal Accomplishment (PA)."}
            </p>
            <div className="b5-alert">
              <AlertTriangle size={16} />
              <span style={{ marginLeft: 8 }}>{t.nonClinical}</span>
            </div>
            <button className="b5-btn primary" onClick={() => setStep(1)}>{t.start}</button>
          </div>
        )}

        {/* Questions */}
        {step > 0 && step <= totalPages && (
          <div>
            <div className="b5-stack">
              {pageQuestions.map((q) => (
                <LikertRow
                  key={q.id}
                  q={q}
                  lang={lang}
                  value={answers[q.id]}
                  onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                />
              ))}
            </div>
            <div className="b5-nav">
              <button className="b5-btn ghost" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                <ArrowLeft size={18} /> {t.back}
              </button>
              {step < totalPages ? (
                <button className="b5-btn primary" onClick={() => canNext && setStep((s) => Math.min(totalPages, s + 1))} disabled={!canNext}>
                  {t.next} <ArrowRight size={18} />
                </button>
              ) : (
                <button className="b5-btn primary" onClick={submitToBackend} disabled={!canNext}>
                  {t.submit}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {step > totalPages && (
          <div id="results-root">
            <div className="b5-results-head">
              <h2>{t.resultTitle}</h2>
              <div className="b5-results-actions">
                <button className="b5-btn outline" onClick={downloadResultsAsPDF}>
                  <Download size={18} /> {t.download}
                </button>
                <button
                  className="b5-btn"
                  onClick={() => {
                    setAnswers({});
                    setStep(1);
                    setAiReport("");
                    setAiError("");
                  }}
                >
                  <RotateCcw size={18} /> {t.restart}
                </button>
              </div>
            </div>

            {/* Overview chart */}
            <div className="b5-card">
              <div className="b5-card-title">{t.overview}</div>
              <div className="b5-card-sub">{t.legendHint}</div>
              <div className="b5-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Score" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI narrative */}
            <div className="b5-card" style={{ marginTop: 16 }}>
              <div className="b5-card-title">{t.aiTitle}</div>
              <div className="b5-report">
                {aiLoading && <p>{t.aiGenerating}</p>}
                {aiError && <p style={{ color: "#b91c1c" }}>{aiError}</p>}
                {aiReport && (
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6 }}>
                    {aiReport}
                  </pre>
                )}
                {!OPENAI_KEY && !aiReport && !aiLoading && (
                  <p style={{ opacity: 0.7 }}>
                    {lang === "fr"
                      ? "(Astuce dev : définissez VITE_OPENAI_KEY pour générer automatiquement le rapport et l'enregistrer côté serveur.)"
                      : "(Dev hint: set VITE_OPENAI_KEY to auto-generate the report and save it server-side.)"}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="b5-footer">© {new Date().getFullYear()} • DeepMind</div>
    </div>
  );
}
