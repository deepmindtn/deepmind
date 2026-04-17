import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Download,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Loader2,
  Activity,
  Info,
  Trophy,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import bigFiveImage from "../../../assets/big-five-personality.png";
import StructuredReport from "./StructuredReport";
import { exportAssessmentResultsPdf } from "../../../utils/exportAssessmentPdf";
import { buildAssessmentPdfMetadata } from "../../../utils/assessmentPdfMeta";
// -----------------------
// Theme Configuration
// -----------------------

// JS-Safe Hex Colors for Charts
const JS_COLORS = {
  primary: "#6366f1",
  primaryFade: "rgba(99, 102, 241, 0.1)",
  chart: ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b"],
};

// CSS Variables to match your Design System
const VARS = {
  bgMain: "var(--bg-main, #f8fafc)",
  cardBg: "var(--card-bg, #ffffff)",
  primary: "var(--primary, #6366f1)",
  primaryLight: "var(--primary-light, #e0e7ff)",
  textPrimary: "var(--text-primary, #1e293b)",
  textSecondary: "var(--text-secondary, #64748b)",
  textMuted: "var(--text-muted, #94a3b8)",
  borderColor: "var(--border-color, #e2e8f0)",
  shadowHuge:
    "var(--shadow-huge, 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04))",
};

const styles = {
  // Main Container (Full Page)
  container: {
    padding: "5px 14px",
    backgroundColor: VARS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    justifyContent: "center",
    color: VARS.textPrimary,
  },
  // Central Card Wrapper
  mainWrapperCard: {
    backgroundColor: VARS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${VARS.borderColor}`,
    boxShadow: VARS.shadowHuge,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  // Hero Header Section
  heroSection: {
    background: `linear-gradient(135deg, ${VARS.primaryLight} 0%, ${VARS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${VARS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroLeftContent: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  heroIconBox: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: VARS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)",
    color: "#fff",
  },
  // Main Body Area
  contentBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "32px",
    position: "relative",
    overflowY: "auto",
    backgroundColor: VARS.bgMain,
  },
  // The Grid Layout (Main Content + Sidebar)
  layoutContainer: {
    display: "flex",
    gap: "32px",
    height: "100%",
    width: "100%",
    flexDirection: "row",
  },
  // Left Column (Test/Results)
  mainContentColumn: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    minHeight: "0",
  },
  // Right Column (Sidebar)
  sidebarColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: "320px",
    gap: "24px",
  },
  // Cards
  card: {
    backgroundColor: VARS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${VARS.borderColor}`,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
  },
  sidebarCard: {
    backgroundColor: VARS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${VARS.borderColor}`,
  },
  // Components
  btn: (variant) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "12px 24px",
    borderRadius: "12px",
    border: variant === "primary" ? "none" : `1px solid ${VARS.borderColor}`,
    backgroundColor: variant === "primary" ? VARS.primary : "transparent",
    color: variant === "primary" ? "#fff" : VARS.textSecondary,
    fontWeight: "700",
    cursor: variant === "disabled" ? "not-allowed" : "pointer",
    transition: "all 0.2s",
    fontSize: "14px",
    opacity: variant === "disabled" ? 0.5 : 1,
  }),
  badge: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    backgroundColor: `${JS_COLORS.primary}15`,
    color: VARS.primary,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-block",
    marginBottom: "8px",
  },
};

const css = `
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.5s ease-out forwards; }
  
  .integrated-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-secondary);
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: fit-content;
  }
  .integrated-back-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateX(-3px);
  }

  .likert-opt {
    height: 64px;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--card-bg);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    color: var(--text-secondary);
  }
  .likert-opt:hover {
    border-color: var(--primary);
    background: var(--primary-light);
    transform: translateY(-2px);
  }
  .likert-opt.selected {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    transform: translateY(-2px);
  }
  .likert-num { font-size: 18px; font-weight: 700; }
  .likert-label { font-size: 10px; text-transform: uppercase; font-weight: 600; margin-top: 4px; opacity: 0.9; }

  @media (max-width: 1024px) {
    .layout-container { flex-direction: column !important; }
    .hero-left-content { flex-direction: column; text-align: center; }
  }
`;

/* ---------- Logic Constants & Helpers ---------- */
const LIKERT = [1, 2, 3, 4, 5];
const QUESTIONS = [
  { id: 1, trait: "E", reverse: false, en: "I enjoy social gatherings." },
  {
    id: 2,
    trait: "C",
    reverse: false,
    en: "I am organized and follow a schedule.",
  },
  { id: 3, trait: "N", reverse: false, en: "I get stressed out easily." },
  {
    id: 4,
    trait: "A",
    reverse: false,
    en: "I am compassionate toward others.",
  },
  { id: 5, trait: "O", reverse: false, en: "I have a vivid imagination." },
  {
    id: 6,
    trait: "E",
    reverse: false,
    en: "I feel comfortable around people.",
  },
  { id: 7, trait: "C", reverse: false, en: "I am always prepared." },
  { id: 8, trait: "N", reverse: false, en: "I often feel blue." },
  {
    id: 9,
    trait: "A",
    reverse: false,
    en: "I am interested in others' problems.",
  },
  {
    id: 10,
    trait: "O",
    reverse: false,
    en: "I enjoy artistic and creative experiences.",
  },
  { id: 11, trait: "E", reverse: false, en: "I start conversations." },
  { id: 12, trait: "C", reverse: false, en: "I pay attention to detail." },
];

function normalizeTo100(value, min, max) {
  return Math.round(((value - min) / (max - min)) * 100);
}

function computeScores(answers) {
  const traitTotals = { N: 0, E: 0, O: 0, A: 0, C: 0 };
  const traitCounts = { N: 0, E: 0, O: 0, A: 0, C: 0 };

  QUESTIONS.forEach((q) => {
    if (!answers[q.id]) return;
    const raw = answers[q.id];
    const score = q.reverse ? 6 - raw : raw;
    traitTotals[q.trait] += score;
    traitCounts[q.trait] += 1;
  });

  const traitScores = Object.fromEntries(
    Object.entries(traitTotals).map(([t, total]) => [
      t,
      normalizeTo100(
        total,
        1 * (traitCounts[t] || 1),
        5 * (traitCounts[t] || 1)
      ),
    ])
  );
  return { traitScores };
}

// -----------------------
// Main Component
// -----------------------
export default function BigFiveAssessment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  
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

  // State
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0); // 0=Intro, 1..=Questions, >Total=Results
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [fetching, setFetching] = useState(true);

  const questionsPerPage = 4;
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
          setAssignmentInfo(data || null);
        
        // Check if assignment is already completed. If so, load existing results
        if (data && data.status === 'COMPLETED') {
          console.log("📋 Loading existing completed assessment data...");
          
          // Restore answers if available
          if (data.answers) {
            setAnswers(data.answers);
          }
          
          // Restore AI report if available
          if (data.ai_report) { try { setAiReport(JSON.parse(data.ai_report)); } catch { setAiReport(data.ai_report); } }
          
          // Skip to results page - metrics will be computed from restored answers via useMemo
          setStep(totalPages + 1);
        }
        
        return data;
      })
      .catch((err) => {
        console.error("❌ Assessment fetch error:", err);
      })
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, candidateToken, isCandidate]);

  // Computed
  const percent = Math.round(
    (Object.keys(answers).length / QUESTIONS.length) * 100
  );
  const metrics = useMemo(() => computeScores(answers), [answers]);
  const pageQuestions = QUESTIONS.slice(
    (step - 1) * questionsPerPage,
    step * questionsPerPage
  );
  const canNext =
    pageQuestions.length > 0 && pageQuestions.every((q) => !!answers[q.id]);

  // Handlers
  const handleStart = () => setStep(1);
  const handleNext = () =>
    canNext && setStep((s) => Math.min(totalPages, s + 1));
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  async function handleSubmit() {
    if (Object.keys(answers).length !== QUESTIONS.length) {
      alert("Please answer all questions.");
      return;
    }
    
    setAiLoading(true);
    const config = getFetchConfig();

    try {
      const metrics = computeScores(answers);

      // A) Generate AI Report
      const reportRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/generate-report/`, {
        method: "POST",
        headers: config.headers, 
        body: JSON.stringify({ answers, metrics }),
      });
      const reportData = await reportRes.json();
      const reportObj = reportData.report || null;

      // B) Submit to Assignment
      const submitRes = await fetch(`${API_BASE}/api/assessments/${assignmentId}/submit/`, {
        method: "POST",
        headers: config.headers,
        body: JSON.stringify({ answers, metrics, ai_report: typeof reportObj === "object" && reportObj !== null ? JSON.stringify(reportObj) : (reportObj || ""), overwrite: true }),
      });
      const submitData = await submitRes.json();
      if (!submitRes.ok) throw new Error(submitData?.error || "Error submitting assessment.");

      setAiReport(reportObj);
      setStep(totalPages + 1);
    } catch (err) {
      console.error(err);
      alert("An error occurred: " + err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleDownload() {
    const metadata = buildAssessmentPdfMetadata({
      assignment: assignmentInfo,
      testName: "Big Five (OCEAN)",
    });
    const blob = await exportAssessmentResultsPdf({
      rootId: "results-root",
      fileName: `big-five-report-${assignmentId}.pdf`,
      metadata,
    });
    if (blob && assignmentId) {
      const fd = new FormData();
      fd.append("file", blob, `bigfive-${assignmentId}.pdf`);
      const headers = isCandidate
        ? { "X-Candidate-Token": candidateToken }
        : { Authorization: `Bearer ${hrToken}` };
      await fetch(`${API_BASE}/api/assessments/${assignmentId}/upload-pdf/`, {
        method: "PUT",
        headers,
        body: fd,
      }).catch(console.error);
    }
  }

  // --- Render Views ---

  // 1. Sidebar Logic (Dynamic based on Step)
  const Sidebar = () => (
    <div style={styles.sidebarColumn}>
      {/* Dynamic Card 1 */}
      <div style={styles.sidebarCard}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: VARS.primary,
            marginBottom: "16px",
          }}
        >
          {step === 0 ? (
            <Info size={20} />
          ) : step > totalPages ? (
            <Trophy size={20} />
          ) : (
            <Target size={20} />
          )}
          <span
            style={{
              fontWeight: "800",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {step === 0 ? "About" : step > totalPages ? "Analysis" : "Progress"}
          </span>
        </div>

        {step === 0 && (
          <>
            <h4
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: VARS.textPrimary,
                margin: "0 0 8px 0",
              }}
            >
              {" "}
              Scientific Model
            </h4>
            <p
              style={{
                fontSize: "14px",
                color: VARS.textSecondary,
                lineHeight: "1.6",
              }}
            >
              The Big Five (OCEAN) is the most scientifically validated model of
              personality, used by psychologists worldwide to predict workplace
              performance.
            </p>
          </>
        )}

        {step > 0 && step <= totalPages && (
          <>
            <h4
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: VARS.textPrimary,
                margin: "0 0 8px 0",
              }}
            >
              Completion
            </h4>
            <div
              style={{
                height: "8px",
                background: VARS.borderColor,
                borderRadius: "4px",
                margin: "12px 0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${percent}%`,
                  background: VARS.primary,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <p style={{ fontSize: "14px", color: VARS.textSecondary }}>
              {Object.keys(answers).length} of {QUESTIONS.length} questions
              answered.
            </p>
          </>
        )}

        {step > totalPages && (
          <>
            <h4
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: VARS.textPrimary,
                margin: "0 0 8px 0",
              }}
            >
              Profile Type
            </h4>
            <p
              style={{
                fontSize: "14px",
                color: VARS.textSecondary,
                lineHeight: "1.6",
              }}
            >
              Your profile indicates a "Strategist" archetype based on high
              Conscientiousness scores.
            </p>
          </>
        )}
      </div>

      {/* Dynamic Card 2 */}
      <div style={styles.sidebarCard}>
        <h3
          style={{
            fontSize: "14px",
            color: VARS.textPrimary,
            fontWeight: "800",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Activity size={16} color={VARS.primary} />{" "}
          {step > totalPages ? "Actions" : "Instructions"}
        </h3>

        {step > totalPages ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <button
              style={styles.btn("outline")}
              onClick={handleDownload}
            >
              <Download size={16} /> Export PDF
            </button>
            <button
              style={styles.btn("outline")}
              onClick={() => {
                setStep(0);
                setAnswers({});
              }}
            >
              <RotateCcw size={16} /> Retake Test
            </button>
          </div>
        ) : (
          <div
            style={{
              fontSize: "13px",
              color: VARS.textSecondary,
              lineHeight: "1.6",
            }}
          >
            <p>• Answer honestly, even if you don't like the answer.</p>
            <p>• Try not to leave "Neutral" answers too often.</p>
          </div>
        )}
      </div>
    </div>
  );

  // 2. Main Content Views
  const IntroView = () => (
    <div
      className="fade-in"
      style={{ ...styles.card, textAlign: "center", padding: "60px 40px" }}
    >
      <div
        style={{
          width: "74px",
          height: "74px",
          borderRadius: "18px",
          backgroundColor: VARS.primaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 8px 20px -10px rgba(99, 102, 241, 0.6)",
        }}
      >
        <Brain size={36} color={VARS.primary} />
      </div>

      <div style={{ margin: "0 auto 32px auto", width: "fit-content" }}>
        <img
          src={bigFiveImage}
          alt="Big Five personality traits diagram"
          style={{
            width: "100%",
            maxWidth: "320px",
            height: "auto",
            borderRadius: "16px",
          }}
        />
      </div>

      <h2
        style={{
          fontSize: "32px",
          fontWeight: "800",
          color: VARS.textPrimary,
          marginBottom: "16px",
        }}
      >
        Bienvenue au test Big Five
      </h2>
      <p
        style={{
          fontSize: "18px",
          color: VARS.textSecondary,
          maxWidth: "600px",
          margin: "0 auto 40px",
        }}
      >
        Découvrez les 5 dimensions clés qui structurent votre style de travail,
        vos interactions et votre manière de décider.
      </p>
      <button
        style={{
          ...styles.btn("primary"),
          margin: "0 auto",
          padding: "16px 48px",
          fontSize: "16px",
        }}
        onClick={handleStart}
      >
        Commencer le test <ArrowRight size={20} />
      </button>
    </div>
  );

  const QuestionsView = () => (
    <div className="fade-in">
      {pageQuestions.map((q, idx) => (
        <div key={q.id} style={{ ...styles.card, marginBottom: "24px" }}>
          <span style={styles.badge}>
            Question {(step - 1) * questionsPerPage + idx + 1}
          </span>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: VARS.textPrimary,
              marginBottom: "24px",
            }}
          >
            {q.en}
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "12px",
            }}
          >
            {LIKERT.map((val, i) => (
              <button
                key={val}
                className={`likert-opt ${
                  answers[q.id] === val ? "selected" : ""
                }`}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
              >
                <span className="likert-num">{val}</span>
                <span className="likert-label">
                  {i === 0 ? "Disagree" : i === 4 ? "Agree" : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "32px",
        }}
      >
        <button style={styles.btn("outline")} onClick={handleBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          style={styles.btn(canNext ? "primary" : "disabled")}
          onClick={step < totalPages ? handleNext : handleSubmit}
          disabled={!canNext}
        >
          {step < totalPages ? "Next Section" : "View Results"}{" "}
          {step < totalPages ? (
            <ChevronRight size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
        </button>
      </div>
    </div>
  );

  const ResultsView = () => {
    const data = [
      { name: "Openness", score: metrics.traitScores.O },
      { name: "Conscientiousness", score: metrics.traitScores.C },
      { name: "Extraversion", score: metrics.traitScores.E },
      { name: "Agreeableness", score: metrics.traitScores.A },
      { name: "Neuroticism", score: metrics.traitScores.N },
    ];

    return (
      <div
        className="fade-in"
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        id="results-root"
      >
        {/* Chart Card */}
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: VARS.textPrimary,
              }}
            >
              Trait Breakdown
            </h3>
          </div>

          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={VARS.borderColor}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: VARS.textSecondary,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: VARS.textSecondary, fontSize: 12 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  cursor={{ fill: VARS.bgMain }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: VARS.shadowHuge,
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={60}>
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={JS_COLORS.chart[index % JS_COLORS.chart.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Card */}
        <div
          style={{
            ...styles.card,
            background: `linear-gradient(135deg, ${JS_COLORS.primaryFade} 0%, ${VARS.cardBg} 100%)`,
            border: `1px solid ${VARS.primary}40`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              marginBottom: "16px",
              color: VARS.primary,
            }}
          >
            <Brain size={20} />
            <div>
              <strong style={{ fontSize: "18px", fontWeight: "700", display: "block" }}>
                Analyse IA
              </strong>
              <span style={{ fontSize: "14px", color: VARS.textSecondary }}>
                Interprétation personnalisée de votre profil.
              </span>
            </div>
          </div>
          {aiLoading ? (
            <div
              style={{
                padding: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: VARS.textSecondary,
              }}
            >
              <Loader2 className="spin" size={20} /> Génération de l'analyse...
            </div>
          ) : (
            <StructuredReport report={aiReport} />
          )}
        </div>
      </div>
    );
  };

  if (fetching) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.mainWrapperCard, alignItems: "center", justifyContent: "center", padding: "60px" }}>
          <Loader2 size={40} color={VARS.primary} style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 16, color: VARS.textSecondary }}>Loading assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{css}</style>
      <div style={styles.mainWrapperCard}>
        {/* HERO SECTION */}
        <div style={styles.heroSection}>
          <div style={styles.heroLeftContent} className="hero-left-content">
            <button
              className="integrated-back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              <span>Exit</span>
            </button>
            <div style={styles.heroIconBox}>
              <Brain size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: VARS.textPrimary,
                  margin: "0 0 4px 0",
                }}
              >
                Psychometric Assessment
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  color: VARS.textSecondary,
                  margin: "0",
                }}
              >
                Five Factor Model (OCEAN)
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div style={styles.contentBody}>
          <div className="layout-container" style={styles.layoutContainer}>
            {/* Left Column */}
            <div style={styles.mainContentColumn}>
              {step === 0 && <IntroView />}
              {step > 0 && step <= totalPages && <QuestionsView />}
              {step > totalPages && <ResultsView />}
            </div>

            {/* Right Column (Sidebar) */}
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
