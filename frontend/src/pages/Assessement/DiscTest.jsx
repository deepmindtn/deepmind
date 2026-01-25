import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  BrainCircuit,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Download,
  RotateCcw,
  Send,
  Loader2,
  Activity,
  User,
  Info,
} from "lucide-react";

// -----------------------
// 1. DATA & CONSTANTS
// -----------------------
const QUESTIONS = [
  { id: 1, q: "Concernant votre poignée de main :", opts: { a: "Elle est ferme et plutôt appuyée.", b: "Elle est rapide et plutôt chaleureuse.", c: "Elle est moyennement forte.", d: "Elle est discrète et vous n'aimez pas forcément serrer la main." }},
  { id: 2, q: "Dans votre quotidien vous aimez :", opts: { a: "Relever les challenges et être tourné vers l'action.", b: "Être compréhensif et éviter les conflits.", c: "Divertir et prendre plaisir avec les gens.", d: "Être prudent, réfléchi et ne pas donner votre confiance facilement." }},
  { id: 3, q: "Quand vous vous exprimez, vous parlez plutôt :", opts: { a: "Fort pour impacter et se faire entendre.", b: "Faible volume, lentement, discret.", c: "Variations vocales, rythme rapide.", d: "Volume modéré, calme, monocorde." }},
  { id: 4, q: "C'est samedi, qu'avez-vous prévu :", opts: { a: "Partir à l'aventure sans me préoccuper des autres.", b: "Organiser un barbecue avec des amis.", c: "Ranger et mettre de l'ordre dans mes affaires.", d: "Aider une association locale et prendre mon temps." }},
  { id: 5, q: "Quand vous échangez avec les autres :", opts: { a: "Vous parlez plus que vous n'écoutez, affirmatif.", b: "Grande capacité d'écoute, signe de respect.", c: "Adore prendre part à une conversation.", d: "Préférence pour les emails, exprime rarement ses sentiments." }},
  { id: 6, q: "Concernant le regard :", opts: { a: "Regard soutenu, évalue l'interlocuteur.", b: "Regard amical et chaleureux.", c: "Détourne facilement le regard.", d: "Évite le regard, contact rare." }},
  { id: 7, q: "Quelles sont les qualités que vous aimez :", opts: { a: "Détermination, affronter les challenges.", b: "Sens de l'humour, enthousiasme.", c: "Précision, excellence, respect des règles.", d: "Empathie, compréhension des autres." }},
  { id: 8, q: "Vos principales peurs :", opts: { a: "Qu'on profite de vous.", b: "Changements soudains, instabilité.", c: "Critique sur votre travail.", d: "Être ignoré, délaissé." }},
  { id: 9, q: "Dans une réunion vous êtes celui qui :", opts: { a: "Propose de nouvelles idées, de bonne humeur.", b: "Décide et impose ses idées.", c: "Suit scrupuleusement les procédures.", d: "Veille à la cohésion du groupe." }},
  { id: 10, q: "Au travail vous êtes :", opts: { a: "Formel, rationnel, structuré et concret.", b: "Attentionné, pratique et altruiste.", c: "Interactif, social et amical.", d: "Efficace, rapide, occupé." }},
  { id: 11, q: "Parmi les métiers suivants, lequel choisirez-vous :", opts: { a: "Avocat, comptable, informaticien.", b: "Thérapeute, infirmier ou coach.", c: "Sportif, entrepreneur, cadre dirigeant.", d: "Cadre commercial, publiciste, journaliste." }},
  { id: 12, q: "Concernant votre mode de réflexion :", opts: { a: "Réfléchit à voix haute, exprime ses ressentis.", b: "Décide vite, va à l'essentiel.", c: "Réflexion lente et profonde.", d: "Analyse en détail, parfois paralysé pour décider." }},
  { id: 13, q: "Au niveau de votre espace personnel :", opts: { a: "Gardez vos distances, même avec proches.", b: "Occupez l’espace, pénétrez l’espace privé.", c: "À l’aise uniquement après relation profonde.", d: "Tactile très rapidement, parfois trop." }},
  { id: 14, q: "La structure de vos emails :", opts: { a: "Courts, directs, sans salutations.", b: "Moyens avec smileys et anecdotes.", c: "Très longs, complets, pièces jointes.", d: "Longs, personnels, avec politesse." }},
  { id: 15, q: "Quand vous donnez votre opinion :", opts: { a: "Direct, sans filtres.", b: "Spontané, parfois trop.", c: "Réfléchi, factuel.", d: "Attention à ne pas froisser." }},
];

const OPTIONS = { a: "D", b: "I", c: "C", d: "S" };
const LABELS = { D: "Dominance", I: "Influence", S: "Stabilité", C: "Conformité" };

// Colors for the Chart
const CHART_COLORS = { D: "#ef4444", I: "#eab308", S: "#10b981", C: "#3b82f6" };

const COLORS = {
  primary: "#4f46e5",
  success: "#10b981",
  bgMain: "var(--bg-main, #f8fafc)",
  cardBg: "var(--card-bg, #ffffff)",
  textPrimary: "var(--text-primary, #1e293b)",
  textSecondary: "var(--text-secondary, #64748b)",
  borderColor: "var(--border-color, #e2e8f0)",
  shadowHuge: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

// -----------------------
// 2. STYLES (CSS-in-JS)
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
  },
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primary}1A 0%, ${COLORS.cardBg} 100%)`,
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
    boxShadow: `0 8px 16px -4px ${COLORS.primary}60`,
    marginRight: "20px",
  },
  progressContainer: {
    height: "8px",
    backgroundColor: `${COLORS.primary}20`,
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
  // Cards
  questionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "32px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "24px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  questionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: "24px",
    display: "flex",
    gap: "12px",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
  },
  optionLabel: (isSelected) => ({
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    borderRadius: "12px",
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
    backgroundColor: isSelected ? `${COLORS.primary}08` : COLORS.cardBg,
    cursor: "pointer",
    transition: "all 0.2s ease",
    position: "relative",
  }),
  // Buttons
  navBar: {
    display: "flex",
    justifyContent: "space-between",
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
    color: variant === "primary" ? "#fff" : COLORS.textPrimary,
    transition: "all 0.2s",
    opacity: variant === "disabled" ? 0.5 : 1,
    pointerEvents: variant === "disabled" ? "none" : "auto",
  }),
  // Results
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "24px",
  },
  aiReportBox: {
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
  },
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .option-hover:hover { border-color: ${COLORS.primary}80; transform: translateY(-2px); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: ${COLORS.primary}10; color: ${COLORS.primary}; border-color: ${COLORS.primary}; }
  .loading-spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

function computeScores(answers) {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  Object.entries(answers).forEach(([qid, ans]) => {
    if (OPTIONS[ans]) scores[OPTIONS[ans]] += 1;
  });
  return scores;
}

// -----------------------
// 3. MAIN COMPONENT
// -----------------------
export default function DiscTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const API_BASE = "http://localhost:8080";
  
  // 1. Logic: Determine User Type
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");

  // 2. Logic: Fetch Config
  const getFetchConfig = () => {
    if (isCandidate) {
      return {
        url: `${API_BASE}/api/assessments/candidate/${candidateToken}/`,
        headers: {
          "Content-Type": "application/json",
          "X-Candidate-Token": candidateToken
        }
      };
    } else {
      return {
        url: `${API_BASE}/api/assessments/${assignmentId}/`,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${hrToken}`
        }
      };
    }
  };

  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [aiReport, setAiReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const questionsPerPage = 3;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);
  
  // 3. Logic: Load Assessment
  useEffect(() => {
    const config = getFetchConfig();
    
    if ((isCandidate && !candidateToken) || (!isCandidate && !assignmentId)) {
       console.warn("❌ Missing credentials or ID");
       setFetching(false);
       return;
    }

    fetch(config.url, { headers: config.headers })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok) {
           if(r.status === 401) throw new Error("Unauthorized: Invalid Token");
           throw new Error(data?.detail || "Fetch failed");
        }
        return data;
      })
      .catch((err) => {
        console.error("❌ Assessment fetch error:", err);
      })
      .finally(() => setFetching(false));
  }, [assignmentId, candidateToken, isCandidate]);

  const pageQuestions = QUESTIONS.slice(
    (step - 1) * questionsPerPage,
    step * questionsPerPage
  );

  const canNext = step < totalPages && pageQuestions.every((q) => !!answers[q.id]);
  const progressPct = (Object.keys(answers).length / QUESTIONS.length) * 100;

  // 4. Logic: Submit
  async function submit() {
    if (Object.keys(answers).length !== 15) {
      alert("Veuillez répondre à toutes les questions.");
      return;
    }
    setLoading(true);
    const config = getFetchConfig(); 

    try {
      const metrics = computeScores(answers);

      // A) AI Report
      const reportRes = await fetch(`${API_BASE}/api/disc/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers, 
        body: JSON.stringify({ answers, metrics }),
      });
      const reportData = await reportRes.json();
      const reportText = reportData.report || "";

      // B) Submit
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics, ai_report: reportText, overwrite: true }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.error || "Erreur lors du submit.");

      setAiReport(reportText);
      setStep(totalPages + 1);
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const metrics = useMemo(() => computeScores(answers), [answers]);
  const overviewData = Object.entries(metrics).map(([k, v]) => ({
    name: LABELS[k],
    key: k,
    value: v,
  }));

  function downloadReport() {
    const blob = new Blob([aiReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disc-report-${assignmentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (fetching) {
    return (
      <div style={{ ...styles.mainWrapper, alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="loading-spin" size={40} color={COLORS.primary} />
        <p style={{ marginTop: 16, color: COLORS.textSecondary }}>Chargement de l'évaluation...</p>
      </div>
    );
  }

  return (
    <div style={styles.mainWrapper}>
      <style>{animationStyles}</style>

      {/* --- HERO SECTION --- */}
      <div style={styles.heroSection}>
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.heroIconBox}>
              <Activity size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: 0 }}>
                Test DISC
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                Profil comportemental & Communication
              </p>
            </div>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: COLORS.primary }}>
               {Math.round(progressPct)}% Complété
            </span>
          </div>
        </div>
        
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(progressPct)} />
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div style={styles.contentBody}>
        
        {/* STEP 0: INTRO */}
        {step === 0 && (
          <div className="animate-fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px", color: COLORS.textPrimary }}>
                Bienvenue
              </h2>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, lineHeight: "1.6", marginBottom: "32px" }}>
                Ce test comporte 15 questions rapides pour analyser votre profil comportemental dominant.
                Répondez spontanément, il n'y a pas de bonne ou de mauvaise réponse.
              </p>
              
              <button 
                style={styles.btn("primary")} 
                className="btn-hover"
                onClick={() => setStep(1)}
              >
                Commencer l'évaluation <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP > 0: QUESTIONS */}
        {step > 0 && step <= totalPages && (
          <div className="animate-fade-in">
            {pageQuestions.map((q) => (
              <div key={q.id} style={styles.questionCard}>
                <div style={styles.questionTitle}>
                  <span style={{ color: COLORS.primary, opacity: 0.8 }}>Q{q.id}.</span>
                  {q.q}
                </div>
                
                <div style={styles.optionGrid}>
                  {Object.entries(q.opts).map(([optKey, label]) => {
                    const isSelected = answers[q.id] === optKey;
                    return (
                      <label 
                        key={optKey} 
                        style={styles.optionLabel(isSelected)}
                        className="option-hover"
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          style={{ display: "none" }}
                          checked={isSelected}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: optKey }))}
                        />
                        <div style={{ 
                          width: "24px", 
                          height: "24px", 
                          borderRadius: "50%", 
                          border: `2px solid ${isSelected ? COLORS.primary : COLORS.borderColor}`,
                          marginRight: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          {isSelected && <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: COLORS.primary }} />}
                        </div>
                        <span style={{ fontSize: "15px", color: isSelected ? COLORS.primary : COLORS.textPrimary, fontWeight: isSelected ? "600" : "400" }}>
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
              >
                <ChevronLeft size={18} /> Précédent
              </button>

              {step < totalPages ? (
                <button
                  style={styles.btn(canNext ? "primary" : "disabled")}
                  className={canNext ? "btn-hover" : ""}
                  onClick={() => canNext && setStep((s) => s + 1)}
                >
                  Suivant <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  style={styles.btn(loading ? "disabled" : "primary")}
                  className={!loading ? "btn-hover" : ""}
                  onClick={submit}
                >
                  {loading ? (
                    <>
                      <Loader2 className="loading-spin" size={18} /> Analyse en cours...
                    </>
                  ) : (
                    <>
                      Envoyer mes réponses <Send size={18} />
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
                Vos Résultats
              </h2>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={styles.btn("ghost")} className="btn-ghost" onClick={() => {
                   setAnswers({});
                   setStep(1);
                   setAiReport("");
                }}>
                  <RotateCcw size={16} /> Recommencer
                </button>
                <button style={styles.btn("primary")} className="btn-hover" onClick={downloadReport}>
                  <Download size={16} /> Télécharger le rapport
                </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              
              {/* LEFT: CHART */}
              <div style={{ 
                ...styles.questionCard, 
                marginBottom: 0, 
                display: "flex", 
                flexDirection: "column"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                   <Activity size={20} color={COLORS.primary} />
                   <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Répartition du Profil</h3>
                </div>
                
                <div style={{ flex: 1, minHeight: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: COLORS.textSecondary }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: COLORS.textSecondary }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                        {overviewData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.key]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RIGHT: AI REPORT */}
              {aiReport && (
                 <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ 
                      backgroundColor: `${COLORS.primary}10`, 
                      padding: "16px", 
                      borderRadius: "12px", 
                      display: "flex", 
                      gap: "12px",
                      color: COLORS.primary 
                    }}>
                      <BrainCircuit size={24} />
                      <div>
                        <strong style={{ display: "block", marginBottom: "4px" }}>Analyse IA Générée</strong>
                        <span style={{ fontSize: "14px" }}>Basé sur la méthodologie DISC et vos réponses.</span>
                      </div>
                    </div>
                    
                    <div style={styles.aiReportBox}>
                      {aiReport}
                    </div>
                 </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}