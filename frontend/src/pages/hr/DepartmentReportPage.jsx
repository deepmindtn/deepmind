import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LineChart, Line,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { ArrowLeft, Users, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Info, Shield, Target, Lightbulb, FileText, ChevronRight, X, Loader2, Download, Clock, Zap, Eye } from "lucide-react";
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

const DEFAULT_FILTERS = {
  department: "All",
  status: "All",
  year: new Date().getFullYear(),
  quarters: ["Q1", "Q2", "Q3", "Q4"],
};

const normalizeDepartment = (value) => {
  const dep = String(value || "All").trim();
  return dep.length === 0 ? "All" : dep;
};

const normalizeStatus = (value) => {
  const raw = String(value || "all").toLowerCase().replace(/[\s-]/g, "_");
  if (raw === "on_leave") return "on_leave";
  if (raw === "active") return "active";
  if (raw === "inactive") return "inactive";
  return "all";
};

const deriveDateRange = (filters) => {
  const year = Number.isFinite(Number(filters?.year)) ? Number(filters.year) : new Date().getFullYear();
  const selected = new Set(Array.isArray(filters?.quarters) ? filters.quarters : []);
  const quarterRanges = {
    Q1: [0, 2],
    Q2: [3, 5],
    Q3: [6, 8],
    Q4: [9, 11],
  };

  const activeRanges = Object.entries(quarterRanges)
    .filter(([q]) => selected.size === 0 || selected.has(q))
    .map(([, range]) => range);

  if (activeRanges.length === 0) {
    return {};
  }

  const startMonth = Math.min(...activeRanges.map((range) => range[0]));
  const endMonth = Math.max(...activeRanges.map((range) => range[1]));
  const lastDay = new Date(year, endMonth + 1, 0).getDate();

  const pad = (v) => String(v).padStart(2, "0");
  return {
    date_from: `${year}-${pad(startMonth + 1)}-01`,
    date_to: `${year}-${pad(endMonth + 1)}-${pad(lastDay)}`,
  };
};

const safeLoadFilters = () => {
  try {
    const saved = localStorage.getItem("reportFilters");
    if (!saved) return DEFAULT_FILTERS;
    const parsed = JSON.parse(saved);
    return {
      department: normalizeDepartment(parsed?.department || DEFAULT_FILTERS.department),
      status: parsed?.status || DEFAULT_FILTERS.status,
      year: parsed?.year || DEFAULT_FILTERS.year,
      quarters: Array.isArray(parsed?.quarters) ? parsed.quarters : DEFAULT_FILTERS.quarters,
    };
  } catch {
    return DEFAULT_FILTERS;
  }
};

// --- Mock Data Generator ---
// Generates data per department to simulate sub-pages.

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
function EmployeeDetailsModal({ employee, onClose, aggregatedMetrics }) {
  if (!employee) return null;

  // Use employee's personal metrics if available, otherwise fallback to group metrics
  const displayMetrics = employee.personal_metrics || aggregatedMetrics;

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(6px)",
      display: "grid", placeItems: "center", zIndex: 9998, padding: "20px",
    }} onClick={onClose}>
      <div style={{
        backgroundColor: COLORS.cardBg, borderRadius: "20px", maxWidth: "600px", width: "100%",
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
          
          {/* AI Evolution Insight Summary */}
          {employee.ai_summary && (
            <div style={{ backgroundColor: COLORS.purpleLight, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, display: "flex", gap: "16px" }}>
              <div style={{ backgroundColor: COLORS.purple, padding: "10px", borderRadius: "10px", color: "white", height: "fit-content" }}>
                <Lightbulb size={20} />
              </div>
              <div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: COLORS.purple }}>Evolution & AI Summary</h4>
                <p style={{ margin: 0, color: COLORS.textPrimary, lineHeight: "1.6", fontSize: "14px" }}>
                  {employee.ai_summary}
                </p>
              </div>
            </div>
          )}

          {/* Assessment Status Summary */}
          <div style={{ backgroundColor: COLORS.blueLight, border: `1px solid ${COLORS.borderColor}`, padding: "16px", borderRadius: "12px", display: "flex", gap: "16px" }}>
            <Zap size={24} color={COLORS.blue} style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: "0 0 8px 0", color: COLORS.blue, fontSize: "16px" }}>Assessment Overview</h4>
              <p style={{ margin: 0, fontSize: "14px", color: COLORS.textPrimary, lineHeight: "1.6" }}>
                {employee.name} has completed {employee.completed?.length || 0} assessments. 
                {employee.missing?.length > 0 ? ` Still pending: ${formatMissingTests(employee.missing)}.` : " All critical assessments completed."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
             <div style={{ flex: 1, minWidth: "150px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.borderColor}` }}>
               <span style={{ display: "block", fontSize: "12px", color: COLORS.textSecondary, marginBottom: "4px" }}>Current Trend</span>
               <span style={{ fontWeight: "600", color: COLORS.textPrimary }}>{employee.trend}</span>
             </div>
             <div style={{ flex: 1, minWidth: "150px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.borderColor}` }}>
               <span style={{ display: "block", fontSize: "12px", color: COLORS.textSecondary, marginBottom: "4px" }}>Employment Status</span>
               <span style={{ fontWeight: "600", color: employee.status === "Active" ? COLORS.success : COLORS.warning }}>
                 {employee.status}
               </span>
             </div>
          </div>

          {/* Department Metrics Summary */}
          <div>
             <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>{employee.personal_metrics ? "Individual Assessment Profile" : "Department Assessment Profile"}</h4>
             <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: COLORS.textSecondary }}>
               {employee.personal_metrics ? "Averaged metrics specific to this employee:" : "Average metrics across all employees in this group:"}
             </p>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {displayMetrics?.DISC?.D !== undefined ? (
                  (() => {
                    const d = displayMetrics.DISC.D || 0;
                    const i = displayMetrics.DISC.I || 0;
                    const s = displayMetrics.DISC.S || 0;
                    const c = displayMetrics.DISC.C || 0;
                    const total = d + i + s + c || 15;
                    return (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                          <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Dominance (D)</span>
                          <span style={{ fontWeight: "600" }}>{((d / total) * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                          <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Influence (I)</span>
                          <span style={{ fontWeight: "600" }}>{((i / total) * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                          <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Conformity (C)</span>
                          <span style={{ fontWeight: "600" }}>{((c / total) * 100).toFixed(1)}%</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                          <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Stability (S)</span>
                          <span style={{ fontWeight: "600" }}>{((s / total) * 100).toFixed(1)}%</span>
                        </div>
                      </>
                    );
                  })()
                ) : null}
                {displayMetrics?.MASLACH?.DP !== undefined ? (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                      <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Emotional Exhaustion</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "600", color: (displayMetrics.MASLACH.EE || 0) >= 60 ? COLORS.danger : (displayMetrics.MASLACH.EE || 0) > 40 ? COLORS.warning : COLORS.success }}>
                          {(displayMetrics.MASLACH.EE || 0).toFixed(1)} / 100
                        </span>
                        <span style={{ fontSize: "12px", color: (displayMetrics.MASLACH.EE || 0) >= 60 ? COLORS.danger : (displayMetrics.MASLACH.EE || 0) > 40 ? COLORS.warning : COLORS.success, fontWeight: "500" }}>
                          {(displayMetrics.MASLACH.EE || 0) >= 60 ? 'High' : (displayMetrics.MASLACH.EE || 0) > 40 ? 'Moderate' : 'Low'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                      <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Depersonalization</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "600", color: (displayMetrics.MASLACH.DP || 0) >= 60 ? COLORS.danger : (displayMetrics.MASLACH.DP || 0) > 40 ? COLORS.warning : COLORS.success }}>
                          {(displayMetrics.MASLACH.DP || 0).toFixed(1)} / 100
                        </span>
                        <span style={{ fontSize: "12px", color: (displayMetrics.MASLACH.DP || 0) >= 60 ? COLORS.danger : (displayMetrics.MASLACH.DP || 0) > 40 ? COLORS.warning : COLORS.success, fontWeight: "500" }}>
                          ({(displayMetrics.MASLACH.DP || 0) >= 60 ? 'High' : (displayMetrics.MASLACH.DP || 0) > 40 ? 'Moderate' : 'Low'})
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px", gridColumn: "1/-1" }}>
                      <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Personal Accomplishment</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "600", color: (displayMetrics.MASLACH.PA || 0) <= 40 ? COLORS.danger : (displayMetrics.MASLACH.PA || 0) < 60 ? COLORS.warning : COLORS.success }}>
                          {(displayMetrics.MASLACH.PA || 0).toFixed(1)} / 100
                        </span>
                        <span style={{ fontSize: "12px", color: (displayMetrics.MASLACH.PA || 0) <= 40 ? COLORS.danger : (displayMetrics.MASLACH.PA || 0) < 60 ? COLORS.warning : COLORS.success, fontWeight: "500" }}>
                          ({(displayMetrics.MASLACH.PA || 0) <= 40 ? 'Low' : (displayMetrics.MASLACH.PA || 0) < 60 ? 'Moderate' : 'Good'})
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
                {displayMetrics?.JSS?.global !== undefined ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px", gridColumn: "1/-1" }}>
                    <span style={{ color: COLORS.textSecondary, fontSize: "14px" }}>Job Satisfaction (Global)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: "600", color: (displayMetrics.JSS.global || 0) >= 126 ? COLORS.success : (displayMetrics.JSS.global || 0) > 80 ? COLORS.orange : COLORS.danger }}>
                        {(displayMetrics.JSS.global || 0).toFixed(0)} / 216
                      </span>
                      <span style={{ fontSize: "12px", color: (displayMetrics.JSS.global || 0) >= 126 ? COLORS.success : (displayMetrics.JSS.global || 0) > 80 ? COLORS.orange : COLORS.danger, fontWeight: "500" }}>
                        {(displayMetrics.JSS.global || 0) >= 171 ? 'Very High' : (displayMetrics.JSS.global || 0) >= 126 ? 'Moderate' : (displayMetrics.JSS.global || 0) > 80 ? 'Low' : 'Very Low'}
                      </span>
                    </div>
                  </div>
                ) : null}
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
  const filters = useMemo(
    () => ({
      ...safeLoadFilters(),
      ...(location.state?.filters || {}),
    }),
    [location.state?.filters]
  );
  const reportData = location.state?.reportData;

  // Save filters when they change
  useEffect(() => {
    localStorage.setItem("reportFilters", JSON.stringify(filters));
  }, [filters]);

  const [loading, setLoading] = useState(true);
  const [dataCache, setDataCache] = useState({}); // To hold data per department tab
  const [activeTab, setActiveTab] = useState("All Departments");
  const [departments, setDepartments] = useState(["All Departments"]);
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Restore active tab from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("activeReportTab");
    if (saved) setActiveTab(saved);
  }, []);

  // Parse which tabs to show based on filter. If specific dept, just show that.
  // If querying "All", extract departments from employee data
  useEffect(() => {
    if (!reportData) {
      if (normalizeDepartment(filters.department) !== "All") {
        setDepartments([normalizeDepartment(filters.department)]);
        setActiveTab(normalizeDepartment(filters.department));
      }
      // Will be set after data loads - extracted from employee breakdown
    }
  }, [filters.department, reportData]);

  // Simulate Generation Delay with Floating Overlay
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (reportData) {
      const data = reportData;
      const deptName = data.department.toLowerCase() === "all" ? "All Departments" : data.department;
      const newCache = { [deptName]: data };
      
      // If querying all departments, extract actual departments from employee breakdown
      if (data.department.toLowerCase() === "all" && data.employee_breakdown) {
        const uniqueDepts = [...new Set(data.employee_breakdown.map(emp => emp.department || "Unassigned"))].sort();
        
        // Create filtered views for each department while keeping overall metrics
        uniqueDepts.forEach(dept => {
          newCache[dept] = {
            ...data,
            department: dept,
            employee_breakdown: data.employee_breakdown.filter(emp => (emp.department || "Unassigned") === dept),
            // Use original aggregated metrics (they're for the whole org)
          };
        });
        
        // Also create "All Departments" view with full data
        newCache["All Departments"] = data;
        const allDepts = ["All Departments", ...uniqueDepts];
        
        setDepartments(allDepts);
        setActiveTab("All Departments");
      } else {
        // Single department report
        setDepartments([deptName]);
        setActiveTab(deptName);
      }
      
      setDataCache(newCache);
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      try {
        const access = localStorage.getItem("access");
        const basePayload = {
          department: normalizeDepartment(filters.department),
          status_filter: normalizeStatus(filters.status),
          ...deriveDateRange(filters),
        };
        const response = await fetch(`${API_BASE}/api/hr/department-reports/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: access ? `Bearer ${access}` : undefined,
          },
          body: JSON.stringify(basePayload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        const newCache = {};
        const deptName = data.department.toLowerCase() === "all" ? "All Departments" : data.department;
        
        // If querying all departments, extract unique departments from employee breakdown
        if (data.department.toLowerCase() === "all" && data.employee_breakdown) {
          const uniqueDepts = [...new Set(data.employee_breakdown.map(emp => emp.department || "Unassigned"))].sort();

          // Fetch each department report so charts are truly department-specific.
          const deptRequests = uniqueDepts
            .filter((dept) => dept !== "Unassigned")
            .map(async (dept) => {
              const deptResponse = await fetch(`${API_BASE}/api/hr/department-reports/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: access ? `Bearer ${access}` : undefined,
                },
                body: JSON.stringify({
                  ...basePayload,
                  department: dept,
                }),
              });
              if (!deptResponse.ok) {
                throw new Error(`Failed to fetch ${dept}: ${deptResponse.status}`);
              }
              const deptData = await deptResponse.json();
              return [dept, deptData];
            });

          const deptResults = await Promise.allSettled(deptRequests);
          deptResults.forEach((result) => {
            if (result.status === "fulfilled") {
              const [dept, deptData] = result.value;
              newCache[dept] = deptData;
            }
          });

          // Fallback for departments that failed dedicated fetch.
          uniqueDepts.forEach((dept) => {
            if (newCache[dept]) return;
            newCache[dept] = {
              ...data,
              department: dept,
              employee_breakdown: data.employee_breakdown.filter((emp) => (emp.department || "Unassigned") === dept),
            };
          });
          
          // Also create "All Departments" view
          newCache["All Departments"] = data;
          const allDepts = ["All Departments", ...uniqueDepts];
          
          setDepartments(allDepts);
          setActiveTab("All Departments");
        } else {
          // Single department report
          newCache[deptName] = data;
          setDataCache(prev => ({ ...prev, ...newCache }));
          if (filters.department !== "All") {
            setActiveTab(deptName);
            setDepartments([deptName]);
          }
          setLoading(false);
          return;
        }
        
        setDataCache(prev => ({ ...prev, ...newCache }));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch department report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [API_BASE, filters, reportData]);

  if (loading) return <LoadingSpinner />;

  const activeData = dataCache[activeTab] || dataCache[departments[0]];
  if (!activeData) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>No data available for {activeTab}</div>;

  // Visual Palette
  const chartColors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#14b8a6', '#f43f5e', '#84cc16'];
  
  // DISC specific colors with hues
  const discColors = {
    'Dominance': '#ef4444',    // Red
    'Influence': '#f59e0b',    // Amber
    'Conformity': '#8b5cf6',   // Purple
    'Stability': '#14b8a6'     // Teal
  };

  // Data preps fallback handling with safe defaults
  const bigFiveMetrics = activeData.aggregated_metrics?.BIG_FIVE || { N: 0, E: 0, O: 0, A: 0, C: 0 };
  const bigFiveData = Object.entries(bigFiveMetrics)
    .filter(([k]) => ["N", "E", "O", "A", "C"].includes(k))
    .map(([k, v]) => ({ 
      name: k === 'N' ? 'Neuroticism' : k === 'E' ? 'Extraversion' : k === 'O' ? 'Openness' : k === 'A' ? 'Agreeableness' : 'Conscientiousness', 
      value: typeof v === 'number' ? v : 0 
    }))
    .filter(d => d.value > 0);

  const discMetrics = activeData.aggregated_metrics?.DISC || { D: 0, I: 0, S: 0, C: 0 };
  const _totalDisc = (discMetrics.D || 0) + (discMetrics.I || 0) + (discMetrics.S || 0) + (discMetrics.C || 0) || 15;
  const discData = Object.entries(discMetrics)
    .filter(([k]) => ["D", "I", "C", "S"].includes(k))
    .map(([k, v]) => ({ 
      name: k === "D" ? "Dominance" : k === "I" ? "Influence" : k === "C" ? "Conformity" : "Stability", 
      value: typeof v === 'number' ? Number(((v / _totalDisc) * 100).toFixed(1)) : 0 
    }));

  const jssMetrics = activeData.aggregated_metrics?.JSS || {};
  const jssGlobal = typeof jssMetrics.global === "number"
    ? jssMetrics.global
    : typeof jssMetrics.total === "number"
    ? jssMetrics.total
    : 0;
  
  // Handle both flattened and nested JSS structures
  let jssData = [];
  if (Object.keys(jssMetrics).length > 0) {
    // If subscores are nested, extract them
    const subscoresObj = jssMetrics.subscores || jssMetrics;
    
    jssData = Object.entries(subscoresObj)
      .filter(([k, v]) => {
        // Exclude meta keys
        return !['global', 'total', 'average', 'interpretation'].includes(k) && typeof v === 'number' && v >= 0;
      })
      .map(([k, v]) => ({ 
        name: k.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value: typeof v === 'number' ? v : 0 
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const karasekMetrics = activeData.aggregated_metrics?.KARASEK || { D: 0, C: 0, S: 0 };
  const karasekData = [
    { subject: 'Demands', A: typeof karasekMetrics.D === 'number' ? karasekMetrics.D : 0, fullMark: 100 },
    { subject: 'Control', A: typeof karasekMetrics.C === 'number' ? karasekMetrics.C : 0, fullMark: 100 },
    { subject: 'Support', A: typeof karasekMetrics.S === 'number' ? karasekMetrics.S : 0, fullMark: 100 },
  ];

  // Safe trend_highlights from backend API (no hardcoding)
  const trendHighlights = activeData.trend_highlights || activeData.trends || {};
  const metricTimeseries = activeData.metric_timeseries || activeData.overview_data?.metric_timeseries || [];

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
                  Year: <strong>{filters.year}</strong> | Quarters: <strong>{(filters.quarters && filters.quarters.length > 0) ? filters.quarters.join(", ") : "All"}</strong>
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
                onClick={() => {
                  setActiveTab(dep);
                  localStorage.setItem("activeReportTab", dep);
                }}
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
        {/* Check if empty department and show warning while keeping layout */}
        {activeData.employee_breakdown && activeData.employee_breakdown.length === 0 ? (
          <div style={{ backgroundColor: COLORS.orangeLight, padding: "24px", borderRadius: "16px", border: `2px solid ${COLORS.warning}`, marginBottom: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <AlertTriangle size={32} color={COLORS.warning} style={{ flexShrink: 0 }} />
            <div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600", color: COLORS.warning }}>No Employees in This Department</h3>
              <p style={{ margin: 0, fontSize: "14px", color: COLORS.textPrimary, lineHeight: "1.5" }}>
                No employees with assessments were found in the "{activeTab}" department for the selected time period. Try selecting a different department or date range.
              </p>
            </div>
          </div>
        ) : null}

        {/* Executive Summary - Only show if we have data */}
        {activeData.employee_breakdown && activeData.employee_breakdown.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: COLORS.cardBg, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: COLORS.blueLight, padding: "12px", borderRadius: "12px", color: COLORS.blue }}><Users size={24} /></div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: COLORS.textSecondary }}>Included Base</h3>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>{activeData.overview_data?.total_employees || 0}</p>
            </div>
          </div>
          <div style={{ backgroundColor: COLORS.cardBg, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ backgroundColor: COLORS.primaryLight, padding: "12px", borderRadius: "12px", color: COLORS.success }}><CheckCircle size={24} /></div>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: COLORS.textSecondary }}>Avg. Completion</h3>
              <p style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>{activeData.overview_data?.completion_rate || 0}%</p>
            </div>
          </div>
          {Object.entries(trendHighlights).map(([key, info]) => {
            // Extract percentage from label if it exists, e.g., "Exhaustion +4%" or "📈 +4%"
            const percentageMatch = info.label?.match(/([+\-−])(\d+(\.\d+)?)%/);
            const percentage = percentageMatch ? percentageMatch[1] + percentageMatch[2] + '%' : info.label;
            const isPositive = info.label?.includes('+') || info.label?.includes('📈');
            const isNegative = info.label?.includes('-') || info.label?.includes('📉');
            
            return (
              <div key={key} style={{ backgroundColor: COLORS.cardBg, padding: "20px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ backgroundColor: isNegative ? COLORS.red : isPositive ? COLORS.orangeLight : COLORS.primaryLight, padding: "12px", borderRadius: "12px", color: isNegative ? "white" : isPositive ? COLORS.warning : COLORS.success, opacity: 0.9 }}>
                  {isNegative ? <TrendingDown size={24} /> : <TrendingUp size={24} />}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: COLORS.textSecondary }}>{key} Shift</h3>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: isNegative ? COLORS.danger : isPositive ? COLORS.warning : COLORS.success }}>{percentage}</p>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* AI Insight Section */}
        <div style={{ backgroundColor: COLORS.purpleLight, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}`, marginBottom: "32px", display: "flex", gap: "16px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-20px", right: "-20px", opacity: 0.05 }}><Shield size={160} /></div>
          <div style={{ flexShrink: 0, backgroundColor: COLORS.purple, padding: "12px", borderRadius: "12px", color: "white", height: "fit-content", zIndex: 1 }}><Lightbulb size={24} /></div>
          <div style={{ zIndex: 1, width: "100%" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", color: COLORS.purple }}>Well-being & Performance Analysis</h2>
            
            {/* Executive Summary */}
            <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: "rgba(255,255,255,0.5)", borderRadius: "8px", borderLeft: `4px solid ${COLORS.purple}` }}>
              <p style={{ margin: 0, color: COLORS.textPrimary, lineHeight: "1.6", fontSize: "14px" }}>
                {activeData.ai_summary?.executive_summary || activeData.ai_summary}
              </p>
            </div>
            
            {/* Strengths */}
            {activeData.ai_summary?.strengths && activeData.ai_summary.strengths.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "700", color: COLORS.success, textTransform: "uppercase", letterSpacing: "0.5px" }}>Strengths</h4>
                <ul style={{ margin: 0, paddingLeft: "20px", listStyle: "none" }}>
                  {activeData.ai_summary.strengths.map((item, idx) => (
                    <li key={idx} style={{ margin: "6px 0", fontSize: "14px", color: COLORS.textPrimary, lineHeight: "1.5", paddingLeft: "16px", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: COLORS.success, fontWeight: "bold" }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Risks */}
            {activeData.ai_summary?.risks && activeData.ai_summary.risks.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "700", color: COLORS.warning, textTransform: "uppercase", letterSpacing: "0.5px" }}>Risks & Concerns</h4>
                <ul style={{ margin: 0, paddingLeft: "20px", listStyle: "none" }}>
                  {activeData.ai_summary.risks.map((item, idx) => (
                    <li key={idx} style={{ margin: "6px 0", fontSize: "14px", color: COLORS.textPrimary, lineHeight: "1.5", paddingLeft: "16px", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: COLORS.warning, fontWeight: "bold" }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Recommendations */}
            {activeData.ai_summary?.recommendations && activeData.ai_summary.recommendations.length > 0 && (
              <div>
                <h4 style={{ margin: "0 0 10px 0", fontSize: "13px", fontWeight: "700", color: COLORS.blue, textTransform: "uppercase", letterSpacing: "0.5px" }}>Recommended Actions</h4>
                <ul style={{ margin: 0, paddingLeft: "20px", listStyle: "none" }}>
                  {activeData.ai_summary.recommendations.map((item, idx) => (
                    <li key={idx} style={{ margin: "6px 0", fontSize: "14px", color: COLORS.textPrimary, lineHeight: "1.5", paddingLeft: "16px", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, color: COLORS.blue, fontWeight: "bold" }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {activeData.alerts && activeData.alerts.length > 0 && (
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
                  <Tooltip cursor={{fill: 'var(--bg-main)'}} contentStyle={{borderRadius: '8px'}} formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {discData.map((entry, index) => <Cell key={index} fill={discColors[entry.name] || '#ec4899'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Job Satisfaction Survey (JSS) */}
          <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>Job Satisfaction Overview</h3>
            {jssData && jssData.length > 0 ? (
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
                {jssGlobal > 0 && <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: COLORS.textSecondary, textAlign: "center" }}>Global Score: {jssGlobal} / 216</p>}
              </div>
            ) : jssGlobal > 0 ? (
              <div style={{ height: "260px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
                <div style={{ fontSize: "48px", fontWeight: "700", color: COLORS.primary }}>{jssGlobal}</div>
                <p style={{ margin: 0, fontSize: "14px", color: COLORS.textSecondary }}>/ 216</p>
              </div>
            ) : (
              <div style={{ height: "260px", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textSecondary }}>
                <p style={{ margin: 0 }}>No satisfaction data available</p>
              </div>
            )}
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

          {/* Well-being Trends Chart */}
          <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>Well-being Trends Over Time</h3>
            
              {metricTimeseries.length > 1 ? (
              <div style={{ height: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metricTimeseries}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="period" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip contentStyle={{borderRadius: '8px'}} />
                    <Legend />
                    <Line type="linear" dataKey="exhaustion" name="Emotional Exhaustion" stroke={COLORS.danger} strokeWidth={2} dot={{fill: COLORS.danger}} />
                    <Line type="linear" dataKey="satisfaction" name="Job Satisfaction" stroke={COLORS.success} strokeWidth={2} dot={{fill: COLORS.success}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: "260px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                <p style={{ color: COLORS.textSecondary, textAlign: "center" }}>Not enough historical points to build a trend line yet. Complete repeated assessments over time for this view.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%" }}>
                  <div style={{ textAlign: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>Current Exhaustion</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: COLORS.danger }}>{(activeData.aggregated_metrics?.MASLACH?.EE || 0).toFixed(1)}</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px", backgroundColor: COLORS.bgMain, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>Current Satisfaction</div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: COLORS.success }}>{jssGlobal.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metric Trends Summary */}
        <div style={{ backgroundColor: COLORS.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${COLORS.borderColor}` }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: COLORS.textPrimary }}>Key Metric Changes</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.entries(trendHighlights).length > 0 ? (
              Object.entries(trendHighlights).map(([key, info]) => (
                <div key={key} style={{
                  padding: "12px", borderRadius: "8px", backgroundColor: COLORS.bgMain, 
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderLeft: `4px solid ${info.type === 'warning' ? COLORS.warning : info.type === 'danger' ? COLORS.danger : COLORS.success}`
                }}>
                  <span style={{ fontWeight: "600", color: COLORS.textPrimary }}>{key} Change</span>
                  <span style={{ color: info.type === 'warning' ? COLORS.warning : info.type === 'danger' ? COLORS.danger : COLORS.success, fontWeight: "600" }}>
                    {info.label}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: COLORS.textSecondary, textAlign: "center", padding: "20px" }}>
                Run assessments multiple times to track metric changes over time.
              </p>
            )}
          </div>
        </div>

        {/* Employee Breakdown Table with Click to Open */}
        {activeData.employee_breakdown && activeData.employee_breakdown.length > 0 && (
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
                {(activeData.employee_breakdown || []).map((emp) => (
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
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {emp.trend?.includes("Improving") || emp.trend?.includes("📈") ? (
                          <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: COLORS.success }}>↑</div>
                        ) : emp.trend?.includes("Declining") || emp.trend?.includes("📉") ? (
                          <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: COLORS.danger }}>↓</div>
                        ) : (
                          <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: COLORS.bgMain, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: COLORS.textSecondary }}>→</div>
                        )}
                        <span>{emp.trend}</span>
                      </div>
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
        )}

      </div>

      {/* Floating Modal for Employee */}
      <EmployeeDetailsModal 
        employee={selectedEmployee} 
        onClose={() => setSelectedEmployee(null)} 
        aggregatedMetrics={activeData?.aggregated_metrics}
      />
    </div>
  );
}
