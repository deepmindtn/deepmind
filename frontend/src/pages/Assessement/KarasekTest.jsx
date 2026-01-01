import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./BigFiveTest.css"; // re-use styles
import { Download, RotateCcw, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
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
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: el.scrollWidth,
  });
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

async function downloadResultsAsPDF(filename = `karasek-results-${new Date().toISOString().slice(0,10)}.pdf`) {
  const blob = await capturePDFBlob();
  if (!blob) return null;
  // trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return blob;
}

/* ---------- i18n ---------- */
const i18n = {
  fr: {
    appTitle: "Questionnaire Karasek (Demande–Contrôle–Soutien)",
    start: "Commencer",
    next: "Suivant",
    back: "Retour",
    submit: "Envoyer mes réponses",
    restart: "Recommencer",
    download: "Télécharger le PDF",
    progress: "Progression",
    resultTitle: "Résultats Karasek",
    overview: "Aperçu des dimensions",
    scale4: ["Pas du tout d'accord","Plutôt pas d'accord","Plutôt d'accord","Tout à fait d'accord"],
    dims: { D: "Demandes psychologiques", C: "Contrôle (Latitude décisionnelle)", S: "Soutien social (global)" },
    subs: { DA: "Autorité décisionnelle", SD: "Latitude/Utilisation des compétences", SS: "Soutien du supérieur", SC: "Soutien des collègues" },
    quadrant: { lowStrain: "Faible contrainte", highStrain: "Forte contrainte", active: "Actif", passive: "Passif" },
  },
  en: {
    appTitle: "Karasek Questionnaire (Demand–Control–Support)",
    start: "Start",
    next: "Next",
    back: "Back",
    submit: "Submit my answers",
    restart: "Retake",
    download: "Download PDF",
    progress: "Progress",
    resultTitle: "Karasek Results",
    overview: "Dimension Overview",
    scale4: ["Strongly Disagree","Disagree","Agree","Strongly Agree"],
    dims: { D: "Psychological Demands", C: "Control (Decision Latitude)", S: "Social Support (overall)" },
    subs: { DA: "Decision Authority", SD: "Skill Discretion", SS: "Supervisor Support", SC: "Coworker Support" },
    quadrant: { lowStrain: "Low strain", highStrain: "High strain", active: "Active", passive: "Passive" },
  },
};

/* ---------- Questionnaire ---------- */
const LIKERT = [1, 2, 3, 4];

const QUESTIONS = [
  // DEMANDS (D)
  { id: 1, sub: "D", key: "d1", rev: false, fr: "Mon travail exige de travailler très vite.", en: "My job requires working very fast." },
  { id: 2, sub: "D", key: "d2", rev: false, fr: "Mon travail exige de travailler très dur.", en: "My job requires working very hard." },
  { id: 3, sub: "D", key: "d3", rev: false, fr: "Je manque de temps pour accomplir mes tâches.", en: "I am pressed for time in my job." },
  { id: 4, sub: "D", key: "d4", rev: false, fr: "Mon travail comporte des contraintes contradictoires.", en: "My job has conflicting demands." },
  { id: 5, sub: "D", key: "d5", rev: false, fr: "Je dois accomplir une grande quantité de travail.", en: "I have a great deal of work to do." },
  { id: 6, sub: "D", key: "d6", rev: false, fr: "Je dois travailler intensément sans pause suffisante.", en: "I must work intensively without enough breaks." },
  { id: 7, sub: "D", key: "d7", rev: false, fr: "Les délais au travail sont serrés.", en: "Deadlines at work are tight." },
  { id: 8, sub: "D", key: "d8", rev: true,  fr: "Mon travail est généralement calme et détendu.", en: "My job is generally calm and relaxed." },
  { id: 9, sub: "D", key: "d9", rev: false, fr: "Je dois gérer plusieurs choses à la fois.", en: "I have to do several things at once." },

  // CONTROL – Decision Authority (DA)
  { id: 10, sub: "DA", key: "da1", rev: false, fr: "J’ai beaucoup à dire sur la manière d’effectuer mon travail.", en: "I have a lot to say about how I do my job." },
  { id: 11, sub: "DA", key: "da2", rev: false, fr: "Je peux prendre des décisions importantes dans mon travail.", en: "I can make important decisions in my job." },
  { id: 12, sub: "DA", key: "da3", rev: true,  fr: "On me dit exactement comment faire mon travail.", en: "I am told exactly how to do my job." },
  { id: 13, sub: "DA", key: "da4", rev: false, fr: "Je peux influencer les décisions qui touchent mon travail.", en: "I can influence decisions that affect my job." },
  { id: 14, sub: "DA", key: "da5", rev: false, fr: "Je peux organiser mon travail comme je le souhaite.", en: "I can arrange my work as I wish." },
  { id: 15, sub: "DA", key: "da6", rev: true,  fr: "On contrôle fortement ma manière de travailler.", en: "My way of working is tightly controlled." },

  // CONTROL – Skill Discretion (SD)
  { id: 16, sub: "SD", key: "sd1", rev: false, fr: "Mon travail requiert d’apprendre de nouvelles choses.", en: "My job requires learning new things." },
  { id: 17, sub: "SD", key: "sd2", rev: false, fr: "Mon travail nécessite des compétences variées.", en: "My job requires a variety of skills." },
  { id: 18, sub: "SD", key: "sd3", rev: false, fr: "Je peux développer ma créativité dans mon travail.", en: "I can be creative in my job." },
  { id: 19, sub: "SD", key: "sd4", rev: true,  fr: "Mon travail est monotone.", en: "My job is repetitive." },
  { id: 20, sub: "SD", key: "sd5", rev: false, fr: "Je peux utiliser pleinement mes compétences.", en: "I can fully use my skills." },
  { id: 21, sub: "SD", key: "sd6", rev: false, fr: "J’ai des possibilités d’évolution/apprentissage.", en: "I have opportunities to grow/learn." },

  // SOCIAL SUPPORT – Supervisor (SS)
  { id: 22, sub: "SS", key: "ss1", rev: false, fr: "Mon supérieur est compréhensif.", en: "My supervisor is understanding." },
  { id: 23, sub: "SS", key: "ss2", rev: false, fr: "Je peux compter sur mon supérieur en cas de besoin.", en: "I can rely on my supervisor when needed." },
  { id: 24, sub: "SS", key: "ss3", rev: true,  fr: "Je me sens critiqué par mon supérieur.", en: "I feel criticized by my supervisor." },

  // SOCIAL SUPPORT – Coworkers (SC)
  { id: 25, sub: "SC", key: "sc1", rev: false, fr: "Mes collègues sont amicaux.", en: "My coworkers are friendly." },
  { id: 26, sub: "SC", key: "sc2", rev: false, fr: "Je reçois de l’aide de mes collègues.", en: "I get help from my coworkers." },
  { id: 27, sub: "SC", key: "sc3", rev: true,  fr: "Mes collègues me mettent des bâtons dans les roues.", en: "My coworkers make things difficult for me." },
];

/* ---------- scoring + helpers ---------- */
function normalizeTo100(value, min, max) {
  return Math.round(((value - min) / (max - min)) * 100);
}

function buildKarasekAnswerLines(lang, answers, QUESTIONS) {
  const labels = {
    fr: ["Pas du tout d'accord", "Plutôt pas d'accord", "Plutôt d'accord", "Tout à fait d'accord"],
    en: ["Strongly Disagree", "Disagree", "Agree", "Strongly Agree"],
  }[lang];

  return QUESTIONS.filter((q) => answers[q.id])
    .map((q) => {
      const v = answers[q.id];
      const label = labels[v - 1] || v;
      const dim = q.sub;
      const text = lang === "fr" ? q.fr : q.en;
      return `Q${q.id} [${dim}] — ${text} → ${v} (${label})${q.rev ? " [reverse]" : ""}`;
    })
    .join("\n");
}

function computeScores(answers) {
  const sums = { D: 0, DA: 0, SD: 0, SS: 0, SC: 0 };
  const counts = { D: 0, DA: 0, SD: 0, SS: 0, SC: 0 };

  for (const q of QUESTIONS) {
    const raw = answers[q.id];
    if (!raw) continue;
    const score = q.rev ? 5 - raw : raw; // reverse 1..4 => 5 - raw
    sums[q.sub] += score;
    counts[q.sub] += 1;
  }

  const subScores = {};
  for (const k of Object.keys(sums)) {
    const min = 1 * counts[k];
    const max = 4 * counts[k];
    subScores[k] = counts[k] ? normalizeTo100(sums[k], min, max) : 0;
  }

  const Demands = subScores.D;
  const Control = Math.round((subScores.DA + subScores.SD) / 2);
  const Support = Math.round((subScores.SS + subScores.SC) / 2);

  const demandHigh = Demands >= 60;
  const controlHigh = Control >= 60;
  let quadrant;
  if (demandHigh && controlHigh) quadrant = "active";
  else if (demandHigh && !controlHigh) quadrant = "highStrain";
  else if (!demandHigh && !controlHigh) quadrant = "passive";
  else quadrant = "lowStrain";

  return { subScores, dimScores: { D: Demands, C: Control, S: Support }, quadrant };
}

function buildKarasekLLMPrompt({ lang, answersText, scores }) {
  const language = lang === "fr" ? "French" : "English";
  const { dimScores, subScores, quadrant } = scores;

  const summary = {
    dimensions: { Demands: dimScores.D, Control: dimScores.C, Support: dimScores.S },
    subscales: {
      DecisionAuthority: subScores.DA,
      SkillDiscretion: subScores.SD,
      SupervisorSupport: subScores.SS,
      CoworkerSupport: subScores.SC,
      DemandsRaw: subScores.D,
    },
    quadrant,
  };

  return `
You are an organizational psychology expert. A client completed the Karasek Demand–Control–Support questionnaire (4-point Likert).
Write a clear, non-clinical, professional report in ${language}. Keep it under ~450 words.

DATA (0–100 normalized):
${JSON.stringify(summary, null, 2)}

RAW ANSWERS (1–4):
${answersText}

Sections: Title; short overview; Demands/Control/Support insights; Quadrant interpretation; Subscales (DA, SD, SS, SC); Strengths; Watch-outs; Practical suggestions. Avoid medical language. No markdown headings.
`.trim();
}

/* ---------- UI atoms ---------- */
function LikertRow({ q, value, onChange, lang }) {
  const labels = i18n[lang].scale4;
  return (
    <div className="b5-card">
      <div className="b5-card-title">{lang === "fr" ? q.fr : q.en}</div>
      <div className="b5-card-sub">{lang === "fr" ? q.en : q.fr}</div>
      <div className="b5-likert">
        {LIKERT.map((n, idx) => (
          <label key={idx} className={`b5-likert-option ${value === n ? "is-selected" : ""}`}>
            <input
              type="radio"
              name={`q-${q.id}`}
              checked={value === n}
              onChange={() => onChange(n)}
            />
            <span>{labels[idx]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ReportPanel({ scores, lang }) {
  const t = i18n[lang];
  const D = scores.dimScores.D ?? 0;
  const C = scores.dimScores.C ?? 0;
  const S = scores.dimScores.S ?? 0;
  const qLabel = t.quadrant[scores.quadrant];

  const band = (v, hi, lo, mid) => (v >= 60 ? hi : v <= 40 ? lo : mid);

  return (
    <div className="b5-card" style={{ marginBottom: 16 }}>
      <div className="b5-card-title">{t.resultTitle} — {qLabel}</div>
      <div className="b5-card-sub">
        {lang === "fr" ? "Synthèse narrative basée sur vos réponses." : "Narrative summary based on your responses."}
      </div>

      <div className="b5-report">
        <h3>{t.overview}</h3>
        <ul className="b5-report-list">
          <li>{t.dims.D}: <strong>{D}</strong>/100 — {band(D, lang==="fr"?"élevées":"high", lang==="fr"?"faibles":"low", lang==="fr"?"modérées":"moderate")}</li>
          <li>{t.dims.C}: <strong>{C}</strong>/100 — {band(C, lang==="fr"?"élevé":"high",  lang==="fr"?"faible":"low",  lang==="fr"?"modéré":"moderate")}</li>
          <li>{t.dims.S}: <strong>{S}</strong>/100 — {band(S, lang==="fr"?"bon":"good",   lang==="fr"?"à renforcer":"needs improvement", lang==="fr"?"moyen":"average")}</li>
        </ul>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function KarasekTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment"); // /karasek?assignment=ID

  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // state
  const [lang, setLang] = useState("fr");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");
  const [aiError, setAiError] = useState("");

  // derived
  const perPage = 4;
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  const currentPage = Math.min(step, totalPages);
  const percent = Math.round((Math.min(QUESTIONS.length, Object.keys(answers).length) / QUESTIONS.length) * 100);
  const pageQuestions = QUESTIONS.slice((currentPage - 1) * perPage, currentPage * perPage);
  const canNext = pageQuestions.every((q) => !!answers[q.id]);
  const scores = useMemo(() => computeScores(answers), [answers]);

  // Check assignment belongs to user
  useEffect(() => {
    if (!assignmentId) return;
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: { ...authHeader } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() => {
        alert("Invalid or inaccessible assignment. Please start from My Assessments.");
        navigate("/my-assessments");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  // ---- AI (client-side) ----
  async function generateAIReport() {
    setAiLoading(true);
    setAiError("");
    setAiReport("");

    try {
      const res = await fetch(`${API_BASE}/api/karasek/report/${assignmentId}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${access}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Report generation failed");
      setAiReport(data.report || "");
      return data.report;
    } catch (err) {
      setAiError(err.message || "Request failed");
      return "";
    } finally {
      setAiLoading(false);
    }
  }


  // ---- Submit: generate AI + send everything to backend ----
  async function submitToBackend() {
    if (!assignmentId) {
      alert("Missing assignment id. Open this test from My Assessments.");
      return;
    }
    try {
      // 1) compute metrics locally
      const m = computeScores(answers);
      const metrics = { dimScores: m.dimScores, subScores: m.subScores, quadrant: m.quadrant };

      // 2) (optional) generate AI report in the browser
      const reportText = await generateAIReport(); // returns "" if failed/missing key

      // 3) save to backend
      const r = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics, ai_report: reportText, overwrite: true }),
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

  // ---- PDF upload to backend after user downloads ----
  async function uploadPDF(blob) {
    if (!assignmentId || !blob) return;
    const fd = new FormData();
    fd.append("file", blob, `karasek-${assignmentId}.pdf`);
    await fetch(`${API_BASE}/api/assessments/${assignmentId}/upload-pdf/`, {
      method: "PUT",
      headers: { ...authHeader }, // don't set Content-Type with FormData
      body: fd,
    }).catch(() => {});
  }

  if (!assignmentId) {
    return (
      <div className="b5-page" style={{ padding: 16 }}>
        <h2>Karasek</h2>
        <p>Please start this test from <b>My Assessments</b> so it’s linked to your assignment.</p>
      </div>
    );
  }

  const overviewData = [
    { name: i18n[lang].dims.D, value: scores.dimScores.D || 0 },
    { name: i18n[lang].dims.C, value: scores.dimScores.C || 0 },
    { name: i18n[lang].dims.S, value: scores.dimScores.S || 0 },
  ];

  const subMap = [
    { key: "DA", label: i18n[lang].subs.DA },
    { key: "SD", label: i18n[lang].subs.SD },
    { key: "SS", label: i18n[lang].subs.SS },
    { key: "SC", label: i18n[lang].subs.SC },
  ];
  const subData = subMap.map(({ key, label }) => ({ name: label, value: scores.subScores[key] || 0 }));

  return (
    <div className="b5-page">
      {/* Top Bar */}
      <div className="b5-topbar">
        <div>
          <h1 className="b5-title">{i18n[lang].appTitle}</h1>
          <div className="b5-progress-label">{i18n[lang].progress}</div>
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

      {/* Content */}
      <div className="b5-container">
        {step === 0 && (
          <div className="b5-intro">
            <h2>{i18n[lang].appTitle}</h2>
            <p>
              {lang === "fr"
                ? "Répondez à 27 affirmations (4 points : Pas du tout d'accord → Tout à fait d'accord). Le modèle Karasek évalue Demandes, Contrôle et Soutien social. Les résultats incluent une classification en quadrant (Faible contrainte / Forte contrainte / Actif / Passif)."
                : "Answer 27 statements (4-point scale: Strongly Disagree → Strongly Agree). Karasek model assesses Demands, Control and Social Support. Results include a quadrant classification (Low strain / High strain / Active / Passive)."}
            </p>
            <div className="b5-alert">
              <AlertTriangle size={16} />
              <span style={{ marginLeft: 8 }}>
                {lang === "fr" ? "Outil indicatif non clinique." : "Indicative, non-clinical tool."}
              </span>
            </div>
            <button className="b5-btn primary" onClick={() => setStep(1)}>
              {i18n[lang].start}
            </button>
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
                <ArrowLeft size={18} /> {i18n[lang].back}
              </button>

              {step < totalPages ? (
                <button
                  className="b5-btn primary"
                  onClick={() => canNext && setStep((s) => Math.min(totalPages, s + 1))}
                  disabled={!canNext}
                >
                  {i18n[lang].next} <ArrowRight size={18} />
                </button>
              ) : (
                <button className="b5-btn primary" onClick={submitToBackend} disabled={!canNext}>
                  {i18n[lang].submit}
                </button>
              )}
            </div>
          </div>
        )}

        {step > totalPages && (
          <div id="results-root">
            <div className="b5-results-head">
              <h2>{i18n[lang].resultTitle}</h2>
              <div className="b5-results-actions">
                <button
                  className="b5-btn outline"
                  onClick={async () => {
                    const blob = await downloadResultsAsPDF();
                    // Save a copy server-side
                    await uploadPDF(blob);
                  }}
                >
                  <Download size={18} /> {i18n[lang].download}
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
                  <RotateCcw size={18} /> {i18n[lang].restart}
                </button>
              </div>
            </div>

            {/* AI Report */}
            {aiLoading && (
              <div className="b5-card"><div className="b5-card-title">AI</div><div className="b5-report">…</div></div>
            )}
            {aiError && (
              <div className="b5-card"><div className="b5-card-title">AI error</div><div className="b5-report">{aiError}</div></div>
            )}
            {aiReport && (
              <div className="b5-card" style={{ marginBottom: 16 }}>
                <div className="b5-card-title">{lang === "fr" ? "Rapport IA — Karasek" : "AI Report — Karasek"}</div>
                <div className="b5-report">
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6 }}>
                    {aiReport}
                  </pre>
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="b5-card">
              <div className="b5-card-title">{i18n[lang].overview}</div>
              <div className="b5-card-sub">{i18n[lang].dims.D}, {i18n[lang].dims.C}, {i18n[lang].dims.S}</div>
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

            {/* Subscales */}
            <div className="b5-card">
              <div className="b5-card-title">
                {lang === "fr" ? "Sous-dimensions du Contrôle & du Soutien" : "Control & Support Subscales"}
              </div>
              <div className="b5-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-10} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" name="Score" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Server-stored metrics summary (quick read) */}
            <ReportPanel scores={scores} lang={lang} />
          </div>
        )}
      </div>

      <div className="b5-footer">© {new Date().getFullYear()} • DeepMind</div>
    </div>
  );
}
