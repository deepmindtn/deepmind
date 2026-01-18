import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Plus,
  Upload,
  Search,
  Filter,
  Users,
  Briefcase,
  Send,
  Eye,
  User as UserIcon,
  X,
  FileText,
  CheckCircle,
  AlertTriangle,
  Mail,
  Layers, DollarSign, Code, Megaphone, Shield, Activity, 
  PenTool, Truck, Coffee, Home, Settings, Database, Cloud, Server, 
  Smartphone, Monitor, Cpu, Globe, Anchor, Archive, Award, BarChart, 
  Battery, Bell, Book, Box, Calendar, Camera, Cast,
  Clipboard, Clock, Compass, CreditCard, Flag, Folder, Gift, Heart, 
  Image, Key, Lock, Map, Mic, Music, Package, PieChart, Play, 
  Power, Printer, Radio, Save, Scissors, ShoppingBag, 
  ShoppingCart, Smile, Star, Sun, Tag, Terminal, Umbrella, 
  Video, Voicemail, Wifi, Zap, Wrench, Download,
  ChevronDown, 
  Check       
} from "lucide-react";

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
  orange: "#f59e0b",
  red: "#ef4444",
  dark: "#475569",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  shadowSm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  shadowHuge: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
};

// -----------------------
// Assessment Options Data
// -----------------------
const ASSESSMENT_OPTIONS = [
  {
    group: "Personality & Behavior",
    items: [
      { code: "BIG_FIVE", label: "🧠 Big Five Personality Traits" },
      { code: "DISC", label: "💼 DISC Personality Assessment" },
    ],
  },
  {
    group: "Work Stress & Burnout",
    items: [
      { code: "KARASEK", label: "⚖️ Karasek Job Demand-Control" },
      { code: "MASLACH", label: "🔥 Maslach Burnout Inventory" },
      { code: "JSS", label: "😊 Job Satisfaction Survey (JSS)" },
    ],
  },
  {
    group: "Resilience & Self-Efficacy",
    items: [
      { code: "BRS", label: "💪 Brief Resilience Scale (BRS)" },
      { code: "CDRISC", label: "🛡️ Connor-Davidson Resilience (CD-RISC 10)" },
      { code: "WSES", label: "✨ Work Self-Efficacy Scale (WSES)" },
    ],
  },
  {
    group: "Motivation & Creativity",
    items: [
      { code: "GCOS", label: "🎯 General Causality Orientations (GCOS)" },
      { code: "RIBS", label: "💡 Runco Ideational Behavior Scale (RIBS)" },
      { code: "CAQ", label: "🎨 Creative Achievement Questionnaire (CAQ)" },
      { code: "ISE", label: "🚀 Innovation Self-Efficacy Scale (ISE)" },
    ],
  },
];

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: COLORS.textPrimary,
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    padding: "48px",
    minHeight: "calc(100vh - 40px)",
    display: "flex",
    flexDirection: "column"
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowSm,
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: COLORS.primary,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnLight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    backgroundColor: COLORS.cardBg,
    color: COLORS.textPrimary,
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderColor}`,
    fontSize: "14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
    backgroundColor: "#fff",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  badge: (status) => {
    const colors = {
      active: { bg: "#ecfdf5", text: "#059669" },
      inactive: { bg: "#fef2f2", text: "#ef4444" },
      "on leave": { bg: "#fffbeb", text: "#d97706" },
      completed: { bg: "#ecfdf5", text: "#059669" },
      pending: { bg: "#fffbeb", text: "#d97706" },
      assigned: { bg: "#eff6ff", text: "#3b82f6" },
      default: { bg: "#f3f4f6", text: "#6b7280" },
    };
    const style = colors[status?.toLowerCase()] || colors.default;
    return {
      padding: "4px 12px",
      borderRadius: "99px",
      fontSize: "12px",
      fontWeight: "600",
      backgroundColor: style.bg,
      color: style.text,
      textTransform: "capitalize",
    };
  },
};

// -----------------------
// Icon Mapping
// -----------------------
const ICON_MAP = {
  Layers, Users, Briefcase, DollarSign, Code, Megaphone, Shield, Activity, 
  PenTool, Truck, Coffee, Home, Settings, Database, Cloud, Server, 
  Smartphone, Monitor, Cpu, Globe, Anchor, Archive, Award, BarChart, 
  Battery, Bell, Book, Box, Calendar, Camera, Cast, CheckCircle,
  Clipboard, Clock, Compass, CreditCard, Flag, Folder, Gift, Heart, 
  Image, Key, Lock, Map, Mic, Music, Package, PieChart, Play, 
  Power, Printer, Radio, Save, Scissors, Send, ShoppingBag, 
  ShoppingCart, Smile, Star, Sun, Tag, Terminal, Umbrella, 
  Video, Voicemail, Wifi, Zap, Wrench
};

const DynamicIcon = ({ name, size = 20, color }) => {
  const IconComponent = ICON_MAP[name] || Layers;
  return <IconComponent size={size} color={color} />;
};

// -----------------------
// Sub-components
// -----------------------
function StatusBadge({ status }) {
  return <span style={styles.badge(status)}>{status}</span>;
}

function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          ...styles.card,
          width: "100%",
          maxWidth: "720px",
          padding: "24px",
          boxShadow: COLORS.shadowLg,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>
        {children}
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          {actions}
        </div>
      </div>
    </div>
  );
}

// -----------------------
// Main Component
// -----------------------
export default function Employees() {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  // --- States ---
  const [toast, setToast] = useState(null); // { message: "", type: "success" | "error" }
  
  const [isInviting, setIsInviting] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dep, setDep] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const [availableDepts, setAvailableDepts] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [detailAssignments, setDetailAssignments] = useState([]);

  // --- Assign Modal States ---
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [assignForm, setAssignForm] = useState({ template_codes: [] });
  
  // Custom Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const triggerRef = useRef(null);

  const [importOpen, setImportOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const [addOpen, setAddOpen] = useState(false);
  const [invite, setInvite] = useState({
    email: "",
    first_name: "",
    last_name: "",
    department_id: null,
  });
  const [inviteResult, setInviteResult] = useState(null);
  const [hrReport, setHrReport] = useState(null);
  const [hrReportOpen, setHrReportOpen] = useState(false);

  // --- Toast Timer ---
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Dropdown Logic ---
  const handleToggleDropdown = () => {
    if (!isDropdownOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 5}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        maxHeight: "300px",
        zIndex: 9999,
      });
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleAssessment = (code) => {
    setAssignForm((prev) => {
      const currentCodes = prev.template_codes || [];
      if (currentCodes.includes(code)) {
        return { ...prev, template_codes: currentCodes.filter((c) => c !== code) };
      } else {
        return { ...prev, template_codes: [...currentCodes, code] };
      }
    });
  };

  // --- Data Fetching ---
  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/users/`, {
          headers: { "Content-Type": "application/json", ...authHeader },
        });
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        if (!ignore) {
          const mapped = data.map((u) => ({
            id: String(u.id),
            name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
            role: u.role,
            department: u.department || "—",
            status: u.is_active ? "Active" : "Inactive",
            lastAssessment: u.last_assessment || null,
            email: u.email,
          }));
          setRows(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    async function fetchDepts() {
      try {
        const res = await fetch(`${API_BASE}/api/departments/`, { headers: { ...authHeader } });
        if (res.ok) {
          const data = await res.json();
          setAvailableDepts(data);
        }
      } catch (e) {
        console.error("Failed to load departments", e);
      }
    }
    fetchDepts();
  }, []);

  async function viewDetails(r) {
    try {
      const res = await fetch(`${API_BASE}/api/assessments/admin/?employee=${r.id}`, {
        headers: { ...authHeader },
      });
      if (!res.ok) throw new Error("Failed to load assignments");
      const data = await res.json();
      setDetailRow(r);
      setDetailAssignments(data);
      setDetailOpen(true);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    }
  }

  async function handleImportCSV() {
    if (!csvFile) {
      setToast({ message: "Please select a CSV file first.", type: "error" });
      return;
    }
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", csvFile);
    try {
      const res = await fetch(`${API_BASE}/api/employees/import/`, {
        method: "POST",
        headers: { ...authHeader },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import CSV");
      setImportResult(data);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setImporting(false);
    }
  }

  function closeImportAndRefresh() {
    setImportOpen(false);
    setCsvFile(null);
    setImportResult(null);
    window.location.reload();
  }

  async function generateHRReport() {
    try {
      const res = await fetch(`${API_BASE}/api/hr/report/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
      });
      const data = await res.json();
      setHrReport(data.report);
      setHrReportOpen(true);
    } catch (e) {
      setToast({ message: "Failed to generate report.", type: "error" });
    }
  }

  // --- Assign Assessment Function ---
  async function assignAssessment() {
    // Validation
    if (!assignForm.template_codes || assignForm.template_codes.length === 0) {
      setToast({ message: "Please select at least one assessment.", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/assessments/assign/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          employee_email: assignRow.email,
          template_codes: assignForm.template_codes, // Sending Array
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Failed to assign assessment");
      }

      // Success Toast
      setToast({ message: "Assessments assigned successfully!", type: "success" });
      
      // Cleanup
      setAssignOpen(false);
      setAssignRow(null);
      setAssignForm({ template_codes: [] });
    } catch (e) {
      setToast({ message: e.message || "Could not assign assessment", type: "error" });
    }
  }

  async function createInvite() {
    setIsInviting(true);
    try {
      const res = await fetch(`${API_BASE}/api/invites/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(invite),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create invite");
      }
      const data = await res.json();
      setInviteResult(data);
    } catch (e) {
      setToast({ message: e.message, type: "error" });
    } finally {
      setIsInviting(false);
    }
  }

  const filtered = rows.filter((r) => {
    const matchQ =
      !q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.role.toLowerCase().includes(q.toLowerCase()) ||
      r.email.toLowerCase().includes(q.toLowerCase());
    const matchDep = dep === "All" || r.department === dep;
    const matchStatus = status === "All" || r.status === status;
    return matchQ && matchDep && matchStatus;
  });

  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const all = rows.length;
    const active = rows.filter((r) => r.status === "Active").length;
    const leave = rows.filter((r) => r.status === "On Leave").length;
    return { all, active, leave };
  }, [rows]);

  return (
    <div style={styles.container}>
      <div style={styles.mainWrapperCard}>
        {/* Header */}
        <div style={styles.sectionHeader}>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: "800", marginBottom: "8px" }}>Employee Management</h1>
            <p style={{ color: COLORS.textSecondary, margin: 0, fontSize: "16px" }}>
              Manage your workforce, track assessments, and generate insights.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              style={styles.btnSecondary}
              onClick={() => {
                setCsvFile(null);
                setImportResult(null);
                setImportOpen(true);
              }}
            >
              <Upload size={18} /> Import CSV
            </button>
            <button
              style={styles.btnPrimary}
              onClick={() => {
                setInvite({ email: "", first_name: "", last_name: "", department_id: null });
                setInviteResult(null);
                setAddOpen(true);
              }}
            >
              <Plus size={18} /> Add Employee
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <div style={{ ...styles.card, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ padding: "10px", backgroundColor: COLORS.primaryLight, borderRadius: "12px" }}>
                <Users size={24} color={COLORS.primary} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: COLORS.textSecondary, fontWeight: "600", textTransform: "uppercase" }}>Total</div>
                <div style={{ fontSize: "26px", fontWeight: "700" }}>{stats.all}</div>
              </div>
            </div>
          </div>
          <div style={{ ...styles.card, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ padding: "10px", backgroundColor: COLORS.primaryLight, borderRadius: "12px" }}>
                <CheckCircle size={24} color={COLORS.primary} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: COLORS.textSecondary, fontWeight: "600", textTransform: "uppercase" }}>Active</div>
                <div style={{ fontSize: "26px", fontWeight: "700" }}>{stats.active}</div>
              </div>
            </div>
          </div>
          <div style={{ ...styles.card, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div style={{ padding: "10px", backgroundColor: "#fffbeb", borderRadius: "12px" }}>
                <AlertTriangle size={24} color={COLORS.orange} />
              </div>
              <div>
                <div style={{ fontSize: "12px", color: COLORS.textSecondary, fontWeight: "600", textTransform: "uppercase" }}>On Leave</div>
                <div style={{ fontSize: "26px", fontWeight: "700" }}>{stats.leave}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: COLORS.textMuted }} />
          <input
            style={{ ...styles.input, paddingLeft: "44px", backgroundColor: "#fcfcfd" }}
            placeholder="Search employees by name, email, or role..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "32px", alignItems: "center" }}>
          <select
            style={{ ...styles.input, width: "auto", padding: "10px 16px", backgroundColor: "#fcfcfd" }}
            value={dep}
            onChange={(e) => setDep(e.target.value)}
          >
            <option value="All">All Departments</option>
            {availableDepts.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          <select
            style={{ ...styles.input, width: "auto", padding: "10px 16px", backgroundColor: "#fcfcfd" }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["All", "Active", "On Leave", "Inactive"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <button style={styles.btnPrimary} onClick={generateHRReport}>
            <FileText size={18} /> Generate Report
          </button>
        </div>

        {/* Employee Table */}
        <div style={styles.card}>
          <div style={{ padding: "20px", borderBottom: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#fcfcfd" }}>
            <Users size={20} color={COLORS.primary} />
            <span style={{ fontWeight: "700" }}>Employee Directory</span>
          </div>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: COLORS.textSecondary }}>
              Loading employees...
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead style={{ backgroundColor: "#fafafa" }}>
                  <tr>
                    {["Employee", "Role", "Department", "Status", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "16px 20px", color: COLORS.textSecondary, fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current.map((r) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${COLORS.borderColor}` }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <UserIcon size={20} color={COLORS.primary} />
                          </div>
                          <div>
                            <div style={{ fontWeight: "600" }}>{r.name}</div>
                            <div style={{ fontSize: "13px", color: COLORS.textSecondary }}>{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px" }}>{r.role}</td>
                      <td style={{ padding: "16px 20px", fontSize: "14px" }}>{r.department}</td>
                      <td style={{ padding: "16px 20px" }}><StatusBadge status={r.status} /></td>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => viewDetails(r)}
                            style={{ ...styles.btnSecondary, padding: "6px 12px", fontSize: "13px" }}
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => { setAssignRow(r); setAssignOpen(true); }}
                            style={{ ...styles.btnSecondary, padding: "6px 12px", fontSize: "13px" }}
                          >
                            <Send size={14} /> Assess
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Import CSV Modal */}
      <Modal
        open={importOpen}
        title="Import Employees from CSV"
        onClose={() => (importResult ? closeImportAndRefresh() : setImportOpen(false))}
        actions={
          !importResult ? (
            <>
              <button style={styles.btnLight} onClick={() => setImportOpen(false)}>Cancel</button>
              <button style={styles.btnPrimary} onClick={handleImportCSV} disabled={importing}>
                {importing ? "Importing..." : "Import"}
              </button>
            </>
          ) : (
            <button style={styles.btnPrimary} onClick={closeImportAndRefresh}>Close & Refresh</button>
          )
        }
      >
        {!importResult ? (
          <div>
            <div style={{ padding: "16px", backgroundColor: COLORS.blueLight, borderRadius: "12px", marginBottom: "20px" }}>
              <h6 style={{ fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>CSV Format Requirements</h6>
              <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: COLORS.textSecondary }}>
                Upload a CSV file with the following headers (case-sensitive):
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: COLORS.textSecondary }}>
                <li><code>Email Address</code></li>
                <li><code>First Name</code></li>
                <li><code>Last Name</code></li>
                <li><code>Department</code></li>
              </ul>
            </div>
            <div>
              <label style={styles.label}>Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files[0])}
                style={{ ...styles.input, padding: "10px" }}
              />
              <div style={{ fontSize: "13px", color: COLORS.textSecondary, marginTop: "8px" }}>
                Data will be imported first, then invitation emails will be sent to each employee.
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <CheckCircle size={32} color={COLORS.primary} />
              <h5 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>Import Completed</h5>
            </div>
            <p style={{ fontSize: "14px", marginBottom: "16px" }}>{importResult.message}</p>
            {importResult.errors && importResult.errors.length > 0 && (
              <div style={{ padding: "16px", backgroundColor: "#fffbeb", borderRadius: "12px", border: `1px solid ${COLORS.orange}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <AlertTriangle size={20} color={COLORS.orange} />
                  <strong style={{ fontSize: "14px" }}>Skipped / Errors:</strong>
                </div>
                <div style={{ maxHeight: "150px", overflowY: "auto", fontSize: "13px" }}>
                  <ul style={{ margin: 0, paddingLeft: "20px", color: COLORS.red }}>
                    {importResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal open={detailOpen} title={`Employee: ${detailRow?.name}`} onClose={() => setDetailOpen(false)}>
        {detailRow && (
          <div>
            <div style={{ padding: "16px", backgroundColor: COLORS.bgMain, borderRadius: "12px", marginBottom: "20px" }}>
              <p style={{ margin: "0 0 8px 0" }}><strong>Email:</strong> {detailRow.email}</p>
              <p style={{ margin: "0 0 8px 0" }}><strong>Role:</strong> {detailRow.role}</p>
              <p style={{ margin: 0 }}><strong>Department:</strong> {detailRow.department}</p>
            </div>
            <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Assessment History</h4>
            <div style={{ display: "grid", gap: "12px" }}>
              {detailAssignments.map((a) => (
                <div key={a.id} style={{ ...styles.card, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h5 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>{a.template_name}</h5>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* NEW: Custom Multi-Select Assign Modal */}
      <Modal
        open={assignOpen}
        title="Send Assessment"
        onClose={() => setAssignOpen(false)}
        actions={
          <button style={styles.btnPrimary} onClick={assignAssessment}>
            <Send size={16} /> Send Assessment
          </button>
        }
      >
        {assignRow && (
          <div style={{ padding: "16px", backgroundColor: COLORS.blueLight, borderRadius: "12px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={20} color={COLORS.blue} />
              <div>
                <strong>{assignRow.name}</strong>
                <div style={{ fontSize: "13px", color: COLORS.textSecondary }}>{assignRow.email}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* CUSTOM DROPDOWN UI */}
        <div style={{ position: "relative", marginBottom: "40px" }}>
          <label style={styles.label}>Select Assessment Templates</label>
          
          {/* Trigger Box */}
          <div
            ref={triggerRef}
            onClick={handleToggleDropdown}
            style={{
              ...styles.input,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
            }}
          >
            <span>
              {assignForm.template_codes && assignForm.template_codes.length > 0
                ? `${assignForm.template_codes.length} Assessment(s) Selected`
                : "Select assessments..."}
            </span>
            <ChevronDown size={16} color={COLORS.textSecondary} />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              {/* Invisible backdrop to close when clicking outside */}
              <div 
                style={{ position: "fixed", inset: 0, zIndex: 9998 }} 
                onClick={() => setIsDropdownOpen(false)} 
              />

              {/* The List - Now uses dropdownStyle (position: fixed) */}
              <div
                style={{
                  ...dropdownStyle, // Applies top/left/width/fixed calculated earlier
                  overflowY: "auto",
                  backgroundColor: "white",
                  border: `1px solid ${COLORS.borderColor}`,
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                {ASSESSMENT_OPTIONS.map((group) => (
                  <div key={group.group}>
                    <div
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f9fafb",
                        fontWeight: "bold",
                        fontSize: "12px",
                        color: "#6b7280",
                        borderBottom: "1px solid #f3f4f6",
                        borderTop: "1px solid #f3f4f6"
                      }}
                    >
                      {group.group}
                    </div>
                    {group.items.map((item) => {
                      const isSelected = assignForm.template_codes.includes(item.code);
                      return (
                        <div
                          key={item.code}
                          onClick={() => toggleAssessment(item.code)}
                          style={{
                            padding: "10px 12px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            backgroundColor: isSelected ? "#eef2ff" : "white",
                            transition: "background-color 0.1s"
                          }}
                        >
                          <span style={{ fontSize: "14px", color: isSelected ? COLORS.blue : COLORS.textPrimary }}>
                            {item.label}
                          </span>
                          {isSelected && (
                            <div style={{ color: COLORS.blue }}>
                              <Check size={18} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Helper Text */}
          <div style={{ marginTop: "10px", fontSize: "12px", color: COLORS.textSecondary }}>
             {assignForm.template_codes?.length || 0} selected.
          </div>
        </div>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        open={addOpen}
        title="Add New Employee"
        onClose={() => { setAddOpen(false); setInviteResult(null); }}
        actions={
          <>
            <button style={styles.btnLight} onClick={() => setAddOpen(false)} disabled={isInviting}>
              Cancel
            </button>
            {!inviteResult && (
              <button
                style={styles.btnPrimary}
                onClick={createInvite}
                disabled={isInviting || !invite.department_id || !invite.email}
              >
                {isInviting ? "Sending..." : "Create Invite"}
              </button>
            )}
          </>
        }
      >
        {!inviteResult ? (
          <>
            <div style={{ padding: "16px", backgroundColor: COLORS.blueLight, borderRadius: "12px", marginBottom: "20px" }}>
              <small style={{ fontSize: "13px" }}>This will send an invitation link to the new employee.</small>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label style={styles.label}>
                  Email <span style={{ color: COLORS.red }}>*</span>
                </label>
                <input
                  type="email"
                  style={styles.input}
                  value={invite.email}
                  onChange={(e) => setInvite((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@company.com"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={invite.first_name}
                    onChange={(e) => setInvite((f) => ({ ...f, first_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={invite.last_name}
                    onChange={(e) => setInvite((f) => ({ ...f, last_name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label style={styles.label}>
                  Select Department <span style={{ color: COLORS.red }}>*</span>
                </label>
                {availableDepts.length === 0 ? (
                  <div style={{ padding: "20px", backgroundColor: COLORS.bgMain, borderRadius: "12px", textAlign: "center", color: COLORS.textSecondary }}>
                    No departments found. Go to "Departments" page to create one.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px", maxHeight: "200px", overflowY: "auto", padding: "4px" }}>
                    {availableDepts.map((dept) => {
                      const isSelected = invite.department_id === dept.id;
                      return (
                        <div
                          key={dept.id}
                          onClick={() => setInvite((f) => ({ ...f, department_id: dept.id }))}
                          style={{
                            position: "relative",
                            border: isSelected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.borderColor}`,
                            background: isSelected ? COLORS.primaryLight : "#fff",
                            borderRadius: "10px",
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s",
                          }}
                        >
                          <div style={{ color: isSelected ? COLORS.primary : COLORS.textSecondary, background: isSelected ? "#fff" : COLORS.bgMain, padding: "8px", borderRadius: "50%" }}>
                            <DynamicIcon name={dept.icon} size={20} />
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: isSelected ? COLORS.primary : COLORS.textPrimary, textAlign: "center" }}>
                            {dept.name}
                          </span>
                          {isSelected && (
                            <CheckCircle size={14} color={COLORS.primary} style={{ position: "absolute", top: "8px", right: "8px" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {inviteResult.email_sent ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "16px", backgroundColor: COLORS.primaryLight, borderRadius: "12px", marginBottom: "16px" }}>
                <Mail size={24} color={COLORS.primary} />
                <div style={{ textAlign: "left" }}>
                  <strong>Email Sent Successfully!</strong>
                  <br />
                  <small style={{ color: COLORS.textSecondary }}>An invitation has been emailed to {inviteResult.email}</small>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "16px", backgroundColor: "#fef2f2", borderRadius: "12px", marginBottom: "16px" }}>
                <AlertTriangle size={24} color={COLORS.red} />
                <div style={{ textAlign: "left" }}>
                  <strong>Email Failed!</strong>
                  <br />
                  <small style={{ color: COLORS.textSecondary }}>{inviteResult.email_error || "Could not send email. Please copy the link manually."}</small>
                </div>
              </div>
            )}

            <h5 style={{ marginBottom: "8px", fontSize: "18px", fontWeight: "700" }}>Invite Created</h5>
            <p style={{ color: COLORS.textSecondary, marginBottom: "20px" }}>You can copy the backup link below:</p>

            <div style={{ ...styles.card, padding: "16px", backgroundColor: COLORS.bgMain }}>
              <label style={{ ...styles.label, fontSize: "12px", color: COLORS.textSecondary, textTransform: "uppercase" }}>Invitation Link (Backup)</label>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <input
                  type="text"
                  style={{ ...styles.input, fontFamily: "monospace", fontSize: "12px", flex: 1 }}
                  value={inviteResult.invite_link}
                  readOnly
                />
                <button
                  style={{ ...styles.btnPrimary, padding: "10px 16px" }}
                  onClick={() => {
                    navigator.clipboard.writeText(inviteResult.invite_link);
                    setToast({ message: "Link copied!", type: "success" });
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* HR Report Modal */}
      <Modal
        open={hrReportOpen}
        title="AI-Powered HR Report"
        onClose={() => setHrReportOpen(false)}
        actions={
          <button
            style={styles.btnPrimary}
            onClick={() => {
              const blob = new Blob([hrReport], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "HR_Decision_Support_Report.txt";
              link.click();
            }}
          >
            <Download size={16} /> Download Report
          </button>
        }
      >
        <div style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.6", padding: "16px", backgroundColor: COLORS.bgMain, borderRadius: "12px", maxHeight: "400px", overflowY: "auto" }}>
          {hrReport}
        </div>
      </Modal>

      {/* FLASH MESSAGE / TOAST COMPONENT */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            zIndex: 9999, // Ensure it sits on top of modals
            backgroundColor: toast.type === "error" ? "#fef2f2" : "#ecfdf5", // Red or Green bg
            border: `1px solid ${toast.type === "error" ? "#ef4444" : "#10b981"}`,
            borderRadius: "12px",
            padding: "16px 20px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "300px",
            animation: "fadeIn 0.3s ease-out", 
          }}
        >
          {/* Icon based on type */}
          <div
            style={{
              backgroundColor: toast.type === "error" ? "#fee2e2" : "#d1fae5",
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            {toast.type === "error" ? (
              <AlertTriangle size={20} color="#dc2626" />
            ) : (
              <CheckCircle size={20} color="#059669" />
            )}
          </div>

          {/* Message Content */}
          <div style={{ flex: 1 }}>
            <h4
              style={{
                margin: "0 0 4px 0",
                fontSize: "14px",
                fontWeight: "700",
                color: toast.type === "error" ? "#991b1b" : "#065f46",
              }}
            >
              {toast.type === "error" ? "Error" : "Success"}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: toast.type === "error" ? "#b91c1c" : "#047857",
              }}
            >
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setToast(null)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              padding: "4px",
              opacity: 0.6,
            }}
          >
            <X size={16} color={toast.type === "error" ? "#991b1b" : "#065f46"} />
          </button>
        </div>
      )}
    </div>
  );
}