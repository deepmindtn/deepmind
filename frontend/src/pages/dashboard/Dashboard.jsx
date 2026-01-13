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
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",
  secondary: "#14b8a6",
  blue: "#3b82f6",
  blueLight: "#eff6ff",
  purple: "#8b5cf6",
  purpleLight: "#f5f3ff",
  orange: "#f59e0b",
  red: "#ef4444",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  shadowHuge:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
    padding: "5px 20px",
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
    maxWidth: "1400px",
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

// -----------------------
// Helper Functions (Restored)
// -----------------------
const API_BASE = "http://localhost:8080";
function useAuthHeader() {
  const access = localStorage.getItem("access");
  return access ? { Authorization: `Bearer ${access}` } : {};
}
function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}
function takeBigFive(m) {
  if (!m) return null;
  const t = m.trait || m.traitScores;
  if (!t) return null;
  return {
    N: safeNum(t.N),
    E: safeNum(t.E),
    O: safeNum(t.O),
    A: safeNum(t.A),
    C: safeNum(t.C),
  };
}
function takeKarasek(m) {
  if (!m) return null;
  const d = m.dim || m.dimScores;
  return {
    D: safeNum(d?.D),
    C: safeNum(d?.C),
    S: safeNum(d?.S),
    quadrant: m.quadrant || null,
  };
}
function takeMaslach(m) {
  if (!m) return null;
  if (m.burnout)
    return {
      EE: safeNum(m.burnout.exhaustion),
      DP: safeNum(m.burnout.depersonalization),
      PA: safeNum(m.burnout.accomplishment),
    };
  return { EE: safeNum(m.EE), DP: safeNum(m.DP), PA: safeNum(m.PA) };
}
function takeDISC(m) {
  if (!m) return null;
  const t = m.trait || m.discScores;
  if (!t) return null;
  return { D: safeNum(t.D), I: safeNum(t.I), S: safeNum(t.S), C: safeNum(t.C) };
}
function takeJSS(m) {
  if (!m) return null;
  const dim = m.dimScores || m;
  return Object.fromEntries(
    Object.entries(dim).map(([k, v]) => [k, safeNum(v)])
  );
}
function takeBRS(m) {
  if (!m) return null;
  return { avg: safeNum(m.average), level: m.level || "" };
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
      <div style={styles.iconBox(bg)}>
        {React.cloneElement(icon, { color: color, size: 24 })}
      </div>
      <TrendingUp size={16} color={COLORS.primary} />
    </div>
    <div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "800",
          color: COLORS.textPrimary,
        }}
      >
        {value}
      </div>
      <div
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

    // Logic for completion by template
    const totalsByTemplate = {};
    const compsByTemplate = {};
    assignments.forEach((a) => {
      const code = a.template_code || a.template?.code;
      if (code) {
        totalsByTemplate[code] = (totalsByTemplate[code] || 0) + 1;
        if (a.status === "COMPLETED")
          compsByTemplate[code] = (compsByTemplate[code] || 0) + 1;
      }
    });
    const pct = (num, den) => (den ? Math.round((num * 100) / den) : 0);

    // Score Accumulators
    let bigFiveSum = { N: 0, E: 0, O: 0, A: 0, C: 0 },
      bfCount = 0;
    let maslachSum = { EE: 0, DP: 0, PA: 0 },
      mCount = 0;
    let karasekSum = { D: 0, C: 0, S: 0 },
      kCount = 0;
    let discSum = { D: 0, I: 0, S: 0, C: 0 },
      dCount = 0;
    let jssSum = {},
      jssCount = 0;
    let brsSum = 0,
      brsCount = 0;
    const quadrantCounts = {
      highStrain: 0,
      active: 0,
      lowStrain: 0,
      passive: 0,
    };

    completed.forEach((a) => {
      const code = a.template_code || a.template?.code;
      const m = a.metrics || {};
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
        if (t?.avg) {
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
        BIG_FIVE: pct(compsByTemplate.BIG_FIVE, totalsByTemplate.BIG_FIVE),
        MASLACH: pct(compsByTemplate.MASLACH, totalsByTemplate.MASLACH),
        KARASEK: pct(compsByTemplate.KARASEK, totalsByTemplate.KARASEK),
        DISC: pct(compsByTemplate.DISC, totalsByTemplate.DISC),
        JSS: pct(compsByTemplate.JSS, totalsByTemplate.JSS),
      },
      bigFiveAvg: avg(bigFiveSum, bfCount),
      maslachAvg: avg(maslachSum, mCount),
      karasekAvg: avg(karasekSum, kCount),
      discAvg: avg(discSum, dCount),
      jssAvg: avg(jssSum, jssCount),
      brsAvg: brsCount ? (brsSum / brsCount).toFixed(2) : 0,
      quadrantCounts,
    };
  }, [users, assignments]);

  const commonOptions = {
    chart: { toolbar: { show: false }, fontFamily: "Inter" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    colors: CHART_COLORS,
    grid: { borderColor: COLORS.borderColor, strokeDashArray: 4 },
  };

  if (loading)
    return (
      <div style={styles.container}>
        <div style={styles.mainWrapperCard}>Loading Analytics...</div>
      </div>
    );

  return (
    <div style={styles.container}>
      <style>{`.hover-lift:hover { transform: translateY(-5px); border-color: ${COLORS.primary} !important; }`}</style>

      <div style={styles.mainWrapperCard}>
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
              style={{
                padding: "10px",
                backgroundColor: COLORS.primaryLight,
                borderRadius: "12px",
              }}
            >
              <BarChart2 size={24} color={COLORS.primary} />
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
              Analytical Dashboard
            </h1>
          </div>
          <p style={{ color: COLORS.textSecondary, fontSize: "16px" }}>
            Comprehensive overview of organization health and assessment
            performance.
          </p>
        </div>

        <div style={styles.tabNav}>
          <button
            style={styles.tabBtn(activeTab === "Overview")}
            onClick={() => setActiveTab("Overview")}
          >
            Overview
          </button>
          <button
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
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gap: "32px",
              }}
            >
              <div style={styles.chartCard}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px" }}>
                  Completion Rates
                </h3>
                <div
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
                        style={{
                          padding: "16px",
                          background: "#f8fafc",
                          borderRadius: "12px",
                          border: `1px solid ${COLORS.borderColor}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: COLORS.textMuted,
                            fontWeight: "700",
                          }}
                        >
                          {key}
                        </div>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "800",
                            color: COLORS.textPrimary,
                          }}
                        >
                          {val}%
                        </div>
                      </div>
                    )
                  )}
                  <div
                    style={{
                      padding: "16px",
                      background: COLORS.primaryLight,
                      borderRadius: "12px",
                      border: `1px solid ${COLORS.primary}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        color: COLORS.primaryDark,
                        fontWeight: "700",
                      }}
                    >
                      BRS AVG
                    </div>
                    <div
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

              <div style={styles.chartCard}>
                <h3 style={{ margin: "0 0 20px 0", fontSize: "18px" }}>
                  Recent Activity
                </h3>
                <ActivityTimelineItem
                  main="Assessment Completed"
                  sub="Employee finalized clinical survey"
                  time="2 mins ago"
                />
                <ActivityTimelineItem
                  main="New Batch Assigned"
                  sub="Sent to Department of Operations"
                  time="1 hour ago"
                />
                <ActivityTimelineItem
                  main="System Audit"
                  sub="All database metrics synchronized"
                  time="3 hours ago"
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
            }}
          >
            <div style={styles.chartCard}>
              <h4 style={{ margin: "0 0 15px 0" }}>
                Big Five (OCEAN) Averages
              </h4>
              <Chart
                options={{
                  ...commonOptions,
                  xaxis: { categories: ["N", "E", "O", "A", "C"] },
                }}
                series={[
                  { name: "Score", data: Object.values(data.bigFiveAvg) },
                ]}
                type="bar"
                height={300}
              />
            </div>
            <div style={styles.chartCard}>
              <h4 style={{ margin: "0 0 15px 0" }}>Maslach Burnout Averages</h4>
              <Chart
                options={{
                  ...commonOptions,
                  colors: [COLORS.orange],
                  xaxis: { categories: ["EE", "DP", "PA"] },
                }}
                series={[
                  { name: "Score", data: Object.values(data.maslachAvg) },
                ]}
                type="bar"
                height={300}
              />
            </div>
            <div style={styles.chartCard}>
              <h4 style={{ margin: "0 0 15px 0" }}>Karasek Strain Factors</h4>
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
            </div>
            <div style={styles.chartCard}>
              <h4 style={{ margin: "0 0 15px 0" }}>Karasek Quadrant</h4>
              <Chart
                options={{
                  ...commonOptions,
                  labels: ["High Strain", "Active", "Low Strain", "Passive"],
                }}
                series={Object.values(data.quadrantCounts)}
                type="donut"
                height={300}
              />
            </div>
            <div style={styles.chartCard}>
              <h4 style={{ margin: "0 0 15px 0" }}>DISC Personality</h4>
              <Chart
                options={{
                  ...commonOptions,
                  colors: [COLORS.purple],
                  xaxis: { categories: ["D", "I", "S", "C"] },
                }}
                series={[{ name: "Score", data: Object.values(data.discAvg) }]}
                type="bar"
                height={300}
              />
            </div>
            <div style={styles.chartCard}>
              <h4 style={{ margin: "0 0 15px 0" }}>Job Satisfaction (JSS)</h4>
              <Chart
                options={{
                  ...commonOptions,
                  plotOptions: { bar: { horizontal: true } },
                  xaxis: { categories: Object.keys(data.jssAvg) },
                }}
                series={[{ name: "Score", data: Object.values(data.jssAvg) }]}
                type="bar"
                height={300}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
