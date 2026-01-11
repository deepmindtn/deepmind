import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  FileText,
  TrendingUp,
  BarChart2,
  ListOrdered,
  Layers,
  Activity,
} from "lucide-react";
import Chart from "react-apexcharts";
import "./Dashboardpage.css";

// Configuration for charts
const CHART_COLORS = [
  "#10b981", // Primary Green
  "#14b8a6", // Teal
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#ef4444", // Red
];

// Common chart options
const commonChartOptions = {
  chart: {
    toolbar: {
      show: false,
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false,
      },
    },
  },
  tooltip: {
    theme: 'light',
    style: {
      fontSize: '12px',
    },
    y: {
      formatter: function(val) {
        return val;
      },
    },
  },
  colors: CHART_COLORS,
};

// Stat Card Component
const StatCard = ({ label, value, icon, colorClass, detail }) => (
  <div className={`stat-card ${colorClass}`}>
    <div className="stat-card-glow"></div>
    <div className="stat-card-content">
      <div className="stat-icon-wrapper">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
    {detail && <div className="stat-detail">{detail}</div>}
  </div>
);

// Activity Card Component
const ActivityCard = ({ activities }) => (
  <div className="activity-card">
    <div className="card-header">
      <ListOrdered size={20} className="header-icon" />
      <h2 className="card-title">Recent Activity</h2>
    </div>
    <div className="activity-list">
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-indicator">
              <div className="activity-dot"></div>
              <div className="activity-line"></div>
            </div>
            <div className="activity-content">
              <p className="activity-main">{activity.main}</p>
              <p className="activity-sub">{activity.sub}</p>
              <p className="activity-time">{activity.time}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="no-activity">No recent activity found.</p>
      )}
    </div>
  </div>
);

// Tab Button Component
const TabButton = ({ name, active, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(name)}
    className={`tab-button ${active ? "tab-active" : ""}`}
  >
    {name}
  </button>
);

// Chart Card Component
const ChartCard = ({ title, description, children }) => (
  <div className="chart-card">
    <div className="chart-header">
      <h3 className="chart-title">{title}</h3>
      <p className="chart-description">{description}</p>
    </div>
    <div className="chart-container">
      {children}
    </div>
  </div>
);

// Helper functions
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

// Main Dashboard Component
const Dashboard = () => {
  const authHeader = useAuthHeader();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");

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

  // Chart data for ApexCharts
  const bigFiveChartOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        distributed: false,
        columnWidth: '60%',
      },
    },
    xaxis: {
      categories: ['Neuroticism', 'Extraversion', 'Openness', 'Agreeableness', 'Conscientiousness'],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      max: 100,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: [CHART_COLORS[1]],
        inverseColors: false,
        opacityFrom: 0.85,
        opacityTo: 0.55,
      },
    },
  };

  const bigFiveChartSeries = [{
    name: 'Score',
    data: [bigFiveAvg.N || 0, bigFiveAvg.E || 0, bigFiveAvg.O || 0, bigFiveAvg.A || 0, bigFiveAvg.C || 0],
  }];

  const maslachChartOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
      },
    },
    xaxis: {
      categories: ['Exhaustion', 'Depersonalization', 'Accomplishment'],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      max: 100,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    colors: [CHART_COLORS[4]],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        opacityFrom: 0.85,
        opacityTo: 0.55,
      },
    },
  };

  const maslachChartSeries = [{
    name: 'Score',
    data: [maslachAvg.EE || 0, maslachAvg.DP || 0, maslachAvg.PA || 0],
  }];

  const karasekChartOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
      },
    },
    xaxis: {
      categories: ['Demands', 'Control', 'Support'],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      max: 100,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    colors: [CHART_COLORS[1]],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        opacityFrom: 0.85,
        opacityTo: 0.55,
      },
    },
  };

  const karasekChartSeries = [{
    name: 'Score',
    data: [karasekAvg.D || 0, karasekAvg.C || 0, karasekAvg.S || 0],
  }];

  const quadrantChartOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'donut',
    },
    labels: ['High Strain', 'Active', 'Low Strain', 'Passive'].filter((label, index) => {
      const keys = ['highStrain', 'active', 'lowStrain', 'passive'];
      return quadrantCounts[keys[index]] > 0;
    }),
    colors: ['#ef4444', '#10b981', '#14b8a6', '#3b82f6'].filter((color, index) => {
      const keys = ['highStrain', 'active', 'lowStrain', 'passive'];
      return quadrantCounts[keys[index]] > 0;
    }),
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              color: '#6b7280',
            },
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
  };

  const quadrantChartSeries = ['highStrain', 'active', 'lowStrain', 'passive']
    .map(key => quadrantCounts[key] || 0)
    .filter(val => val > 0);

  const discChartOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
      },
    },
    xaxis: {
      categories: ['Dominance', 'Influence', 'Steadiness', 'Conscientiousness'],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    colors: [CHART_COLORS[3]],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        opacityFrom: 0.85,
        opacityTo: 0.55,
      },
    },
  };

  const discChartSeries = [{
    name: 'Score',
    data: [discAvg.D || 0, discAvg.I || 0, discAvg.S || 0, discAvg.C || 0],
  }];

  const jssChartOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: 'bar',
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
      },
    },
    xaxis: {
      categories: Object.keys(jssAvg),
      max: 24,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    colors: [CHART_COLORS[2]],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.5,
        opacityFrom: 0.85,
        opacityTo: 0.55,
      },
    },
  };

  const jssChartSeries = [{
    name: 'Score',
    data: Object.values(jssAvg),
  }];

  // Overview Content
  const OverviewContent = () => (
    <div className="dashboard-grid">
      {/* Primary Stats */}
      <div className="stats-row">
        <StatCard
          label="Total Employees"
          value={String(totalEmployees)}
          icon={<Users size={28} />}
          colorClass="stat-primary"
          detail="Registered users in system"
        />
        <StatCard
          label="Total Assignments"
          value={String(totalAssignments)}
          icon={<FileText size={28} />}
          colorClass="stat-secondary"
          detail="All time assessments"
        />
        <StatCard
          label="Active Assessments"
          value={String(activeAssessments)}
          icon={<BarChart2 size={28} />}
          colorClass="stat-info"
          detail="Currently in progress"
        />
        <StatCard
          label="Completed"
          value={String(completedAssessments)}
          icon={<TrendingUp size={28} />}
          colorClass="stat-success"
          detail="Total finalized"
        />
      </div>

      {/* Completion Rates & Activity */}
      <div className="content-grid">
        <div className="completion-grid">
          <StatCard
            label="Big Five"
            value={`${completedByTemplate.BIG_FIVE}%`}
            icon={<Layers size={24} />}
            colorClass="stat-dark"
            detail="Completion Rate"
          />
          <StatCard
            label="Maslach"
            value={`${completedByTemplate.MASLACH}%`}
            icon={<Layers size={24} />}
            colorClass="stat-dark"
            detail="Completion Rate"
          />
          <StatCard
            label="Karasek"
            value={`${completedByTemplate.KARASEK}%`}
            icon={<Layers size={24} />}
            colorClass="stat-dark"
            detail="Completion Rate"
          />
          <StatCard
            label="DISC"
            value={`${completedByTemplate.DISC}%`}
            icon={<Layers size={24} />}
            colorClass="stat-dark"
            detail="Completion Rate"
          />
          <StatCard
            label="JSS"
            value={`${completedByTemplate.JSS}%`}
            icon={<Layers size={24} />}
            colorClass="stat-dark"
            detail="Completion Rate"
          />
          <StatCard
            label="BRS Average"
            value={brsAvg}
            icon={<Activity size={24} />}
            colorClass="stat-danger"
            detail="Resilience Score"
          />
        </div>

        <ActivityCard activities={recentActivity} />
      </div>
    </div>
  );

  // Detailed Metrics Content
  const DetailedMetricsContent = () => (
    <div className="metrics-grid">
      <ChartCard
        title="Big Five (OCEAN) Averages"
        description="Average trait scores (0-100)"
      >
        <Chart
          options={bigFiveChartOptions}
          series={bigFiveChartSeries}
          type="bar"
          height={300}
        />
      </ChartCard>

      <ChartCard
        title="Maslach Burnout Averages"
        description="Key burnout dimensions (0-100)"
      >
        <Chart
          options={maslachChartOptions}
          series={maslachChartSeries}
          type="bar"
          height={300}
        />
      </ChartCard>

      <ChartCard
        title="Karasek Job Strain Factors"
        description="Demands, Control, Support (0-100)"
      >
        <Chart
          options={karasekChartOptions}
          series={karasekChartSeries}
          type="bar"
          height={300}
        />
      </ChartCard>

      <ChartCard
        title="Karasek Quadrant Distribution"
        description="Job strain categories"
      >
        {quadrantChartSeries.length > 0 ? (
          <Chart
            options={quadrantChartOptions}
            series={quadrantChartSeries}
            type="donut"
            height={300}
          />
        ) : (
          <div className="no-data">No quadrant data available</div>
        )}
      </ChartCard>

      <ChartCard
        title="DISC Personality Averages"
        description="Dominance, Influence, Steadiness, Conscientiousness"
      >
        <Chart
          options={discChartOptions}
          series={discChartSeries}
          type="bar"
          height={300}
        />
      </ChartCard>

      <ChartCard
        title="Job Satisfaction Survey (JSS)"
        description="Average scores across JSS dimensions"
      >
        <Chart
          options={jssChartOptions}
          series={jssChartSeries}
          type="bar"
          height={300}
        />
      </ChartCard>
    </div>
  );

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Analytical Dashboard</h1>
        <p className="dashboard-subtitle">
          Comprehensive overview of employee wellbeing and assessment data
        </p>
      </header>

      {err && (
        <div className="error-alert">
          <span>⚠ Error: {err}</span>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="tab-navigation">
            <TabButton
              name="Overview"
              active={activeTab === "Overview"}
              setActiveTab={setActiveTab}
            />
            <TabButton
              name="Deep Dive Metrics"
              active={activeTab === "Deep Dive Metrics"}
              setActiveTab={setActiveTab}
            />
          </div>

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