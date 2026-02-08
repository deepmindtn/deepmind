import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  PlayCircle,
  Loader2,
  ClipboardCheck,
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

/* -----------------------
   CSS & Responsive Styles
----------------------- */
const responsiveStyles = `
  /* --- Desktop / Default Styles --- */
  .assessments-container {
    padding: 5px 14px;
    background-color: ${COLORS.bgMain};
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .main-wrapper {
    background-color: ${COLORS.cardBg};
    border-radius: 24px;
    border: 1px solid ${COLORS.borderColor};
    box-shadow: ${COLORS.shadowHuge};
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 40px);
    position: relative;
  }

  .hero-section {
    background: linear-gradient(135deg, ${COLORS.primary}1A 0%, ${COLORS.cardBg} 100%);
    padding: 48px;
    border-bottom: 1px solid ${COLORS.borderColor};
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .hero-icon-box {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background-color: ${COLORS.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 10px 25px -5px ${COLORS.primary}60;
    color: #fff;
  }

  .hero-text {
    flex: 1;
  }

  .content-body {
    flex: 1;
    padding: 40px;
    background-color: ${COLORS.bgMain};
  }

  .assessments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .assessment-card {
    background-color: ${COLORS.cardBg};
    border-radius: 20px;
    padding: 24px;
    border: 1px solid ${COLORS.borderColor};
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .assessment-card:hover {
    transform: translateY(-5px);
    border-color: ${COLORS.primary}60;
    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  }

  /* --- Buttons --- */
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
    width: 100%;
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

  /* --- Mobile / Responsive Overrides --- */
  @media (max-width: 768px) {
    .assessments-container {
      padding: 10px; /* Small padding so radius is visible */
    }
    
    .main-wrapper {
      border-radius: 24px; /* RESTORED RADIUS */
      min-height: calc(100vh - 20px);
      /* Ensure border is visible */
      border: 1px solid ${COLORS.borderColor}; 
    }

    .hero-section {
      flex-direction: column;
      text-align: center;
      padding: 32px 20px;
      gap: 16px;
    }

    .hero-text {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .content-body {
      padding: 24px 16px;
    }

    .assessments-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .assessment-card {
      padding: 20px;
    }
  }
`;

const styles = {
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
    <div className="assessments-container">
      <style>{responsiveStyles}</style>

      <div className="main-wrapper">
        {/* Hero Header */}
        <div className="hero-section">
          <div className="hero-icon-box">
            <ClipboardCheck size={36} strokeWidth={2.5} />
          </div>
          <div className="hero-text">
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "800",
                color: COLORS.textPrimary,
                margin: "0 0 4px 0",
                lineHeight: "1.2",
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

        <div className="content-body">
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
            <div className="assessments-grid">
              {items.map((a) => (
                <div key={a.id} className="assessment-card">
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
                        onClick={() => start(a)}
                      >
                        <PlayCircle size={18} />
                        Start Assessment
                      </button>
                    ) : (
                      <Link
                        to={`/report/${a.id}`}
                        className="btn-action btn-report"
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