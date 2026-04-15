import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  FileText,
  TrendingUp,
  BarChart2,
  ListOrdered,
  Layers,
  Activity,
  Zap,
  Info,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Chart from "react-apexcharts";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  blue: "var(--blue)",
  blueLight: "var(--blue-light)",
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
  red: "var(--red)",
  dark: "var(--dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  shadowHuge: "var(--shadow-huge)",
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.blue,
  COLORS.purple,
  COLORS.orange,
  COLORS.red,
];

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: "48px",
  },
  header: { marginBottom: "40px" },
  tabNav: {
    display: "flex",
    gap: "8px",
    backgroundColor: "#f1f5f9",
    padding: "6px",
    borderRadius: "14px",
    width: "fit-content",
    marginBottom: "32px",
  },
  tabBtn: (active) => ({
    padding: "10px 24px",
    borderRadius: "10px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: active ? COLORS.cardBg : "transparent",
    color: active ? COLORS.textPrimary : COLORS.textSecondary,
    boxShadow: active ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none",
  }),
  statCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    transition: "all 0.3s ease",
  },
  iconBox: (bgColor) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "28px",
    height: "100%",
  },
};

// Add responsive styles
const responsiveStyles = `
  @media (max-width: 1280px) {
    .dashboard-content-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 1024px) {
    .dashboard-main-wrapper {
      padding: 32px 24px !important;
    }
    .dashboard-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .dashboard-metrics-grid {
      grid-template-columns: 1fr !important;
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 5px 10px !important;
    }
    .dashboard-main-wrapper {
      padding: 24px 16px !important;
      border-radius: 20px !important;
    }
    .dashboard-header-title {
      font-size: 24px !important;
    }
    .dashboard-header-subtitle {
      font-size: 14px !important;
    }
    .dashboard-stats-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .dashboard-tab-nav {
      width: 100% !important;
    }
    .dashboard-tab-btn {
      flex: 1;
      padding: 10px 16px !important;
      font-size: 13px !important;
      text-align: center;
    }
    .dashboard-completion-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
    .dashboard-chart-card {
      padding: 20px !important;
    }
  }

  @media (max-width: 480px) {
    .dashboard-container {
      padding: 5px 8px !important;
    }
    .dashboard-main-wrapper {
      padding: 20px 12px !important;
      border-radius: 16px !important;
    }
    .dashboard-header {
      margin-bottom: 24px !important;
    }
    .dashboard-header-title {
      font-size: 20px !important;
    }
    .dashboard-header-subtitle {
      font-size: 13px !important;
    }
    .dashboard-header-icon-wrapper {
      padding: 8px !important;
    }
    .dashboard-header-icon-wrapper svg {
      width: 20px !important;
      height: 20px !important;
    }
    .dashboard-icon-box {
      width: 40px !important;
      height: 40px !important;
    }
    .dashboard-icon-box svg {
      width: 20px !important;
      height: 20px !important;
    }
    .dashboard-stat-value {
      font-size: 24px !important;
    }
    .dashboard-stat-label {
      font-size: 13px !important;
    }
    .dashboard-completion-grid {
      grid-template-columns: 1fr !important;
    }
    .dashboard-completion-item {
      padding: 12px !important;
    }
    .dashboard-completion-label {
      font-size: 11px !important;
    }
    .dashboard-completion-value {
      font-size: 18px !important;
    }
    .dashboard-tab-nav {
      flex-direction: column;
      padding: 4px !important;
    }
    .dashboard-tab-btn {
      width: 100%;
      padding: 8px 12px !important;
      font-size: 12px !important;
    }
    .dashboard-chart-card {
      padding: 16px !important;
    }
    .dashboard-chart-title {
      font-size: 16px !important;
      margin-bottom: 12px !important;
    }
  }

  .hover-lift:hover {
    transform: translateY(-5px);
    border-color: ${COLORS.primary} !important;
  }

  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: ${COLORS.textMuted};
  }
`;

// -----------------------
// Helper Functions
// -----------------------
const API_BASE = import.meta.env.VITE_API_BASE_URL;
function useAuthHeader() {
  const access = localStorage.getItem("access");
  return access ? { Authorization: `Bearer ${access}` } : {};
}

function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function takeBigFive(m) {
  if (!m || !m.trait) return null;
  const t = m.trait;
  return {
    N: safeNum(t.N),
    E: safeNum(t.E),
    O: safeNum(t.O),
    A: safeNum(t.A),
    C: safeNum(t.C),
  };
}

function takeKarasek(m) {
  if (!m || !m.dim) return null;
  const d = m.dim;
  return {
    D: safeNum(d.D),
    C: safeNum(d.C),
    S: safeNum(d.S),
    quadrant: m.quadrant || null,
  };
}

function takeMaslach(m) {
  if (!m) return null;
  if (m.burnout) {
    return {
      EE: safeNum(m.burnout.exhaustion),
      DP: safeNum(m.burnout.depersonalization),
      PA: safeNum(m.burnout.accomplishment),
    };
  }
  if (m.EE !== undefined) {
    return { 
      EE: safeNum(m.EE), 
      DP: safeNum(m.DP), 
      PA: safeNum(m.PA) 
    };
  }
  return null;
}

function takeDISC(m) {
  if (!m || !m.trait) return null;
  const t = m.trait;
  return { 
    D: safeNum(t.D), 
    I: safeNum(t.I), 
    S: safeNum(t.S), 
    C: safeNum(t.C) 
  };
}

function takeJSS(m) {
  if (!m || !m.dimScores) return null;
  const dim = m.dimScores;
  return Object.fromEntries(
    Object.entries(dim).map(([k, v]) => [k, safeNum(v)])
  );
}

function takeBRS(m) {
  if (!m || m.average === undefined) return null;
  return { 
    avg: safeNum(m.average), 
    level: m.level || "" 
  };
}

// -----------------------
// Sub-Components
// -----------------------
const PremiumStatCard = ({ label, value, icon, color, bg, detail }) => (
  <div className="hover-lift" style={styles.statCard}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div className="dashboard-icon-box" style={styles.iconBox(bg)}>
        {React.cloneElement(icon, { color: color, size: 24 })}
      </div>
      <TrendingUp size={16} color={COLORS.primary} />
    </div>
    <div>
      <div
        className="dashboard-stat-value"
        style={{
          fontSize: "28px",
          fontWeight: "800",
          color: COLORS.textPrimary,
        }}
      >
        {value}
      </div>
      <div
        className="dashboard-stat-label"
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: COLORS.textSecondary,
          marginTop: "4px",
        }}
      >
        {label}
      </div>
    </div>
    {detail && (
      <div
        style={{
          marginTop: "8px",
          paddingTop: "12px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          fontSize: "12px",
          color: COLORS.textMuted,
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <Info size={12} /> {detail}
      </div>
    )}
  </div>
);

const ActivityTimelineItem = ({ main, sub, time }) => (
  <div style={{ display: "flex", gap: "16px", paddingBottom: "24px" }}>
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: COLORS.primary,
          border: `3px solid ${COLORS.primaryLight}`,
          zIndex: 2,
        }}
      />
      <div
        style={{
          width: "2px",
          flex: 1,
          backgroundColor: COLORS.borderColor,
          margin: "4px 0",
        }}
      />
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "700",
          color: COLORS.textPrimary,
        }}
      >
        {main}
      </div>
      <div style={{ fontSize: "13px", color: COLORS.textSecondary }}>{sub}</div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: COLORS.primary,
          marginTop: "4px",
        }}
      >
        {time}
      </div>
    </div>
  </div>
);

const EmptyChartState = ({ message }) => (
  <div className="empty-state">
    <AlertCircle size={48} color={COLORS.textMuted} style={{ marginBottom: "16px" }} />
    <p style={{ margin: 0, fontSize: "14px" }}>{message}</p>
  </div>
);

// -----------------------
// Main Dashboard
// -----------------------
const Dashboard = () => {
  const authHeader = useAuthHeader();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    async function fetchData() {
      try {
        const [uRes, aRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/?all=true`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/api/assessments/admin/`, {
            headers: { ...authHeader },
          }),
        ]);
        if (!uRes.ok || !aRes.ok) throw new Error("Failed to load data");
        const [uJson, aJson] = await Promise.all([uRes.json(), aRes.json()]);
        setUsers(
          Array.isArray(uJson)
            ? uJson
            : Array.isArray(uJson?.results)
              ? uJson.results
              : []
        );
        setAssignments(Array.isArray(aJson) ? aJson : aJson?.results || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const data = useMemo(() => {
    const totalEmployees = users.length;
    const ACTIVE = new Set(["ASSIGNED", "IN_PROGRESS", "PENDING"]);
    const completed = assignments.filter((a) => a.status === "COMPLETED");

    // Calculate percentages properly
    const totalsByTemplate = {};
    const compsByTemplate = {};
    
    assignments.forEach((a) => {
      const code = a.template_code;
      if (code) {
        totalsByTemplate[code] = (totalsByTemplate[code] || 0) + 1;
        if (a.status === "COMPLETED") {
          compsByTemplate[code] = (compsByTemplate[code] || 0) + 1;
        }
      }
    });

    // Calculate percentage with proper handling of division by zero
    const pct = (num, den) => {
      if (!den || den === 0) return 0;
      return Math.round((num / den) * 100);
    };

    // Score Accumulators
    let bigFiveSum = { N: 0, E: 0, O: 0, A: 0, C: 0 }, bfCount = 0;
    let maslachSum = { EE: 0, DP: 0, PA: 0 }, mCount = 0;
    let karasekSum = { D: 0, C: 0, S: 0 }, kCount = 0;
    let discSum = { D: 0, I: 0, S: 0, C: 0 }, dCount = 0;
    let jssSum = {}, jssCount = 0;
    let brsSum = 0, brsCount = 0;
    const quadrantCounts = {
      highStrain: 0,
      active: 0,
      lowStrain: 0,
      passive: 0,
    };

    completed.forEach((a) => {
      const code = a.template_code;
      const m = a.metrics;
      
      // Skip if no metrics
      if (!m) return;

      if (code === "BIG_FIVE") {
        const t = takeBigFive(m);
        if (t) {
          Object.keys(t).forEach((k) => (bigFiveSum[k] += t[k]));
          bfCount++;
        }
      }
      if (code === "MASLACH") {
        const t = takeMaslach(m);
        if (t) {
          Object.keys(t).forEach((k) => (maslachSum[k] += t[k]));
          mCount++;
        }
      }
      if (code === "KARASEK") {
        const t = takeKarasek(m);
        if (t) {
          karasekSum.D += t.D;
          karasekSum.C += t.C;
          karasekSum.S += t.S;
          kCount++;
          if (t.quadrant) quadrantCounts[t.quadrant]++;
        }
      }
      if (code === "DISC") {
        const t = takeDISC(m);
        if (t) {
          Object.keys(t).forEach((k) => (discSum[k] += t[k]));
          dCount++;
        }
      }
      if (code === "JSS") {
        const t = takeJSS(m);
        if (t) {
          Object.keys(t).forEach((k) => (jssSum[k] = (jssSum[k] || 0) + t[k]));
          jssCount++;
        }
      }
      if (code === "BRS") {
        const t = takeBRS(m);
        if (t && t.avg) {
          brsSum += t.avg;
          brsCount++;
        }
      }
    });

    const avg = (sum, n) =>
      Object.fromEntries(
        Object.entries(sum).map(([k, v]) => [k, n ? Math.round(v / n) : 0])
      );

    return {
      totalEmployees,
      totalAssignments: assignments.length,
      activeAssessments: assignments.filter((a) => ACTIVE.has(a.status)).length,
      completedAssessments: completed.length,
      completedByTemplate: {
        BIG_FIVE: pct(compsByTemplate.BIG_FIVE || 0, totalsByTemplate.BIG_FIVE || 0),
        MASLACH: pct(compsByTemplate.MASLACH || 0, totalsByTemplate.MASLACH || 0),
        KARASEK: pct(compsByTemplate.KARASEK || 0, totalsByTemplate.KARASEK || 0),
        DISC: pct(compsByTemplate.DISC || 0, totalsByTemplate.DISC || 0),
        JSS: pct(compsByTemplate.JSS || 0, totalsByTemplate.JSS || 0),
      },
      bigFiveAvg: avg(bigFiveSum, bfCount),
      maslachAvg: avg(maslachSum, mCount),
      karasekAvg: avg(karasekSum, kCount),
      discAvg: avg(discSum, dCount),
      jssAvg: avg(jssSum, jssCount),
      brsAvg: brsCount ? (brsSum / brsCount).toFixed(2) : "0.00",
      quadrantCounts,
      hasCompletedData: completed.length > 0,
      hasBigFiveData: bfCount > 0,
      hasMaslachData: mCount > 0,
      hasKarasekData: kCount > 0,
      hasDiscData: dCount > 0,
      hasJssData: jssCount > 0,
    };
  }, [users, assignments]);

  const commonOptions = {
    chart: { 
      toolbar: { show: false }, 
      fontFamily: "Inter",
      background: 'transparent'
    },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    colors: CHART_COLORS,
    grid: { borderColor: COLORS.borderColor, strokeDashArray: 4 },
    dataLabels: { enabled: false },
    theme: { mode: 'light' }
  };

  if (loading)
    return (
      <div className="dashboard-container" style={styles.container}>
        <div className="dashboard-main-wrapper" style={styles.mainWrapperCard}>
          Loading Analytics...
        </div>
      </div>
    );

  return (
    <div className="dashboard-container" style={styles.container}>
      <style>{responsiveStyles}</style>

      <div className="dashboard-main-wrapper" style={styles.mainWrapperCard}>
        <div style={styles.header}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <div
              className="dashboard-header-icon-wrapper"
              style={{
                padding: "10px",
                backgroundColor: COLORS.primaryLight,
                borderRadius: "12px",
              }}
            >
              <BarChart2 size={24} color={COLORS.primary} />
            </div>
            <h1
              className="dashboard-header-title"
              style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}
            >
              Analytical Dashboard
            </h1>
          </div>
          <p
            className="dashboard-header-subtitle"
            style={{ color: COLORS.textSecondary, fontSize: "16px" }}
          >
            Comprehensive overview of organization health and assessment
            performance.
          </p>
        </div>

        <div className="dashboard-tab-nav" style={styles.tabNav}>
          <button
            className="dashboard-tab-btn"
            style={styles.tabBtn(activeTab === "Overview")}
            onClick={() => setActiveTab("Overview")}
          >
            Overview
          </button>
          <button
            className="dashboard-tab-btn"
            style={styles.tabBtn(activeTab === "Metrics")}
            onClick={() => setActiveTab("Metrics")}
          >
            Deep Dive Metrics
          </button>
        </div>

        {activeTab === "Overview" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "32px" }}
          >
            <div
              className="dashboard-stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "24px",
              }}
            >
              <PremiumStatCard
                label="Total Employees"
                value={data.totalEmployees}
                icon={<Users />}
                color={COLORS.primary}
                bg={COLORS.primaryLight}
                detail="Staff in directory"
              />
              <PremiumStatCard
                label="Assignments"
                value={data.totalAssignments}
                icon={<FileText />}
                color={COLORS.blue}
                bg={COLORS.blueLight}
                detail="Total generated"
              />
              <PremiumStatCard
                label="Active"
                value={data.activeAssessments}
                icon={<Activity />}
                color={COLORS.orange}
                bg="#fffbeb"
                detail="Currently pending"
              />
              <PremiumStatCard
                label="Completed"
                value={data.completedAssessments}
                icon={<Zap />}
                color={COLORS.purple}
                bg={COLORS.purpleLight}
                detail="Finalized reports"
              />
            </div>

            <div
              className="dashboard-content-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gap: "32px",
              }}
            >
              <div className="dashboard-chart-card" style={styles.chartCard}>
                <h3
                  className="dashboard-chart-title"
                  style={{
                    margin: "0 0 20px 0",
                    fontSize: "18px",
                    color: COLORS.textPrimary,
                  }}
                >
                  Completion Rates
                </h3>
                <div
                  className="dashboard-completion-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                  }}
                >
                  {Object.entries(data.completedByTemplate).map(
                    ([key, val]) => (
                      <div
                        key={key}
                        className="dashboard-completion-item"
                        style={{
                          padding: "16px",
                          background: COLORS.primaryLight,
                          borderRadius: "12px",
                          border: `1px solid ${COLORS.primary}`,
                        }}
                      >
                        <div
                          className="dashboard-completion-label"
                          style={{
                            fontSize: "12px",
                            color: COLORS.primaryDark,
                            fontWeight: "700",
                          }}
                        >
                          {key}
                        </div>
                        <div
                          className="dashboard-completion-value"
                          style={{
                            fontSize: "20px",
                            fontWeight: "800",
                            color: COLORS.primaryDark,
                          }}
                        >
                          {val}%
                        </div>
                      </div>
                    )
                  )}

                  {/* BRS AVG Card */}
                  <div
                    className="dashboard-completion-item"
                    style={{
                      padding: "16px",
                      background: COLORS.primaryLight,
                      borderRadius: "12px",
                      border: `1px solid ${COLORS.primary}`,
                    }}
                  >
                    <div
                      className="dashboard-completion-label"
                      style={{
                        fontSize: "12px",
                        color: COLORS.primaryDark,
                        fontWeight: "700",
                      }}
                    >
                      BRS AVG
                    </div>
                    <div
                      className="dashboard-completion-value"
                      style={{
                        fontSize: "20px",
                        fontWeight: "800",
                        color: COLORS.primaryDark,
                      }}
                    >
                      {data.brsAvg}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-chart-card" style={styles.chartCard}>
                <h3
                  className="dashboard-chart-title"
                  style={{ margin: "0 0 20px 0", fontSize: "18px" }}
                >
                  Recent Activity
                </h3>
                {data.totalAssignments > 0 ? (
                  <>
                    <ActivityTimelineItem
                      main={data.completedAssessments > 0 ? "Assessment Completed" : "Assessment Assigned"}
                      sub={data.completedAssessments > 0 ? "Employee finalized survey" : "Waiting for completion"}
                      time={data.completedAssessments > 0 ? "Recently" : "Pending"}
                    />
                    <ActivityTimelineItem
                      main="Batch Created"
                      sub={`${data.totalAssignments} assessments assigned`}
                      time="Today"
                    />
                    <ActivityTimelineItem
                      main="System Ready"
                      sub="Dashboard initialized"
                      time="Active"
                    />
                  </>
                ) : (
                  <EmptyChartState message="No activity yet. Assign assessments to see timeline." />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="dashboard-metrics-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
            }}
          >
            <div className="dashboard-chart-card" style={styles.chartCard}>
              <h4
                className="dashboard-chart-title"
                style={{ margin: "0 0 15px 0" }}
              >
                Big Five (OCEAN) Averages
              </h4>
              {data.hasBigFiveData ? (
                <Chart
                  options={{
                    ...commonOptions,
                    xaxis: { categories: ["Neuroticism", "Extraversion", "Openness", "Agreeableness", "Conscientiousness"] },
                  }}
                  series={[
                    { name: "Score", data: Object.values(data.bigFiveAvg) },
                  ]}
                  type="bar"
                  height={300}
                />
              ) : (
                <EmptyChartState message="No Big Five assessments completed yet" />
              )}
            </div>
            
            <div className="dashboard-chart-card" style={styles.chartCard}>
              <h4
                className="dashboard-chart-title"
                style={{ margin: "0 0 15px 0" }}
              >
                Maslach Burnout Averages
              </h4>
              {data.hasMaslachData ? (
                <Chart
                  options={{
                    ...commonOptions,
                    colors: [COLORS.orange],
                    xaxis: { categories: ["Emotional Exhaustion", "Depersonalization", "Personal Accomplishment"] },
                  }}
                  series={[
                    { name: "Score", data: Object.values(data.maslachAvg) },
                  ]}
                  type="bar"
                  height={300}
                />
              ) : (
                <EmptyChartState message="No Maslach assessments completed yet" />
              )}
            </div>
            
            <div className="dashboard-chart-card" style={styles.chartCard}>
              <h4
                className="dashboard-chart-title"
                style={{ margin: "0 0 15px 0" }}
              >
                Karasek Strain Factors
              </h4>
              {data.hasKarasekData ? (
                <Chart
                  options={{
                    ...commonOptions,
                    colors: [COLORS.secondary],
                    xaxis: { categories: ["Demand", "Control", "Support"] },
                  }}
                  series={[
                    {
                      name: "Score",
                      data: [
                        data.karasekAvg.D,
                        data.karasekAvg.C,
                        data.karasekAvg.S,
                      ],
                    },
                  ]}
                  type="bar"
                  height={300}
                />
              ) : (
                <EmptyChartState message="No Karasek assessments completed yet" />
              )}
            </div>
            
            <div className="dashboard-chart-card" style={styles.chartCard}>
              <h4
                className="dashboard-chart-title"
                style={{ margin: "0 0 15px 0" }}
              >
                Karasek Quadrant Distribution
              </h4>
              {data.hasKarasekData ? (
                <Chart
                  options={{
                    ...commonOptions,
                    labels: ["High Strain", "Active", "Low Strain", "Passive"],
                    legend: { position: 'bottom' }
                  }}
                  series={Object.values(data.quadrantCounts)}
                  type="donut"
                  height={300}
                />
              ) : (
                <EmptyChartState message="No Karasek assessments completed yet" />
              )}
            </div>
            
            <div className="dashboard-chart-card" style={styles.chartCard}>
              <h4
                className="dashboard-chart-title"
                style={{ margin: "0 0 15px 0" }}
              >
                DISC Personality Averages
              </h4>
              {data.hasDiscData ? (
                <Chart
                  options={{
                    ...commonOptions,
                    colors: [COLORS.purple],
                    xaxis: { categories: ["Dominance", "Influence", "Steadiness", "Compliance"] },
                  }}
                  series={[{ name: "Score", data: Object.values(data.discAvg) }]}
                  type="bar"
                  height={300}
                />
              ) : (
                <EmptyChartState message="No DISC assessments completed yet" />
              )}
            </div>
            
            <div className="dashboard-chart-card" style={styles.chartCard}>
              <h4
                className="dashboard-chart-title"
                style={{ margin: "0 0 15px 0" }}
              >
                Job Satisfaction (JSS)
              </h4>
              {data.hasJssData && Object.keys(data.jssAvg).length > 0 ? (
                <Chart
                  options={{
                    ...commonOptions,
                    plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
                    xaxis: { categories: Object.keys(data.jssAvg) },
                  }}
                  series={[{ name: "Score", data: Object.values(data.jssAvg) }]}
                  type="bar"
                  height={300}
                />
              ) : (
                <EmptyChartState message="No JSS assessments completed yet" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;