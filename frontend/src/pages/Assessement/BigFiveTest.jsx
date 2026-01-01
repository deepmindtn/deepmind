import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./BigFiveTest.css";
import { Download, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ---------- PDF helpers ---------- */
async function capturePDFBlob() {
  const html2canvasMod = await import("html2canvas");
  const jspdfMod = await import("jspdf");
  const html2canvas = html2canvasMod.default || html2canvasMod;
  const jsPDFClass = jspdfMod.jsPDF || jspdfMod.default;

  const el = document.getElementById("results-root");
  if (!el) return null;
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

  el.classList.remove("b5-pdf-bg");
  return pdf.output("blob");
}
async function downloadResultsAsPDF(filename = `big-five-results-${new Date().toISOString().slice(0, 10)}.pdf`) {
  const blob = await capturePDFBlob();
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return blob;
}

/* ---------- constants/questions/i18n ---------- */
const LIKERT = [1, 2, 3, 4, 5];

const i18n = {
  fr: {
    appTitle: "Test psychométrique complet",
    start: "Commencer",
    next: "Suivant",
    back: "Retour",
    submit: "Envoyer mes réponses",
    restart: "Recommencer",
    download: "Télécharger le PDF",
    progress: "Progression",
    resultTitle: "Les cinq grands",
    overview: "Aperçu",
    traits: { N: "Névrosisme", E: "Extraversion", O: "Ouverture d'esprit", A: "Agréabilité", C: "Conscience" },
    scale: ["Fortement en désaccord","Plutôt en désaccord","Neutre","Plutôt en accord","Fortement en accord"],
    descriptions: {
      N: {
        high: "Score élevé : sensibilité au stress et affects négatifs fréquents.",
        low: "Score faible : calme, stabilité émotionnelle et résilience.",
        facets: [
          { key: "anxiety", label: "Anxiété" },
          { key: "anger", label: "Colère" },
          { key: "depression", label: "Dépression" },
          { key: "selfconscious", label: "Gêne sociale" },
          { key: "immoderation", label: "Immodération" },
          { key: "vulnerability", label: "Vulnérabilité" },
        ],
      },
      E: {
        high: "Sociabilité, assertivité et énergie.",
        low: "Réserve, calme et style réfléchi.",
        facets: [
          { key: "friendliness", label: "Chaleur" },
          { key: "gregariousness", label: "Grégarité" },
          { key: "assertiveness", label: "Assertivité" },
          { key: "activity", label: "Niveau d'activité" },
          { key: "excitement", label: "Recherche de sensations" },
          { key: "cheerfulness", label: "Enjouement" },
        ],
      },
      O: {
        high: "Curiosité, imagination et ouverture aux nouveautés.",
        low: "Préférence pour le familier et le concret.",
        facets: [
          { key: "imagination", label: "Imagination" },
          { key: "artistic", label: "Intérêts artistiques" },
          { key: "emotionality", label: "Émotionnalité" },
          { key: "adventurousness", label: "Goût de l'aventure" },
          { key: "intellect", label: "Intellect" },
          { key: "liberalism", label: "Libéralisme" },
        ],
      },
      A: {
        high: "Compassion, confiance et coopération.",
        low: "Style direct/compétitif, scepticisme.",
        facets: [
          { key: "trust", label: "Confiance" },
          { key: "morality", label: "Moralité" },
          { key: "altruism", label: "Altruisme" },
          { key: "cooperation", label: "Coopération" },
          { key: "modesty", label: "Modestie" },
          { key: "sympathy", label: "Empathie" },
        ],
      },
      C: {
        high: "Organisation, fiabilité et orientation objectifs.",
        low: "Spontanéité, flexibilité et décontraction.",
        facets: [
          { key: "selfefficacy", label: "Auto-efficacité" },
          { key: "orderliness", label: "Ordre" },
          { key: "dutifulness", label: "Sens du devoir" },
          { key: "achievement", label: "Recherche de réussite" },
          { key: "selfdiscipline", label: "Autodiscipline" },
          { key: "cautiousness", label: "Prudence" },
        ],
      },
    },
  },
  en: {
    appTitle: "Full Psychometric Test",
    start: "Start",
    next: "Next",
    back: "Back",
    submit: "Submit my answers",
    restart: "Retake",
    download: "Download PDF",
    progress: "Progress",
    resultTitle: "Big Five Results",
    overview: "Overview",
    traits: { N: "Neuroticism", E: "Extraversion", O: "Openness", A: "Agreeableness", C: "Conscientiousness" },
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
    descriptions: {
      N: {
        high: "Higher scores reflect sensitivity to stress and frequent negative affect.",
        low: "Lower scores reflect calm, emotional stability, and resilience.",
        facets: [
          { key: "anxiety", label: "Anxiety" },
          { key: "anger", label: "Anger" },
          { key: "depression", label: "Depression" },
          { key: "selfconscious", label: "Self-Consciousness" },
          { key: "immoderation", label: "Immoderation" },
          { key: "vulnerability", label: "Vulnerability" },
        ],
      },
      E: {
        high: "Sociability, assertiveness, and high energy.",
        low: "Reserve, reflective style, and quietness.",
        facets: [
          { key: "friendliness", label: "Friendliness" },
          { key: "gregariousness", label: "Gregariousness" },
          { key: "assertiveness", label: "Assertiveness" },
          { key: "activity", label: "Activity Level" },
          { key: "excitement", label: "Excitement-Seeking" },
          { key: "cheerfulness", label: "Cheerfulness" },
        ],
      },
      O: {
        high: "Curiosity, imagination, and openness to new ideas/experiences.",
        low: "Preference for the familiar, practicality, focus on the concrete.",
        facets: [
          { key: "imagination", label: "Imagination" },
          { key: "artistic", label: "Artistic Interests" },
          { key: "emotionality", label: "Emotionality" },
          { key: "adventurousness", label: "Adventurousness" },
          { key: "intellect", label: "Intellect" },
          { key: "liberalism", label: "Liberalism" },
        ],
      },
      A: {
        high: "Compassion, trust, and cooperation.",
        low: "Skepticism, directness, and competitive style.",
        facets: [
          { key: "trust", label: "Trust" },
          { key: "morality", label: "Morality" },
          { key: "altruism", label: "Altruism" },
          { key: "cooperation", label: "Cooperation" },
          { key: "modesty", label: "Modesty" },
          { key: "sympathy", label: "Sympathy" },
        ],
      },
      C: {
        high: "Organization, reliability, and goal-directedness.",
        low: "Spontaneity, flexibility, and laid-back style.",
        facets: [
          { key: "selfefficacy", label: "Self-Efficacy" },
          { key: "orderliness", label: "Orderliness" },
          { key: "dutifulness", label: "Dutifulness" },
          { key: "achievement", label: "Achievement-Striving" },
          { key: "selfdiscipline", label: "Self-Discipline" },
          { key: "cautiousness", label: "Cautiousness" },
        ],
      },
    },
  },
};

const QUESTIONS = [
  { id: 1, trait: "E", reverse: false, en: "I enjoy social gatherings.", fr: "J'apprécie les rassemblements sociaux." },
  { id: 2, trait: "C", reverse: false, en: "I am organized and follow a schedule.", fr: "Je suis organisé(e) et je suis un emploi du temps." },
  { id: 3, trait: "N", reverse: false, en: "I get stressed out easily.", fr: "Je me stresse facilement." },
  { id: 4, trait: "A", reverse: false, en: "I am compassionate toward others.", fr: "Je suis compatissant(e) envers les autres." },
  { id: 5, trait: "O", reverse: false, en: "I have a vivid imagination.", fr: "J'ai une imagination débordante." },
  { id: 6, trait: "E", reverse: false, en: "I feel comfortable around people.", fr: "Je me sens à l'aise avec les gens." },
  { id: 7, trait: "C", reverse: false, en: "I am always prepared.", fr: "Je suis toujours prêt(e)." },
  { id: 8, trait: "N", reverse: false, en: "I often feel blue.", fr: "Je me sens souvent déprimé(e)." },
  { id: 9, trait: "A", reverse: false, en: "I am interested in others' problems.", fr: "Je m'intéresse aux problèmes des autres." },
  { id:10, trait: "O", reverse: false, en: "I enjoy artistic and creative experiences.", fr: "J'apprécie les expériences artistiques et créatives." },
  { id:11, trait: "E", reverse: false, en: "I start conversations.", fr: "Je lance des conversations." },
  { id:12, trait: "C", reverse: false, en: "I pay attention to detail.", fr: "Je fais attention aux détails." },
  { id:13, trait: "N", reverse: false, en: "I worry about things.", fr: "Je m'inquiète à propos des choses." },
  { id:14, trait: "A", reverse: false, en: "I make people feel at ease.", fr: "Je mets les gens à l'aise." },
  { id:15, trait: "E", reverse: true,  en: "I don't mind being the center of attention.", fr: "Être le centre de l'attention ne me dérange pas." },
  { id:16, trait: "C", reverse: false, en: "I complete tasks successfully.", fr: "Je mène les tâches à bien." },
  { id:17, trait: "N", reverse: false, en: "I get irritated easily.", fr: "Je m'irrite facilement." },
  { id:18, trait: "A", reverse: false, en: "I am helpful and unselfish.", fr: "Je suis serviable et altruiste." },
  { id:19, trait: "O", reverse: false, en: "I enjoy thinking deeply and reflecting.", fr: "J'aime réfléchir en profondeur." },
  { id:20, trait: "E", reverse: false, en: "I am full of energy.", fr: "Je suis plein(e) d'énergie." },
];

const SUBFACET_MAP = {
  N: ["anxiety","anger","depression","selfconscious","immoderation","vulnerability"],
  E: ["friendliness","gregariousness","assertiveness","activity","excitement","cheerfulness"],
  O: ["imagination","artistic","emotionality","adventurousness","intellect","liberalism"],
  A: ["trust","morality","altruism","cooperation","modesty","sympathy"],
  C: ["selfefficacy","orderliness","dutifulness","achievement","selfdiscipline","cautiousness"],
};

/* ---------- scoring helpers ---------- */
function normalizeTo100(value, min, max) {
  return Math.round(((value - min) / (max - min)) * 100);
}
function computeScores(answers) {
  const traitTotals = { N: 0, E: 0, O: 0, A: 0, C: 0 };
  const traitCounts = { N: 0, E: 0, O: 0, A: 0, C: 0 };
  const facetTotals = { N: {}, E: {}, O: {}, A: {}, C: {} };

  QUESTIONS.forEach((q) => {
    if (!answers[q.id]) return;
    const raw = answers[q.id];
    const score = q.reverse ? 6 - raw : raw;
    traitTotals[q.trait] += score;
    traitCounts[q.trait] += 1;
    const facets = SUBFACET_MAP[q.trait];
    const idx = (traitCounts[q.trait] - 1) % facets.length;
    const fkey = facets[idx];
    facetTotals[q.trait][fkey] = (facetTotals[q.trait][fkey] || 0) + score;
  });

  const traitScores = Object.fromEntries(
    Object.entries(traitTotals).map(([t, total]) => {
      const count = traitCounts[t] || 1;
      return [t, normalizeTo100(total, 1 * count, 5 * count)];
    })
  );

  const facetScores = {};
  for (const t of Object.keys(facetTotals)) {
    facetScores[t] = Object.fromEntries(
      Object.entries(facetTotals[t]).map(([fk, total]) => {
        const count = 1; // one question per facet in this mini version
        return [fk, normalizeTo100(total, 1 * count, 5 * count)];
      })
    );
  }
  return { traitScores, facetScores };
}

/* ---------- AI helpers ---------- */
function buildBigFiveAnswerLines(lang, answers) {
  const labels = i18n[lang].scale;
  return QUESTIONS.filter(q => answers[q.id]).map(q => {
    const v = answers[q.id];
    const text = q[lang];
    const label = labels[v - 1] || v;
    return `Q${q.id} [${q.trait}] — ${text} → ${v} (${label})${q.reverse ? " [reverse]" : ""}`;
  }).join("\n");
}
function buildBigFivePrompt({ lang, answersText, metrics }) {
  const language = lang === "fr" ? "French" : "English";
  return `
You are a workplace psychologist. A client completed a short Big Five questionnaire (1–5 Likert).
Write a clear, non-clinical, practical report in ${language}, ~400–500 words.

DATA (0–100 normalized):
${JSON.stringify(metrics, null, 2)}

RAW ANSWERS (for context):
${answersText}

Structure:
- Title
- 2–3 sentence summary
- Trait insights (N, E, O, A, C) linking to daily work behaviors
- Facet highlights (only top ~3 strongest signals)
- Strengths (3–5 bullets)
- Watch-outs (2–4 bullets)
- Action suggestions (4–6 bullets) for habits/process at work
Constraints: no diagnoses, keep tone supportive, no markdown headings.
`.trim();
}

/* ---------- UI atoms ---------- */
function LikertRow({ q, value, onChange, lang }) {
  const t = i18n[lang];
  return (
    <div className="b5-card">
      <div className="b5-card-title">{q[lang]}</div>
      <div className="b5-card-sub">{i18n.en.traits[q.trait]} / {i18n.fr.traits[q.trait]}</div>
      <div className="b5-likert">
        {LIKERT.map((n, idx) => (
          <label key={idx} className={`b5-likert-option ${value === n ? "is-selected" : ""}`}>
            <input type="radio" name={`q-${q.id}`} checked={value === n} onChange={() => onChange(n)} />
            <span>{t.scale[idx]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ---------- Component ---------- */
export default function BigFiveTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment"); // /big-five?assignment=ID

  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const OPENAI_KEY ='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'

  const [lang, setLang] = useState("fr");
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [aiError, setAiError] = useState("");

  const questionsPerPage = 3;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);
  const currentPage = Math.min(step, totalPages);
  const percent = Math.round(
    (Math.min(QUESTIONS.length, Object.keys(answers).length) / QUESTIONS.length) * 100
  );

  useEffect(() => {
    if (!assignmentId) return;
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: { ...authHeader } })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .catch(() => {
        alert("Invalid or inaccessible assignment. Please open this test from My Assessments.");
        navigate("/my-assessments");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  const t = i18n[lang];
  const metrics = useMemo(() => computeScores(answers), [answers]);

  const pageQuestions = QUESTIONS.slice(
    (currentPage - 1) * questionsPerPage,
    currentPage * questionsPerPage
  );
  const canNext = pageQuestions.every((q) => !!answers[q.id]);

  async function generateAIReport(localMetrics) {
    setAiLoading(true);
    setAiError("");
    setAiReport("");
  
    try {
      const res = await fetch(`${API_BASE}/api/assessments/${assignmentId}/generate-report/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader
        },
        body: JSON.stringify({ answers, metrics: localMetrics }),
      });
      const data = await res.json();
      console.log(data)
      if (!res.ok) throw new Error(data?.error || "Failed to fetch report.");
      setAiReport(data.report || "");
      console.log(data.report)
      return data.ai_report || "";
    } catch (err) {
      setAiError(err.message || "Request failed");
      return "";
    } finally {
      setAiLoading(false);
    }
  }
  

  async function submitToBackend() {
    if (!assignmentId) {
      alert("Missing assignment id. Open this test from My Assessments.");
      return;
    }
    try {
      // 1) compute metrics (trait + facet)
      const m = computeScores(answers);
      const payloadMetrics = { traitScores: m.traitScores, facetScores: m.facetScores };

      // 2) (optional) AI report
      const reportText = await generateAIReport(payloadMetrics);

      // 3) send everything to backend
      const r = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics: payloadMetrics, ai_report: reportText, overwrite: true }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to submit.");
      }

      // 4) show local results
      setStep(totalPages + 1);
    } catch (e) {
      alert(e.message);
    }
  }

  async function uploadPDF(blob) {
    if (!assignmentId || !blob) return;
    const fd = new FormData();
    fd.append("file", blob, `bigfive-${assignmentId}.pdf`);
    await fetch(`${API_BASE}/api/assessments/${assignmentId}/upload-pdf/`, {
      method: "PUT",
      headers: { ...authHeader },
      body: fd,
    }).catch(() => {});
  }

  if (!assignmentId) {
    return (
      <div className="b5-page" style={{ padding: 16 }}>
        <h2>Big Five</h2>
        <p>Please start this test from <b>My Assessments</b> so it’s linked to your assignment.</p>
      </div>
    );
  }

  const overviewData = [
    { name: t.traits.N, value: metrics.traitScores.N || 0 },
    { name: t.traits.E, value: metrics.traitScores.E || 0 },
    { name: t.traits.O, value: metrics.traitScores.O || 0 },
    { name: t.traits.A, value: metrics.traitScores.A || 0 },
    { name: t.traits.C, value: metrics.traitScores.C || 0 },
  ];

  return (
    <div className="b5-page">
      {/* Top Bar */}
      <div className="b5-topbar">
        <div>
          <h1 className="b5-title">{t.appTitle}</h1>
          <div className="b5-progress-label">{t.progress}</div>
        </div>
        <div className="b5-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
        {step === 0 && (
          <div className="b5-intro">
            <h2>{t.appTitle}</h2>
            <p>
              {lang === "fr"
                ? "Répondez honnêtement à 20 affirmations (1 à 5)."
                : "Answer 20 statements honestly (1 to 5)."}
            </p>
            <button className="b5-btn primary" onClick={() => setStep(1)}>{t.start}</button>
          </div>
        )}

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

        {step > totalPages && (
          <div id="results-root">
            <div className="b5-results-head">
              <h2>{t.resultTitle}</h2>
              <div className="b5-results-actions">
                <button
                  className="b5-btn outline"
                  onClick={async () => {
                    const blob = await downloadResultsAsPDF();
                    await uploadPDF(blob);
                  }}
                >
                  <Download size={18} /> {t.download}
                </button>
                <button className="b5-btn" onClick={() => { setAnswers({}); setStep(1); setAiReport(""); setAiError(""); }}>
                  <RotateCcw size={18} /> {t.restart}
                </button>
              </div>
            </div>

            {/* Overview chart */}
            <div className="b5-card">
              <div className="b5-card-title">{t.overview}</div>
              <div className="b5-card-sub">
                {t.traits.N}, {t.traits.E}, {t.traits.O}, {t.traits.A}, {t.traits.C}
              </div>
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

            {/* Per-trait facet bars */}
            {["N", "E", "O", "A", "C"].map((trait) => {
              const facets = i18n[lang].descriptions[trait].facets;
              const bars = facets.map((f) => ({
                name: f.label,
                value: (metrics.facetScores[trait] || {})[f.key] || 0,
              }));
              const level = metrics.traitScores[trait] || 0;
              const summary = level >= 60 ? i18n[lang].descriptions[trait].high : i18n[lang].descriptions[trait].low;

              return (
                <div className="b5-card" key={trait}>
                  <div className="b5-card-title">{i18n[lang].traits[trait]} — {level}</div>
                  <div className="b5-card-sub">{summary}</div>
                  <div className="b5-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bars}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" interval={0} angle={-10} textAnchor="end" height={60} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="value" name="Facet" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}

            {/* AI report (from backend payload we posted) */}
            {aiLoading && (
              <div className="b5-card"><div className="b5-card-title">AI</div><div className="b5-report">…</div></div>
            )}
            {aiError && (
              <div className="b5-card"><div className="b5-card-title">AI error</div><div className="b5-report">{aiError}</div></div>
            )}
            {aiReport && (
              <div className="b5-card" style={{ marginBottom: 16 }}>
                <div className="b5-card-title">{lang === "fr" ? "Rapport IA — Big Five" : "AI Report — Big Five"}</div>
                <div className="b5-report">
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6 }}>
                    {aiReport}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="b5-footer">© {new Date().getFullYear()} • DeepMind</div>
    </div>
  );
}
