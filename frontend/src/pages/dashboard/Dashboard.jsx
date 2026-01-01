import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  FileText,
  TrendingUp,
  BarChart2,
  ListOrdered,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Configuration for charts and styling
const CHART_COLORS = [
  "#059669", // Emerald (Primary)
  "#14b8a6", // Teal
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#ef4444", // Red
];

// --- Custom Components for Enhanced UI ---

const StatCard = ({ label, value, icon, colorClass, detail }) => (
  <div className={`stat-card p-4 shadow-lg ${colorClass}`}>
    <div className="d-flex align-items-center justify-content-between">
      <div className="text-white opacity-75">{icon}</div>
      <div className="text-end">
        <div className="fs-2 fw-bolder text-white">{value}</div>
        <div className="text-uppercase text-white opacity-85 small fw-medium">{label}</div>
      </div>
    </div>
    {detail && (
        <div className="mt-2 pt-2 border-top border-light border-opacity-30 text-white opacity-75 small">
            {detail}
        </div>
    )}
  </div>
);

const ActivityCard = ({ activities }) => (
  <div className="card shadow-lg chart-card h-100 d-flex flex-column">
    <div className="card-body">
      <h2 className="card-title fs-5 fw-semibold text-dark mb-4 d-flex align-items-center">
        <ListOrdered size={20} className="me-2 text-primary-green" />
        Recent Activity
      </h2>
      <ul className="list-unstyled space-y-3 flex-grow-1 overflow-auto" style={{maxHeight: '400px'}}>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <li key={index} className="d-flex align-items-start p-3 activity-list-item">
              <div className="dot me-3 mt-1"></div>
              <div>
                <p className="mb-0 fw-medium text-dark lh-sm">
                  {activity.main}
                </p>
                <p className="text-muted small mt-0 mb-0">
                  {activity.sub}
                </p>
                <p className="fw-semibold text-primary-green-dark small mt-1 mb-0">
                  {activity.time}
                </p>
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-muted fst-italic pt-4">No recent activity found.</p>
        )}
      </ul>
    </div>
  </div>
);

const TabButton = ({ name, active, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`tab-button ${active ? 'tab-button-active' : 'tab-button-inactive'}`}
    >
        {name}
    </button>
);

const ChartCard = ({ title, description, children }) => (
  <div className="card chart-card p-4">
    <h3 className="fs-5 fw-bold text-dark">{title}</h3>
    <p className="text-muted small mb-4">{description}</p>
    <ResponsiveContainer width="100%" height={300}>
      {children}
    </ResponsiveContainer>
  </div>
);

// ---------- helpers (kept original) ----------
const API_BASE = "http://localhost:8080";

function useAuthHeader() {
  const access = localStorage.getItem("access");
  return access ? { Authorization: `Bearer ${access}` } : {};
}
function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  const units = [
    ["year", 3600 * 24 * 365],
    ["month", 3600 * 24 * 30],
    ["week", 3600 * 24 * 7],
    ["day", 3600 * 24],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, sec] of units) {
    const n = Math.floor(diff / sec);
    if (n >= 1) return `${n} ${name}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}
function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}
function takeBigFive(metrics) {
  if (!metrics) return null;
  const trait = metrics.trait || metrics.traitScores;
  if (!trait) return null;
  return {
    N: safeNum(trait.N),
    E: safeNum(trait.E),
    O: safeNum(trait.O),
    A: safeNum(trait.A),
    C: safeNum(trait.C),
  };
}
function takeKarasek(metrics) {
  if (!metrics) return null;
  const dim = metrics.dim || metrics.dimScores;
  return {
    D: safeNum(dim?.D),
    C: safeNum(dim?.C),
    S: safeNum(dim?.S),
    quadrant: metrics.quadrant || null,
  };
}
function takeMaslach(metrics) {
  if (!metrics) return null;
  if (metrics.burnout) {
    const b = metrics.burnout;
    return {
      EE: safeNum(b.exhaustion),
      DP: safeNum(b.depersonalization),
      PA: safeNum(b.accomplishment),
    };
  }
  return {
    EE: safeNum(metrics.EE),
    DP: safeNum(metrics.DP),
    PA: safeNum(metrics.PA),
  };
}
function takeDISC(metrics) {
  if (!metrics) return null;
  const trait = metrics.trait || metrics.discScores;
  if (!trait) return null;
  return {
    D: safeNum(trait.D),
    I: safeNum(trait.I),
    S: safeNum(trait.S),
    C: safeNum(trait.C),
  };
}
function takeJSS(metrics) {
  if (!metrics) return null;
  const dim = metrics.dimScores || metrics;
  return Object.fromEntries(
    Object.entries(dim).map(([k, v]) => [k, safeNum(v)])
  );
}
function takeBRS(metrics) {
  if (!metrics) return null;
  return {
    avg: safeNum(metrics.average),
    level: metrics.level || "",
  };
}

// ---------- main component ----------
const Dashboard = () => {
  const authHeader = useAuthHeader();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview"); // State for tabs

  useEffect(() => {
    let parked = false;
    async function go() {
      try {
        const [uRes, aRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/`, { headers: { ...authHeader } }),
          fetch(`${API_BASE}/api/assessments/admin/`, {
            headers: { ...authHeader },
          }),
        ]);
        if (!uRes.ok || !aRes.ok) throw new Error("Failed to load data");
        const [uJson, aJson] = await Promise.all([uRes.json(), aRes.json()]);
        if (!parked) {
          setUsers(Array.isArray(uJson) ? uJson : []);
          setAssignments(Array.isArray(aJson) ? aJson : aJson?.results || []);
        }
      } catch (e) {
        if (!parked) setErr(e.message || "Failed to load data");
      } finally {
        if (!parked) setLoading(false);
      }
    }
    go();
    return () => {
      parked = true;
    };
  }, []);

  const {
    totalEmployees,
    totalAssignments,
    activeAssessments,
    completedAssessments,
    completedByTemplate,
    bigFiveAvg,
    maslachAvg,
    karasekAvg,
    discAvg,
    jssAvg,
    brsAvg,
    quadrantCounts,
    recentActivity,
  } = useMemo(() => {
    const totalEmployees = users.length;
    const ACTIVE = new Set(["ASSIGNED", "IN_PROGRESS", "PENDING"]);
    const COMPLETED = "COMPLETED";
    const totalAssignments = assignments.length;
    const activeAssessments = assignments.filter((a) =>
      ACTIVE.has(a.status)
    ).length;
    const completed = assignments.filter((a) => a.status === COMPLETED);

    const totalsByTemplate = {};
    const compsByTemplate = {};
    for (const a of assignments) {
      const code = a.template_code || a.template?.code;
      if (!code) continue;
      totalsByTemplate[code] = (totalsByTemplate[code] || 0) + 1;
      if (a.status === COMPLETED)
        compsByTemplate[code] = (compsByTemplate[code] || 0) + 1;
    }
    const pct = (num, den) => (den ? Math.round((num * 100) / den) : 0);
    const completedByTemplate = {
      BIG_FIVE: pct(
        compsByTemplate.BIG_FIVE || 0,
        totalsByTemplate.BIG_FIVE || 0
      ),
      MASLACH: pct(compsByTemplate.MASLACH || 0, totalsByTemplate.MASLACH || 0),
      KARASEK: pct(compsByTemplate.KARASEK || 0, totalsByTemplate.KARASEK || 0),
      DISC: pct(compsByTemplate.DISC || 0, totalsByTemplate.DISC || 0),
      JSS: pct(compsByTemplate.JSS || 0, totalsByTemplate.JSS || 0),
      BRS: pct(compsByTemplate.BRS || 0, totalsByTemplate.BRS || 0),
    };

    let bigFiveSum = { N: 0, E: 0, O: 0, A: 0, C: 0 },
      bigFiveCount = 0;
    let maslachSum = { EE: 0, DP: 0, PA: 0 },
      maslachCount = 0;
    let karasekSum = { D: 0, C: 0, S: 0 },
      karasekCount = 0;
    let discSum = { D: 0, I: 0, S: 0, C: 0 },
      discCount = 0;
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

    for (const a of completed) {
      const code = a.template_code || a.template?.code;
      const metrics = a.metrics || {};
      if (code === "BIG_FIVE") {
        const t = takeBigFive(metrics);
        if (t) {
          for (const k in t) bigFiveSum[k] += t[k];
          bigFiveCount++;
        }
      }
      if (code === "MASLACH") {
        const m = takeMaslach(metrics);
        if (m) {
          for (const k in m) maslachSum[k] += m[k];
          maslachCount++;
        }
      }
      if (code === "KARASEK") {
        const k = takeKarasek(metrics);
        if (k) {
          karasekSum.D += k.D;
          karasekSum.C += k.C;
          karasekSum.S += k.S;
          karasekCount++;
          if (k.quadrant) quadrantCounts[k.quadrant]++;
        }
      }
      if (code === "DISC") {
        const d = takeDISC(metrics);
        if (d) {
          for (const k in d) discSum[k] += d[k];
          discCount++;
        }
      }
      if (code === "JSS") {
        const j = takeJSS(metrics);
        if (j) {
          for (const k in j) jssSum[k] = (jssSum[k] || 0) + j[k];
          jssCount++;
        }
      }
      if (code === "BRS") {
        const b = takeBRS(metrics);
        if (b && b.avg) {
          brsSum += b.avg;
          brsCount++;
        }
      }
    }
    const avg = (sum, n) =>
      Object.fromEntries(
        Object.entries(sum).map(([k, v]) => [k, n ? Math.round(v / n) : 0])
      );
    return {
      totalEmployees,
      totalAssignments,
      activeAssessments,
      completedAssessments: completed.length,
      completedByTemplate,
      bigFiveAvg: avg(bigFiveSum, bigFiveCount),
      maslachAvg: avg(maslachSum, maslachCount),
      karasekAvg: avg(karasekSum, karasekCount),
      discAvg: avg(discSum, discCount),
      jssAvg: avg(jssSum, jssCount),
      brsAvg: brsCount ? (brsSum / brsCount).toFixed(2) : 0,
      quadrantCounts,
      recentActivity: completed.slice(-6).map((a) => ({
        main: "Assessment completed",
        sub: `${a.employee?.email || "Employee"} completed ${
          a.template_name || a.template_code
        }`,
        time: timeAgo(a.completed_at),
      })),
    };
  }, [users, assignments]);

  // chart data
  const bigFiveData = [
    { name: "Neuroticism", value: bigFiveAvg.N || 0 },
    { name: "Extraversion", value: bigFiveAvg.E || 0 },
    { name: "Openness", value: bigFiveAvg.O || 0 },
    { name: "Agreeableness", value: bigFiveAvg.A || 0 },
    { name: "Conscientiousness", value: bigFiveAvg.C || 0 },
  ];
  const maslachData = [
    { name: "Exhaustion", value: maslachAvg.EE || 0 },
    { name: "Depersonalization", value: maslachAvg.DP || 0 },
    { name: "Accomplishment", value: maslachAvg.PA || 0 },
  ];
  const karasekData = [
    { name: "Demands", value: karasekAvg.D || 0 },
    { name: "Control", value: karasekAvg.C || 0 },
    { name: "Support", value: karasekAvg.S || 0 },
  ];
  const discData = [
    { name: "Dominance", value: discAvg.D || 0 },
    { name: "Influence", value: discAvg.I || 0 },
    { name: "Steadiness", value: discAvg.S || 0 },
    { name: "Conscientiousness", value: discAvg.C || 0 },
  ];
  const jssData = Object.entries(jssAvg).map(([k, v]) => ({
    name: k,
    value: v,
  }));
  const quadrantData = [
    { name: "High Strain", key: "highStrain", color: "#ef4444" },
    { name: "Active", key: "active", color: "#059669" },
    { name: "Low Strain", key: "lowStrain", color: "#14b8a6" },
    { name: "Passive", key: "passive", color: "#3b82f6" },
  ]
    .map((item) => ({
      ...item,
      value: quadrantCounts[item.key] || 0,
    }))
    .filter((x) => x.value > 0);

  // Components for Tab Content
  const OverviewContent = () => (
    <div className="row g-4">
      {/* Primary Stats Row */}
      <div className="col-12">
        <div className="row g-4">
          <div className="col-sm-6 col-lg-3">
            <StatCard
              label="Total Employees"
              value={String(totalEmployees)}
              icon={<Users size={32} />}
              colorClass="stat-card-primary"
              detail="Total number of registered users"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard
              label="Total Assignments"
              value={String(totalAssignments)}
              icon={<FileText size={32} />}
              colorClass="stat-card-secondary"
              detail="All time assessments created"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard
              label="Active Assessments"
              value={String(activeAssessments)}
              icon={<BarChart2 size={32} />}
              colorClass="stat-card-info"
              detail="Assessments currently in progress"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard
              label="Completed Assessments"
              value={String(completedAssessments)}
              icon={<TrendingUp size={32} />}
              colorClass="stat-card-primary"
              detail="Total assessments finalized"
            />
          </div>
        </div>
      </div>

      {/* Completion Rates + BRS and Activity */}
      <div className="col-12 col-lg-7">
        <div className="row g-4">
            <div className="col-4">
                <StatCard
                label="Big Five %"
                value={`${completedByTemplate.BIG_FIVE}%`}
                icon={<Layers size={32} />}
                colorClass="stat-card-dark"
                detail="Completion Rate"
                />
            </div>
            <div className="col-4">
                <StatCard
                label="Maslach %"
                value={`${completedByTemplate.MASLACH}%`}
                icon={<Layers size={32} />}
                colorClass="stat-card-dark"
                detail="Completion Rate"
                />
            </div>
            <div className="col-4">
                <StatCard
                label="Karasek %"
                value={`${completedByTemplate.KARASEK}%`}
                icon={<Layers size={32} />}
                colorClass="stat-card-dark"
                detail="Completion Rate"
                />
            </div>
            <div className="col-4">
                <StatCard
                label="DISC %"
                value={`${completedByTemplate.DISC}%`}
                icon={<Layers size={32} />}
                colorClass="stat-card-dark"
                detail="Completion Rate"
                />
            </div>
            <div className="col-4">
                <StatCard
                label="JSS %"
                value={`${completedByTemplate.JSS}%`}
                icon={<Layers size={32} />}
                colorClass="stat-card-dark"
                detail="Completion Rate"
                />
            </div>
            <div className="col-4">
                <StatCard
                label="BRS Average"
                value={brsAvg}
                icon={<TrendingUp size={32} />}
                colorClass="stat-card-danger"
                detail="Burnout Resilience Score"
                />
            </div>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div className="col-12 col-lg-5">
        <ActivityCard activities={recentActivity} />
      </div>
    </div>
  );

  const DetailedMetricsContent = () => (
    <div className="row g-4">
      {/* Big Five */}
      <div className="col-12 col-md-6">
        <ChartCard title="Big Five (OCEAN) Averages" description="Average trait scores (0-100)">
          <BarChart data={bigFiveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="name" stroke="#6c757d" />
            <YAxis domain={[0, 100]} stroke="#6c757d" />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Maslach */}
      <div className="col-12 col-md-6">
        <ChartCard title="Maslach Burnout Averages" description="Average scores for key burnout dimensions (0-100)">
          <BarChart data={maslachData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="name" stroke="#6c757d" />
            <YAxis domain={[0, 100]} stroke="#6c757d" />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS[4]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Karasek D/C/S */}
      <div className="col-12 col-md-6">
        <ChartCard title="Karasek Demands, Control, Support" description="Average scores for job strain factors (0-100)">
          <BarChart data={karasekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="name" stroke="#6c757d" />
            <YAxis domain={[0, 100]} stroke="#6c757d" />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {/* Karasek Quadrants */}
      <div className="col-12 col-md-6">
        <ChartCard title="Karasek Quadrant Distribution" description="Distribution of completed assessments by job strain category">
          {quadrantData.length ? (
            <PieChart>
              <Pie
                data={quadrantData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
                fill="#8884d8"
              >
                {quadrantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          ) : (
            <div className="text-center text-muted py-5">No quadrant data available from completed Karasek assessments.</div>
          )}
        </ChartCard>
      </div>

      {/* DISC Averages */}
      <div className="col-12 col-md-6">
        <ChartCard title="DISC Averages" description="Average scores for Dominance, Influence, Steadiness, Conscientiousness">
          <BarChart data={discData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="name" stroke="#6c757d" />
            <YAxis stroke="#6c757d" />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      {/* JSS Averages */}
      <div className="col-12 col-md-6">
        <ChartCard title="Job Satisfaction Survey (JSS) Averages" description="Average scores across various JSS dimensions">
          <BarChart data={jssData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="name" stroke="#6c757d" />
            <YAxis domain={[0, 24]} stroke="#6c757d" />
            <Tooltip />
            <Bar dataKey="value" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );

  // ---------- UI structure (new design with custom CSS) ----------
  return (
    <div className="app-bg p-4 p-sm-5 min-vh-100">
      <style>{`
        /* Custom Variables */
        :root {
            --primary-green: #059669;
            --primary-green-light: #10b981;
            --primary-green-dark: #047857;
            --teal-secondary: #14b8a6;
            --gray-dark: #4b5563;
        }

        /* Custom Colors for Recharts and text */
        .text-primary-green { color: var(--primary-green) !important; }
        .text-primary-green-dark { color: var(--primary-green-dark) !important; }
        .dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary-green-light);
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 5px;
        }

        /* Stat Card Styling */
        .stat-card {
            transition: all 0.3s ease;
            border-radius: 1rem;
            min-height: 120px;
            border: none;
        }
        .stat-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(5, 150, 105, 0.25) !important;
        }
        .stat-card-primary { background-color: var(--primary-green) !important; }
        .stat-card-secondary { background-color: var(--teal-secondary) !important; }
        .stat-card-info { background-color: #3b82f6 !important; }
        .stat-card-danger { background-color: #ef4444 !important; }
        .stat-card-dark { background-color: var(--gray-dark) !important; }

        /* Chart/Activity Card Styling */
        .chart-card {
            border-radius: 1rem;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            border: 1px solid #e9ecef;
            background-color: white;
        }

        /* Tab Button Styling */
        .tab-button {
            padding: 0.5rem 1.5rem;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 2rem;
            border: 1px solid #ced4da;
            transition: all 0.2s ease;
        }
        .tab-button-active {
            background-color: var(--primary-green);
            color: white;
            border-color: var(--primary-green-dark);
            box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
        }
        .tab-button-inactive {
            background-color: white;
            color: #495057;
        }
        .tab-button-inactive:hover {
            background-color: #f1f1f1;
        }

        /* Activity List */
        .activity-list-item {
            background-color: #f8f9fa;
            border-radius: 0.5rem;
            transition: background-color 0.2s;
        }
        .activity-list-item:hover {
            background-color: #e9ecef;
        }

        /* Recharts Tooltip Styling */
        .recharts-tooltip-wrapper {
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
          background-color: rgba(255, 255, 255, 0.95) !important;
          border: 1px solid #e5e7eb !important;
        }
      `}</style>

      <header className="mb-5">
        <h1 className="fs-1 fw-bold text-primary-green tracking-tight">
          Analytical Dashboard
        </h1>
        <p className="text-muted mt-1">
          A high-level summary of all employee and assessment data.
        </p>
      </header>

      {/* Error message */}
      {err && (
        <div className="alert alert-danger p-3 mb-4">
          <span>Error: {err}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5 text-secondary">
          <div className="spinner-border text-primary-green me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          Loading data...
        </div>
      )}

      {!loading && (
        <>
          {/* Tab Navigation */}
          <div className="d-flex gap-3 mb-5 flex-wrap">
            <TabButton name="Overview" active={activeTab === "Overview"} setActiveTab={setActiveTab} />
            <TabButton name="Deep Dive Metrics" active={activeTab === "Deep Dive Metrics"} setActiveTab={setActiveTab} />
          </div>

          {/* Tab Content */}
          <div className="dashboard-content">
            {activeTab === "Overview" && <OverviewContent />}
            {activeTab === "Deep Dive Metrics" && <DetailedMetricsContent />}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
