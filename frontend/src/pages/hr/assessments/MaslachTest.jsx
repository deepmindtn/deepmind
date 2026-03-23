import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import StructuredReport from "./StructuredReport";
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  Download,
  RotateCcw,
  Send,
  Loader2,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

/** Likert 0..6 (frequency scale) */
const LIKERT = [0, 1, 2, 3, 4, 5, 6];

// Theme Colors mapped from CSS Variables
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  shadowMd: "var(--shadow-md)",
  red: "#ef4444",
  yellow: "#eab308",
  green: "#22c55e",
};

const i18n = {
  fr: {
    appTitle: "Test Burnout (Maslach)",
    subtitle: "Évaluation du bien-être au travail",
    start: "Commencer le test",
    next: "Suivant",
    back: "Précédent",
    submit: "Voir mes résultats",
    analyze: "Analyse...",
    restart: "Recommencer",
    download: "Télécharger",
    progress: "Progression",
    resultTitle: "Résultats Burnout",
    overview: "Profil de bien-être",
    dims: { EE: "Épuisement émotionnel", DP: "Dépersonnalisation", PA: "Accomplissement personnel" },
    scale: [
      "Jamais (0)","Quelques fois/an (1)","Mensuel (2)","Quelques fois/mois (3)",
      "Hebdomadaire (4)","Quelques fois/semaine (5)","Quotidien (6)",
    ],
    legendHint: "EE & DP élevés = risque accru. PA bas = risque accru.",
    nonClinical: "Outil indicatif, non clinique.",
    aiTitle: "Analyse IA",
    aiSubtitle: "Interprétation personnalisée de votre profil.",
    intro: "Répondez à 22 affirmations sur la fréquence de situations. Trois dimensions : Épuisement émotionnel (EE), Dépersonnalisation (DP), Accomplissement personnel (PA).",
  },
  en: {
    appTitle: "Burnout Assessment",
    subtitle: "Workplace well-being evaluation",
    start: "Start the test",
    next: "Next",
    back: "Back",
    submit: "See my results",
    analyze: "Analyzing...",
    restart: "Retake",
    download: "Download",
    progress: "Progress",
    resultTitle: "Burnout Results",
    overview: "Well-being Profile",
    dims: { EE: "Emotional Exhaustion", DP: "Depersonalization", PA: "Personal Accomplishment" },
    scale: [
      "Never (0)","A few times/year (1)","Monthly (2)","A few times/month (3)",
      "Weekly (4)","A few times/week (5)","Daily (6)",
    ],
    legendHint: "High EE & DP = increased risk. Low PA = increased risk.",
    nonClinical: "Indicative, non-clinical tool.",
    aiTitle: "AI Analysis",
    aiSubtitle: "Personalized interpretation of your profile.",
    intro: "Answer 22 statements on frequency of situations. Three dimensions: Emotional Exhaustion (EE), Depersonalization (DP), Personal Accomplishment (PA).",
  },
};

// -----------------------
// STYLES
// -----------------------
const styles = {
  mainWrapper: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 40px)",
    position: "relative",
  },
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "32px 48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  heroIconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: COLORS.shadowMd,
    marginRight: "20px",
  },
  progressContainer: {
    height: "8px",
    backgroundColor: COLORS.primaryLight,
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressBar: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    backgroundColor: COLORS.primary,
    transition: "width 0.4s ease-in-out",
  }),
  contentBody: {
    flex: 1,
    padding: "40px 48px",
    backgroundColor: COLORS.bgMain,
  },
  questionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "32px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "24px",
    boxShadow: COLORS.shadowMd,
  },
  questionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: "24px",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
    gap: "12px",
  },
  optionLabel: (isSelected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 12px",
    borderRadius: "12px",
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: isSelected ? COLORS.primaryLight : COLORS.cardBg,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  }),
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "32px",
  },
  btn: (variant) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    border: variant === "primary" ? "none" : `1px solid ${COLORS.borderColor}`,
    backgroundColor: variant === "primary" ? COLORS.primary : "transparent",
    color: variant === "primary" ? "#ffffff" : COLORS.textPrimary,
    transition: "all 0.2s",
    opacity: variant === "disabled" ? 0.5 : 1,
    pointerEvents: variant === "disabled" ? "none" : "auto",
    boxShadow: variant === "primary" ? COLORS.shadowMd : "none",
  }),
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
  },
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .option-hover:hover { border-color: var(--primary) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: var(--primary-light); color: var(--primary); border-color: var(--primary); }
  .loading-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

/** 22 items: EE(9), DP(5), PA(8). Sample wording (not MBI text). */
const QUESTIONS = [
  // EE
  { id: 1, sub: "EE", fr: "Je termine ma journée vidé(e) d'énergie.", en: "I finish the day drained of energy." },
  { id: 2, sub: "EE", fr: "Je me sens dépassé(e) par la charge émotionnelle du travail.", en: "I feel overwhelmed by the emotional load of my work." },
  { id: 3, sub: "EE", fr: "J'ai du mal à récupérer entre deux journées de travail.", en: "I struggle to recover between workdays." },
  { id: 4, sub: "EE", fr: "Je me sens épuisé(e) quand je pense au travail.", en: "I feel exhausted when I think about work." },
  { id: 5, sub: "EE", fr: "Il m'est difficile de soutenir le rythme sur la semaine.", en: "It's hard to sustain the pace through the week." },
  { id: 6, sub: "EE", fr: "Je manque d'énergie pour mes tâches habituelles.", en: "I lack energy for my usual tasks." },
  { id: 7, sub: "EE", fr: "Je me lève fatigué(e) à l'idée du travail.", en: "I wake up feeling tired at the thought of work." },
  { id: 8, sub: "EE", fr: "Je me sens émotionnellement à bout au travail.", en: "I feel emotionally spent at work." },
  { id: 9, sub: "EE", fr: "Je ressens une fatigue persistante liée au travail.", en: "I feel a lingering work-related fatigue." },
  // DP
  { id:10, sub: "DP", fr: "Je deviens plus détaché(e) envers les personnes avec qui je travaille.", en: "I find myself more detached from the people I work with." },
  { id:11, sub: "DP", fr: "J'adopte parfois un ton cynique face aux demandes des autres.", en: "I sometimes take a cynical tone toward others' requests." },
  { id:12, sub: "DP", fr: "Je me surprends à traiter les situations avec froideur.", en: "I catch myself handling situations more coldly." },
  { id:13, sub: "DP", fr: "Je me sens indifférent(e) aux problèmes des autres au travail.", en: "I feel indifferent to others' problems at work." },
  { id:14, sub: "DP", fr: "Je garde mes distances émotionnelles pour \"tenir\".", en: "I keep emotional distance in order to get by." },
  // PA
  { id:15, sub: "PA", fr: "Je sens que mon travail aide vraiment les autres.", en: "I feel my work genuinely helps others." },
  { id:16, sub: "PA", fr: "Je me sens compétent(e) face aux défis du travail.", en: "I feel competent when facing work challenges." },
  { id:17, sub: "PA", fr: "Je suis fier/fière de ce que j'accomplis au travail.", en: "I'm proud of what I accomplish at work." },
  { id:18, sub: "PA", fr: "Je me sens efficace et utile dans mon rôle.", en: "I feel effective and useful in my role." },
  { id:19, sub: "PA", fr: "Je vois clairement l'impact positif de mon travail.", en: "I clearly see the positive impact of my work." },
  { id:20, sub: "PA", fr: "Je progresse et j'apprends dans mon activité.", en: "I'm growing and learning in my job." },
  { id:21, sub: "PA", fr: "Je trouve du sens dans mes responsabilités.", en: "I find meaning in my responsibilities." },
  { id:22, sub: "PA", fr: "Je me sens capable d'atteindre des objectifs exigeants.", en: "I feel capable of achieving demanding goals." },
];

// Scoring functions
function normalizeTo100(value, min, max) {
  if (max === min) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
}

function computeScores(answers) {
  const sums = { EE: 0, DP: 0, PA: 0 };
  const counts = { EE: 0, DP: 0, PA: 0 };
  for (const q of QUESTIONS) {
    const raw = answers[q.id];
    if (raw === undefined || raw === null) continue;
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
    PA: subScores.PA <= 40 ? "low" : subScores.PA >= 60 ? "high" : "moderate",
  };
  return { subScores, raw: sums, labels, counts };
}

// -----------------------
// 3. MAIN COMPONENT
// -----------------------
export default function MaslachTest() {
  const [params] = useSearchParams();
  const assignmentId = params.get("assignment");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [lang, setLang] = useState("fr");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const perPage = 5;
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  const percent = Math.round((Math.min(QUESTIONS.length, Object.keys(answers).length) / QUESTIONS.length) * 100);
  const pageQuestions = QUESTIONS.slice((step - 1) * perPage, step * perPage);
  const canNext = pageQuestions.every((q) => answers[q.id] !== undefined);
  const scores = useMemo(() => computeScores(answers), [answers]);
  const t = i18n[lang];

  // Verify assignment and restore results if already completed
  useEffect(() => {
    if (!assignmentId) {
      setFetching(false);
      return;
    }
    fetch(`${API_BASE}/api/assessments/${assignmentId}/`, { headers: { ...authHeader } })
      .then((r) => {
        if (!r.ok) throw new Error("Invalid assignment");
        return r.json();
      })
      .then((data) => {
        if (data && data.status === 'COMPLETED') {
          if (data.answers) setAnswers(data.answers);
          if (data.ai_report) {
            try { setAiReport(JSON.parse(data.ai_report)); }
            catch { setAiReport(data.ai_report); }
          }
          setStep(totalPages + 1);
        }
      })
      .catch((err) => {
        console.error("Error fetching assignment:", err);
      })
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  // Submit logic with loading state
  async function submitAnswers() {
    if (Object.keys(answers).length !== QUESTIONS.length) {
      alert(lang === "fr" ? "Veuillez répondre à toutes les questions." : "Please answer all questions.");
      return;
    }
    setLoading(true);

    try {
      // Generate AI report
      const reportRes = await fetch(`${API_BASE}/api/maslach/report/${assignmentId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ answers, metrics: scores.subScores }),
      });

      if (!reportRes.ok) {
        const err = await reportRes.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to generate report");
      }

      const reportData = await reportRes.json();
      const reportObj = reportData.report || null;

      // Submit to assignment
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          answers,
          metrics: scores.subScores,
          ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : (reportObj || ""),
          overwrite: true,
        }),
      });

      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to submit");
      }

      setAiReport(reportObj);
      setStep(totalPages + 1);
    } catch (err) {
      console.error(err);
      alert("Erreur: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div style={{ ...styles.mainWrapper, alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="loading-spin" size={40} color={COLORS.primary} />
        <p style={{ marginTop: 16, color: COLORS.textSecondary }}>
          {lang === "fr" ? "Chargement..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (!assignmentId) {
    return (
      <div style={styles.mainWrapper}>
        <div style={styles.heroSection}>
          <div style={styles.headerRow}>
            <h1 style={{ fontSize: "24px", fontWeight: "800", color: COLORS.textPrimary, margin: 0 }}>
              {lang === "fr" ? "Test Burnout" : "Burnout Test"}
            </h1>
          </div>
        </div>
        <div style={styles.contentBody}>
          <p style={{ color: COLORS.textSecondary }}>
            {lang === "fr"
              ? "Veuillez démarrer ce test depuis Mes Évaluations."
              : "Please start this test from My Assessments."}
          </p>
        </div>
      </div>
    );
  }

  const overviewData = [
    { name: t.dims.EE, value: scores.subScores.EE || 0, fill: COLORS.red },
    { name: t.dims.DP, value: scores.subScores.DP || 0, fill: COLORS.yellow },
    { name: t.dims.PA, value: scores.subScores.PA || 0, fill: COLORS.green },
  ];

  return (
    <div style={styles.mainWrapper}>
      <style>{animationStyles}</style>

      {/* --- HERO SECTION --- */}
      <div style={styles.heroSection}>
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.heroIconBox}>
              <Heart size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: 0 }}>
                {t.appTitle}
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                {t.subtitle}
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <select
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.borderColor}`,
                backgroundColor: COLORS.cardBg,
                color: COLORS.textPrimary,
                fontSize: "14px",
                cursor: "pointer",
              }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(step === 0 ? 0 : percent)} />
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div style={styles.contentBody}>

        {/* STEP 0: INTRO */}
        {step === 0 && (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "60px 40px" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <div style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "20px", 
                backgroundColor: COLORS.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 32px",
                boxShadow: COLORS.shadowMd,
              }}>
                <Heart size={40} color={COLORS.primary} />
              </div>
              
              <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "16px", color: COLORS.textPrimary }}>
                {t.appTitle}
              </h2>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, lineHeight: "1.6", marginBottom: "32px" }}>
                {t.intro}
              </p>
              
              <div style={{
                backgroundColor: COLORS.primaryLight,
                padding: "16px",
                borderRadius: "12px",
                display: "flex",
                gap: "12px",
                marginBottom: "32px",
                color: COLORS.primary,
              }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "14px" }}>{t.nonClinical}</span>
              </div>
              
              <button 
                style={styles.btn("primary")}
                className="btn-hover"
                onClick={() => setStep(1)}
              >
                {t.start} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP > 0: QUESTIONS */}
        {step > 0 && step <= totalPages && (
          <div className="animate-fade-in">
            {pageQuestions.map((q) => (
              <div key={q.id} style={styles.questionCard}>
                <div style={{ ...styles.questionTitle, display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ color: COLORS.primary, opacity: 0.8, flexShrink: 0 }}>Q{q.id}.</span>
                  <span>{q[lang]}</span>
                </div>
                
                <div style={styles.optionGrid}>
                  {LIKERT.map((n, idx) => {
                    const isSelected = answers[q.id] === n;
                    const label = t.scale[idx];
                    return (
                      <label 
                        key={n}
                        style={styles.optionLabel(isSelected)}
                        className="option-hover"
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          style={{ display: "none" }}
                          checked={isSelected}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                        />
                        <div style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: isSelected ? COLORS.primary : COLORS.textMuted,
                          marginBottom: "4px",
                        }}>
                          {n}
                        </div>
                        <span style={{
                          fontSize: "11px",
                          color: isSelected ? COLORS.primary : COLORS.textSecondary,
                          fontWeight: isSelected ? "600" : "400",
                          lineHeight: "1.2",
                        }}>
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* NAVIGATION FOOTER */}
            <div style={styles.navBar}>
              <button
                style={styles.btn(step === 1 ? "disabled" : "ghost")}
                className="btn-ghost"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                <ChevronLeft size={18} /> {t.back}
              </button>

              {step < totalPages ? (
                <button
                  style={styles.btn(canNext ? "primary" : "disabled")}
                  className={canNext ? "btn-hover" : ""}
                  onClick={() => canNext && setStep((s) => s + 1)}
                  disabled={!canNext}
                >
                  {t.next} <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  style={styles.btn(loading || Object.keys(answers).length !== QUESTIONS.length ? "disabled" : "primary")}
                  className={!loading && Object.keys(answers).length === QUESTIONS.length ? "btn-hover" : ""}
                  onClick={submitAnswers}
                  disabled={loading || Object.keys(answers).length !== QUESTIONS.length}
                >
                  {loading ? (
                    <>
                      <Loader2 className="loading-spin" size={18} /> {t.analyze}
                    </>
                  ) : (
                    <>
                      {t.submit} <Send size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP END: RESULTS */}
        {step > totalPages && (
          <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
            <div style={styles.headerRow}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", color: COLORS.textPrimary }}>
                {t.resultTitle}
              </h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={styles.btn("ghost")} className="btn-ghost" onClick={() => {
                  setAnswers({});
                  setStep(1);
                  setAiReport(null);
                }}>
                  <RotateCcw size={16} /> {t.restart}
                </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              
              {/* LEFT: CHART */}
              <div style={styles.questionCard}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <TrendingUp size={20} color={COLORS.primary} />
                  <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: COLORS.textPrimary }}>
                    {t.overview}
                  </h3>
                </div>
                
                <div style={{ minHeight: "320px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart 
                      data={overviewData} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.borderColor} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 13, fill: COLORS.textSecondary }} />
                      <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{
                          backgroundColor: COLORS.cardBg,
                          borderColor: COLORS.borderColor,
                          color: COLORS.textPrimary,
                          borderRadius: "8px",
                          boxShadow: COLORS.shadowMd,
                        }}
                        formatter={(value) => `${value}%`}
                      />
                      <Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0]}>
                        {overviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginTop: "16px", padding: "12px", backgroundColor: COLORS.primaryLight, borderRadius: "8px" }}>
                  <p style={{ fontSize: "13px", color: COLORS.textSecondary, margin: 0, lineHeight: "1.5" }}>
                    {t.legendHint}
                  </p>
                </div>
              </div>

              {/* RIGHT: AI REPORT */}
              {aiReport && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{
                    backgroundColor: COLORS.primaryLight,
                    padding: "16px",
                    borderRadius: "12px",
                    display: "flex",
                    gap: "12px",
                    color: COLORS.primary,
                  }}>
                    <AlertCircle size={24} style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: "block", marginBottom: "4px" }}>{t.aiTitle}</strong>
                      <span style={{ fontSize: "14px" }}>{t.aiSubtitle}</span>
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: COLORS.cardBg,
                    borderRadius: "16px",
                    border: `1px solid ${COLORS.borderColor}`,
                    padding: "24px",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6",
                    color: COLORS.textSecondary,
                    fontSize: "15px",
                    maxHeight: "500px",
                    overflowY: "auto",
                    boxShadow: COLORS.shadowMd,
                  }}>
                    <StructuredReport report={aiReport} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      <div style={{
        padding: "20px 48px",
        textAlign: "center",
        borderTop: `1px solid ${COLORS.borderColor}`,
        backgroundColor: COLORS.cardBg,
        color: COLORS.textMuted,
        fontSize: "13px",
      }}>
        © {new Date().getFullYear()} • DeepMind
      </div>
    </div>
  );
}
