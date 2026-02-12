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
import "./Dashboardpage.css";

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
  <div className="hover-lift dashboard-stat-card">
    <div className="dashboard-stat-header">
      <div className="dashboard-icon-box">
        {React.cloneElement(icon, { color: color, size: 24 })}
      </div>
      <TrendingUp size={16} color={COLORS.primary} />
    </div>
    <div>
      <div className="dashboard-stat-value">
        {value}
      </div>
      <div className="dashboard-stat-label">
        {label}
      </div>
    </div>
    {detail && (
      <div className="dashboard-stat-detail">
        <Info size={12} /> {detail}
      </div>
    )}
  </div>
);

const ActivityTimelineItem = ({ main, sub, time }) => (
  <div className="dashboard-activity-item">
    <div className="dashboard-activity-indicator">
      <div className="dashboard-activity-dot" />
      <div className="dashboard-activity-line" />
    </div>
    <div className="dashboard-activity-content">
      <div className="dashboard-activity-main">
        {main}
      </div>
      <div className="dashboard-activity-sub">{sub}</div>
      <div className="dashboard-activity-time">
        {time}
      </div>
    </div>
  </div>
);

const EmptyChartState = ({ message }) => (
  <div className="empty-state">
    <AlertCircle
      className="empty-state-icon"
      size={48}
      color={COLORS.textMuted}
    />
    <p className="empty-state-text">{message}</p>
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
          fetch(`${API_BASE}/api/users/`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/api/assessments/admin/`, {
            headers: { ...authHeader },
          }),
        ]);
        if (!uRes.ok || !aRes.ok) throw new Error("Failed to load data");
        const [uJson, aJson] = await Promise.all([uRes.json(), aRes.json()]);
        setUsers(Array.isArray(uJson) ? uJson : []);
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
      <div className="dashboard-container">
        <div className="dashboard-main-wrapper">
          Loading Analytics...
        </div>
      </div>
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-wrapper">
        <div className="dashboard-header">
          <div className="dashboard-header-row">
            <div className="dashboard-header-icon-wrapper">
              <BarChart2 size={24} color={COLORS.primary} />
            </div>
            <h1 className="dashboard-header-title">
              Analytical Dashboard
            </h1>
          </div>
          <p className="dashboard-header-subtitle">
            Comprehensive overview of organization health and assessment
            performance.
          </p>
        </div>

        <div className="dashboard-tab-nav">
          <button
            className={`dashboard-tab-btn ${
              activeTab === "Overview" ? "dashboard-tab-btn-active" : ""
            }`}
            onClick={() => setActiveTab("Overview")}
          >
            Overview
          </button>
          <button
            className={`dashboard-tab-btn ${
              activeTab === "Metrics" ? "dashboard-tab-btn-active" : ""
            }`}
            onClick={() => setActiveTab("Metrics")}
          >
            Deep Dive Metrics
          </button>
        </div>

        {activeTab === "Overview" ? (
          <div className="dashboard-overview">
            <div
              className="dashboard-stats-grid"
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
            >
              <div className="dashboard-chart-card">
                <h3 className="dashboard-chart-title">
                  Completion Rates
                </h3>
                <div
                  className="dashboard-completion-grid"
                >
                  {Object.entries(data.completedByTemplate).map(
                    ([key, val]) => (
                      <div key={key} className="dashboard-completion-item">
                        <div
                          className="dashboard-completion-label"
                        >
                          {key}
                        </div>
                        <div
                          className="dashboard-completion-value"
                        >
                          {val}%
                        </div>
                      </div>
                    )
                  )}

                  {/* BRS AVG Card */}
                  <div className="dashboard-completion-item">
                    <div
                      className="dashboard-completion-label"
                    >
                      BRS AVG
                    </div>
                    <div
                      className="dashboard-completion-value"
                    >
                      {data.brsAvg}
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-chart-card">
                <h3 className="dashboard-chart-title">
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
          <div className="dashboard-metrics-grid">
            <div className="dashboard-chart-card">
              <h4 className="dashboard-chart-title">
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
            
            <div className="dashboard-chart-card">
              <h4 className="dashboard-chart-title">
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
            
            <div className="dashboard-chart-card">
              <h4 className="dashboard-chart-title">
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
            
            <div className="dashboard-chart-card">
              <h4 className="dashboard-chart-title">
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
            
            <div className="dashboard-chart-card">
              <h4 className="dashboard-chart-title">
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
            
            <div className="dashboard-chart-card">
              <h4 className="dashboard-chart-title">
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