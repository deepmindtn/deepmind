import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Trophy,
  Star,
  Check,
  ArrowRight,
  ArrowLeft,
  Download,
  RotateCcw,
  Loader2,
  CheckCircle2,
  FileText,
  Palette
} from "lucide-react";

// -----------------------
// 1. DATA & CONFIG
// -----------------------

const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  success: "#10b981",
  purple: "#8b5cf6", // Creative color
};

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

// -----------------------
// 2. HELPERS
// -----------------------

async function downloadResultsAsPDF(filename) {
  const html2canvasMod = await import("html2canvas");
  const jspdfMod = await import("jspdf");
  const html2canvas = html2canvasMod.default || html2canvasMod;
  const jsPDFClass = jspdfMod.jsPDF || jspdfMod.default;

  const el = document.getElementById("results-root");
  if (!el) return null;

  // Temporarily force white bg for clean capture
  const originalBg = el.style.backgroundColor;
  el.style.backgroundColor = "#ffffff";
  el.style.padding = "20px";

  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  el.style.backgroundColor = originalBg;
  el.style.padding = "";

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDFClass({ unit: "pt", format: "a4", orientation: "portrait" });
  
  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
  return pdf.output("blob");
}

// -----------------------
// 3. STYLES
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
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.purple, // CAQ specific color
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: `0 8px 16px -4px rgba(139, 92, 246, 0.3)`, 
    marginRight: "20px",
  },
  progressContainer: {
    height: "8px",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "8px",
  },
  progressBar: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    backgroundColor: COLORS.purple,
    transition: "width 0.4s ease-in-out",
  }),
  contentBody: {
    flex: 1,
    padding: "40px 48px",
    backgroundColor: COLORS.bgMain,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  // Selection Item Styles
  selectionItem: (checked) => ({
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    borderRadius: "12px",
    border: `2px solid ${checked ? COLORS.purple : COLORS.borderColor}`,
    backgroundColor: checked ? `${COLORS.purple}08` : COLORS.cardBg,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "12px",
  }),
  checkbox: (checked) => ({
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    border: `2px solid ${checked ? COLORS.purple : "#cbd5e1"}`,
    backgroundColor: checked ? COLORS.purple : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    flexShrink: 0,
    transition: "all 0.2s",
  }),
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
    backgroundColor: variant === "primary" ? COLORS.purple : "transparent",
    color: variant === "primary" ? "#fff" : COLORS.textPrimary,
    transition: "all 0.2s",
    opacity: variant === "disabled" ? 0.5 : 1,
    pointerEvents: variant === "disabled" ? "none" : "auto",
  }),
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
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
  }
};

const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .item-hover:hover { border-color: ${COLORS.purple}; transform: translateX(4px); }
  .btn-hover:hover { opacity: 0.9; transform: scale(1.02); }
  .btn-ghost:hover { background-color: rgba(0,0,0,0.05); color: ${COLORS.purple}; }
`;

// -----------------------
// 4. MAIN COMPONENT
// -----------------------

export default function CAQTest() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // --- Auth Logic ---
  const isCandidate = sessionStorage.getItem("isCandidate") === "true";
  const candidateToken = sessionStorage.getItem("candidateToken");
  const hrToken = localStorage.getItem("access");
  const assignmentId = isCandidate ? sessionStorage.getItem("candidateAssignmentId") : params.get("assignment");

  const getFetchConfig = () => {
    if (isCandidate) {
      return { headers: { "Content-Type": "application/json", "X-Candidate-Token": candidateToken } };
    } else {
      return { headers: { "Content-Type": "application/json", "Authorization": `Bearer ${hrToken}` } };
    }
  };

  // --- State ---
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");

  // --- Navigation & Metrics ---
  const perPage = 5; 
  const totalPages = Math.ceil(QUESTIONS.length / perPage);
  const pageQuestions = QUESTIONS.slice((step - 1) * perPage, step * perPage);
  
  // Progress is strictly based on pages viewed, or questions answered? 
  // For checkboxes, "answered" is ambiguous (not checking is an answer). 
  // So we use page progress.
  const percent = step === 0 ? 0 : Math.min(100, (step / totalPages) * 100);

  const metrics = useMemo(() => {
    const scores = {};
    Object.keys(DOMAINS).forEach((d) => (scores[d] = 0));
    QUESTIONS.forEach((q) => {
      if (answers[q.id]) scores[q.dim] += 1;
    });
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    return { domainScores: scores, total };
  }, [answers]);

  const chartData = Object.entries(metrics.domainScores).map(([k, v]) => ({
    name: DOMAINS[k],
    value: v, // Max 2 per domain
  }));

  // --- Actions ---

  async function submit() {
    setLoading(true);
    const config = getFetchConfig();
    try {
      // 1. Report
      const res = await fetch(`${API_BASE}/api/caq/report/${assignmentId}/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics }),
      });
      const data = await res.json();
      const reportText = data.report || "";
      
      // 2. Submit
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ 
          answers, 
          metrics, 
          ai_report: reportText, 
          assessment_type: "CAQ", 
          overwrite: true 
        }),
      });

      if (!submitRes.ok) throw new Error("Erreur soumission.");
      
      setAiReport(reportText);
      setStep(totalPages + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    const blob = await downloadResultsAsPDF(`caq-result-${assignmentId}.pdf`);
    if(blob && assignmentId) {
      const fd = new FormData();
      fd.append("file", blob, `caq-${assignmentId}.pdf`);
      const headers = isCandidate ? { "X-Candidate-Token": candidateToken } : { "Authorization": `Bearer ${hrToken}` };
      await fetch(`${API_BASE}/api/assessments/${assignmentId}/upload-pdf/`, {
        method: "PUT",
        headers: headers,
        body: fd,
      }).catch(console.error);
    }
  }

  // Toggle Logic
  const toggleAnswer = (id) => {
    setAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={styles.mainWrapper}>
      <style>{animationStyles}</style>

      {/* --- HERO --- */}
      <div style={styles.heroSection}>
        <div style={styles.headerRow}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={styles.heroIconBox}>
              <Trophy size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", margin: 0 }}>
                CAQ
              </h1>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary }}>
                Questionnaire des Réalisations Créatives
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: COLORS.purple }}>
               {step > totalPages ? "Terminé" : `Page ${Math.max(1, step)} / ${totalPages}`}
            </span>
          </div>
        </div>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar(percent)} />
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div style={styles.contentBody}>
        
        {/* INTRO */}
        {step === 0 && (
          <div className="animate-fade-in" style={{ textAlign: "center", maxWidth: "600px", margin: "40px auto" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>Vos réalisations</h2>
            <div style={{ 
              backgroundColor: COLORS.cardBg, 
              padding: "24px", 
              borderRadius: "16px", 
              border: `1px solid ${COLORS.borderColor}`,
              textAlign: "left",
              marginBottom: "32px"
            }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px", color: COLORS.purple }}>
                <Palette size={24} />
                <span style={{ fontWeight: "600" }}>Inventaire des accomplissements</span>
              </div>
              <p style={{ color: COLORS.textSecondary, lineHeight: "1.6" }}>
                Veuillez indiquer les domaines dans lesquels vous avez des réalisations concrètes (prix, publications, expositions, etc.).
              </p>
              <ul style={{ color: COLORS.textSecondary, marginTop: "8px", paddingLeft: "20px" }}>
                <li>10 Domaines (Arts, Sciences, Cuisine...)</li>
                <li>Cochez ce qui s'applique</li>
                <li>Durée : ~3 minutes</li>
              </ul>
            </div>
            <button style={styles.btn("primary")} className="btn-hover" onClick={() => setStep(1)}>
              Commencer <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* QUESTIONS */}
        {step > 0 && step <= totalPages && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: "18px", marginBottom: "20px", color: COLORS.textSecondary }}>
              Cochez les affirmations qui sont vraies pour vous :
            </h3>

            {pageQuestions.map((q) => {
              const isChecked = !!answers[q.id];
              return (
                <div 
                  key={q.id} 
                  style={styles.selectionItem(isChecked)}
                  className="item-hover"
                  onClick={() => toggleAnswer(q.id)}
                >
                   <div style={styles.checkbox(isChecked)}>
                     {isChecked && <Check size={16} strokeWidth={4} />}
                   </div>
                   <div style={{ flex: 1 }}>
                     <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: COLORS.textMuted, marginBottom: "4px" }}>
                       {DOMAINS[q.dim]}
                     </div>
                     <div style={{ fontSize: "16px", fontWeight: "500", color: isChecked ? COLORS.textPrimary : COLORS.textSecondary }}>
                       {q.text}
                     </div>
                   </div>
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
              <button style={styles.btn("ghost")} className="btn-ghost" onClick={() => setStep(s => Math.max(1, s-1))}>
                <ArrowLeft size={18} /> Retour
              </button>
              
              {step < totalPages ? (
                <button 
                  style={styles.btn("primary")} 
                  className="btn-hover" 
                  onClick={() => setStep(s => s+1)}
                >
                  Suivant <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  style={styles.btn(loading ? "disabled" : "primary")} 
                  className={!loading ? "btn-hover" : ""} 
                  onClick={submit}
                >
                   {loading ? <Loader2 className="loading-spin" size={18} /> : <>Voir les résultats <ArrowRight size={18} /></>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step > totalPages && (
          <div className="animate-fade-in" id="results-root">
            
            {/* Header */}
            <div style={{ ...styles.headerRow, marginBottom: "32px" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>Profil de Réalisations</h2>
                <span style={{ color: COLORS.textSecondary }}>Score Total : <strong>{metrics.total}</strong> / 20</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                 <button style={styles.btn("ghost")} className="btn-ghost" onClick={() => { setAnswers({}); setStep(1); setAiReport(""); }}>
                   <RotateCcw size={18} /> Recommencer
                 </button>
                 <button style={styles.btn("primary")} className="btn-hover" onClick={handleDownload}>
                   <Download size={18} /> PDF
                 </button>
              </div>
            </div>

            <div style={styles.resultsGrid}>
              
              {/* Graph */}
              <div style={{ ...styles.card, minHeight: "500px", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Répartition par Domaine</h3>
                
                <div style={{ flex: 1, width: "100%", height: "100%" }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke={COLORS.borderColor} />
                      <XAxis type="number" domain={[0, 2]} hide />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={120} 
                        tick={{ fontSize: 11, fill: COLORS.textSecondary }} 
                        interval={0}
                      />
                      <Tooltip 
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.value > 0 ? COLORS.purple : "#e2e8f0"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Report */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {aiReport ? (
                  <div style={{ ...styles.card, padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", color: COLORS.success, marginBottom: "16px" }}>
                      <CheckCircle2 size={20} />
                      <span style={{ fontWeight: "600" }}>Analyse Terminée</span>
                    </div>
                    <div style={styles.aiReportBox}>
                       <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", color: COLORS.textPrimary }}>
                         <FileText size={18} /> <strong>Interprétation IA</strong>
                       </div>
                       {aiReport}
                    </div>
                  </div>
                ) : (
                  <div style={{ ...styles.card, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
                    <div style={{textAlign: "center", color: COLORS.textMuted}}>
                        <Loader2 className="loading-spin" size={32} style={{margin:"0 auto 10px"}} />
                        <p>Génération du rapport...</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}