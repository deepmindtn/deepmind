import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  PlayCircle,
  Loader2,
  ClipboardCheck,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Inbox,
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#10b981", // Indigo Hub
  success: "#10b981",
  warning: "#f59e0b",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
};

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
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
    // FIX: Using 10% alpha primary color to avoid "white wash" in dark mode
    background: `linear-gradient(135deg, ${COLORS.primary}1A 0%, ${COLORS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroIconBox: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: `0 10px 25px -5px ${COLORS.primary}60`,
    color: "#fff",
  },
  contentBody: {
    flex: 1,
    padding: "40px",
    backgroundColor: COLORS.bgMain,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  assessmentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  statusBadge: (status) => ({
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor:
      status === "PENDING" ? `${COLORS.warning}15` : `${COLORS.success}15`,
    color: status === "PENDING" ? COLORS.warning : COLORS.success,
    border: `1px solid ${
      status === "PENDING" ? COLORS.warning : COLORS.success
    }30`,
  }),
};

const animationStyles = `
  .assessment-card-hover:hover {
    transform: translateY(-5px);
    border-color: ${COLORS.primary}60;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }
  .btn-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    border: none;
  }
  .btn-start {
    background: ${COLORS.primary};
    color: white;
    box-shadow: 0 4px 12px ${COLORS.primary}40;
  }
  .btn-start:hover { transform: scale(1.02); opacity: 0.9; }
  .btn-report {
    background: var(--bg-main);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }
  .btn-report:hover { border-color: ${COLORS.primary}; color: ${COLORS.primary}; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .animate-spin { animation: spin 1s linear infinite; }
`;

export default function MyAssessments() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/assessments/my/`, {
          headers: { ...authHeader },
        });
        const data = await r.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function start(a) {
    const code = a.template_code;
    const pathMap = {
      BIG_FIVE: "/big-five",
      KARASEK: "/karasek",
      MASLACH: "/maslach",
      DISC: "/disc",
      JSS: "/jss",
      BRS: "/brs",
      CDRISC: "/cdrisc",
      WSES: "/wses",
      GCOS: "/gcos",
      RIBS: "/ribs",
      CAQ: "/caq",
      ISE: "/ise",
    };

    if (pathMap[code]) navigate(`${pathMap[code]}?assignment=${a.id}`);
    else alert(`Unknown assessment type: ${code}`);
  }

  return (
    <div className="assessment-library-container" style={styles.container}>
      <div style={styles.mainWrapper}>
        <style>{animationStyles}</style>

        {/* Hero Header */}
        <div style={styles.heroSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={styles.heroIconBox}>
              <ClipboardCheck size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: COLORS.textPrimary,
                  margin: "0 0 4px 0",
                }}
              >
                My Assessments
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  color: COLORS.textSecondary,
                  margin: "0",
                }}
              >
                Track your progress and view psychometric insights.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.contentBody}>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "100px 0",
                color: COLORS.textMuted,
              }}
            >
              <Loader2
                className="animate-spin"
                size={40}
                style={{ marginBottom: "16px", color: COLORS.primary }}
              />
              <p style={{ fontWeight: "600" }}>Fetching your assignments...</p>
            </div>
          ) : items.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "100px 0",
                color: COLORS.textMuted,
              }}
            >
              <div
                style={{
                  background: `${COLORS.primary}08`,
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                }}
              >
                <Inbox size={40} opacity={0.3} />
              </div>
              <h3 style={{ color: COLORS.textPrimary, marginBottom: "8px" }}>
                No Assessments Found
              </h3>
              <p>You don't have any assignments at the moment.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {items.map((a) => (
                <div
                  key={a.id}
                  className="assessment-card-hover"
                  style={styles.assessmentCard}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <span style={styles.statusBadge(a.status)}>
                        {a.status === "PENDING" ? (
                          <PlayCircle size={14} />
                        ) : (
                          <FileText size={14} />
                        )}
                        {a.status}
                      </span>
                      <div style={{ color: COLORS.textMuted }}>
                        <Calendar size={18} />
                      </div>
                    </div>

                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: COLORS.textPrimary,
                        margin: "0 0 8px 0",
                        lineHeight: "1.4",
                      }}
                    >
                      {a.template_name}
                    </h3>

                    <p
                      style={{
                        fontSize: "14px",
                        color: COLORS.textSecondary,
                        margin: "0 0 24px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      Assigned on{" "}
                      {new Date(a.assigned_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    {a.status === "PENDING" ? (
                      <button
                        className="btn-action btn-start"
                        style={{ width: "100%" }}
                        onClick={() => start(a)}
                      >
                        <PlayCircle size={18} />
                        Start Assessment
                      </button>
                    ) : (
                      <Link
                        to={`/report/${a.id}`}
                        className="btn-action btn-report"
                        style={{ width: "100%" }}
                      >
                        <FileText size={18} />
                        View Detailed Report
                        <ChevronRight
                          size={16}
                          style={{ marginLeft: "auto" }}
                        />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
