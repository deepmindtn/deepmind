import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LineChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { ArrowLeft, Users, CheckCircle, AlertTriangle, TrendingUp, Info, Shield, Target, Lightbulb, FileText, ChevronRight, X, Loader2, Download, Clock, Zap, Eye } from "lucide-react";

// --- Theme Colors ---
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  shadowMd: "var(--shadow-md)",
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  blue: "var(--blue)",
  blueLight: "var(--blue-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
  red: "var(--red)",
  success: "var(--primary)",
  warning: "var(--orange)",
  danger: "var(--red)",
};

// --- Helper: Format missing tests string ---
const formatMissingTests = (missing) => {
  if (!missing || missing.length === 0) return "Up to date";
  if (missing.length <= 2) return missing.join(", ");
  return `${missing.slice(0, 2).join(", ")}, +${missing.length - 2}`;
};

// --- Mock Data Generator ---
// Generates data per department to simulate sub-pages.
const generateMockReportData = (departmentName) => ({
  overview: {
    total_employees: Math.floor(Math.random() * 50) + 10,
    completion_rate: (Math.random() * 20 + 80).toFixed(1), // 80 - 100%
  },
  ai_summary: `The ${departmentName} department shows solid well-being fundamentals with moderate engagement levels. Team members demonstrate adaptability and cooperative behaviors. However, workload management and work-life balance require attention. We recommend regular 1-on-1s to discuss autonomy and resource allocation.`,
  aggregated_metrics: {
    BIG_FIVE: { Openness: 75, Conscientiousness: 80, Extraversion: 65, Agreeableness: 70, Neuroticism: 40 },
    DISC: { D: 28, I: 35, C: 22, S: 15 },
    MASLACH: { EE: 22, DP: 10, PA: 35 },
    KARASEK: { Demands: 60, Control: 40, Support: 55 },
    JSS: { Pay: 15, Promotion: 12, Supervision: 18, Fringe: 14, Contingent: 13, Operating: 16, Coworkers: 19, Nature: 20, Comm: 15 },
    BRS: { Resilience: 3.8 },
  },
  trends: [
    { name: "Q1", Exhaustion: 18, Satisfaction: 80, Demands: 55 },
    { name: "Q2", Exhaustion: 20, Satisfaction: 78, Demands: 58 },
    { name: "Q3", Exhaustion: 22, Satisfaction: 75, Demands: 60 },
  ],
  trend_highlights: {
    MASLACH: { label: "Exhaustion +4%", type: "warning" },
    JSS: { label: "Satisfaction -5%", type: "danger" },
    BRS: { label: "Resilience +2%", type: "success" },
  },
  alerts: [
    { type: "warning", message: "Moderate emotional exhaustion detected. Consider workload redistribution." },
    { type: "info", message: "Coworker support scores are strong—leverage peer mentorship programs." }
  ],
  employee_breakdown: [
    { id: "1", name: "Alice Johnson", status: "Active", missing: ["CAQ", "GCOS"], trend: "↘️ Burnout Worsening", role: "Sr. Analyst" },
    { id: "2", name: "Bob Smith", status: "Inactive", missing: ["DISC"], trend: "➡️ Stable", role: "Associate" },
    { id: "3", name: "Charlie Davis", status: "Active", missing: [], trend: "↗️ Flow Improving", role: "Lead" },
    { id: "4", name: "Diana Prince", status: "On Leave", missing: ["JSS"], trend: "➡️ Stable", role: "Manager" },
    { id: "5", name: "Evan Wright", status: "Active", missing: [], trend: "↘️ Resilience Drop", role: "Director" },
  ]
});

// --- Lightweight Loading Spinner ---
function LoadingSpinner() {
  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(3px)",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", zIndex: 9999,
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", width: "48px", height: "48px" }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid var(--border-color)",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid transparent", borderTopColor: COLORS.primary,
            animation: "spin 1s linear infinite",
          }} />
        </div>
        <p style={{ color: COLORS.textSecondary, fontSize: "14px", fontWeight: "500" }}>Generating Report...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Floating Employee Modal
function EmployeeDetailsModal({ employee, onClose }) {
  if (!employee) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(6px)",
      display: "grid", placeItems: "center", zIndex: 9998, padding: "20px",
    }} onClick={onClose}>
      <div style={{
        backgroundColor: COLORS.cardBg, borderRadius: "20px", maxWidth: "500px", width: "100%",
        boxShadow: COLORS.shadowHuge, overflow: "hidden", border: `1px solid ${COLORS.borderColor}`,
        display: "flex", flexDirection: "column", maxHeight: "90vh"
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.bgMain }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: COLORS.primaryLight, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold" }}>
              {employee.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", color: COLORS.textPrimary }}>{employee.name}</h3>
              <span style={{ fontSize: "14px", color: COLORS.textSecondary }}>{employee.role} | {employee.status}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={24} color={COLORS.textSecondary} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* AI Tailored Summary */}
          <div style={{ backgroundColor: COLORS.purpleLight, border: `1px solid ${COLORS.borderColor}`, padding: "16px", borderRadius: "12px", display: "flex", gap: "16px" }}>
            <Zap size={24} color={COLORS.purple} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: "0 0 8px 0", color: COLORS.purple, fontSize: "16px" }}>AI Behavioral Insight</h4>
              <p style={{ margin: 0, fontSize: "14px", color: COLORS.textPrimary, lineHeight: "1.6" }}>
                {employee.name} exhibits a strong Conscientiousness trait but is currently showing signs of rising Emotional Exhaustion (up 12% since last quarter). Their resilience remains high, yet the demand-control imbalance suggests they are taking on too many operational tasks. A 1-on-1 check-in focusing on task delegation is highly recommended.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
             <div style={{ flex: 1, minWidth: "150px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.borderColor}` }}>
               <span style={{ display: "block", fontSize: "12px", color: COLORS.textSecondary, marginBottom: "4px" }}>Recent Trend</span>
               <span style={{ fontWeight: "600", color: COLORS.textPrimary }}>{employee.trend}</span>
             </div>
             <div style={{ flex: 1, minWidth: "150px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.borderColor}` }}>
               <span style={{ display: "block", fontSize: "12px", color: COLORS.textSecondary, marginBottom: "4px" }}>Missing Assessments</span>
               <span style={{ fontWeight: "600", color: employee.missing.length ? COLORS.danger : COLORS.success }}>
                 {formatMissingTests(employee.missing)}
               </span>
             </div>
          </div>

          <div>
             <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Core Metric Summary</h4>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Resilience (BRS)</span>
                  <span style={{ fontWeight: "600" }}>4.1 / 5</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Ext. Exhaustion</span>
                  <span style={{ fontWeight: "600", color: COLORS.danger }}>High</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Job Satisfaction</span>
                  <span style={{ fontWeight: "600", color: COLORS.success }}>Normal</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                  <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Autonomy</span>
                  <span style={{ fontWeight: "600", color: COLORS.warning }}>Low</span>
                </div>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${COLORS.borderColor}`, display: "flex", justifyContent: "flex-end" }}>
          <button style={{ padding: "10px 20px", backgroundColor: COLORS.primary, color: "white", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }} onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Expecting filters to have: { department, status, year, quarters: [] }
  const filters = location.state?.filters || { department: "All", status: "All", year: new Date().getFullYear(), quarters: ["Q1"] };

  const [loading, setLoading] = useState(true);
  const [dataCache, setDataCache] = useState({}); // To hold data per department tab
  const [activeTab, setActiveTab] = useState("All Departments");
  const [departments, setDepartments] = useState(["All Departments"]);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Parse which tabs to show based on filter. If specific dept, just show that.
  useEffect(() => {
    if (filters.department !== "All") {
      setDepartments([filters.department]);
      setActiveTab(filters.department);
    } else {
      setDepartments(["All Departments", "Engineering", "Sales", "HR", "Marketing"]);
      setActiveTab("All Departments");
    }
  }, [filters.department]);

  // Simulate Generation Delay with Floating Overlay
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const newCache = {};
      departments.forEach(dep => {
        newCache[dep] = generateMockReportData(dep, filters.year);
      });
      setDataCache(newCache);
      setLoading(false);
    }, 1500);
  }, [departments, filters.year]);

  if (loading) return <LoadingSpinner />;

  const activeData = dataCache[activeTab];
  if (!activeData) return <div />;

  // Visual Palette
  const chartColors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'];

  // Data preps
  const bigFiveData = Object.entries(activeData.aggregated_metrics.BIG_FIVE).map(([k, v]) => ({ name: k, value: v }));
  const discData = Object.entries(activeData.aggregated_metrics.DISC || {}).map(([k, v]) => ({ name: k === "D" ? "Dominance" : k === "I" ? "Influence" : k === "C" ? "Conformity" : "Stability", value: v }));
  const jssData = Object.entries(activeData.aggregated_metrics.JSS).map(([k, v]) => ({ name: k, value: v }));
  
  const karasekData = [
    { subject: 'Demands', A: activeData.aggregated_metrics.KARASEK.Demands, fullMark: 100 },
    { subject: 'Control', A: activeData.aggregated_metrics.KARASEK.Control, fullMark: 100 },
    { subject: 'Support', A: activeData.aggregated_metrics.KARASEK.Support, fullMark: 100 },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: COLORS.bgMain, fontFamily: "'Inter', sans-serif" }}>
      {/* Main Content */}
      <div style={{ flex: 1, padding: "24px", overflowY: "auto", height: "100vh" }}>
        
        {/* Header Action Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => navigate(-1)}>
            <div style={{ padding: "8px", backgroundColor: COLORS.cardBg, borderRadius: "50%", border: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center" }}>
              <ArrowLeft size={18} color={COLORS.textPrimary} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "700", color: COLORS.textPrimary }}>{activeTab} Report</h1>
              <p style={{ margin: "4px 0 0 0", color: COLORS.textSecondary, fontSize: "14px" }}>
                 Year: <strong>{filters.year}</strong> | Quarters: <strong>{filters.quarters.join(", ")}</strong>
              </p>
            </div>
          </div>
          
          <div style={{ display: "flex", gap: "12px" }}>
            <button style={{ padding: "10px 16px", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: "500" }}>
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        {/* Dynamic Sub-Page Tabs */}
        {departments.length > 1 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", paddingBottom: "12px", borderBottom: `1px solid ${COLORS.borderColor}`, overflowX: "auto" }}>
            {departments.map((dep) => (
              <button
                key={dep} 
                onClick={() => setActiveTab(dep)}
                style={{
                  padding: "10px 20px", borderRadius: "99px", whiteSpace: "nowrap", cursor: "pointer", fontWeight: "600", fontSize: "14px",
                  backgroundColor: activeTab === dep ? COLORS.primary : "transparent",
                  color: activeTab === dep ? "white" : COLORS.textSecondary,
                  border: `1px solid ${activeTab === dep ? COLORS.primary : COLORS.borderColor}`,
                  transition: "all 0.2s"
                }}
              >
                {dep}
              </button>
            ))}
          </div>
        )}

        {/* Executive Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: COLORS.cardBg, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: COLORS.blueLight, padding: "12px", borderRadius: "12px", color: COLORS.blue }}><Users size={24} /></div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: COLORS.textSecondary }}>Included Base</h3>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>{activeData.overview.total_employees}</p>
            </div>
          </div>
          <div style={{ backgroundColor: COLORS.cardBg, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: COLORS.primaryLight, padding: "12px", borderRadius: "12px", color: COLORS.success }}><CheckCircle size={24} /></div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: COLORS.textSecondary }}>Avg. Completion</h3>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>{activeData.overview.completion_rate}%</p>
            </div>
          </div>
          {Object.entries(activeData.trend_highlights).map(([key, info]) => (
            <div key={key} style={{ backgroundColor: COLORS.cardBg, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ backgroundColor: info.type === 'warning' ? COLORS.orangeLight : info.type === 'danger' ? COLORS.red : COLORS.primaryLight, padding: "12px", borderRadius: "12px", color: info.type === 'warning' ? COLORS.warning : info.type === 'danger' ? COLORS.danger : COLORS.success, opacity: 0.8 }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: COLORS.textSecondary }}>{key} Shift</h3>
                <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: info.type === 'warning' ? COLORS.warning : info.type === 'danger' ? COLORS.danger : COLORS.success }}>{info.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Insight Section */}
        <div style={{ backgroundColor: COLORS.purpleLight, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, marginBottom: "32px", display: "flex", gap: "16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.05 }}><Shield size={160} /></div>
          <div style={{ flexShrink: 0, backgroundColor: COLORS.purple, padding: "12px", borderRadius: "12px", color: "white", height: "fit-content", zIndex: 1 }}><Lightbulb size={24} /></div>
          <div style={{ zIndex: 1 }}>
            <h2 style={{ margin: "0 0 8px 0", fontSize: "18px", color: COLORS.purple }}>Well-being Assessment for {activeTab}</h2>
            <p style={{ margin: 0, color: COLORS.textPrimary, lineHeight: "1.6", fontSize: "15px" }}>{activeData.ai_summary}</p>
          </div>
        </div>

        {/* Alerts */}
        {activeData.alerts.length > 0 && (
          <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {activeData.alerts.map((alert, idx) => (
              <div key={idx} style={{ 
                backgroundColor: alert.type === "danger" ? COLORS.red : alert.type === "warning" ? COLORS.orangeLight : COLORS.blueLight, 
                border: `1px solid ${alert.type === "danger" ? COLORS.danger : alert.type === "warning" ? COLORS.warning : COLORS.blue}`, 
                padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px",
                color: alert.type === "danger" ? COLORS.danger : alert.type === "warning" ? COLORS.warning : COLORS.blue,
                opacity: 0.9
              }}>
                {alert.type === "warning" ? <AlertTriangle size={20} /> : <Info size={20} />}
                <span style={{ fontWeight: "500", fontSize: "14px" }}>{alert.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Extensive Charting Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          
          {/* Personality Chart */}
          <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>Personality Traits (Big Five)</h3>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bigFiveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'var(--bg-main)'}} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {bigFiveData.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISC Behavior Types */}
          <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>DISC Behavior Distribution</h3>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'var(--bg-main)'}} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Job Satisfaction Survey (JSS) */}
          <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>Job Satisfaction Survey Items</h3>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jssData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 11}} interval={0} angle={-45} textAnchor="end" height={80} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'var(--bg-main)'}} contentStyle={{borderRadius: '8px'}} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Karasek Radar */}
          <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>Job Demands-Control-Support</h3>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={karasekData}>
                  <PolarGrid stroke={COLORS.borderColor} strokeDasharray="4 4" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.textSecondary, fontSize: 13 }} />
                  <PolarRadiusAxis tickCount={5} tick={{ fill: COLORS.textSecondary, fontSize: 12 }} domain={[0, 100]} />
                  <Radar name={activeTab} dataKey="A" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.35} />
                  <Tooltip contentStyle={{borderRadius: '8px'}} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maslach Trend Chart */}
          <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>Well-being Trends</h3>
            <div style={{ height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeData.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  <Line type="monotone" dataKey="Exhaustion" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                  <Line type="monotone" dataKey="Satisfaction" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Employee Breakdown Table with Click to Open */}
        <div style={{ backgroundColor: COLORS.cardBg, borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: 0, fontSize: "18px", color: COLORS.textPrimary }}>Employee Diagnostic List</h3>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: COLORS.textSecondary }}>Click "View Details" to see individual insights and assessment status.</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead style={{ backgroundColor: COLORS.cardBg }}>
                <tr>
                  <th style={{ padding: "16px 24px", color: COLORS.textSecondary, fontWeight: "600", borderBottom: `1px solid ${COLORS.borderColor}` }}>Employee</th>
                  <th style={{ padding: "16px 24px", color: COLORS.textSecondary, fontWeight: "600", borderBottom: `1px solid ${COLORS.borderColor}` }}>Status</th>
                  <th style={{ padding: "16px 24px", color: COLORS.textSecondary, fontWeight: "600", borderBottom: `1px solid ${COLORS.borderColor}`, textAlign: "center" }} title="Hover to see full list">Missing Tests</th>
                  <th style={{ padding: "16px 24px", color: COLORS.textSecondary, fontWeight: "600", borderBottom: `1px solid ${COLORS.borderColor}` }}>Trend</th>
                  <th style={{ padding: "16px 24px", color: COLORS.textSecondary, fontWeight: "600", borderBottom: `1px solid ${COLORS.borderColor}` }}></th>
                </tr>
              </thead>
              <tbody>
                {activeData.employee_breakdown.map((emp) => (
                  <tr 
                    key={emp.id} 
                    style={{ borderBottom: `1px solid ${COLORS.borderColor}`, transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.bgMain}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <td style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: COLORS.primaryLight, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>
                        {emp.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <span style={{ fontWeight: "600", color: COLORS.textPrimary, display: "block" }}>{emp.name}</span>
                        <span style={{ fontSize: "12px", color: COLORS.textSecondary }}>{emp.role}</span>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: "600",
                        backgroundColor: emp.status === "Active" ? "#ecfdf5" : emp.status === "Inactive" ? "#fef2f2" : "#eff6ff",
                        color: emp.status === "Active" ? "#059669" : emp.status === "Inactive" ? "#ef4444" : "#3b82f6"
                      }}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <span style={{ fontWeight: "500", fontSize: "13px", color: emp.missing.length > 0 ? COLORS.warning : COLORS.success, title: emp.missing.length > 0 ? emp.missing.join(", ") : "All complete" }}>
                        {formatMissingTests(emp.missing)}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", color: COLORS.textSecondary, fontWeight: "500", fontSize: "13px" }}>
                      {emp.trend}
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <button 
                        onClick={() => setSelectedEmployee(emp)}
                        style={{ 
                          display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", 
                          backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "6px", 
                          cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-dark, #4f46e5)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Floating Modal for Employee */}
      <EmployeeDetailsModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
    </div>
  );
}
